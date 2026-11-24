class ComicBoom extends Vehicle {
  constructor(x, y) {
    super(x, y);

    this.vel = createVector(random(-0.8, 0.8), random(-2.0, -1.0));
    this.acc = createVector(0, 0);

    const onomatopees = ['KABOOM !', 'GOTCHA !', 'BAM !', 'POW !', 'ZAP !', 'BOOM !'];
    this.text = random(onomatopees);

    this.rotation = random(-0.25, 0.25);
    this.maxLifespan = 60;
    this.lifespan = this.maxLifespan;

    this.starColor = random(['#ffe600', '#ff0055', '#00e5ff', '#a855f7', '#fb923c']);
    this.secondaryColor = random(['#ffffff', '#fff066', '#ffb3ba']);
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
      // Impact pop-in élastique ultra punchy
      return map(progress, 0, 0.2, 0.1, 1.45);
    } else if (progress < 0.35) {
      return map(progress, 0.2, 0.35, 1.45, 1.0);
    } else {
      // Dérive avec légère expansion comique
      return map(progress, 0.35, 1.0, 1.0, 1.3);
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
      let r1 = 65;
      let r2 = 90 + sin(frameCount * 0.3 + i) * 12;
      line(cos(angle) * r1, sin(angle) * r1, cos(angle) * r2, sin(angle) * r2);
    }
    drawingContext.restore();
    pop();
  }

  dessineEclatComics(alpha) {
    push();
    drawingContext.save();
    drawingContext.globalAlpha = alpha / 255;

    // 1. Éclat externe dentelé (style comics rétro)
    let points = 16;
    let rExt = 80;
    let rInt = 40;
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

    // 2. Éclat interne contrasté
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
    textSize(32);

    // Ombre portée comics noire décalée
    fill(0);
    noStroke();
    text(this.text, 5, 5);

    // Contour noir épais
    stroke(0);
    strokeWeight(7);
    fill(255);
    text(this.text, 0, 0);

    // Rehaut lumineux intérieur
    strokeWeight(2);
    fill("#fffb00");
    text(this.text, 0, 0);

    drawingContext.restore();
    pop();
  }
}
