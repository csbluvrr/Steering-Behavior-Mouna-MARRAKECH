class Vehicle {
  static debug = false;

  constructor(x, y, image = null) {
    // position du véhicule
    this.pos = createVector(x, y);
    // vitesse du véhicule
    this.vel = createVector(0, 0);
    // accélération du véhicule
    this.acc = createVector(0, 0);
    // vitesse maximale du véhicule
    this.maxSpeed = 6;
    // force maximale appliquée au véhicule
    this.maxForce = 0.2;
    // rayon du véhicule
    this.r = 45;
    // Image / Sprite du véhicule
    this.image = image;
    // Multiplicateur d'accélération (réactivité du véhicule)
    this.accelerationMultiplier = 1;
    // Rayon du cercle de détection pour repérer les cibles (réglable de 20 à 200 px)
    this.rayonDetection = 150;
    // Mémorisation de la dernière force de pilotage appliquée (pour le débug)
    this.currentSteeringForce = createVector(0, 0);
    // Cible actuellement chassée
    this.currentTarget = null;
  }

  // Applique les comportements de pilotage :
  // Détecte les cibles dans le rayon de détection, choisit la plus proche, et fait seek dessus.
  applyBehaviors(targets) {
    // Si une position unique est passée (ex: curseur)
    if (!Array.isArray(targets)) {
      let force = this.seek(targets);
      this.applyForce(force);
      this.currentSteeringForce.set(force);
      return;
    }

    let closestTarget = null;
    let minDist = Infinity;

    // Recherche de la cible la plus proche dans le cercle de détection
    for (let target of targets) {
      let d = p5.Vector.dist(this.pos, target.pos);
      if (d < this.rayonDetection && d < minDist) {
        minDist = d;
        closestTarget = target;
      }
    }

    this.currentTarget = closestTarget;

    if (closestTarget) {
      // Seek vers la cible la plus proche
      let force = this.seek(closestTarget.pos);
      this.applyForce(force);
      this.currentSteeringForce.set(force);

      // Si le vaisseau touche la cible (distance < 5 pixels ou collision de contact direct)
      // la cible explose en particules et ré-apparaît à une position aléatoire
      if (minDist < 10) {
        if (typeof creerExplosion === 'function') {
          creerExplosion(closestTarget.pos.x, closestTarget.pos.y);
        }
        closestTarget.respawn();
      }
    } else {
      // Aucune cible à portée : pas de force de pilotage, le vaisseau décélère doucement
      this.currentSteeringForce.set(0, 0);
      this.vel.mult(0.97);
    }
  }

  // Seek : calcule la force pour s'orienter vers une position cible
  seek(target) {
    let targetPos = target.pos ? target.pos : target;
    let desiredSpeed = p5.Vector.sub(targetPos, this.pos);
    desiredSpeed.setMag(this.maxSpeed);

    let force = p5.Vector.sub(desiredSpeed, this.vel);
    force.limit(this.maxForce);
    return force;
  }

  // Flee : fuite directe à l'opposé d'une menace (Craig Reynolds)
  flee(target) {
    let targetPos = target.pos ? target.pos : target;
    let desiredSpeed = p5.Vector.sub(this.pos, targetPos);
    desiredSpeed.setMag(this.maxSpeed);

    let force = p5.Vector.sub(desiredSpeed, this.vel);
    force.limit(this.maxForce);
    return force;
  }

  // applyForce permet d'additionner une force à l'accélération
  applyForce(force) {
    let a = p5.Vector.mult(force, this.accelerationMultiplier || 1);
    this.acc.add(a);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
  }

  // Dessin du véhicule
  show() {
    // 1. Cercle de détection affiché en mode debug
    if (Vehicle.debug) {
      push();
      noFill();
      stroke(this.currentTarget ? "rgba(0, 255, 136, 0.6)" : "rgba(255, 255, 255, 0.25)");
      strokeWeight(this.currentTarget ? 1.5 : 1);
      circle(this.pos.x, this.pos.y, this.rayonDetection * 2);

      // Ligne reliant le Gengar à sa cible active
      if (this.currentTarget) {
        stroke("rgba(0, 255, 136, 0.4)");
        drawingContext.setLineDash([4, 6]);
        line(this.pos.x, this.pos.y, this.currentTarget.pos.x, this.currentTarget.pos.y);
        drawingContext.setLineDash([]);
      }
      pop();
    }

    // 2. Rendu graphique du sprite
    if (this.image) {
      push();
      translate(this.pos.x, this.pos.y);
      imageMode(CENTER);
      if (this.vel.x < 0) {
        scale(-1, 1);
      }
      image(this.image, 0, 0, this.r * 2, this.r * 2);
      pop();
    } else {
      push();
      stroke("white");
      strokeWeight(2);
      fill("blue");
      translate(this.pos.x, this.pos.y);
      rotate(this.vel.heading());
      triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);
      pop();
    }

    // 3. Rendu des vecteurs de debug (vitesse en rouge, force de pilotage en vert fluo)
    if (Vehicle.debug) {
      // Vecteur vitesse
      this.drawVector(this.pos, this.vel, "red", 8);

      // Vecteur force de pilotage
      if (this.currentSteeringForce && this.currentSteeringForce.magSq() > 0) {
        this.drawVector(this.pos, this.currentSteeringForce, "#00ff88", 70);
      }
    }
  }

  // Méthode générique pour dessiner un vecteur sous forme de flèche orientée
  drawVector(pos, v, col, scaleFactor = 1) {
    if (!v || (v.x === 0 && v.y === 0)) return;
    push();
    stroke(col);
    strokeWeight(2.5);
    fill(col);

    let endX = pos.x + v.x * scaleFactor;
    let endY = pos.y + v.y * scaleFactor;

    line(pos.x, pos.y, endX, endY);

    let arrowSize = 6;
    translate(endX, endY);
    rotate(v.heading());
    translate(-arrowSize / 2, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);

    pop();
  }

  // Boucle torique aux bords de l'écran pour les Gengars
  edges() {
    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
    }
  }
}
