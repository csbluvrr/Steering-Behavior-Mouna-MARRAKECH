let vehicles = [];
let targets = [];
let particles = [];
let comicBooms = [];

// Sliders et contrôles d'interface utilisateur
let vitesseMaxSlider, maxForceSlider, accGengarSlider, rayonDetectGengarSlider;
let labelVitesseMax, labelMaxForce, labelAccGengar, labelRayonDetectGengar;

let nbCiblesSlider, rayonDetectTargetSlider, distSecuriteSlider, vitesseFuiteSlider, accFuiteSlider;
let labelNbCibles, labelRayonDetectTarget, labelDistSecurite, labelVitesseFuite, labelAccFuite;

let debugCheckbox;
let uiContainer;

// Assets graphiques
let scorbunnyImg;
let gengarImg;
let seekBgImg;

function preload() {
  scorbunnyImg = loadImage('../ressources/scorbunny.png');
  gengarImg = loadImage('../ressources/Gengar.png');
  seekBgImg = loadImage('../ressources/seekbackground.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Construction du panneau de contrôle d'interface utilisateur
  creerInterfaceUtilisateur();

  // Création initiale des Gengars (vaisseaux chasseurs)
  creerGengars(6);

  // Création initiale des Scorbunnies (cibles autonomes)
  ajusterNombreCibles(6);
}

// Construction de l'interface graphique de contrôle
function creerInterfaceUtilisateur() {
  uiContainer = createDiv();
  uiContainer.position(15, 12);
  uiContainer.style('display', 'flex');
  uiContainer.style('flex-direction', 'column');
  uiContainer.style('gap', '10px');
  uiContainer.style('background', 'rgba(10, 12, 22, 0.90)');
  uiContainer.style('backdrop-filter', 'blur(6px)');
  uiContainer.style('padding', '10px 16px');
  uiContainer.style('border-radius', '10px');
  uiContainer.style('border', '1px solid rgba(255, 255, 255, 0.25)');
  uiContainer.style('box-shadow', '0 6px 20px rgba(0, 0, 0, 0.6)');
  uiContainer.style('color', 'white');
  uiContainer.style('font-family', 'system-ui, sans-serif');
  uiContainer.style('font-size', '12px');
  uiContainer.style('z-index', '100');

  // LIGNE 1 : Contrôles des Gengars (Vaisseaux)
  let rowGengars = createDiv();
  rowGengars.parent(uiContainer);
  rowGengars.style('display', 'flex');
  rowGengars.style('flex-wrap', 'wrap');
  rowGengars.style('align-items', 'center');
  rowGengars.style('gap', '14px');

  let titleGengar = createSpan('<b>👻 GENGARS :</b>');
  titleGengar.parent(rowGengars);
  titleGengar.style('color', '#c084fc');

  // Vitesse Max Gengar
  let g1 = createDiv(); g1.parent(rowGengars);
  labelVitesseMax = createSpan('Vit. Max : 6 '); labelVitesseMax.parent(g1);
  vitesseMaxSlider = createSlider(1, 25, 6, 1); vitesseMaxSlider.parent(g1);
  vitesseMaxSlider.style('vertical-align', 'middle');

  // Force Max Gengar
  let g2 = createDiv(); g2.parent(rowGengars);
  labelMaxForce = createSpan('Force Max : 0.25 '); labelMaxForce.parent(g2);
  maxForceSlider = createSlider(0.01, 1.5, 0.25, 0.01); maxForceSlider.parent(g2);
  maxForceSlider.style('vertical-align', 'middle');

  // Accélération Gengar
  let g3 = createDiv(); g3.parent(rowGengars);
  labelAccGengar = createSpan('Acc. : 1.0x '); labelAccGengar.parent(g3);
  accGengarSlider = createSlider(0.1, 4.0, 1.0, 0.1); accGengarSlider.parent(g3);
  accGengarSlider.style('vertical-align', 'middle');

  // Rayon de Détection Gengar (20 à 200 px)
  let g4 = createDiv(); g4.parent(rowGengars);
  labelRayonDetectGengar = createSpan('Détection : 150px '); labelRayonDetectGengar.parent(g4);
  rayonDetectGengarSlider = createSlider(20, 200, 150, 5); rayonDetectGengarSlider.parent(g4);
  rayonDetectGengarSlider.style('vertical-align', 'middle');

  // LIGNE 2 : Contrôles des Scorbunnies (Cibles)
  let rowTargets = createDiv();
  rowTargets.parent(uiContainer);
  rowTargets.style('display', 'flex');
  rowTargets.style('flex-wrap', 'wrap');
  rowTargets.style('align-items', 'center');
  rowTargets.style('gap', '14px');

  let titleScorbunny = createSpan('<b>🐰 SCORBUNNIES :</b>');
  titleScorbunny.parent(rowTargets);
  titleScorbunny.style('color', '#fb923c');

  // Nombre de cibles (0 à 20)
  let t1 = createDiv(); t1.parent(rowTargets);
  labelNbCibles = createSpan('Nb Cibles : 6 '); labelNbCibles.parent(t1);
  nbCiblesSlider = createSlider(0, 20, 6, 1); nbCiblesSlider.parent(t1);
  nbCiblesSlider.style('vertical-align', 'middle');

  // Rayon de Détection Fuite (100 px par défaut)
  let t2 = createDiv(); t2.parent(rowTargets);
  labelRayonDetectTarget = createSpan('Détection Fuite : 100px '); labelRayonDetectTarget.parent(t2);
  rayonDetectTargetSlider = createSlider(30, 250, 100, 5); rayonDetectTargetSlider.parent(t2);
  rayonDetectTargetSlider.style('vertical-align', 'middle');

  // Distance de Sécurité pour fin de fuite (300 px par défaut)
  let t3 = createDiv(); t3.parent(rowTargets);
  labelDistSecurite = createSpan('Dist. Sécurité : 300px '); labelDistSecurite.parent(t3);
  distSecuriteSlider = createSlider(150, 500, 300, 10); distSecuriteSlider.parent(t3);
  distSecuriteSlider.style('vertical-align', 'middle');

  // Vitesse Max en Fuite
  let t4 = createDiv(); t4.parent(rowTargets);
  labelVitesseFuite = createSpan('Vit. Fuite : 12 '); labelVitesseFuite.parent(t4);
  vitesseFuiteSlider = createSlider(5, 25, 12, 1); vitesseFuiteSlider.parent(t4);
  vitesseFuiteSlider.style('vertical-align', 'middle');

  // Accélération Max en Fuite
  let t5 = createDiv(); t5.parent(rowTargets);
  labelAccFuite = createSpan('Acc. Fuite : 2.5x '); labelAccFuite.parent(t5);
  accFuiteSlider = createSlider(1.0, 5.0, 2.5, 0.1); accFuiteSlider.parent(t5);
  accFuiteSlider.style('vertical-align', 'middle');

  // LIGNE 3 : Options & Mode Débogage
  let rowOptions = createDiv();
  rowOptions.parent(uiContainer);
  rowOptions.style('display', 'flex');
  rowOptions.style('align-items', 'center');
  rowOptions.style('gap', '18px');

  debugCheckbox = createCheckbox(' Mode Débogage (cercles de détection & flèches de forces) [Touche D]', false);
  debugCheckbox.parent(rowOptions);
  debugCheckbox.style('cursor', 'pointer');
  debugCheckbox.style('accent-color', '#00ff88');
  debugCheckbox.changed(() => {
    Vehicle.debug = debugCheckbox.checked();
  });
}

// Instanciation de l'escouade de Gengars
function creerGengars(nb) {
  for (let i = 0; i < nb; i++) {
    let x = random(width);
    let y = random(height);
    let v = new Vehicle(x, y, gengarImg);
    v.r = random(40, 55);
    vehicles.push(v);
  }
}

// Ajuste dynamiquement le nombre de cibles en fonction du slider (0 à 20)
function ajusterNombreCibles(nb) {
  while (targets.length < nb) {
    let x = random(width);
    let y = random(height);
    let t = new Target(x, y, scorbunnyImg);
    targets.push(t);
  }
  while (targets.length > nb) {
    targets.pop();
  }
}

function draw() {
  // Arrière-plan seekbackground
  image(seekBgImg, 0, 0, width, height);

  // Synchronisation des valeurs des curseurs
  let vMaxGengar = vitesseMaxSlider.value();
  let fMaxGengar = maxForceSlider.value();
  let accGengar = accGengarSlider.value();
  let rDetectGengar = rayonDetectGengarSlider.value();

  let nbCibles = nbCiblesSlider.value();
  let rDetectTarget = rayonDetectTargetSlider.value();
  let dSecurite = distSecuriteSlider.value();
  let vFuite = vitesseFuiteSlider.value();
  let aFuite = accFuiteSlider.value();

  // Mise à jour des labels dynamiques
  labelVitesseMax.html('Vit. Max : ' + vMaxGengar + ' ');
  labelMaxForce.html('Force Max : ' + Number(fMaxGengar).toFixed(2) + ' ');
  labelAccGengar.html('Acc. : ' + Number(accGengar).toFixed(1) + 'x ');
  labelRayonDetectGengar.html('Détection : ' + rDetectGengar + 'px ');

  labelNbCibles.html('Nb Cibles : ' + nbCibles + ' ');
  labelRayonDetectTarget.html('Détection Fuite : ' + rDetectTarget + 'px ');
  labelDistSecurite.html('Dist. Sécurité : ' + dSecurite + 'px ');
  labelVitesseFuite.html('Vit. Fuite : ' + vFuite + ' ');
  labelAccFuite.html('Acc. Fuite : ' + Number(aFuite).toFixed(1) + 'x ');

  // Ajustement de la taille de la collection de cibles
  ajusterNombreCibles(nbCibles);

  // 1. Mise à jour et déplacement des Scorbunnies (Cibles)
  for (let target of targets) {
    target.rayonDetection = rDetectTarget;
    target.distanceSecurite = dSecurite;
    target.vitesseFuite = vFuite;
    target.accelerationFuite = aFuite;

    // Détection des Gengars et fuite temporaire si menacé
    target.applyBehaviors(vehicles);
    target.update();
    target.show();
  }

  // 2. Mise à jour et déplacement des Gengars (Chasseurs)
  for (let gengar of vehicles) {
    gengar.maxSpeed = vMaxGengar;
    gengar.maxForce = fMaxGengar;
    gengar.accelerationMultiplier = accGengar;
    gengar.rayonDetection = rDetectGengar;

    // Recherche de la cible la plus proche dans le cercle de détection et seek
    // Si touché (< 5 px), la cible explose et réapparaît à une position aléatoire
    gengar.applyBehaviors(targets);
    gengar.update();
    gengar.edges();
    gengar.show();
  }

  // 3. Mise à jour et rendu des particules d'explosion (sous-classes de Vehicle)
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.update();
    p.show();
    if (p.isDead) {
      particles.splice(i, 1);
    }
  }

  // 4. Mise à jour et rendu des onomatopées cartoon "BOOM!" (sous-classes de Vehicle)
  for (let i = comicBooms.length - 1; i >= 0; i--) {
    let boom = comicBooms[i];
    boom.update();
    boom.show();
    if (boom.isDead) {
      comicBooms.splice(i, 1);
    }
  }

  // 5. Légende explicative affichée en mode debug
  if (Vehicle.debug) {
    drawDebugLegend();
  }
}

// Génère une explosion de particules, une onomatopée comics et un son de pop mignon
function creerExplosion(x, y) {
  // 1. Particules de flammes
  const nbParticules = 35;
  for (let i = 0; i < nbParticules; i++) {
    particles.push(new Particle(x, y));
  }

  // 2. Onomatopée cartoon style comic book
  comicBooms.push(new ComicBoom(x, y));

  // 3. Petit son de pop mignon
  jouerSonPopMignon();
}

// Synthétiseur audio Web Audio API pour produire un son de "pop" mignon
function jouerSonPopMignon() {
  try {
    let ctx = typeof getAudioContext === 'function' ? getAudioContext() : (window.AudioContext ? new AudioContext() : null);
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    let now = ctx.currentTime;
    let osc = ctx.createOscillator();
    let gain = ctx.createGain();

    osc.type = 'sine';
    // Fréquence aiguë qui plonge rapidement (bruit de bulle cartoon)
    let baseFreq = 480 + Math.random() * 200;
    osc.frequency.setValueAtTime(baseFreq * 1.8, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.35, now + 0.08);

    // Enveloppe d'amplitude très courte et dynamique
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch (e) {
    // Silencieux si l'audio n'est pas encore initialisé par l'utilisateur
  }
}

// Légende graphique du mode débogage
function drawDebugLegend() {
  push();
  let legendY = height - 85;
  fill(10, 14, 24, 200);
  noStroke();
  rect(15, legendY - 10, 350, 80, 8);

  strokeWeight(2.5);
  // Rouge = Vitesse
  stroke("red");
  line(25, legendY + 5, 50, legendY + 5);
  noStroke(); fill("white"); textSize(11);
  text("🔴 Rouge : Vecteur Vitesse", 58, legendY + 9);

  // Vert = Force
  stroke("#00ff88");
  line(25, legendY + 22, 50, legendY + 22);
  noStroke(); fill("white");
  text("🟢 Vert : Force de braquage (Seek)", 58, legendY + 26);

  // Cercle vert = Détection Gengar
  noFill(); stroke("rgba(0, 255, 136, 0.7)");
  circle(37, legendY + 41, 14);
  noStroke(); fill("white");
  text("Cercle Vert : Détection Gengar (choisit la cible la + proche)", 58, legendY + 44);

  // Cercle jaune/orange = Détection Scorbunny
  noFill(); stroke("orange");
  circle(37, legendY + 58, 14);
  noStroke(); fill("white");
  text("Cercle Orange : Détection Scorbunny (fuite jusqu'à 300px)", 58, legendY + 61);
  pop();
}

// Clic souris : ajoute une cible à la position de la souris si on ne clique pas sur le HUD
function mouseClicked() {
  if (mouseY < 120 && mouseX < 750) return;

  if (keyIsDown(SHIFT)) {
    // Shift + Clic : téléporte le premier Gengar
    if (vehicles.length > 0) {
      vehicles[0].pos.set(mouseX, mouseY);
    }
  } else {
    // Clic : ajoute un nouveau Scorbunny
    if (targets.length < 20) {
      let t = new Target(mouseX, mouseY, scorbunnyImg);
      targets.push(t);
      nbCiblesSlider.value(targets.length);
    }
  }
}

// Bascule du mode debug avec 'D' ou 'd'
function keyPressed() {
  if (key === 'd' || key === 'D') {
    Vehicle.debug = !Vehicle.debug;
    debugCheckbox.checked(Vehicle.debug);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
