(function () {
  const whiteKeysEl = document.getElementById('whiteKeys');
  const octaveReadout = document.getElementById('octaveReadout');
  const octaveDownBtn = document.getElementById('octaveDown');
  const octaveUpBtn = document.getElementById('octaveUp');
  const waveformSelect = document.getElementById('waveform');
  const volumeSlider = document.getElementById('volume');
  const themeToggle = document.getElementById('themeToggle');
  const pedalBtn = document.getElementById('pedal');

  const state = {
    octave: 4,
    theme: 'dark',
    sustain: false,
    heldByKey: new Map(),
    sustainedMidis: new Set(),
  };

  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: waveformSelect.value },
    envelope: { attack: 0.005, decay: 0.15, sustain: 0.5, release: 0.6 },
  }).toDestination();

  synth.volume.value = sliderToDb(volumeSlider.value);

  function sliderToDb(value) {
    const v = Number(value) / 100;
    return v <= 0 ? -Infinity : (v - 1) * 30;
  }

  function noteId(midi) {
    return NoteUtils.NOTE_NAMES[midi % 12] + Math.floor(midi / 12 - 1);
  }

  function render() {
    const layout = NoteUtils.buildKeyboardLayout(state.octave);
    whiteKeysEl.innerHTML = '';
    octaveReadout.textContent = 'C' + state.octave;

    const whites = layout.filter((k) => !k.isBlack);
    const blackWidth = 7.2;

    whites.forEach((note) => {
      const el = document.createElement('div');
      el.className = 'key-white';
      el.dataset.midi = note.midi;
      el.dataset.computerKey = note.computerKey;
      el.innerHTML = `<span class="key-label">${note.computerKey.toUpperCase()}</span>`;
      whiteKeysEl.appendChild(el);
    });

    let whiteIndex = -1;
    layout.forEach((note) => {
      if (!note.isBlack) {
        whiteIndex++;
        return;
      }
      const el = document.createElement('div');
      el.className = 'key-black';
      el.dataset.midi = note.midi;
      el.dataset.computerKey = note.computerKey;
      const centerPercent = ((whiteIndex + 1) / whites.length) * 100;
      el.style.left = `calc(${centerPercent}% - ${blackWidth / 2}%)`;
      el.innerHTML = `<span class="key-label">${note.computerKey.toUpperCase()}</span>`;
      whiteKeysEl.appendChild(el);
    });
  }

  function findKeyEl(midi) {
    return whiteKeysEl.querySelector(`[data-midi="${midi}"]`);
  }

  function pressMidi(midi) {
    if (state.sustainedMidis.has(midi)) return;
    const el = findKeyEl(midi);
    if (el) el.classList.add('active');
    Tone.start();
    synth.triggerAttack(noteId(midi));
  }

  function releaseMidi(midi) {
    if (state.sustain) {
      state.sustainedMidis.add(midi);
      return;
    }
    const el = findKeyEl(midi);
    if (el) el.classList.remove('active');
    synth.triggerRelease(noteId(midi));
  }

  function releaseAllSustained() {
    state.sustainedMidis.forEach((midi) => {
      const el = findKeyEl(midi);
      if (el) el.classList.remove('active');
      synth.triggerRelease(noteId(midi));
    });
    state.sustainedMidis.clear();
  }

  function midiFromEl(el) {
    return el && el.dataset.midi ? Number(el.dataset.midi) : null;
  }

  whiteKeysEl.addEventListener('pointerdown', (e) => {
    const midi = midiFromEl(e.target.closest('[data-midi]'));
    if (midi === null) return;
    e.target.setPointerCapture(e.pointerId);
    pressMidi(midi);
  });

  whiteKeysEl.addEventListener('pointerup', (e) => {
    const midi = midiFromEl(e.target.closest('[data-midi]'));
    if (midi === null) return;
    releaseMidi(midi);
  });

  whiteKeysEl.addEventListener('pointerleave', (e) => {
    const midi = midiFromEl(e.target.closest('[data-midi]'));
    if (midi === null || !e.buttons) return;
    releaseMidi(midi);
  });

  document.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    const char = e.key.toLowerCase();
    if (char === 'z') {
      shiftOctave(-1);
      return;
    }
    if (char === 'x') {
      shiftOctave(1);
      return;
    }
    if (char === ' ') {
      e.preventDefault();
      engagePedal(true);
      return;
    }
    const layout = NoteUtils.buildKeyboardLayout(state.octave);
    const note = NoteUtils.findByComputerKey(layout, char);
    if (!note || state.heldByKey.has(char)) return;
    state.heldByKey.set(char, note.midi);
    pressMidi(note.midi);
  });

  document.addEventListener('keyup', (e) => {
    const char = e.key.toLowerCase();
    if (char === ' ') {
      engagePedal(false);
      return;
    }
    const midi = state.heldByKey.get(char);
    if (midi === undefined) return;
    state.heldByKey.delete(char);
    releaseMidi(midi);
  });

  function shiftOctave(delta) {
    state.octave = NoteUtils.clampOctave(state.octave + delta);
    render();
  }

  function engagePedal(on) {
    state.sustain = on;
    pedalBtn.classList.toggle('engaged', on);
    if (!on) releaseAllSustained();
  }

  octaveDownBtn.addEventListener('click', () => shiftOctave(-1));
  octaveUpBtn.addEventListener('click', () => shiftOctave(1));

  waveformSelect.addEventListener('change', () => {
    synth.set({ oscillator: { type: waveformSelect.value } });
  });

  volumeSlider.addEventListener('input', () => {
    synth.volume.value = sliderToDb(volumeSlider.value);
  });

  pedalBtn.addEventListener('pointerdown', () => engagePedal(true));
  pedalBtn.addEventListener('pointerup', () => engagePedal(false));
  pedalBtn.addEventListener('pointerleave', () => {
    if (state.sustain) engagePedal(false);
  });

  themeToggle.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    themeToggle.textContent = state.theme === 'dark' ? 'Studio: Rosewood' : 'Studio: Ivory';
  });

  render();
})();
