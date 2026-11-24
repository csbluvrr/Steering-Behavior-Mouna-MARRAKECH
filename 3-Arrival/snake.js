class Snake extends Vehicle {
  constructor(x, y, initialLength = 8, headSprite = null, bodySprite = null, tailSprite = null) {
    super(x, y);

    this.headSprite = headSprite;
    this.bodySprite = bodySprite;
    this.tailSprite = tailSprite;

    this.headRadius = 42;
    this.bodyRadius = 32;

    // Création de la tête d'Onix (SnakeHead extends Vehicle)
    this.head = new SnakeHead(x, y, this.headSprite, this.headRadius);

    // Anneaux du corps d'Onix (SnakeSegment extends Vehicle)
    this.anneaux = [];
    this.construireCorps(x, y, initialLength);
  }

  construireCorps(x, y, length) {
    this.anneaux = [];
    for (let i = 0; i < length; i++) {
      let isTail = (i === length - 1);
      let r = isTail ? this.bodyRadius * 0.8 : this.bodyRadius;
      let seg = new SnakeSegment(x - (i + 1) * 25, y, this.bodySprite, this.tailSprite, r, isTail);
      this.anneaux.push(seg);
    }
  }

  // Agrandit Onix d'un anneau après avoir mangé un Scorbunny
  grow(count = 1) {
    for (let c = 0; c < count; c++) {
      let lastSeg = this.anneaux[this.anneaux.length - 1];
      let spawnX = lastSeg ? lastSeg.pos.x - 20 : this.head.pos.x - 25;
      let spawnY = lastSeg ? lastSeg.pos.y : this.head.pos.y;

      // Ancien dernier anneau redevient un anneau de corps
      if (lastSeg) {
        lastSeg.isTail = false;
        lastSeg.r = this.bodyRadius;
      }

      // Nouvel anneau qui devient la nouvelle queue
      let newTail = new SnakeSegment(spawnX, spawnY, this.bodySprite, this.tailSprite, this.bodyRadius * 0.8, true);
      newTail.maxSpeed = this.head.maxSpeed * 1.1;
      newTail.maxForce = this.head.maxForce * 1.2;
      this.anneaux.push(newTail);
    }
  }

  // Déplacement d'Onix vers la cible (souris)
  move(target, slowingRadius = 140, spacing = 28) {
    // 1. La tête applique Arrival sur la position de la souris
    let forceTete = this.head.arrive(target, slowingRadius);
    this.head.applyForce(forceTete);
    this.head.update();

    // Mise à jour de la position globale de l'entité Snake
    this.pos.set(this.head.pos.x, this.head.pos.y);
    this.vel.set(this.head.vel.x, this.head.vel.y);

    // 2. Chaque anneau suit le segment précédent
    for (let i = 0; i < this.anneaux.length; i++) {
      let prev = (i === 0) ? this.head : this.anneaux[i - 1];
      this.anneaux[i].follow(prev, spacing, slowingRadius * 0.75);
    }
  }

  show() {
    // Dessin de la queue vers la tête pour que la tête et les anneaux antérieurs se superposent proprement
    for (let i = this.anneaux.length - 1; i >= 0; i--) {
      this.anneaux[i].show();
    }
    this.head.show();
  }

  // Synchronisation des curseurs de réglages
  setSpeedAndForce(maxSpeed, maxForce) {
    this.head.maxSpeed = maxSpeed;
    this.head.maxForce = maxForce;
    for (let seg of this.anneaux) {
      seg.maxSpeed = maxSpeed * 1.15;
      seg.maxForce = maxForce * 1.25;
    }
  }
}
