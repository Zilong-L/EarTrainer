import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const tick = async () => {
  for (let index = 0; index < 8; index++) await Promise.resolve();
};
const deferred = () => {
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

function makeRuntime() {
  let cursor = 0;
  let dirty = false;
  let effects = [];
  let timerId = 0;
  let cancelled = 0;
  let schedule = async () => {};
  let language = 'en';
  const slots = [];
  const timers = new Map();
  const schedules = [];
  const saves = [];
  const volumes = [];
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
    tone: { getContext: () => context },
    '@utils/Tone/samplers': {
      getSamplerInstance: () => ({ setVolume: value => volumes.push(value) }),
    },
    '@utils/Tone/playbacks': {
      cancelAllSounds: () => cancelled++,
      scheduleNotes: events => {
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
    const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
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
        setTimeout: (callback, delay) => {
          const id = ++timerId;
          timers.set(id, { callback, delay });
          return id;
        },
        clearTimeout: id => timers.delete(id),
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
    generateSessionQuestions: id => model.generateSessionQuestions(id, () => 0),
  };
  const render = component => {
    let output;
    for (let attempt = 0; attempt < 20; attempt++) {
      cursor = 0;
      dirty = false;
      effects = [];
      output = component();
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
    setScheduler: callback => {
      schedule = callback;
    },
    setLanguage: value => {
      language = value;
    },
    timers,
    schedules,
    saves,
    volumes,
    document,
    documentEvents,
    context,
    location,
    cancellations: () => cancelled,
    unmount: () => slots.forEach(slot => slot?.cleanup?.()),
  };
}

const text = node => {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(text).join('');
  return text(node.props?.children);
};
function allNodes(root) {
  if (!root || typeof root !== 'object') return [];
  if (Array.isArray(root)) return root.flatMap(allNodes);
  return [root, ...allNodes(root.props?.children)];
}
function button(root, label) {
  const found = allNodes(root).find(
    node => node.type === 'button' && text(node).trim() === label
  );
  assert.ok(found, `Missing button: ${label}`);
  return found;
}
const answerFieldset = root =>
  allNodes(root).find(node => node.type === 'fieldset');
const notes = [{ note: 60, time: 0, duration: 1 }];
const finishSound = env => {
  for (const [id, timer] of [...env.timers]) {
    if (timer.delay === 25000) continue;
    env.timers.delete(id);
    timer.callback();
  }
};

test('practice audio never autoplays; explicit play reports loading, playing, then idle', async () => {
  const env = makeRuntime();
  const wait = deferred();
  env.setScheduler(() => wait.promise);
  let audio = env.audio('question-1');
  assert.equal(env.schedules.length, 0);
  const playing = audio.play(notes);
  assert.equal(
    env.schedules.length,
    1,
    'scheduler invoked in the originating gesture'
  );
  audio = env.audio('question-1');
  assert.equal(audio.status, 'loading');
  wait.resolve();
  assert.equal(await playing, true);
  audio = env.audio('question-1');
  assert.equal(audio.status, 'playing');
  assert.equal(
    [...env.timers.values()].some(timer => timer.delay === 25000),
    false
  );
  [...env.timers.values()][0].callback();
  assert.equal(env.audio('question-1').status, 'idle');
});

test('rapid playback, stop, hidden tabs, and unmount invalidate pending asynchronous plays', async () => {
  const env = makeRuntime();
  const waiting = [];
  env.setScheduler(() => {
    const wait = deferred();
    waiting.push(wait);
    return wait.promise;
  });
  let audio = env.audio('question-1');
  const old = audio.play(notes);
  const latest = audio.play([{ note: 62, time: 0, duration: 1 }]);
  assert.equal(await old, false);
  waiting[1].resolve();
  assert.equal(await latest, true);
  waiting[0].resolve();
  await tick();
  assert.equal(env.audio('question-1').status, 'playing');
  audio = env.audio('question-1');
  const stopped = audio.play(notes);
  audio.stop();
  assert.equal(await stopped, false);
  assert.equal(env.audio('question-1').status, 'idle');
  const hidden = audio.play(notes);
  env.document.hidden = true;
  env.documentEvents.get('visibilitychange')();
  assert.equal(await hidden, false);
  assert.equal(env.audio('question-1').status, 'paused');
  env.document.hidden = false;
  const unmounted = env.audio('question-1').play(notes);
  env.unmount();
  assert.equal(await unmounted, false);
  assert.equal(env.timers.size, 0);
  assert.equal(env.documentEvents.size, 0);
});

test('question/navigation changes cancel pending plays; errors and timeouts can retry', async () => {
  const env = makeRuntime();
  const wait = deferred();
  env.setScheduler(() => wait.promise);
  const pending = env.audio('question-1').play(notes);
  env.audio('question-2');
  assert.equal(await pending, false);
  assert.equal(env.audio('question-2').status, 'idle');
  const timed = env.audio('question-2').play(notes);
  [...env.timers.values()].find(timer => timer.delay === 25000).callback();
  assert.equal(await timed, false);
  assert.equal(env.audio('question-2').status, 'error');
  env.setScheduler(async () => {
    throw new Error('Audio blocked');
  });
  assert.equal(await env.audio('question-2').play(notes), false);
  assert.equal(env.audio('question-2').status, 'error');
  env.setScheduler(async () => {});
  assert.equal(await env.audio('question-2').play(notes), true);
  assert.equal(env.audio('question-2').status, 'playing');
});

test('suspended browser context and invalid notes cannot enable a successful playback', async () => {
  const env = makeRuntime();
  env.context.state = 'suspended';
  assert.equal(await env.audio('question').play(notes), false);
  assert.equal(env.audio('question').status, 'error');
  env.context.state = 'running';
  assert.equal(await env.audio('question').play([]), false);
  assert.equal(env.schedules.length, 1);
});

test('guided UI hides the answer until one decision, and locks a wrong first answer against rapid retries', async () => {
  const env = makeRuntime();
  const render = env.page();
  let page = render();
  assert.equal(env.schedules.length, 0);
  assert.match(text(page), /Before you begin/);
  button(page, 'Start listening →').props.onClick();
  page = render();
  assert.equal(answerFieldset(page).props.disabled, true);
  assert.equal(text(page).includes('The answer is'), false);
  assert.equal(
    allNodes(page).some(node => node.props?.className?.includes('is-correct')),
    false
  );
  const premature = button(page, 'Minor');
  premature.props.onClick();
  assert.equal(text(render()).includes('The answer is'), false);
  await tick();
  page = render();
  assert.equal(
    answerFieldset(page).props.disabled,
    true,
    'scheduled is not yet heard'
  );
  finishSound(env);
  page = render();
  assert.equal(answerFieldset(page).props.disabled, false);
  const wrong = button(page, 'Minor');
  const right = button(page, 'Major');
  wrong.props.onClick();
  right.props.onClick();
  page = render();
  assert.match(text(page), /Listen for the difference/);
  assert.match(text(page), /You chose Minor/);
  assert.equal(answerFieldset(page).props.disabled, true);
  assert.equal(env.saves.length, 0);
  const count = env.schedules.length;
  button(page, 'Next question →').props.onClick();
  button(page, 'Next question →').props.onClick();
  page = render();
  assert.match(text(page), /Question 2 of 8/);
  assert.equal(answerFieldset(page).props.disabled, true);
  assert.equal(
    env.schedules.length,
    count,
    'next must not automatically start audio'
  );
});

test('tonal questions and labeled examples establish reference before target, while reference alone is unscored', async () => {
  const env = makeRuntime();
  const render = env.page('degrees-core');
  let page = render();
  button(page, '▶ 1 · Do').props.onClick();
  await tick();
  const demo = env.schedules[0];
  assert.ok(demo.length > 1, 'a degree demonstration needs tonal context');
  const referenceEnd = Math.max(
    ...demo.slice(0, -1).map(event => event.time + event.duration)
  );
  assert.ok(demo.at(-1).time >= referenceEnd + 0.5);
  page = render();
  button(page, 'Start listening →').props.onClick();
  await tick();
  finishSound(env);
  page = render();
  button(page, 'Reveal answer').props.onClick();
  page = render();
  button(page, 'Next question →').props.onClick();
  page = render();
  button(page, 'Hear reference').props.onClick();
  await tick();
  page = render();
  assert.equal(
    answerFieldset(page).props.disabled,
    true,
    'reference alone does not unlock answers'
  );
});

test('completion persists exactly eight locked results, separates assisted/revealed/skipped, and retry is clean', async () => {
  const env = makeRuntime();
  const render = env.page();
  let page = render();
  button(page, 'Start listening →').props.onClick();
  await tick();
  finishSound(env);
  page = render();
  button(page, 'Listen with a hint').props.onClick();
  await tick();
  page = render();
  button(page, 'Major').props.onClick();
  page = render();
  assert.match(text(page), /You found it with a hint/);
  button(page, 'Next question →').props.onClick();
  page = render();
  button(page, 'Reveal answer').props.onClick();
  page = render();
  button(page, 'Next question →').props.onClick();
  page = render();
  button(page, 'Skip question').props.onClick();
  for (let index = 2; index < 8; index++) {
    page = render();
    if (index === 7) {
      const finish = button(page, 'See session summary →');
      finish.props.onClick();
      finish.props.onClick();
      break;
    }
    button(page, 'Next question →').props.onClick();
    page = render();
    button(page, 'Skip question').props.onClick();
  }
  page = render();
  assert.match(text(page), /Session complete/);
  assert.match(text(page), /0\/8Correct first try/);
  assert.equal(env.saves.length, 1);
  const results = env.saves[0].results;
  assert.equal(results.length, 8);
  assert.equal(new Set(results.map(result => result.questionId)).size, 8);
  assert.equal(results[0].firstAttemptCorrect, true);
  assert.equal(results[0].usedHint, true);
  assert.equal(results[1].revealed, true);
  assert.equal(results[1].firstAttemptCorrect, null);
  assert.equal(results[2].skipped, true);
  assert.equal(results[2].firstAttemptCorrect, null);
  assert.equal(results.filter(result => result.skipped).length, 6);
  button(page, 'Practice again').props.onClick();
  page = render();
  assert.match(text(page), /Before you begin/);
  assert.equal(env.saves.length, 1);
});

test('guided copy changes to Chinese and invalid lessons show a useful way home', () => {
  const env = makeRuntime();
  env.setLanguage('zh-CN');
  const render = env.page();
  assert.match(text(render()), /开始之前/);
  const other = makeRuntime();
  const invalid = other.page('unknown')();
  assert.match(text(invalid), /This lesson isn’t available/);
  assert.equal(
    allNodes(invalid).find(node => node.type === 'a').props.to,
    '/practice'
  );
});

test('volume is a normalized accessible local control and never starts audio', () => {
  const env = makeRuntime();
  const render = env.page();
  let page = render();
  const range = allNodes(page).find(
    node => node.type === 'input' && node.props.type === 'range'
  );
  assert.ok(range);
  assert.equal(range.props.value, 0.45);
  assert.equal(range.props.min, '0');
  assert.equal(range.props.max, '1');
  assert.ok(
    allNodes(page).some(
      node => node.type === 'label' && node.props.htmlFor === range.props.id
    )
  );
  range.props.onChange({ currentTarget: { value: '0.25' } });
  page = render();
  assert.equal(
    allNodes(page).find(node => node.type === 'input').props['aria-valuetext'],
    '25%'
  );
  assert.equal(env.volumes.at(-1), 0.25);
  assert.equal(env.schedules.length, 0);
});

test('stopping a pending hint cannot restore an unaided first answer', async () => {
  const env = makeRuntime();
  const render = env.page();
  let page = render();
  button(page, 'Start listening →').props.onClick();
  await tick();
  finishSound(env);
  page = render();
  const wait = deferred();
  env.setScheduler(() => wait.promise);
  button(page, 'Listen with a hint').props.onClick();
  page = render();
  assert.equal(answerFieldset(page).props.disabled, true);
  button(page, 'Stop sound').props.onClick();
  page = render();
  button(page, 'Major').props.onClick();
  page = render();
  assert.match(text(page), /You found it with a hint/);
  wait.resolve();
  await tick();
  assert.match(text(render()), /You found it with a hint/);
});

test('a completed miss gives a specific comparison and can replay its original correct sound without rescoring', async () => {
  const env = makeRuntime();
  const render = env.page();
  let page = render();
  button(page, 'Start listening →').props.onClick();
  await tick();
  finishSound(env);
  const original = JSON.parse(JSON.stringify(env.schedules[0]));
  page = render();
  button(page, 'Minor').props.onClick();
  for (let index = 0; index < 8; index++) {
    page = render();
    if (index === 7) {
      button(page, 'See session summary →').props.onClick();
      break;
    }
    button(page, 'Next question →').props.onClick();
    page = render();
    button(page, 'Skip question').props.onClick();
  }
  page = render();
  assert.match(
    text(page),
    /You chose Minor when the sound was Major \(1 time\)/
  );
  assert.match(text(page), /third and fifth above the root/);
  button(page, 'Replay the correct sound: Major').props.onClick();
  await tick();
  assert.deepEqual(JSON.parse(JSON.stringify(env.schedules.at(-1))), original);
  assert.equal(env.saves.length, 1);
});

test('stopping during tonal context cannot unlock a first answer before the target is heard', async () => {
  const env = makeRuntime();
  const render = env.page('degrees-core');
  let page = render();
  button(page, 'Start listening →').props.onClick();
  await tick();
  page = render();
  assert.equal(answerFieldset(page).props.disabled, true);
  button(page, 'Stop sound').props.onClick();
  page = render();
  assert.equal(answerFieldset(page).props.disabled, true);
  button(page, '1 · Do').props.onClick();
  assert.equal(text(render()).includes('The answer is'), false);
  button(page, '▶Listen to the question').props.onClick();
  await tick();
  page = render();
  assert.equal(answerFieldset(page).props.disabled, true);
  finishSound(env);
  page = render();
  assert.equal(answerFieldset(page).props.disabled, false);
  button(page, '1 · Do').props.onClick();
  assert.match(text(render()), /You heard it/);
});
