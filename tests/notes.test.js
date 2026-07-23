const assert = require('assert');
const NoteUtils = require('../notes.js');

function test(name, fn) {
  try {
    fn();
    console.log('  ok  -', name);
  } catch (err) {
    console.error('  FAIL -', name);
    console.error('       ', err.message);
    process.exitCode = 1;
  }
}

console.log('notes.js test suite');

test('midiToFreq(69) is A4 = 440Hz', () => {
  assert.strictEqual(NoteUtils.midiToFreq(69), 440);
});

test('midiToFreq(60) is middle C ≈ 261.63Hz', () => {
  const freq = NoteUtils.midiToFreq(60);
  assert.ok(Math.abs(freq - 261.6255653) < 0.001);
});

test('buildKeyboardLayout(4) returns 15 keys', () => {
  const layout = NoteUtils.buildKeyboardLayout(4);
  assert.strictEqual(layout.length, 15);
});

test('first key is C at the base octave, midi 60', () => {
  const layout = NoteUtils.buildKeyboardLayout(4);
  assert.strictEqual(layout[0].noteName, 'C');
  assert.strictEqual(layout[0].octave, 4);
  assert.strictEqual(layout[0].midi, 60);
});

test('last key (l) rolls into the next octave, D5', () => {
  const layout = NoteUtils.buildKeyboardLayout(4);
  const last = layout[layout.length - 1];
  assert.strictEqual(last.computerKey, 'l');
  assert.strictEqual(last.noteName, 'D');
  assert.strictEqual(last.octave, 5);
});

test('black keys land on w, e, t, y, u, o', () => {
  const layout = NoteUtils.buildKeyboardLayout(4);
  const blacks = layout.filter((k) => k.isBlack).map((k) => k.computerKey);
  assert.deepStrictEqual(blacks, ['w', 'e', 't', 'y', 'u', 'o']);
});

test('white keys land on a, s, d, f, g, h, j, k, l', () => {
  const layout = NoteUtils.buildKeyboardLayout(4);
  const whites = layout.filter((k) => !k.isBlack).map((k) => k.computerKey);
  assert.deepStrictEqual(whites, ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l']);
});

test('clampOctave keeps values within [MIN_OCTAVE, MAX_OCTAVE]', () => {
  assert.strictEqual(NoteUtils.clampOctave(0), NoteUtils.MIN_OCTAVE);
  assert.strictEqual(NoteUtils.clampOctave(10), NoteUtils.MAX_OCTAVE);
  assert.strictEqual(NoteUtils.clampOctave(4), 4);
});

test('findByComputerKey finds the right note', () => {
  const layout = NoteUtils.buildKeyboardLayout(4);
  const found = NoteUtils.findByComputerKey(layout, 'g');
  assert.ok(found);
  assert.strictEqual(found.noteName, 'G');
  assert.strictEqual(found.octave, 4);
});

test('findByComputerKey returns null for unmapped key', () => {
  const layout = NoteUtils.buildKeyboardLayout(4);
  assert.strictEqual(NoteUtils.findByComputerKey(layout, 'q'), null);
});

test('raising the octave shifts every midi value up by 12', () => {
  const low = NoteUtils.buildKeyboardLayout(3);
  const high = NoteUtils.buildKeyboardLayout(4);
  low.forEach((note, i) => {
    assert.strictEqual(high[i].midi - note.midi, 12);
  });
});
