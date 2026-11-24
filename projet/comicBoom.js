class ComicBoom extends Vehicle {
  constructor(x, y, type = 'NOM') {
    super(x, y);

    this.type = type;
    this.vel = createVector(random(-0.4, 0.4), type === 'CRASH' ? -1.0 : -1.8);
    this.acc = createVector(0, 0);

    const nomWords = ['NOM !', 'MIAM !', 'CHOMP !', '+1 ★'];
    const crashWords = ['BONK !', 'AÏE !', 'CRAC !'];
    this.text = (type === 'CRASH') ? random(crashWords) : random(nomWords);

    this.rotation = random(-0.12, 0.12);
    this.maxLifespan = (type === 'CRASH') ? 42 : 34;
    this.lifespan = this.maxLifespan;
    this.isDead = false;
  }

  update() {
    this.vel.mult(0.95);
    super.update();
    this.lifespan--;
    if (this.lifespan <= 0) {
      this.isDead = true;
    }
  }

  show() {
    let progress = 1 - (this.lifespan / this.maxLifespan);
    let alpha = map(progress, 0.45, 1.0, 255, 0, true);
    let popScale = (progress < 0.2)
      ? map(progress, 0, 0.2, 0.5, 1.12)
      : map(progress, 0.2, 1.0, 1.12, 0.96);

    push();
    translate(this.pos.x, this.pos.y);

    // 1. Onde lumineuse Pokéball / Stardust fine et transparente (ne bloque jamais la vue)
    let ringRadius = map(progress, 0, 1, 14, this.type === 'CRASH' ? 58 : 48);
    let ringAlpha = map(progress, 0, 1, 190, 0);
    noFill();
    stroke(this.type === 'CRASH' ? color(255, 77, 109, ringAlpha) : color(253, 224, 71, ringAlpha));
    strokeWeight(2.5);
    circle(0, 0, ringRadius * 2);

    // Second anneau interne pastel
    stroke(this.type === 'CRASH' ? color(255, 255, 255, ringAlpha * 0.7) : color(56, 189, 248, ringAlpha * 0.8));
    strokeWeight(1.5);
    circle(0, 0, ringRadius * 1.35);

    // 2. Petites étoiles scintillantes Pokémon autour du texte
    let starDist = map(progress, 0, 1, 16, 36);
    for (let i = 0; i < 4; i++) {
      let a = (HALF_PI * i) + progress * 1.4;
      this.drawMiniSparkle(cos(a) * starDist, sin(a) * starDist, 5 * (1 - progress * 0.5), alpha);
    }

    // 3. Texte flottant net, compact et lisible (style Pokémon Switch)
    rotate(this.rotation);
    scale(popScale);

    textAlign(CENTER, CENTER);
    textFont('Fredoka, "Trebuchet MS", system-ui, sans-serif');
    textSize(19);

    stroke(45, 23, 76, alpha);
    strokeWeight(4.5);
    fill(this.type === 'CRASH' ? color(255, 77, 109, alpha) : color(253, 224, 71, alpha));
    text(this.text, 0, 0);

    pop();
  }

  drawMiniSparkle(x, y, size, alpha) {
    push();
    translate(x, y);
    noStroke();
    fill(255, 255, 255, alpha);
    beginShape();
    vertex(0, -size);
    vertex(size * 0.28, -size * 0.28);
    vertex(size, 0);
    vertex(size * 0.28, size * 0.28);
    vertex(0, size);
    vertex(-size * 0.28, size * 0.28);
    vertex(-size, 0);
    vertex(-size * 0.28, -size * 0.28);
    endShape(CLOSE);
    pop();
  }
}
