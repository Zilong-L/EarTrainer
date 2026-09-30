import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  CHAPTERS,
  createSeededRng,
  generateComparisonExample,
  generateLessonExamples,
  generateQuestion,
  generateSessionQuestions,
  getLesson,
  LESSONS,
  PRACTICE_MIDI_RANGE,
  SESSION_LENGTH,
  text,
  type LessonId,
  type PracticeEvent,
} from '../src/features/practice/model.ts';
import {
  getProgress,
  isFirstAttemptSuccess,
  MAX_SAVED_SESSIONS,
  PROGRESS_STORAGE_KEY,
  saveSession,
  summarizeProgress,
  type Progress,
  type SessionResult,
  type StorageLike,
} from '../src/features/practice/progress.ts';

class MemoryStorage implements StorageLike {
  values = new Map<string, string>();
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}
const empty: Progress = { version: 1, sessions: [] };
const day = 1_700_000_000_000;
const makeResults = (lessonId: LessonId, start = 0): SessionResult[] => {
  const lesson = getLesson(lessonId)!;
  return Array.from({ length: SESSION_LENGTH }, (_, index) => {
    const answer = lesson.choices[(index + start) % lesson.choices.length].id;
    return {
      questionId: `q-${start}-${index}`,
      answer,
      selectedAnswer: answer,
      firstAttemptCorrect: true,
      usedHint: false,
      revealed: false,
      skipped: false,
      tonicPitchClass: (index + start) % 12,
    };
  });
};
const assertEvents = (events: PracticeEvent[]) =>
  events.forEach(item => {
    assert.ok(Number.isInteger(item.note));
    assert.ok(
      item.note >= PRACTICE_MIDI_RANGE[0] && item.note <= PRACTICE_MIDI_RANGE[1]
    );
    assert.ok(Number.isFinite(item.time) && item.time >= 0);
    assert.ok(Number.isFinite(item.duration) && item.duration > 0);
    assert.ok(item.velocity! > 0 && item.velocity! <= 1);
  });

describe('guided curriculum', () => {
  it('offers connected bilingual topics across six open musical chapters', () => {
    assert.equal(LESSONS.length, 25);
    assert.equal(CHAPTERS.length, 6);
    assert.equal(
      new Set(LESSONS.map(lesson => lesson.id)).size,
      LESSONS.length
    );
    assert.deepEqual(
      new Set(CHAPTERS.flatMap(chapter => chapter.lessonIds)),
      new Set(LESSONS.map(lesson => lesson.id))
    );
    for (const chapter of CHAPTERS) {
      assert.ok(chapter.lessonIds.length >= 3 && chapter.lessonIds.length <= 5);
      assert.ok(
        chapter.title.en &&
          chapter.title.zh &&
          chapter.description.en &&
          chapter.description.zh &&
          chapter.symbol
      );
      for (const id of chapter.lessonIds)
        assert.equal(getLesson(id)!.chapterId, chapter.id);
    }
    assert.equal(new Set(LESSONS.map(lesson => lesson.stage)).size, 6);
    for (const lesson of LESSONS) {
      for (const label of [
        lesson.title,
        lesson.description,
        lesson.instruction,
        lesson.focus,
      ]) {
        assert.ok(text(label, 'en'));
        assert.ok(text(label, 'zh-CN'));
      }
      assert.equal(
        new Set(lesson.choices.map(choice => choice.id)).size,
        lesson.choices.length
      );
    }
    assert.deepEqual(
      getLesson('triads-core')!.choices.map(choice => choice.id),
      ['major', 'minor']
    );
    assert.deepEqual(
      getLesson('triads-diminished')!.choices.map(choice => choice.id),
      ['major', 'minor', 'diminished']
    );
    assert.equal(getLesson('degrees-diatonic')!.choices.length, 7);
    assert.equal(getLesson('unknown'), undefined);
    assert.throws(() => generateQuestion('unknown' as LessonId), RangeError);
  });

  it('provides a labeled unscored demonstration of every answer class', () => {
    for (const lesson of LESSONS) {
      const examples = generateLessonExamples(lesson.id);
      assert.deepEqual(
        examples.map(example => example.choice.id),
        lesson.choices.map(choice => choice.id)
      );
      for (const example of examples) {
        assertEvents(example.events);
        assertEvents(example.referenceEvents);
        assert.ok(example.explanation.en && example.explanation.zh);
      }
    }
    assert.deepEqual(generateLessonExamples('unknown' as LessonId), []);
  });

  it('creates deterministic eight-question sessions without answer-bearing IDs/prompts', () => {
    for (const lesson of LESSONS) {
      const first = generateSessionQuestions(lesson.id, createSeededRng(10));
      assert.deepEqual(
        first,
        generateSessionQuestions(lesson.id, createSeededRng(10))
      );
      assert.equal(first.length, SESSION_LENGTH);
      assert.equal(
        new Set(first.map(question => question.id)).size,
        SESSION_LENGTH
      );
      assert.equal(new Set(first.map(question => question.prompt.en)).size, 1);
      for (const question of first) {
        assert.ok(question.id.startsWith('q'));
        assert.ok(
          question.choices.some(choice => choice.id === question.answer)
        );
        assert.ok(question.events.length > 0);
        assert.ok(question.explanation.en && question.explanation.zh);
        assertEvents(question.events);
        assertEvents(question.referenceEvents);
        assertEvents(question.hintEvents);
      }
    }
  });

  it('samples class before root, permits repeated answers, and handles edge RNG values', () => {
    const stream = [0.9, 0, 0.1];
    const question = generateQuestion(
      'triads-core',
      () => stream.shift() ?? 0,
      'minor'
    );
    assert.equal(question.answer, 'minor');
    assert.equal(question.tonic, 48);
    assert.equal(
      generateQuestion('triads-core', () => 0, 'major').answer,
      'major'
    );
    for (const invalid of [NaN, Infinity, -1, 1, 10]) {
      for (const lesson of LESSONS) {
        const sample = generateQuestion(lesson.id, () => invalid);
        assertEvents([
          ...sample.events,
          ...sample.referenceEvents,
          ...sample.hintEvents,
        ]);
        assert.ok(sample.choices.some(choice => choice.id === sample.answer));
      }
    }
  });

  it('keeps answer-class and tonic-class frequencies approximately uniform', () => {
    for (const lesson of LESSONS) {
      const rng = createSeededRng(1729);
      const classes = Object.fromEntries(
        lesson.choices.map(choice => [choice.id, 0])
      );
      const roots = Array<number>(12).fill(0);
      for (let index = 0; index < 6000; index++) {
        const question = generateQuestion(lesson.id, rng);
        classes[question.answer]++;
        roots[question.tonic % 12]++;
      }
      const expected = 6000 / lesson.choices.length;
      for (const count of Object.values(classes))
        assert.ok(Math.abs(count - expected) < expected * 0.15);
      for (const count of roots) assert.ok(Math.abs(count - 500) < 100);
    }
  });

  it('matches every answer to actual intervals, chord members, bass and phrase context', () => {
    const intervals: Record<string, number> = {
      m2: 1,
      M2: 2,
      m3: 3,
      M3: 4,
      P4: 5,
      TT: 6,
      P5: 7,
    };
    const triads: Record<string, number[]> = {
      major: [0, 4, 7],
      minor: [0, 3, 7],
      diminished: [0, 3, 6],
    };
    const sevenths: Record<string, number[]> = {
      maj7: [0, 4, 7, 11],
      dom7: [0, 4, 7, 10],
      min7: [0, 3, 7, 10],
      'half-dim7': [0, 3, 6, 10],
      dim7: [0, 3, 6, 9],
    };
    const inversion: Record<string, number> = {
      root: 0,
      first: 1,
      second: 2,
      third: 3,
    };
    const degrees = [0, 2, 4, 5, 7, 9, 11];
    const functions: Record<string, number> = {
      I: 0,
      ii: 2,
      IV: 5,
      V: 7,
      vi: 9,
      i: 0,
      iv: 5,
      v: 7,
      VI: 8,
    };
    const minorChords = ['ii', 'vi', 'i', 'iv', 'v'];
    const cadences: Record<string, string[]> = {
      authentic: ['I', 'IV', 'V', 'I'],
      half: ['I', 'vi', 'ii', 'V'],
      plagal: ['I', 'V', 'IV', 'I'],
      deceptive: ['I', 'IV', 'V', 'vi'],
    };
    const mod = (value: number) => ((value % 12) + 12) % 12;
    for (const lesson of LESSONS) {
      const rng = createSeededRng(917);
      for (let index = 0; index < 500; index++) {
        const question = generateQuestion(lesson.id, rng);
        const notes = question.events.map(event => event.note);
        assertEvents([
          ...question.events,
          ...question.referenceEvents,
          ...question.hintEvents,
        ]);
        switch (question.type) {
          case 'degree':
            assert.deepEqual(notes, [
              question.tonic +
                (question.answer === 'b3'
                  ? 3
                  : degrees[Number(question.answer) - 1]),
            ]);
            assert.equal(question.referenceEvents.length, 12);
            if (lesson.mode === 'minor') {
              assert.deepEqual(
                question.referenceEvents
                  .slice(0, 3)
                  .map(item => item.note - question.tonic),
                [0, 3, 7]
              );
              assert.deepEqual(
                question.referenceEvents
                  .slice(6, 9)
                  .map(item => item.note - question.tonic),
                [2, 7, 11]
              );
            }
            break;
          case 'interval': {
            const pair = lesson.mode === 'context' ? notes.slice(-2) : notes;
            assert.equal(pair.length, 2);
            assert.equal(
              pair[1] - pair[0],
              intervals[question.answer] *
                (lesson.mode === 'descending' ? -1 : 1)
            );
            assert.equal(
              question.referenceEvents.length,
              lesson.mode === 'context' ? 12 : 0
            );
            if (lesson.mode === 'context') {
              assert.equal(notes.length, 4);
              assert.deepEqual(notes.slice(0, 2), [
                question.tonic,
                question.tonic + 7,
              ]);
              assert.deepEqual(
                question.hintEvents.map(item => item.note),
                pair
              );
              assert.ok(question.prompt.en.includes('final two'));
              assert.ok(
                question.events.every(
                  (item, noteIndex) =>
                    noteIndex === 0 ||
                    item.time > question.events[noteIndex - 1].time
                )
              );
            }
            if (lesson.mode === 'harmonic')
              assert.ok(question.events.every(item => item.time === 0));
            break;
          }
          case 'triad':
            assert.deepEqual(
              notes
                .map(note => mod(note - question.tonic))
                .sort((a, b) => a - b),
              triads[question.answer]
            );
            assert.deepEqual(
              question.hintEvents.map(item => item.note - question.tonic),
              triads[question.answer]
            );
            if (lesson.mode === 'arpeggiated')
              assert.ok(question.events[1].time > question.events[0].time);
            else assert.ok(question.events.every(item => item.time === 0));
            break;
          case 'inversion': {
            const quality = question.construction.quality;
            assert.deepEqual(
              notes
                .map(note => mod(note - question.tonic))
                .sort((a, b) => a - b),
              triads[quality]
            );
            assert.equal(
              mod(Math.min(...notes) - question.tonic),
              triads[quality][inversion[question.answer]]
            );
            assert.ok(notes[0] < notes[1] && notes[1] < notes[2]);
            if (lesson.mode === 'open') assert.ok(notes[2] - notes[0] > 12);
            assert.equal(
              question.referenceEvents.length,
              lesson.mode === 'context' ? 12 : 0
            );
            if (lesson.mode === 'context')
              assert.deepEqual(
                question.referenceEvents
                  .slice(0, 3)
                  .map(item => item.note - question.tonic),
                triads[quality]
              );
            break;
          }
          case 'function':
            assert.deepEqual(
              notes.map(note => note - question.tonic),
              triads[
                minorChords.includes(question.answer) ? 'minor' : 'major'
              ].map(offset => offset + functions[question.answer])
            );
            assert.equal(question.referenceEvents.length, 12);
            break;
          case 'seventh':
            assert.deepEqual(
              notes.map(note => note - question.tonic),
              sevenths[question.answer]
            );
            assert.equal(notes.length, 4);
            assert.ok(question.events.every(item => item.time === 0));
            break;
          case 'seventh-inversion': {
            const quality = ['maj7', 'dom7', 'min7'][
              question.construction.variant
            ];
            assert.deepEqual(
              notes
                .map(note => mod(note - question.tonic))
                .sort((a, b) => a - b),
              sevenths[quality]
            );
            assert.equal(
              mod(Math.min(...notes) - question.tonic),
              sevenths[quality][inversion[question.answer]]
            );
            assert.equal(new Set(notes.map(mod)).size, 4);
            break;
          }
          case 'bass-motion': {
            assert.equal(notes.length, 6);
            const bass1 = Math.min(...notes.slice(0, 3));
            const bass2 = Math.min(...notes.slice(3));
            const movement: Record<string, number> = {
              hold: 0,
              'up-step': 1,
              'down-step': -1,
              'up-fifth': 7,
              'down-fifth': -7,
            };
            assert.equal(bass2 - bass1, movement[question.answer]);
            assert.deepEqual(
              question.hintEvents.map(item => item.note),
              [bass1, bass2]
            );
            assert.deepEqual(
              question.events.map(item => item.time),
              [0, 0, 0, 1.6, 1.6, 1.6]
            );
            break;
          }
          case 'cadence':
          case 'progression': {
            const symbols =
              question.type === 'cadence'
                ? cadences[question.answer]
                : question.answer.split('-');
            assert.equal(notes.length, 12);
            for (const [chordIndex, symbol] of symbols.entries()) {
              const offsets =
                triads[minorChords.includes(symbol) ? 'minor' : 'major'];
              assert.deepEqual(
                notes
                  .slice(chordIndex * 3, chordIndex * 3 + 3)
                  .map(note => note - question.tonic),
                offsets.map(offset => offset + functions[symbol])
              );
              assert.ok(
                question.events
                  .slice(chordIndex * 3, chordIndex * 3 + 3)
                  .every(
                    item => Math.abs(item.time - chordIndex * 1.1) < 0.00001
                  )
              );
            }
            assert.equal(question.referenceEvents.length, 12);
            assert.ok(
              question.events
                .slice(-3)
                .every(item => item.duration > question.events[0].duration)
            );
            if (question.type === 'progression')
              assert.deepEqual(
                question.hintEvents.map(item => item.note - question.tonic),
                symbols.map(symbol => functions[symbol])
              );
            else
              assert.deepEqual(
                question.hintEvents.map(item => item.note),
                notes.slice(-6)
              );
            break;
          }
          default:
            assert.fail(`Unverified exercise type: ${String(question.type)}`);
        }
      }
    }
  });

  it('makes wrong-versus-correct contrasts in the same key and incidental context', () => {
    for (const lesson of LESSONS) {
      const rng = createSeededRng(918);
      for (let index = 0; index < 20; index++) {
        const question = generateQuestion(lesson.id, rng);
        const exact = generateComparisonExample(question, question.answer)!;
        assert.deepEqual(exact.events, question.events);
        assert.deepEqual(exact.hintEvents, question.hintEvents);
        assert.deepEqual(exact.referenceEvents, question.referenceEvents);
        for (const option of lesson.choices) {
          const alternative = generateComparisonExample(question, option.id)!;
          assert.equal(alternative.tonic, question.tonic);
          assert.deepEqual(alternative.construction, question.construction);
          assert.deepEqual(
            alternative.referenceEvents,
            question.referenceEvents
          );
          assertEvents([...alternative.events, ...alternative.hintEvents]);
          if (option.id !== question.answer)
            assert.notDeepEqual(alternative.events, question.events);
        }
        assert.equal(
          generateComparisonExample(question, 'not-an-option'),
          undefined
        );
      }
    }
  });

  it('keeps the melodic context prefix and key reference independent of the answer', () => {
    const lesson = getLesson('intervals-context')!;
    const examples = generateLessonExamples(lesson.id);
    for (const example of examples) {
      assert.deepEqual(
        example.events.slice(0, 2),
        examples[0].events.slice(0, 2)
      );
      assert.deepEqual(example.referenceEvents, examples[0].referenceEvents);
    }
    assert.deepEqual(
      examples[0].events.slice(-2).map(item => item.note - examples[0].tonic),
      [4, 7]
    );
  });
});

describe('local guided progress', () => {
  it('starts empty and survives missing, corrupt, oversized and future-version storage', () => {
    const storage = new MemoryStorage();
    assert.deepEqual(getProgress(storage), empty);
    for (const invalid of [
      '{bad',
      'null',
      JSON.stringify({ version: 99, sessions: [] }),
      'x'.repeat(512001),
    ]) {
      storage.setItem(PROGRESS_STORAGE_KEY, invalid);
      assert.deepEqual(getProgress(storage), empty);
    }
    const blocked = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    assert.deepEqual(getProgress(blocked), empty);
    const saved = saveSession(
      { lessonId: 'degrees-core', results: makeResults('degrees-core') },
      blocked
    );
    assert.equal(saved.saved, false);
    assert.equal(saved.error, 'unavailable');
    assert.equal(saved.progress.sessions.length, 1);
    const quota = {
      getItem: () => null,
      setItem: () => {
        const error = new Error('full');
        error.name = 'QuotaExceededError';
        throw error;
      },
    };
    assert.equal(
      saveSession(
        { lessonId: 'degrees-core', results: makeResults('degrees-core') },
        quota
      ).error,
      'quota'
    );
  });

  it('round-trips only complete valid sessions and idempotently saves a given ID', () => {
    const storage = new MemoryStorage();
    const input = {
      id: 'session-one',
      lessonId: 'degrees-core' as LessonId,
      results: makeResults('degrees-core'),
      completedAt: day,
    };
    assert.equal(saveSession(input, storage).saved, true);
    assert.equal(saveSession(input, storage).saved, true);
    assert.equal(getProgress(storage).sessions.length, 1);
    assert.equal(getProgress(storage).sessions[0].completedAt, day);
    assert.equal(
      saveSession(
        { ...input, id: 'partial', results: input.results.slice(0, 7) },
        storage
      ).error,
      'invalid'
    );
    const invalidResults = makeResults('degrees-core');
    invalidResults[0].selectedAnswer = '5';
    invalidResults[0].firstAttemptCorrect = true;
    assert.equal(
      saveSession({ ...input, results: invalidResults }, storage).error,
      'invalid'
    );
    const duplicate = makeResults('degrees-core');
    duplicate[1].questionId = duplicate[0].questionId;
    assert.equal(
      saveSession({ ...input, results: duplicate }, storage).error,
      'invalid'
    );
    assert.equal(getProgress(storage).sessions.length, 1);
  });

  it('does not count assisted, revealed, skipped or incorrect trials as first successes', () => {
    const storage = new MemoryStorage();
    const results = makeResults('triads-core');
    results[0].usedHint = true;
    results[1].revealed = true;
    results[2] = {
      ...results[2],
      skipped: true,
      selectedAnswer: null,
      firstAttemptCorrect: null,
    };
    results[3] = {
      ...results[3],
      revealed: true,
      selectedAnswer: null,
      firstAttemptCorrect: null,
    };
    results[4] = {
      ...results[4],
      selectedAnswer: 'minor',
      firstAttemptCorrect: false,
    };
    const saved = saveSession({ lessonId: 'triads-core', results }, storage);
    assert.equal(saved.saved, true);
    const summary = summarizeProgress(saved.progress);
    assert.equal(summary.totals.questions, 8);
    assert.equal(summary.totals.firstAttemptCorrect, 3);
    assert.equal(summary.totals.accuracy, 3 / 8);
    assert.equal(summary.totals.assisted, 1);
    assert.equal(summary.totals.revealed, 2);
    assert.equal(summary.totals.skipped, 1);
    assert.equal(isFirstAttemptSuccess(results[0]), false);
    assert.equal(summary.lessons['triads-core'].status, 'building');
  });

  it('suggests readiness only after enough sessions, classes and tonic coverage', () => {
    const storage = new MemoryStorage();
    const initial = saveSession(
      {
        id: 'one',
        lessonId: 'degrees-core',
        results: makeResults('degrees-core'),
        completedAt: day,
      },
      storage
    );
    assert.equal(
      summarizeProgress(initial.progress).lessons['degrees-core'].status,
      'building'
    );
    for (let index = 1; index < 3; index++)
      saveSession(
        {
          id: `session-${index}`,
          lessonId: 'degrees-core',
          results: makeResults('degrees-core', index * 8),
          completedAt: day + index * 86400000,
        },
        storage
      );
    const summary = summarizeProgress(getProgress(storage));
    assert.equal(summary.lessons['degrees-core'].status, 'ready');
    assert.equal(summary.recommendation, 'intervals-core');
    assert.equal(summary.totals.activeDays, 3);
    const noDiversity = new MemoryStorage();
    for (let index = 0; index < 3; index++) {
      const results = makeResults('degrees-core', index * 8).map(result => ({
        ...result,
        tonicPitchClass: 0,
      }));
      saveSession(
        { id: `fixed-${index}`, lessonId: 'degrees-core', results },
        noDiversity
      );
    }
    assert.equal(
      summarizeProgress(getProgress(noDiversity)).lessons['degrees-core']
        .status,
      'building'
    );
    const partial: Progress = {
      version: 1,
      sessions: [
        {
          id: 'partial',
          lessonId: 'degrees-core',
          completedAt: day,
          results: makeResults('degrees-core').slice(0, 1),
        },
      ],
    };
    assert.equal(summarizeProgress(partial).totals.questions, 0);
  });

  it('recommends review after recent struggle and bounds retained history', () => {
    const storage = new MemoryStorage();
    for (let index = 0; index < MAX_SAVED_SESSIONS + 3; index++) {
      const results = makeResults('degrees-core', index * 8).map(result => ({
        ...result,
        selectedAnswer: null,
        firstAttemptCorrect: null,
        skipped: true,
      }));
      assert.equal(
        saveSession(
          {
            id: `session-${index}`,
            lessonId: 'degrees-core',
            results,
            completedAt: day + index,
          },
          storage
        ).saved,
        true
      );
    }
    const progress = getProgress(storage);
    assert.equal(progress.sessions.length, MAX_SAVED_SESSIONS);
    assert.equal(progress.sessions[0].id, 'session-3');
    assert.equal(
      summarizeProgress(progress).lessons['degrees-core'].needsReview,
      true
    );
    assert.equal(summarizeProgress(progress).recommendation, 'degrees-core');
  });

  it('keeps consecutive unsaved sessions in the tab and persists them after storage recovers', () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
    const storage = new MemoryStorage();
    const originalSet = storage.setItem.bind(storage);
    let blocked = true;
    let notifications = 0;
    storage.setItem = (key, value) => {
      if (blocked) throw new Error('storage temporarily blocked');
      originalSet(key, value);
    };
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        localStorage: storage,
        dispatchEvent: () => {
          notifications++;
          return true;
        },
      },
    });
    try {
      const first = saveSession({
        id: 'volatile-one',
        lessonId: 'degrees-core',
        results: makeResults('degrees-core'),
      });
      assert.equal(first.saved, false);
      assert.equal(getProgress().sessions.length, 1);
      const second = saveSession({
        id: 'volatile-two',
        lessonId: 'degrees-core',
        results: makeResults('degrees-core', 8),
      });
      assert.equal(second.saved, false);
      assert.equal(getProgress().sessions.length, 2);
      blocked = false;
      assert.equal(
        saveSession({
          id: 'recovered',
          lessonId: 'degrees-core',
          results: makeResults('degrees-core', 16),
        }).saved,
        true
      );
      assert.equal(getProgress(storage).sessions.length, 3);
      assert.equal(notifications, 3);
    } finally {
      if (descriptor) Object.defineProperty(globalThis, 'window', descriptor);
      else Reflect.deleteProperty(globalThis, 'window');
    }
  });

  it('discards corrupt records and strips unrecognized properties', () => {
    const storage = new MemoryStorage();
    const valid = {
      id: 'good',
      lessonId: 'degrees-core',
      completedAt: day,
      results: makeResults('degrees-core'),
      secret: 'not persisted',
    };
    storage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        sessions: [
          valid,
          valid,
          { ...valid, id: 'bad', lessonId: 'nonexistent' },
        ],
      })
    );
    const progress = getProgress(storage);
    assert.equal(progress.sessions.length, 1);
    assert.equal('secret' in progress.sessions[0], false);
  });
});
