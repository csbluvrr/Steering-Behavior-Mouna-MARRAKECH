class TrailParticle extends Vehicle {
  constructor(x, y, baseColor, isScorbunny = true) {
    super(x, y);

    this.vel = p5.Vector.random2D().mult(random(0.5, 2.0));
    this.acc = createVector(0, 0);

    this.initialR = random(3, 8);
    this.r = this.initialR;

    this.maxLifespan = random(16, 26);
    this.lifespan = this.maxLifespan;

    this.isScorbunny = isScorbunny;
    this.baseColor = baseColor;
    this.isDead = false;
  }

  update() {
    this.vel.mult(0.88);
    super.update();

    this.lifespan--;
    this.r = map(this.lifespan, 0, this.maxLifespan, 0, this.initialR);

    if (this.lifespan <= 0) {
      this.isDead = true;
    }
  }

  show() {
    push();
    let alpha = map(this.lifespan, 0, this.maxLifespan, 0, 200);
    noStroke();

    if (this.isScorbunny) {
      // Traînée plasma jaune/orange pour le vaisseau de Scorbunny
      fill(251, 146, 60, alpha * 0.4);
      circle(this.pos.x, this.pos.y, this.r * 2.5);
      fill(250, 204, 21, alpha);
      circle(this.pos.x, this.pos.y, this.r * 1.4);
      fill(255, 255, 255, alpha * 0.85);
      circle(this.pos.x, this.pos.y, this.r * 0.5);
    } else {
      // Poussière de roche soulevée par les anneaux d'Onix
      fill(148, 163, 184, alpha * 0.5);
      circle(this.pos.x, this.pos.y, this.r * 2);
      fill(203, 213, 225, alpha * 0.8);
      circle(this.pos.x, this.pos.y, this.r);
    }
    pop();
  }
}
