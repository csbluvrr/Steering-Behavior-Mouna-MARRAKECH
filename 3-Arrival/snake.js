class Snake extends Vehicle {
  constructor(x, y, length = 20, taille = 24, couleur = 'lime') {
    super(x, y);
    this.anneaux = [];
    this.couleur = couleur;
    this.r = taille;

    // Création de la tête du serpent
    this.head = new Vehicle(x, y);
    this.head.r = taille;
    this.anneaux.push(this.head);

    // Création des anneaux suivants du corps
    for (let i = 1; i < length; i++) {
      let anneau = new Vehicle(x - i * 15, y);
      anneau.r = taille * 0.85;
      anneau.maxForce = 0.5;
      anneau.maxSpeed = 8;
      this.anneaux.push(anneau);
    }
  }

  // Déplacement : la tête arrive sur la cible, chaque anneau arrive sur l'anneau précédent
  move(target, slowingRadius = 120, spacing = 22) {
    // La tête applique Arrival sur la cible principale
    let forceTete = this.head.arrive(target, slowingRadius, 0);
    this.head.applyForce(forceTete);
    this.head.update();

    // Chaque anneau suivant suit le précédent avec une distance d'écart
    for (let i = 1; i < this.anneaux.length; i++) {
      let anneauPrecedent = this.anneaux[i - 1];
      let anneauCourant = this.anneaux[i];
      let forceCorps = anneauCourant.arrive(anneauPrecedent.pos, slowingRadius * 0.8, spacing);
      anneauCourant.applyForce(forceCorps);
      anneauCourant.update();
    }
  }

  show() {
    this.dessineLesAnneaux();
    this.dessineTete();
  }

  dessineTete() {
    push();
    fill(this.couleur);
    stroke(0);
    strokeWeight(2);
    translate(this.head.pos.x, this.head.pos.y);
    if (this.head.vel.mag() > 0.2) {
      rotate(this.head.vel.heading());
    }

    // Forme de la tête
    circle(0, 0, this.r * 2);

    // Yeux cartoon
    fill(255);
    noStroke();
    circle(this.r * 0.4, -this.r * 0.35, this.r * 0.4);
    circle(this.r * 0.4, this.r * 0.35, this.r * 0.4);

    fill(0);
    circle(this.r * 0.5, -this.r * 0.35, this.r * 0.2);
    circle(this.r * 0.5, this.r * 0.35, this.r * 0.2);
    pop();
  }

  dessineLesAnneaux() {
    for (let i = this.anneaux.length - 1; i >= 1; i--) {
      let anneau = this.anneaux[i];
      push();
      // Dégradé de couleur le long du corps
      let ratio = i / this.anneaux.length;
      let col = lerpColor(color(this.couleur), color('#059669'), ratio);
      fill(col);
      stroke(0);
      strokeWeight(1.5);
      circle(anneau.pos.x, anneau.pos.y, anneau.r * 2);
      pop();
    }
  }
}
