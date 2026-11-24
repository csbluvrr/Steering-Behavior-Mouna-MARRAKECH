class ComicBoom extends Vehicle {
  constructor(x, y) {
    super(x, y);

    // Mouvement ascensionnel doux (le mot flotte légèrement vers le haut)
    this.vel = createVector(random(-0.5, 0.5), random(-1.2, -0.6));
    this.acc = createVector(0, 0);

    // Choix aléatoire d'onomatopées cartoons mignonnes
    const onomatopees = ['BOOM !', 'POP !', 'POW !', 'BAM !', 'KAPOW !', 'POUF !'];
    this.text = random(onomatopees);

    // Angle d'inclinaison comic
    this.rotation = random(-0.25, 0.25);

    // Durée de vie en frames
    this.maxLifespan = 45;
    this.lifespan = this.maxLifespan;

    // Palette cartoon vive
    this.starColor = random(['#ffe600', '#ff007f', '#00e5ff', '#ff5722']);
    this.isDead = false;
  }

  update() {
    super.update();
    this.lifespan--;
    if (this.lifespan <= 0) {
      this.isDead = true;
    }
  }

  // Animation d'apparition avec effet de rebond élastique (pop-in)
  getScale() {
    let progress = 1 - (this.lifespan / this.maxLifespan);
    if (progress < 0.25) {
      // Phase d'expansion rapide avec dépassement élastique (jusqu'à 1.25)
      return map(progress, 0, 0.25, 0.2, 1.25);
    } else if (progress < 0.4) {
      // Rebondissement vers la taille normale (1.0)
      return map(progress, 0.25, 0.4, 1.25, 1.0);
    } else {
      // Maintien puis légère expansion avant disparition
      return map(progress, 0.4, 1.0, 1.0, 1.15);
    }
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation);

    let sc = this.getScale();
    scale(sc);

    // Fondu en sortie dans le dernier tiers de vie
    let alpha = map(this.lifespan, 0, this.maxLifespan * 0.35, 0, 255, true);

    // 1. Étoile d'éclatement style Comics / Bande Dessinée
    this.dessineEclatComics(alpha);

    // 2. Texte d'onomatopée en relief 3D cartoon
    this.dessineTexteComics(alpha);

    pop();
  }

  // Dessine l'étoile d'explosion crénelée
  dessineEclatComics(alpha) {
    push();
    drawingContext.save();
    drawingContext.globalAlpha = alpha / 255;

    let points = 14;
    let rExt = 55;
    let rInt = 28;
    let angleStep = TWO_PI / points;

    stroke("#000000");
    strokeWeight(4);
    fill(this.starColor);

    beginShape();
    for (let i = 0; i < points; i++) {
      let a = i * angleStep;
      // Pointe externe
      let x1 = cos(a) * rExt;
      let y1 = sin(a) * rExt;
      vertex(x1, y1);

      // Creux interne
      let aMid = a + angleStep / 2;
      let x2 = cos(aMid) * rInt;
      let y2 = sin(aMid) * rInt;
      vertex(x2, y2);
    }
    endShape(CLOSE);

    drawingContext.restore();
    pop();
  }

  // Dessine le texte avec contour noir épais et ombre portée cartoon
  dessineTexteComics(alpha) {
    push();
    drawingContext.save();
    drawingContext.globalAlpha = alpha / 255;

    textAlign(CENTER, CENTER);
    textFont('Impact, "Arial Black", sans-serif');
    textSize(24);

    // Ombre 3D noire décalée
    fill(0);
    noStroke();
    text(this.text, 3, 3);

    // Contour noir épais
    stroke(0);
    strokeWeight(5);
    fill(255);
    text(this.text, 0, 0);

    drawingContext.restore();
    pop();
  }
}
