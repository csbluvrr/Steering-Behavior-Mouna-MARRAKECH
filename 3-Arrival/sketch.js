let onyx;
let scorbunnies = [];
let particles = [];
let trailParticles = [];
let comicBooms = [];

// État de la partie ('PLAYING' ou 'GAMEOVER')
let gameState = 'PLAYING';
let gameOverTimer = 0;
let gameOverReason = "";
let totalScorbunniesDebut = 5;

// Audio et effets
let gameAudio;
let screenShake = 0;
let scoreMiam = 0;

// Menu burger et interface utilisateur
let burgerBtn;
let isMenuOpen = false;
let topBarContainer;
let statusPill;
let uiContainer;

// Sliders et contrôles
let controlModeBtn;
let vitesseOnixSlider, forceOnixSlider, slowingRadiusSlider, spacingSlider, longueurOnixSlider;
let nbScorbunniesSlider, vitesseNormaleScorbunnySlider, vitesseEvadingScorbunnySlider, champVisionSlider;
let musicVolSlider, musicToggleBtn;
let debugCheckbox;

// Labels dynamiques
let labelVitesseOnix, labelForceOnix, labelSlowingRadius, labelSpacing, labelLongueurOnix;
let labelNbScorbunnies, labelVitesseNormaleScorbunny, labelVitesseEvadingScorbunny, labelChampVision;
let labelMusicStatus;

// Sprites et fond d'écran
let headImg, bodyImg, tailImg;
let scorbunnyNormalImg, scorbunnyEvadingImg;
let bgImg;

function preload() {
  const onErr = (name) => (err) => {
    console.warn(`Avertissement : impossible de charger ${name} :`, err);
  };

  headImg = loadImage('../ressources/onyx_head.png', () => {}, onErr('onyx_head'));
  bodyImg = loadImage('../ressources/onyx_body.png', () => {}, onErr('onyx_body'));
  tailImg = loadImage('../ressources/onyx_tail.png', () => {}, onErr('onyx_tail'));
  scorbunnyNormalImg = loadImage('../ressources/scorbunny_normal.png', () => {}, onErr('scorbunny_normal'));
  scorbunnyEvadingImg = loadImage('../ressources/scorbunny_evading.png', () => {}, onErr('scorbunny_evading'));
  bgImg = loadImage('../ressources/background.gif', () => {}, onErr('background.gif'));
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  if (bgImg && typeof bgImg.play === 'function') {
    bgImg.play();
  }

  gameAudio = new GameAudio();
  creerInterfaceUtilisateur();
  reinitialiserJeu();
}

function creerInterfaceUtilisateur() {
  // 1. Barre supérieure fixe
  topBarContainer = createDiv();
  topBarContainer.position(15, 12);
  topBarContainer.style('display', 'flex');
  topBarContainer.style('align-items', 'center');
  topBarContainer.style('gap', '10px');
  topBarContainer.style('z-index', '1000');

  burgerBtn = createButton('☰ Paramètres');
  burgerBtn.parent(topBarContainer);
  burgerBtn.style('background', 'rgba(15, 18, 34, 0.88)');
  burgerBtn.style('color', '#ffffff');
  burgerBtn.style('border', '1px solid rgba(148, 163, 184, 0.45)');
  burgerBtn.style('padding', '7px 14px');
  burgerBtn.style('border-radius', '10px');
  burgerBtn.style('cursor', 'pointer');
  burgerBtn.style('font-family', 'system-ui, sans-serif');
  burgerBtn.style('font-size', '13px');
  burgerBtn.style('font-weight', '600');
  burgerBtn.style('backdrop-filter', 'blur(8px)');
  burgerBtn.style('box-shadow', '0 4px 14px rgba(0, 0, 0, 0.5)');
  burgerBtn.mousePressed(basculerMenuBurger);

  statusPill = createDiv();
  statusPill.parent(topBarContainer);
  statusPill.style('background', 'rgba(15, 18, 34, 0.85)');
  statusPill.style('backdrop-filter', 'blur(8px)');
  statusPill.style('border', '1px solid rgba(255, 255, 255, 0.18)');
  statusPill.style('padding', '7px 14px');
  statusPill.style('border-radius', '10px');
  statusPill.style('color', 'white');
  statusPill.style('font-family', 'system-ui, sans-serif');
  statusPill.style('font-size', '12px');
  statusPill.style('box-shadow', '0 4px 14px rgba(0, 0, 0, 0.4)');

  // 2. Panneau déroulant du menu burger
  uiContainer = createDiv();
  uiContainer.addClass('burger-menu-panel');
  uiContainer.position(15, 54);
  uiContainer.style('display', 'none');
  uiContainer.style('flex-direction', 'column');
  uiContainer.style('gap', '10px');
  uiContainer.style('width', '470px');
  uiContainer.style('max-width', '92vw');
  uiContainer.style('max-height', 'calc(100vh - 75px)');
  uiContainer.style('overflow-y', 'auto');
  uiContainer.style('background', 'rgba(10, 12, 24, 0.95)');
  uiContainer.style('backdrop-filter', 'blur(14px)');
  uiContainer.style('padding', '14px 18px');
  uiContainer.style('border-radius', '14px');
  uiContainer.style('border', '1px solid rgba(148, 163, 184, 0.35)');
  uiContainer.style('box-shadow', '0 12px 36px rgba(0, 0, 0, 0.75)');
  uiContainer.style('color', 'white');
  uiContainer.style('font-family', 'system-ui, sans-serif');
  uiContainer.style('font-size', '12px');
  uiContainer.style('z-index', '999');

  // En-tête
  let headerMenu = createDiv('<b>⚙️ Snake Classique : Onix & Scorbunnies</b>'); headerMenu.parent(uiContainer);
  headerMenu.style('color', '#94a3b8'); headerMenu.style('font-size', '13px'); headerMenu.style('border-bottom', '1px solid rgba(255, 255, 255, 0.15)'); headerMenu.style('padding-bottom', '6px');

  // SECTION 1 : Onix (Snake, Flèches & Anneaux soudés)
  let sec1 = createDiv(); sec1.parent(uiContainer);
  sec1.style('background', 'rgba(148, 163, 184, 0.08)'); sec1.style('padding', '8px 12px'); sec1.style('border-radius', '8px'); sec1.style('border', '1px solid rgba(148, 163, 184, 0.2)');

  let t1 = createDiv('<b>🐍 ONYX (Contrôles & Physique) :</b>'); t1.parent(sec1);
  t1.style('color', '#94a3b8'); t1.style('margin-bottom', '6px');

  let rMode = createDiv(); rMode.parent(sec1);
  rMode.style('margin-bottom', '8px');
  controlModeBtn = createButton('🕹️ Contrôle : FLÈCHES CLAVIER');
  controlModeBtn.parent(rMode);
  controlModeBtn.style('background', '#2563eb');
  controlModeBtn.style('color', 'white');
  controlModeBtn.style('border', 'none');
  controlModeBtn.style('padding', '4px 12px');
  controlModeBtn.style('border-radius', '6px');
  controlModeBtn.style('cursor', 'pointer');
  controlModeBtn.style('font-weight', 'bold');
  controlModeBtn.mousePressed(() => {
    if (onyx.controlMode === 'KEYBOARD') {
      onyx.controlMode = 'MOUSE';
      controlModeBtn.html('🖱️ Contrôle : SOURIS (Arrival)');
      controlModeBtn.style('background', '#7c3aed');
    } else {
      onyx.controlMode = 'KEYBOARD';
      controlModeBtn.html('🕹️ Contrôle : FLÈCHES CLAVIER');
      controlModeBtn.style('background', '#2563eb');
    }
  });

  let r1 = createDiv(); r1.parent(sec1);
  r1.style('display', 'flex'); r1.style('flex-wrap', 'wrap'); r1.style('gap', '12px');

  let gV = createDiv(); gV.parent(r1);
  labelVitesseOnix = createSpan('Vitesse Max : 7 '); labelVitesseOnix.parent(gV);
  vitesseOnixSlider = createSlider(2, 20, 7, 1); vitesseOnixSlider.parent(gV);
  vitesseOnixSlider.style('vertical-align', 'middle');

  let gF = createDiv(); gF.parent(r1);
  labelForceOnix = createSpan('Force Max : 0.45 '); labelForceOnix.parent(gF);
  forceOnixSlider = createSlider(0.05, 1.5, 0.45, 0.01); forceOnixSlider.parent(gF);
  forceOnixSlider.style('vertical-align', 'middle');

  let gS = createDiv(); gS.parent(r1);
  labelSlowingRadius = createSpan('Rayon Freinage : 140px '); labelSlowingRadius.parent(gS);
  slowingRadiusSlider = createSlider(30, 400, 140, 10); slowingRadiusSlider.parent(gS);
  slowingRadiusSlider.style('vertical-align', 'middle');

  let gSp = createDiv(); gSp.parent(r1);
  labelSpacing = createSpan('Écart Anneaux : 22px '); labelSpacing.parent(gSp);
  spacingSlider = createSlider(12, 45, 22, 1); spacingSlider.parent(gSp);
  spacingSlider.style('vertical-align', 'middle');

  let gL = createDiv(); gL.parent(r1);
  labelLongueurOnix = createSpan('Longueur Initiale : 8 '); labelLongueurOnix.parent(gL);
  longueurOnixSlider = createSlider(3, 25, 8, 1); longueurOnixSlider.parent(gL);
  longueurOnixSlider.style('vertical-align', 'middle');
  longueurOnixSlider.changed(reinitialiserJeu);

  // SECTION 2 : Scorbunny (Evader)
  let sec2 = createDiv(); sec2.parent(uiContainer);
  sec2.style('background', 'rgba(251, 146, 60, 0.08)'); sec2.style('padding', '8px 12px'); sec2.style('border-radius', '8px'); sec2.style('border', '1px solid rgba(251, 146, 60, 0.2)');

  let t2 = createDiv('<b>🐰 SCORBUNNY (Cibles fuyantes) :</b>'); t2.parent(sec2);
  t2.style('color', '#fb923c'); t2.style('margin-bottom', '6px');

  let r2 = createDiv(); r2.parent(sec2);
  r2.style('display', 'flex'); r2.style('flex-wrap', 'wrap'); r2.style('gap', '12px');

  let sNb = createDiv(); sNb.parent(r2);
  labelNbScorbunnies = createSpan('Nombre : 5 '); labelNbScorbunnies.parent(sNb);
  nbScorbunniesSlider = createSlider(1, 20, 5, 1); nbScorbunniesSlider.parent(sNb);
  nbScorbunniesSlider.style('vertical-align', 'middle');
  nbScorbunniesSlider.input(ajusterScorbunnies);

  let sNorm = createDiv(); sNorm.parent(r2);
  labelVitesseNormaleScorbunny = createSpan('Vit. Normale : 4 '); labelVitesseNormaleScorbunny.parent(sNorm);
  vitesseNormaleScorbunnySlider = createSlider(1, 15, 4, 1); vitesseNormaleScorbunnySlider.parent(sNorm);
  vitesseNormaleScorbunnySlider.style('vertical-align', 'middle');

  let sEvade = createDiv(); sEvade.parent(r2);
  labelVitesseEvadingScorbunny = createSpan('Vit. Évasion : 7 '); labelVitesseEvadingScorbunny.parent(sEvade);
  vitesseEvadingScorbunnySlider = createSlider(2, 25, 7, 1); vitesseEvadingScorbunnySlider.parent(sEvade);
  vitesseEvadingScorbunnySlider.style('vertical-align', 'middle');

  let sVision = createDiv(); sVision.parent(r2);
  labelChampVision = createSpan('Champ de Vision : 200px '); labelChampVision.parent(sVision);
  champVisionSlider = createSlider(50, 450, 200, 10); champVisionSlider.parent(sVision);
  champVisionSlider.style('vertical-align', 'middle');

  // SECTION 3 : Débogage & Règles
  let sec3 = createDiv(); sec3.parent(uiContainer);
  sec3.style('background', 'rgba(0, 255, 136, 0.06)'); sec3.style('padding', '8px 12px'); sec3.style('border-radius', '8px'); sec3.style('border', '1px solid rgba(0, 255, 136, 0.2)');

  debugCheckbox = createCheckbox(' Mode Débogage (Zones de freinage, vision, forces) [D]', false);
  debugCheckbox.parent(sec3);
  debugCheckbox.style('cursor', 'pointer');
  debugCheckbox.style('accent-color', '#00ff88');
  debugCheckbox.changed(() => {
    Vehicle.debug = debugCheckbox.checked();
  });

  let rulesInfo = createDiv('<small style="color:#ef4444;">⚠️ Règles classiques : Ne touchez pas les murs rouges ni votre propre corps !</small>');
  rulesInfo.parent(sec3);
  rulesInfo.style('margin-top', '4px');

  // SECTION 4 : Audio
  let sec4 = createDiv(); sec4.parent(uiContainer);
  sec4.style('background', 'rgba(124, 58, 237, 0.08)'); sec4.style('padding', '8px 12px'); sec4.style('border-radius', '8px'); sec4.style('border', '1px solid rgba(124, 58, 237, 0.2)');

  let r4 = createDiv(); r4.parent(sec4);
  r4.style('display', 'flex'); r4.style('flex-wrap', 'wrap'); r4.style('align-items', 'center'); r4.style('gap', '14px');

  musicToggleBtn = createButton('🎵 Musique Cosmique : DÉMARRER');
  musicToggleBtn.parent(r4);
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

  let m1 = createDiv(); m1.parent(r4);
  let lblVol = createSpan('Volume : '); lblVol.parent(m1);
  musicVolSlider = createSlider(0, 1, 0.22, 0.02); musicVolSlider.parent(m1);
  musicVolSlider.style('vertical-align', 'middle');
  musicVolSlider.input(() => {
    gameAudio.musicVolume = musicVolSlider.value();
  });

  labelMusicStatus = createSpan('<i style="color:#a78bfa;">(Cliquez ou pressez une touche pour le son)</i>');
  labelMusicStatus.parent(r4);
}

function basculerMenuBurger() {
  isMenuOpen = !isMenuOpen;
  if (isMenuOpen) {
    uiContainer.style('display', 'flex');
    burgerBtn.html('✕ Fermer');
    burgerBtn.style('background', '#7c3aed');
  } else {
    uiContainer.style('display', 'none');
    burgerBtn.html('☰ Paramètres');
    burgerBtn.style('background', 'rgba(15, 18, 34, 0.88)');
  }
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

function reinitialiserJeu() {
  gameState = 'PLAYING';
  gameOverTimer = 0;
  gameOverReason = "";
  particles = [];
  trailParticles = [];
  comicBooms = [];
  screenShake = 0;
  scoreMiam = 0;

  let initLen = longueurOnixSlider ? longueurOnixSlider.value() : 8;
  onyx = new Snake(width / 2, height / 2, initLen, headImg, bodyImg, tailImg);

  totalScorbunniesDebut = nbScorbunniesSlider ? nbScorbunniesSlider.value() : 5;
  scorbunnies = [];
  for (let i = 0; i < totalScorbunniesDebut; i++) {
    let s = new Target(random(120, width - 120), random(120, height - 120), scorbunnyNormalImg, scorbunnyEvadingImg);
    scorbunnies.push(s);
  }
}

function ajusterScorbunnies() {
  let cible = nbScorbunniesSlider.value();
  totalScorbunniesDebut = cible;
  while (scorbunnies.length < cible) {
    let s = new Target(random(120, width - 120), random(120, height - 120), scorbunnyNormalImg, scorbunnyEvadingImg);
    scorbunnies.push(s);
  }
  while (scorbunnies.length > cible) {
    scorbunnies.pop();
  }
  if (scorbunnies.length > 0 && gameState === 'GAMEOVER') {
    gameState = 'PLAYING';
  }
}

function draw() {
  push();
  if (screenShake > 0) {
    translate(random(-screenShake, screenShake), random(-screenShake, screenShake));
    screenShake *= 0.88;
    if (screenShake < 0.4) screenShake = 0;
  }

  // 1. Image d'arrière-plan animée
  if (bgImg && bgImg.width > 0) {
    image(bgImg, 0, 0, width, height);
  } else {
    background(14, 16, 28);
  }

  // Bordure rouge d'avertissement classique (murs mortels)
  push();
  stroke(239, 68, 68, 160);
  strokeWeight(4);
  noFill();
  rect(2, 2, width - 4, height - 4);
  pop();

  // Synchronisation des sliders
  let vOnix = vitesseOnixSlider.value();
  let fOnix = forceOnixSlider.value();
  let slowingRadius = slowingRadiusSlider.value();
  let spacing = spacingSlider.value();

  let nbS = nbScorbunniesSlider.value();
  let vNormS = vitesseNormaleScorbunnySlider.value();
  let vEvadeS = vitesseEvadingScorbunnySlider.value();
  let champVision = champVisionSlider.value();

  labelVitesseOnix.html('Vitesse Max : ' + vOnix + ' ');
  labelForceOnix.html('Force Max : ' + Number(fOnix).toFixed(2) + ' ');
  labelSlowingRadius.html('Rayon Freinage : ' + slowingRadius + 'px ');
  labelSpacing.html('Écart Anneaux : ' + spacing + 'px ');
  labelLongueurOnix.html('Longueur Initiale : ' + longueurOnixSlider.value() + ' ');

  labelNbScorbunnies.html('Nombre : ' + nbS + ' ');
  labelVitesseNormaleScorbunny.html('Vit. Normale : ' + vNormS + ' ');
  labelVitesseEvadingScorbunny.html('Vit. Évasion : ' + vEvadeS + ' ');
  labelChampVision.html('Champ de Vision : ' + champVision + 'px ');

  onyx.setSpeedAndForce(vOnix, fOnix);

  let audioIcon = gameAudio.bgmPlaying ? '🔊 BGM' : '🔇 Muet';
  let modeIcon = (onyx.controlMode === 'KEYBOARD') ? '🕹️ Flèches' : '🖱️ Souris';
  let longueurTotale = onyx.anneaux.length + 1;
  statusPill.html(`<b>🐰 Scorbunnies : ${scorbunnies.length} / ${totalScorbunniesDebut}</b> &nbsp;|&nbsp; <b>🐍 Taille : ${longueurTotale}</b> &nbsp;|&nbsp; <span style="color:#60a5fa;">${modeIcon}</span> &nbsp;|&nbsp; <span style="color:#a78bfa;">${audioIcon}</span>`);

  if (gameState === 'PLAYING') {
    // 2. Déplacement d'Onix (clavier ou souris)
    let mouseTarget = createVector(mouseX, mouseY);
    onyx.move(mouseTarget, slowingRadius, spacing);

    // VÉRIFICATION 1 : Collision avec les murs mortels
    if (onyx.checkWallCollision()) {
      declencherCrashMortel("Onix a percuté le bord de l'écran !");
    }

    // VÉRIFICATION 2 : Auto-collision (le serpent se mord la queue)
    if (gameState === 'PLAYING' && onyx.checkSelfCollision()) {
      declencherCrashMortel("Onix s'est mordu lui-même !");
    }

    // 3. Gestion de la flotte Scorbunny (fuite d'Onix)
    for (let scorbunny of scorbunnies) {
      scorbunny.champDeVision = champVision;

      let d = p5.Vector.dist(onyx.head.pos, scorbunny.pos);
      let wasEvading = scorbunny.isEvading;

      if (d < champVision) {
        scorbunny.isEvading = true;
        scorbunny.maxSpeed = vEvadeS;

        if (!wasEvading) {
          gameAudio.playPanicSound();
        }

        let evadeForce = scorbunny.evade(onyx.head, 10);
        scorbunny.applyForce(evadeForce);
      } else {
        scorbunny.isEvading = false;
        scorbunny.maxSpeed = vNormS;
        if (scorbunny.vel.magSq() < 0.2) {
          scorbunny.vel = p5.Vector.random2D().mult(vNormS);
        } else {
          scorbunny.vel.setMag(vNormS);
        }
      }

      scorbunny.update();

      // Traînée plasma jaune de Scorbunny
      if (scorbunny.vel.mag() > 0.4) {
        let emitCount = scorbunny.isEvading ? 3 : 1;
        let backOffset = scorbunny.vel.copy().normalize().mult(-scorbunny.r * 0.75);
        for (let k = 0; k < emitCount; k++) {
          let spawnPos = p5.Vector.add(scorbunny.pos, backOffset);
          spawnPos.add(p5.Vector.random2D().mult(random(2, 7)));
          trailParticles.push(new TrailParticle(spawnPos.x, spawnPos.y, '#facc15', true));
        }
      }
    }

    // 4. Détection : Onix mange un Scorbunny et grandit !
    for (let sIdx = scorbunnies.length - 1; sIdx >= 0; sIdx--) {
      let scorbunny = scorbunnies[sIdx];
      let captureDist = (onyx.head.r + scorbunny.r) * 0.75;
      let d = p5.Vector.dist(onyx.head.pos, scorbunny.pos);

      if (d < captureDist) {
        declencherNomMiam(scorbunny.pos.x, scorbunny.pos.y);
        scoreMiam++;
        onyx.grow(1);
        scorbunnies.splice(sIdx, 1);
      }
    }

    // Condition de Victoire : Tous les Scorbunnies sont dévorés !
    if (scorbunnies.length === 0 && gameState === 'PLAYING') {
      gameState = 'GAMEOVER';
      gameOverReason = "VICTOIRE ! Onix a mangé tous les Scorbunnies !";
      gameOverTimer = 240;
    }
  }

  // 5. Rendu des traînées de réacteurs
  for (let i = trailParticles.length - 1; i >= 0; i--) {
    let tp = trailParticles[i];
    tp.update();
    tp.show();
    if (tp.isDead) trailParticles.splice(i, 1);
  }
  if (trailParticles.length > 250) {
    trailParticles.splice(0, trailParticles.length - 250);
  }

  // 6. Rendu des Scorbunnies
  for (let scorbunny of scorbunnies) {
    scorbunny.show();
  }

  // 7. Rendu d'Onix (tête et corps)
  onyx.show();

  // 8. Rendu des particules et onomatopées
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

  pop();

  // Écran de fin de partie (Victoire ou Crash)
  if (gameState === 'GAMEOVER') {
    dessinerEcranGameOver();
    gameOverTimer--;
    if (gameOverTimer <= 0) {
      reinitialiserJeu();
    }
  }

  if (Vehicle.debug) {
    drawDebugLegend();
  }
}

// Déclenche un crash mortel (murs ou queue)
function declencherCrashMortel(raison) {
  screenShake = 26;
  gameState = 'GAMEOVER';
  gameOverReason = raison;
  gameOverTimer = 240;

  for (let i = 0; i < 45; i++) {
    particles.push(new Particle(onyx.head.pos.x, onyx.head.pos.y));
  }

  comicBooms.push(new ComicBoom(onyx.head.pos.x, onyx.head.pos.y));
  gameAudio.playCrashSound();
}

// Déclenche l'effet "NOM" : croquement sonore, onomatopée comics, secousse et particules
function declencherNomMiam(x, y) {
  screenShake = 18;

  for (let i = 0; i < 40; i++) {
    particles.push(new Particle(x, y));
  }

  comicBooms.push(new ComicBoom(x, y));
  gameAudio.playNomSound();
}

function dessinerEcranGameOver() {
  push();
  fill(0, 0, 0, 185);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  textFont('Impact, "Arial Black", sans-serif');

  let isVictory = (scorbunnies.length === 0);

  if (isVictory) {
    fill("#38bdf8");
    stroke(0);
    strokeWeight(7);
    textSize(60);
    text("MIAM ! VICTOIRE !", width / 2, height / 2 - 50);

    fill("#facc15");
    stroke(0);
    strokeWeight(4);
    textSize(26);
    let totalAnneaux = onyx.anneaux.length + 1;
    text("Onix a tout dévoré et mesure " + totalAnneaux + " anneaux rocheux !", width / 2, height / 2 + 10);
  } else {
    fill("#ef4444");
    stroke(0);
    strokeWeight(7);
    textSize(60);
    text("GAME OVER !", width / 2, height / 2 - 50);

    fill("#facc15");
    stroke(0);
    strokeWeight(4);
    textSize(26);
    text(gameOverReason, width / 2, height / 2 + 10);
  }

  fill("#ffffff");
  noStroke();
  textFont('system-ui, sans-serif');
  textSize(18);
  text("💥 Scorbunnies dévorés : " + scoreMiam, width / 2, height / 2 + 50);

  let secondesRestantes = Math.ceil(gameOverTimer / 60);
  fill("#94a3b8");
  textSize(15);
  text("Nouvelle manche dans " + secondesRestantes + "s... (ou appuyez sur ESPACE)", width / 2, height / 2 + 85);
  pop();
}

function drawDebugLegend() {
  push();
  let legendY = height - 120;
  fill(10, 14, 24, 220);
  noStroke();
  rect(15, legendY - 10, 440, 115, 10);

  strokeWeight(2);
  stroke("red"); noFill();
  rect(25, legendY + 5, 20, 14);
  noStroke(); fill("white"); textSize(11);
  text("🔴 Bordure Rouge : Murs mortels (Game Over à l'impact)", 58, legendY + 15);

  stroke("#00ff88"); fill("#00ff88");
  circle(35, legendY + 36, 10);
  noStroke(); fill("white");
  text("🟢 Flèches Directionnelles : Orientation et pilotage du Snake", 58, legendY + 39);

  noFill(); stroke("rgba(255, 140, 0, 0.8)");
  circle(35, legendY + 60, 14);
  noStroke(); fill("white");
  text("🟠 Cercle Orange : Champ de vision de fuite Scorbunny", 58, legendY + 63);

  fill("#facc15"); noStroke(); circle(35, legendY + 84, 8);
  fill("white"); text("🚀 Traînée jaune : Réacteurs de Scorbunny", 58, legendY + 87);
  pop();
}

function keyPressed() {
  // Contrôle directionnel classique au clavier (Flèches & WASD / ZQSD)
  if (keyCode === UP_ARROW || key === 'z' || key === 'Z' || key === 'w' || key === 'W') {
    onyx.setDirection(0, -1);
  } else if (keyCode === DOWN_ARROW || key === 's' || key === 'S') {
    onyx.setDirection(0, 1);
  } else if (keyCode === LEFT_ARROW || key === 'q' || key === 'Q' || key === 'a' || key === 'A') {
    onyx.setDirection(-1, 0);
  } else if (keyCode === RIGHT_ARROW) {
    onyx.setDirection(1, 0);
  }

  // Touche D pour basculer le débug
  if (key === 'd' || key === 'D') {
    Vehicle.debug = !Vehicle.debug;
    if (debugCheckbox) debugCheckbox.checked(Vehicle.debug);
  }

  if (!gameAudio.bgmPlaying && gameAudio.ctx && gameAudio.ctx.state === 'suspended') {
    gameAudio.init();
  }

  if (key === ' ' && gameState === 'GAMEOVER') {
    reinitialiserJeu();
  }
}

function mousePressed() {
  if (!gameAudio.bgmPlaying) {
    gameAudio.startBGM();
    mettreAJourBoutonMusique(true);
  }

  if (gameState === 'GAMEOVER') {
    reinitialiserJeu();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
