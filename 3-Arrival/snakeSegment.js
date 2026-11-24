class SnakeSegment extends Vehicle {
  constructor(x, y, bodySprite = null, tailSprite = null, r = 32, isTail = false) {
    super(x, y);
    this.bodySprite = bodySprite;
    this.tailSprite = tailSprite;
    this.r = r;
    this.isTail = isTail;
    this.maxSpeed = 9;
    this.maxForce = 0.55;
    this.currentHeading = 0;
  }

  follow(previousSegment, spacing = 28, slowingRadius = 90) {
    // Calcul du point cible situé derrière le segment précédent dans sa direction de déplacement
    let targetPos = previousSegment.pos.copy();
    let dir = p5.Vector.sub(this.pos, previousSegment.pos);

    if (dir.magSq() > 0.1) {
      dir.setMag(spacing);
      targetPos.add(dir);
    } else if (previousSegment.vel.magSq() > 0.1) {
      let back = previousSegment.vel.copy().normalize().mult(-spacing);
      targetPos.add(back);
    }

    let force = this.arrive(targetPos, slowingRadius);
    this.applyForce(force);
    this.update();

    // Orientation vers le segment précédent
    let lookDir = p5.Vector.sub(previousSegment.pos, this.pos);
    if (lookDir.magSq() > 0.1) {
      this.currentHeading = lookDir.heading();
    }
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
        image(activeSprite, 0, 0, this.r * 2.4, this.r * 1.5);
      } else {
        // Boule de roche Onix
        image(activeSprite, 0, 0, this.r * 2.2, this.r * 2.2);
      }
    } else {
      // Rendu vectoriel de secours
      stroke(0);
      strokeWeight(2);
      fill(this.isTail ? '#64748b' : '#94a3b8');
      if (this.isTail) {
        triangle(-this.r * 1.2, -this.r * 0.5, -this.r * 1.2, this.r * 0.5, this.r * 0.8, 0);
      } else {
        circle(0, 0, this.r * 2);
        fill('#475569');
        circle(-this.r * 0.25, -this.r * 0.25, this.r * 0.6);
      }
    }
    pop();

    if (Vehicle.debug) {
      this.drawVector(this.pos, this.vel, "red", 6);
    }
  }
}
