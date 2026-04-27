// ─────────────────────────────────────────────────────────────────────────────
// Gloria's Adventures — Game Audio (Tone.js)
// All sounds are synthesized, no audio files needed.
// ─────────────────────────────────────────────────────────────────────────────

window.GameAudio = (() => {
  let _started = false;

  // Unlock Web Audio context on first user interaction (browser policy)
  async function _start() {
    if (!_started) {
      await Tone.start();
      _started = true;
    }
  }

  // ── Helper: create, play, auto-dispose ────────────────────────────────────
  function _play(buildFn, disposeMs = 1200) {
    _start().then(() => {
      const node = buildFn();
      setTimeout(() => { try { node.dispose(); } catch(e) {} }, disposeMs);
    });
  }

  // ── Jump — quick upward boing ─────────────────────────────────────────────
  function jump() {
    _play(() => {
      const synth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.005, decay: 0.18, sustain: 0.05, release: 0.12 }
      }).toDestination();
      synth.volume.value = -7;
      const now = Tone.now();
      synth.triggerAttackRelease('C5',  '32n', now);
      synth.triggerAttackRelease('G5',  '32n', now + 0.07);
      return synth;
    }, 800);
  }

  // ── Duck — short swoosh down ───────────────────────────────────────────────
  function duck() {
    _play(() => {
      const synth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.01, decay: 0.18, sustain: 0, release: 0.05 }
      }).toDestination();
      synth.volume.value = -9;
      const now = Tone.now();
      synth.triggerAttackRelease('G4', '32n', now);
      synth.triggerAttackRelease('D4', '32n', now + 0.08);
      return synth;
    }, 800);
  }

  // ── Kick — punchy thud ────────────────────────────────────────────────────
  function kick() {
    _play(() => {
      const mem = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 6,
        envelope: { attack: 0.001, decay: 0.22, sustain: 0, release: 0.08 }
      }).toDestination();
      mem.volume.value = -4;
      mem.triggerAttackRelease('C2', '8n');
      return mem;
    }, 1000);
  }

  // ── Clear — little "ding!" when an obstacle vanishes ─────────────────────
  function clear() {
    _play(() => {
      const synth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.08 }
      }).toDestination();
      synth.volume.value = -6;
      synth.triggerAttackRelease('A5', '16n');
      return synth;
    }, 800);
  }

  // ── Next Row — "drop" descending blip ─────────────────────────────────────
  function nextRow() {
    _play(() => {
      const synth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 }
      }).toDestination();
      synth.volume.value = -8;
      const now = Tone.now();
      synth.triggerAttackRelease('G4', '32n', now);
      synth.triggerAttackRelease('D4', '32n', now + 0.09);
      synth.triggerAttackRelease('A3', '16n', now + 0.18);
      return synth;
    }, 1000);
  }

  // ── Win — happy fanfare ───────────────────────────────────────────────────
  function win() {
    _play(() => {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.3, release: 0.4 }
      }).toDestination();
      synth.volume.value = -5;
      const now = Tone.now();
      synth.triggerAttackRelease(['C4','E4','G4'],         '8n',  now);
      synth.triggerAttackRelease(['E4','G4','B4'],         '8n',  now + 0.22);
      synth.triggerAttackRelease(['C4','E4','G4','C5'],    '4n',  now + 0.44);
      return synth;
    }, 3000);
  }

  // ── Aha moment — triumphant chord stab ───────────────────────────────────
  function aha() {
    _play(() => {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.02, decay: 0.5, sustain: 0.4, release: 0.6 }
      }).toDestination();
      synth.volume.value = -6;
      const now = Tone.now();
      synth.triggerAttackRelease(['C3','G3','E4','C5'], '2n', now);
      return synth;
    }, 3000);
  }

  // ── Level start — quick ascending jingle ─────────────────────────────────
  function levelStart() {
    _play(() => {
      const synth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.01, decay: 0.15, sustain: 0.1, release: 0.1 }
      }).toDestination();
      synth.volume.value = -7;
      const now = Tone.now();
      synth.triggerAttackRelease('C4', '16n', now);
      synth.triggerAttackRelease('E4', '16n', now + 0.1);
      synth.triggerAttackRelease('G4', '16n', now + 0.2);
      synth.triggerAttackRelease('C5', '8n',  now + 0.3);
      return synth;
    }, 1500);
  }

  // ── Wrong / error — low buzzer ────────────────────────────────────────────
  function error() {
    _play(() => {
      const synth = new Tone.Synth({
        oscillator: { type: 'square' },
        envelope: { attack: 0.01, decay: 0.25, sustain: 0, release: 0.08 }
      }).toDestination();
      synth.volume.value = -10;
      synth.triggerAttackRelease('C3', '8n');
      return synth;
    }, 800);
  }

  // ── Home screen / storyline button click ─────────────────────────────────
  function click() {
    _play(() => {
      const synth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.05 }
      }).toDestination();
      synth.volume.value = -12;
      synth.triggerAttackRelease('E5', '32n');
      return synth;
    }, 400);
  }

  return { jump, duck, kick, clear, nextRow, win, aha, levelStart, error, click };
})();
