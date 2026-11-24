let pursuer;
let target;
let particles = [];
let trailParticles = [];
let comicBooms = [];

// Système audio synthétique
let gameAudio;
let previousScorbunnyEvading = false;
let screenShake = 0;

// État du jeu ('PLAYING' ou 'GAMEOVER')
let gameState = 'PLAYING';
let gameOverTimer = 0;

// Sliders et contrôles d'interface utilisateur
let vitesseSeekerSlider, forceSeekerSlider;
let vitesseEvaderSlider, forceEvaderSlider;
let predictionSlider, champVisionSlider;
let musicVolSlider, musicToggleBtn;
let debugCheckbox;
let uiContainer;

// Labels d'affichage dynamique
let labelVitesseSeeker, labelForceSeeker;
let labelVitesseEvader, labelForceEvader;
let labelPrediction, labelChampVision;
let labelMusicStatus;

// Sprites d'animation et décor (Ressources 2)
let gengarNormalImg, gengarSeekingImg;
let scorbunnyNormalImg, scorbunnyEvadingImg;
let bgImg;

function preload() {
  const onErr = (name) => (err) => {
    console.warn(`Avertissement : chargement de ${name} ignoré ou non disponible :`, err);
  };

  // Chargement des sprites et du fond d'écran "background 2"
  gengarNormalImg = loadImage('./ressources 2/gengar_normal.png', () => {}, onErr('gengar_normal'));
  gengarSeekingImg = loadImage('./ressources 2/gengar_seeking.png', () => {}, onErr('gengar_seeking'));
  scorbunnyNormalImg = loadImage('./ressources 2/scorbunny_normal.png', () => {}, onErr('scorbunny_normal'));
  scorbunnyEvadingImg = loadImage('./ressources 2/scorbunny_evading.png', () => {}, onErr('scorbunny_evading'));
  bgImg = loadImage('./ressources 2/background_2.jpg', () => {}, onErr('background_2'));
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Initialisation du synthétiseur Web Audio API
  gameAudio = new GameAudio();

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
  uiContainer.style('gap', '7px');
  uiContainer.style('background', 'rgba(10, 12, 22, 0.90)');
  uiContainer.style('backdrop-filter', 'blur(8px)');
  uiContainer.style('padding', '10px 16px');
  uiContainer.style('border-radius', '12px');
  uiContainer.style('border', '1px solid rgba(255, 255, 255, 0.22)');
  uiContainer.style('box-shadow', '0 8px 24px rgba(0, 0, 0, 0.65)');
  uiContainer.style('color', 'white');
  uiContainer.style('font-family', 'system-ui, -apple-system, sans-serif');
  uiContainer.style('font-size', '12px');
  uiContainer.style('z-index', '100');

  // LIGNE 1 : Gengar (Seeker / Vaisseau violet)
  let row1 = createDiv();
  row1.parent(uiContainer);
  row1.style('display', 'flex');
  row1.style('flex-wrap', 'wrap');
  row1.style('align-items', 'center');
  row1.style('gap', '14px');

  let title1 = createSpan('<b>🚀 GENGAR (Seeker) :</b>');
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

  // LIGNE 2 : Scorbunny (Evader / Vaisseau jaune)
  let row2 = createDiv();
  row2.parent(uiContainer);
  row2.style('display', 'flex');
  row2.style('flex-wrap', 'wrap');
  row2.style('align-items', 'center');
  row2.style('gap', '14px');

  let title2 = createSpan('<b>🚀 SCORBUNNY (Evader) :</b>');
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

  // LIGNE 3 : Paramètres Poursuite & Champ de Vision
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

  debugCheckbox = createCheckbox(' Mode Débogage [D]', false);
  debugCheckbox.parent(row3);
  debugCheckbox.style('cursor', 'pointer');
  debugCheckbox.style('accent-color', '#00ff88');
  debugCheckbox.changed(() => {
    Vehicle.debug = debugCheckbox.checked();
  });

  // LIGNE 4 : Contrôles Audio & Musique Synthétique Chiptune
  let row4 = createDiv();
  row4.parent(uiContainer);
  row4.style('display', 'flex');
  row4.style('flex-wrap', 'wrap');
  row4.style('align-items', 'center');
  row4.style('gap', '14px');

  musicToggleBtn = createButton('🎵 Musique Cosmique : DÉMARRER');
  musicToggleBtn.parent(row4);
  musicToggleBtn.style('background', '#7c3aed');
  musicToggleBtn.style('color', '#ffffff');
  musicToggleBtn.style('border', 'none');
  musicToggleBtn.style('padding', '4px 10px');
  musicToggleBtn.style('border-radius', '6px');
  musicToggleBtn.style('cursor', 'pointer');
  musicToggleBtn.style('font-weight', 'bold');
  musicToggleBtn.mousePressed(() => {
    let isPlaying = gameAudio.toggleBGM();
    mettreAJourBoutonMusique(isPlaying);
  });

  let m1 = createDiv(); m1.parent(row4);
  let lblVol = createSpan('Volume BGM : '); lblVol.parent(m1);
  musicVolSlider = createSlider(0, 1, 0.22, 0.02); musicVolSlider.parent(m1);
  musicVolSlider.style('vertical-align', 'middle');
  musicVolSlider.input(() => {
    gameAudio.musicVolume = musicVolSlider.value();
  });

  labelMusicStatus = createSpan('<i style="color:#a78bfa;">(Cliquez sur l\'écran pour activer le son)</i>');
  labelMusicStatus.parent(row4);
}

function mettreAJourBoutonMusique(isPlaying) {
  if (isPlaying) {
    musicToggleBtn.html('🔊 Musique : EN COURS');
    musicToggleBtn.style('background', '#059669');
    labelMusicStatus.html('<span style="color:#34d399;">Synth BGM active</span>');
  } else {
    musicToggleBtn.html('🔇 Musique : COUPÉE');
    musicToggleBtn.style('background', '#4b5563');
    labelMusicStatus.html('<span style="color:#9ca3af;">Musique en pause</span>');
  }
}

// Initialise ou réinitialise la partie
function reinitialiserJeu() {
  gameState = 'PLAYING';
  particles = [];
  trailParticles = [];
  comicBooms = [];
  screenShake = 0;
  previousScorbunnyEvading = false;

  // Création du Seeker (Gengar)
  pursuer = new Vehicle(random(120, width - 120), random(120, height - 120), gengarNormalImg, gengarSeekingImg);
  pursuer.r = 45;

  // Création de l'Evader (Scorbunny) placé à distance respectable
  let startX = random(120, width - 120);
  let startY = random(120, height - 120);
  while (dist(startX, startY, pursuer.pos.x, pursuer.pos.y) < 320) {
    startX = random(120, width - 120);
    startY = random(120, height - 120);
  }
  target = new Target(startX, startY, scorbunnyNormalImg, scorbunnyEvadingImg);
  target.r = 38;
}

function draw() {
  // Application du tremblement d'écran (Screen Shake) au monde de jeu
  push();
  if (screenShake > 0) {
    translate(random(-screenShake, screenShake), random(-screenShake, screenShake));
    screenShake *= 0.88;
    if (screenShake < 0.4) screenShake = 0;
  }

  // 1. Fond d'écran : Image background 2
  if (bgImg && bgImg.width > 0) {
    image(bgImg, 0, 0, width, height);
  } else {
    background(14, 16, 28);
  }

  // Synchronisation dynamique des sliders
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
    let d = p5.Vector.dist(pursuer.pos, target.pos);

    // 1. Détection par Gengar (Seeker)
    if (d < pursuer.champDeVision) {
      pursuer.isSeeking = true;
      let pursueForce = pursuer.pursue(target, tPrediction);
      pursuer.applyForce(pursueForce);
    } else {
      pursuer.isSeeking = false;
      pursuer.vel.mult(0.985);
    }

    // 2. Détection par Scorbunny (Evader)
    if (d < target.champDeVision) {
      target.isEvading = true;

      // Déclenchement d'un son de PANIQUE quand Scorbunny détecte Gengar
      if (!previousScorbunnyEvading) {
        gameAudio.playPanicSound();
      }

      let evadeForce = target.evade(pursuer, tPrediction);
      target.applyForce(evadeForce);
    } else {
      target.isEvading = false;
    }
    previousScorbunnyEvading = target.isEvading;

    // Déplacement des entités
    pursuer.update();
    target.update();

    // 3. Traînées de propulseur de vaisseau spatial
    // Vaisseau de Gengar : Traînée violette spectrale
    if (pursuer.vel.mag() > 0.4) {
      let emitCount = pursuer.isSeeking ? 3 : 1;
      let backOffset = pursuer.vel.copy().normalize().mult(-pursuer.r * 0.75);
      for (let k = 0; k < emitCount; k++) {
        let spawnPos = p5.Vector.add(pursuer.pos, backOffset);
        spawnPos.add(p5.Vector.random2D().mult(random(2, 7)));
        trailParticles.push(new TrailParticle(spawnPos.x, spawnPos.y, '#c084fc', true));
      }
    }

    // Vaisseau de Scorbunny : Traînée jaune plasma solaire
    if (target.vel.mag() > 0.4) {
      let emitCount = target.isEvading ? 3 : 1;
      let backOffset = target.vel.copy().normalize().mult(-target.r * 0.75);
      for (let k = 0; k < emitCount; k++) {
        let spawnPos = p5.Vector.add(target.pos, backOffset);
        spawnPos.add(p5.Vector.random2D().mult(random(2, 7)));
        trailParticles.push(new TrailParticle(spawnPos.x, spawnPos.y, '#facc15', false));
      }
    }

    // 4. Rendu des traînées (sous les vaisseaux)
    for (let i = trailParticles.length - 1; i >= 0; i--) {
      let tp = trailParticles[i];
      tp.update();
      tp.show();
      if (tp.isDead) trailParticles.splice(i, 1);
    }
    if (trailParticles.length > 250) {
      trailParticles.splice(0, trailParticles.length - 250);
    }

    // 5. Rendu des vaisseaux Gengar et Scorbunny
    pursuer.show();
    target.show();

    // 6. Détection de capture : Interception de Scorbunny par Gengar
    if (d < (pursuer.r + target.r) * 0.75) {
      declencherCaptureExplosion(target.pos.x, target.pos.y);
      gameState = 'GAMEOVER';
      gameOverTimer = 180; // 3 secondes avant redémarrage auto
    }
  }

  // Rendu des particules et onomatopées de capture
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

  // Fin du repère avec Screen Shake
  pop();

  // Écran de GAME OVER si Scorbunny a été intercepté
  if (gameState === 'GAMEOVER') {
    dessinerEcranGameOver();
    gameOverTimer--;
    if (gameOverTimer <= 0) {
      reinitialiserJeu();
    }
  }

  // Légende du mode débug
  if (Vehicle.debug) {
    drawDebugLegend();
  }
}

// Déclenche une explosion spéciale comics avec tremblement d'écran et son percutant
function declencherCaptureExplosion(x, y) {
  screenShake = 24;

  // Gerbe de 45 particules d'énergie
  for (let i = 0; i < 45; i++) {
    particles.push(new Particle(x, y));
  }

  // Onomatopée comics explosive style bande dessinée
  comicBooms.push(new ComicBoom(x, y));

  // Son spécial d'explosion comics (sub-bass + blast de bruit + pop cartoon)
  gameAudio.playCatchExplosion();
}

// Dessin de l'écran de Game Over
function dessinerEcranGameOver() {
  push();
  fill(0, 0, 0, 165);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  textFont('Impact, "Arial Black", sans-serif');

  // Titre principal GAME OVER
  fill("#ef4444");
  stroke(0);
  strokeWeight(7);
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
  textFont('system-ui, sans-serif');
  textSize(16);
  text("Redémarrage automatique dans " + secondesRestantes + "s... (ou appuyez sur ESPACE)", width / 2, height / 2 + 75);
  pop();
}

// Légende du mode débug
function drawDebugLegend() {
  push();
  let legendY = height - 120;
  fill(10, 14, 24, 220);
  noStroke();
  rect(15, legendY - 10, 420, 115, 10);

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

  // Traînées des vaisseaux
  fill("#c084fc"); noStroke(); circle(32, legendY + 68, 8);
  fill("#facc15"); circle(42, legendY + 68, 8);
  fill("white"); text("🚀 Traînées de propulseur : Violet (Gengar) / Jaune (Scorbunny)", 58, legendY + 71);

  // Cercles de vision
  noFill(); stroke("rgba(0, 255, 136, 0.7)");
  circle(37, legendY + 90, 14);
  noStroke(); fill("white");
  text("Champs de vision : Vert = Gengar | Jaune/Orange = Scorbunny", 58, legendY + 93);
  pop();
}

function keyPressed() {
  if (key === 'd' || key === 'D') {
    Vehicle.debug = !Vehicle.debug;
    debugCheckbox.checked(Vehicle.debug);
  }

  // Démarrage de l'audio lors d'une interaction utilisateur si non activé
  if (!gameAudio.bgmPlaying && gameAudio.ctx && gameAudio.ctx.state === 'suspended') {
    gameAudio.init();
  }

  // Touche ESPACE pour relancer immédiatement lors du Game Over
  if (key === ' ' && gameState === 'GAMEOVER') {
    reinitialiserJeu();
  }
}

function mousePressed() {
  // Débloque l'audio et démarre la musique de fond cosmique au premier clic
  if (!gameAudio.bgmPlaying) {
    gameAudio.startBGM();
    mettreAJourBoutonMusique(true);
  }

  // Clic pour relancer si on est en Game Over
  if (gameState === 'GAMEOVER') {
    reinitialiserJeu();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
