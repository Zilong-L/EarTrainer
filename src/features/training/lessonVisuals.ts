import type { Lesson, LessonExample, PracticeEvent } from '../practice/model';

export type ChordStructure = {
  root: number;
  quality: string;
  offsets: number[];
  symbol: string;
};

export type LearningFrame = {
  id: string;
  time: number;
  duration: number;
  notes: number[];
  /** The complete chord remains visible while an arpeggio sounds one member. */
  structure: number[];
  chord?: ChordStructure;
  symbol: string;
  phase: 'reference' | 'example' | 'detail';
  example: LessonExample;
};

export type LearningPlayback = {
  events: PracticeEvent[];
  frames: LearningFrame[];
};

export const pitchClass = (note: number): number => ((note % 12) + 12) % 12;
const names = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
const letters = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const naturalPitches = [0, 2, 4, 5, 7, 9, 11];
const chordPatterns = [
  { quality: 'major', offsets: [0, 4, 7], suffix: '' },
  { quality: 'minor', offsets: [0, 3, 7], suffix: 'm' },
  { quality: 'diminished', offsets: [0, 3, 6], suffix: '°' },
  { quality: 'maj7', offsets: [0, 4, 7, 11], suffix: 'maj7' },
  { quality: 'dom7', offsets: [0, 4, 7, 10], suffix: '7' },
  { quality: 'min7', offsets: [0, 3, 7, 10], suffix: 'm7' },
  { quality: 'half-dim7', offsets: [0, 3, 6, 10], suffix: 'ø7' },
  { quality: 'dim7', offsets: [0, 3, 6, 9], suffix: '°7' },
];

/** Chord spelling follows members, so C°7 shows B𝄫 rather than calling it A. */
export function noteName(
  note: number,
  chord?: ChordStructure,
  octave = false
): string {
  let name = names[pitchClass(note)];
  if (chord) {
    const member = chord.offsets.indexOf(pitchClass(note - chord.root));
    if (member >= 0) {
      const rootName = names[pitchClass(chord.root)];
      const letter = (letters.indexOf(rootName[0]) + member * 2) % 7;
      let difference = pitchClass(note) - naturalPitches[letter];
      if (difference > 6) difference -= 12;
      if (difference < -6) difference += 12;
      const accidental =
        difference === -2
          ? '𝄫'
          : difference === -1
            ? '♭'
            : difference === 1
              ? '♯'
              : difference === 2
                ? '𝄪'
                : '';
      name = `${letters[letter]}${accidental}`;
    }
  }
  return `${name}${octave ? Math.floor(note / 12) - 1 : ''}`;
}

export function chordMember(
  note: number,
  chord: ChordStructure,
  zh: boolean
): string {
  const index = chord.offsets.indexOf(pitchClass(note - chord.root));
  return (
    (zh
      ? ['根音', '三音', '五音', '七音']
      : ['Root', 'Third', 'Fifth', 'Seventh'])[index] ?? ''
  );
}

/** Only recognize the exact pitch-class set. Prefer known root for symmetric °7. */
export function identifyChord(
  notes: readonly number[],
  tonic: number,
  preferredRoot?: number
): ChordStructure | undefined {
  const classes = [...new Set(notes.map(pitchClass))];
  if (classes.length < 3) return undefined;
  const roots = [
    ...new Set([
      ...(preferredRoot === undefined ? [] : [pitchClass(preferredRoot)]),
      pitchClass(tonic),
      ...classes,
    ]),
  ];
  for (const root of roots) {
    const offsets = classes
      .map(note => pitchClass(note - root))
      .sort((a, b) => a - b);
    const pattern = chordPatterns.find(
      item =>
        item.offsets.length === offsets.length &&
        item.offsets.every((offset, index) => offset === offsets[index])
    );
    if (!pattern) continue;
    const rootMidi = Math.min(...notes) - pitchClass(Math.min(...notes) - root);
    return {
      root: rootMidi,
      quality: pattern.quality,
      offsets: [...pattern.offsets],
      symbol: `${names[root]}${pattern.suffix}`,
    };
  }
  return undefined;
}

export function romanSymbol(chord: ChordStructure, tonic: number): string {
  const offset = pitchClass(chord.root - tonic);
  const degree: Record<number, string> = {
    0: 'I',
    2: 'II',
    3: '♭III',
    5: 'IV',
    7: 'V',
    8: '♭VI',
    9: 'VI',
    10: '♭VII',
    11: 'VII',
  };
  const base = degree[offset];
  if (!base) return chord.symbol;
  if (chord.quality === 'major') return base;
  if (chord.quality === 'minor') return base.toLowerCase();
  if (chord.quality === 'diminished') return `${base.toLowerCase()}°`;
  return chord.symbol;
}

export function eventEnd(events: readonly PracticeEvent[]): number {
  return events.length
    ? Math.max(...events.map(item => item.time + item.duration))
    : 0;
}

/** Event onset groups describe the music itself, not a cosmetic animation cycle. */
export function groupEvents(
  events: readonly PracticeEvent[]
): { time: number; duration: number; notes: number[] }[] {
  const groups = new Map<number, PracticeEvent[]>();
  for (const event of events) {
    const group = groups.get(event.time) ?? [];
    group.push(event);
    groups.set(event.time, group);
  }
  return [...groups]
    .sort(([a], [b]) => a - b)
    .map(([time, group]) => ({
      time,
      duration: Math.max(...group.map(item => item.duration)),
      notes: [...new Set(group.map(item => item.note))].sort((a, b) => a - b),
    }));
}

export function soundingNotes(
  events: readonly PracticeEvent[],
  seconds: number
): number[] {
  return [
    ...new Set(
      events
        .filter(
          event =>
            seconds >= event.time && seconds < event.time + event.duration
        )
        .map(event => event.note)
    ),
  ];
}

/** Keep the musical context through a rest, while sounding-note highlights go dark. */
export function frameAtTime(
  frames: readonly LearningFrame[],
  seconds: number
): LearningFrame | undefined {
  let current: LearningFrame | undefined;
  for (const frame of frames) {
    if (frame.time > seconds) break;
    current = frame;
  }
  return current;
}

/** Contextual melody asks about its final pair, after the shared opening motif. */
export function targetPitchPair(
  lesson: Lesson,
  example: LessonExample
): [number, number] {
  if (lesson.type === 'degree') return [example.tonic, example.events[0].note];
  const pair =
    lesson.id === 'intervals-context'
      ? example.events.slice(-2)
      : example.events.slice(0, 2);
  return [pair[0].note, pair[1].note];
}

export function bassRoute(example: LessonExample): number[] {
  return groupEvents(example.events).map(group => Math.min(...group.notes));
}

function appendSegment(
  playback: LearningPlayback,
  lesson: Lesson,
  example: LessonExample,
  events: readonly PracticeEvent[],
  phase: LearningFrame['phase'],
  start: number
) {
  const structureEvents = phase === 'detail' ? events : example.events;
  const union = [...new Set(structureEvents.map(event => event.note))].sort(
    (a, b) => a - b
  );
  const fixedChord = [
    'triad',
    'inversion',
    'seventh',
    'seventh-inversion',
  ].includes(lesson.type);
  const wholeStructure = fixedChord && phase !== 'reference';
  const tonal = ['function', 'bass-motion', 'cadence', 'progression'].includes(
    lesson.type
  );
  playback.events.push(
    ...events.map(event => ({ ...event, time: event.time + start }))
  );
  for (const [index, group] of groupEvents(events).entries()) {
    const structure = wholeStructure ? union : group.notes;
    const chord = identifyChord(
      structure,
      example.tonic,
      wholeStructure ? example.tonic : undefined
    );
    const symbol = chord
      ? phase === 'reference' || tonal
        ? romanSymbol(chord, example.tonic)
        : chord.symbol
      : group.notes.map(note => noteName(note)).join(' + ');
    playback.frames.push({
      id: `${phase}-${example.choice.id}-${start}-${index}`,
      time: start + group.time,
      duration: group.duration,
      notes: group.notes,
      structure,
      chord,
      symbol,
      phase,
      example,
    });
  }
}

/** A comparison shares one key reference, then holds tonic and timbre constant. */
export function buildLearningPlayback(
  lesson: Lesson,
  examples: readonly LessonExample[],
  mode: 'example' | 'detail' | 'reference' = 'example'
): LearningPlayback {
  const playback: LearningPlayback = { events: [], frames: [] };
  const first = examples[0];
  if (!first) return playback;
  let start = 0;
  if (mode === 'reference' || mode === 'example') {
    if (first.referenceEvents.length) {
      appendSegment(
        playback,
        lesson,
        first,
        first.referenceEvents,
        'reference',
        0
      );
      start = eventEnd(first.referenceEvents) + 0.45;
    }
    if (mode === 'reference') return playback;
  }
  for (const example of examples) {
    const events = mode === 'detail' ? example.hintEvents : example.events;
    appendSegment(
      playback,
      lesson,
      example,
      events,
      mode === 'detail' ? 'detail' : 'example',
      start
    );
    start = eventEnd(playback.events) + 0.85;
  }
  return playback;
}

/** Enough piano keys to include every sounding pitch; bounded by lesson events. */
export function keyboardRange(notes: readonly number[]): number[] {
  if (!notes.length)
    return Array.from({ length: 13 }, (_, index) => index + 60);
  const low = Math.min(...notes);
  const high = Math.max(...notes);
  let start = low - pitchClass(low);
  let end = Math.max(start + 12, high);
  // Include the next C when possible without displaying a huge unused register.
  end += (12 - pitchClass(end)) % 12;
  if (end - start > 24) start = low;
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
