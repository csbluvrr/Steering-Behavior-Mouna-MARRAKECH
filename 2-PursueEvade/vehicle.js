class Vehicle {
  static debug = false;

  constructor(x, y, normalSprite = null, seekingSprite = null) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 8;
    this.maxForce = 0.35;
    this.r = 45;

    // Sprites pour la machine à états
    this.normalSprite = normalSprite;
    this.seekingSprite = seekingSprite || normalSprite;
    this.isSeeking = false;

    // Champ de vision (cercle de détection)
    this.champDeVision = 220;

    // Dernière force de pilotage calculée pour le débug
    this.currentSteeringForce = createVector(0, 0);
    this.lastTargetAhead = null;
  }

  // Comportement Seek standard de Craig Reynolds
  seek(target) {
    let targetPos = target.pos ? target.pos : target;
    let desiredSpeed = p5.Vector.sub(targetPos, this.pos);
    desiredSpeed.setMag(this.maxSpeed);

    let force = p5.Vector.sub(desiredSpeed, this.vel);
    force.limit(this.maxForce);
    return force;
  }

  // Comportement Flee standard (inversion de la vitesse désirée)
  flee(target) {
    let targetPos = target.pos ? target.pos : target;
    let desiredSpeed = p5.Vector.sub(this.pos, targetPos);
    desiredSpeed.setMag(this.maxSpeed);

    let force = p5.Vector.sub(desiredSpeed, this.vel);
    force.limit(this.maxForce);
    return force;
  }

  /* 
   Comportement Pursuit (Poursuite avec anticipation) :
   Vise un point situé DEVANT la cible dans sa direction de déplacement.
   predictionFrames : nombre de frames projetées dans le futur (ex: 10).
  */
  pursue(target, predictionFrames = 10) {
    // Position future estimée : pos + vel * predictionFrames
    let targetAhead = p5.Vector.mult(target.vel, predictionFrames);
    targetAhead.add(target.pos);
    this.lastTargetAhead = targetAhead.copy();

    // Rendu en mode debug : tracé et cercle vert sur le point prédit
    if (Vehicle.debug) {
      push();
      // Ligne d'anticipation reliant la cible au point futur
      stroke("rgba(0, 255, 136, 0.7)");
      strokeWeight(2);
      drawingContext.setLineDash([4, 6]);
      line(target.pos.x, target.pos.y, targetAhead.x, targetAhead.y);
      drawingContext.setLineDash([]);

      // Point prédit sous forme de cercle vert
      fill("#00ff88");
      stroke(0);
      strokeWeight(1.5);
      circle(targetAhead.x, targetAhead.y, 14);
      pop();
    }

    return this.seek(targetAhead);
  }

  /* 
   Comportement Evade (Évasion avec anticipation) :
   Inverse de Pursuit : inverse la VITESSE DÉSIRÉE par rapport au point futur de la menace.
  */
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

    // Fuite du point futur anticipé (inversion de la vitesse désirée)
    return this.flee(threatAhead);
  }

  applyForce(force) {
    this.acc.add(force);
    this.currentSteeringForce.set(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);

    // Le véhicule ne traverse pas l'écran, il reste dans les limites du canvas (rebond doux)
    this.bounceEdges();
  }

  show() {
    // 1. Cercle du champ de vision affiché en mode debug
    if (Vehicle.debug) {
      push();
      noFill();
      stroke(this.isSeeking ? "rgba(0, 255, 136, 0.75)" : "rgba(255, 255, 255, 0.25)");
      strokeWeight(this.isSeeking ? 2 : 1);
      circle(this.pos.x, this.pos.y, this.champDeVision * 2);
      pop();
    }

    // 2. Sélection dynamique du sprite selon l'état de détection
    let activeSprite = this.isSeeking ? this.seekingSprite : this.normalSprite;

    if (activeSprite && activeSprite.width > 0) {
      push();
      translate(this.pos.x, this.pos.y);
      imageMode(CENTER);
      // Retournement horizontal si déplacement vers la gauche
      if (this.vel.x < 0) {
        scale(-1, 1);
      }
      image(activeSprite, 0, 0, this.r * 2, this.r * 2);
      pop();
    } else {
      push();
      stroke(255);
      strokeWeight(2);
      fill(this.isSeeking ? "#a855f7" : "#7c3aed");
      translate(this.pos.x, this.pos.y);
      rotate(this.vel.heading());
      triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);
      pop();
    }

    // 3. Rendu des vecteurs de forces en mode debug
    if (Vehicle.debug) {
      this.drawVector(this.pos, this.vel, "red", 8);
      if (this.currentSteeringForce && this.currentSteeringForce.magSq() > 0) {
        this.drawVector(this.pos, this.currentSteeringForce, "#00ff88", 65);
      }
    }
  }

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

  // Maintien dans les limites de l'écran par rebond (le véhicule ne réapparaît pas de l'autre côté)
  bounceEdges() {
    if (this.pos.x - this.r <= 0) {
      this.pos.x = this.r;
      this.vel.x = -this.vel.x;
    } else if (this.pos.x + this.r >= width) {
      this.pos.x = width - this.r;
      this.vel.x = -this.vel.x;
    }
    if (this.pos.y - this.r <= 0) {
      this.pos.y = this.r;
      this.vel.y = -this.vel.y;
    } else if (this.pos.y + this.r >= height) {
      this.pos.y = height - this.r;
      this.vel.y = -this.vel.y;
    }
  }
}
