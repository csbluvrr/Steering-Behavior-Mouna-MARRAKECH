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
    this.maxSpeed = 8;
    // force maximale appliquée au véhicule
    this.maxForce = 0.3;
    // rayon du véhicule
    this.r = 30;
    // Sprite image optionnel
    this.image = image;
  }

  /*
   seek est une méthode qui permet de faire se rapprocher le véhicule de la cible passée en paramètre
   */
  seek(target) {
    // on calcule la direction vers la cible (vitesse désirée)
    let desiredSpeed = p5.Vector.sub(target, this.pos);
    desiredSpeed.setMag(this.maxSpeed);

    // formule de Reynolds : force = vitesse désirée - vitesse actuelle
    let force = p5.Vector.sub(desiredSpeed, this.vel);
    force.limit(this.maxForce);
    return force;
  }

  // inverse de seek : fuite directe
  flee(target) {
    let desiredSpeed = p5.Vector.sub(this.pos, target);
    desiredSpeed.setMag(this.maxSpeed);
    let force = p5.Vector.sub(desiredSpeed, this.vel);
    force.limit(this.maxForce);
    return force;
  }

  /* 
   Poursuite d'un point devant la cible avec prédiction de trajectoire (Craig Reynolds).
   Renvoie la force de pilotage à appliquer.
  */
  pursue(target) {
    // Calcul du temps d'anticipation proportionnel à la distance (Reynolds 1999)
    let d = p5.Vector.dist(this.pos, target.pos);
    let prediction = d / this.maxSpeed;

    // Position future estimée de la cible
    let targetAhead = p5.Vector.mult(target.vel, prediction);
    targetAhead.add(target.pos);

    if (Vehicle.debug) {
      // Trace visuelle du vecteur d'anticipation
      this.drawVector(target.pos, p5.Vector.mult(target.vel, prediction));
      push();
      fill("green");
      noStroke();
      circle(targetAhead.x, targetAhead.y, 16);
      pop();
    }

    return this.seek(targetAhead);
  }

  /* 
   Évasion : fuite du point d'interception futur du poursuiveur.
  */
  evade(target) {
    let d = p5.Vector.dist(this.pos, target.pos);
    let prediction = d / this.maxSpeed;

    // Anticipation de la trajectoire future de la menace
    let targetAhead = p5.Vector.mult(target.vel, prediction);
    targetAhead.add(target.pos);

    if (Vehicle.debug) {
      push();
      fill("orange");
      noStroke();
      circle(targetAhead.x, targetAhead.y, 12);
      pop();
    }

    // Fuite du point futur
    return this.flee(targetAhead);
  }

  // applyForce permet d'additionner une force à l'accélération
  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
  }

  // Rendu graphique du véhicule
  show() {
    if (this.image) {
      push();
      translate(this.pos.x, this.pos.y);
      imageMode(CENTER);
      // Retournement horizontal si déplacement vers la gauche
      if (this.vel.x < 0) {
        scale(-1, 1);
      }
      image(this.image, 0, 0, this.r * 2, this.r * 2);
      pop();
    } else {
      push();
      stroke(255);
      strokeWeight(2);
      fill(255);
      translate(this.pos.x, this.pos.y);
      rotate(this.vel.heading());
      triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);
      pop();
    }

    if (Vehicle.debug) {
      this.drawVector(this.pos, this.vel.copy().mult(10));
    }
  }

  drawVector(pos, v) {
    push();
    strokeWeight(2);
    stroke("red");
    line(pos.x, pos.y, pos.x + v.x, pos.y + v.y);
    let arrowSize = 5;
    translate(pos.x + v.x, pos.y + v.y);
    rotate(v.heading());
    translate(-arrowSize / 2, 0);
    fill("red");
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    pop();
  }

  // Boucle torique aux bords de l'écran
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
