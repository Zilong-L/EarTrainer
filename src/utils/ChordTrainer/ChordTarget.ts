import { Chord, Note } from 'tonal';

export type ChordTargetSource =
  | { kind: 'symbol'; value: string }
  | { kind: 'roman'; value: string }
  | { kind: 'degree'; value: string };

export type ChordTarget = {
  // Display label only (does not affect matching).
  label: string;

  // Root pitch class (0-11) for deriving allowed extra tones.
  rootPc: number;

  // All chord-tone pitch classes (0-11) for the target chord symbol.
  // These are always allowed to be played (even if some are optional).
  chordPcs: number[];

  // Pitch classes (0-11) that must be present in the active notes.
  requiredPcs: number[];

  // Pitch classes (0-11) that are allowed as added notes (superset matching).
  // If empty, no added notes are allowed.
  allowedExtraPcs: number[];

  // If set, the lowest active note's pitch class must match.
  requiredBassPc?: number;

  // If false, active pcs must match required pcs exactly (no extras).
  // v1 uses true (superset/contains matching).
  allowExtraPcs: boolean;

  source?: ChordTargetSource;
};

const mod12 = (n: number) => ((n % 12) + 12) % 12;

const uniqSorted = (nums: number[]) =>
  Array.from(new Set(nums)).sort((a, b) => a - b);

// Semitone offsets (relative to the chord root) for allowed added notes.
// Example: +2 semitones is a 9th; +9 semitones is a 13th/6th.
export enum AllowedExtraOffset {
  Major2 = 2, // 9th
  Perfect4 = 5, // 11th
  Major6 = 9, // 13th / 6th
  Minor7 = 10, // b7
}

// Limit which "added notes" are allowed for each chord quality.
// Notes are expressed as semitone offsets from the chord root.
// Example: for a simple major triad, allow +2 (9) and +9 (13/6).
const ALLOWED_EXTRA_OFFSETS_BY_CHORD_TYPE: Record<
  string,
  AllowedExtraOffset[]
> = {
  // Major-ish
  major: [AllowedExtraOffset.Major2, AllowedExtraOffset.Major6],
  'major seventh': [AllowedExtraOffset.Major2, AllowedExtraOffset.Major6],
  'dominant seventh': [AllowedExtraOffset.Major2, AllowedExtraOffset.Major6],
  sixth: [AllowedExtraOffset.Major2, AllowedExtraOffset.Major6],
  augmented: [AllowedExtraOffset.Major2, AllowedExtraOffset.Major6],

  // Minor-ish
  minor: [
    AllowedExtraOffset.Major2,
    AllowedExtraOffset.Perfect4,
    AllowedExtraOffset.Minor7,
  ],
  'minor seventh': [
    AllowedExtraOffset.Major2,
    AllowedExtraOffset.Perfect4,
    AllowedExtraOffset.Minor7,
  ],
  'minor sixth': [
    AllowedExtraOffset.Major2,
    AllowedExtraOffset.Perfect4,
    AllowedExtraOffset.Minor7,
  ],
};

function allowedExtraPcsForChordType(
  rootPc: number,
  chordType: string
): number[] {
  const offsets = ALLOWED_EXTRA_OFFSETS_BY_CHORD_TYPE[chordType] ?? [];
  return uniqSorted(offsets.map(off => mod12(rootPc + off)));
}

export function activeNotesToPcs(activeNotes: number[]): {
  pcs: number[];
  bassPc?: number;
} {
  if (!activeNotes || activeNotes.length === 0) return { pcs: [] };
  const pcs = uniqSorted(activeNotes.map(mod12));
  const bassPc = mod12(activeNotes[0]!);
  return { pcs, bassPc };
}

export function chordTargetFromSymbol(
  symbol: string,
  opts: { requireBass?: boolean } = {}
): ChordTarget | null {
  const trimmed = (symbol ?? '').trim();
  if (!trimmed) return null;

  const [tonic, type, bass] = Chord.tokenize(trimmed);
  if (!tonic) return null;

  const rootPcRaw = Note.chroma(tonic);
  if (typeof rootPcRaw !== 'number') return null;
  const rootPc = rootPcRaw;

  const baseSymbol = `${tonic}${type ?? ''}`;
  const baseChord = Chord.get(baseSymbol);
  if (baseChord.empty || !baseChord.notes?.length) return null;

  const chordPcs = uniqSorted(
    baseChord.notes
      .map(n => Note.chroma(n))
      .filter((pc): pc is number => typeof pc === 'number')
  );

  // All chords that include a 7th may omit the 5th, but playing the 5th is still allowed.
  const has7 = baseChord.intervals?.some(ivl => ivl.startsWith('7')) ?? false;
  const fifthIvl = baseChord.intervals?.find(ivl => ivl.startsWith('5')) ?? '';
  const fifthPc =
    has7 && fifthIvl ? Note.chroma(Note.transpose(tonic, fifthIvl)) : undefined;

  const requiredPcs =
    has7 && typeof fifthPc === 'number'
      ? chordPcs.filter(pc => pc !== fifthPc)
      : chordPcs;

  let requiredBassPc: number | undefined;
  // Only enforce bass when the symbol explicitly specifies it (slash chords).
  // Root-position chords should accept any inversion unless the caller chooses
  // to encode the desired bass as an explicit slash chord.
  if (opts.requireBass && bass) {
    const pc = Note.chroma(bass);
    if (typeof pc === 'number') requiredBassPc = pc;
  }

  const allowedExtraPcs = allowedExtraPcsForChordType(rootPc, baseChord.type);
  const chordSet = new Set(chordPcs);
  const allowedExtraPcsFiltered = allowedExtraPcs.filter(
    pc => !chordSet.has(pc)
  );

  return {
    label: trimmed,
    rootPc,
    chordPcs,
    requiredPcs,
    allowedExtraPcs: allowedExtraPcsFiltered,
    requiredBassPc,
    allowExtraPcs: true,
    source: { kind: 'symbol', value: trimmed },
  };
}

export function isMatchSuperset(
  activeNotes: number[],
  target: ChordTarget
): boolean {
  const { pcs, bassPc } = activeNotesToPcs(activeNotes);
  if (pcs.length === 0) return false;

  const activeSet = new Set(pcs);
  for (const req of target.requiredPcs) {
    if (!activeSet.has(req)) return false;
  }

  if (typeof target.requiredBassPc === 'number') {
    if (typeof bassPc !== 'number') return false;
    if (bassPc !== target.requiredBassPc) return false;
  }

  if (target.allowExtraPcs) {
    const allowedSet = new Set<number>(target.chordPcs);
    for (const pc of target.allowedExtraPcs) allowedSet.add(pc);
    // If bass is required but not a chord tone, it must still be considered allowed.
    if (typeof target.requiredBassPc === 'number') {
      allowedSet.add(target.requiredBassPc);
    }

    // Enforce the "allowed added notes" constraint.
    for (const pc of pcs) {
      if (!allowedSet.has(pc)) return false;
    }
  } else {
    // Exact match mode (not used by default).
    if (pcs.length !== target.requiredPcs.length) return false;
    const requiredSet = new Set<number>(target.requiredPcs);
    for (const pc of pcs) {
      if (!requiredSet.has(pc)) return false;
    }
  }

  return true;
}
