let gengars = [];
let scorbunnies = [];
let particles = [];
let trailParticles = [];
let comicBooms = [];

// Système audio synthétique
let gameAudio;
let screenShake = 0;
let scoreCaptures = 0;

// Sliders et contrôles d'interface utilisateur
let nbGengarsSlider, vitesseNormaleGengarSlider, vitesseSeekingGengarSlider, forceGengarSlider;
let nbScorbunniesSlider, vitesseNormaleScorbunnySlider, vitesseEvadingScorbunnySlider, forceScorbunnySlider;
let predictionSlider, champVisionSlider;
let musicVolSlider, musicToggleBtn;
let debugCheckbox;
let uiContainer;

// Labels d'affichage dynamique
let labelNbGengars, labelVitesseNormaleGengar, labelVitesseSeekingGengar, labelForceGengar;
let labelNbScorbunnies, labelVitesseNormaleScorbunny, labelVitesseEvadingScorbunny, labelForceScorbunny;
let labelPrediction, labelChampVision;
let labelMusicStatus, labelScore;

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
  uiContainer.position(15, 10);
  uiContainer.style('display', 'flex');
  uiContainer.style('flex-direction', 'column');
  uiContainer.style('gap', '6px');
  uiContainer.style('background', 'rgba(10, 12, 22, 0.92)');
  uiContainer.style('backdrop-filter', 'blur(8px)');
  uiContainer.style('padding', '10px 16px');
  uiContainer.style('border-radius', '12px');
  uiContainer.style('border', '1px solid rgba(255, 255, 255, 0.22)');
  uiContainer.style('box-shadow', '0 8px 24px rgba(0, 0, 0, 0.65)');
  uiContainer.style('color', 'white');
  uiContainer.style('font-family', 'system-ui, -apple-system, sans-serif');
  uiContainer.style('font-size', '12px');
  uiContainer.style('z-index', '100');

  // LIGNE 1 : Flotte Gengar (Seekers)
  let row1 = createDiv(); row1.parent(uiContainer);
  row1.style('display', 'flex'); row1.style('flex-wrap', 'wrap'); row1.style('align-items', 'center'); row1.style('gap', '12px');

  let title1 = createSpan('<b>🚀 GENGAR (Seeker) :</b>'); title1.parent(row1); title1.style('color', '#c084fc');

  let gNb = createDiv(); gNb.parent(row1);
  labelNbGengars = createSpan('Nombre : 2 '); labelNbGengars.parent(gNb);
  nbGengarsSlider = createSlider(1, 10, 2, 1); nbGengarsSlider.parent(gNb);
  nbGengarsSlider.style('vertical-align', 'middle');

  let gNorm = createDiv(); gNorm.parent(row1);
  labelVitesseNormaleGengar = createSpan('Vit. Normale : 4 '); labelVitesseNormaleGengar.parent(gNorm);
  vitesseNormaleGengarSlider = createSlider(1, 15, 4, 1); vitesseNormaleGengarSlider.parent(gNorm);
  vitesseNormaleGengarSlider.style('vertical-align', 'middle');

  let gSeek = createDiv(); gSeek.parent(row1);
  labelVitesseSeekingGengar = createSpan('Vit. Poursuite : 8 '); labelVitesseSeekingGengar.parent(gSeek);
  vitesseSeekingGengarSlider = createSlider(2, 25, 8, 1); vitesseSeekingGengarSlider.parent(gSeek);
  vitesseSeekingGengarSlider.style('vertical-align', 'middle');

  let gF = createDiv(); gF.parent(row1);
  labelForceGengar = createSpan('Force : 0.35 '); labelForceGengar.parent(gF);
  forceGengarSlider = createSlider(0.05, 1.5, 0.35, 0.01); forceGengarSlider.parent(gF);
  forceGengarSlider.style('vertical-align', 'middle');

  // LIGNE 2 : Flotte Scorbunny (Evaders)
  let row2 = createDiv(); row2.parent(uiContainer);
  row2.style('display', 'flex'); row2.style('flex-wrap', 'wrap'); row2.style('align-items', 'center'); row2.style('gap', '12px');

  let title2 = createSpan('<b>🐰 SCORBUNNY (Evader) :</b>'); title2.parent(row2); title2.style('color', '#fb923c');

  let sNb = createDiv(); sNb.parent(row2);
  labelNbScorbunnies = createSpan('Nombre : 4 '); labelNbScorbunnies.parent(sNb);
  nbScorbunniesSlider = createSlider(1, 20, 4, 1); nbScorbunniesSlider.parent(sNb);
  nbScorbunniesSlider.style('vertical-align', 'middle');

  let sNorm = createDiv(); sNorm.parent(row2);
  labelVitesseNormaleScorbunny = createSpan('Vit. Normale : 4 '); labelVitesseNormaleScorbunny.parent(sNorm);
  vitesseNormaleScorbunnySlider = createSlider(1, 15, 4, 1); vitesseNormaleScorbunnySlider.parent(sNorm);
  vitesseNormaleScorbunnySlider.style('vertical-align', 'middle');

  let sEvade = createDiv(); sEvade.parent(row2);
  labelVitesseEvadingScorbunny = createSpan('Vit. Évasion : 7 '); labelVitesseEvadingScorbunny.parent(sEvade);
  vitesseEvadingScorbunnySlider = createSlider(2, 25, 7, 1); vitesseEvadingScorbunnySlider.parent(sEvade);
  vitesseEvadingScorbunnySlider.style('vertical-align', 'middle');

  let sF = createDiv(); sF.parent(row2);
  labelForceScorbunny = createSpan('Force : 0.40 '); labelForceScorbunny.parent(sF);
  forceScorbunnySlider = createSlider(0.05, 1.5, 0.40, 0.01); forceScorbunnySlider.parent(sF);
  forceScorbunnySlider.style('vertical-align', 'middle');

  // LIGNE 3 : Paramètres Poursuite & Champ de Vision
  let row3 = createDiv(); row3.parent(uiContainer);
  row3.style('display', 'flex'); row3.style('flex-wrap', 'wrap'); row3.style('align-items', 'center'); row3.style('gap', '14px');

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

  // LIGNE 4 : Contrôles Audio & Score
  let row4 = createDiv(); row4.parent(uiContainer);
  row4.style('display', 'flex'); row4.style('flex-wrap', 'wrap'); row4.style('align-items', 'center'); row4.style('gap', '14px');

  musicToggleBtn = createButton('🎵 Musique Cosmique : DÉMARRER');
  musicToggleBtn.parent(row4);
  musicToggleBtn.style('background', '#7c3aed');
  musicToggleBtn.style('color', '#ffffff');
  musicToggleBtn.style('border', 'none');
  musicToggleBtn.style('padding', '3px 9px');
  musicToggleBtn.style('border-radius', '6px');
  musicToggleBtn.style('cursor', 'pointer');
  musicToggleBtn.style('font-weight', 'bold');
  musicToggleBtn.mousePressed(() => {
    let isPlaying = gameAudio.toggleBGM();
    mettreAJourBoutonMusique(isPlaying);
  });

  let m1 = createDiv(); m1.parent(row4);
  let lblVol = createSpan('Volume : '); lblVol.parent(m1);
  musicVolSlider = createSlider(0, 1, 0.22, 0.02); musicVolSlider.parent(m1);
  musicVolSlider.style('vertical-align', 'middle');
  musicVolSlider.input(() => {
    gameAudio.musicVolume = musicVolSlider.value();
  });

  labelMusicStatus = createSpan('<i style="color:#a78bfa;">(Cliquez sur l\'écran pour activer le son)</i>');
  labelMusicStatus.parent(row4);

  labelScore = createSpan('<b>💥 Captures : 0</b>');
  labelScore.parent(row4);
  labelScore.style('color', '#facc15');
  labelScore.style('margin-left', 'auto');
  labelScore.style('font-size', '13px');
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

// Initialise ou réinitialise la flotte de jeu
function reinitialiserJeu() {
  gengars = [];
  scorbunnies = [];
  particles = [];
  trailParticles = [];
  comicBooms = [];
  screenShake = 0;
  scoreCaptures = 0;

  ajusterFlottes();
}

function ajusterFlottes() {
  let cibleGengars = nbGengarsSlider ? nbGengarsSlider.value() : 2;
  let cibleScorbunnies = nbScorbunniesSlider ? nbScorbunniesSlider.value() : 4;

  // Ajustement des Gengars
  while (gengars.length < cibleGengars) {
    let g = new Vehicle(random(100, width - 100), random(100, height - 100), gengarNormalImg, gengarSeekingImg);
    g.r = 65;
    gengars.push(g);
  }
  while (gengars.length > cibleGengars) {
    gengars.pop();
  }

  // Ajustement des Scorbunnies
  while (scorbunnies.length < cibleScorbunnies) {
    let s = new Target(random(100, width - 100), random(100, height - 100), scorbunnyNormalImg, scorbunnyEvadingImg);
    s.r = 55;
    scorbunnies.push(s);
  }
  while (scorbunnies.length > cibleScorbunnies) {
    scorbunnies.pop();
  }
}

function draw() {
  // Ajuster dynamiquement la taille des flottes si les sliders bougent
  ajusterFlottes();

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

  // Synchronisation dynamique des valeurs des sliders
  let nbG = nbGengarsSlider.value();
  let vNormG = vitesseNormaleGengarSlider.value();
  let vSeekG = vitesseSeekingGengarSlider.value();
  let fG = forceGengarSlider.value();

  let nbS = nbScorbunniesSlider.value();
  let vNormS = vitesseNormaleScorbunnySlider.value();
  let vEvadeS = vitesseEvadingScorbunnySlider.value();
  let fS = forceScorbunnySlider.value();

  let tPrediction = predictionSlider.value();
  let champVision = champVisionSlider.value();

  labelNbGengars.html('Nombre : ' + nbG + ' ');
  labelVitesseNormaleGengar.html('Vit. Normale : ' + vNormG + ' ');
  labelVitesseSeekingGengar.html('Vit. Poursuite : ' + vSeekG + ' ');
  labelForceGengar.html('Force : ' + Number(fG).toFixed(2) + ' ');

  labelNbScorbunnies.html('Nombre : ' + nbS + ' ');
  labelVitesseNormaleScorbunny.html('Vit. Normale : ' + vNormS + ' ');
  labelVitesseEvadingScorbunny.html('Vit. Évasion : ' + vEvadeS + ' ');
  labelForceScorbunny.html('Force : ' + Number(fS).toFixed(2) + ' ');

  labelPrediction.html('Prédiction (T) : ' + tPrediction + ' frames ');
  labelChampVision.html('Champ de Vision : ' + champVision + 'px ');
  labelScore.html('<b>💥 Captures : ' + scoreCaptures + '</b>');

  // 2. Gestion de la flotte Gengar (Seekers)
  for (let gengar of gengars) {
    gengar.champDeVision = champVision;
    gengar.maxForce = fG;

    // Trouver le Scorbunny le plus proche dans son champ de vision
    let closestScorbunny = null;
    let minDistSq = champVision * champVision;

    for (let scorbunny of scorbunnies) {
      let dSq = (gengar.pos.x - scorbunny.pos.x) ** 2 + (gengar.pos.y - scorbunny.pos.y) ** 2;
      if (dSq < minDistSq) {
        minDistSq = dSq;
        closestScorbunny = scorbunny;
      }
    }

    if (closestScorbunny) {
      // Gengar passe en mode poursuite active
      gengar.isSeeking = true;
      gengar.maxSpeed = vSeekG;
      let pursueForce = gengar.pursue(closestScorbunny, tPrediction);
      gengar.applyForce(pursueForce);
    } else {
      // Gengar patrouille passivement à sa vitesse normale
      gengar.isSeeking = false;
      gengar.maxSpeed = vNormG;
      if (gengar.vel.magSq() < 0.2) {
        gengar.vel = p5.Vector.random2D().mult(vNormG);
      } else {
        gengar.vel.setMag(vNormG);
      }
    }

    gengar.update();

    // Traînée de propulseur violette de Gengar
    if (gengar.vel.mag() > 0.4) {
      let emitCount = gengar.isSeeking ? 3 : 1;
      let backOffset = gengar.vel.copy().normalize().mult(-gengar.r * 0.75);
      for (let k = 0; k < emitCount; k++) {
        let spawnPos = p5.Vector.add(gengar.pos, backOffset);
        spawnPos.add(p5.Vector.random2D().mult(random(2, 8)));
        trailParticles.push(new TrailParticle(spawnPos.x, spawnPos.y, '#c084fc', true));
      }
    }
  }

  // 3. Gestion de la flotte Scorbunny (Evaders)
  for (let scorbunny of scorbunnies) {
    scorbunny.champDeVision = champVision;
    scorbunny.maxForce = fS;

    // Trouver le Gengar le plus proche dans son champ de vision
    let closestGengar = null;
    let minDistSq = champVision * champVision;

    for (let gengar of gengars) {
      let dSq = (scorbunny.pos.x - gengar.pos.x) ** 2 + (scorbunny.pos.y - gengar.pos.y) ** 2;
      if (dSq < minDistSq) {
        minDistSq = dSq;
        closestGengar = gengar;
      }
    }

    let wasEvading = scorbunny.isEvading;

    if (closestGengar) {
      // Scorbunny passe en mode fuite active
      scorbunny.isEvading = true;
      scorbunny.maxSpeed = vEvadeS;

      // Son de panique au moment de la détection
      if (!wasEvading) {
        gameAudio.playPanicSound();
      }

      let evadeForce = scorbunny.evade(closestGengar, tPrediction);
      scorbunny.applyForce(evadeForce);
    } else {
      // Scorbunny flâne passivement à sa vitesse normale
      scorbunny.isEvading = false;
      scorbunny.maxSpeed = vNormS;
      if (scorbunny.vel.magSq() < 0.2) {
        scorbunny.vel = p5.Vector.random2D().mult(vNormS);
      } else {
        scorbunny.vel.setMag(vNormS);
      }
    }

    scorbunny.update();

    // Traînée de propulseur jaune de Scorbunny
    if (scorbunny.vel.mag() > 0.4) {
      let emitCount = scorbunny.isEvading ? 3 : 1;
      let backOffset = scorbunny.vel.copy().normalize().mult(-scorbunny.r * 0.75);
      for (let k = 0; k < emitCount; k++) {
        let spawnPos = p5.Vector.add(scorbunny.pos, backOffset);
        spawnPos.add(p5.Vector.random2D().mult(random(2, 8)));
        trailParticles.push(new TrailParticle(spawnPos.x, spawnPos.y, '#facc15', false));
      }
    }
  }

  // 4. Rendu des traînées de propulseurs
  for (let i = trailParticles.length - 1; i >= 0; i--) {
    let tp = trailParticles[i];
    tp.update();
    tp.show();
    if (tp.isDead) trailParticles.splice(i, 1);
  }
  if (trailParticles.length > 300) {
    trailParticles.splice(0, trailParticles.length - 300);
  }

  // 5. Rendu des vaisseaux
  for (let scorbunny of scorbunnies) {
    scorbunny.show();
  }
  for (let gengar of gengars) {
    gengar.show();
  }

  // 6. Détection des captures et collisions
  for (let gengar of gengars) {
    for (let scorbunny of scorbunnies) {
      let captureDist = (gengar.r + scorbunny.r) * 0.7;
      let dSq = (gengar.pos.x - scorbunny.pos.x) ** 2 + (gengar.pos.y - scorbunny.pos.y) ** 2;

      if (dSq < captureDist * captureDist) {
        // Déclencher explosion comics, tremblement d'écran et son percutant
        declencherCaptureExplosion(scorbunny.pos.x, scorbunny.pos.y);
        scoreCaptures++;

        // Réapparition de Scorbunny à un point aléatoire éloigné des Gengars
        scorbunny.respawn();
      }
    }
  }

  // 7. Rendu des particules et onomatopées de capture
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

  // Légende du mode débug
  if (Vehicle.debug) {
    drawDebugLegend();
  }
}

// Déclenche une explosion spéciale comics avec tremblement d'écran et son percutant
function declencherCaptureExplosion(x, y) {
  screenShake = 22;

  // Gerbe de 45 particules d'énergie
  for (let i = 0; i < 45; i++) {
    particles.push(new Particle(x, y));
  }

  // Onomatopée comics explosive style bande dessinée
  comicBooms.push(new ComicBoom(x, y));

  // Son spécial d'explosion comics (sub-bass + blast de bruit + pop cartoon)
  gameAudio.playCatchExplosion();
}

// Légende du mode débug
function drawDebugLegend() {
  push();
  let legendY = height - 120;
  fill(10, 14, 24, 220);
  noStroke();
  rect(15, legendY - 10, 430, 115, 10);

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
  fill("white"); text("🚀 Traînées réacteurs : Violet (Gengar) / Jaune (Scorbunny)", 58, legendY + 71);

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

  // Démarrage de l'audio lors d'une interaction utilisateur
  if (!gameAudio.bgmPlaying && gameAudio.ctx && gameAudio.ctx.state === 'suspended') {
    gameAudio.init();
  }

  // Touche ESPACE pour ajouter un Scorbunny instantanément
  if (key === ' ') {
    let s = new Target(random(width), random(height), scorbunnyNormalImg, scorbunnyEvadingImg);
    s.r = 55;
    scorbunnies.push(s);
    if (nbScorbunniesSlider) {
      nbScorbunniesSlider.value(scorbunnies.length);
    }
  }
}

function mousePressed() {
  // Débloque l'audio et démarre la musique au premier clic
  if (!gameAudio.bgmPlaying) {
    gameAudio.startBGM();
    mettreAJourBoutonMusique(true);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
