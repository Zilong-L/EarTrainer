export type ProgressionKeyMode = 'major' | 'minor' | 'any';

export type ProgressionStep = {
  symbol: string; // chord symbol in baseTonic
  requireBass?: boolean; // overrides default "/" behavior
};

export type ProgressionDef = {
  id: string;
  name: string; // language-neutral label (e.g. "I–V–vi–IV")
  keyMode: ProgressionKeyMode;
  baseTonic: string; // reference tonic for transposition (e.g. "C" for major, "A" for minor)
  tags?: string[];
  steps: ProgressionStep[];
};

// NOTE: These are stored as chord symbols relative to baseTonic.
// Transposition at runtime converts them to the user's selected rootNote.
export const DIATONIC_PROGRESSIONS: ProgressionDef[] = [
  {
    id: 'pop-1564',
    name: 'I–V–vi–IV',
    keyMode: 'major',
    baseTonic: 'C',
    tags: ['pop'],
    steps: [
      { symbol: 'C' },
      { symbol: 'G' },
      { symbol: 'Am' },
      { symbol: 'F' },
    ],
  },
  {
    id: 'pop-1645',
    name: 'I–vi–IV–V',
    keyMode: 'major',
    baseTonic: 'C',
    tags: ['pop', '50s'],
    steps: [
      { symbol: 'C' },
      { symbol: 'Am' },
      { symbol: 'F' },
      { symbol: 'G' },
    ],
  },
  {
    id: 'pop-6415',
    name: 'vi–IV–I–V',
    keyMode: 'major',
    baseTonic: 'C',
    tags: ['pop'],
    steps: [
      { symbol: 'Am' },
      { symbol: 'F' },
      { symbol: 'C' },
      { symbol: 'G' },
    ],
  },
  {
    id: 'basic-1451',
    name: 'I–IV–V–I',
    keyMode: 'major',
    baseTonic: 'C',
    tags: ['basic'],
    steps: [{ symbol: 'C' }, { symbol: 'F' }, { symbol: 'G' }, { symbol: 'C' }],
  },
  {
    id: 'basic-151',
    name: 'I–V–I',
    keyMode: 'major',
    baseTonic: 'C',
    tags: ['basic'],
    steps: [{ symbol: 'C' }, { symbol: 'G' }, { symbol: 'C' }],
  },
  {
    id: 'basic-154',
    name: 'I–V–IV',
    keyMode: 'major',
    baseTonic: 'C',
    tags: ['basic'],
    steps: [{ symbol: 'C' }, { symbol: 'G' }, { symbol: 'F' }],
  },
  {
    id: 'jazz-251',
    name: 'ii7–V7–Imaj7',
    keyMode: 'major',
    baseTonic: 'C',
    tags: ['jazz'],
    steps: [{ symbol: 'Dm7' }, { symbol: 'G7' }, { symbol: 'Cmaj7' }],
  },
  {
    id: 'jazz-3625',
    name: 'iii7–vi7–ii7–V7',
    keyMode: 'major',
    baseTonic: 'C',
    tags: ['jazz'],
    steps: [
      { symbol: 'Em7' },
      { symbol: 'Am7' },
      { symbol: 'Dm7' },
      { symbol: 'G7' },
    ],
  },
  {
    id: 'sd-1625',
    name: 'I–VI7–ii7–V7 (secondary dom)',
    keyMode: 'major',
    baseTonic: 'C',
    tags: ['secondary-dominant'],
    steps: [
      { symbol: 'C' },
      { symbol: 'A7' },
      { symbol: 'Dm7' },
      { symbol: 'G7' },
    ],
  },
  {
    id: 'borrow-13644m',
    name: 'I–III–vi–IV–IVm (borrowed)',
    keyMode: 'major',
    baseTonic: 'C',
    tags: ['borrowed'],
    steps: [
      { symbol: 'C' },
      { symbol: 'E' },
      { symbol: 'Am' },
      { symbol: 'F' },
      { symbol: 'Fm' },
    ],
  },
  {
    id: 'rock-b7-147',
    name: 'I–bVII–IV (rock)',
    keyMode: 'major',
    baseTonic: 'C',
    tags: ['borrowed', 'rock'],
    steps: [{ symbol: 'C' }, { symbol: 'Bb' }, { symbol: 'F' }],
  },
  {
    id: 'sus-1-4-5sus',
    name: 'I–IV–V7sus4',
    keyMode: 'major',
    baseTonic: 'C',
    tags: ['sus'],
    steps: [{ symbol: 'C' }, { symbol: 'F' }, { symbol: 'G7sus4' }],
  },

  // Bassline / slash-focused (still stored as symbols)
  {
    id: 'bass-1-1b-6-6g-4-4e-2-5-1',
    name: 'I–I/7–vi–vi/5–IV–IV/3–ii–V–I (bassline)',
    keyMode: 'major',
    baseTonic: 'C',
    tags: ['bassline'],
    steps: [
      { symbol: 'C' },
      { symbol: 'C/B', requireBass: true },
      { symbol: 'Am' },
      { symbol: 'Am/G', requireBass: true },
      { symbol: 'F' },
      { symbol: 'F/E', requireBass: true },
      { symbol: 'Dm' },
      { symbol: 'G' },
      { symbol: 'C' },
    ],
  },
  {
    id: 'bass-1-4-4g-1',
    name: 'I–IV–IV/V–I (F/G style)',
    keyMode: 'major',
    baseTonic: 'C',
    tags: ['bassline'],
    steps: [
      { symbol: 'C' },
      { symbol: 'F' },
      { symbol: 'F/G', requireBass: true },
      { symbol: 'C' },
    ],
  },
  {
    id: 'bass-1-1e-4-5-1',
    name: 'I–I/3–IV–V–I',
    keyMode: 'major',
    baseTonic: 'C',
    tags: ['bassline'],
    steps: [
      { symbol: 'C' },
      { symbol: 'C/E', requireBass: true },
      { symbol: 'F' },
      { symbol: 'G' },
      { symbol: 'C' },
    ],
  },

  // Minor key (reference A minor)
  {
    id: 'minor-aeolian-1767',
    name: 'i–bVII–bVI–bVII (aeolian)',
    keyMode: 'minor',
    baseTonic: 'A',
    tags: ['minor'],
    steps: [
      { symbol: 'Am' },
      { symbol: 'G' },
      { symbol: 'F' },
      { symbol: 'G' },
    ],
  },
  {
    id: 'minor-1647',
    name: 'i–bVI–bIII–bVII',
    keyMode: 'minor',
    baseTonic: 'A',
    tags: ['minor'],
    steps: [
      { symbol: 'Am' },
      { symbol: 'F' },
      { symbol: 'C' },
      { symbol: 'G' },
    ],
  },
  {
    id: 'minor-145',
    name: 'i–iv–V (harmonic feel)',
    keyMode: 'minor',
    baseTonic: 'A',
    tags: ['minor'],
    steps: [{ symbol: 'Am' }, { symbol: 'Dm' }, { symbol: 'E' }],
  },
  {
    id: 'minor-1-7-6-5',
    name: 'i–bVII–bVI–V',
    keyMode: 'minor',
    baseTonic: 'A',
    tags: ['minor'],
    steps: [
      { symbol: 'Am' },
      { symbol: 'G' },
      { symbol: 'F' },
      { symbol: 'E' },
    ],
  },
];
