class ComicBoom extends Vehicle {
  constructor(x, y) {
    super(x, y);

    this.vel = createVector(random(-0.8, 0.8), random(-2.2, -1.0));
    this.acc = createVector(0, 0);

    // Onomatopées "NOM" pour Onix dévorant les Scorbunnies
    const onomatopees = ['NOM !', 'CRUNCH !', 'CHOMP !', 'MIAM !', 'GLOUPS !', 'YUM !'];
    this.text = random(onomatopees);

    this.rotation = random(-0.25, 0.25);
    this.maxLifespan = 55;
    this.lifespan = this.maxLifespan;

    this.starColor = random(['#ffe600', '#f97316', '#38bdf8', '#a855f7', '#10b981']);
    this.secondaryColor = random(['#ffffff', '#fffbeb', '#fef08a']);
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
    if (progress < 0.2) {
      return map(progress, 0, 0.2, 0.1, 1.4);
    } else if (progress < 0.35) {
      return map(progress, 0.2, 0.35, 1.4, 1.0);
    } else {
      return map(progress, 0.35, 1.0, 1.0, 1.25);
    }
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation);

    let sc = this.getScale();
    scale(sc);

    let alpha = map(this.lifespan, 0, this.maxLifespan * 0.35, 0, 255, true);

    this.dessineRayonsComics(alpha);
    this.dessineEclatComics(alpha);
    this.dessineTexteComics(alpha);
    pop();
  }

  dessineRayonsComics(alpha) {
    push();
    drawingContext.save();
    drawingContext.globalAlpha = alpha / 255;
    stroke(255, 235, 59, alpha);
    strokeWeight(3);
    let rayCount = 10;
    for (let i = 0; i < rayCount; i++) {
      let angle = (TWO_PI / rayCount) * i + frameCount * 0.05;
      let r1 = 60;
      let r2 = 85 + sin(frameCount * 0.3 + i) * 10;
      line(cos(angle) * r1, sin(angle) * r1, cos(angle) * r2, sin(angle) * r2);
    }
    drawingContext.restore();
    pop();
  }

  dessineEclatComics(alpha) {
    push();
    drawingContext.save();
    drawingContext.globalAlpha = alpha / 255;

    let points = 16;
    let rExt = 75;
    let rInt = 38;
    let angleStep = TWO_PI / points;

    stroke("#000000");
    strokeWeight(5);
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

    stroke("#ffffff");
    strokeWeight(2);
    fill(this.secondaryColor);
    beginShape();
    for (let i = 0; i < points; i++) {
      let a = i * angleStep + angleStep * 0.25;
      let x1 = cos(a) * (rExt * 0.65);
      let y1 = sin(a) * (rExt * 0.65);
      vertex(x1, y1);

      let aMid = a + angleStep / 2;
      let x2 = cos(aMid) * (rInt * 0.65);
      let y2 = sin(aMid) * (rInt * 0.65);
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
    textSize(30);

    fill(0);
    noStroke();
    text(this.text, 4, 4);

    stroke(0);
    strokeWeight(6);
    fill(255);
    text(this.text, 0, 0);

    strokeWeight(2);
    fill("#fffb00");
    text(this.text, 0, 0);

    drawingContext.restore();
    pop();
  }
}
