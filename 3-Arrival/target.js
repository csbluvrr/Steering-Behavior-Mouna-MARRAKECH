class Target extends Vehicle {
  constructor(x, y, image = null) {
    super(x, y, image);
    this.vel = p5.Vector.random2D();
    this.vel.mult(5);
    this.r = 20;
  }

  show() {
    push();
    if (this.image) {
      translate(this.pos.x, this.pos.y);
      imageMode(CENTER);
      if (this.vel.x < 0) {
        scale(-1, 1);
      }
      image(this.image, 0, 0, this.r * 2, this.r * 2);
    } else {
      stroke(255);
      strokeWeight(2);
      fill("#F063A4");
      translate(this.pos.x, this.pos.y);
      circle(0, 0, this.r * 2);
    }
    pop();
  }
}
