let onyx;
let scorbunnies = [];
let obstacles = [];
let particles = [];
let trailParticles = [];
let comicBooms = [];

// Configuration des 5 niveaux à difficulté croissante
const LEVELS = [
  {
    num: 1,
    nom: "🌱 Échauffement",
    nbScorbunnies: 4,
    vOnix: 5,
    vNormS: 3,
    vEvadeS: 5.5,
    champVision: 150,
    obstacles: []
  },
  {
    num: 2,
    nom: "⚡ Poursuite Rapide",
    nbScorbunnies: 6,
    vOnix: 6.5,
    vNormS: 4,
    vEvadeS: 7,
    champVision: 190,
    obstacles: [
      { rx: 0.28, ry: 0.32, r: 26 },
      { rx: 0.72, ry: 0.68, r: 26 }
    ]
  },
  {
    num: 3,
    nom: "🪨 Champ d'Astéroïdes",
    nbScorbunnies: 8,
    vOnix: 7.5,
    vNormS: 5,
    vEvadeS: 8.5,
    champVision: 220,
    obstacles: [
      { rx: 0.26, ry: 0.28, r: 26 },
      { rx: 0.74, ry: 0.28, r: 26 },
      { rx: 0.26, ry: 0.72, r: 26 },
      { rx: 0.74, ry: 0.72, r: 26 }
    ]
  },
  {
    num: 4,
    nom: "🔥 Panique Cosmique",
    nbScorbunnies: 10,
    vOnix: 8.5,
    vNormS: 6,
    vEvadeS: 10,
    champVision: 260,
    obstacles: [
      { rx: 0.24, ry: 0.28, r: 26 },
      { rx: 0.76, ry: 0.28, r: 26 },
      { rx: 0.24, ry: 0.72, r: 26 },
      { rx: 0.76, ry: 0.72, r: 26 },
      { rx: 0.50, ry: 0.24, r: 24 }
    ]
  },
  {
    num: 5,
    nom: "👑 Maître Onix",
    nbScorbunnies: 12,
    vOnix: 9.5,
    vNormS: 6.5,
    vEvadeS: 11.5,
    champVision: 300,
    obstacles: [
      { rx: 0.24, ry: 0.26, r: 26 },
      { rx: 0.76, ry: 0.26, r: 26 },
      { rx: 0.24, ry: 0.74, r: 26 },
      { rx: 0.76, ry: 0.74, r: 26 },
      { rx: 0.50, ry: 0.22, r: 24 },
      { rx: 0.50, ry: 0.78, r: 24 }
    ]
  }
];

let currentLevel = 1;
let levelButtons = [];
let labelNiveauActuel;

// État de la partie ('START_MENU', 'PLAYING', 'PAUSED', 'GAMEOVER', 'LEVEL_COMPLETE', 'VICTORY_ALL')
let gameState = 'START_MENU';
let gameOverTimer = 0;
let gameOverReason = "";
let totalScorbunniesDebut = 4;

// Audio et effets
let gameAudio;
let screenShake = 0;
let scoreMiam = 0;
let scoreTotal = 0;

// Menu burger, pause, plein écran et interface utilisateur
let burgerBtn;
let pauseTopBtn;
let fullscreenBtn;
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

function getSwitchScreenSize() {
  let slot = document.getElementById('game-screen-slot');
  if (slot && slot.clientWidth > 50 && slot.clientHeight > 50) {
    return { w: Math.round(slot.clientWidth), h: Math.round(slot.clientHeight) };
  }
  return { w: Math.round(windowWidth * 0.62), h: Math.round(windowHeight * 0.63) };
}

function setup() {
  let size = getSwitchScreenSize();
  let cnv = createCanvas(size.w, size.h);
  cnv.parent('game-screen-slot');

  if (bgImg && typeof bgImg.play === 'function') {
    bgImg.play();
  }

  gameAudio = new GameAudio();
  creerInterfaceUtilisateur();
  chargerNiveau(1, 'START_MENU');
}

function creerInterfaceUtilisateur() {
  // 1. Barre supérieure fixe (Style Nintendo Switch Kawaii)
  topBarContainer = createDiv();
  topBarContainer.addClass('switch-topbar');

  burgerBtn = createButton('☰ Paramètres');
  burgerBtn.parent(topBarContainer);
  burgerBtn.addClass('switch-burger-btn');
  burgerBtn.mousePressed(basculerMenuBurger);

  pauseTopBtn = createButton('⏸ Pause');
  pauseTopBtn.parent(topBarContainer);
  pauseTopBtn.addClass('switch-pause-topbtn');
  pauseTopBtn.mousePressed(basculerPause);

  fullscreenBtn = createButton('⛶ Plein écran');
  fullscreenBtn.parent(topBarContainer);
  fullscreenBtn.addClass('switch-fullscreen-topbtn');
  fullscreenBtn.mousePressed(basculerPleinEcran);

  document.addEventListener('fullscreenchange', () => {
    mettreAJourBoutonPleinEcran();
    setTimeout(windowResized, 60);
  });

  statusPill = createDiv();
  statusPill.parent(topBarContainer);
  statusPill.addClass('switch-status-pill');

  // 2. Panneau déroulant du menu burger
  uiContainer = createDiv();
  uiContainer.addClass('burger-menu-panel');

  // En-tête
  let headerMenu = createDiv('<span>🎮 Onix Snake & Scorbunnies</span><span style="font-size:12px;color:#9333ea;">★ Switch Edition</span>');
  headerMenu.parent(uiContainer);
  headerMenu.addClass('switch-menu-header');

  // SECTION 0 : Niveaux à complexité croissante
  let secLvl = createDiv();
  secLvl.parent(uiContainer);
  secLvl.addClass('switch-section switch-section-levels');

  labelNiveauActuel = createDiv('⭐ NIVEAU 1 / 5 — 🌱 Échauffement');
  labelNiveauActuel.parent(secLvl);
  labelNiveauActuel.addClass('switch-section-title');

  let rLvl = createDiv();
  rLvl.parent(secLvl);
  rLvl.addClass('switch-controls-row');
  levelButtons = [];
  for (let lvl of LEVELS) {
    let btn = createButton('Niv. ' + lvl.num);
    btn.parent(rLvl);
    btn.addClass('switch-level-btn');
    btn.mousePressed(() => {
      scoreTotal = 0;
      chargerNiveau(lvl.num);
    });
    levelButtons.push(btn);
  }

  // SECTION 1 : Onix (Snake, Flèches & Anneaux soudés)
  let sec1 = createDiv();
  sec1.parent(uiContainer);
  sec1.addClass('switch-section switch-section-onix');

  let t1 = createDiv('🐍 ONIX — Contrôles & Physique');
  t1.parent(sec1);
  t1.addClass('switch-section-title');

  let rMode = createDiv();
  rMode.parent(sec1);
  rMode.style('margin-bottom', '8px');
  controlModeBtn = createButton('🕹️ Contrôle : FLÈCHES CLAVIER');
  controlModeBtn.parent(rMode);
  controlModeBtn.addClass('switch-action-btn switch-btn-blue');
  controlModeBtn.mousePressed(() => {
    if (onyx.controlMode === 'KEYBOARD') {
      onyx.controlMode = 'MOUSE';
      controlModeBtn.html('🖱️ Contrôle : SOURIS (Arrival)');
      controlModeBtn.removeClass('switch-btn-blue');
      controlModeBtn.addClass('switch-btn-purple');
    } else {
      onyx.controlMode = 'KEYBOARD';
      controlModeBtn.html('🕹️ Contrôle : FLÈCHES CLAVIER');
      controlModeBtn.removeClass('switch-btn-purple');
      controlModeBtn.addClass('switch-btn-blue');
    }
  });

  let r1 = createDiv();
  r1.parent(sec1);
  r1.addClass('switch-controls-row');

  let gV = createDiv(); gV.parent(r1); gV.addClass('switch-slider-item');
  labelVitesseOnix = createSpan('Vitesse Max : 7'); labelVitesseOnix.parent(gV);
  vitesseOnixSlider = createSlider(2, 20, 7, 1); vitesseOnixSlider.parent(gV);

  let gF = createDiv(); gF.parent(r1); gF.addClass('switch-slider-item');
  labelForceOnix = createSpan('Force Max : 0.45'); labelForceOnix.parent(gF);
  forceOnixSlider = createSlider(0.05, 1.5, 0.45, 0.01); forceOnixSlider.parent(gF);

  let gS = createDiv(); gS.parent(r1); gS.addClass('switch-slider-item');
  labelSlowingRadius = createSpan('Freinage : 140px'); labelSlowingRadius.parent(gS);
  slowingRadiusSlider = createSlider(30, 400, 140, 10); slowingRadiusSlider.parent(gS);

  let gSp = createDiv(); gSp.parent(r1); gSp.addClass('switch-slider-item');
  labelSpacing = createSpan('Écart Anneaux : 18px'); labelSpacing.parent(gSp);
  spacingSlider = createSlider(10, 40, 18, 1); spacingSlider.parent(gSp);

  let gL = createDiv(); gL.parent(r1); gL.addClass('switch-slider-item');
  labelLongueurOnix = createSpan('Anneaux départ : 1'); labelLongueurOnix.parent(gL);
  longueurOnixSlider = createSlider(1, 15, 1, 1); longueurOnixSlider.parent(gL);
  longueurOnixSlider.changed(() => reinitialiserJeu());

  // SECTION 2 : Scorbunny (Evader)
  let sec2 = createDiv();
  sec2.parent(uiContainer);
  sec2.addClass('switch-section switch-section-scorbunny');

  let t2 = createDiv('🐰 SCORBUNNY — Cibles Fuyantes');
  t2.parent(sec2);
  t2.addClass('switch-section-title');

  let r2 = createDiv();
  r2.parent(sec2);
  r2.addClass('switch-controls-row');

  let sNb = createDiv(); sNb.parent(r2); sNb.addClass('switch-slider-item');
  labelNbScorbunnies = createSpan('Nombre : 5'); labelNbScorbunnies.parent(sNb);
  nbScorbunniesSlider = createSlider(1, 20, 5, 1); nbScorbunniesSlider.parent(sNb);
  nbScorbunniesSlider.input(ajusterScorbunnies);

  let sNorm = createDiv(); sNorm.parent(r2); sNorm.addClass('switch-slider-item');
  labelVitesseNormaleScorbunny = createSpan('Vit. Normale : 4'); labelVitesseNormaleScorbunny.parent(sNorm);
  vitesseNormaleScorbunnySlider = createSlider(1, 15, 4, 1); vitesseNormaleScorbunnySlider.parent(sNorm);

  let sEvade = createDiv(); sEvade.parent(r2); sEvade.addClass('switch-slider-item');
  labelVitesseEvadingScorbunny = createSpan('Vit. Évasion : 7'); labelVitesseEvadingScorbunny.parent(sEvade);
  vitesseEvadingScorbunnySlider = createSlider(2, 25, 7, 1); vitesseEvadingScorbunnySlider.parent(sEvade);

  let sVision = createDiv(); sVision.parent(r2); sVision.addClass('switch-slider-item');
  labelChampVision = createSpan('Vision : 200px'); labelChampVision.parent(sVision);
  champVisionSlider = createSlider(50, 450, 200, 10); champVisionSlider.parent(sVision);

  // SECTION 3 : Débogage & Règles
  let sec3 = createDiv();
  sec3.parent(uiContainer);
  sec3.addClass('switch-section switch-section-debug');

  debugCheckbox = createCheckbox(' Mode Débogage (Freinage, vision, coins, forces) [D]', false);
  debugCheckbox.parent(sec3);
  debugCheckbox.style('cursor', 'pointer');
  debugCheckbox.style('font-weight', '600');
  debugCheckbox.changed(() => {
    Vehicle.debug = debugCheckbox.checked();
  });

  let rulesInfo = createDiv('⚠️ Ne touchez pas les bords, les astéroïdes ni votre propre corps !');
  rulesInfo.parent(sec3);
  rulesInfo.addClass('switch-rules-note');

  // SECTION 4 : Audio
  let sec4 = createDiv();
  sec4.parent(uiContainer);
  sec4.addClass('switch-section switch-section-audio');

  let r4 = createDiv();
  r4.parent(sec4);
  r4.addClass('switch-controls-row');

  musicToggleBtn = createButton('🎵 Musique : DÉMARRER');
  musicToggleBtn.parent(r4);
  musicToggleBtn.addClass('switch-action-btn switch-btn-purple');
  musicToggleBtn.mousePressed(() => {
    let isPlaying = gameAudio.toggleBGM();
    mettreAJourBoutonMusique(isPlaying);
  });

  let m1 = createDiv(); m1.parent(r4); m1.addClass('switch-slider-item');
  let lblVol = createSpan('Volume :'); lblVol.parent(m1);
  musicVolSlider = createSlider(0, 1, 0.22, 0.02); musicVolSlider.parent(m1);
  musicVolSlider.input(() => {
    gameAudio.musicVolume = musicVolSlider.value();
  });

  labelMusicStatus = createSpan('<span style="color:#6b21a8;font-size:11.5px;">(Cliquez pour activer le son)</span>');
  labelMusicStatus.parent(r4);
}

function basculerMenuBurger() {
  isMenuOpen = !isMenuOpen;
  if (isMenuOpen) {
    uiContainer.style('display', 'flex');
    burgerBtn.html('✕ Fermer');
    burgerBtn.addClass('is-open');
  } else {
    uiContainer.style('display', 'none');
    burgerBtn.html('☰ Paramètres');
    burgerBtn.removeClass('is-open');
  }
}

function mettreAJourBoutonMusique(isPlaying) {
  if (isPlaying) {
    musicToggleBtn.html('🔊 Musique : ON');
    musicToggleBtn.removeClass('switch-btn-purple');
    musicToggleBtn.removeClass('switch-btn-muted');
    musicToggleBtn.addClass('switch-btn-mint');
    labelMusicStatus.html('<span style="color:#15803d;font-weight:700;font-size:12px;">✨ Synth BGM active</span>');
  } else {
    musicToggleBtn.html('🔇 Musique : OFF');
    musicToggleBtn.removeClass('switch-btn-mint');
    musicToggleBtn.removeClass('switch-btn-purple');
    musicToggleBtn.addClass('switch-btn-muted');
    labelMusicStatus.html('<span style="color:#64748b;font-size:12px;">En pause</span>');
  }
}

// Calcule une position d'apparition sûre éloignée des coins, des murs, des obstacles et d'Onix
function positionSureScorbunny() {
  let margin = Math.min(85, width * 0.14, height * 0.18);
  let safeCornerDist = Math.min(165, Math.min(width, height) * 0.30);
  let corners = [
    createVector(0, 0),
    createVector(width, 0),
    createVector(0, height),
    createVector(width, height)
  ];

  for (let attempt = 0; attempt < 80; attempt++) {
    let x = random(margin, width - margin);
    let y = random(margin, height - margin);
    let isSafe = true;
    for (let c of corners) {
      if (dist(x, y, c.x, c.y) < safeCornerDist) {
        isSafe = false;
        break;
      }
    }
    if (isSafe) {
      for (let obs of obstacles) {
        if (dist(x, y, obs.pos.x, obs.pos.y) < obs.r + 75) {
          isSafe = false;
          break;
        }
      }
    }
    if (isSafe && onyx && onyx.head) {
      if (dist(x, y, onyx.head.pos.x, onyx.head.pos.y) < 120) {
        isSafe = false;
      }
    }
    if (isSafe) {
      return createVector(x, y);
    }
  }
  return createVector(width * 0.72, height * 0.5);
}

function getLevelConfig(num) {
  let idx = constrain(num - 1, 0, LEVELS.length - 1);
  return LEVELS[idx];
}

function mettreAJourBoutonsNiveaux() {
  let cfg = getLevelConfig(currentLevel);
  if (labelNiveauActuel) {
    labelNiveauActuel.html(`⭐ NIVEAU ${cfg.num} / ${LEVELS.length} — ${cfg.nom}`);
  }
  for (let i = 0; i < levelButtons.length; i++) {
    if (i + 1 === currentLevel) {
      levelButtons[i].addClass('is-active');
    } else {
      levelButtons[i].removeClass('is-active');
    }
  }
}

function chargerNiveau(num, targetState = 'PLAYING') {
  currentLevel = constrain(num, 1, LEVELS.length);
  let cfg = getLevelConfig(currentLevel);

  // Appliquer les paramètres de difficulté du niveau aux sliders
  if (vitesseOnixSlider) vitesseOnixSlider.value(cfg.vOnix);
  if (nbScorbunniesSlider) nbScorbunniesSlider.value(cfg.nbScorbunnies);
  if (vitesseNormaleScorbunnySlider) vitesseNormaleScorbunnySlider.value(cfg.vNormS);
  if (vitesseEvadingScorbunnySlider) vitesseEvadingScorbunnySlider.value(cfg.vEvadeS);
  if (champVisionSlider) champVisionSlider.value(cfg.champVision);

  mettreAJourBoutonsNiveaux();
  reinitialiserJeu(targetState);
}

function reinitialiserJeu(targetState = 'PLAYING') {
  let cfg = getLevelConfig(currentLevel);
  gameState = targetState;
  gameOverTimer = 0;
  gameOverReason = "";
  particles = [];
  trailParticles = [];
  comicBooms = [];
  screenShake = 0;
  scoreMiam = 0;

  // Construire les obstacles rocheux du niveau (Obstacle extends Vehicle)
  obstacles = [];
  for (let o of cfg.obstacles) {
    obstacles.push(new Obstacle(o.rx, o.ry, o.r));
  }

  // Onix commence avec 1 seul anneau par défaut !
  let initLen = longueurOnixSlider ? longueurOnixSlider.value() : 1;
  onyx = new Snake(width / 2, height / 2, initLen, headImg, bodyImg, tailImg);

  totalScorbunniesDebut = nbScorbunniesSlider ? nbScorbunniesSlider.value() : cfg.nbScorbunnies;
  scorbunnies = [];
  for (let i = 0; i < totalScorbunniesDebut; i++) {
    let pos = positionSureScorbunny();
    let s = new Target(pos.x, pos.y, scorbunnyNormalImg, scorbunnyEvadingImg);
    scorbunnies.push(s);
  }
  mettreAJourBoutonsNiveaux();
  synchroniserOverlayMenu();
}

function basculerPleinEcran() {
  if (!document.fullscreenElement) {
    let el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }
}

function mettreAJourBoutonPleinEcran() {
  let isFS = Boolean(document.fullscreenElement);
  if (fullscreenBtn) {
    fullscreenBtn.html(isFS ? '🗗 Quitter plein écran' : '⛶ Plein écran');
  }
  if (gameState === 'START_MENU' || gameState === 'PAUSED') {
    synchroniserOverlayMenu();
  }
}

function basculerPause() {
  if (gameState === 'PLAYING') {
    gameState = 'PAUSED';
    synchroniserOverlayMenu();
  } else if (gameState === 'PAUSED') {
    gameState = 'PLAYING';
    synchroniserOverlayMenu();
  } else if (gameState === 'START_MENU') {
    demarrerPartie();
  }
}

function demarrerPartie() {
  if (gameAudio && !gameAudio.bgmPlaying) {
    gameAudio.startBGM();
    mettreAJourBoutonMusique(true);
  }
  gameState = 'PLAYING';
  synchroniserOverlayMenu();
}

function synchroniserOverlayMenu() {
  let overlay = document.getElementById('switch-menu-overlay');
  if (!overlay) return;

  if (pauseTopBtn) {
    pauseTopBtn.html(gameState === 'PAUSED' ? '▶ Reprendre' : '⏸ Pause');
  }

  if (gameState !== 'START_MENU' && gameState !== 'PAUSED') {
    overlay.classList.add('is-hidden');
    overlay.innerHTML = '';
    return;
  }

  let isStart = (gameState === 'START_MENU');
  let cfg = getLevelConfig(currentLevel);
  let modeLabel = (onyx && onyx.controlMode === 'MOUSE') ? '🖱️ Souris (Arrival)' : '🕹️ Flèches Clavier';
  let audioLabel = (gameAudio && gameAudio.bgmPlaying) ? '🔊 Musique : ON' : '🔇 Musique : OFF';

  let levelBtnsHtml = LEVELS.map(lvl => {
    let activeCls = (lvl.num === currentLevel) ? ' is-active' : '';
    return `<button class="switch-level-btn${activeCls}" data-lvl="${lvl.num}">Niv. ${lvl.num}</button>`;
  }).join('');

  overlay.innerHTML = `
    <div class="switch-modal-card">
      <div class="switch-modal-badge ${isStart ? '' : 'is-pause'}">
        ${isStart ? '🐍 ONIX SNAKE' : '⏸ PAUSE'}
      </div>
      <div class="switch-modal-subtitle">
        ${isStart
          ? `★ Pokémon Switch Edition · Niveau ${cfg.num} — ${cfg.nom} ★`
          : `Niveau ${cfg.num} — ${cfg.nom} · 🐰 ${scorbunnies.length} restants · 🐍 ${onyx ? onyx.anneaux.length : 1} anneau(x)`}
      </div>
      <div class="switch-modal-levels">${levelBtnsHtml}</div>
      <div class="switch-modal-actions">
        <button id="modal-play-btn" class="switch-primary-btn">
          ${isStart ? '▶ JOUER' : '▶ REPRENDRE'}
        </button>
        ${isStart ? '' : '<button id="modal-restart-btn" class="switch-action-btn switch-btn-coral">↺ Recommencer</button>'}
      </div>
      <div class="switch-modal-actions">
        <button id="modal-mode-btn" class="switch-action-btn ${onyx && onyx.controlMode === 'MOUSE' ? 'switch-btn-purple' : 'switch-btn-blue'}">${modeLabel}</button>
        <button id="modal-audio-btn" class="switch-action-btn ${gameAudio && gameAudio.bgmPlaying ? 'switch-btn-mint' : 'switch-btn-muted'}">${audioLabel}</button>
        <button id="modal-fs-btn" class="switch-action-btn switch-btn-blue">${document.fullscreenElement ? '🗗 Fenêtré' : '⛶ Plein écran'}</button>
      </div>
      <div class="switch-modal-hint">
        ${isStart
          ? 'Flèches / ZQSD ou Souris · ÉCHAP pour Pause · D pour Debug'
          : 'Appuyez sur ÉCHAP ou ESPACE pour reprendre'}
      </div>
    </div>
  `;

  overlay.classList.remove('is-hidden');

  // Brancher les boutons du menu
  let playBtn = document.getElementById('modal-play-btn');
  if (playBtn) {
    playBtn.onclick = (e) => {
      e.stopPropagation();
      demarrerPartie();
    };
  }

  let restartBtn = document.getElementById('modal-restart-btn');
  if (restartBtn) {
    restartBtn.onclick = (e) => {
      e.stopPropagation();
      reinitialiserJeu('PLAYING');
    };
  }

  let modeBtn = document.getElementById('modal-mode-btn');
  if (modeBtn) {
    modeBtn.onclick = (e) => {
      e.stopPropagation();
      if (onyx.controlMode === 'KEYBOARD') {
        onyx.controlMode = 'MOUSE';
        controlModeBtn.html('🖱️ Contrôle : SOURIS (Arrival)');
        controlModeBtn.removeClass('switch-btn-blue');
        controlModeBtn.addClass('switch-btn-purple');
      } else {
        onyx.controlMode = 'KEYBOARD';
        controlModeBtn.html('🕹️ Contrôle : FLÈCHES CLAVIER');
        controlModeBtn.removeClass('switch-btn-purple');
        controlModeBtn.addClass('switch-btn-blue');
      }
      synchroniserOverlayMenu();
    };
  }

  let audioBtn = document.getElementById('modal-audio-btn');
  if (audioBtn) {
    audioBtn.onclick = (e) => {
      e.stopPropagation();
      let isPlaying = gameAudio.toggleBGM();
      mettreAJourBoutonMusique(isPlaying);
      synchroniserOverlayMenu();
    };
  }

  let fsBtn = document.getElementById('modal-fs-btn');
  if (fsBtn) {
    fsBtn.onclick = (e) => {
      e.stopPropagation();
      basculerPleinEcran();
    };
  }

  overlay.querySelectorAll('[data-lvl]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      let lvlNum = parseInt(btn.getAttribute('data-lvl'), 10);
      scoreTotal = 0;
      chargerNiveau(lvlNum, isStart ? 'START_MENU' : 'PLAYING');
    };
  });
}

function ajusterScorbunnies() {
  let cible = nbScorbunniesSlider.value();
  totalScorbunniesDebut = cible;
  while (scorbunnies.length < cible) {
    let pos = positionSureScorbunny();
    let s = new Target(pos.x, pos.y, scorbunnyNormalImg, scorbunnyEvadingImg);
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
  stroke(255, 77, 109, 175);
  strokeWeight(4);
  noFill();
  rect(2, 2, width - 4, height - 4);

  // En mode debug, visualisation des arcs d'exclusion des 4 coins
  if (Vehicle.debug) {
    stroke(251, 146, 60, 180);
    strokeWeight(2);
    drawingContext.setLineDash([5, 5]);
    let safeR = 95 * 2;
    arc(0, 0, safeR, safeR, 0, HALF_PI);
    arc(width, 0, safeR, safeR, HALF_PI, PI);
    arc(0, height, safeR, safeR, -HALF_PI, 0);
    arc(width, height, safeR, safeR, PI, PI + HALF_PI);
    drawingContext.setLineDash([]);
  }
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
  labelLongueurOnix.html('Anneaux départ : ' + longueurOnixSlider.value() + ' ');

  labelNbScorbunnies.html('Nombre : ' + nbS + ' ');
  labelVitesseNormaleScorbunny.html('Vit. Normale : ' + vNormS + ' ');
  labelVitesseEvadingScorbunny.html('Vit. Évasion : ' + vEvadeS + ' ');
  labelChampVision.html('Champ de Vision : ' + champVision + 'px ');

  onyx.setSpeedAndForce(vOnix, fOnix);

  let audioIcon = gameAudio.bgmPlaying ? '🔊 BGM' : '🔇 Muet';
  let modeIcon = (onyx.controlMode === 'KEYBOARD') ? '🕹️ Flèches' : '🖱️ Souris';
  let nbAnneaux = onyx.anneaux.length;
  statusPill.html(
    `<span class="hud-chip hud-chip-yellow">⭐ Niv. ${currentLevel}/${LEVELS.length}</span>` +
    `<span class="hud-chip hud-chip-coral">🐰 ${scorbunnies.length} / ${totalScorbunniesDebut}</span>` +
    `<span class="hud-chip hud-chip-blue">🐍 ${nbAnneaux} ${nbAnneaux > 1 ? 'anneaux' : 'anneau'}</span>` +
    `<span class="hud-chip hud-chip-purple">${modeIcon} · ${audioIcon}</span>`
  );

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

    // VÉRIFICATION 3 : Collision avec un obstacle rocheux du niveau
    if (gameState === 'PLAYING' && onyx.checkObstacleCollision(obstacles)) {
      declencherCrashMortel("Onix a percuté un astéroïde rocheux !");
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

      // Répulsion active et anticipée des 4 coins, des murs et des obstacles
      let cornerForce = scorbunny.avoidCorners(175);
      scorbunny.applyForce(cornerForce);

      let wallForce = scorbunny.avoidWalls(60);
      scorbunny.applyForce(wallForce);

      if (obstacles.length > 0) {
        let obsForce = scorbunny.avoidObstacles(obstacles);
        scorbunny.applyForce(obsForce);
      }

      scorbunny.update(obstacles);

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
        scoreTotal++;
        onyx.grow(1);
        scorbunnies.splice(sIdx, 1);
      }
    }

    // Condition de Victoire du niveau : Tous les Scorbunnies sont dévorés !
    if (scorbunnies.length === 0 && gameState === 'PLAYING') {
      gameAudio.playLevelUpSound();
      if (currentLevel < LEVELS.length) {
        gameState = 'LEVEL_COMPLETE';
      } else {
        gameState = 'VICTORY_ALL';
      }
    }
  }

  // 4.5. Rendu des obstacles rocheux du niveau
  for (let obs of obstacles) {
    obs.show();
  }

  // 5. Rendu des traînées de réacteurs (gelées en pause)
  let animateFX = (gameState !== 'PAUSED' && gameState !== 'START_MENU');
  for (let i = trailParticles.length - 1; i >= 0; i--) {
    let tp = trailParticles[i];
    if (animateFX) tp.update();
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

  // 8. Rendu des particules et effets Pokémon (gelés en pause)
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    if (animateFX) p.update();
    p.show();
    if (p.isDead) particles.splice(i, 1);
  }

  for (let i = comicBooms.length - 1; i >= 0; i--) {
    let boom = comicBooms[i];
    if (animateFX) boom.update();
    boom.show();
    if (boom.isDead) comicBooms.splice(i, 1);
  }

  pop();

  // Écran de fin de niveau, grande victoire ou crash - action manuelle uniquement (ESPACE ou clic)
  if (gameState === 'GAMEOVER' || gameState === 'LEVEL_COMPLETE' || gameState === 'VICTORY_ALL') {
    dessinerEcranGameOver();
  }

  if (Vehicle.debug) {
    drawDebugLegend();
  }
}

// Déclenche un crash mortel (murs, astéroïde ou queue)
function declencherCrashMortel(raison) {
  screenShake = 12;
  gameState = 'GAMEOVER';
  gameOverReason = raison;
  gameOverTimer = 240;

  for (let i = 0; i < 18; i++) {
    particles.push(new Particle(onyx.head.pos.x, onyx.head.pos.y));
  }

  comicBooms.push(new ComicBoom(onyx.head.pos.x, onyx.head.pos.y, 'CRASH'));
  gameAudio.playCrashSound();
}

// Déclenche l'effet Pokémon léger "NOM" : étincelles pastel, onde discrète et croquement
function declencherNomMiam(x, y) {
  screenShake = 4;

  for (let i = 0; i < 12; i++) {
    particles.push(new Particle(x, y));
  }

  comicBooms.push(new ComicBoom(x, y, 'NOM'));
  gameAudio.playNomSound();
}

function dessinerEcranGameOver() {
  push();
  // Voile lavande sombre semi-transparent
  fill(45, 23, 76, 175);
  noStroke();
  rect(0, 0, width, height);

  let s = constrain(width / 900, 0.55, 1.12);
  let cardW = min(width * 0.84, 580 * s);
  let cardH = min(height * 0.72, 270 * s);
  let cx = width / 2;
  let cy = height / 2;

  // Ombre portée cartoon de la carte
  rectMode(CENTER);
  fill("#2d174c");
  noStroke();
  rect(cx + 6 * s, cy + 8 * s, cardW, cardH, 26 * s);

  // Carte de dialogue style Nintendo Switch Kawaii
  fill("#fcf6ff");
  stroke("#2d174c");
  strokeWeight(4 * s);
  rect(cx, cy, cardW, cardH, 26 * s);

  textAlign(CENTER, CENTER);
  textFont('Fredoka, "Trebuchet MS", system-ui, sans-serif');

  let isLevelClear = (gameState === 'LEVEL_COMPLETE');
  let isGrandVictory = (gameState === 'VICTORY_ALL');

  // Bandeau titre coloré
  let badgeW = cardW * 0.80;
  let badgeH = 54 * s;
  let badgeColor = isGrandVictory ? "#fde047" : (isLevelClear ? "#38bdf8" : "#ff4d6d");
  fill(badgeColor);
  stroke("#2d174c");
  strokeWeight(3.5 * s);
  rect(cx, cy - cardH * 0.28, badgeW, badgeH, 999);

  fill(isGrandVictory ? "#2d174c" : "#ffffff");
  if (!isGrandVictory) {
    stroke("#2d174c");
    strokeWeight(3.5 * s);
  } else {
    noStroke();
  }
  textSize(30 * s);
  let titleText = isGrandVictory
    ? "👑 CHAMPION POKÉMON ! 👑"
    : (isLevelClear ? `★ NIVEAU ${currentLevel} RÉUSSI ! ★` : `GAME OVER — NIV. ${currentLevel}`);
  text(titleText, cx, cy - cardH * 0.28 + 1 * s);

  // Sous-titre
  noStroke();
  fill("#2d174c");
  textSize(18 * s);
  if (isGrandVictory) {
    text("Incroyable ! Vous avez terminé les " + LEVELS.length + " niveaux !", cx, cy + 2 * s);
  } else if (isLevelClear) {
    let nextCfg = getLevelConfig(currentLevel + 1);
    text("Prochain défi : Niv. " + nextCfg.num + " — " + nextCfg.nom + " (" + nextCfg.obstacles.length + " astéroïdes)", cx, cy + 2 * s);
  } else {
    text(gameOverReason, cx, cy + 2 * s);
  }

  // Pastille de score jaune Pikachu
  fill("#fde047");
  stroke("#2d174c");
  strokeWeight(2.5 * s);
  rect(cx, cy + 46 * s, 310 * s, 36 * s, 999);

  noStroke();
  fill("#2d174c");
  textSize(15.5 * s);
  let scoreText = isGrandVictory
    ? "💥 Total Scorbunnies dévorés : " + scoreTotal
    : "💥 Mangés : " + scoreMiam + "  |  🐍 Anneaux : " + onyx.anneaux.length;
  text(scoreText, cx, cy + 47 * s);

  // Invite pulsée pour continuer / rejouer
  let pulseAlpha = map(sin(frameCount * 0.08), -1, 1, 130, 255);
  fill(147, 51, 234, pulseAlpha);
  textSize(14.5 * s);
  let promptText = isGrandVictory
    ? "Appuyez sur ESPACE ou cliquez pour recommencer au Niveau 1"
    : (isLevelClear
      ? "Appuyez sur ESPACE ou cliquez pour passer au Niveau " + (currentLevel + 1)
      : "Appuyez sur ESPACE ou cliquez pour réessayer le Niveau " + currentLevel);
  text(promptText, cx, cy + cardH * 0.37);
  pop();
}

function drawDebugLegend() {
  push();
  let legendY = height - 118;
  fill(45, 23, 76, 225);
  stroke("#c084fc");
  strokeWeight(2);
  rect(14, legendY - 10, min(430, width - 28), 112, 14);

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

function gererActionFinDeManche() {
  if (gameState === 'LEVEL_COMPLETE') {
    chargerNiveau(currentLevel + 1);
  } else if (gameState === 'VICTORY_ALL') {
    scoreTotal = 0;
    chargerNiveau(1);
  } else if (gameState === 'GAMEOVER') {
    reinitialiserJeu();
  }
}

function keyPressed() {
  // Touche ÉCHAP : mettre en pause ou reprendre la partie
  if (keyCode === ESCAPE) {
    if (gameState === 'PLAYING' || gameState === 'PAUSED') {
      basculerPause();
    }
    return;
  }

  // Contrôle directionnel classique au clavier (uniquement en cours de partie)
  if (gameState === 'PLAYING') {
    if (keyCode === UP_ARROW || key === 'z' || key === 'Z' || key === 'w' || key === 'W') {
      onyx.setDirection(0, -1);
    } else if (keyCode === DOWN_ARROW || key === 's' || key === 'S') {
      onyx.setDirection(0, 1);
    } else if (keyCode === LEFT_ARROW || key === 'q' || key === 'Q' || key === 'a' || key === 'A') {
      onyx.setDirection(-1, 0);
    } else if (keyCode === RIGHT_ARROW) {
      onyx.setDirection(1, 0);
    }
  }

  // Touche D pour basculer le débug
  if (key === 'd' || key === 'D') {
    Vehicle.debug = !Vehicle.debug;
    if (debugCheckbox) debugCheckbox.checked(Vehicle.debug);
  }

  if (!gameAudio.bgmPlaying && gameAudio.ctx && gameAudio.ctx.state === 'suspended') {
    gameAudio.init();
  }

  if (key === ' ' || keyCode === ENTER) {
    if (gameState === 'START_MENU' || gameState === 'PAUSED') {
      demarrerPartie();
    } else if (gameState === 'GAMEOVER' || gameState === 'LEVEL_COMPLETE' || gameState === 'VICTORY_ALL') {
      gererActionFinDeManche();
    }
  }
}

function mousePressed() {
  if (gameState === 'START_MENU' || gameState === 'PAUSED') {
    return;
  }

  if (!gameAudio.bgmPlaying) {
    gameAudio.startBGM();
    mettreAJourBoutonMusique(true);
  }

  if ((gameState === 'GAMEOVER' || gameState === 'LEVEL_COMPLETE' || gameState === 'VICTORY_ALL')
      && mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    gererActionFinDeManche();
  }
}

function windowResized() {
  let size = getSwitchScreenSize();
  resizeCanvas(size.w, size.h);

  // Recadrer les obstacles et entités à l'intérieur du nouvel écran Switch
  for (let obs of obstacles) {
    obs.syncPosition();
  }
  if (onyx && onyx.head) {
    onyx.head.pos.x = constrain(onyx.head.pos.x, 40, width - 40);
    onyx.head.pos.y = constrain(onyx.head.pos.y, 40, height - 40);
  }
  for (let s of scorbunnies) {
    s.pos.x = constrain(s.pos.x, 50, width - 50);
    s.pos.y = constrain(s.pos.y, 50, height - 50);
  }
}
