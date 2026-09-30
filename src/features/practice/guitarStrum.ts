/** Standard tuning, ordered by physical string from low E (6) to high E (1). */
export const STANDARD_TUNING = [40, 45, 50, 55, 59, 64] as const;

export type GuitarStyle = 'guitar-acoustic' | 'guitar-nylon';
export type SweepSpeed = 'fast' | 'slow';
export type GuitarChordId =
  | 'A-major'
  | 'A-minor'
  | 'E-major'
  | 'E-minor'
  | 'D-major'
  | 'D-minor';
export type GuitarStringIndex = 0 | 1 | 2 | 3 | 4 | 5;
export type GuitarStringNumber = 1 | 2 | 3 | 4 | 5 | 6;
export type GuitarFrets = readonly [
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
];
export type GuitarShape = {
  id: string;
  chordId: GuitarChordId;
  label: { en: string; zh: string };
  /** Six physical strings: null = muted, 0 = open, otherwise the fret number. */
  frets: GuitarFrets;
  position: 'open' | 'low' | 'upper';
};
export type GuitarShapeNote = {
  stringIndex: GuitarStringIndex;
  stringNumber: GuitarStringNumber;
  fret: number;
  midi: number;
};
export type GuitarStrumEvent = {
  note: number;
  time: number;
  duration: number;
  velocity: number;
  /** Zero-based physical string, used to keep equal pitches on separate voices. */
  guitarString: GuitarStringIndex;
  instrument: GuitarStyle;
};
export type GuitarStrumOptions = {
  speed?: SweepSpeed;
  direction?: 'down' | 'up';
  seed?: number;
  start?: number;
  /** Per-string sustain in seconds; clamped above the sweep to retain overlap. */
  duration?: number;
  instrument?: GuitarStyle;
};

/**
 * Audited grips, not generated pitch-class combinations. Each chord has its
 * familiar open grip and two movable E-, A-, or four-string D-form grips.
 * D forms use four fingers; E/A forms use an index barre and the normal cluster.
 * All grips retain the root in the bass and stay within frets 0–12.
 */
export const GUITAR_SHAPES = [
  {
    id: 'A-major-open',
    chordId: 'A-major',
    label: { en: 'Open A', zh: '开放 A 和弦' },
    frets: [null, 0, 2, 2, 2, 0],
    position: 'open',
  },
  {
    id: 'A-major-e-barre',
    chordId: 'A-major',
    label: { en: 'A · E-form, fret 5', zh: 'A · E 型横按，第 5 品' },
    frets: [5, 7, 7, 6, 5, 5],
    position: 'low',
  },
  {
    id: 'A-major-d-form',
    chordId: 'A-major',
    label: { en: 'A · D-form, fret 7', zh: 'A · D 型四弦指型，第 7 品' },
    frets: [null, null, 7, 9, 10, 9],
    position: 'upper',
  },
  {
    id: 'A-minor-open',
    chordId: 'A-minor',
    label: { en: 'Open Am', zh: '开放 Am 和弦' },
    frets: [null, 0, 2, 2, 1, 0],
    position: 'open',
  },
  {
    id: 'A-minor-e-barre',
    chordId: 'A-minor',
    label: { en: 'Am · Em-form, fret 5', zh: 'Am · Em 型横按，第 5 品' },
    frets: [5, 7, 7, 5, 5, 5],
    position: 'low',
  },
  {
    id: 'A-minor-d-form',
    chordId: 'A-minor',
    label: { en: 'Am · Dm-form, fret 7', zh: 'Am · Dm 型四弦指型，第 7 品' },
    frets: [null, null, 7, 9, 10, 8],
    position: 'upper',
  },
  {
    id: 'E-major-open',
    chordId: 'E-major',
    label: { en: 'Open E', zh: '开放 E 和弦' },
    frets: [0, 2, 2, 1, 0, 0],
    position: 'open',
  },
  {
    id: 'E-major-d-form',
    chordId: 'E-major',
    label: { en: 'E · D-form, fret 2', zh: 'E · D 型四弦指型，第 2 品' },
    frets: [null, null, 2, 4, 5, 4],
    position: 'low',
  },
  {
    id: 'E-major-a-barre',
    chordId: 'E-major',
    label: { en: 'E · A-form, fret 7', zh: 'E · A 型横按，第 7 品' },
    frets: [null, 7, 9, 9, 9, 7],
    position: 'upper',
  },
  {
    id: 'E-minor-open',
    chordId: 'E-minor',
    label: { en: 'Open Em', zh: '开放 Em 和弦' },
    frets: [0, 2, 2, 0, 0, 0],
    position: 'open',
  },
  {
    id: 'E-minor-d-form',
    chordId: 'E-minor',
    label: { en: 'Em · Dm-form, fret 2', zh: 'Em · Dm 型四弦指型，第 2 品' },
    frets: [null, null, 2, 4, 5, 3],
    position: 'low',
  },
  {
    id: 'E-minor-a-barre',
    chordId: 'E-minor',
    label: { en: 'Em · Am-form, fret 7', zh: 'Em · Am 型横按，第 7 品' },
    frets: [null, 7, 9, 9, 8, 7],
    position: 'upper',
  },
  {
    id: 'D-major-open',
    chordId: 'D-major',
    label: { en: 'Open D', zh: '开放 D 和弦' },
    frets: [null, null, 0, 2, 3, 2],
    position: 'open',
  },
  {
    id: 'D-major-a-barre',
    chordId: 'D-major',
    label: { en: 'D · A-form, fret 5', zh: 'D · A 型横按，第 5 品' },
    frets: [null, 5, 7, 7, 7, 5],
    position: 'low',
  },
  {
    id: 'D-major-e-barre',
    chordId: 'D-major',
    label: { en: 'D · E-form, fret 10', zh: 'D · E 型横按，第 10 品' },
    frets: [10, 12, 12, 11, 10, 10],
    position: 'upper',
  },
  {
    id: 'D-minor-open',
    chordId: 'D-minor',
    label: { en: 'Open Dm', zh: '开放 Dm 和弦' },
    frets: [null, null, 0, 2, 3, 1],
    position: 'open',
  },
  {
    id: 'D-minor-a-barre',
    chordId: 'D-minor',
    label: { en: 'Dm · Am-form, fret 5', zh: 'Dm · Am 型横按，第 5 品' },
    frets: [null, 5, 7, 7, 6, 5],
    position: 'low',
  },
  {
    id: 'D-minor-e-barre',
    chordId: 'D-minor',
    label: { en: 'Dm · Em-form, fret 10', zh: 'Dm · Em 型横按，第 10 品' },
    frets: [10, 12, 12, 10, 10, 10],
    position: 'upper',
  },
] as const satisfies readonly GuitarShape[];

export const getGuitarShapes = (chordId: GuitarChordId): GuitarShape[] =>
  GUITAR_SHAPES.filter(shape => shape.chordId === chordId);

/** Keep physical string order; do not sort by MIDI or merge duplicate pitches. */
export const shapeNotes = (shape: GuitarShape): GuitarShapeNote[] =>
  shape.frets.flatMap((fret, stringIndex) => {
    if (fret === null) return [];
    if (!Number.isInteger(fret) || fret < 0 || fret > 12)
      throw new RangeError(
        'Guitar frets must be integers from 0 to 12 or null.'
      );
    return [
      {
        stringIndex: stringIndex as GuitarStringIndex,
        stringNumber: (6 - stringIndex) as GuitarStringNumber,
        fret,
        midi: STANDARD_TUNING[stringIndex] + fret,
      },
    ];
  });

const seededRandom = (seed: number): (() => number) => {
  let state = Number.isFinite(seed) ? seed >>> 0 : 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
};

/**
 * A single sweep, in seconds. Only timing and dynamics vary: pitch always comes
 * directly from tuning + fret. Endpoints stay fixed; interior hits vary by at
 * most 1.5ms (fast) / 4ms (slow), far below any adjacent-string interval.
 */
export const buildStrumEvents = (
  shape: GuitarShape,
  options: GuitarStrumOptions = {}
): GuitarStrumEvent[] => {
  const notes = shapeNotes(shape);
  if (options.direction === 'up') notes.reverse();
  if (!notes.length) return [];

  const slow = options.speed === 'slow';
  const sweep = slow ? 0.2 : 0.06;
  const timingJitter = slow ? 0.004 : 0.0015;
  const start =
    Number.isFinite(options.start) && options.start! >= 0 ? options.start! : 0;
  const requestedDuration =
    Number.isFinite(options.duration) && options.duration! > 0
      ? options.duration!
      : 1.4;
  const duration = Math.max(requestedDuration, sweep + 0.1);
  const instrument = options.instrument ?? 'guitar-nylon';
  const random = seededRandom(options.seed ?? 1);
  const firstString = notes[0].stringIndex;
  const physicalSpan = Math.abs(
    notes[notes.length - 1].stringIndex - firstString
  );

  return notes.map((note, index) => {
    const progress = physicalSpan
      ? Math.abs(note.stringIndex - firstString) / physicalSpan
      : 0;
    const offset =
      index === 0 || index === notes.length - 1
        ? 0
        : (random() * 2 - 1) * timingJitter;
    return {
      note: note.midi,
      time: start + progress * sweep + offset,
      duration,
      velocity: 0.8 - progress * 0.08 + (random() * 2 - 1) * 0.025,
      guitarString: note.stringIndex,
      instrument,
    };
  });
};
