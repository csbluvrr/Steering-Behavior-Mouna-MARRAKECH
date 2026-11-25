// Path Following (Complex Path)
// The Nature of Code
// The Coding Train / Daniel Shiffman
// https://youtu.be/LrnR6dc2IfM
// https://thecodingtrain.com/learning/nature-of-code/5.7-path-following.html

// Path Following: https://editor.p5js.org/codingtrain/sketches/dqM054vBV
// Complex Path: https://editor.p5js.org/codingtrain/sketches/2FFzvxwVt

// Crowd Path Following
// Via Reynolds: http://www.red3d.com/cwr/steer/CrowdPath.html

// Pour debug on/off affichage des lignes etc.
let debug = false;

// le chemin
let path;

// Tableau des véhicules
let vehicles = [];
let snakes = [];
let snakeFollowWeight = 2;
let snakeSeparationWeight = 1.2;
let circuitWidth = 20;
let circuitComplexity = 3;
let snakeSpacing = 20;
let snakeSize = 22;
let entitySpacing = 24;

function setup() {
  createCanvas(windowWidth, windowHeight);
  // la fonction suivante créer un chemin composé de plusieurs points
  newPath();

  // On crée n véhicules placés aléatoirement sur le canvas
  const nbVehicules = 1;

  for (let i = 0; i < nbVehicules; i++) {
    newVehicle(random(width), random(height));
  }
  newSnake(path.points[0].x, path.points[0].y);
  bindSnakeControls();
}

function draw() {
  background(240);
  // Affichage du chemin
  path.display();

  const allSegments = snakes.flatMap(snake => snake.anneaux);
  const neighbors = [...vehicles, ...allSegments];
  for (let v of vehicles) {
    // On applique les comportements pour suivre le chemin
    // Comme on utilise ici plusieurs comportements, notamment un comportement qui 
    // dépend des autres véhicules, on passe en paramètre le tableau des véhicules 
    // et le chemin
    v.applyBehaviors(neighbors, path);
    // on a regroupé update, draw etc. dans une méthode run (update, borders, display, etc.)
    v.run();
  }
  for (const snake of snakes) {
    snake.move(path, neighborsForSnake(snake, neighbors));
    snake.show();
  }
}

function neighborsForSnake(snake, allNeighbors) {
  const ownSegments = new Set(snake.anneaux);
  return allNeighbors.filter(vehicle => !ownSegments.has(vehicle));
}

function newSnake(x, y) {
  const snake = new SnakePathFollowing(x, y, 12, snakeSize,
    color(random(40, 200), random(70, 190), random(40, 200)));
  snake.followWeight = snakeFollowWeight;
  snake.separationWeight = snakeSeparationWeight;
  snake.setRingSpacing(snakeSpacing);
  snake.setSize(snakeSize);
  snake.setSeparationDistance(entitySpacing);
  snakes.push(snake);
  document.getElementById('snake-count').value = `${snakes.length} serpent${snakes.length > 1 ? 's' : ''}`;
  return snake;
}

function bindSnakeControls() {
  const synchronize = () => {
    snakeFollowWeight = Number(document.getElementById('snake-follow').value);
    snakeSeparationWeight = Number(document.getElementById('snake-separation').value);
    circuitWidth = Number(document.getElementById('circuit-width').value);
    snakeSpacing = Number(document.getElementById('snake-spacing').value);
    snakeSize = Number(document.getElementById('snake-size').value);
    const entitySpacingEl = document.getElementById('entity-spacing');
    if (entitySpacingEl) {
      entitySpacing = Number(entitySpacingEl.value);
    }
    const complexityEl = document.getElementById('circuit-complexity');
    if (complexityEl) {
      circuitComplexity = Number(complexityEl.value);
    }
    if (path) path.radius = circuitWidth;
    for (const v of vehicles) {
      v.separationDistance = entitySpacing;
    }
    for (const snake of snakes) {
      snake.followWeight = snakeFollowWeight;
      snake.separationWeight = snakeSeparationWeight;
      snake.setRingSpacing(snakeSpacing);
      snake.setSize(snakeSize);
      snake.setSeparationDistance(entitySpacing);
    }
    document.getElementById('snake-follow-value').value = snakeFollowWeight.toFixed(1);
    document.getElementById('snake-separation-value').value = snakeSeparationWeight.toFixed(1);
    document.getElementById('circuit-width-value').value = `${circuitWidth.toFixed(0)} px`;
    document.getElementById('snake-spacing-value').value = `${snakeSpacing.toFixed(0)} px`;
    document.getElementById('snake-size-value').value = `${snakeSize.toFixed(0)} px`;
    const entitySpacingValEl = document.getElementById('entity-spacing-value');
    if (entitySpacingValEl) {
      entitySpacingValEl.value = `${entitySpacing.toFixed(0)} px`;
    }
    const complexityValEl = document.getElementById('circuit-complexity-value');
    if (complexityValEl) {
      complexityValEl.value = String(circuitComplexity);
    }
  };
  for (const id of ['snake-follow', 'snake-separation', 'circuit-width', 'snake-spacing', 'snake-size', 'entity-spacing']) {
    const el = document.getElementById(id);
    if (!el) continue;
    el.addEventListener('input', synchronize);
    el.addEventListener('change', synchronize);
  }

  const complexitySlider = document.getElementById('circuit-complexity');
  if (complexitySlider) {
    const onComplexityInput = () => {
      synchronize();
      newPath(circuitComplexity);
    };
    complexitySlider.addEventListener('input', onComplexityInput);
    complexitySlider.addEventListener('change', onComplexityInput);
  }

  const newPathBtn = document.getElementById('new-path-btn');
  if (newPathBtn) {
    newPathBtn.addEventListener('click', () => {
      newPath(circuitComplexity);
    });
  }

  const addSnakeBtn = document.getElementById('add-snake-btn');
  if (addSnakeBtn) {
    addSnakeBtn.addEventListener('click', () => {
      const startPt = path?.points?.[0];
      const sx = startPt ? startPt.x : width * 0.5;
      const sy = startPt ? startPt.y : height * 0.5;
      newSnake(sx, sy);
    });
  }

  const toggleBtn = document.getElementById('controls-toggle');
  const controlsPanel = document.getElementById('controls');
  if (toggleBtn && controlsPanel) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = !controlsPanel.classList.toggle('controls--collapsed');
      toggleBtn.textContent = isOpen ? 'Masquer' : 'Afficher';
      toggleBtn.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const debugToggle = document.getElementById('debug-toggle');
  if (debugToggle) {
    debugToggle.checked = debug;
    debugToggle.addEventListener('change', () => {
      debug = debugToggle.checked;
      Vehicle.debug = debug;
    });
  }

  synchronize();
}

function newPath(complexity = circuitComplexity) {
  path = new Path();
  path.radius = circuitWidth;

  const level = constrain(Math.round(complexity), 1, 10);
  const nbSegments = 16 + (level - 1) * 5; // 16 à 61 segments selon la complexité
  const angleStep = TWO_PI / nbSegments;

  // Marge garantie pour que tout le circuit (y compris sa largeur) tienne dans l'écran
  const margin = circuitWidth + 36;
  const maxRx = Math.max(80, width * 0.5 - margin);
  const maxRy = Math.max(80, height * 0.5 - margin);
  const cx = width * 0.5;
  const cy = height * 0.5;

  // Harmoniques de forme pour créer chicanes, lobes et virages sans auto-intersection
  const t = (level - 1) / 9; // 0..1
  const amp1 = 0.04 + t * 0.16;
  const amp2 = t * 0.18;
  const amp3 = t * 0.12;
  const freq1 = 2;
  const freq2 = 3 + Math.floor(level / 3);
  const freq3 = 5 + Math.floor(level / 2);
  const phase1 = random(TWO_PI);
  const phase2 = random(TWO_PI);
  const phase3 = random(TWO_PI);
  const jitter = t * 0.05;

  const rawRadii = [];
  let maxRaw = 0;
  for (let i = 0; i < nbSegments; i++) {
    const angle = i * angleStep;
    const r =
      0.78 +
      amp1 * Math.sin(freq1 * angle + phase1) +
      amp2 * Math.sin(freq2 * angle + phase2) +
      amp3 * Math.cos(freq3 * angle + phase3) +
      random(-jitter, jitter);
    const clampedR = Math.max(0.28, r);
    rawRadii.push(clampedR);
    if (clampedR > maxRaw) maxRaw = clampedR;
  }

  // Normalisation pour tenir strictement dans [margin .. width - margin] x [margin .. height - margin]
  const normScale = maxRaw > 0 ? 1 / maxRaw : 1;
  for (let i = 0; i < nbSegments; i++) {
    const angle = i * angleStep;
    const factor = rawRadii[i] * normScale;
    const x = constrain(cx + cos(angle) * maxRx * factor, margin, width - margin);
    const y = constrain(cy + sin(angle) * maxRy * factor, margin, height - margin);
    path.addPoint(x, y);
  }
}

function newVehicle(x, y) {
  let maxspeed = random(1, 3);
  let maxforce = 0.3;
  let v = new Vehicle(x, y, maxspeed, maxforce);
  v.separationDistance = entitySpacing;
  vehicles.push(v);
  return v;
}

function keyPressed(event) {
  if (document.activeElement?.matches('input, select, textarea')) return;
  const pressed = key.toLowerCase();
  if (pressed === "t") {
    if (!event?.repeat) newSnake(constrain(mouseX, 0, width), constrain(mouseY, 0, height));
  } else if (pressed === "d") {
    debug = !debug;
    Vehicle.debug = debug;
    const debugToggle = document.getElementById('debug-toggle');
    if (debugToggle) debugToggle.checked = debug;
  } else if (pressed === "s") {
    let v = newVehicle(mouseX, mouseY);
    v.maxSpeed = 7;
    v.couleur = "red";
  } else if (pressed === "w") {
    // Création d'un véhicule vert avec comportement Wander de Craig Reynolds
    let v = new Vehicle(mouseX, mouseY, 4, 0.2);
    v.wanderWeight = 1;
    v.followPathWeight = 0;
    v.separateWeight = 2;
    v.r = 28;
    v.couleur = "lightgreen";
    vehicles.push(v);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  newPath(circuitComplexity);
}

function mouseDragged(event) {
  if (event?.target?.closest?.('#controls')) return;
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) 
    newVehicle(mouseX, mouseY);
}
