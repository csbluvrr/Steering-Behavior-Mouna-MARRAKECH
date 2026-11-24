class Target extends Vehicle {
  constructor(x, y, normalSprite = null, evadingSprite = null) {
    super(x, y);

    this.vel = p5.Vector.random2D().mult(random(3, 5));
    this.maxSpeed = 6;
    this.maxForce = 0.4;
    this.r = 55; // Sprites agrandis pour une meilleure lisibilité

    // Sprites pour la machine à états
    this.normalSprite = normalSprite;
    this.evadingSprite = evadingSprite || normalSprite;
    this.isEvading = false;

    // Champ de vision (rayon de détection de fuite)
    this.champDeVision = 180;
  }

  // Réapparition aléatoire après interception
  respawn() {
    this.pos.set(random(this.r, width - this.r), random(this.r, height - this.r));
    this.vel = p5.Vector.random2D().mult(this.maxSpeed);
    this.isEvading = false;
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);

    // Les cibles réapparaissent de l'autre côté de l'écran quand elles en sortent
    this.edges();
  }

  show() {
    // 1. Cercle du champ de vision en mode debug (orange si menacé, jaune doux sinon)
    if (Vehicle.debug) {
      push();
      noFill();
      stroke(this.isEvading ? "rgba(255, 140, 0, 0.85)" : "rgba(255, 230, 0, 0.35)");
      strokeWeight(this.isEvading ? 2 : 1);
      circle(this.pos.x, this.pos.y, this.champDeVision * 2);
      pop();
    }

    // 2. Sélection dynamique du sprite
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
      // Petites oreilles de lapin mignonnes en fallback
      fill(255, 180, 180);
      ellipse(-this.r * 0.35, -this.r * 0.9, this.r * 0.35, this.r * 0.8);
      ellipse(this.r * 0.35, -this.r * 0.9, this.r * 0.35, this.r * 0.8);
      pop();
    }

    // 3. Vecteur vitesse de la cible en cyan si debug activé
    if (Vehicle.debug) {
      this.drawVector(this.pos, this.vel, "cyan", 6);
    }
  }

  // Les cibles réapparaissent de l'autre côté du canvas (boucle torique)
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
