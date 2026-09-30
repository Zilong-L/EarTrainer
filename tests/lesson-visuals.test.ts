import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  generateLessonExamples,
  getLesson,
  LESSONS,
} from '../src/features/practice/model.ts';
import {
  bassRoute,
  buildLearningPlayback,
  chordMember,
  eventEnd,
  frameAtTime,
  groupEvents,
  identifyChord,
  keyboardRange,
  noteName,
  romanSymbol,
  soundingNotes,
  targetPitchPair,
} from '../src/features/training/lessonVisuals.ts';

describe('standalone learning illustrations', () => {
  it('keeps every example frame grounded in actual note onsets and durations', () => {
    for (const lesson of LESSONS) {
      for (const example of generateLessonExamples(lesson.id)) {
        const playback = buildLearningPlayback(lesson, [example]);
        assert.equal(
          playback.events.length,
          example.events.length + example.referenceEvents.length
        );
        assert.equal(
          playback.frames.length,
          groupEvents(example.events).length +
            groupEvents(example.referenceEvents).length
        );
        for (const frame of playback.frames) {
          assert.deepEqual(
            frame.notes,
            [
              ...new Set(
                playback.events
                  .filter(event => event.time === frame.time)
                  .map(event => event.note)
              ),
            ].sort((a, b) => a - b)
          );
          assert.ok(frame.notes.every(note => frame.structure.includes(note)));
          assert.equal(
            frame.duration,
            Math.max(
              ...playback.events
                .filter(event => event.time === frame.time)
                .map(event => event.duration)
            )
          );
        }
      }
    }
  });

  it('measures the asked final pair in a contextual melody, not its shared opening fifth', () => {
    const lesson = getLesson('intervals-context')!;
    const distances: Record<string, number> = { m3: 3, M3: 4, P4: 5, P5: 7 };
    for (const example of generateLessonExamples(lesson.id)) {
      assert.equal(example.events.length, 4);
      assert.deepEqual(
        example.events.slice(0, 2).map(event => event.note),
        [60, 67]
      );
      const pair = targetPitchPair(lesson, example);
      assert.deepEqual(
        pair,
        example.events.slice(-2).map(event => event.note)
      );
      assert.equal(Math.abs(pair[1] - pair[0]), distances[example.choice.id]);
    }
  });

  it('retains direction for falling intervals and identifies home as the degree anchor', () => {
    for (const example of generateLessonExamples('intervals-descending')) {
      const [first, second] = targetPitchPair(
        getLesson('intervals-descending')!,
        example
      );
      assert.ok(first > second);
    }
    for (const example of generateLessonExamples('degrees-core')) {
      const pair = targetPitchPair(getLesson('degrees-core')!, example);
      assert.equal(pair[0], example.tonic);
      assert.equal(pair[1], example.events[0].note);
    }
  });

  it('shows the actual register of a root-rebuilding detail, including C3 rather than unsounded C4', () => {
    for (const id of [
      'sevenths-inversions',
      'triads-voiced',
      'inversions-open',
      'inversions-core',
    ] as const) {
      const lesson = getLesson(id)!;
      for (const example of generateLessonExamples(id)) {
        const playback = buildLearningPlayback(lesson, [example], 'detail');
        const pitches = [
          ...new Set(example.hintEvents.map(event => event.note)),
        ].sort((a, b) => a - b);
        for (const frame of playback.frames) {
          assert.deepEqual(frame.structure, pitches);
          assert.ok(frame.notes.every(note => frame.structure.includes(note)));
        }
      }
    }
    const lesson = getLesson('sevenths-inversions')!;
    const firstInversion = generateLessonExamples(lesson.id).find(
      example => example.choice.id === 'first'
    )!;
    assert.ok(firstInversion.events.some(event => event.note === 60));
    const detail = buildLearningPlayback(lesson, [firstInversion], 'detail');
    assert.ok(detail.frames.every(frame => frame.structure.includes(48)));
    assert.ok(detail.frames.every(frame => !frame.structure.includes(60)));
  });

  it('keeps chord members and actual bass distinct, including open spacing and held bass', () => {
    const example = generateLessonExamples('bass-motion').find(
      item => item.choice.id === 'hold'
    )!;
    assert.deepEqual(bassRoute(example), [48, 48]);
    const frames = buildLearningPlayback(getLesson('bass-motion')!, [
      example,
    ]).frames;
    assert.equal(frames[0].symbol, 'I');
    assert.equal(frames[1].symbol, 'vi');
    assert.equal(
      chordMember(Math.min(...frames[1].notes), frames[1].chord!, false),
      'Third'
    );
    for (const example of generateLessonExamples('inversions-open')) {
      const frame = buildLearningPlayback(getLesson('inversions-open')!, [
        example,
      ]).frames[0];
      const expected = { root: 'Root', first: 'Third', second: 'Fifth' }[
        example.choice.id
      ];
      assert.equal(
        chordMember(Math.min(...frame.notes), frame.chord!, false),
        expected
      );
    }
  });

  it('spells diminished sevenths as seventh members and recognizes exact chord sets only', () => {
    const diminished = identifyChord([48, 51, 54, 57], 48, 48)!;
    assert.equal(diminished.symbol, 'C°7');
    assert.deepEqual(
      [48, 51, 54, 57].map(note => noteName(note, diminished)),
      ['C', 'E♭', 'G♭', 'B𝄫']
    );
    assert.equal(chordMember(57, diminished, false), 'Seventh');
    assert.equal(identifyChord([48, 52], 48), undefined);
    assert.equal(identifyChord([48, 49, 50], 48), undefined);
    assert.equal(romanSymbol(identifyChord([50, 55, 59], 48)!, 48), 'V');
  });

  it('uses one common reference and preserves both same-key comparison sounds', () => {
    for (const lesson of LESSONS) {
      const examples = generateLessonExamples(lesson.id).slice(0, 2);
      const playback = buildLearningPlayback(lesson, examples);
      assert.equal(
        playback.frames.filter(frame => frame.phase === 'reference').length,
        groupEvents(examples[0].referenceEvents).length
      );
      assert.equal(
        playback.events.length,
        examples[0].referenceEvents.length +
          examples.reduce((sum, example) => sum + example.events.length, 0)
      );
      const starts = examples.map(
        example =>
          playback.frames.find(
            frame => frame.phase === 'example' && frame.example === example
          )!.time
      );
      assert.ok(starts[1] > starts[0] + eventEnd(examples[0].events));
      assert.equal(examples[0].tonic, examples[1].tonic);
    }
  });

  it('highlights only sounding pitches, including rests and exact release boundaries', () => {
    const events = [
      { note: 60, time: 0, duration: 0.5 },
      { note: 64, time: 0.3, duration: 0.5 },
      { note: 67, time: 1, duration: 0.5 },
    ];
    assert.deepEqual(soundingNotes(events, 0.4), [60, 64]);
    assert.deepEqual(soundingNotes(events, 0.5), [64]);
    assert.deepEqual(soundingNotes(events, 0.9), []);
    assert.deepEqual(soundingNotes(events, 1.5), []);
  });

  it('holds the current musical frame through rests without falsely lighting a pitch', () => {
    const lesson = getLesson('degrees-core')!;
    const playback = buildLearningPlayback(lesson, [
      generateLessonExamples(lesson.id)[1],
    ]);
    assert.equal(frameAtTime(playback.frames, -0.1), undefined);
    assert.equal(frameAtTime(playback.frames, 0.7)?.id, playback.frames[0].id);
    assert.equal(frameAtTime(playback.frames, 0.7)?.phase, 'reference');
    assert.deepEqual(soundingNotes(playback.events, 0.7), []);
    assert.equal(frameAtTime(playback.frames, 0.8)?.id, playback.frames[1].id);
  });

  it('always includes every played pitch in the compact keyboard range', () => {
    for (const lesson of LESSONS.filter(item => item.mode !== 'guitar')) {
      for (const example of generateLessonExamples(lesson.id)) {
        const notes = [
          ...example.events,
          ...example.referenceEvents,
          ...example.hintEvents,
        ].map(event => event.note);
        const range = keyboardRange(notes);
        assert.ok(notes.every(note => range.includes(note)));
        assert.ok(range.length <= 25);
      }
    }
  });
});
