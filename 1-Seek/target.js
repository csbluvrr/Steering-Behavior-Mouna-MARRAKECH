class Target extends Vehicle {
  constructor(x, y, image = null) {
    super(x, y, image);

    // Vitesse aléatoire initiale : composantes x et y entre -7 et +7
    let vx = random(-7, 7);
    let vy = random(-7, 7);
    // Évite une vitesse nulle au démarrage
    if (abs(vx) < 1 && abs(vy) < 1) {
      vx = random() > 0.5 ? 4 : -4;
      vy = random() > 0.5 ? 4 : -4;
    }
    this.vel = createVector(vx, vy);

    // Rayon aléatoire entre 10 et 100
    this.r = random(10, 100);

    // Paramètres normaux de croisière
    this.normalMaxSpeed = this.vel.mag();
    this.normalAcceleration = 1.0;
    this.maxSpeed = this.normalMaxSpeed;
    this.accelerationMultiplier = this.normalAcceleration;
    this.maxForce = 0.4;

    // Paramètres de détection et de fuite (ajustables par sliders)
    this.rayonDetection = 100;    // Rayon de détection d'un Gengar menaçant
    this.distanceSecurite = 300;  // Distance jusqu'à laquelle la fuite se prolonge
    this.vitesseFuite = 12;       // Vitesse max temporaire pendant la fuite
    this.accelerationFuite = 2.5; // Accélération temporaire pendant la fuite

    // État courant de fuite
    this.isFleeing = false;
    this.threat = null;
  }

  // Comportement de détection et fuite face aux Gengars
  applyBehaviors(gengars) {
    let closestGengar = null;
    let minDist = Infinity;

    // Trouver le Gengar le plus proche
    for (let gengar of gengars) {
      let d = p5.Vector.dist(this.pos, gengar.pos);
      if (d < minDist) {
        minDist = d;
        closestGengar = gengar;
      }
    }

    // Gestion de l'état de panique / fuite
    if (closestGengar && minDist < this.rayonDetection) {
      // Déclenchement de la fuite si un Gengar entre dans le cercle de détection
      this.isFleeing = true;
      this.threat = closestGengar;
    } else if (this.isFleeing && closestGengar && minDist > this.distanceSecurite) {
      // Retour au calme une fois la distance de sécurité (300 px) franchie
      this.isFleeing = false;
      this.threat = null;
    }

    if (this.isFleeing && this.threat) {
      // Augmentation temporaire de la vitesse max et de l'accélération
      this.maxSpeed = this.vitesseFuite;
      this.accelerationMultiplier = this.accelerationFuite;

      // Force de fuite (flee) à l'opposé du Gengar
      let fleeForce = this.flee(this.threat.pos);
      this.applyForce(fleeForce);
    } else {
      // Rétablissement des valeurs de croisière
      this.maxSpeed = this.normalMaxSpeed;
      this.accelerationMultiplier = this.normalAcceleration;
    }
  }

  update() {
    super.update();
    // Rebond sur les parois du canvas
    this.bounceEdges();
  }

  // Rebond physique sur les bords de l'écran avec maintien dans les limites
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

  // Réapparition à une position aléatoire après capture (< 5 px)
  respawn() {
    this.pos.set(random(this.r + 50, width - this.r - 50), random(this.r + 50, height - this.r - 50));
    let vx = random(-7, 7);
    let vy = random(-7, 7);
    this.vel.set(vx === 0 ? 4 : vx, vy === 0 ? 4 : vy);
    this.isFleeing = false;
    this.threat = null;
  }

  show() {
    push();
    // Cercles de détection et de sécurité affichés en mode debug
    if (Vehicle.debug) {
      noFill();
      strokeWeight(this.isFleeing ? 2 : 1);
      // Cercle de détection (orange si en fuite, jaune doux sinon)
      stroke(this.isFleeing ? "orange" : "rgba(255, 230, 0, 0.45)");
      circle(this.pos.x, this.pos.y, this.rayonDetection * 2);

      // Si la cible est en fuite, on matérialise la zone de sécurité (300 px) en pointillés
      if (this.isFleeing) {
        stroke("rgba(255, 140, 0, 0.35)");
        drawingContext.setLineDash([4, 6]);
        circle(this.pos.x, this.pos.y, this.distanceSecurite * 2);
        drawingContext.setLineDash([]);
      }
    }

    // Affichage du sprite de Scorbunny
    if (this.image) {
      translate(this.pos.x, this.pos.y);
      imageMode(CENTER);
      // Retournement horizontal si Scorbunny va vers la gauche
      if (this.vel.x < 0) {
        scale(-1, 1);
      }
      image(this.image, 0, 0, this.r * 2, this.r * 2);
    } else {
      fill(this.isFleeing ? "orange" : "pink");
      stroke("white");
      strokeWeight(2);
      circle(this.pos.x, this.pos.y, this.r * 2);
    }
    pop();

    if (Vehicle.debug) {
      this.drawVector(this.pos, this.vel, "cyan", 5);
    }
  }
}
