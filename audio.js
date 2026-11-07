/**
 * Miracle of Pakistan - Authentic Pakistani Audio Engine
 * Supports Real Recorded Vehicle Audio (.wav / .mp3) AND
 * Multi-Harmonic Synthesized Pakistani 2-Stroke & 4-Stroke Engines,
 * 4-Tone Musical Pressure Horns, and Metal Impact Crash Effects.
 */

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = false;

    // Real Audio Files Cache
    this.audioFiles = {
      engine: null,
      cd70: null,
      horn: null,
      crash: null,
      chai: null
    };

    // Synthesizer Nodes
    this.engineNodes = null;
    this.currentSpeedKmh = 0;
    this.vehicleType = 'rickshaw'; // 'rickshaw', 'cd70', 'mehran'
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    // Load authentic audio files (WAV primary, MP3 fallback)
    this.loadRealAudio('engine', 'assets/audio/engine.wav', 'assets/audio/engine.mp3');
    this.loadRealAudio('cd70', 'assets/audio/cd70.wav', 'assets/audio/cd70.mp3');
    this.loadRealAudio('horn', 'assets/audio/horn.wav', 'assets/audio/horn.mp3');
    this.loadRealAudio('crash', 'assets/audio/crash.wav', 'assets/audio/crash.mp3');

    this.setupRealisticEngineSynth();
  }

  loadRealAudio(key, primaryUrl, fallbackUrl) {
    const audio = new Audio(primaryUrl);
    audio.preload = 'auto';
    audio.addEventListener('canplaythrough', () => {
      this.audioFiles[key] = audio;
      console.log(`Real Audio Loaded: ${key} (${primaryUrl})`);
    });
    audio.addEventListener('error', () => {
      if (fallbackUrl) {
        const fbAudio = new Audio(fallbackUrl);
        fbAudio.preload = 'auto';
        fbAudio.addEventListener('canplaythrough', () => {
          this.audioFiles[key] = fbAudio;
          console.log(`Real Audio Fallback Loaded: ${key} (${fallbackUrl})`);
        });
        fbAudio.addEventListener('error', () => {
          this.audioFiles[key] = null;
        });
      } else {
        this.audioFiles[key] = null;
      }
    });
  }

  // Multi-Harmonic Realistic Engine Synthesizer
  setupRealisticEngineSynth() {
    if (!this.ctx) return;

    // Cylinder Combustion Oscillator
    const baseOsc = this.ctx.createOscillator();
    baseOsc.type = 'sawtooth';
    baseOsc.frequency.setValueAtTime(32, this.ctx.currentTime);

    // Piston Stroke LFO Pulses (Thump-thump-thump)
    const strokeLfo = this.ctx.createOscillator();
    strokeLfo.type = 'square';
    strokeLfo.frequency.setValueAtTime(14, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.65, this.ctx.currentTime);

    // Exhaust Pipe Resonator Filter (Distinct 2-stroke tinny exhaust)
    const exhaustFilter = this.ctx.createBiquadFilter();
    exhaustFilter.type = 'bandpass';
    exhaustFilter.frequency.setValueAtTime(160, this.ctx.currentTime);
    exhaustFilter.Q.setValueAtTime(4.0, this.ctx.currentTime);

    // Mechanical Noise Generator (Rattling chain & valves)
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(800, this.ctx.currentTime);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    // Main Engine Master Gain
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

    baseOsc.connect(exhaustFilter);
    strokeLfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);
    exhaustFilter.connect(masterGain);
    noiseGain.connect(masterGain);
    masterGain.connect(this.ctx.destination);

    baseOsc.start();
    strokeLfo.start();
    noiseSource.start();

    this.engineNodes = {
      baseOsc,
      strokeLfo,
      exhaustFilter,
      masterGain
    };
  }

  // Modulate engine pitch and roar based on speed and selected vehicle
  updateEngineSpeed(speedKmh, vehicleType = 'rickshaw') {
    this.currentSpeedKmh = speedKmh;
    this.vehicleType = vehicleType;

    // Use active real audio file if available
    let activeAudio = null;
    if (vehicleType === 'cd70' && this.audioFiles.cd70) {
      activeAudio = this.audioFiles.cd70;
      if (this.audioFiles.engine) this.audioFiles.engine.pause();
    } else if (this.audioFiles.engine) {
      activeAudio = this.audioFiles.engine;
      if (this.audioFiles.cd70) this.audioFiles.cd70.pause();
    }

    if (activeAudio) {
      if (activeAudio.paused && !this.isMuted) {
        activeAudio.loop = true;
        activeAudio.play().catch(() => {});
      }
      const rate = Math.max(0.65, Math.min(2.1, 0.72 + (speedKmh / 65)));
      activeAudio.playbackRate = rate;
      activeAudio.volume = this.isMuted ? 0 : 0.65;
      return;
    }

    if (!this.ctx || !this.engineNodes || this.isMuted) return;

    const norm = Math.max(0.1, Math.min(1.4, speedKmh / 60));
    let baseFreq, strokeRate, filterFreq, vol;

    if (vehicleType === 'cd70') {
      // High-pitched 4-stroke Honda CD70 whirr
      baseFreq = 48 + norm * 70;
      strokeRate = 18 + norm * 35;
      filterFreq = 340 + norm * 260;
      vol = 0.09 + norm * 0.08;
    } else if (vehicleType === 'mehran') {
      // 4-cylinder 800cc Mehran engine
      baseFreq = 38 + norm * 50;
      strokeRate = 16 + norm * 24;
      filterFreq = 220 + norm * 200;
      vol = 0.08 + norm * 0.07;
    } else {
      // Classic 2-stroke Rickshaw thrum
      baseFreq = 30 + norm * 45;
      strokeRate = 12 + norm * 28;
      filterFreq = 160 + norm * 190;
      vol = 0.12 + norm * 0.10;
    }

    const t = this.ctx.currentTime;
    this.engineNodes.baseOsc.frequency.setTargetAtTime(baseFreq, t, 0.08);
    this.engineNodes.strokeLfo.frequency.setTargetAtTime(strokeRate, t, 0.08);
    this.engineNodes.exhaustFilter.frequency.setTargetAtTime(filterFreq, t, 0.08);
    this.engineNodes.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : vol, t, 0.08);
  }

  // Real Pakistani Pressure Horn (Authentic 3-Tone Harmonics)
  playHorn() {
    if (this.isMuted) return;

    if (this.audioFiles.horn) {
      this.audioFiles.horn.currentTime = 0;
      this.audioFiles.horn.volume = 0.9;
      this.audioFiles.horn.play().catch(() => {});
      return;
    }

    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const tones = [349.23, 440.00, 523.25, 659.25];

    tones.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq * 0.95, t);
      osc.frequency.exponentialRampToValueAtTime(freq, t + 0.06);
      osc.frequency.setValueAtTime(freq, t + 0.35);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.92, t + 0.45);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.12 - idx * 0.02, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.46);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.48);
    });
  }

  // Metal Crunch & Crash Sound
  playCrash() {
    if (this.isMuted) return;

    if (this.audioFiles.crash) {
      this.audioFiles.crash.currentTime = 0;
      this.audioFiles.crash.volume = 0.95;
      this.audioFiles.crash.play().catch(() => {});
      return;
    }

    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.7;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.12));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, t);
    filter.frequency.exponentialRampToValueAtTime(45, t + 0.6);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.65);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
  }

  playChaiPickup() {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const t = this.ctx.currentTime;
    const notes = [587.33, 880, 1174.66];

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);

      gain.gain.setValueAtTime(0.001, t + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.15, t + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.06 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.4);
    });
  }

  playNearMiss() {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.25);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.engineNodes && this.ctx) {
      this.engineNodes.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);
    }
    if (this.audioFiles.engine) this.audioFiles.engine.muted = this.isMuted;
    if (this.audioFiles.cd70) this.audioFiles.cd70.muted = this.isMuted;
    return this.isMuted;
  }
}

const sounds = new SoundSystem();
