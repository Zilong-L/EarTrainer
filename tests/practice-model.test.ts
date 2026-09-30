import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createSeededRng,
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
  it('offers seven stable lessons across six stages with bilingual labels', () => {
    assert.equal(LESSONS.length, 7);
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

  it('matches every answer to structurally correct notes, bass and context', () => {
    const intervals: Record<string, number> = { m3: 3, M3: 4, P5: 7 };
    const triads: Record<string, number[]> = {
      major: [0, 4, 7],
      minor: [0, 3, 7],
      diminished: [0, 3, 6],
    };
    const inversion: Record<string, number> = { root: 0, first: 1, second: 2 };
    const degrees = [0, 2, 4, 5, 7, 9, 11];
    const functions: Record<string, number> = { I: 0, IV: 5, V: 7, vi: 9 };
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
              question.tonic + degrees[Number(question.answer) - 1],
            ]);
            assert.equal(question.referenceEvents.length, 12);
            break;
          case 'interval':
            assert.equal(notes[1] - notes[0], intervals[question.answer]);
            assert.equal(question.referenceEvents.length, 0);
            break;
          case 'triad':
            assert.deepEqual(
              notes.map(note => note - question.tonic),
              triads[question.answer]
            );
            assert.ok(question.events.every(event => event.time === 0));
            break;
          case 'inversion': {
            const pitchClasses = notes
              .map(note => (note - question.tonic) % 12)
              .sort((a, b) => a - b);
            const quality = pitchClasses.includes(4) ? 'major' : 'minor';
            assert.deepEqual(pitchClasses, triads[quality]);
            assert.equal(
              (Math.min(...notes) - question.tonic) % 12,
              triads[quality][inversion[question.answer]]
            );
            assert.ok(notes[0] < notes[1] && notes[1] < notes[2]);
            break;
          }
          case 'function':
            assert.deepEqual(
              notes.map(note => note - question.tonic),
              triads[question.answer === 'vi' ? 'minor' : 'major'].map(
                offset => offset + functions[question.answer]
              )
            );
            assert.equal(question.referenceEvents.length, 12);
            break;
        }
      }
    }
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
