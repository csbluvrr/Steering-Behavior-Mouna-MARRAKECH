class Snake extends Vehicle {
  constructor(x, y, initialLength = 8, headSprite = null, bodySprite = null, tailSprite = null) {
    super(x, y);

    this.headSprite = headSprite;
    this.bodySprite = bodySprite;
    this.tailSprite = tailSprite;

    this.headRadius = 40;
    this.bodyRadius = 30;

    // Mode de contrôle : 'KEYBOARD' (par défaut, flèches) ou 'MOUSE'
    this.controlMode = 'KEYBOARD';

    // Direction de déplacement pour les flèches du clavier (vers la droite au départ)
    this.direction = createVector(1, 0);

    // Tête d'Onix (SnakeHead extends Vehicle)
    this.head = new SnakeHead(x, y, this.headSprite, this.headRadius);
    this.head.vel = this.direction.copy().mult(5);

    // Anneaux rocheux d'Onix (SnakeSegment extends Vehicle)
    this.anneaux = [];
    this.construireCorps(x, y, initialLength, 22);
  }

  construireCorps(x, y, length, spacing = 22) {
    this.anneaux = [];
    for (let i = 0; i < length; i++) {
      let isTail = (i === length - 1);
      let r = isTail ? this.bodyRadius * 0.75 : this.bodyRadius;
      let seg = new SnakeSegment(x - (i + 1) * spacing, y, this.bodySprite, this.tailSprite, r, isTail);
      this.anneaux.push(seg);
    }
  }

  // Changement de direction aux flèches du clavier (empêche le demi-tour direct à 180°)
  setDirection(dx, dy) {
    let newDir = createVector(dx, dy).normalize();
    // Interdire le retour immédiat dans le cou
    if (this.direction.dot(newDir) >= -0.1) {
      this.direction = newDir;
      this.controlMode = 'KEYBOARD';
    }
  }

  // Agrandit Onix d'un anneau rocheux lors de la dégustation d'un Scorbunny
  grow(count = 1) {
    for (let c = 0; c < count; c++) {
      let lastSeg = this.anneaux[this.anneaux.length - 1];
      let spawnX = lastSeg ? lastSeg.pos.x - 15 : this.head.pos.x - 20;
      let spawnY = lastSeg ? lastSeg.pos.y : this.head.pos.y;

      if (lastSeg) {
        lastSeg.isTail = false;
        lastSeg.r = this.bodyRadius;
      }

      let newTail = new SnakeSegment(spawnX, spawnY, this.bodySprite, this.tailSprite, this.bodyRadius * 0.75, true);
      this.anneaux.push(newTail);
    }
  }

  // Déplacement d'Onix et mise à jour de la chaîne cinématique
  move(mouseTarget, slowingRadius = 140, spacing = 22) {
    if (this.controlMode === 'KEYBOARD') {
      // Déplacement classique continu guidé par les flèches directionnelles
      let desiredSpeed = this.direction.copy().setMag(this.head.maxSpeed);
      let steerForce = p5.Vector.sub(desiredSpeed, this.head.vel);
      steerForce.limit(this.head.maxForce);
      this.head.applyForce(steerForce);
      this.head.update();
    } else {
      // Déplacement Arrival guidé par la souris
      let forceArrival = this.head.arrive(mouseTarget, slowingRadius);
      this.head.applyForce(forceArrival);
      this.head.update();
    }

    this.pos.set(this.head.pos.x, this.head.pos.y);
    this.vel.set(this.head.vel.x, this.head.vel.y);

    // Les anneaux restent solidaires et collés les uns aux autres
    for (let i = 0; i < this.anneaux.length; i++) {
      let prev = (i === 0) ? this.head : this.anneaux[i - 1];
      this.anneaux[i].follow(prev, spacing);
    }
  }

  // Collision mortelle avec les bords de l'écran
  checkWallCollision() {
    let margin = this.head.r * 0.65;
    return (
      this.head.pos.x - margin <= 0 ||
      this.head.pos.x + margin >= width ||
      this.head.pos.y - margin <= 0 ||
      this.head.pos.y + margin >= height
    );
  }

  // Auto-collision mortelle (la tête touche un de ses anneaux)
  checkSelfCollision() {
    // Vérification à partir du 4ème anneau pour permettre les virages normaux
    for (let i = 4; i < this.anneaux.length; i++) {
      let seg = this.anneaux[i];
      let dSq = (this.head.pos.x - seg.pos.x) ** 2 + (this.head.pos.y - seg.pos.y) ** 2;
      let minDist = (this.head.r * 0.55 + seg.r * 0.55);
      if (dSq < minDist * minDist) {
        return true;
      }
    }
    return false;
  }

  show() {
    // Dessin de la queue vers la tête pour un recouvrement rocheux naturel
    for (let i = this.anneaux.length - 1; i >= 0; i--) {
      this.anneaux[i].show();
    }
    this.head.show();
  }

  setSpeedAndForce(maxSpeed, maxForce) {
    this.head.maxSpeed = maxSpeed;
    this.head.maxForce = maxForce;
    for (let seg of this.anneaux) {
      seg.maxSpeed = maxSpeed * 1.2;
      seg.maxForce = maxForce * 1.3;
    }
  }
}
