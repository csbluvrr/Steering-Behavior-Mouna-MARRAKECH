let pursuer;
let targets = [];

// Contrôles UI
let vitessePursuerSlider, maxForcePursuerSlider, vitesseTargetsSlider, rayonDetectionSlider;
let labelVitessePursuer, labelMaxForcePursuer, labelVitesseTargets, labelRayonDetection;
let debugCheckbox;
let uiContainer;

// Sprites & Fond
let gengarImg, scorbunnyImg, seekBgImg;

function preload() {
  gengarImg = loadImage('../ressources/Gengar.png');
  scorbunnyImg = loadImage('../ressources/scorbunny.png');
  seekBgImg = loadImage('../ressources/seekbackground.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Initialisation du conteneur d'interface utilisateur en haut à gauche
  uiContainer = createDiv();
  uiContainer.position(20, 15);
  uiContainer.style('display', 'flex');
  uiContainer.style('flex-wrap', 'wrap');
  uiContainer.style('align-items', 'center');
  uiContainer.style('gap', '16px');
  uiContainer.style('background', 'rgba(15, 15, 25, 0.85)');
  uiContainer.style('padding', '10px 18px');
  uiContainer.style('border-radius', '10px');
  uiContainer.style('border', '1px solid rgba(255, 255, 255, 0.2)');
  uiContainer.style('color', 'white');
  uiContainer.style('font-family', 'sans-serif');
  uiContainer.style('font-size', '13px');
  uiContainer.style('z-index', '100');

  // Slider 1 : Vitesse Max du Poursuiveur (Gengar)
  let g1 = createDiv();
  g1.parent(uiContainer);
  labelVitessePursuer = createSpan('Vitesse Gengar : 8 ');
  labelVitessePursuer.parent(g1);
  vitessePursuerSlider = createSlider(1, 20, 8, 1);
  vitessePursuerSlider.parent(g1);
  vitessePursuerSlider.style('vertical-align', 'middle');

  // Slider 2 : Force Max du Poursuiveur
  let g2 = createDiv();
  g2.parent(uiContainer);
  labelMaxForcePursuer = createSpan('Max Force : 0.35 ');
  labelMaxForcePursuer.parent(g2);
  maxForcePursuerSlider = createSlider(0.01, 1.5, 0.35, 0.01);
  maxForcePursuerSlider.parent(g2);
  maxForcePursuerSlider.style('vertical-align', 'middle');

  // Slider 3 : Vitesse Max des Cibles (Scorbunnies)
  let g3 = createDiv();
  g3.parent(uiContainer);
  labelVitesseTargets = createSpan('Vitesse Scorbunny : 6 ');
  labelVitesseTargets.parent(g3);
  vitesseTargetsSlider = createSlider(1, 20, 6, 1);
  vitesseTargetsSlider.parent(g3);
  vitesseTargetsSlider.style('vertical-align', 'middle');

  // Slider 4 : Rayon de Détection / Fuite
  let g4 = createDiv();
  g4.parent(uiContainer);
  labelRayonDetection = createSpan('Rayon Détection : 160 ');
  labelRayonDetection.parent(g4);
  rayonDetectionSlider = createSlider(50, 400, 160, 10);
  rayonDetectionSlider.parent(g4);
  rayonDetectionSlider.style('vertical-align', 'middle');

  // Checkbox Debug
  debugCheckbox = createCheckbox(' Prédiction & Forces [D]', false);
  debugCheckbox.parent(uiContainer);
  debugCheckbox.style('cursor', 'pointer');
  debugCheckbox.style('accent-color', '#00ff88');
  debugCheckbox.changed(() => {
    Vehicle.debug = debugCheckbox.checked();
  });

  // Création du véhicule poursuiveur (Gengar de taille agrandie)
  pursuer = new Vehicle(random(width), random(height), gengarImg);
  pursuer.r = 52;

  // Création d'une troupe de cibles bondissantes (Scorbunnies agrandis)
  creerCibles(6);
}

function creerCibles(nb) {
  for (let i = 0; i < nb; i++) {
    let ball = new BouncingBall(random(width), random(height), scorbunnyImg);
    ball.r = 38;
    targets.push(ball);
  }
}

function draw() {
  // Arrière-plan avec seekbackground
  image(seekBgImg, 0, 0, width, height);

  // Mise à jour des paramètres physiques via les sliders
  let vPursuer = vitessePursuerSlider.value();
  let fPursuer = maxForcePursuerSlider.value();
  let vTargets = vitesseTargetsSlider.value();
  let rDetect = rayonDetectionSlider.value();

  labelVitessePursuer.html('Vitesse Gengar : ' + vPursuer + ' ');
  labelMaxForcePursuer.html('Max Force : ' + Number(fPursuer).toFixed(2) + ' ');
  labelVitesseTargets.html('Vitesse Scorbunny : ' + vTargets + ' ');
  labelRayonDetection.html('Rayon Détection : ' + rDetect + ' ');

  pursuer.maxSpeed = vPursuer;
  pursuer.maxForce = fPursuer;

  // 1. Recherche de la cible la plus proche
  let closestTarget = cibleLaPlusProche(pursuer, targets);

  // 2. Le poursuiveur applique le comportement Pursue (avec anticipation) vers la cible la plus proche
  if (closestTarget) {
    let force = pursuer.pursue(closestTarget);
    pursuer.applyForce(force);
  }

  // Déplacement et affichage du poursuiveur
  pursuer.update();
  pursuer.edges();
  pursuer.show();

  // 3. Déplacement et comportement d'évasion (Evade) pour chaque cible
  for (let i = targets.length - 1; i >= 0; i--) {
    let target = targets[i];
    target.maxSpeed = vTargets;
    target.rayonDetection = rDetect;

    // Calcul de la distance au poursuiveur
    let d = p5.Vector.dist(pursuer.pos, target.pos);

    // Si le poursuiveur entre dans la zone de détection, la cible s'évade avec prédiction
    if (d < target.rayonDetection) {
      let evadeForce = target.evade(pursuer);
      target.applyForce(evadeForce);
    }

    // Détection de capture (quand Gengar attrape Scorbunny)
    if (d < target.r + pursuer.r) {
      // La cible est capturée : on la replace aléatoirement pour continuer la simulation
      target.pos.set(random(width), random(height));
      target.vel = p5.Vector.random2D().mult(vTargets);
    }

    target.update();
    target.show();
  }

  // Légende explicative en mode debug
  if (Vehicle.debug) {
    drawDebugLegend();
  }
}

function drawDebugLegend() {
  push();
  let legendY = height - 70;
  fill(0, 190);
  noStroke();
  rect(20, legendY - 10, 310, 65, 6);

  strokeWeight(3);
  stroke("red");
  line(30, legendY + 5, 55, legendY + 5);
  noStroke();
  fill("white");
  textSize(12);
  text("🔴 Rouge : Vecteur Vitesse", 65, legendY + 9);

  fill("green");
  circle(42, legendY + 23, 10);
  fill("white");
  text("🟢 Point vert : Position future anticipée (Pursue)", 65, legendY + 27);

  fill("orange");
  circle(42, legendY + 41, 10);
  fill("white");
  text("🟠 Point orange : Danger futur anticipé (Evade)", 65, legendY + 45);
  pop();
}

function cibleLaPlusProche(vehicle, targetsList) {
  let cibleProche = null;
  let distanceMin = Infinity;

  for (let target of targetsList) {
    let d = p5.Vector.dist(vehicle.pos, target.pos);
    if (d < distanceMin) {
      distanceMin = d;
      cibleProche = target;
    }
  }

  return cibleProche;
}

// Clic souris pour téléporter le poursuiveur ou ajouter une nouvelle cible avec Shift
function mouseClicked() {
  // Ignorer les clics sur la barre de contrôle
  if (mouseY < 75 && mouseX < 700) return;

  if (keyIsDown(SHIFT)) {
    let newBall = new BouncingBall(mouseX, mouseY, scorbunnyImg);
    newBall.r = 25;
    targets.push(newBall);
  } else {
    pursuer.pos.set(mouseX, mouseY);
  }
}

function keyPressed() {
  if (key === 'd' || key === 'D') {
    Vehicle.debug = !Vehicle.debug;
    debugCheckbox.checked(Vehicle.debug);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
