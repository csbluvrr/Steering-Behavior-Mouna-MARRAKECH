let pursuer;
let target;
let particles = [];
let comicBooms = [];

// État du jeu ('PLAYING' ou 'GAMEOVER')
let gameState = 'PLAYING';
let gameOverTimer = 0;

// Sliders et contrôles d'interface utilisateur
let vitesseSeekerSlider, forceSeekerSlider;
let vitesseEvaderSlider, forceEvaderSlider;
let predictionSlider, champVisionSlider;
let debugCheckbox;
let uiContainer;

// Labels d'affichage dynamique
let labelVitesseSeeker, labelForceSeeker;
let labelVitesseEvader, labelForceEvader;
let labelPrediction, labelChampVision;

// Sprites d'animation (Ressources 2)
let gengarNormalImg, gengarSeekingImg;
let scorbunnyNormalImg, scorbunnyEvadingImg;
let seekBgImg;

function preload() {
  // Chargement des sprites haute résolution de ressources 2
  gengarNormalImg = loadImage('./ressources 2/gengar normal.png');
  gengarSeekingImg = loadImage('./ressources 2/gengar seeking.png');
  scorbunnyNormalImg = loadImage('./ressources 2/scorbunny normal.png');
  scorbunnyEvadingImg = loadImage('./ressources 2/scorbunny evading.png');
  seekBgImg = loadImage('../ressources/seekbackground.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Construction de l'interface graphique de contrôle
  creerInterfaceUtilisateur();

  // Initialisation des entités
  reinitialiserJeu();
}

function creerInterfaceUtilisateur() {
  uiContainer = createDiv();
  uiContainer.position(15, 12);
  uiContainer.style('display', 'flex');
  uiContainer.style('flex-direction', 'column');
  uiContainer.style('gap', '8px');
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

  // LIGNE 1 : Paramètres de Gengar (Seeker)
  let row1 = createDiv();
  row1.parent(uiContainer);
  row1.style('display', 'flex');
  row1.style('flex-wrap', 'wrap');
  row1.style('align-items', 'center');
  row1.style('gap', '14px');

  let title1 = createSpan('<b>👻 GENGAR (Seeker) :</b>');
  title1.parent(row1);
  title1.style('color', '#c084fc');

  let g1 = createDiv(); g1.parent(row1);
  labelVitesseSeeker = createSpan('Vitesse : 8 '); labelVitesseSeeker.parent(g1);
  vitesseSeekerSlider = createSlider(2, 25, 8, 1); vitesseSeekerSlider.parent(g1);
  vitesseSeekerSlider.style('vertical-align', 'middle');

  let g2 = createDiv(); g2.parent(row1);
  labelForceSeeker = createSpan('Force Max : 0.35 '); labelForceSeeker.parent(g2);
  forceSeekerSlider = createSlider(0.05, 1.5, 0.35, 0.01); forceSeekerSlider.parent(g2);
  forceSeekerSlider.style('vertical-align', 'middle');

  // LIGNE 2 : Paramètres de Scorbunny (Evader)
  let row2 = createDiv();
  row2.parent(uiContainer);
  row2.style('display', 'flex');
  row2.style('flex-wrap', 'wrap');
  row2.style('align-items', 'center');
  row2.style('gap', '14px');

  let title2 = createSpan('<b>🐰 SCORBUNNY (Evader) :</b>');
  title2.parent(row2);
  title2.style('color', '#fb923c');

  let e1 = createDiv(); e1.parent(row2);
  labelVitesseEvader = createSpan('Vitesse : 7 '); labelVitesseEvader.parent(e1);
  vitesseEvaderSlider = createSlider(2, 22, 7, 1); vitesseEvaderSlider.parent(e1);
  vitesseEvaderSlider.style('vertical-align', 'middle');

  let e2 = createDiv(); e2.parent(row2);
  labelForceEvader = createSpan('Force Max : 0.40 '); labelForceEvader.parent(e2);
  forceEvaderSlider = createSlider(0.05, 1.5, 0.40, 0.01); forceEvaderSlider.parent(e2);
  forceEvaderSlider.style('vertical-align', 'middle');

  // LIGNE 3 : Paramètres de Poursuite & Champ de Vision
  let row3 = createDiv();
  row3.parent(uiContainer);
  row3.style('display', 'flex');
  row3.style('flex-wrap', 'wrap');
  row3.style('align-items', 'center');
  row3.style('gap', '16px');

  let p1 = createDiv(); p1.parent(row3);
  labelPrediction = createSpan('Prédiction (T) : 12 frames '); labelPrediction.parent(p1);
  predictionSlider = createSlider(2, 30, 12, 1); predictionSlider.parent(p1);
  predictionSlider.style('vertical-align', 'middle');

  let p2 = createDiv(); p2.parent(row3);
  labelChampVision = createSpan('Champ de Vision : 220px '); labelChampVision.parent(p2);
  champVisionSlider = createSlider(50, 450, 220, 10); champVisionSlider.parent(p2);
  champVisionSlider.style('vertical-align', 'middle');

  debugCheckbox = createCheckbox(' Mode Débogage (Forces, Prédiction, Champs de Vision) [Touche D]', false);
  debugCheckbox.parent(row3);
  debugCheckbox.style('cursor', 'pointer');
  debugCheckbox.style('accent-color', '#00ff88');
  debugCheckbox.changed(() => {
    Vehicle.debug = debugCheckbox.checked();
  });
}

// Initialise ou réinitialise la partie
function reinitialiserJeu() {
  gameState = 'PLAYING';
  particles = [];
  comicBooms = [];

  // Création du Seeker (Gengar)
  pursuer = new Vehicle(random(100, width - 100), random(100, height - 100), gengarNormalImg, gengarSeekingImg);
  pursuer.r = 45;

  // Création de l'Evader (Scorbunny) placé à bonne distance de départ
  let startX = random(100, width - 100);
  let startY = random(100, height - 100);
  while (dist(startX, startY, pursuer.pos.x, pursuer.pos.y) < 300) {
    startX = random(100, width - 100);
    startY = random(100, height - 100);
  }
  target = new Target(startX, startY, scorbunnyNormalImg, scorbunnyEvadingImg);
  target.r = 38;
}

function draw() {
  // Arrière-plan
  image(seekBgImg, 0, 0, width, height);

  // Synchronisation des sliders
  let vSeeker = vitesseSeekerSlider.value();
  let fSeeker = forceSeekerSlider.value();
  let vEvader = vitesseEvaderSlider.value();
  let fEvader = forceEvaderSlider.value();
  let tPrediction = predictionSlider.value();
  let champVision = champVisionSlider.value();

  labelVitesseSeeker.html('Vitesse : ' + vSeeker + ' ');
  labelForceSeeker.html('Force Max : ' + Number(fSeeker).toFixed(2) + ' ');
  labelVitesseEvader.html('Vitesse : ' + vEvader + ' ');
  labelForceEvader.html('Force Max : ' + Number(fEvader).toFixed(2) + ' ');
  labelPrediction.html('Prédiction (T) : ' + tPrediction + ' frames ');
  labelChampVision.html('Champ de Vision : ' + champVision + 'px ');

  pursuer.maxSpeed = vSeeker;
  pursuer.maxForce = fSeeker;
  pursuer.champDeVision = champVision;

  target.maxSpeed = vEvader;
  target.maxForce = fEvader;
  target.champDeVision = champVision;

  if (gameState === 'PLAYING') {
    // Calcul de la distance entre Gengar et Scorbunny
    let d = p5.Vector.dist(pursuer.pos, target.pos);

    // 1. Détection par Gengar (Seeker)
    if (d < pursuer.champDeVision) {
      // Gengar détecte Scorbunny : passage en mode seeking (sprite agressif)
      pursuer.isSeeking = true;
      // Application de la poursuite avec anticipation (Pursuit de Craig Reynolds)
      let pursueForce = pursuer.pursue(target, tPrediction);
      pursuer.applyForce(pursueForce);
    } else {
      // Hors champ de vision : Gengar patrouille / drift calmement avec sprite normal
      pursuer.isSeeking = false;
      pursuer.vel.mult(0.985);
    }

    // 2. Détection par Scorbunny (Evader)
    if (d < target.champDeVision) {
      // Scorbunny repère Gengar : passage en mode evading (sprite de panique)
      target.isEvading = true;
      // Application de l'évasion prédictive (Evade de Craig Reynolds)
      let evadeForce = target.evade(pursuer, tPrediction);
      target.applyForce(evadeForce);
    } else {
      // Hors danger : Scorbunny se déplace normalement avec sprite standard
      target.isEvading = false;
    }

    // Déplacement des entités
    pursuer.update();
    target.update();

    // Rendu graphique
    pursuer.show();
    target.show();

    // 3. Détection de capture : Gengar attrape Scorbunny
    if (d < (pursuer.r + target.r) * 0.75) {
      // Explosion au point de contact
      creerExplosion(target.pos.x, target.pos.y);
      gameState = 'GAMEOVER';
      gameOverTimer = 180; // 3 secondes à 60 FPS avant redémarrage automatique
    }
  }

  // Rendu des particules et onomatopées
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.update();
    p.show();
    if (p.isDead) particles.splice(i, 1);
  }

  for (let i = comicBooms.length - 1; i >= 0; i--) {
    let boom = comicBooms[i];
    boom.update();
    boom.show();
    if (boom.isDead) comicBooms.splice(i, 1);
  }

  // Écran de GAME OVER si Scorbunny a été intercepté
  if (gameState === 'GAMEOVER') {
    dessinerEcranGameOver();
    gameOverTimer--;
    if (gameOverTimer <= 0) {
      reinitialiserJeu();
    }
  }

  // Légende en mode débug
  if (Vehicle.debug) {
    drawDebugLegend();
  }
}

// Dessin de l'écran de Game Over
function dessinerEcranGameOver() {
  push();
  fill(0, 0, 0, 160);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  textFont('Impact, "Arial Black", sans-serif');

  // Titre principal GAME OVER
  fill("#ef4444");
  stroke(0);
  strokeWeight(6);
  textSize(64);
  text("GAME OVER !", width / 2, height / 2 - 40);

  // Sous-titre
  fill("#facc15");
  stroke(0);
  strokeWeight(4);
  textSize(28);
  text("Gengar a intercepté Scorbunny !", width / 2, height / 2 + 20);

  // Compteur avant redémarrage
  let secondesRestantes = Math.ceil(gameOverTimer / 60);
  fill(255);
  noStroke();
  textFont('sans-serif');
  textSize(16);
  text("Redémarrage automatique dans " + secondesRestantes + "s... (ou appuyez sur ESPACE)", width / 2, height / 2 + 70);
  pop();
}

// Génère une explosion de particules, une onomatopée comics et un son mignon de pop
function creerExplosion(x, y) {
  for (let i = 0; i < 40; i++) {
    particles.push(new Particle(x, y));
  }
  comicBooms.push(new ComicBoom(x, y));
  jouerSonPopMignon();
}

// Synthétiseur audio Web Audio API pour le son de pop cartoon
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
    let baseFreq = 500 + Math.random() * 200;
    osc.frequency.setValueAtTime(baseFreq * 1.8, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.35, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch (e) {}
}

// Légende du mode débug
function drawDebugLegend() {
  push();
  let legendY = height - 105;
  fill(10, 14, 24, 210);
  noStroke();
  rect(15, legendY - 10, 380, 100, 8);

  strokeWeight(2.5);
  // Rouge = Vitesse
  stroke("red"); line(25, legendY + 5, 50, legendY + 5);
  noStroke(); fill("white"); textSize(11);
  text("🔴 Rouge : Vecteurs Vitesse", 58, legendY + 9);

  // Vert = Point d'anticipation Pursuit
  stroke("#00ff88"); fill("#00ff88");
  circle(37, legendY + 25, 10);
  noStroke(); fill("white");
  text("🟢 Cercle Vert : Point d'interception futur de Gengar (Pursuit)", 58, legendY + 29);

  // Orange = Point de danger Evade
  stroke("#ff8c00"); fill("#ff8c00");
  circle(37, legendY + 45, 10);
  noStroke(); fill("white");
  text("🟠 Cercle Orange : Point futur esquivé par Scorbunny (Evade)", 58, legendY + 49);

  // Cercles de vision
  noFill(); stroke("rgba(0, 255, 136, 0.7)");
  circle(37, legendY + 68, 14);
  noStroke(); fill("white");
  text("Cercle Vert = Champ de vision Gengar | Cercle Jaune = Scorbunny", 58, legendY + 71);
  pop();
}

function keyPressed() {
  if (key === 'd' || key === 'D') {
    Vehicle.debug = !Vehicle.debug;
    debugCheckbox.checked(Vehicle.debug);
  }

  // Touche ESPACE pour relancer immédiatement lors du Game Over
  if (key === ' ' && gameState === 'GAMEOVER') {
    reinitialiserJeu();
  }
}

function mousePressed() {
  // Clic pour relancer si on est en Game Over
  if (gameState === 'GAMEOVER') {
    reinitialiserJeu();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
