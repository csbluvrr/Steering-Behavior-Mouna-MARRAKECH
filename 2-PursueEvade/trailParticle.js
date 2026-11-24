class TrailParticle extends Vehicle {
  constructor(x, y, baseColor, isGengar = false) {
    super(x, y);

    // Vitesse d'expulsion arrière avec légère dispersion angulaire
    this.vel = p5.Vector.random2D().mult(random(0.5, 2.5));
    this.acc = createVector(0, 0);

    // Rayon et rétrécissement progressif
    this.initialR = random(4, 9);
    this.r = this.initialR;

    // Durée de vie courte pour une traînée fluide et dynamique
    this.maxLifespan = random(18, 30);
    this.lifespan = this.maxLifespan;

    this.isGengar = isGengar;
    this.baseColor = baseColor;
    this.isDead = false;
  }

  update() {
    this.vel.mult(0.90);
    super.update();

    this.lifespan--;
    this.r = map(this.lifespan, 0, this.maxLifespan, 0, this.initialR);

    if (this.lifespan <= 0) {
      this.isDead = true;
    }
  }

  show() {
    push();
    let alpha = map(this.lifespan, 0, this.maxLifespan, 0, 220);

    // Effet de lueur diffuse pour le propulseur de vaisseau spatial
    noStroke();
    if (this.isGengar) {
      // Traînée spectrale violette / magenta pour le vaisseau de Gengar
      fill(192, 132, 252, alpha * 0.4);
      circle(this.pos.x, this.pos.y, this.r * 2.8);
      fill(168, 85, 247, alpha);
      circle(this.pos.x, this.pos.y, this.r * 1.5);
      fill(255, 255, 255, alpha * 0.9);
      circle(this.pos.x, this.pos.y, this.r * 0.6);
    } else {
      // Traînée lumineuse jaune / orange plasma pour le vaisseau de Scorbunny
      fill(251, 146, 60, alpha * 0.4);
      circle(this.pos.x, this.pos.y, this.r * 2.8);
      fill(250, 204, 21, alpha);
      circle(this.pos.x, this.pos.y, this.r * 1.5);
      fill(255, 255, 255, alpha * 0.9);
      circle(this.pos.x, this.pos.y, this.r * 0.6);
    }
    pop();
  }
}
