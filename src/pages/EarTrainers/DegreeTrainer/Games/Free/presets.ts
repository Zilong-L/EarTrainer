export interface ModeDef {
  name: string;
  intervals: number[]; // semitone offsets within scale
}

export const modes: Record<string, ModeDef> = {
  // Major modes
  ionian: {
    name: 'Ionian (Major)',
    intervals: [0, 2, 4, 5, 7, 9, 11],
  },
  dorian: {
    name: 'Dorian',
    intervals: [0, 2, 3, 5, 7, 9, 10],
  },
  phrygian: {
    name: 'Phrygian',
    intervals: [0, 1, 3, 5, 7, 8, 10],
  },
  lydian: {
    name: 'Lydian',
    intervals: [0, 2, 4, 6, 7, 9, 11],
  },
  mixolydian: {
    name: 'Mixolydian',
    intervals: [0, 2, 4, 5, 7, 9, 10],
  },
  aeolian: {
    name: 'Aeolian (Natural Minor)',
    intervals: [0, 2, 3, 5, 7, 8, 10],
  },
  locrian: {
    name: 'Locrian',
    intervals: [0, 1, 3, 5, 6, 8, 10],
  },

  naturalMinor: {
    name: 'Natural Minor',
    intervals: [0, 2, 3, 5, 7, 8, 10],
  },
  harmonicMinor: {
    name: 'Harmonic Minor',
    intervals: [0, 2, 3, 5, 7, 8, 11],
  },

  // Melodic minor modes
  melodicMinor: {
    name: 'Melodic Minor',
    intervals: [0, 2, 3, 5, 7, 9, 11],
  },
};
