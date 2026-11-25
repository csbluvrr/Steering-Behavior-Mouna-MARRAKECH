function findProjection(pos, a, b) {
  const v1 = p5.Vector.sub(a, pos);
  const v2 = p5.Vector.sub(b, pos);
  v2.normalize();
  const sp = v1.dot(v2);
  v2.mult(sp);
  v2.add(pos);
  return v2;
}

class Vehicle {
  static debug = false;

  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 4;
    this.maxForce = 0.2;
    this.color = "white";
    this.dureeDeVie = 5;

    this.r_pourDessin = 16;
    this.r = this.r_pourDessin * 3;
    this.largeurZoneEvitementDevantVaisseau = this.r / 2;

    // Paramètres configurables depuis la UI
    this.rayCount = 1;
    this.raySpreadDeg = 100;
    this.dangerZoneSideScale = 1.0;
    this.avoidanceMode = "separation"; // "separation" | "vehiclesAsObstacles"
    this.separationWeight = 0.5;

    this.path = [];
    this.pathMaxLength = 30;
  }

  applyBehaviors(target, obstacles, vehicules = []) {
    const seekForce = this.arrive(target);
    const boundariesForce = this.boundaries(0, 0, width, height, 25);

    let avoidables = obstacles;
    let separateForce = createVector(0, 0);

    if (this.avoidanceMode === "vehiclesAsObstacles") {
      avoidables = [...obstacles];
      for (let i = 0; i < vehicules.length; i++) {
        if (vehicules[i] !== this) {
          avoidables.push(vehicules[i]);
        }
      }
    } else {
      separateForce = this.separate(vehicules);
      separateForce.mult(this.separationWeight);
    }

    const avoidForce = this.avoid(avoidables);

    seekForce.mult(0.25);
    avoidForce.mult(3);
    boundariesForce.mult(3);

    this.applyForce(seekForce);
    this.applyForce(avoidForce);
    this.applyForce(separateForce);
    this.applyForce(boundariesForce);
  }

  getRayAngles() {
    const baseHeading = this.vel.magSq() > 1e-4 ? this.vel.heading() : 0;
    let count = Math.max(1, Math.floor(this.rayCount));
    if (count % 2 === 0) {
      count += 1;
    }
    if (count === 1) {
      return [baseHeading];
    }

    const deg = Math.min(360, Math.max(0, Number(this.raySpreadDeg) || 0));
    const angles = [];
    const half = Math.floor(count / 2);

    if (deg >= 360) {
      // Répartition uniforme sur 360° sans chevauchement, avec un rayon droit devant (k = 0)
      const step = TWO_PI / count;
      for (let k = -half; k <= half; k++) {
        angles.push(baseHeading + k * step);
      }
      return angles;
    }

    const spreadRad = (deg * Math.PI) / 180;
    const halfSpread = spreadRad * 0.5;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      angles.push(baseHeading - halfSpread + t * spreadRad);
    }
    return angles;
  }

  /**
   * Teste si un point est dans la zone de risque réelle du vaisseau :
   * hexagone de rayon r * 1.2 autour du vaisseau OU rectangle devant le vaisseau
   * allant de pos jusqu'au bout du rayon colinéaire à la vitesse.
   */
  isPointInDangerZone(pt, rayLength, heading, rectHalfWidth) {
    const dx = pt.x - this.pos.x;
    const dy = pt.y - this.pos.y;
    const cosH = Math.cos(-heading);
    const sinH = Math.sin(-heading);
    const lx = dx * cosH - dy * sinH;
    const ly = dx * sinH + dy * cosH;

    // 1. Hexagone de rayon r * 1.2 autour du vaisseau (largeur latérale modulée par dangerZoneSideScale)
    const sideScale = Math.max(0.1, Number(this.dangerZoneSideScale) || 1);
    const hexR = this.r * 1.2;
    const apothem = hexR * 0.8660254;
    const absX = Math.abs(lx);
    const absY = Math.abs(ly);
    const normY = absY / sideScale;
    const inHexagon =
      normY <= apothem && 0.8660254 * absX + 0.5 * normY <= apothem;
    if (inHexagon) {
      return true;
    }

    // 2. Rectangle devant le vaisseau jusqu'au bout du rayon colinéaire à vel
    return lx >= 0 && lx <= rayLength && absY <= rectHalfWidth;
  }

  drawDangerZoneDebug(rayLength, heading, rectHalfWidth) {
    const sideScale = Math.max(0.1, Number(this.dangerZoneSideScale) || 1);
    const hexR = this.r * 1.2;
    push();
    translate(this.pos.x, this.pos.y);
    rotate(heading);
    noFill();

    // Hexagone r * 1.2 autour du vaisseau (largeur latérale modulée)
    stroke(0, 255, 200, 190);
    strokeWeight(1.5);
    beginShape();
    for (let k = 0; k < 6; k++) {
      const a = (k * TWO_PI) / 6;
      vertex(Math.cos(a) * hexR, Math.sin(a) * hexR * sideScale);
    }
    endShape(CLOSE);

    // Rectangle devant le vaisseau jusqu'au bout du rayon colinéaire à vel
    stroke(0, 200, 255, 150);
    strokeWeight(1.2);
    rect(0, -rectHalfWidth, rayLength, rectHalfWidth * 2);
    pop();
  }

  avoid(avoidables) {
    const heading = this.vel.magSq() > 1e-4 ? this.vel.heading() : 0;
    const ahead = this.vel.copy().mult(30);
    const ahead2 = this.vel.copy().mult(15);
    const rayLength = ahead.mag();
    const count = Math.max(1, Math.floor(this.rayCount));
    const sideScale = Math.max(0.1, Number(this.dangerZoneSideScale) || 1);
    const rectHalfWidth = this.r * 0.8 * sideScale;

    const pointAuBoutDeAhead = p5.Vector.add(this.pos, ahead);
    const pointAuBoutDeAhead2 = p5.Vector.add(this.pos, ahead2);

    // Construction des rayons : 1 rayon = (pos, ahead2, ahead) ; >1 rayons = éventail à angles égaux
    const rays = [];
    if (count === 1) {
      rays.push({
        pMid: pointAuBoutDeAhead2,
        pFar: pointAuBoutDeAhead,
        isCenter: true,
      });
    } else {
      const angles = this.getRayAngles();
      for (let i = 0; i < angles.length; i++) {
        const a = angles[i];
        const cosA = Math.cos(a);
        const sinA = Math.sin(a);
        rays.push({
          pMid: createVector(
            this.pos.x + cosA * rayLength * 0.5,
            this.pos.y + sinA * rayLength * 0.5
          ),
          pFar: createVector(
            this.pos.x + cosA * rayLength,
            this.pos.y + sinA * rayLength
          ),
          isCenter: Math.abs(a - heading) < 1e-4,
        });
      }
    }

    if (Vehicle.debug) {
      if (count === 1) {
        this.drawVector(this.pos, ahead, "yellow");
        this.drawVector(this.pos, ahead2, "purple");

        push();
        stroke(255, 50);
        strokeWeight(this.largeurZoneEvitementDevantVaisseau * 2);
        line(this.pos.x, this.pos.y, pointAuBoutDeAhead.x, pointAuBoutDeAhead.y);

        noStroke();
        fill("red");
        circle(pointAuBoutDeAhead.x, pointAuBoutDeAhead.y, 10);
        fill("lightblue");
        circle(pointAuBoutDeAhead2.x, pointAuBoutDeAhead2.y, 10);
        pop();
      } else {
        this.drawDangerZoneDebug(rayLength, heading, rectHalfWidth);
        for (let i = 0; i < rays.length; i++) {
          const ray = rays[i];
          push();
          stroke(250, 204, 21, 160);
          strokeWeight(1.5);
          line(this.pos.x, this.pos.y, ray.pFar.x, ray.pFar.y);
          noStroke();
          fill("lightblue");
          circle(ray.pMid.x, ray.pMid.y, 8);
          fill("red");
          circle(ray.pFar.x, ray.pFar.y, 8);
          pop();
        }
        this.drawVector(this.pos, ahead, "yellow");
      }
    }

    if (!avoidables || avoidables.length === 0) {
      return createVector(0, 0);
    }

    // Calcul des distances avec les obstacles / vaisseaux sur les points (pos, pMid, pFar)
    const combinedAvoid = createVector(0, 0);
    let threatCount = 0;

    for (let oIdx = 0; oIdx < avoidables.length; oIdx++) {
      const obs = avoidables[oIdx];
      // Un autre vaisseau a un rayon visuel/collision de this.r * 0.5 (cercle debug de diamètre this.r)
      const obsR = obs instanceof Vehicle ? obs.r * 0.5 : obs.r;
      const threshold = obsR + this.largeurZoneEvitementDevantVaisseau;

      let bestDist = Infinity;
      let closestSample = null;

      // 1) Point pos
      const dSelf = p5.Vector.dist(this.pos, obs.pos);
      if (dSelf < bestDist) {
        bestDist = dSelf;
        closestSample = this.pos;
      }

      // 2) Points ahead2 (50%) et ahead (100%) sur chaque rayon :
      //    éligibles s'ils sont sur le rayon central (en face) OU dans la zone critique
      for (let rIdx = 0; rIdx < rays.length; rIdx++) {
        const ray = rays[rIdx];
        if (
          ray.isCenter ||
          this.isPointInDangerZone(ray.pMid, rayLength, heading, rectHalfWidth)
        ) {
          const dMid = p5.Vector.dist(ray.pMid, obs.pos);
          if (dMid < bestDist) {
            bestDist = dMid;
            closestSample = ray.pMid;
          }
        }
        if (
          ray.isCenter ||
          this.isPointInDangerZone(ray.pFar, rayLength, heading, rectHalfWidth)
        ) {
          const dFar = p5.Vector.dist(ray.pFar, obs.pos);
          if (dFar < bestDist) {
            bestDist = dFar;
            closestSample = ray.pFar;
          }
        }
      }

      if (bestDist >= threshold || !closestSample) {
        continue;
      }

      const distVec = p5.Vector.sub(closestSample, obs.pos);
      if (Vehicle.debug) {
        // Visualiser en jaune la plus petite distance entre l'obstacle et le point le plus proche
        this.drawVector(obs.pos, distVec, "yellow");
      }

      const pushVec = distVec.copy();
      if (pushVec.magSq() < 1e-4) {
        pushVec.set(1, 0).rotate(random(TWO_PI));
      }
      const clearance = Math.max(1, bestDist - obsR * 0.5);
      const weight = threshold / clearance;
      pushVec.normalize().mult(weight);
      combinedAvoid.add(pushVec);
      threatCount += 1;
    }

    if (threatCount === 0 || combinedAvoid.magSq() < 1e-6) {
      return createVector(0, 0);
    }

    combinedAvoid.setMag(this.maxSpeed);
    combinedAvoid.sub(this.vel);
    combinedAvoid.limit(this.maxForce);
    return combinedAvoid;
  }

  boundaries(bx, by, bw, bh, d) {
    let vitesseDesiree = null;

    const xBordGauche = bx + d;
    const xBordDroite = bx + bw - d;
    const yBordHaut = by + d;
    const yBordBas = by + bh - d;

    if (this.pos.x < xBordGauche) {
      vitesseDesiree = createVector(this.maxSpeed, this.vel.y);
    } else if (this.pos.x > xBordDroite) {
      vitesseDesiree = createVector(-this.maxSpeed, this.vel.y);
    }

    if (this.pos.y < yBordHaut) {
      vitesseDesiree = createVector(this.vel.x, this.maxSpeed);
    } else if (this.pos.y > yBordBas) {
      vitesseDesiree = createVector(this.vel.x, -this.maxSpeed);
    }

    if (vitesseDesiree !== null) {
      vitesseDesiree.setMag(this.maxSpeed);
      const force = p5.Vector.sub(vitesseDesiree, this.vel);
      force.limit(this.maxForce);
      return force;
    }

    if (Vehicle.debug) {
      push();
      noFill();
      stroke("white");
      rect(bx, by, bw, bh);
      stroke("red");
      rect(bx + d, by + d, bw - 2 * d, bh - 2 * d);
      pop();
    }

    return createVector(0, 0);
  }

  getObstacleLePlusProche(obstacles) {
    let plusPetiteDistance = Infinity;
    let obstacleLePlusProche = undefined;

    obstacles.forEach((o) => {
      const distance = this.pos.dist(o.pos);
      if (distance < plusPetiteDistance) {
        plusPetiteDistance = distance;
        obstacleLePlusProche = o;
      }
    });

    return obstacleLePlusProche;
  }

  getVehiculeLePlusProche(vehicules) {
    let plusPetiteDistance = Infinity;
    let vehiculeLePlusProche = undefined;

    vehicules.forEach((v) => {
      if (v !== this) {
        const distance = this.pos.dist(v.pos);
        if (distance < plusPetiteDistance) {
          plusPetiteDistance = distance;
          vehiculeLePlusProche = v;
        }
      }
    });

    return vehiculeLePlusProche;
  }

  arrive(target) {
    return this.seek(target, true);
  }

  seek(target, arrival = false) {
    const force = p5.Vector.sub(target, this.pos);
    let desiredSpeed = this.maxSpeed;
    if (arrival) {
      const slowRadius = 100;
      const distance = force.mag();
      if (distance < slowRadius) {
        desiredSpeed = map(distance, 0, slowRadius, 0, this.maxSpeed);
      }
    }
    force.setMag(desiredSpeed);
    force.sub(this.vel);
    force.limit(this.maxForce);
    return force;
  }

  flee(target) {
    return this.seek(target).mult(-1);
  }

  pursue(vehicle) {
    const target = vehicle.pos.copy();
    const prediction = vehicle.vel.copy();
    prediction.mult(10);
    target.add(prediction);
    return this.seek(target);
  }

  evade(vehicle) {
    return this.pursue(vehicle).mult(-1);
  }

  separate(boids) {
    const desiredseparation = this.r;
    const steer = createVector(0, 0, 0);
    let count = 0;

    for (let i = 0; i < boids.length; i++) {
      const other = boids[i];
      if (other === this) continue;
      const dx = this.pos.x - other.pos.x;
      const dy = this.pos.y - other.pos.y;
      const dSq = dx * dx + dy * dy;

      if (dSq > 0 && dSq < desiredseparation * desiredseparation) {
        const d = Math.sqrt(dSq);
        const diff = createVector(dx / d, dy / d);
        diff.div(d);
        steer.add(diff);
        count++;
      }
    }

    if (count > 0) {
      steer.div(count);
    }

    if (steer.magSq() > 0) {
      steer.normalize();
      steer.mult(this.maxSpeed);
      steer.sub(this.vel);
      steer.limit(this.maxForce);
    }
    return steer;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
    this.ajoutePosAuPath();
    this.dureeDeVie -= 0.01;
  }

  ajoutePosAuPath() {
    this.path.push(this.pos.copy());
    if (this.path.length > this.pathMaxLength) {
      this.path.shift();
    }
  }

  show() {
    this.drawPath();
    this.drawVehicle();
  }

  drawVehicle() {
    push();
    stroke(255);
    strokeWeight(2);
    fill(this.color);
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    triangle(
      -this.r_pourDessin,
      -this.r_pourDessin / 2,
      -this.r_pourDessin,
      this.r_pourDessin / 2,
      this.r_pourDessin,
      0
    );
    pop();

    if (Vehicle.debug) {
      push();
      stroke(255, 160);
      noFill();
      circle(this.pos.x, this.pos.y, this.r);
      pop();
    }
  }

  drawPath() {
    push();
    noStroke();
    fill(this.color);
    for (let i = 0; i < this.path.length; i += 5) {
      const p = this.path[i];
      circle(p.x, p.y, 1.5);
    }
    pop();
  }

  drawVector(pos, v, col) {
    push();
    strokeWeight(2.5);
    stroke(col);
    line(pos.x, pos.y, pos.x + v.x, pos.y + v.y);
    const arrowSize = 5;
    translate(pos.x + v.x, pos.y + v.y);
    rotate(v.heading());
    translate(-arrowSize / 2, 0);
    fill(col);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    pop();
  }

  edges() {
    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
    }
  }
}
