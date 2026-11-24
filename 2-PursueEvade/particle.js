class Particle extends Vehicle {
  constructor(x, y, col = null) {
    super(x, y);

    // Vitesse d'explosion multidirectionnelle
    this.vel = p5.Vector.random2D().mult(random(4, 15));
    this.acc = createVector(0, 0);

    // Rayon initial de la particule
    this.r = random(5, 14);
    this.initialR = this.r;

    // Durée de vie en frames (décroissance d'opacité)
    this.maxLifespan = random(35, 55);
    this.lifespan = this.maxLifespan;

    // Palette de flammes / étincelles Pokémon (rouge vif, orange, jaune étincelant)
    const flamePalette = [
      color(255, 69, 0),    // Rouge-orangé braise
      color(255, 140, 0),   // Orange vif
      color(255, 215, 0),   // Jaune or
      color(255, 255, 255), // Blanc étincelle
      color(192, 132, 252)  // Violet spectral Gengar
    ];
    this.color = col || random(flamePalette);
    this.isDead = false;
  }

  update() {
    this.vel.mult(0.92);
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
