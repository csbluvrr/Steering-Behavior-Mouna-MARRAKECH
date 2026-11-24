class Obstacle extends Vehicle {
  constructor(rx, ry, r = 28) {
    super(rx * width, ry * height);
    // Coordonnées normalisées (0..1) pour s'adapter proprement au redimensionnement de l'écran Switch
    this.rx = rx;
    this.ry = ry;
    this.r = r;
    // Règle d'architecture : un obstacle fixe est un Vehicle avec maxSpeed = 0
    this.maxSpeed = 0;
    this.maxForce = 0;
    this.vel.set(0, 0);
    this.pulseOffset = random(TWO_PI);
  }

  // Recalcule la position réelle lorsque la fenêtre est redimensionnée
  syncPosition() {
    this.pos.set(this.rx * width, this.ry * height);
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);

    // Halo d'alerte discret façon cristal cosmique
    let pulse = 1 + sin(frameCount * 0.06 + this.pulseOffset) * 0.08;
    noFill();
    stroke(255, 77, 109, 110);
    strokeWeight(2.5);
    circle(0, 0, this.r * 2.25 * pulse);

    // Ombre portée cartoon
    noStroke();
    fill(45, 23, 76, 150);
    circle(3, 4, this.r * 2);

    // Corps rocheux / astéroïde violet-lavande assorti au thème Switch
    stroke("#2d174c");
    strokeWeight(3);
    fill("#6d4c9f");
    circle(0, 0, this.r * 2);

    // Facettes / cratères kawaii
    noStroke();
    fill("#9b72e8");
    ellipse(-this.r * 0.28, -this.r * 0.25, this.r * 0.65, this.r * 0.45);

    fill("#4c2a85");
    circle(this.r * 0.3, this.r * 0.25, this.r * 0.45);
    circle(-this.r * 0.25, this.r * 0.35, this.r * 0.28);

    // Petit reflet brillant
    fill(255, 255, 255, 190);
    circle(-this.r * 0.35, -this.r * 0.35, this.r * 0.22);

    pop();

    if (Vehicle.debug) {
      push();
      noFill();
      stroke("#ff4d6d");
      strokeWeight(1.5);
      drawingContext.setLineDash([4, 4]);
      circle(this.pos.x, this.pos.y, (this.r + 35) * 2);
      drawingContext.setLineDash([]);
      pop();
    }
  }
}
