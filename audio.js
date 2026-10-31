// Web Audio API Sound Effects & Ambient Chiptune Music for Jumping Shell
class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicPlaying = false;
    this.musicTimer = null;
    this.step = 0;
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
    if (!this.musicPlaying) {
      this.startMusic();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopMusic();
    } else {
      this.init();
      this.startMusic();
    }
    return this.muted;
  }

  playTone(freq, endFreq, duration, type = 'square', gainVal = 0.12) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }
    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  jump(size = 1) {
    const base = 260 - (size - 1) * 30;
    this.playTone(base, base * 1.65, 0.13, 'square', 0.1);
  }

  shedShell(size = 2) {
    const base = 320 + (4 - size) * 45;
    this.playTone(base, base * 1.9, 0.15, 'triangle', 0.15);
    setTimeout(() => this.playTone(base * 1.3, base * 2.1, 0.1, 'square', 0.08), 35);
  }

  nestShell(size = 2) {
    const base = 220 + size * 40;
    this.playTone(base * 0.8, base * 1.25, 0.12, 'triangle', 0.14);
  }

  buttonPress() {
    this.playTone(440, 580, 0.08, 'sine', 0.1);
  }

  buttonRelease() {
    this.playTone(520, 380, 0.08, 'sine', 0.08);
  }

  breakBlock() {
    this.playTone(180, 65, 0.14, 'sawtooth', 0.12);
  }

  orbGrow() {
    this.playTone(340, 680, 0.18, 'sine', 0.13);
  }

  orbShrink() {
    this.playTone(620, 290, 0.18, 'sine', 0.13);
  }

  paint(color) {
    if (color === 'blue') {
      this.playTone(390, 520, 0.14, 'triangle', 0.11);
    } else {
      this.playTone(520, 390, 0.14, 'triangle', 0.11);
    }
  }

  explode() {
    this.playTone(120, 32, 0.3, 'sawtooth', 0.2);
  }

  die() {
    this.playTone(300, 90, 0.28, 'sawtooth', 0.15);
  }

  win() {
    if (this.muted) return;
    this.init();
    const notes = [392, 493.88, 587.33, 783.99];
    notes.forEach((n, idx) => {
      setTimeout(() => this.playTone(n, n * 1.02, 0.16, 'triangle', 0.13), idx * 70);
    });
  }

  startMusic() {
    if (this.muted || this.musicPlaying) return;
    this.musicPlaying = true;
    // Gentle puzzle marimba/synth loop inspired by Robert Alvarez's soundtrack
    const melody = [
      261.63, 329.63, 392.00, 329.63, 440.00, 392.00, 329.63, 293.66,
      261.63, 329.63, 392.00, 523.25, 493.88, 392.00, 329.63, 293.66,
      220.00, 261.63, 329.63, 261.63, 349.23, 329.63, 261.63, 246.94,
      196.00, 246.94, 293.66, 392.00, 349.23, 329.63, 293.66, 246.94
    ];
    this.musicTimer = setInterval(() => {
      if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
      const freq = melody[this.step % melody.length];
      this.step++;
      this.playTone(freq, freq, 0.22, 'sine', 0.03);
    }, 280);
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

window.sound = new SoundManager();

