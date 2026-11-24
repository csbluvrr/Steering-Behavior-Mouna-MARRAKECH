class Target extends Vehicle {
  constructor(x, y, normalSprite = null, evadingSprite = null) {
    super(x, y);

    this.vel = p5.Vector.random2D().mult(random(3, 5));
    this.maxSpeed = 5;
    this.maxForce = 0.45;
    this.r = 35;

    // Sprites pour la machine à états de Scorbunny
    this.normalSprite = normalSprite;
    this.evadingSprite = evadingSprite || normalSprite;
    this.isEvading = false;

    // Champ de vision (rayon de détection de fuite)
    this.champDeVision = 180;

    // Paramètres d'exclusion et d'évitement des 4 coins de l'écran de la console
    this.cornerAvoidDistance = 175; // Rayon de détection et répulsion anticipée
    this.cornerSafetyRadius = 95;   // Rayon absolu d'interdiction (impossible à toucher)
    this.wallMargin = 48;           // Marge de sécurité par rapport aux parois droites
  }

  // Évasion prédictive (Craig Reynolds)
  evade(threat, predictionFrames = 10) {
    let threatAhead = p5.Vector.mult(threat.vel, predictionFrames);
    threatAhead.add(threat.pos);

    if (Vehicle.debug) {
      push();
      stroke("rgba(255, 140, 0, 0.7)");
      strokeWeight(2);
      drawingContext.setLineDash([4, 6]);
      line(threat.pos.x, threat.pos.y, threatAhead.x, threatAhead.y);
      drawingContext.setLineDash([]);

      fill("#ff8c00");
      stroke(0);
      strokeWeight(1.5);
      circle(threatAhead.x, threatAhead.y, 14);
      pop();
    }

    return this.flee(threatAhead);
  }

  // Comportement de répulsion active anticipée pour ne jamais approcher les 4 coins
  avoidCorners(detectionRadius = 220) {
    let steerTotal = createVector(0, 0);
    let corners = [
      createVector(0, 0),
      createVector(width, 0),
      createVector(0, height),
      createVector(width, height)
    ];

    for (let c of corners) {
      let d = p5.Vector.dist(this.pos, c);
      if (d < detectionRadius && d > 0.001) {
        let diff = p5.Vector.sub(this.pos, c);
        // Force de répulsion inversement proportionnelle à la distance
        let factor = map(d, this.cornerSafetyRadius, detectionRadius, 2.2, 0.6, true);
        let desired = diff.normalize().mult(this.maxSpeed * factor);
        let steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce * 2.2);
        steerTotal.add(steer);
      }
    }

    return steerTotal;
  }

  // Évitement fluide des parois droites pour rester dans l'arène de jeu
  avoidWalls(margin = 75) {
    let steer = createVector(0, 0);
    let desired = null;

    if (this.pos.x < margin) {
      desired = createVector(this.maxSpeed, this.vel.y);
    } else if (this.pos.x > width - margin) {
      desired = createVector(-this.maxSpeed, this.vel.y);
    }

    if (this.pos.y < margin) {
      let desY = createVector(this.vel.x, this.maxSpeed);
      desired = desired ? p5.Vector.add(desired, desY) : desY;
    } else if (this.pos.y > height - margin) {
      let desY = createVector(this.vel.x, -this.maxSpeed);
      desired = desired ? p5.Vector.add(desired, desY) : desY;
    }

    if (desired) {
      desired.setMag(this.maxSpeed);
      steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxForce * 1.5);
    }

    return steer;
  }

  // Évitement actif des obstacles rocheux (pour que Scorbunny les contourne)
  avoidObstacles(obstacles) {
    let steerTotal = createVector(0, 0);
    for (let obs of obstacles) {
      let detectDist = obs.r + this.r + 55;
      let d = p5.Vector.dist(this.pos, obs.pos);
      if (d < detectDist && d > 0.001) {
        let diff = p5.Vector.sub(this.pos, obs.pos);
        let factor = map(d, obs.r + this.r, detectDist, 2.0, 0.5, true);
        let desired = diff.normalize().mult(this.maxSpeed * factor);
        let steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce * 2.0);
        steerTotal.add(steer);
      }
    }
    return steerTotal;
  }

  // Confinement physique absolu : barrière infranchissable sur les 4 coins, obstacles et parois
  containAndBounce(obstacles = []) {
    // 0. Rebond physique hors des obstacles rocheux
    for (let obs of obstacles) {
      let minDist = obs.r + this.r * 0.85;
      let d = p5.Vector.dist(this.pos, obs.pos);
      if (d < minDist) {
        let pushDir = p5.Vector.sub(this.pos, obs.pos);
        if (pushDir.magSq() < 0.001) pushDir = p5.Vector.random2D();
        pushDir.normalize();
        this.pos.set(p5.Vector.add(obs.pos, p5.Vector.mult(pushDir, minDist)));
        let dot = p5.Vector.dot(this.vel, pushDir);
        if (dot < 0) {
          this.vel.sub(p5.Vector.mult(pushDir, 2 * dot));
        }
      }
    }
    let corners = [
      createVector(0, 0),
      createVector(width, 0),
      createVector(0, height),
      createVector(width, height)
    ];

    // 1. Barrière infranchissable sur les 4 coins : empêche tout contact avec les coins
    for (let c of corners) {
      let d = p5.Vector.dist(this.pos, c);
      if (d < this.cornerSafetyRadius) {
        let pushDir = p5.Vector.sub(this.pos, c);
        if (pushDir.magSq() < 0.001) {
          pushDir = createVector(c.x === 0 ? 1 : -1, c.y === 0 ? 1 : -1);
        }
        pushDir.normalize();

        // Repousser hermétiquement hors du rayon du coin
        this.pos.set(p5.Vector.add(c, p5.Vector.mult(pushDir, this.cornerSafetyRadius)));

        // Réflexion élastique de la vitesse si dirigée vers le coin
        let dot = p5.Vector.dot(this.vel, pushDir);
        if (dot < 0) {
          this.vel.sub(p5.Vector.mult(pushDir, 2 * dot));
          this.vel.mult(0.9);
        }
      }
    }

    // 2. Maintien et rebond doux sur les parois droites du canvas
    if (this.pos.x < this.wallMargin) {
      this.pos.x = this.wallMargin;
      if (this.vel.x < 0) this.vel.x = -this.vel.x * 0.85;
    } else if (this.pos.x > width - this.wallMargin) {
      this.pos.x = width - this.wallMargin;
      if (this.vel.x > 0) this.vel.x = -this.vel.x * 0.85;
    }

    if (this.pos.y < this.wallMargin) {
      this.pos.y = this.wallMargin;
      if (this.vel.y < 0) this.vel.y = -this.vel.y * 0.85;
    } else if (this.pos.y > height - this.wallMargin) {
      this.pos.y = height - this.wallMargin;
      if (this.vel.y > 0) this.vel.y = -this.vel.y * 0.85;
    }
  }

  update(obstacles = []) {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);

    // Maintien strict dans l'espace jouable & protection absolue contre les coins et obstacles
    this.containAndBounce(obstacles);
  }

  show() {
    // 1. Cercle du champ de vision en mode debug
    if (Vehicle.debug) {
      push();
      noFill();
      stroke(this.isEvading ? "rgba(255, 140, 0, 0.85)" : "rgba(255, 230, 0, 0.35)");
      strokeWeight(this.isEvading ? 2 : 1);
      circle(this.pos.x, this.pos.y, this.champDeVision * 2);
      pop();
    }

    // 2. Rendu du sprite actif
    let activeSprite = this.isEvading ? this.evadingSprite : this.normalSprite;

    if (activeSprite && activeSprite.width > 0) {
      push();
      translate(this.pos.x, this.pos.y);
      imageMode(CENTER);
      if (this.vel.x < 0) {
        scale(-1, 1);
      }
      image(activeSprite, 0, 0, this.r * 2, this.r * 2);
      pop();
    } else {
      push();
      stroke(255);
      strokeWeight(2);
      fill(this.isEvading ? "#fb923c" : "#fdba74");
      translate(this.pos.x, this.pos.y);
      circle(0, 0, this.r * 2);
      // Oreilles de lapin de secours
      fill(255, 180, 180);
      ellipse(-this.r * 0.35, -this.r * 0.9, this.r * 0.35, this.r * 0.8);
      ellipse(this.r * 0.35, -this.r * 0.9, this.r * 0.35, this.r * 0.8);
      pop();
    }

    if (Vehicle.debug) {
      this.drawVector(this.pos, this.vel, "cyan", 6);
    }
  }
}
