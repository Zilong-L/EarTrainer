import { Chord, Interval, Note } from 'tonal';

export interface ChordChoice {
  degree: string;
  chordType: string;
}

export interface ChordQuestion extends ChordChoice {
  symbol: string;
  notes: string[];
  bassNote: string;
  root: string;
  inversion: number;
}

export type InversionMode = 'root' | 'first' | 'second' | 'random';
export type BackingMode = 'off' | 'tonic' | 'cadence';

export interface ChordEvent {
  note: number | string;
  time: number;
  duration: number;
  voice?: 'foreground' | 'bass';
  velocity?: number;
}

export interface ChordPlaybackOptions {
  bassEnabled: boolean;
  /** Normalized 0–1 level; the bass stays quieter than the target chord. */
  bassLevel: number;
  backingMode: BackingMode;
  tonic: string;
  minor: boolean;
  random?: () => number;
}

// Exact entries keep legacy suffix accidentals (IIIb) separate from chord types.
// Prefix accidentals and lowercase Roman numerals are accepted as aliases.
const DEGREE_INTERVALS: Record<string, string> = {
  I: '1P',
  Ib: '1d',
  'I#': '1A',
  II: '2M',
  IIb: '2m',
  'II#': '2A',
  III: '3M',
  IIIb: '3m',
  'III#': '3A',
  IV: '4P',
  IVb: '4d',
  'IV#': '4A',
  V: '5P',
  Vb: '5d',
  'V#': '5A',
  VI: '6M',
  VIb: '6m',
  'VI#': '6A',
  VII: '7M',
  VIIb: '7m',
  'VII#': '7A',
};

const degreeIntervals = new Map<string, string>();
for (const [degree, interval] of Object.entries(DEGREE_INTERVALS)) {
  const accidental = degree.endsWith('b')
    ? 'b'
    : degree.endsWith('#')
      ? '#'
      : '';
  const roman = accidental ? degree.slice(0, -1) : degree;
  for (const numeral of [roman, roman.toLowerCase()]) {
    degreeIntervals.set(numeral + accidental, interval);
    degreeIntervals.set(accidental + numeral, interval);
  }
}

const modulo = (value: number, divisor: number) =>
  ((value % divisor) + divisor) % divisor;

const randomIndex = (length: number, random: () => number) => {
  const value = random();
  const fraction = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
  return Math.min(length - 1, Math.floor(fraction * length));
};

/** Preserve enharmonic spelling even across Cb/B# octave boundaries. */
const noteAtMidi = (pitchClass: string, midi: number): string => {
  const octaveZero = Note.midi(`${pitchClass}0`);
  return octaveZero === null ? '' : `${pitchClass}${(midi - octaveZero) / 12}`;
};

const getRange = (range: [string, string]): [number, number] => {
  const first = Note.midi(range?.[0]);
  const second = Note.midi(range?.[1]);
  if (first === null || second === null) return [48, 72]; // C3–C5
  return [Math.min(first, second), Math.max(first, second)];
};

/**
 * Build a deterministic close-position chord. The lowest possible matching bass
 * is placed at/above the requested lower bound. If the full chord cannot fit,
 * only the upper bound is extended. At MIDI's extreme edges, the voicing moves
 * by octaves to leave room for its bass and stay within playable MIDI 0–127.
 * Invalid ranges fall back to C3–C5; invalid roots/degrees/qualities return null.
 */
export function buildChordQuestion(
  choice: ChordChoice,
  tonic: string,
  range: [string, string],
  inversionMode: InversionMode,
  random: () => number = Math.random
): ChordQuestion | null {
  const tonicNote = Note.get(tonic);
  const degreeInterval = degreeIntervals.get(choice?.degree);
  if (tonicNote.empty || !degreeInterval) return null;

  const root = Note.transpose(tonicNote.pc, degreeInterval);
  const chord = Chord.get([root, choice.chordType]);
  if (chord.empty || chord.intervals.length === 0) return null;

  // Keep Tonal's chord-tone order for inversion names: first means the third,
  // not an added ninth, even when extensions are folded into close position.
  const tones: { offset: number; pitchClass: string }[] = [];
  for (const [index, interval] of chord.intervals.entries()) {
    const semitones = Interval.semitones(interval);
    if (!Number.isFinite(semitones)) continue;
    const offset = modulo(semitones, 12);
    if (!tones.some(tone => tone.offset === offset)) {
      tones.push({ offset, pitchClass: chord.notes[index] });
    }
  }
  if (tones.length === 0) return null;

  const inversion =
    inversionMode === 'random'
      ? randomIndex(tones.length, random)
      : inversionMode === 'first'
        ? Math.min(1, tones.length - 1)
        : inversionMode === 'second'
          ? Math.min(2, tones.length - 1)
          : 0;
  const lowestTone = tones[inversion];
  const orderedTones = tones
    .map(tone => ({
      ...tone,
      distance: modulo(tone.offset - lowestTone.offset, 12),
    }))
    .sort((first, second) => first.distance - second.distance);
  const [low] = getRange(range);
  const bassChroma = Note.chroma(lowestTone.pitchClass);
  if (bassChroma === null) return null;
  const minimum = Math.max(12, low);
  let lowestMidi = minimum + modulo(bassChroma - minimum, 12);
  const span = orderedTones[orderedTones.length - 1].distance;
  while (lowestMidi + span > 127) lowestMidi -= 12;

  const notes = orderedTones.map(tone =>
    noteAtMidi(tone.pitchClass, lowestMidi + tone.distance)
  );
  if (notes.some(note => Note.midi(note) === null)) return null;

  return {
    ...choice,
    root,
    symbol: chord.symbol,
    notes,
    bassNote: noteAtMidi(lowestTone.pitchClass, lowestMidi - 12),
    inversion,
  };
}

/** Deduplicate once and sample eligible candidates, without retry loops. */
export function chooseNextChord(
  choices: readonly ChordChoice[] | null | undefined,
  current: ChordChoice | null | undefined,
  random: () => number = Math.random
): ChordChoice | null {
  const unique = new Map<string, ChordChoice>();
  for (const choice of choices ?? []) {
    if (
      choice &&
      typeof choice.degree === 'string' &&
      typeof choice.chordType === 'string'
    ) {
      const key = JSON.stringify([choice.degree, choice.chordType]);
      if (!unique.has(key)) unique.set(key, choice);
    }
  }
  const available = [...unique.values()];
  if (available.length === 0) return null;
  const candidates =
    available.length > 1 && current
      ? available.filter(
          choice =>
            choice.degree !== current.degree ||
            choice.chordType !== current.chordType
        )
      : available;
  return candidates[randomIndex(candidates.length, random)];
}

const foregroundEvent = (
  note: string,
  time: number,
  duration: number,
  velocity = 0.8
): ChordEvent => ({ note, time, duration, voice: 'foreground', velocity });

/**
 * Times and durations are seconds relative to playback start. Context is a
 * detached prefix; a 0.5-second release gap separates it from the target.
 * Bass starts with the target and follows the sounding inversion's lowest tone.
 */
export function createChordEvents(
  question: ChordQuestion | null | undefined,
  playOption: string,
  bpm: number,
  options: ChordPlaybackOptions
): ChordEvent[] {
  const notes = (question?.notes ?? [])
    .filter(note => Note.midi(note) !== null)
    .sort((first, second) => Note.midi(first)! - Note.midi(second)!);
  if (!question || notes.length === 0) return [];

  const safeBpm = Number.isFinite(bpm) && bpm > 0 ? bpm : 60;
  const beat = 60 / Math.max(30, Math.min(240, safeBpm));
  let target: ChordEvent[];

  if (playOption === 'block') {
    target = notes.map(note => foregroundEvent(note, 0, 2 * beat));
  } else if (
    playOption === 'ascending' ||
    playOption === 'descending' ||
    playOption === 'random'
  ) {
    const ordered = [...notes];
    if (playOption === 'descending') ordered.reverse();
    if (playOption === 'random') {
      const random = options.random ?? Math.random;
      for (let index = ordered.length - 1; index > 0; index--) {
        const next = randomIndex(index + 1, random);
        [ordered[index], ordered[next]] = [ordered[next], ordered[index]];
      }
    }
    target = ordered.map((note, index) =>
      foregroundEvent(note, index * 0.25 * beat, 2 * beat)
    );
  } else {
    const phrase = Math.max(2, notes.length * 0.25);
    target = [
      ...notes.map((note, index) =>
        foregroundEvent(
          note,
          index * 0.25 * beat,
          (2 * phrase - index * 0.25) * beat
        )
      ),
      ...notes.map(note => foregroundEvent(note, phrase * beat, phrase * beat)),
      ...[...notes]
        .reverse()
        .map((note, index) =>
          foregroundEvent(
            note,
            (2 * phrase + index * 0.25) * beat,
            (2 * phrase - index * 0.25) * beat
          )
        ),
      ...notes.map(note =>
        foregroundEvent(note, 3 * phrase * beat, phrase * beat)
      ),
    ];
  }

  const context: ChordEvent[] = [];
  if (options.backingMode === 'tonic' || options.backingMode === 'cadence') {
    const tonic = Note.get(options.tonic).pc;
    const choices: ChordChoice[] =
      options.backingMode === 'tonic'
        ? [{ degree: 'I', chordType: options.minor ? 'm' : 'M' }]
        : [
            { degree: 'I', chordType: options.minor ? 'm' : 'M' },
            { degree: 'IV', chordType: options.minor ? 'm' : 'M' },
            { degree: 'V', chordType: 'M' },
            { degree: 'I', chordType: options.minor ? 'm' : 'M' },
          ];
    choices.forEach((choice, index) => {
      const chord = buildChordQuestion(
        choice,
        tonic,
        [`${tonic}3`, `${tonic}4`],
        'root'
      );
      if (!chord) return;
      const duration = (options.backingMode === 'tonic' ? 0.75 : 0.4) * beat;
      context.push(
        ...chord.notes.map(note =>
          foregroundEvent(note, index * 0.5 * beat, duration, 0.48)
        )
      );
    });
  }
  const targetStart =
    context.length > 0
      ? Math.max(...context.map(event => event.time + event.duration)) + 0.5
      : 0;
  const targetDuration = Math.max(
    ...target.map(event => event.time + event.duration)
  );
  target = target.map(event => ({ ...event, time: event.time + targetStart }));

  const bassLevel = Number.isFinite(options.bassLevel)
    ? Math.max(0, Math.min(1, options.bassLevel))
    : 0.3;
  if (options.bassEnabled && bassLevel > 0) {
    const lowestMidi = Note.midi(notes[0])!;
    const suppliedBass = Note.midi(question.bassNote);
    const bassMidi =
      suppliedBass !== null &&
      (lowestMidi - suppliedBass === 12 || lowestMidi - suppliedBass === 24)
        ? suppliedBass
        : lowestMidi - 12;
    if (bassMidi >= 0) {
      target.push({
        note: Note.fromMidi(bassMidi),
        time: targetStart,
        duration: targetDuration,
        voice: 'bass',
        velocity: bassLevel * 0.5,
      });
    }
  }
  return [...context, ...target].sort(
    (first, second) => first.time - second.time
  );
}
