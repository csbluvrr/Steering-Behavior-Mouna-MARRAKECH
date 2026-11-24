class BouncingBall extends Target {
  constructor(x, y, image = null) {
    super(x, y, image);
    this.r = 25;
  }

  update() {
    super.update();
    this.testeCollisionAvecBordsDuCanvas();
  }

  testeCollisionAvecBordsDuCanvas() {
    if (this.pos.x + this.r >= width) {
      this.pos.x = width - this.r;
      this.vel.x = -this.vel.x;
    }
    if (this.pos.x - this.r <= 0) {
      this.pos.x = this.r;
      this.vel.x = -this.vel.x;
    }
    if (this.pos.y + this.r >= height) {
      this.pos.y = height - this.r;
      this.vel.y = -this.vel.y;
    }
    if (this.pos.y - this.r <= 0) {
      this.pos.y = this.r;
      this.vel.y = -this.vel.y;
    }
  }
}
