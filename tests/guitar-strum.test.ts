import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildStrumEvents,
  getGuitarShapes,
  GUITAR_SHAPES,
  shapeNotes,
  STANDARD_TUNING,
  type GuitarChordId,
  type GuitarFrets,
  type GuitarShape,
  type GuitarStyle,
  type SweepSpeed,
} from '../src/features/practice/guitarStrum.ts';

const chordIds: GuitarChordId[] = [
  'A-major',
  'A-minor',
  'E-major',
  'E-minor',
  'D-major',
  'D-minor',
];
const roots: Record<GuitarChordId, number> = {
  'A-major': 9,
  'A-minor': 9,
  'E-major': 4,
  'E-minor': 4,
  'D-major': 2,
  'D-minor': 2,
};
const expectedBass: Record<GuitarChordId, number[]> = {
  'A-major': [45, 45, 57],
  'A-minor': [45, 45, 57],
  'E-major': [40, 52, 52],
  'E-minor': [40, 52, 52],
  'D-major': [50, 50, 50],
  'D-minor': [50, 50, 50],
};
const approx = (actual: number, expected: number, tolerance = 1e-10) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} should be within ${tolerance} of ${expected}`
  );
const makeShape = (frets: GuitarFrets): GuitarShape => ({
  id: 'custom-test-grip',
  chordId: 'E-minor',
  label: { en: 'Test grip', zh: '测试指型' },
  position: 'low',
  frets,
});

describe('audited six-string guitar grips', () => {
  it('uses standard tuning in low-to-high physical string order', () => {
    assert.deepEqual(STANDARD_TUNING, [40, 45, 50, 55, 59, 64]);
    const openE = getGuitarShapes('E-major')[0];
    assert.deepEqual(shapeNotes(openE), [
      { stringIndex: 0, stringNumber: 6, fret: 0, midi: 40 },
      { stringIndex: 1, stringNumber: 5, fret: 2, midi: 47 },
      { stringIndex: 2, stringNumber: 4, fret: 2, midi: 52 },
      { stringIndex: 3, stringNumber: 3, fret: 1, midi: 56 },
      { stringIndex: 4, stringNumber: 2, fret: 0, midi: 59 },
      { stringIndex: 5, stringNumber: 1, fret: 0, midi: 64 },
    ]);
  });

  it('offers open, low, and upper positions for all six chords', () => {
    assert.equal(GUITAR_SHAPES.length, 18);
    assert.equal(new Set(GUITAR_SHAPES.map(shape => shape.id)).size, 18);
    for (const chordId of chordIds) {
      const shapes = getGuitarShapes(chordId);
      assert.equal(shapes.length, 3);
      assert.deepEqual(
        shapes.map(shape => shape.position),
        ['open', 'low', 'upper']
      );
      assert.equal(new Set(shapes.map(shape => shape.frets.join(','))).size, 3);
      assert.ok(shapes.every(shape => shape.chordId === chordId));
      assert.ok(shapes.every(shape => shape.label.en && shape.label.zh));
    }
    assert.deepEqual(getGuitarShapes('unknown' as GuitarChordId), []);
  });

  it('preserves known playable grips rather than arbitrary pitch-valid combinations', () => {
    // E and A forms have the ordinary barre + finger cluster. D forms are
    // four-string grips with one finger on each string, including the root.
    const expected: Record<GuitarChordId, GuitarFrets[]> = {
      'A-major': [
        [null, 0, 2, 2, 2, 0],
        [5, 7, 7, 6, 5, 5],
        [null, null, 7, 9, 10, 9],
      ],
      'A-minor': [
        [null, 0, 2, 2, 1, 0],
        [5, 7, 7, 5, 5, 5],
        [null, null, 7, 9, 10, 8],
      ],
      'E-major': [
        [0, 2, 2, 1, 0, 0],
        [null, null, 2, 4, 5, 4],
        [null, 7, 9, 9, 9, 7],
      ],
      'E-minor': [
        [0, 2, 2, 0, 0, 0],
        [null, null, 2, 4, 5, 3],
        [null, 7, 9, 9, 8, 7],
      ],
      'D-major': [
        [null, null, 0, 2, 3, 2],
        [null, 5, 7, 7, 7, 5],
        [10, 12, 12, 11, 10, 10],
      ],
      'D-minor': [
        [null, null, 0, 2, 3, 1],
        [null, 5, 7, 7, 6, 5],
        [10, 12, 12, 10, 10, 10],
      ],
    };
    for (const chordId of chordIds)
      assert.deepEqual(
        getGuitarShapes(chordId).map(shape => shape.frets),
        expected[chordId]
      );
  });

  it('contains the complete major/minor triad and no foreign pitch class', () => {
    for (const shape of GUITAR_SHAPES) {
      const root = roots[shape.chordId];
      const third = shape.chordId.endsWith('major') ? 4 : 3;
      const expected = [root, (root + third) % 12, (root + 7) % 12].sort(
        (a, b) => a - b
      );
      assert.deepEqual(
        [...new Set(shapeNotes(shape).map(note => note.midi % 12))].sort(
          (a, b) => a - b
        ),
        expected,
        shape.id
      );
    }
  });

  it('keeps the exact expected root MIDI as the lowest sounding pitch', () => {
    for (const chordId of chordIds) {
      const notes = getGuitarShapes(chordId).map(shape => shapeNotes(shape));
      assert.deepEqual(
        notes.map(strings => Math.min(...strings.map(note => note.midi))),
        expectedBass[chordId]
      );
      for (const strings of notes) {
        assert.equal(
          strings[0].midi,
          Math.min(...strings.map(note => note.midi))
        );
        assert.equal(strings[0].midi % 12, roots[chordId]);
      }
    }
  });

  it('bounds every grip to six strings, frets 0–12, and a four-fret hand span', () => {
    for (const shape of GUITAR_SHAPES) {
      assert.equal(shape.frets.length, 6);
      const fretted: number[] = [];
      for (const fret of shape.frets) {
        if (fret === null) continue;
        assert.ok(Number.isInteger(fret) && fret >= 0 && fret <= 12, shape.id);
        if (fret > 0) fretted.push(fret);
      }
      assert.ok(Math.max(...fretted) - Math.min(...fretted) <= 4, shape.id);
      assert.ok(shapeNotes(shape).length >= 4);
    }
  });

  it('maps every note to its fret and excludes muted strings', () => {
    for (const shape of GUITAR_SHAPES) {
      const notes = shapeNotes(shape);
      assert.equal(
        notes.length,
        shape.frets.filter(fret => fret !== null).length
      );
      assert.deepEqual(
        notes.map(note => note.stringIndex),
        shape.frets.flatMap((fret, index) => (fret === null ? [] : [index]))
      );
      for (const note of notes) {
        assert.equal(note.stringNumber, 6 - note.stringIndex);
        assert.equal(note.fret, shape.frets[note.stringIndex]);
        assert.equal(note.midi, STANDARD_TUNING[note.stringIndex] + note.fret);
      }
    }
    assert.deepEqual(
      shapeNotes(makeShape([null, null, null, null, null, null])),
      []
    );
  });

  it('rejects invalid frets instead of silently detuning or emitting invalid MIDI', () => {
    for (const fret of [-1, 13, 0.5, NaN, Infinity])
      assert.throws(
        () => shapeNotes(makeShape([fret, null, null, null, null, null])),
        RangeError
      );
  });
});

describe('natural guitar sweep events', () => {
  it('defaults to a nylon downstroke with a fast sweep', () => {
    const shape = getGuitarShapes('E-minor')[0];
    const events = buildStrumEvents(shape);
    assert.deepEqual(events, buildStrumEvents(shape, { speed: 'fast' }));
    assert.ok(events.every(event => event.instrument === 'guitar-nylon'));
    assert.deepEqual(
      events.map(event => event.guitarString),
      [0, 1, 2, 3, 4, 5]
    );
    approx(events[0].time, 0);
    approx(events.at(-1)!.time, 0.06);
  });

  it('follows physical string order in both stroke directions', () => {
    for (const shape of GUITAR_SHAPES) {
      const notes = shapeNotes(shape);
      for (const direction of ['down', 'up'] as const) {
        const ordered = direction === 'down' ? notes : [...notes].reverse();
        const events = buildStrumEvents(shape, { direction, seed: 100 });
        assert.deepEqual(
          events.map(event => [event.guitarString, event.note]),
          ordered.map(note => [note.stringIndex, note.midi])
        );
        assert.equal(events.length, notes.length);
        for (let index = 1; index < events.length; index++)
          assert.ok(events[index].time > events[index - 1].time);
      }
    }
  });

  it('does not sort by pitch and retains separate strings playing the same MIDI', () => {
    const shape = makeShape([12, 7, null, null, null, 0]);
    const before = structuredClone(shape);
    assert.deepEqual(
      buildStrumEvents(shape).map(event => [event.guitarString, event.note]),
      [
        [0, 52],
        [1, 52],
        [5, 64],
      ]
    );
    const crossing = makeShape([12, 0, null, null, null, null]);
    assert.deepEqual(
      buildStrumEvents(crossing).map(event => event.note),
      [52, 45]
    );
    assert.deepEqual(shape, before);
  });

  it('is deterministic for a seed, while other seeds vary timing/dynamics only', () => {
    for (const shape of GUITAR_SHAPES) {
      const options = { speed: 'slow' as const, seed: 1729, start: 0.8 };
      const first = buildStrumEvents(shape, options);
      assert.deepEqual(first, buildStrumEvents(shape, options));
      const second = buildStrumEvents(shape, { ...options, seed: 1730 });
      assert.notDeepEqual(first, second);
      assert.deepEqual(
        first.map(event => [event.note, event.guitarString]),
        second.map(event => [event.note, event.guitarString])
      );
      assert.ok(
        first.some((event, index) => event.time !== second[index].time)
      );
      assert.ok(
        first.some((event, index) => event.velocity !== second[index].velocity)
      );
    }
  });

  it('pins sweep endpoints, bounds timing jitter, and keeps positive string spacing', () => {
    const speeds: SweepSpeed[] = ['fast', 'slow'];
    for (const shape of GUITAR_SHAPES) {
      for (const speed of speeds) {
        for (const direction of ['down', 'up'] as const) {
          const sweep = speed === 'fast' ? 0.06 : 0.2;
          const maxJitter = speed === 'fast' ? 0.0015 : 0.004;
          const start = 2.5;
          for (let seed = 0; seed < 100; seed++) {
            const events = buildStrumEvents(shape, {
              speed,
              direction,
              seed,
              start,
            });
            const firstString = events[0].guitarString;
            const physicalSpan = Math.abs(
              events.at(-1)!.guitarString - firstString
            );
            approx(events[0].time, start);
            approx(events.at(-1)!.time - start, sweep);
            for (let index = 0; index < events.length; index++) {
              const event = events[index];
              const ideal =
                start +
                (Math.abs(event.guitarString - firstString) / physicalSpan) *
                  sweep;
              approx(event.time, ideal, maxJitter + 1e-10);
              assert.ok(Number.isFinite(event.time) && event.time >= start);
              assert.ok(event.time <= start + sweep + 1e-10);
              if (index > 0) assert.ok(event.time > events[index - 1].time);
            }
          }
        }
      }
    }
  });

  it('accounts for an internal muted gap rather than collapsing physical string distance', () => {
    const shape = makeShape([0, null, null, 0, null, 0]);
    const events = buildStrumEvents(shape, { speed: 'slow', seed: 20 });
    assert.deepEqual(
      events.map(event => event.guitarString),
      [0, 3, 5]
    );
    approx(events[1].time, (3 / 5) * 0.2, 0.004);
    approx(events[2].time, 0.2);
  });

  it('bounds dynamics and leaves all strings sustaining together', () => {
    for (const shape of GUITAR_SHAPES) {
      for (const speed of ['fast', 'slow'] as const) {
        for (let seed = 0; seed < 50; seed++) {
          const events = buildStrumEvents(shape, { speed, seed });
          const lastAttack = events.at(-1)!.time;
          assert.ok(new Set(events.map(event => event.velocity)).size > 1);
          for (const event of events) {
            assert.ok(event.velocity >= 0.695 && event.velocity <= 0.825);
            assert.ok(Number.isInteger(event.note));
            assert.ok(Number.isFinite(event.duration) && event.duration > 0);
            assert.ok(event.time + event.duration > lastAttack + 0.09);
            assert.equal(event.duration, 1.4);
          }
        }
      }
    }
  });

  it('honors instrument, start, and sustain options without varying guitar pitch', () => {
    const shape = getGuitarShapes('D-major')[2];
    const instruments: GuitarStyle[] = ['guitar-acoustic', 'guitar-nylon'];
    for (const instrument of instruments) {
      const events = buildStrumEvents(shape, {
        speed: 'slow',
        instrument,
        start: 0.75,
        duration: 2.2,
      });
      assert.ok(events.every(event => event.instrument === instrument));
      assert.ok(events.every(event => event.duration === 2.2));
      assert.deepEqual(
        events.map(event => event.note),
        shapeNotes(shape).map(note => note.midi)
      );
      approx(events[0].time, 0.75);
      approx(events.at(-1)!.time, 0.95);
    }
  });

  it('handles empty/single-string grips and clamps invalid scheduling options safely', () => {
    assert.deepEqual(
      buildStrumEvents(makeShape([null, null, null, null, null, null])),
      []
    );
    const single = buildStrumEvents(
      makeShape([null, null, null, null, null, 0]),
      {
        speed: 'slow',
        direction: 'up',
        start: 1.2,
      }
    );
    assert.equal(single.length, 1);
    assert.equal(single[0].guitarString, 5);
    approx(single[0].time, 1.2);
    const shape = getGuitarShapes('E-major')[0];
    for (const value of [-1, NaN, Infinity]) {
      const events = buildStrumEvents(shape, {
        start: value,
        duration: value,
        seed: value,
      });
      assert.equal(events[0].time, 0);
      assert.ok(events.every(event => event.duration === 1.4));
      assert.ok(events.every(event => Number.isFinite(event.velocity)));
    }
    const short = buildStrumEvents(shape, { speed: 'slow', duration: 0.01 });
    assert.ok(
      short.every(event => event.time + event.duration > short.at(-1)!.time)
    );
  });
});
