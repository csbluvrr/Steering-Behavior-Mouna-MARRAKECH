let pursuer1;
let target;
let obstacles = [];
let vehicules = [];
let controls;

const avoidanceSettings = {
  mode: "separation", // "separation" | "vehiclesAsObstacles"
  separationWeight: 0.5,
  maxForce: 0.2,
  rayCount: 1,
  raySpreadDeg: 100,
  dangerZoneSideScale: 1.0
};

function setup() {
  createCanvas(windowWidth, windowHeight);

  pursuer1 = new Vehicle(100, 100);
  vehicules.push(pursuer1);

  obstacles.push(new Obstacle(width / 2, height / 2, 100, "green"));

  controls = createControls();
  applyAvoidanceSettings();
}

function draw() {
  background(0, 0, 0, 100);

  target = createVector(mouseX, mouseY);

  push();
  fill(255, 0, 0);
  noStroke();
  circle(target.x, target.y, 32);
  pop();

  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].show();
  }

  for (let i = 0; i < vehicules.length; i++) {
    const v = vehicules[i];
    v.applyBehaviors(target, obstacles, vehicules);
    v.update();
    v.show();
  }
}

function createControls() {
  const panel = createDiv();
  panel.addClass("controls");

  const header = createDiv();
  header.addClass("controls__header");
  header.parent(panel);

  const title = createElement("h1", "Évitement d'obstacles");
  title.parent(header);

  const toggleButton = createButton("Masquer");
  toggleButton.addClass("controls__toggle");
  toggleButton.attribute("aria-expanded", "true");
  toggleButton.parent(header);

  const content = createDiv();
  content.addClass("controls__content");
  content.parent(panel);

  toggleButton.mousePressed(() => {
    const isOpen = !panel.elt.classList.toggle("controls--collapsed");
    toggleButton.html(isOpen ? "Masquer" : "Afficher");
    toggleButton.attribute("aria-expanded", String(isOpen));
  });

  // Bouton toggle des 2 modes d'évitement
  const modeButton = createButton(getModeButtonLabel());
  modeButton.addClass("controls__mode-btn");
  modeButton.parent(content);

  // Curseur de séparation (actif en mode 1)
  const sepRow = createSliderControl(
    content,
    "Poids séparation",
    0,
    3,
    avoidanceSettings.separationWeight,
    0.05,
    (value) => {
      avoidanceSettings.separationWeight = value;
      applyAvoidanceSettings();
    }
  );

  modeButton.mousePressed(() => {
    avoidanceSettings.mode =
      avoidanceSettings.mode === "separation" ? "vehiclesAsObstacles" : "separation";
    modeButton.html(getModeButtonLabel());
    modeButton.elt.classList.toggle(
      "controls__mode-btn--alt",
      avoidanceSettings.mode === "vehiclesAsObstacles"
    );
    sepRow.row.elt.classList.toggle(
      "controls__row--disabled",
      avoidanceSettings.mode === "vehiclesAsObstacles"
    );
    applyAvoidanceSettings();
  });

  // Curseur de force maximale du vaisseau
  createSliderControl(
    content,
    "Force max",
    0.05,
    1.5,
    avoidanceSettings.maxForce,
    0.05,
    (value) => {
      avoidanceSettings.maxForce = value;
      applyAvoidanceSettings();
    }
  );

  // Menu déroulant : nombre de rayons impairs (défaut = 1)
  const rayRow = createDiv();
  rayRow.addClass("controls__row controls__row--select");
  rayRow.parent(content);

  const rayLabel = createElement("label", "Nombre de rayons");
  rayLabel.parent(rayRow);

  const raySelect = createSelect();
  raySelect.addClass("controls__select");
  [1, 3, 5, 7, 9, 11, 13].forEach((n) => {
    raySelect.option(n === 1 ? "1 rayon (défaut)" : `${n} rayons`, String(n));
  });
  raySelect.selected(String(avoidanceSettings.rayCount));
  raySelect.parent(rayRow);

  // Curseur d'amplitude de vue en degrés (10° à 360°)
  const fovRow = createSliderControl(
    content,
    "Amplitude vue (°)",
    10,
    360,
    avoidanceSettings.raySpreadDeg,
    5,
    (value) => {
      avoidanceSettings.raySpreadDeg = value;
      applyAvoidanceSettings();
    },
    (value) => `${Math.round(value)}°`
  );
  fovRow.row.elt.classList.toggle(
    "controls__row--disabled",
    avoidanceSettings.rayCount === 1
  );

  // Curseur de largeur latérale du polygone de zone critique
  const sideScaleRow = createSliderControl(
    content,
    "Largeur zone côtés",
    0.2,
    1.5,
    avoidanceSettings.dangerZoneSideScale,
    0.05,
    (value) => {
      avoidanceSettings.dangerZoneSideScale = value;
      applyAvoidanceSettings();
    },
    (value) => `${Math.round(value * 100)}%`
  );
  sideScaleRow.row.elt.classList.toggle(
    "controls__row--disabled",
    avoidanceSettings.rayCount === 1
  );

  raySelect.changed(() => {
    avoidanceSettings.rayCount = Number(raySelect.value());
    const singleRay = avoidanceSettings.rayCount === 1;
    fovRow.row.elt.classList.toggle("controls__row--disabled", singleRay);
    sideScaleRow.row.elt.classList.toggle("controls__row--disabled", singleRay);
    applyAvoidanceSettings();
  });

  // Actions rapides
  const actionsRow = createDiv();
  actionsRow.addClass("controls__actions");
  actionsRow.parent(content);

  const addFleetBtn = createButton("+ 10 vaisseaux (F)");
  addFleetBtn.addClass("controls__toggle");
  addFleetBtn.parent(actionsRow);
  addFleetBtn.mousePressed(() => spawnFleet(10));

  const clearObsBtn = createButton("Réinitialiser obstacles");
  clearObsBtn.addClass("controls__toggle");
  clearObsBtn.parent(actionsRow);
  clearObsBtn.mousePressed(() => {
    obstacles = [new Obstacle(width / 2, height / 2, 100, "green")];
  });

  const debugCheckbox = createCheckbox("Mode Debug (touche D)", false);
  debugCheckbox.addClass("controls__checkbox");
  debugCheckbox.parent(content);
  debugCheckbox.changed(() => {
    Vehicle.debug = debugCheckbox.checked();
  });

  const hint = createElement(
    "p",
    "Clic : ajouter obstacle · V : +1 vaisseau · F : +10 vaisseaux · D : debug"
  );
  hint.addClass("controls__hint");
  hint.parent(content);

  return {
    modeButton,
    raySelect,
    debugCheckbox
  };
}

function getModeButtonLabel() {
  return avoidanceSettings.mode === "separation"
    ? "Mode 1 : Séparation entre vaisseaux"
    : "Mode 2 : Vaisseaux = Obstacles";
}

function createSliderControl(
  parent,
  labelText,
  min,
  max,
  initial,
  step,
  onInput,
  formatValue = (v) => Number(v).toFixed(2)
) {
  const row = createDiv();
  row.addClass("controls__row");
  row.parent(parent);

  const label = createElement("label", labelText);
  label.parent(row);

  const slider = createSlider(min, max, initial, step);
  slider.parent(row);

  const valueDisplay = createSpan(formatValue(initial));
  valueDisplay.addClass("controls__value");
  valueDisplay.parent(row);

  slider.input(() => {
    const value = Number(slider.value());
    valueDisplay.html(formatValue(value));
    onInput(value);
  });

  return { row, slider, valueDisplay };
}

function applyAvoidanceSettings() {
  for (let i = 0; i < vehicules.length; i++) {
    const v = vehicules[i];
    v.avoidanceMode = avoidanceSettings.mode;
    v.separationWeight = avoidanceSettings.separationWeight;
    v.maxForce = avoidanceSettings.maxForce;
    v.rayCount = avoidanceSettings.rayCount;
    v.raySpreadDeg = avoidanceSettings.raySpreadDeg;
    v.dangerZoneSideScale = avoidanceSettings.dangerZoneSideScale;
  }
}

function spawnVehicle(x, y, initialVel = null) {
  const v = new Vehicle(x, y);
  if (initialVel) {
    v.vel = initialVel;
  }
  v.avoidanceMode = avoidanceSettings.mode;
  v.separationWeight = avoidanceSettings.separationWeight;
  v.maxForce = avoidanceSettings.maxForce;
  v.rayCount = avoidanceSettings.rayCount;
  v.raySpreadDeg = avoidanceSettings.raySpreadDeg;
  v.dangerZoneSideScale = avoidanceSettings.dangerZoneSideScale;
  vehicules.push(v);
  return v;
}

function spawnFleet(count = 10) {
  for (let i = 0; i < count; i++) {
    spawnVehicle(20, 300, createVector(random(1, 5), random(-2, 2)));
  }
}

function mousePressed(event) {
  if (event?.target?.closest?.(".controls")) {
    return;
  }
  obstacles.push(new Obstacle(mouseX, mouseY, random(20, 100), "green"));
}

function keyPressed() {
  const pressed = key.toLowerCase();
  if (pressed === "v") {
    spawnVehicle(random(width), random(height));
  } else if (pressed === "d") {
    Vehicle.debug = !Vehicle.debug;
    if (controls?.debugCheckbox) {
      controls.debugCheckbox.checked(Vehicle.debug);
    }
  } else if (pressed === "f") {
    spawnFleet(10);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
