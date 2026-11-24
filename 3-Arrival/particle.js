class Particle extends Vehicle {
  constructor(x, y, col = null) {
    super(x, y);

    this.vel = p5.Vector.random2D().mult(random(1.8, 5.5));
    this.acc = createVector(0, 0);

    this.initialR = random(3, 6.5);
    this.r = this.initialR;

    this.maxLifespan = random(18, 30);
    this.lifespan = this.maxLifespan;
    this.isStar = random() < 0.65;
    this.rot = random(TWO_PI);
    this.rotSpeed = random(-0.15, 0.15);

    // Palette étincelles Pokémon pastel (Or Pikachu, Bleu Joy-Con, Corail, Blanc brillant)
    const palette = [
      color(253, 224, 71),  // Jaune Pikachu
      color(56, 189, 248),  // Bleu Joy-Con
      color(255, 107, 139), // Rose Corail
      color(192, 132, 252), // Lavande
      color(255, 255, 255)  // Éclat blanc
    ];
    this.color = col || random(palette);
    this.isDead = false;
  }

  update() {
    this.vel.mult(0.90);
    this.rot += this.rotSpeed;
    super.update();

    this.lifespan--;
    this.r = map(this.lifespan, 0, this.maxLifespan, 0, this.initialR);

    if (this.lifespan <= 0) {
      this.isDead = true;
    }
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rot);
    let alpha = map(this.lifespan, 0, this.maxLifespan, 0, 210);
    fill(red(this.color), green(this.color), blue(this.color), alpha);
    noStroke();

    if (this.isStar) {
      // Étincelle Pokémon à 4 branches (légère et transparente)
      let s = this.r * 1.45;
      let inner = s * 0.28;
      beginShape();
      vertex(0, -s);
      vertex(inner, -inner);
      vertex(s, 0);
      vertex(inner, inner);
      vertex(0, s);
      vertex(-inner, inner);
      vertex(-s, 0);
      vertex(-inner, -inner);
      endShape(CLOSE);
    } else {
      circle(0, 0, this.r * 1.6);
    }
    pop();
  }
}
