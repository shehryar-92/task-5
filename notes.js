(function (root) {
  var NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  var KEY_DEFS = [
    { key: 'a', semitone: 0 },
    { key: 'w', semitone: 1 },
    { key: 's', semitone: 2 },
    { key: 'e', semitone: 3 },
    { key: 'd', semitone: 4 },
    { key: 'f', semitone: 5 },
    { key: 't', semitone: 6 },
    { key: 'g', semitone: 7 },
    { key: 'y', semitone: 8 },
    { key: 'h', semitone: 9 },
    { key: 'u', semitone: 10 },
    { key: 'j', semitone: 11 },
    { key: 'k', semitone: 12 },
    { key: 'o', semitone: 13 },
    { key: 'l', semitone: 14 },
  ];

  var BLACK_SEMITONES = [1, 3, 6, 8, 10];

  var MIN_OCTAVE = 2;
  var MAX_OCTAVE = 6;

  function isBlackSemitone(semitone) {
    return BLACK_SEMITONES.indexOf(semitone % 12) !== -1;
  }

  function noteNameForSemitone(semitone) {
    return NOTE_NAMES[semitone % 12];
  }

  function midiForOctaveSemitone(baseOctave, semitone) {
    return 12 * (baseOctave + 1) + semitone;
  }

  function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function clampOctave(octave) {
    return Math.max(MIN_OCTAVE, Math.min(MAX_OCTAVE, octave));
  }

  function buildKeyboardLayout(baseOctave) {
    baseOctave = clampOctave(baseOctave);
    return KEY_DEFS.map(function (def, index) {
      var midi = midiForOctaveSemitone(baseOctave, def.semitone);
      var octave = baseOctave + Math.floor(def.semitone / 12);
      return {
        index: index,
        computerKey: def.key,
        semitone: def.semitone,
        isBlack: isBlackSemitone(def.semitone),
        noteName: noteNameForSemitone(def.semitone),
        octave: octave,
        midi: midi,
        freq: midiToFreq(midi),
      };
    });
  }

  function findByComputerKey(layout, char) {
    for (var i = 0; i < layout.length; i++) {
      if (layout[i].computerKey === char) return layout[i];
    }
    return null;
  }

  var NoteUtils = {
    NOTE_NAMES: NOTE_NAMES,
    KEY_DEFS: KEY_DEFS,
    MIN_OCTAVE: MIN_OCTAVE,
    MAX_OCTAVE: MAX_OCTAVE,
    isBlackSemitone: isBlackSemitone,
    noteNameForSemitone: noteNameForSemitone,
    midiForOctaveSemitone: midiForOctaveSemitone,
    midiToFreq: midiToFreq,
    clampOctave: clampOctave,
    buildKeyboardLayout: buildKeyboardLayout,
    findByComputerKey: findByComputerKey,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = NoteUtils;
  } else {
    root.NoteUtils = NoteUtils;
  }
})(typeof window !== 'undefined' ? window : globalThis);
