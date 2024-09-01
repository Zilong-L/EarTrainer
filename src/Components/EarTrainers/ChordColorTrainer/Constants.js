
const apps = [{ name: 'Ear Trainer', path: '/ear-trainer' }, { name: 'Chord Trainer', path: '/chord-trainer' }];
const CHORD_TYPES = ['M', 'm', 'o','M7','m7','7'];

const keyMap = {
    '1': 0,
    '2': 2,
    '3': 4,
    '4': 5,
    '5': 7,
    '6': 9,
    '7': 11,
    'a': 1,
    's': 3,
    'd': 6,
    'f': 8,
    'g': 10
  };
  const degrees = [
    { name: "I", distance: 0, enable: true },
    { name: "IIb", distance: 1, enable: false },
    { name: "II", distance: 2, enable: true },
    { name: "IIIb", distance: 3, enable: false },
    { name: "III", distance: 4, enable: true },
    { name: "IV", distance: 5, enable: false },
    { name: "Vb", distance: 6, enable: false },
    { name: "V", distance: 7, enable: false },
    { name: "VIb", distance: 8, enable: false },
    { name: "VI", distance: 9, enable: false },
    { name: "VIIb", distance: 10, enable: false },
    { name: "VII", distance: 11, enable: false },
  ];
const defaultDegreeChordTypes = [
  {
    degree: 'I',
    distance: 0, // 添加距离
    chordTypes: ['M']
  },
  {
    degree: 'IIb',
    distance: 1, // 添加距离
    chordTypes: []
  },
  {
    degree: 'II',
    distance: 2, // 添加距离
    chordTypes: ['m']
  },
  {
    degree: 'IIIb',
    distance: 3, // 添加距离
    chordTypes: []
  },
  {
    degree: 'III',
    distance: 4, // 添加距离
    chordTypes: ['m']
  },
  {
    degree: 'IV',
    distance: 5, // 添加距离
    chordTypes: ['M']
  },
  {
    degree: 'Vb',
    distance: 6, // 添加距离
    chordTypes: []
  },
  {
    degree: 'V',
    distance: 7, // 添加距离
    chordTypes: ['M']
  },
  {
    degree: 'VIb',
    distance: 8, // 添加距离
    chordTypes: []
  },
  {
    degree: 'VI',
    distance: 9, // 添加距离
    chordTypes: ['m']
  },
  {
    degree: 'VIIb',
    distance: 10, // 添加距离
    chordTypes: []
  },
  {
    degree: 'VII',
    distance: 11, // 添加距离
    chordTypes: ['o']
  }
]
const chordPreset = {
  'major':[{
    degree: 'I',
    chordTypes: ['M'] // 保持不变
  },
  {
    degree: 'II',
    chordTypes: ['m'] // 保持不变
  },
  {
    degree: 'III',
    chordTypes: ['m'] // 修改为数组
  },
  {
    degree: 'IV',
    chordTypes: ['M'] // 修改为数组
  },
  {
    degree: 'V',
    chordTypes: ['M'] // 修改为数组
  },
  {
    degree: 'VI',
    chordTypes: ['m'] // 修改为数组
  },
  {
    degree: 'VII',
    chordTypes: ['o'] // 修改为数组
  }],
  'minor':[{
    degree: 'I',
    chordTypes: ['m'] // 修改为数组
  },
  {
    degree: 'II',
    chordTypes: ['o'] // 修改为数组
  },
  {
    degree: 'III',
    chordTypes: ['M'] // 修改为数组
  },
  {
    degree: 'IV',
    chordTypes: ['m'] // 修改为数组
  },
  {
    degree: 'V',
    chordTypes: ['m'] // 修改为数组
  },
  {
    degree: 'VI',
    chordTypes: ['M'] // 修改为数组
  },
  {
    degree: 'VII',
    chordTypes: ['M'] // 修改为数组
  }],
  
  
}
const VoicingDictionary = {
  M: ["1P 3M 5P", "3M 5P 8P", "5P 8P 10M"],
  m: ["1P 3m 5P", "3m 5P 8P", "5P 8P 10m"],
  o: ["1P 3m 5d", "3m 5d 8P", "5d 8P 10m"],
  aug: ["1P 3m 5A", "3m 5A 8P", "5A 8P 10m"],
  m7: ["1P 3m 5P 7m", "7m 9M 10m 12P"],
  "7": ["3M 6M 7m 9M", "7m 9M 10M 13M"],
  "M7": ["3M 5P 7M 9M", "7M 9M 10M 12P"],
  "69": ["3M 5P 6A 9M"],
  m7b5: ["3m 5d 7m 8P", "7m 8P 10m 12d"],
  "7b9": ["3M 6m 7m 9m", "7m 9m 10M 13m"], // b9 / b13
  "7b13": ["3M 6m 7m 9m", "7m 9m 10M 13m"], // b9 / b13
  o7: ["1P 3m 5d 6M", "5d 6M 8P 10m"],
  "7#11": ["7m 9M 11A 13A"],
  "7#9": ["3M 7m 9A"],
  mM7: ["3m 5P 7M 9M", "7M 9M 10m 12P"],
  m6: ["3m 5P 6M 9M", "6M 9M 10m 12P"],
};
export { apps,keyMap,degrees,defaultDegreeChordTypes,CHORD_TYPES,VoicingDictionary,chordPreset};
