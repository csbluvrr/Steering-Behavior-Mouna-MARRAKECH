class SnakeHead extends Vehicle {
  constructor(x, y, headSprite = null, r = 40) {
    super(x, y);
    this.headSprite = headSprite;
    this.r = r;
    this.maxSpeed = 8;
    this.maxForce = 0.45;
    this.currentHeading = 0;
  }

  update() {
    super.update();
    if (this.vel.magSq() > 0.1) {
      this.currentHeading = this.vel.heading();
    }
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    // Rotation alignée sur le vecteur vitesse (la corne d'Onix pointe vers le haut du sprite d'origine)
    rotate(this.currentHeading + HALF_PI);

    if (this.headSprite && this.headSprite.width > 0) {
      imageMode(CENTER);
      image(this.headSprite, 0, 0, this.r * 2.2, this.r * 3.2);
    } else {
      // Dessin vectoriel de repli (rocher gris d'Onix avec corne et yeux)
      stroke(0);
      strokeWeight(2.5);
      fill('#94a3b8');
      ellipse(0, 0, this.r * 2, this.r * 2.4);

      // Corne rocheuse au sommet
      fill('#64748b');
      triangle(-this.r * 0.35, -this.r * 1.1, this.r * 0.35, -this.r * 1.1, 0, -this.r * 1.8);

      // Yeux noirs perçants
      fill(0);
      ellipse(-this.r * 0.45, -this.r * 0.2, this.r * 0.25, this.r * 0.4);
      ellipse(this.r * 0.45, -this.r * 0.2, this.r * 0.25, this.r * 0.4);
    }
    pop();

    if (Vehicle.debug) {
      this.drawVector(this.pos, this.vel, "red", 8);
    }
  }
}
