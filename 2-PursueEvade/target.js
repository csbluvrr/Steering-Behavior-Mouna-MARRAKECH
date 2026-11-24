class Target extends Vehicle {
  constructor(x, y, image = null) {
    super(x, y, image);
    this.vel = p5.Vector.random2D();
    this.vel.mult(4);
    this.maxSpeed = 5;
    this.maxForce = 0.3;

    // Rayon de détection à partir duquel la cible commence à fuir
    this.rayonDetection = 160;
    this.r = 25;
  }

  show() {
    push();
    if (Vehicle.debug) {
      // Cercle représentant la zone de détection
      noFill();
      stroke(255, 255, 255, 80);
      strokeWeight(1);
      circle(this.pos.x, this.pos.y, this.rayonDetection * 2);
    }

    if (this.image) {
      translate(this.pos.x, this.pos.y);
      imageMode(CENTER);
      if (this.vel.x < 0) {
        scale(-1, 1);
      }
      image(this.image, 0, 0, this.r * 2, this.r * 2);
    } else {
      stroke("white");
      strokeWeight(2);
      fill("pink");
      translate(this.pos.x, this.pos.y);
      circle(0, 0, this.r * 2);
    }
    pop();
  }
}
