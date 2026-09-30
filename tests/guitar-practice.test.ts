import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  configureGuitarSound,
  DEFAULT_GUITAR_SETTINGS,
  guitarShapeFor,
} from '../src/features/practice/guitarPractice.ts';
import {
  createSeededRng,
  generateQuestion,
  generateComparisonExample,
  generateLessonExamples,
} from '../src/features/practice/model.ts';
import { shapeNotes } from '../src/features/practice/guitarStrum.ts';

describe('guitar chord-quality practice', () => {
  it('covers every root and voicing in both qualities without an answer-linked setup', () => {
    const counts = new Map<string, number>();
    const rng = createSeededRng(1204);
    for (let i = 0; i < 6000; i++) {
      const q = generateQuestion('guitar-strums', rng);
      const key = `${q.answer}-${q.tonic}-${q.construction.variant}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
      const other = generateComparisonExample(
        q,
        q.answer === 'major' ? 'minor' : 'major'
      )!;
      assert.equal(other.tonic, q.tonic);
      assert.equal(other.construction.variant, q.construction.variant);
      assert.deepEqual(
        other.events.map(e => e.guitarString),
        q.events.map(e => e.guitarString)
      );
      assert.deepEqual(
        other.events.map(e => e.time),
        q.events.map(e => e.time)
      );
      assert.deepEqual(
        other.events.map(e => e.velocity),
        q.events.map(e => e.velocity)
      );
      assert.equal(Math.min(...q.events.map(e => e.note)) % 12, q.tonic % 12);
    }
    assert.equal(counts.size, 18);
    assert.ok([...counts.values()].every(count => count > 250 && count < 420));
  });

  it('keeps target identity and exact pitches when speed or timbre changes', () => {
    const rng = createSeededRng(983);
    for (let i = 0; i < 100; i++) {
      const q = generateQuestion('guitar-strums', rng);
      for (const speed of ['fast', 'slow'] as const) {
        for (const instrument of ['guitar-acoustic', 'guitar-nylon'] as const) {
          const changed = configureGuitarSound(q, {
            ...DEFAULT_GUITAR_SETTINGS,
            speed,
            instrument,
          });
          assert.equal(changed.id, q.id);
          assert.equal(changed.answer, q.answer);
          assert.deepEqual(
            changed.events.map(e => e.note),
            q.events.map(e => e.note)
          );
          assert.ok(changed.events.every(e => e.instrument === instrument));
          assert.equal(
            changed.events.at(-1)!.time,
            speed === 'slow' ? 0.2 : 0.06
          );
        }
      }
      const open = configureGuitarSound(q, {
        ...DEFAULT_GUITAR_SETTINGS,
        voicing: 'open',
      });
      assert.equal(open.answer, q.answer);
      assert.equal(guitarShapeFor(open).position, 'open');
      assert.deepEqual(
        open.events.map(e => e.note),
        shapeNotes(guitarShapeFor(open)).map(n => n.midi)
      );
    }
  });

  it('can compare three genuine shapes of one chord while preserving its quality', () => {
    for (const example of generateLessonExamples('guitar-strums')) {
      const sounds = [0, 1, 2].map(index =>
        configureGuitarSound(example, DEFAULT_GUITAR_SETTINGS, index)
      );
      assert.equal(
        new Set(sounds.map(item => guitarShapeFor(item).id)).size,
        3
      );
      assert.equal(new Set(sounds.map(item => item.choice.id)).size, 1);
      const pitches = sounds.map(item =>
        [...new Set(item.events.map(e => e.note % 12))].sort((a, b) => a - b)
      );
      assert.deepEqual(pitches[0], pitches[1]);
      assert.deepEqual(pitches[1], pitches[2]);
      assert.notDeepEqual(
        sounds[0].events.map(e => e.note),
        sounds[1].events.map(e => e.note)
      );
    }
  });
});
