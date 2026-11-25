class Path {
  constructor() {
    // Rayon arbitraire de 20 (c'est la demi-largeur de la route)
    this.radius = 20;
    this.points = [];
  }

  addPoint(x, y) {
    const point = createVector(x, y);
    this.points.push(point);
  }

  display() {
    push();
    strokeJoin(ROUND);

    // Route grise de largeur 2 * radius
    stroke(175);
    strokeWeight(this.radius * 2);
    noFill();
    beginShape();
    for (const v of this.points) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);

    // Ligne centrale noire
    stroke(0);
    strokeWeight(1);
    noFill();
    beginShape();
    for (const v of this.points) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
    pop();
  }
}
