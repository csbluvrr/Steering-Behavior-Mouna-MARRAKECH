class ComicBoom extends Vehicle {
  constructor(x, y) {
    super(x, y);

    this.vel = createVector(random(-0.5, 0.5), random(-1.5, -0.8));
    this.acc = createVector(0, 0);

    const onomatopees = ['BOOM !', 'GOTCHA !', 'POP !', 'POW !', 'BAM !', 'KAPOW !'];
    this.text = random(onomatopees);

    this.rotation = random(-0.25, 0.25);
    this.maxLifespan = 50;
    this.lifespan = this.maxLifespan;

    this.starColor = random(['#ffe600', '#ff007f', '#00e5ff', '#a855f7']);
    this.isDead = false;
  }

  update() {
    super.update();
    this.lifespan--;
    if (this.lifespan <= 0) {
      this.isDead = true;
    }
  }

  getScale() {
    let progress = 1 - (this.lifespan / this.maxLifespan);
    if (progress < 0.25) {
      return map(progress, 0, 0.25, 0.2, 1.35);
    } else if (progress < 0.4) {
      return map(progress, 0.25, 0.4, 1.35, 1.0);
    } else {
      return map(progress, 0.4, 1.0, 1.0, 1.2);
    }
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation);

    let sc = this.getScale();
    scale(sc);

    let alpha = map(this.lifespan, 0, this.maxLifespan * 0.4, 0, 255, true);

    this.dessineEclatComics(alpha);
    this.dessineTexteComics(alpha);
    pop();
  }

  dessineEclatComics(alpha) {
    push();
    drawingContext.save();
    drawingContext.globalAlpha = alpha / 255;

    let points = 14;
    let rExt = 65;
    let rInt = 32;
    let angleStep = TWO_PI / points;

    stroke("#000000");
    strokeWeight(4);
    fill(this.starColor);

    beginShape();
    for (let i = 0; i < points; i++) {
      let a = i * angleStep;
      let x1 = cos(a) * rExt;
      let y1 = sin(a) * rExt;
      vertex(x1, y1);

      let aMid = a + angleStep / 2;
      let x2 = cos(aMid) * rInt;
      let y2 = sin(aMid) * rInt;
      vertex(x2, y2);
    }
    endShape(CLOSE);

    drawingContext.restore();
    pop();
  }

  dessineTexteComics(alpha) {
    push();
    drawingContext.save();
    drawingContext.globalAlpha = alpha / 255;

    textAlign(CENTER, CENTER);
    textFont('Impact, "Arial Black", sans-serif');
    textSize(26);

    fill(0);
    noStroke();
    text(this.text, 3, 3);

    stroke(0);
    strokeWeight(5);
    fill(255);
    text(this.text, 0, 0);

    drawingContext.restore();
    pop();
  }
}
