import {
  buildStrumEvents,
  getGuitarShapes,
  type GuitarChordId,
  type GuitarShape,
  type GuitarStyle,
  type SweepSpeed,
} from './guitarStrum';
import type { LessonExample, PracticeQuestion } from './model';

export type GuitarSettings = {
  instrument: GuitarStyle;
  speed: SweepSpeed;
  voicing: 'varied' | 'open';
};
export const DEFAULT_GUITAR_SETTINGS: GuitarSettings = {
  instrument: 'guitar-nylon',
  speed: 'fast',
  voicing: 'varied',
};

type GuitarTarget = Pick<PracticeQuestion, 'tonic' | 'construction'> &
  ({ answer: string } | { choice: { id: string } });

export function guitarShapeFor(
  target: GuitarTarget,
  shapeIndex = target.construction.variant
): GuitarShape {
  const root =
    target.tonic % 12 === 4 ? 'E' : target.tonic % 12 === 2 ? 'D' : 'A';
  const quality = 'answer' in target ? target.answer : target.choice.id;
  const shapes = getGuitarShapes(`${root}-${quality}` as GuitarChordId);
  return shapes[((shapeIndex % shapes.length) + shapes.length) % shapes.length];
}

/** Timbre and onset spacing never alter the asked quality or pitch classes. */
export function configureGuitarSound<
  T extends PracticeQuestion | LessonExample,
>(
  target: T,
  settings: GuitarSettings,
  shapeIndex = settings.voicing === 'open' ? 0 : target.construction.variant
): T {
  const shape = guitarShapeFor(target, shapeIndex);
  const events = buildStrumEvents(shape, {
    speed: settings.speed,
    instrument: settings.instrument,
    seed: target.tonic + shapeIndex,
  });
  return {
    ...target,
    construction: { ...target.construction, variant: shapeIndex },
    events,
    hintEvents: events.map((event, index) => ({
      ...event,
      time: index * 0.45,
      duration: 0.9,
    })),
  };
}
