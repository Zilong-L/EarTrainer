import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Chord, Interval, Note } from 'tonal';
import {
  buildChordQuestion,
  chooseNextChord,
  createChordEvents,
  type ChordChoice,
  type ChordEvent,
  type ChordPlaybackOptions,
  type ChordQuestion,
  type InversionMode,
} from '../src/pages/EarTrainers/ChordColorTrainer/musicTheory.ts';
import {
  CHORD_TYPES,
  chordPreset,
  VoicingDictionary,
} from '../src/pages/EarTrainers/ChordColorTrainer/Constants.ts';

const tonicNames = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'F#',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
];
const chordIntervals: Record<string, number[]> = {
  M: [0, 4, 7],
  m: [0, 3, 7],
  dim: [0, 3, 6],
  o: [0, 3, 6],
  M7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  '7': [0, 4, 7, 10],
  dim7: [0, 3, 6, 9],
  m7b5: [0, 3, 6, 10],
  aug: [0, 4, 8],
};
const choice = { degree: 'I', chordType: 'M' };
const options: ChordPlaybackOptions = {
  bassEnabled: false,
  bassLevel: 0.3,
  backingMode: 'off',
  tonic: 'C3',
  minor: false,
};
const getQuestion = (
  chordChoice: ChordChoice = choice,
  tonic = 'C3',
  range: [string, string] = ['C3', 'C5'],
  inversion: InversionMode = 'root',
  random = () => 0
): ChordQuestion => {
  const question = buildChordQuestion(
    chordChoice,
    tonic,
    range,
    inversion,
    random
  );
  assert.ok(question);
  return question;
};
const midi = (note: number | string): number => {
  const value = typeof note === 'number' ? note : Note.midi(note);
  assert.notEqual(value, null);
  return value!;
};
const chroma = (note: number | string): number => midi(note) % 12;
const eventEnd = (event: ChordEvent) => event.time + event.duration;
const foreground = (events: ChordEvent[]) =>
  events.filter(event => event.voice === 'foreground');

function assertAscending(notes: string[]) {
  const values = notes.map(midi);
  values.forEach((value, index) => {
    if (index > 0) assert.ok(value > values[index - 1]);
  });
}

function assertValidEvents(events: ChordEvent[]) {
  events.forEach(event => {
    assert.ok(midi(event.note) >= 0 && midi(event.note) <= 127);
    assert.ok(Number.isFinite(event.time) && event.time >= 0);
    assert.ok(Number.isFinite(event.duration) && event.duration > 0);
    assert.ok(event.velocity! >= 0 && event.velocity! <= 1);
  });
}

describe('buildChordQuestion', () => {
  it('voices every supported chord quality in all 12 roots and three inversions', () => {
    assert.ok(CHORD_TYPES.every(type => type in chordIntervals));
    for (const tonic of tonicNames) {
      for (const [chordType, expected] of Object.entries(chordIntervals)) {
        for (const [inversion, index] of [
          ['root', 0],
          ['first', 1],
          ['second', 2],
        ] as const) {
          const question = getQuestion(
            { degree: 'I', chordType },
            tonic,
            ['C3', 'C5'],
            inversion
          );
          const root = Note.chroma(tonic)!;
          const pitchClasses = question.notes.map(chroma).sort((a, b) => a - b);
          assert.deepEqual(
            pitchClasses,
            expected.map(value => (root + value) % 12).sort((a, b) => a - b)
          );
          assert.equal(question.root, tonic);
          assert.equal(question.inversion, index);
          assert.equal(
            chroma(question.notes[0]),
            (root + expected[index]) % 12
          );
          assert.equal(midi(question.notes[0]) - midi(question.bassNote), 12);
          assert.equal(chroma(question.bassNote), chroma(question.notes[0]));
          assertAscending(question.notes);
          assert.ok(
            question.notes.every(note => midi(note) >= 48 && midi(note) <= 72)
          );
        }
      }
    }
  });

  it('keeps inverted bass on the third or fifth instead of restoring the root', () => {
    assert.deepEqual(getQuestion(choice, 'C3', ['C3', 'C5'], 'first').notes, [
      'E3',
      'G3',
      'C4',
    ]);
    assert.equal(
      getQuestion(choice, 'C3', ['C3', 'C5'], 'first').bassNote,
      'E2'
    );
    assert.deepEqual(getQuestion(choice, 'C3', ['C3', 'C5'], 'second').notes, [
      'G3',
      'C4',
      'E4',
    ]);
    assert.equal(
      getQuestion(choice, 'C3', ['C3', 'C5'], 'second').bassNote,
      'G2'
    );
  });

  it('resolves exact suffix/prefix accidentals and preserves scale-degree spelling', () => {
    const roots: Record<string, string> = {
      I: 'C',
      IIb: 'Db',
      II: 'D',
      IIIb: 'Eb',
      III: 'E',
      IV: 'F',
      Vb: 'Gb',
      V: 'G',
      VIb: 'Ab',
      VI: 'A',
      VIIb: 'Bb',
      VII: 'B',
      'I#': 'C#',
      'II#': 'D#',
      'III#': 'E#',
      'IV#': 'F#',
      'V#': 'G#',
      'VI#': 'A#',
      'VII#': 'B#',
      Ib: 'Cb',
      IVb: 'Fb',
      bIII: 'Eb',
      '#IV': 'F#',
      iii: 'E',
      iiib: 'Eb',
      bvii: 'Bb',
    };
    for (const [degree, root] of Object.entries(roots)) {
      assert.equal(getQuestion({ degree, chordType: 'm7b5' }).root, root);
    }
    assert.equal(
      getQuestion({ degree: 'IIIb', chordType: 'M' }, 'F#3').root,
      'A'
    );
    assert.equal(
      getQuestion({ degree: 'Vb', chordType: '7' }, 'Eb3').root,
      'Bbb'
    );
  });

  it('corrects the natural-minor preset to C D Eb F G Ab Bb', () => {
    const roots = chordPreset.小调.map(
      setting =>
        getQuestion({
          degree: setting.degree,
          chordType: setting.chordTypes[0],
        }).root
    );
    assert.deepEqual(roots, ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb']);
    assert.deepEqual(
      chordPreset.小调.map(setting => setting.chordTypes[0]),
      ['m', 'o', 'M', 'm', 'm', 'M', 'M']
    );
  });

  it('preserves difficult enharmonic and diminished-seventh spellings', () => {
    for (const tonic of ['Cb', 'B#', 'F##', 'Ebb']) {
      for (const inversion of ['root', 'first', 'second'] as const) {
        const question = getQuestion(choice, tonic, ['C3', 'C5'], inversion);
        assertAscending(question.notes);
        assert.equal(chroma(question.bassNote), chroma(question.notes[0]));
      }
    }
    assert.deepEqual(getQuestion({ degree: 'I', chordType: 'dim7' }).notes, [
      'C3',
      'Eb3',
      'Gb3',
      'Bbb3',
    ]);
  });

  it('uses Tonal intervals for extensions and keeps first inversion on the third', () => {
    for (const chordType of ['69', '7b9', '7b13', '7#11', 'mM7', 'm6', '13']) {
      const question = getQuestion(
        { degree: 'I', chordType },
        'C3',
        ['C3', 'C5'],
        'first'
      );
      const expected = [
        ...new Set(
          Chord.get(`C${chordType}`).notes.map(note => Note.chroma(note))
        ),
      ].sort();
      assert.deepEqual(question.notes.map(chroma).sort(), expected);
      assert.equal(
        chroma(question.notes[0]),
        Note.chroma(Chord.get(`C${chordType}`).notes[1])
      );
      assertAscending(question.notes);
    }
  });

  it('honors bounds when possible and predictably extends only the upper bound', () => {
    assert.deepEqual(getQuestion(choice, 'C3', ['D3', 'C5']).notes, [
      'C4',
      'E4',
      'G4',
    ]);
    assert.deepEqual(getQuestion(choice, 'C3', ['E3', 'B3'], 'first').notes, [
      'E3',
      'G3',
      'C4',
    ]);
    assert.deepEqual(getQuestion(choice, 'C3', ['C3', 'C3']).notes, [
      'C3',
      'E3',
      'G3',
    ]);
    assert.deepEqual(getQuestion(choice, 'C3', ['C5', 'C3']).notes, [
      'C3',
      'E3',
      'G3',
    ]);
    assert.deepEqual(getQuestion(choice, 'C3', ['broken', 'range']).notes, [
      'C3',
      'E3',
      'G3',
    ]);
    assert.deepEqual(getQuestion(choice, 'C3', ['', 'C4']).notes, [
      'C3',
      'E3',
      'G3',
    ]);
    for (const range of [
      ['C-1', 'C-1'],
      ['F#9', 'G9'],
    ] as [string, string][]) {
      const question = getQuestion(choice, 'C3', range);
      assert.ok(
        [...question.notes, question.bassNote].every(
          note => midi(note) >= 0 && midi(note) <= 127
        )
      );
      assert.equal(midi(question.notes[0]) - midi(question.bassNote), 12);
    }
  });

  it('supports deterministic random inversions including seventh-chord third inversion', () => {
    const seventh = { degree: 'I', chordType: 'M7' };
    assert.equal(
      getQuestion(seventh, 'C', ['C3', 'C5'], 'random', () => 0).inversion,
      0
    );
    const question = getQuestion(
      seventh,
      'C',
      ['C3', 'C5'],
      'random',
      () => 0.99
    );
    assert.equal(question.inversion, 3);
    assert.equal(question.bassNote, 'B2');
    assert.equal(
      getQuestion(seventh, 'C', ['C3', 'C5'], 'random', () => 1).inversion,
      3
    );
    assert.equal(
      getQuestion(seventh, 'C', ['C3', 'C5'], 'random', () => NaN).inversion,
      0
    );
  });

  it('returns null for invalid tonic, degree, or chord quality', () => {
    assert.equal(
      buildChordQuestion(choice, 'invalid', ['C3', 'C5'], 'root'),
      null
    );
    assert.equal(
      buildChordQuestion(
        { degree: 'IIIbm', chordType: 'M' },
        'C',
        ['C3', 'C5'],
        'root'
      ),
      null
    );
    assert.equal(
      buildChordQuestion(
        { degree: 'I', chordType: 'not-a-chord' },
        'C',
        ['C3', 'C5'],
        'root'
      ),
      null
    );
    for (const chordType of ['b7', '#7']) {
      assert.equal(
        buildChordQuestion(
          { degree: 'I', chordType },
          'C',
          ['C3', 'C5'],
          'root'
        ),
        null
      );
    }
  });

  it('matches Tonal for every legacy root-position interval definition', () => {
    for (const type of Object.keys(VoicingDictionary.rootPosition)) {
      assert.deepEqual(
        VoicingDictionary.rootPosition[type][0]
          .split(' ')
          .map(interval => Interval.semitones(interval)),
        Chord.get(`C${type}`).intervals.map(interval =>
          Interval.semitones(interval)
        )
      );
    }
  });
});

describe('chooseNextChord', () => {
  const minor = { degree: 'I', chordType: 'm' };
  const dominant = { degree: 'V', chordType: '7' };

  it('handles no candidates without calling randomness', () => {
    const never = () => {
      throw new Error('randomness should not be needed');
    };
    assert.equal(chooseNextChord([], null, never), null);
    assert.equal(chooseNextChord(null, null, never), null);
    assert.equal(chooseNextChord(undefined, null, never), null);
  });

  it('allows a single chord to repeat and terminates with duplicate-only choices', () => {
    assert.equal(
      chooseNextChord([choice], choice, () => 0),
      choice
    );
    assert.equal(
      chooseNextChord([choice, { ...choice }], choice, () => 0.9),
      choice
    );
  });

  it('samples unique choices stably and excludes the current answer', () => {
    const choices = [choice, minor, { ...choice }, dominant, { ...minor }];
    assert.equal(
      chooseNextChord(choices, null, () => 0),
      choice
    );
    assert.equal(
      chooseNextChord(choices, null, () => 0.5),
      minor
    );
    assert.equal(
      chooseNextChord(choices, null, () => 1),
      dominant
    );
    assert.equal(
      chooseNextChord(choices, choice, () => 0),
      minor
    );
    assert.equal(
      chooseNextChord(choices, choice, () => 1),
      dominant
    );
    assert.equal(
      chooseNextChord(choices, { degree: 'IV', chordType: 'M' }, () => 0),
      choice
    );
  });
});

describe('createChordEvents', () => {
  const question = getQuestion(choice, 'C3', ['C3', 'C5'], 'first');

  it('creates block, ascending, descending, random, and default patterns', () => {
    const block = createChordEvents(question, 'block', 60, options);
    assert.deepEqual(
      block.map(event => event.note),
      question.notes
    );
    assert.ok(block.every(event => event.time === 0 && event.duration === 2));
    const ascending = createChordEvents(question, 'ascending', 60, options);
    assert.deepEqual(
      ascending.map(event => event.note),
      question.notes
    );
    assert.deepEqual(
      ascending.map(event => event.time),
      [0, 0.25, 0.5]
    );
    const descending = createChordEvents(question, 'descending', 60, options);
    assert.deepEqual(
      descending.map(event => event.note),
      [...question.notes].reverse()
    );
    const random = createChordEvents(question, 'random', 60, {
      ...options,
      random: () => 0,
    });
    assert.deepEqual(
      random.map(event => event.note),
      ['G3', 'C4', 'E3']
    );
    assert.deepEqual(
      random,
      createChordEvents(question, 'random', 60, { ...options, random: () => 0 })
    );
    const combined = createChordEvents(question, 'default', 60, options);
    assert.equal(combined.length, 4 * question.notes.length);
    assert.equal(Math.max(...combined.map(eventEnd)), 8);
    assert.deepEqual(
      createChordEvents(question, 'unknown', 60, options),
      combined
    );
    [block, ascending, descending, random, combined].forEach(assertValidEvents);
  });

  it('adds one quiet, independently timed bass with the inversion intact', () => {
    for (const pattern of [
      'block',
      'ascending',
      'descending',
      'random',
      'default',
    ]) {
      const events = createChordEvents(question, pattern, 60, {
        ...options,
        bassEnabled: true,
      });
      const bass = events.filter(event => event.voice === 'bass');
      assert.equal(bass.length, 1);
      assert.equal(chroma(bass[0].note), chroma(question.notes[0]));
      assert.notEqual(chroma(bass[0].note), Note.chroma(question.root));
      assert.equal(bass[0].time, 0);
      assert.equal(
        bass[0].duration,
        Math.max(...foreground(events).map(eventEnd))
      );
      assert.equal(bass[0].velocity, 0.15);
      assert.ok(bass[0].velocity! < foreground(events)[0].velocity!);
    }
    assert.ok(
      createChordEvents(question, 'block', 60, options).every(
        event => event.voice !== 'bass'
      )
    );
    assert.ok(
      createChordEvents(question, 'block', 60, {
        ...options,
        bassEnabled: true,
        bassLevel: 0,
      }).every(event => event.voice !== 'bass')
    );
    const wrongBass = { ...question, bassNote: 'C2' };
    assert.equal(
      chroma(
        createChordEvents(wrongBass, 'block', 60, {
          ...options,
          bassEnabled: true,
        }).find(event => event.voice === 'bass')!.note
      ),
      4
    );
  });

  it('uses correct major and harmonic-minor cadence qualities', () => {
    for (const minor of [false, true]) {
      const events = createChordEvents(question, 'block', 60, {
        ...options,
        backingMode: 'cadence',
        minor,
      });
      const context = events.slice(0, 12);
      const pitchClasses = [0, 1, 2, 3].map(index =>
        context.slice(index * 3, index * 3 + 3).map(event => chroma(event.note))
      );
      assert.deepEqual(
        pitchClasses,
        minor
          ? [
              [0, 3, 7],
              [5, 8, 0],
              [7, 11, 2],
              [0, 3, 7],
            ]
          : [
              [0, 4, 7],
              [5, 9, 0],
              [7, 11, 2],
              [0, 4, 7],
            ]
      );
    }
  });

  it('ends all backing notes at least half a second before target or bass', () => {
    for (const backingMode of ['tonic', 'cadence'] as const) {
      for (const bpm of [30, 40, 120, 240]) {
        const events = createChordEvents(question, 'default', bpm, {
          ...options,
          backingMode,
          bassEnabled: true,
        });
        const prefixLength = backingMode === 'tonic' ? 3 : 12;
        const context = events.slice(0, prefixLength);
        const target = events.slice(prefixLength);
        const contextEnd = Math.max(...context.map(eventEnd));
        const targetStart = Math.min(...target.map(event => event.time));
        assert.ok(targetStart - contextEnd >= 0.5 - 1e-9);
        assert.ok(context.every(event => eventEnd(event) < targetStart));
        assert.equal(target.filter(event => event.voice === 'bass').length, 1);
        assertValidEvents(events);
      }
    }
  });

  it('plays major/minor tonic context only as a detached prefix', () => {
    for (const minor of [false, true]) {
      const events = createChordEvents(question, 'block', 60, {
        ...options,
        backingMode: 'tonic',
        minor,
      });
      assert.equal(events.length, 6);
      assert.deepEqual(
        events.slice(0, 3).map(event => chroma(event.note)),
        minor ? [0, 3, 7] : [0, 4, 7]
      );
      assert.deepEqual(
        events.slice(3).map(event => event.note),
        question.notes
      );
    }
    assert.deepEqual(
      createChordEvents(question, 'block', 60, {
        ...options,
        backingMode: 'cadence',
        tonic: 'invalid',
      }),
      createChordEvents(question, 'block', 60, options)
    );
  });

  it('clamps BPM and bass level and keeps invalid BPM safe', () => {
    assert.deepEqual(
      createChordEvents(question, 'block', 1, options),
      createChordEvents(question, 'block', 30, options)
    );
    assert.deepEqual(
      createChordEvents(question, 'block', 10000, options),
      createChordEvents(question, 'block', 240, options)
    );
    for (const bpm of [0, -10, NaN, Infinity]) {
      assert.deepEqual(
        createChordEvents(question, 'block', bpm, options),
        createChordEvents(question, 'block', 60, options)
      );
    }
    const bass = createChordEvents(question, 'block', 60, {
      ...options,
      bassEnabled: true,
      bassLevel: 5,
    }).find(event => event.voice === 'bass');
    assert.equal(bass!.velocity, 0.5);
  });

  it('returns silence for null or empty questions, even with context and bass enabled', () => {
    const enabled = {
      ...options,
      backingMode: 'cadence' as const,
      bassEnabled: true,
    };
    assert.deepEqual(createChordEvents(null, 'block', 60, enabled), []);
    assert.deepEqual(createChordEvents(undefined, 'block', 60, enabled), []);
    assert.deepEqual(
      createChordEvents({ ...question, notes: [] }, 'block', 60, enabled),
      []
    );
    assert.deepEqual(
      createChordEvents(
        { ...question, notes: ['invalid'] },
        'block',
        60,
        enabled
      ),
      []
    );
  });
});
