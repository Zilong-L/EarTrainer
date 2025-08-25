interface App {
  name: string;
  path: string;
}

interface Degree {
  name: string;
  distance: number;
  enable: boolean;
}

interface DegreeChordType {
  degree: string;
  distance: number;
  chordTypes: string[];
}

interface ChordSetting {
  degree: string;
  chordTypes: string[];
}

interface ChordPreset {
  [key: string]: ChordSetting[];
}

interface VoicingDictionaryType {
  rootPosition: {
    [key: string]: string[];
  };
  [key: string]: string[] | { [key: string]: string[] };
}

const apps: App[] = [
  { name: 'earTrainer', path: '/ear-trainer' },
  { name: 'chordTrainer', path: '/chord-trainer' },
];
const CHORD_TYPES: string[] = [
  'M',
  'm',
  'dim',
  'M7',
  'm7',
  '7',
  'dim7',
  'm7b5',
  'aug',
];
const keyMap: { [key: string]: number } = {
  '1': 0,
  '2': 2,
  '3': 4,
  '4': 5,
  '5': 7,
  '6': 9,
  '7': 11,
  a: 1,
  s: 3,
  d: 6,
  f: 8,
  g: 10,
};

const degrees: Degree[] = [
  { name: 'I', distance: 0, enable: true },
  { name: 'IIb', distance: 1, enable: false },
  { name: 'II', distance: 2, enable: true },
  { name: 'IIIb', distance: 3, enable: false },
  { name: 'III', distance: 4, enable: true },
  { name: 'IV', distance: 5, enable: false },
  { name: 'Vb', distance: 6, enable: false },
  { name: 'V', distance: 7, enable: false },
  { name: 'VIb', distance: 8, enable: false },
  { name: 'VI', distance: 9, enable: false },
  { name: 'VIIb', distance: 10, enable: false },
  { name: 'VII', distance: 11, enable: false },
];

const defaultDegreeChordTypes: DegreeChordType[] = [
  {
    degree: 'I',
    distance: 0,
    chordTypes: ['M'],
  },
  {
    degree: 'IIb',
    distance: 1,
    chordTypes: [],
  },
  {
    degree: 'II',
    distance: 2,
    chordTypes: ['m'],
  },
  {
    degree: 'IIIb',
    distance: 3,
    chordTypes: [],
  },
  {
    degree: 'III',
    distance: 4,
    chordTypes: ['m'],
  },
  {
    degree: 'IV',
    distance: 5,
    chordTypes: ['M'],
  },
  {
    degree: 'Vb',
    distance: 6,
    chordTypes: [],
  },
  {
    degree: 'V',
    distance: 7,
    chordTypes: ['M'],
  },
  {
    degree: 'VIb',
    distance: 8,
    chordTypes: [],
  },
  {
    degree: 'VI',
    distance: 9,
    chordTypes: ['m'],
  },
  {
    degree: 'VIIb',
    distance: 10,
    chordTypes: [],
  },
  {
    degree: 'VII',
    distance: 11,
    chordTypes: ['o'],
  },
];

const chordPreset: ChordPreset = {
  大调: [
    {
      degree: 'I',
      chordTypes: ['M'],
    },
    {
      degree: 'II',
      chordTypes: ['m'],
    },
    {
      degree: 'III',
      chordTypes: ['m'],
    },
    {
      degree: 'IV',
      chordTypes: ['M'],
    },
    {
      degree: 'V',
      chordTypes: ['M'],
    },
    {
      degree: 'VI',
      chordTypes: ['m'],
    },
    {
      degree: 'VII',
      chordTypes: ['o'],
    },
  ],
  小调: [
    {
      degree: 'I',
      chordTypes: ['m'],
    },
    {
      degree: 'II',
      chordTypes: ['o'],
    },
    {
      degree: 'III',
      chordTypes: ['M'],
    },
    {
      degree: 'IV',
      chordTypes: ['m'],
    },
    {
      degree: 'V',
      chordTypes: ['m'],
    },
    {
      degree: 'VI',
      chordTypes: ['M'],
    },
    {
      degree: 'VII',
      chordTypes: ['M'],
    },
  ],
  基础色彩: [
    {
      degree: 'I',
      chordTypes: ['M', 'm', 'o'],
    },
  ],
  custom: [
    {
      degree: 'I',
      chordTypes: ['M'],
    },
    {
      degree: 'IIb',
      chordTypes: [],
    },
    {
      degree: 'II',
      chordTypes: [],
    },
    {
      degree: 'IIIb',
      chordTypes: [],
    },
    {
      degree: 'III',
      chordTypes: [],
    },
    {
      degree: 'IV',
      chordTypes: [],
    },
    {
      degree: 'Vb',
      chordTypes: [],
    },
    {
      degree: 'V',
      chordTypes: [],
    },
    {
      degree: 'VIb',
      chordTypes: [],
    },
    {
      degree: 'VI',
      chordTypes: [],
    },
    {
      degree: 'VIIb',
      chordTypes: [],
    },
    {
      degree: 'VII',
      chordTypes: [],
    },
  ],
};

const VoicingDictionary: VoicingDictionaryType = {
  rootPosition: {
    M: ['1P 3M 5P'],
    m: ['1P 3m 5P'],
    dim: ['1P 3m 5d'],
    aug: ['1P 3M 5A'],
    m7: ['1P 3m 5P 7m'],
    '7': ['1P 3M 5P 7m'],
    M7: ['1P 3M 5P 7M'],
    '69': ['1P 3M 5P 6A'],
    m7b5: ['1P 3m 5d 7m'],
    '7b9': ['3M 6m 7m 9m'],
    '7b13': ['1P 3M 5m 7m'],
    dim7: ['1P 3m 5d 6M'],
  },
  M: ['1P 3M 5P', '3M 5P 8P', '5P 8P 10M'],
  m: ['1P 3m 5P', '3m 5P 8P', '5P 8P 10m'],
  dim: ['1P 3m 5d', '3m 5d 8P', '5d 8P 10m'],
  aug: ['1P 3M 5A', '3M  5A 8P', '5A 8P 10m'],
  m7: ['1P 3m 5P 7m', '7m 9M 10m 12P'],
  '7': ['3M 6M 7m 9M', '7m 9M 10M 13M'],
  M7: ['3M 5P 7M 9M', '7M 9M 10M 12P'],
  '69': ['3M 5P 6A 9M'],
  m7b5: ['3m 5d 7m 8P', '7m 8P 10m 12d'],
  '7b9': ['3M 6m 7m 9m', '7m 9m 10M 13m'],
  '7b13': ['3M 6m 7m 9m', '7m 9m 10M 13m'],
  dim7: ['1P 3m 5d 6M', '5d 6M 8P 10m'],
  '7#11': ['7m 9M 11A 13A'],
  '7#9': ['3M 7m 9A'],
  mM7: ['3m 5P 7M 9M', '7M 9M 10m 12P'],
  m6: ['3m 5P 6M 9M', '6M 9M 10m 12P'],
};

export {
  apps,
  keyMap,
  degrees,
  defaultDegreeChordTypes,
  CHORD_TYPES,
  VoicingDictionary,
  chordPreset,
};
export type {
  App,
  Degree,
  DegreeChordType,
  ChordSetting,
  ChordPreset,
  VoicingDictionaryType,
};
