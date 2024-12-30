
const apps = [{ name: 'earTrainer', path: '/ear-trainer' }, { name: 'chordTrainer', path: '/chord-trainer' }];
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
    { name: "I", distance: 0, enable: true, interval: "1P" },   // Perfect Unison
    { name: "IIb", distance: 1, enable: false, interval: "2m" }, // Minor Second
    { name: "II", distance: 2, enable: true, interval: "2M" },   // Major Second
    { name: "IIIb", distance: 3, enable: false, interval: "3m" }, // Minor Third
    { name: "III", distance: 4, enable: true, interval: "3M" },  // Major Third
    { name: "IV", distance: 5, enable: false, interval: "4P" },  // Perfect Fourth
    { name: "Vb", distance: 6, enable: false, interval: "4A" },  // Augmented Fourth (Tritone)
    { name: "V", distance: 7, enable: false, interval: "5P" },   // Perfect Fifth
    { name: "VIb", distance: 8, enable: false, interval: "6m" }, // Minor Sixth
    { name: "VI", distance: 9, enable: false, interval: "6M" },  // Major Sixth
    { name: "VIIb", distance: 10, enable: false, interval: "7m" }, // Minor Seventh
    { name: "VII", distance: 11, enable: false, interval: "7M" }, // Major Seventh
  ];
  
  const initialUserProgress = [
    {
      level: 1,
      degrees: [true, false, false, false, false, false, false, false, false, false, false, true], // 1 7
      unlocked: true,
      best: 0,
      notes: "1 7",
    },
    {
      level: 2,
      degrees: [true, false, false, false, false, false, false, true, false, false, false, true], // 1 5 7
      unlocked: false,
      best: 0,
      notes: "1 5 7",
    },
    {
      level: 3,
      degrees: [true, false, false, false, true, false, false, true, false, false, false, true], // 1 3 5 7
      unlocked: false,
      best: 0,
      notes: "1 3 5 7",
    },
    {
      level: 4,
      degrees: [true, false, true, false, true, false, false, true, false, false, false, true], // 1 2 3 5 7
      unlocked: false,
      best: 0,
      notes: "1 2 3 5 7",
    },
    {
      level: 5,
      degrees: [true, false, true, false, true, false, false, true, false, true, false, true], // Corrected: 1 2 3 5 6 7
      unlocked: false,
      best: 0,
      notes: "1 2 3 5 6 7",
    },
    {
      level: 6,
      degrees: [true, false, true, false, true, true, false, true, false, true, false, true], // Corrected: 1 2 3 4 5 6 7
      unlocked: false,
      best: 0,
      notes: "1 2 3 4 5 6 7",
    },
    {
      level: 7,
      degrees: [true, false, true, false, true, true, true, true, false, true, false, true], // Corrected: 1 2 3 4 #4 5 6 7
      unlocked: false,
      best: 0,
      notes: "1 2 3 4 #4 5 6 7",
    },
    {
      level: 8,
      degrees: [true, false, true, true, false, false, false, false, false, false, false, false], // 1 2 b3
      unlocked: false,
      best: 0,
      notes: "1 2 b3",
    },
    {
      level: 9,
      degrees: [true, false, true, true, false, false, false, true, false, false, false, false], // Corrected: 1 2 b3 5
      unlocked: false,
      best: 0,
      notes: "1 2 b3 5",
    },
    {
      level: 10,
      degrees: [true, false, true, true, false, false, false, true, true, false, false, false], // Corrected: 1 2 b3 5 b6
      unlocked: false,
      best: 0,
      notes: "1 2 b3 5 b6",
    },
    {
      level: 11,
      degrees: [true, false, true, true, false, false, false, true, true, false, true, false], // Corrected: 1 2 b3 5 b6 b7
      unlocked: false,
      best: 0,
      notes: "1 2 b3 5 b6 b7",
    },
    {
      level: 12,
      degrees: [true, false, true, true, false, true, false, true, true, false, true, false], // Corrected: 1 2 b3 4 5 b6 b7
      unlocked: false,
      best: 0,
      notes: "1 2 b3 4 5 b6 b7",
    },
    {
      level: 13,
      degrees: [true, true, true, true, false, true, false, true, true, false, true, false], // Corrected: 1 b2 2 b3 4 5 b6 b7
      unlocked: false,
      best: 0,
      notes: "1 b2 2 b3 4 5 b6 b7",
    },
    {
      level: 14,
      degrees: [true, false, false, false, false, true, false, true, false, false, false, true], // Corrected: 1 4 5 7
      unlocked: false,
      best: 0,
      notes: "1 4 5 7",
    },
    {
      level: 15,
      degrees: [true, false, false, false, false, true, false, true, false, false, true, true], // Corrected: 1 4 5 b7 7
      unlocked: false,
      best: 0,
      notes: "1 4 5 b7 7",
    },
    {
      level: 16,
      degrees: [true, false, false, true, true, true, false, true, false, false, true, true], // Corrected: 1 b3 3 4 5 b7 7
      unlocked: false,
      best: 0,
      notes: "1 b3 3 4 5 b7 7",
    },
    {
      level: 17,
      degrees: [true, true, true, true, true, true, false, true, false, false, true, true], // Corrected: 1 b2 2 b3 3 4 5 b7 7
      unlocked: false,
      best: 0,
      notes: "1 b2 2 b3 3 4 5 b7 7",
    },
    {
      level: 18,
      degrees: [true, true, true, true, true, true, true, true, false, false, true, true], // Corrected: 1 b2 2 b3 3 4 #4 5 b7 7
      unlocked: false,
      best: 0,
      notes: "1 b2 2 b3 3 4 #4 5 b7 7",
    },
    {
      level: 19,
      degrees: [true, true, true, true, true, true, true, true, false, false, true, true], // Corrected: 1 b2 2 b3 3 4 #4 b5 5 b7 7
      unlocked: false,
      best: 0,
      notes: "1 b2 2 b3 3 4 #4/b5 5 b7 7",
    },
    {
      level: 20,
      degrees: [true, true, true, true, true, true, true, true, true, true, true, true], // Corrected: 1 b2 2 b3 3 4 #4 b5 5 b6 6 b7 7
      unlocked: false,
      best: 0,
      notes: "1 b2 2 b3 3 4 #4 b5 5 b6 6 b7 7",
    },
  ];
  
  

  

export {apps, keyMap, degrees,initialUserProgress};