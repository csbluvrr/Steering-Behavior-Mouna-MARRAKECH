class Particle extends Vehicle {
  constructor(x, y, col = null) {
    super(x, y);

    this.vel = p5.Vector.random2D().mult(random(3, 12));
    this.acc = createVector(0, 0);

    this.initialR = random(6, 16);
    this.r = this.initialR;

    this.maxLifespan = random(30, 50);
    this.lifespan = this.maxLifespan;

    // Palette rocheuse / étincelles Pokémon (pierres Onix, étincelles jaunes Scorbunny)
    const palette = [
      color(148, 163, 184), // Gris roche clair
      color(100, 116, 139), // Gris roche sombre
      color(251, 191, 36),  // Jaune or
      color(249, 115, 22),  // Orange feu
      color(255, 255, 255)  // Éclat blanc
    ];
    this.color = col || random(palette);
    this.isDead = false;
  }

  update() {
    this.vel.mult(0.91);
    super.update();

    this.lifespan--;
    this.r = map(this.lifespan, 0, this.maxLifespan, 0, this.initialR);

    if (this.lifespan <= 0) {
      this.isDead = true;
    }
  }

  show() {
    push();
    let alpha = map(this.lifespan, 0, this.maxLifespan, 0, 255);
    fill(red(this.color), green(this.color), blue(this.color), alpha);
    noStroke();
    circle(this.pos.x, this.pos.y, this.r * 2);
    pop();
  }
}
