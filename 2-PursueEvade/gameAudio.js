class GameAudio {
  constructor() {
    this.ctx = null;
    this.bgmPlaying = false;
    this.bgmStep = 0;
    this.bgmTimer = null;
    this.musicVolume = 0.22;
    this.sfxVolume = 0.45;
    this.tempo = 126; // BPM

    // Séquence mélodique cosmique / arcade (notes en Hz)
    // Gamme pentatonique mineure spatiale (Ré / D) : D4, F4, G4, A4, C5, D5
    this.bassNotes = [
      146.83, 146.83, 174.61, 146.83, // D3, D3, F3, D3
      196.00, 174.61, 220.00, 196.00, // G3, F3, A3, G3
      130.81, 146.83, 174.61, 196.00, // C3, D3, F3, G3
      220.00, 246.94, 261.63, 293.66  // A3, B3, C4, D4
    ];

    this.leadArp = [
      587.33, 698.46, 880.00, 1046.50, // D5, F5, A5, C6
      880.00, 698.46, 587.33, 523.25,  // A5, F5, D5, C5
      659.25, 783.99, 987.77, 1174.66, // E5, G5, B5, D6
      880.00, 783.99, 698.46, 587.33   // A5, G5, F5, D5
    ];
  }

  // Initialisation à la première interaction utilisateur (politique AudioContext)
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Active ou désactive la musique de fond
  toggleBGM() {
    this.init();
    if (!this.ctx) return false;

    if (this.bgmPlaying) {
      this.stopBGM();
      return false;
    } else {
      this.startBGM();
      return true;
    }
  }

  startBGM() {
    this.init();
    if (!this.ctx) return;
    if (this.bgmPlaying) return;

    this.bgmPlaying = true;
    this.bgmStep = 0;
    this.scheduleNextBGMStep();
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  scheduleNextBGMStep() {
    if (!this.bgmPlaying || !this.ctx) return;

    let stepDuration = (60 / this.tempo) / 4; // Double-croche (16th note)
    let now = this.ctx.currentTime;

    // 1. Synthèse de la Basse Chiptune (sur chaque noire ou croche)
    if (this.bgmStep % 2 === 0) {
      let bassIdx = Math.floor(this.bgmStep / 2) % this.bassNotes.length;
      let bassFreq = this.bassNotes[bassIdx];
      this.playSynthNote(bassFreq * 0.5, 'triangle', now, stepDuration * 1.8, this.musicVolume * 0.9, true);
    }

    // 2. Synthèse de l'Arpège Cosmique Scénarisé (onde carrée filtrée style GameBoy / arcade)
    let leadIdx = this.bgmStep % this.leadArp.length;
    let leadFreq = this.leadArp[leadIdx];
    this.playSynthNote(leadFreq, 'square', now, stepDuration * 0.85, this.musicVolume * 0.45, false);

    // 3. Petit charleston rétro synthétique (hi-hat)
    if (this.bgmStep % 2 === 1) {
      this.playHiHat(now, this.musicVolume * 0.35);
    }

    this.bgmStep = (this.bgmStep + 1) % 32;

    let delayMs = stepDuration * 1000;
    this.bgmTimer = setTimeout(() => {
      this.scheduleNextBGMStep();
    }, delayMs);
  }

  playSynthNote(freq, type, startTime, duration, volume, isBass = false) {
    try {
      let osc = this.ctx.createOscillator();
      let gain = this.ctx.createGain();
      let filter = this.ctx.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      filter.type = isBass ? 'lowpass' : 'bandpass';
      filter.frequency.setValueAtTime(isBass ? 450 : 2200, startTime);
      filter.Q.setValueAtTime(isBass ? 2 : 4, startTime);

      gain.gain.setValueAtTime(volume * 0.01, startTime);
      gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);
    } catch (e) {}
  }

  playHiHat(startTime, volume) {
    try {
      let osc = this.ctx.createOscillator();
      let gain = this.ctx.createGain();
      let filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(8000 + Math.random() * 2000, startTime);

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(6000, startTime);

      gain.gain.setValueAtTime(volume * 0.5, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.04);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.045);
    } catch (e) {}
  }

  // Son de PANIQUE quand Scorbunny détecte Gengar
  // Double-pépiement comique rapide et aigu ("eek! eek!")
  playPanicSound() {
    this.init();
    if (!this.ctx) return;
    try {
      let now = this.ctx.currentTime;
      let vol = this.sfxVolume * 0.8;

      // Gazouillis 1
      this.playChirp(now, 750, 1600, 0.07, vol);
      // Gazouillis 2 (plus haut et affolé)
      this.playChirp(now + 0.09, 900, 2100, 0.08, vol);
    } catch (e) {}
  }

  playChirp(time, startFreq, endFreq, dur, vol) {
    let osc = this.ctx.createOscillator();
    let gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + dur * 0.65);
    osc.frequency.exponentialRampToValueAtTime(endFreq * 0.8, time + dur);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(vol, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + dur + 0.01);
  }

  // Son d'explosion spécial comics à l'interception de Scorbunny
  playCatchExplosion() {
    this.init();
    if (!this.ctx) return;
    try {
      let now = this.ctx.currentTime;
      let vol = this.sfxVolume;

      // 1. Impact Sub-Bass percutant (thud)
      let oscSub = this.ctx.createOscillator();
      let gainSub = this.ctx.createGain();
      oscSub.type = 'sine';
      oscSub.frequency.setValueAtTime(260, now);
      oscSub.frequency.exponentialRampToValueAtTime(40, now + 0.28);

      gainSub.gain.setValueAtTime(vol * 1.2, now);
      gainSub.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      oscSub.connect(gainSub);
      gainSub.connect(this.ctx.destination);
      oscSub.start(now);
      oscSub.stop(now + 0.3);

      // 2. Détonation cartoon crépitante (noise blast)
      let bufferSize = this.ctx.sampleRate * 0.22;
      let noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      let output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      let whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      let noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(1200, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(150, now + 0.22);

      let gainNoise = this.ctx.createGain();
      gainNoise.gain.setValueAtTime(vol * 0.9, now);
      gainNoise.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(gainNoise);
      gainNoise.connect(this.ctx.destination);
      whiteNoise.start(now);

      // 3. Pop élastique cartoon aigu
      let oscPop = this.ctx.createOscillator();
      let gainPop = this.ctx.createGain();
      oscPop.type = 'sine';
      oscPop.frequency.setValueAtTime(700, now + 0.02);
      oscPop.frequency.exponentialRampToValueAtTime(120, now + 0.14);

      gainPop.gain.setValueAtTime(vol * 0.8, now + 0.02);
      gainPop.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      oscPop.connect(gainPop);
      gainPop.connect(this.ctx.destination);
      oscPop.start(now + 0.02);
      oscPop.stop(now + 0.16);
    } catch (e) {}
  }
}
