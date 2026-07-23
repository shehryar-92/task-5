# Fallboard — Piano Simulator

A browser piano played with the mouse or the computer keyboard, built on [Tone.js](https://tonejs.github.io/).

## Run it

Open `index.html` in any modern browser. No build step, no install.

## Play

- **A S D F G H J K L** — white keys, one octave and a third (C to D)
- **W E · T Y U · O** — black keys interleaved above
- **Z / X** — shift an octave down / up
- **Space** (hold) — sustain pedal, same as the one under a real piano
- Click or tap keys directly with a mouse or touchscreen

## Files

| File | Purpose |
|---|---|
| `index.html` | Markup and control layout |
| `styles.css` | Rosewood/ivory theme (plus a light "studio" variant) |
| `notes.js` | Pure note/frequency/keymap logic, no DOM or audio dependency |
| `app.js` | Renders the keybed and wires up Tone.js, input, and controls |
| `notes.test.js` | Node test suite for `notes.js` — run with `node notes.test.js` |

## Notes

- Audio is a `Tone.PolySynth` — swap the **Voice** dropdown to change oscillator type.
- Volume, octave, and theme all update live; nothing is persisted between sessions.
