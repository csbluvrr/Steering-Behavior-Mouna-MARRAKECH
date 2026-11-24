class GameAudio {
  constructor() {
    this.ctx = null;
    this.bgmPlaying = false;
    this.bgmStep = 0;
    this.bgmTimer = null;
    this.musicVolume = 0.22;
    this.sfxVolume = 0.45;
    this.tempo = 126;

    this.bassNotes = [
      146.83, 146.83, 174.61, 146.83,
      196.00, 174.61, 220.00, 196.00,
      130.81, 146.83, 174.61, 196.00,
      220.00, 246.94, 261.63, 293.66
    ];

    this.leadArp = [
      587.33, 698.46, 880.00, 1046.50,
      880.00, 698.46, 587.33, 523.25,
      659.25, 783.99, 987.77, 1174.66,
      880.00, 783.99, 698.46, 587.33
    ];
  }

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

    let stepDuration = (60 / this.tempo) / 4;
    let now = this.ctx.currentTime;

    if (this.bgmStep % 2 === 0) {
      let bassIdx = Math.floor(this.bgmStep / 2) % this.bassNotes.length;
      let bassFreq = this.bassNotes[bassIdx];
      this.playSynthNote(bassFreq * 0.5, 'triangle', now, stepDuration * 1.8, this.musicVolume * 0.9, true);
    }

    let leadIdx = this.bgmStep % this.leadArp.length;
    let leadFreq = this.leadArp[leadIdx];
    this.playSynthNote(leadFreq, 'square', now, stepDuration * 0.85, this.musicVolume * 0.45, false);

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

  // Son de panique quand Scorbunny détecte Onix
  playPanicSound() {
    this.init();
    if (!this.ctx) return;
    try {
      let now = this.ctx.currentTime;
      let vol = this.sfxVolume * 0.8;
      this.playChirp(now, 750, 1600, 0.07, vol);
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

  // Son de croquement "NOM" / "CHOMP" quand Onix dévore un Scorbunny
  playNomSound() {
    this.init();
    if (!this.ctx) return;
    try {
      let now = this.ctx.currentTime;
      let vol = this.sfxVolume;

      // 1. Croquement croustillant (crunch 1)
      this.playBiteCrunch(now, vol);

      // 2. Deuxième morsure plus percutante (crunch 2)
      this.playBiteCrunch(now + 0.07, vol * 1.1);

      // 3. Petit gloups / pop de déglutition cartoon
      let oscGulp = this.ctx.createOscillator();
      let gainGulp = this.ctx.createGain();
      oscGulp.type = 'sine';
      oscGulp.frequency.setValueAtTime(280, now + 0.12);
      oscGulp.frequency.exponentialRampToValueAtTime(650, now + 0.19);
      oscGulp.frequency.exponentialRampToValueAtTime(140, now + 0.28);

      gainGulp.gain.setValueAtTime(vol * 0.7, now + 0.12);
      gainGulp.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      oscGulp.connect(gainGulp);
      gainGulp.connect(this.ctx.destination);
      oscGulp.start(now + 0.12);
      oscGulp.stop(now + 0.3);
    } catch (e) {}
  }

  playBiteCrunch(time, vol) {
    let bufferSize = this.ctx.sampleRate * 0.06;
    let buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    let data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    let noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    let filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, time);
    filter.Q.setValueAtTime(3, time);

    let gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol * 1.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(time);
  }

  // Son de crash rocheux percutant (mur ou auto-collision)
  playCrashSound() {
    this.init();
    if (!this.ctx) return;
    try {
      let now = this.ctx.currentTime;
      let vol = this.sfxVolume * 1.3;

      let osc = this.ctx.createOscillator();
      let gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.37);
    } catch (e) {}
  }
}
