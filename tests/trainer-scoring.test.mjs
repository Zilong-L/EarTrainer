import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import { Chord, Note } from 'tonal';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as theory from '../src/pages/EarTrainers/ChordColorTrainer/musicTheory.ts';

const sameDependencies = (a, b) =>
  a?.length === b?.length &&
  a.every((value, index) => Object.is(value, b[index]));

function mountTrainer() {
  let cursor = 0;
  let dirty = false;
  let effects = [];
  const slots = [];
  const records = [];
  const schedules = [];
  let cancellations = 0;
  const documentEvents = new Map();
  const document = {
    hidden: false,
    addEventListener: (name, callback) => documentEvents.set(name, callback),
    removeEventListener: name => documentEvents.delete(name),
  };
  const t = value => value;
  const settings = {
    bpm: 80,
    pianoVolume: 0.55,
    rootNote: 'C3',
    range: ['C3', 'C5'],
    preset: '大调',
    degreeChordTypes: [
      { degree: 'I', chordTypes: ['M'] },
      { degree: 'II', chordTypes: ['m'] },
    ],
    updatePracticeRecords: (target, correct) =>
      records.push({ target, correct }),
    inversionMode: 'root',
    bassEnabled: true,
    bassLevel: 0.35,
    backingMode: 'off',
  };
  const react = {
    useState: initial => {
      const index = cursor++;
      if (!slots[index])
        slots[index] = {
          value: typeof initial === 'function' ? initial() : initial,
        };
      return [
        slots[index].value,
        next => {
          const value =
            typeof next === 'function' ? next(slots[index].value) : next;
          if (!Object.is(value, slots[index].value)) {
            slots[index].value = value;
            dirty = true;
          }
        },
      ];
    },
    useRef: initial => {
      const index = cursor++;
      if (!slots[index]) slots[index] = { value: { current: initial } };
      return slots[index].value;
    },
    useMemo: (factory, dependencies) => {
      const index = cursor++;
      if (
        !slots[index] ||
        !sameDependencies(slots[index].dependencies, dependencies)
      ) {
        slots[index] = { value: factory(), dependencies };
      }
      return slots[index].value;
    },
    useEffect: (callback, dependencies) => {
      const index = cursor++;
      if (
        !slots[index] ||
        !sameDependencies(slots[index].dependencies, dependencies)
      ) {
        const previous = slots[index]?.cleanup;
        slots[index] = { dependencies };
        effects.push(() => {
          previous?.();
          slots[index].cleanup = callback();
        });
      }
    },
  };
  react.useCallback = (callback, dependencies) =>
    react.useMemo(() => callback, dependencies);
  const dependencies = {
    react,
    'react-hot-toast': { default: { error() {} } },
    'react-i18next': { useTranslation: () => ({ t }) },
    tonal: { Chord, Note },
    '@utils/Tone/samplers': {
      getSamplerInstance: () => ({ setVolume() {} }),
      getDroneInstance: () => ({ stop() {} }),
    },
    '@utils/Tone/playbacks': {
      cancelAllSounds: () => cancellations++,
      scheduleNotes: async events => {
        schedules.push(events);
      },
    },
    '@stores/chordColorTrainerSettingsStore': { default: () => settings },
    './useChordColorTrainerSettings': { default: () => settings },
    '@utils/ChordTrainer/GameLogics': {
      getChords: () => [],
      compareChords: () => false,
    },
    './musicTheory': {
      ...theory,
      chooseNextChord: (choices, current) =>
        theory.chooseNextChord(choices, current, () => 0),
    },
  };
  const source = readFileSync(
    new URL(
      '../src/pages/EarTrainers/ChordColorTrainer/useChordColorTrainer.ts',
      import.meta.url
    ),
    'utf8'
  );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require: name => {
      assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    document,
    setTimeout: () => 1,
    clearTimeout() {},
  });
  const render = () => {
    let result;
    for (let attempt = 0; attempt < 15; attempt++) {
      cursor = 0;
      dirty = false;
      effects = [];
      result = exports.default('block');
      effects.forEach(effect => effect());
      if (!dirty) return result;
    }
    throw new Error('Trainer never settled');
  };
  return {
    render,
    settings,
    records,
    schedules,
    document,
    documentEvents,
    cancellations: () => cancellations,
  };
}

test('wrong then right counts one first attempt against target, never against wrong choice', async () => {
  const mounted = mountTrainer();
  let trainer = mounted.render();
  await trainer.startGame();
  trainer = mounted.render();
  assert.equal(trainer.gameStarted, true);
  assert.equal(trainer.currentChord.degree, 'I');
  trainer.setActiveChord('IIm');
  trainer = mounted.render();
  assert.deepEqual(
    { ...trainer.session },
    { answered: 1, correct: 0, streak: 0 }
  );
  trainer.setActiveChord('IIm'); // Disabled repeated miss is inert.
  trainer.setActiveChord('IM');
  trainer = mounted.render();
  assert.equal(trainer.isAdvance, 'Ready');
  assert.deepEqual(
    { ...trainer.session },
    { answered: 1, correct: 0, streak: 0 }
  );
  assert.deepEqual(mounted.records, [{ target: 'IM', correct: false }]);
  trainer.setActiveChord('IIm'); // Comparison after solving is unscored.
  mounted.render();
  assert.equal(mounted.records.length, 1);
});

test('correct first answer increases streak once and next resets question state', async () => {
  const mounted = mountTrainer();
  let trainer = mounted.render();
  await trainer.startGame();
  trainer = mounted.render();
  trainer.setActiveChord('IM');
  trainer = mounted.render();
  trainer.setActiveChord('IM');
  trainer = mounted.render();
  assert.deepEqual(
    { ...trainer.session },
    { answered: 1, correct: 1, streak: 1 }
  );
  await trainer.advanceGame();
  trainer = mounted.render();
  assert.equal(trainer.currentChord.degree, 'II');
  assert.equal(trainer.isAdvance, 'No');
  assert.equal(trainer.wasRevealed, false);
  trainer.setActiveChord('IIm');
  trainer = mounted.render();
  assert.deepEqual(
    { ...trainer.session },
    { answered: 2, correct: 2, streak: 2 }
  );
});

test('reveal records one miss, follow-up comparisons and playback do not rescore', async () => {
  const mounted = mountTrainer();
  let trainer = mounted.render();
  await trainer.startGame();
  trainer = mounted.render();
  trainer.revealAnswer();
  trainer = mounted.render();
  assert.equal(trainer.wasRevealed, true);
  assert.deepEqual(
    { ...trainer.session },
    { answered: 1, correct: 0, streak: 0 }
  );
  trainer.revealAnswer();
  trainer.setActiveChord('IM');
  await trainer.playBass();
  await trainer.playTonic();
  trainer = mounted.render();
  assert.equal(mounted.records.length, 1);
  assert.equal(trainer.session.answered, 1);
});

test('empty practice selection is silent and cannot score or start', async () => {
  const mounted = mountTrainer();
  mounted.settings.degreeChordTypes = [];
  const trainer = mounted.render();
  await trainer.startGame();
  trainer.setActiveChord('IM');
  trainer.revealAnswer();
  assert.equal(mounted.render().gameStarted, false);
  assert.equal(trainer.currentChord, null);
  assert.equal(mounted.records.length, 0);
  assert.equal(mounted.schedules.length, 0);
});

test('settings change resets answer state and hidden tabs cancel audio', async () => {
  const mounted = mountTrainer();
  let trainer = mounted.render();
  await trainer.startGame();
  trainer = mounted.render();
  trainer.revealAnswer();
  mounted.settings.rootNote = 'Eb3';
  trainer = mounted.render();
  assert.equal(trainer.currentChord.root, 'F'); // II in the new Eb key; avoids repeating I.
  assert.equal(trainer.isAdvance, 'No');
  assert.equal(trainer.wasRevealed, false);
  const before = mounted.cancellations();
  mounted.document.hidden = true;
  mounted.documentEvents.get('visibilitychange')();
  assert.equal(mounted.cancellations(), before + 1);
});

test('first-attempt records persist separately without changing legacy statistics', () => {
  let saved = null;
  const storage = {
    getItem: () => saved,
    setItem: (_key, value) => {
      saved = value;
    },
    removeItem: () => {
      saved = null;
    },
  };
  const source = readFileSync(
    new URL('../src/stores/chordColorTrainerSettingsStore.ts', import.meta.url),
    'utf8'
  );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const makeStore = () => {
    const exports = {};
    vm.runInNewContext(outputText, {
      exports,
      require: name => {
        if (name === 'zustand') return { create };
        if (name === 'zustand/middleware')
          return {
            persist: (config, options) =>
              persist(config, {
                ...options,
                storage: createJSONStorage(() => storage),
              }),
          };
        if (name === 'tone')
          return { Frequency: note => ({ toNote: () => note }) };
        if (name.endsWith('/Constants'))
          return { degrees: [], defaultDegreeChordTypes: [] };
        throw new Error(`Unexpected dependency ${name}`);
      },
    });
    return exports.default;
  };
  const store = makeStore();
  store.getState().setPracticeRecords({ IM: { total: 12, correct: 8 } });
  store.getState().updatePracticeRecords('IM', false);
  store.getState().updatePracticeRecords('IIm', true);
  const restored = makeStore().getState();
  assert.deepEqual(JSON.parse(JSON.stringify(restored.practiceRecords)), {
    IM: { total: 12, correct: 8 },
  });
  assert.deepEqual(JSON.parse(JSON.stringify(restored.firstAttemptRecords)), {
    IM: { total: 1, correct: 0 },
    IIm: { total: 1, correct: 1 },
  });
});

test('musically equivalent aliases cannot create ambiguous duplicate answers', () => {
  const mounted = mountTrainer();
  mounted.settings.degreeChordTypes = [
    { degree: 'I', chordTypes: ['o', 'dim', 'M'] },
  ];
  const trainer = mounted.render();
  assert.equal(trainer.filteredChords.length, 2);
  assert.equal(trainer.filteredChords[0].chordType, 'o');
});
