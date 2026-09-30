import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getListeningPreferences,
  LISTENING_PREFERENCES_KEY,
  saveListeningPreferences,
  type ListeningPreferences,
} from '../src/features/practice/listeningPreferences.ts';

function memoryStorage(initial: Record<string, string> = {}) {
  const items = new Map(Object.entries(initial));
  const writes: string[] = [];
  return {
    items,
    writes,
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      writes.push(key);
      items.set(key, value);
    },
  };
}

test('listening setup has safe fresh defaults and independently validates known lessons and volume', () => {
  assert.deepEqual(getListeningPreferences(null), {
    lastLessonId: 'degrees-core',
    volume: 0.45,
  });
  const storage = memoryStorage({
    [LISTENING_PREFERENCES_KEY]: JSON.stringify({
      lastLessonId: 'triads-core',
      volume: 0.25,
    }),
  });
  assert.deepEqual(getListeningPreferences(storage), {
    lastLessonId: 'triads-core',
    volume: 0.25,
  });
  storage.items.set(
    LISTENING_PREFERENCES_KEY,
    JSON.stringify({ lastLessonId: 'missing-lesson', volume: 4 })
  );
  assert.deepEqual(getListeningPreferences(storage), {
    lastLessonId: 'degrees-core',
    volume: 1,
  });
  storage.items.set(
    LISTENING_PREFERENCES_KEY,
    JSON.stringify({ lastLessonId: 'triads-core', volume: -5 })
  );
  assert.equal(getListeningPreferences(storage).volume, 0);
});

test('malformed, oversized, and non-numeric preferences fail safely', () => {
  const storage = memoryStorage();
  for (const value of [
    '{',
    'null',
    '[]',
    '42',
    JSON.stringify({ lastLessonId: 4, volume: '0.7' }),
    JSON.stringify({ lastLessonId: 'unknown', volume: null }),
    ' '.repeat(2_049),
  ]) {
    storage.items.set(LISTENING_PREFERENCES_KEY, value);
    assert.deepEqual(getListeningPreferences(storage), {
      lastLessonId: 'degrees-core',
      volume: 0.45,
    });
  }
  assert.equal(storage.writes.length, 0, 'reading does not mutate storage');
});

test('partial setup saves preserve known setup and isolate all legacy histories', () => {
  const storage = memoryStorage({
    'eartrainer.guided-progress.v1': '{"sessions":["legacy"]}',
    score: 'legacy-score',
  });
  assert.equal(
    saveListeningPreferences({ lastLessonId: 'triads-core' }, storage),
    true
  );
  assert.equal(saveListeningPreferences({ volume: 0.7 }, storage), true);
  assert.deepEqual(getListeningPreferences(storage), {
    lastLessonId: 'triads-core',
    volume: 0.7,
  });
  assert.equal(
    saveListeningPreferences(
      {
        lastLessonId: 'invalid',
        volume: Infinity,
        answer: 'major',
        score: 100,
        sessions: [{ answer: 'major' }],
      } as unknown as Partial<ListeningPreferences>,
      storage
    ),
    true
  );
  assert.deepEqual(JSON.parse(storage.items.get(LISTENING_PREFERENCES_KEY)!), {
    lastLessonId: 'triads-core',
    volume: 0.7,
  });
  assert.equal(
    storage.items.get('eartrainer.guided-progress.v1'),
    '{"sessions":["legacy"]}'
  );
  assert.equal(storage.items.get('score'), 'legacy-score');
  assert.deepEqual(storage.writes, [
    LISTENING_PREFERENCES_KEY,
    LISTENING_PREFERENCES_KEY,
    LISTENING_PREFERENCES_KEY,
  ]);
});

test('unavailable reads, quota failures, and blocked localStorage getters never throw', t => {
  const denied = {
    getItem: () => {
      throw new Error('Storage unavailable');
    },
    setItem: () => {
      throw new Error('Quota exceeded');
    },
  };
  assert.deepEqual(getListeningPreferences(denied), {
    lastLessonId: 'degrees-core',
    volume: 0.45,
  });
  assert.equal(saveListeningPreferences({ volume: 0.2 }, denied), false);
  assert.equal(saveListeningPreferences({ volume: 0.2 }, null), false);

  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else Reflect.deleteProperty(globalThis, 'window');
  });
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      get localStorage() {
        throw new Error('Denied');
      },
    },
  });
  assert.deepEqual(getListeningPreferences(), {
    lastLessonId: 'degrees-core',
    volume: 0.45,
  });
  assert.equal(saveListeningPreferences({ volume: 0.2 }), false);
});
