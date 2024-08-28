const apps = [{ name: 'Ear Trainer', path: '/ear-trainer' }, { name: 'Chord Trainer', path: '/chord-trainer' }];
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

export { apps, keyMap, degrees };
