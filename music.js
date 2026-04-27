// ─────────────────────────────────────────────────────────────────────────────
// Gloria's Adventures — Background Music (Tone.js chiptune)
// Each level has a 2-bar looping theme. Low volume, non-distracting.
// ─────────────────────────────────────────────────────────────────────────────

window.GameMusic = (() => {

  let _melSynth  = null;
  let _basSynth  = null;
  let _melSeq    = null;
  let _basSeq    = null;
  let _transport = false;   // has Transport been started yet?

  const MEL_VOL = -13;   // melody  (dB) — sine waves are perceptually quieter so bump up a bit
  const BAS_VOL = -17;   // bass slightly quieter

  // ── Track library ─────────────────────────────────────────────────────────
  // Each track: { bpm, mel[], bas[] }
  // Arrays are 16 entries = 2 bars of 8th notes (4/4).
  // null = rest.  Bass entries are half-speed (every other slot filled).
  // ──────────────────────────────────────────────────────────────────────────
  const TRACKS = {

    // 🏠 Home — C major, cozy/playful
    home: {
      bpm: 100,
      mel: ['C5','E5','G5','E5', 'D5','F5','A5','F5',
            'E5','G5','C6','G5', 'E5','C5','D5', null],
      bas: ['C3', null,'G2', null, 'F2', null,'C3', null,
            'G2', null,'D3', null, 'C3', null,'G2', null],
    },

    // ⭐ Level 0 — G major, gentle & cute
    level0: {
      bpm: 88,
      mel: ['G4','B4','D5','B4', 'G5', null,'D5', null,
            'A4','C5','E5','C5', 'D5','B4','A4', null],
      bas: ['G2', null,'D3', null, 'G2', null,'D2', null,
            'A2', null,'E3', null, 'D2', null,'D3', null],
    },

    // 🔄 Level 1 — C major, upbeat & bouncy
    level1: {
      bpm: 112,
      mel: ['C5','E5','G5','C6', 'G5','E5','G5', null,
            'F5','A5','C6', null, 'A5','G5','E5', null],
      bas: ['C3', null,'G2', null, 'C3', null,'E2', null,
            'F2', null,'C3', null, 'G2', null,'C3', null],
    },

    // 🗂️ Level 2 — A minor, ominous & brooding
    level2: {
      bpm: 82,
      mel: ['A4','C5','E5','C5', 'A4','G4','F4', null,
            'A4','B4','C5','B4', 'A4','E4','F4', null],
      bas: ['A2', null,'E2', null, 'F2', null,'G2', null,
            'A2', null,'E2', null, 'D2', null,'E2', null],
    },

    // 🎭 Level 3 — D minor, medium tension
    level3: {
      bpm: 96,
      mel: ['D4','F4','A4','F4', 'D5', null,'C5', null,
            'Bb4','D5','F5', null, 'A4','G4','F4', null],
      bas: ['D2', null,'A2', null, 'D3', null,'A2', null,
            'Bb2',null,'F2', null, 'C3', null,'A2', null],
    },

    // 🕷️ Level 4 — E minor, creepy (tritone Bb1 in bass = devil's interval!)
    level4: {
      bpm: 78,
      mel: ['E4','G4','B4','G4', 'E4','D4','C4', null,
            'E4','F4','G4','F4', 'E4','B3','C4', null],
      bas: ['E2', null,'B1', null, 'C2', null,'D2', null,
            'E2', null,'Bb1',null, 'C2', null,'B1', null],
    },

    // 🏆 Level 5 — C# minor, intense & driving
    level5: {
      bpm: 102,
      mel: ['C#5','E5','G#5','E5', 'C#5','B4','A4', null,
            'C#5','E5','G#5','A5', 'F#5','E5','D#5', null],
      bas: ['C#2',null,'G#2',null, 'A2', null,'E2', null,
            'F#2',null,'C#2',null, 'G#2',null,'C#3',null],
    },

    // 🚁 Level 6 — D major, triumphant & heroic
    level6: {
      bpm: 122,
      mel: ['D5','F#5','A5','F#5', 'D5','C#5','B4', null,
            'D5','F#5','A5','B5',  'A5','G5','F#5', null],
      bas: ['D2', null,'A2', null, 'G2', null,'A2', null,
            'D2', null,'A2', null, 'G2', null,'A2', null],
    },

  };

  // ── Internal: ensure Tone.js AudioContext is unlocked ────────────────────
  async function _ensureStarted() {
    await Tone.start();
    _transport = true;
  }

  // ── Stop and dispose current track cleanly ────────────────────────────────
  function stop() {
    [_melSeq, _basSeq].forEach(seq => {
      if (seq) { try { seq.stop(); seq.dispose(); } catch(e) {} }
    });
    [_melSynth, _basSynth].forEach(syn => {
      if (syn) { try { syn.dispose(); } catch(e) {} }
    });
    _melSeq = _basSeq = _melSynth = _basSynth = null;
  }

  // ── Play a named track (stops any current music first) ───────────────────
  async function play(trackName) {
    await _ensureStarted();
    stop();

    // Reset playhead so the new sequences start cleanly from bar 1
    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.Transport.position = 0;

    const t = TRACKS[trackName];
    if (!t) return;

    Tone.Transport.bpm.value = t.bpm;

    // Melody — sine wave with short pluck decay = music box / marimba feel
    _melSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope:   { attack: 0.001, decay: 0.55, sustain: 0.0, release: 0.1 },
    }).toDestination();
    _melSynth.volume.value = MEL_VOL;

    // Bass — triangle wave, a little rounder and warmer
    _basSynth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope:   { attack: 0.001, decay: 0.7, sustain: 0.05, release: 0.15 },
    }).toDestination();
    _basSynth.volume.value = BAS_VOL;

    // Sequences — 8th-note grid, nulls = rests
    // '4n' duration lets the pluck ring out naturally before the next note
    _melSeq = new Tone.Sequence((time, note) => {
      if (note && _melSynth) _melSynth.triggerAttackRelease(note, '4n', time);
    }, t.mel, '8n');

    _basSeq = new Tone.Sequence((time, note) => {
      if (note && _basSynth) _basSynth.triggerAttackRelease(note, '4n', time);
    }, t.bas, '8n');

    _melSeq.loop = true;
    _basSeq.loop = true;
    _melSeq.start(0);
    _basSeq.start(0);

    Tone.Transport.start('+0.05');
  }

  // Only plays if music isn't muted (checked via the toggle button state)
  function playIfUnmuted(trackName) {
    const btn = document.getElementById('music-toggle-btn');
    if (btn && btn.classList.contains('muted')) return;
    play(trackName);
  }

  return { play, stop, playIfUnmuted };
})();
