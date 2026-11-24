class SnakeSegment extends Vehicle {
  constructor(x, y, bodySprite = null, tailSprite = null, r = 30, isTail = false) {
    super(x, y);
    this.bodySprite = bodySprite;
    this.tailSprite = tailSprite;
    this.r = r;
    this.isTail = isTail;
    this.maxSpeed = 8;
    this.maxForce = 0.55;
    this.currentHeading = 0;
  }

  // Maintient une liaison cinématique rigide et collée à l'anneau précédent
  follow(previousSegment, spacing = 22) {
    // Vecteur de l'anneau courant vers l'anneau précédent
    let dir = p5.Vector.sub(previousSegment.pos, this.pos);
    let currentDist = dir.mag();

    if (currentDist > 0.001) {
      this.currentHeading = dir.heading();
    }

    // Contrainte de distance directe : l'anneau reste fixé à 'spacing' pixels
    // évitant tout étirement élastique mou quand la tête tourne ou accélère
    if (currentDist > spacing) {
      let pull = p5.Vector.sub(previousSegment.pos, dir.copy().setMag(spacing));
      this.pos.set(pull);
    }

    // Vitesse alignée avec le déplacement pour le calcul physique
    this.vel = p5.Vector.sub(previousSegment.pos, this.pos);
    this.vel.limit(this.maxSpeed);
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.currentHeading);

    let activeSprite = this.isTail ? this.tailSprite : this.bodySprite;

    if (activeSprite && activeSprite.width > 0) {
      imageMode(CENTER);
      if (this.isTail) {
        // Queue rocheuse effilée
        image(activeSprite, 0, 0, this.r * 2.5, this.r * 1.6);
      } else {
        // Anneau rocheux sphérique Onix bien imbriqué
        image(activeSprite, 0, 0, this.r * 2.4, this.r * 2.4);
      }
    } else {
      // Repli vectoriel rocheux
      stroke(0);
      strokeWeight(2);
      fill(this.isTail ? '#64748b' : '#94a3b8');
      if (this.isTail) {
        triangle(-this.r * 1.2, -this.r * 0.5, -this.r * 1.2, this.r * 0.5, this.r * 0.8, 0);
      } else {
        circle(0, 0, this.r * 2);
        fill('#475569');
        circle(-this.r * 0.2, -this.r * 0.2, this.r * 0.5);
      }
    }
    pop();

    if (Vehicle.debug) {
      this.drawVector(this.pos, this.vel, "red", 5);
    }
  }
}
