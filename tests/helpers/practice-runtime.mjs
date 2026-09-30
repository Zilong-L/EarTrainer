import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

const require = createRequire(import.meta.url);
export const tick = async () => {
  for (let index = 0; index < 8; index++) await Promise.resolve();
};
export const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};
const sameDependencies = (a, b) =>
  a?.length === b?.length && a.every((value, i) => Object.is(value, b[i]));

export function makeRuntime({
  storageUnavailable = false,
  leakSentinels = false,
  tonicIndex = 0,
} = {}) {
  let cursor = 0;
  let dirty = false;
  let effects = [];
  let timerId = 0;
  let cancelled = 0;
  let schedule = async () => {};
  let language = 'en';
  const slots = [];
  const timers = new Map();
  const animationFrames = new Map();
  const transport = { seconds: 0 };
  const schedules = [];
  const saves = [];
  const generatedQuestions = [];
  const volumes = [];
  const storageItems = new Map();
  const storageWrites = [];
  const window = {
    get localStorage() {
      if (storageUnavailable) throw new Error('Browser storage is blocked');
      return {
        getItem: key => storageItems.get(key) ?? null,
        setItem: (key, value) => {
          storageWrites.push({ key, value });
          storageItems.set(key, value);
        },
      };
    },
  };
  const documentEvents = new Map();
  const context = { state: 'running' };
  const location = { key: 'first-location' };
  const document = {
    hidden: false,
    addEventListener: (name, callback) => documentEvents.set(name, callback),
    removeEventListener: name => documentEvents.delete(name),
  };
  const react = {
    useState(initial) {
      const i = cursor++;
      if (!slots[i])
        slots[i] = {
          value: typeof initial === 'function' ? initial() : initial,
        };
      return [
        slots[i].value,
        next => {
          const value =
            typeof next === 'function' ? next(slots[i].value) : next;
          if (!Object.is(value, slots[i].value)) {
            slots[i].value = value;
            dirty = true;
          }
        },
      ];
    },
    useRef(initial) {
      const i = cursor++;
      if (!slots[i]) slots[i] = { value: { current: initial } };
      return slots[i].value;
    },
    useMemo(factory, dependencies) {
      const i = cursor++;
      if (!slots[i] || !sameDependencies(slots[i].dependencies, dependencies)) {
        slots[i] = { value: factory(), dependencies };
      }
      return slots[i].value;
    },
    useEffect(callback, dependencies) {
      const i = cursor++;
      if (!slots[i] || !sameDependencies(slots[i].dependencies, dependencies)) {
        const previous = slots[i]?.cleanup;
        slots[i] = { dependencies };
        effects.push(() => {
          previous?.();
          slots[i].cleanup = callback();
        });
      }
    },
  };
  react.useCallback = (callback, dependencies) =>
    react.useMemo(() => callback, dependencies);
  const dependencies = {
    react,
    tone: { getContext: () => context, Transport: transport },
    '@utils/Tone/samplers': {
      getSamplerInstance: () => ({ setVolume: value => volumes.push(value) }),
    },
    '@utils/Tone/playbacks': {
      cancelAllSounds: () => cancelled++,
      scheduleNotes: events => {
        transport.seconds = 0;
        schedules.push(events);
        return schedule(events);
      },
    },
    'react-i18next': { useTranslation: () => ({ i18n: { language } }) },
    'react-router-dom': {
      Link: 'a',
      useParams: () => ({}),
      useLocation: () => location,
    },
    '@stores/soundSettingsStore': {
      useSoundSettingsStore: selector =>
        selector({ instrumentLoadError: null }),
    },
    './progress': {
      saveSession: input => {
        saves.push(JSON.parse(JSON.stringify(input)));
        return { saved: true };
      },
    },
  };
  const load = path => {
    const source = readFileSync(
      new URL(`../../${path}`, import.meta.url),
      'utf8'
    );
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    });
    const exports = {};
    vm.runInNewContext(
      outputText,
      {
        exports,
        require: name => dependencies[name] ?? require(name),
        document,
        window,
        setTimeout: (callback, delay) => {
          const id = ++timerId;
          timers.set(id, { callback, delay });
          return id;
        },
        clearTimeout: id => timers.delete(id),
        requestAnimationFrame: callback => {
          const id = ++timerId;
          animationFrames.set(id, callback);
          return id;
        },
        cancelAnimationFrame: id => animationFrames.delete(id),
      },
      { filename: path }
    );
    return exports;
  };
  const audioModule = load('src/features/practice/usePracticeAudio.ts');
  dependencies['./usePracticeAudio'] = audioModule;
  const model = load('src/features/practice/model.ts');
  dependencies['./model'] = {
    ...model,
    generateQuestion: id => {
      let draw = 0;
      const question = {
        ...model.generateQuestion(id, () =>
          draw++ === 1 ? tonicIndex / 12 : 0
        ),
        id: `test-question-${generatedQuestions.length + 1}`,
      };
      if (leakSentinels) {
        question.explanation = {
          en: 'ANSWER_EXPLANATION_SENTINEL',
          zh: 'ANSWER_EXPLANATION_SENTINEL',
        };
        question.hint = {
          en: 'ANSWER_HINT_SENTINEL',
          zh: 'ANSWER_HINT_SENTINEL',
        };
      }
      generatedQuestions.push(question);
      return question;
    },
    generateSessionQuestions: id => model.generateSessionQuestions(id, () => 0),
  };
  dependencies['./listeningPreferences'] = load(
    'src/features/practice/listeningPreferences.ts'
  );
  dependencies['../practice/model'] = dependencies['./model'];
  dependencies['../practice/usePracticeAudio'] = audioModule;
  dependencies['../practice/listeningPreferences'] =
    dependencies['./listeningPreferences'];
  dependencies['./lessonVisuals'] = load(
    'src/features/training/lessonVisuals.ts'
  );
  dependencies['./lessonExplainer.css'] = {};
  const expand = node => {
    if (!node || typeof node !== 'object') return node;
    if (Array.isArray(node)) return node.map(expand);
    if (typeof node.type === 'function') return expand(node.type(node.props));
    return {
      ...node,
      props: { ...node.props, children: expand(node.props?.children) },
    };
  };
  const render = component => {
    let output;
    for (let attempt = 0; attempt < 20; attempt++) {
      cursor = 0;
      dirty = false;
      effects = [];
      output = expand(component());
      effects.forEach(effect => effect());
      if (!dirty) return output;
    }
    throw new Error('Render did not settle');
  };
  return {
    audio: key => render(() => audioModule.usePracticeAudio(key)),
    page(lessonId = 'triads-core') {
      const component = load(
        'src/features/practice/GuidedPractice.tsx'
      ).default;
      return () =>
        render(() => {
          const root = component({ lessonId });
          return typeof root.type === 'function' ? root.type(root.props) : root;
        });
    },
    explainer(lessonId = 'triads-core') {
      const component = load(
        'src/features/training/LessonExplainer.tsx'
      ).default;
      return () => render(() => component({ lessonId }));
    },
    examples: lessonId => model.generateLessonExamples(lessonId),
    buildLearningPlayback: (...args) =>
      dependencies['./lessonVisuals'].buildLearningPlayback(...args),
    setScheduler: callback => {
      schedule = callback;
    },
    setLanguage: value => {
      language = value;
    },
    timers,
    animationFrames,
    transport,
    advanceFrame(seconds) {
      transport.seconds = seconds;
      for (const [id, callback] of [...animationFrames]) {
        animationFrames.delete(id);
        callback();
      }
    },
    schedules,
    saves,
    generatedQuestions,
    lessons: model.LESSONS,
    volumes,
    storageItems,
    storageWrites,
    document,
    documentEvents,
    context,
    location,
    cancellations: () => cancelled,
    unmount: () => slots.forEach(slot => slot?.cleanup?.()),
  };
}

export const text = node => {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(text).join('');
  return text(node.props?.children);
};
export function allNodes(root) {
  if (!root || typeof root !== 'object') return [];
  if (Array.isArray(root)) return root.flatMap(allNodes);
  return [root, ...allNodes(root.props?.children)];
}
export function button(root, label) {
  const found = allNodes(root).find(
    node =>
      node.type === 'button' &&
      (text(node).trim() === label || node.props['aria-label'] === label)
  );
  assert.ok(found, `Missing button: ${label}`);
  return found;
}
export const plain = value => JSON.parse(JSON.stringify(value));
export function choice(root, label) {
  const found = allNodes(root).find(
    node =>
      node.type === 'button' &&
      node.props?.className?.split(' ').includes('music-choice') &&
      text(node).trim() === label
  );
  assert.ok(found, `Missing answer choice: ${label}`);
  return found;
}
export const response = root =>
  allNodes(root).find(node => node.props?.className === 'music-response');
export const answerFieldset = root =>
  allNodes(root).find(node => node.type === 'fieldset');
export const notes = [{ note: 60, time: 0, duration: 1 }];
export const finishSound = env => {
  for (const [id, timer] of [...env.timers]) {
    if (timer.delay === 25000) continue;
    env.timers.delete(id);
    timer.callback();
  }
};
