class Vehicle {
  static debug = false;

  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 8;
    this.maxForce = 0.35;
    this.r = 30;
    this.rayonZoneDeFreinage = 140;

    // Force calculée pour le rendu débug
    this.currentSteeringForce = createVector(0, 0);
  }

  // Comportement Seek standard de Craig Reynolds
  seek(target) {
    let targetPos = target.pos ? target.pos : target;
    let desiredSpeed = p5.Vector.sub(targetPos, this.pos);
    desiredSpeed.setMag(this.maxSpeed);

    let force = p5.Vector.sub(desiredSpeed, this.vel);
    force.limit(this.maxForce);
    return force;
  }

  // Comportement Flee standard
  flee(target) {
    let targetPos = target.pos ? target.pos : target;
    let desiredSpeed = p5.Vector.sub(this.pos, targetPos);
    desiredSpeed.setMag(this.maxSpeed);

    let force = p5.Vector.sub(desiredSpeed, this.vel);
    force.limit(this.maxForce);
    return force;
  }

  /* 
   Comportement Arrival de Craig Reynolds :
   Vitesse désirée proportionnelle à la distance lorsqu'on pénètre
   dans la zone de freinage (slowingRadius). Décélération douce jusqu'à l'arrêt.
  */
  arrive(target, slowingRadius = 140) {
    let targetPos = target.pos ? target.pos : target;
    let desiredSpeed = p5.Vector.sub(targetPos, this.pos);
    let distance = desiredSpeed.mag();

    if (Vehicle.debug) {
      push();
      noFill();
      stroke("rgba(255, 255, 255, 0.3)");
      strokeWeight(1.5);
      circle(targetPos.x, targetPos.y, slowingRadius * 2);
      pop();
    }

    if (distance < slowingRadius) {
      // Ralentissement progressif linéaire vers 0
      let speed = map(distance, 0, slowingRadius, 0, this.maxSpeed);
      desiredSpeed.setMag(speed);
    } else {
      // Pleine vitesse hors zone de freinage
      desiredSpeed.setMag(this.maxSpeed);
    }

    let force = p5.Vector.sub(desiredSpeed, this.vel);
    force.limit(this.maxForce);
    return force;
  }

  applyForce(force) {
    this.acc.add(force);
    this.currentSteeringForce.set(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    fill(200);
    stroke(0);
    strokeWeight(1.5);
    circle(0, 0, this.r * 2);
    pop();

    if (Vehicle.debug) {
      this.drawVector(this.pos, this.vel, "red", 8);
    }
  }

  drawVector(pos, v, col, scaleFactor = 1) {
    if (!v || (v.x === 0 && v.y === 0)) return;
    push();
    stroke(col);
    strokeWeight(2);
    fill(col);

    let endX = pos.x + v.x * scaleFactor;
    let endY = pos.y + v.y * scaleFactor;

    line(pos.x, pos.y, endX, endY);

    let arrowSize = 6;
    translate(endX, endY);
    rotate(v.heading());
    translate(-arrowSize / 2, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    pop();
  }
}
