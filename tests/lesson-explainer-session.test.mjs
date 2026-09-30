import assert from 'node:assert/strict';
import test from 'node:test';
import {
  allNodes,
  button,
  deferred,
  finishSound,
  makeRuntime,
  plain,
  text,
  tick,
} from './helpers/practice-runtime.mjs';

const hasClass = (node, name) =>
  node.props?.className?.split(' ').includes(name);
const section = (page, className) =>
  allNodes(page).find(node => hasClass(node, className));
const exampleChoice = (page, label) =>
  button(section(page, 'lesson-example-choices'), label);
const frameButtons = page =>
  allNodes(page).filter(
    node =>
      node.type === 'button' &&
      node.props?.['aria-label']?.startsWith('Inspect this moment:')
  );
const soundingKeys = page =>
  allNodes(page).filter(
    node => hasClass(node, 'lesson-piano-key') && hasClass(node, 'is-sounding')
  );

function practiceLink(page) {
  const link = allNodes(page).find(
    node => node.type === 'a' && node.props.to?.startsWith('/practice/')
  );
  assert.ok(link, 'learning has a direct practice route');
  return link;
}

test('learning opens with pitch structures and explanations but no autoplay, including volume and practice navigation', () => {
  const env = makeRuntime();
  const render = env.explainer();
  let page = render();
  assert.match(text(page), /Hear it, see it|Root|Third|Fifth/);
  assert.ok(section(page, 'lesson-piano'));
  assert.ok(section(page, 'lesson-comparison'));
  assert.ok(frameButtons(page).length);
  assert.equal(soundingKeys(page).length, 0);
  assert.equal(env.schedules.length, 0);
  assert.equal(env.animationFrames.size, 0);
  const range = allNodes(page).find(node => node.type === 'input');
  assert.equal(range.props.value, 0.45);
  assert.ok(
    allNodes(page).some(
      node => node.type === 'label' && node.props.htmlFor === range.props.id
    )
  );
  range.props.onChange({ currentTarget: { value: '0.2' } });
  page = render();
  assert.equal(
    allNodes(page).find(node => node.type === 'input').props['aria-valuetext'],
    '20%'
  );
  assert.equal(env.volumes.at(-1), 0.2);
  assert.equal(env.schedules.length, 0);
  const link = practiceLink(page);
  assert.equal(link.props.to, '/practice/triads-core');
  link.props.onClick();
  assert.equal(
    env.schedules.length,
    0,
    'practice navigation never starts a sound'
  );
  assert.equal(env.saves.length, 0);
  const practice = makeRuntime().page()();
  assert.equal(section(practice, 'lesson-piano'), undefined);
  assert.equal(section(practice, 'lesson-comparison'), undefined);
  assert.equal(frameButtons(practice).length, 0);
  assert.doesNotMatch(
    text(practice),
    /Inside the sound|Root|Third|Fifth|Pitch structure|Hear it, see it/
  );
});

test('selecting a labeled example immediately schedules its real sound in the originating gesture', async () => {
  const env = makeRuntime();
  const waiting = deferred();
  env.setScheduler(() => waiting.promise);
  const render = env.explainer();
  let page = render();
  exampleChoice(page, 'Minor').props.onClick();
  assert.equal(
    env.schedules.length,
    1,
    'scheduler runs before the gesture returns'
  );
  const lesson = env.lessons.find(item => item.id === 'triads-core');
  const minor = env
    .examples(lesson.id)
    .find(item => item.choice.id === 'minor');
  assert.deepEqual(
    plain(env.schedules[0]),
    plain(env.buildLearningPlayback(lesson, [minor]).events)
  );
  assert.deepEqual(
    plain(env.schedules[0]).map(event => event.note),
    [48, 51, 55]
  );
  page = render();
  assert.match(text(section(page, 'lesson-sound-copy')), /Minor/);
  assert.equal(exampleChoice(page, 'Minor').props['aria-pressed'], true);
  assert.match(text(page), /Preparing sound/);
  assert.equal(env.animationFrames.size, 0);
  waiting.resolve();
  await tick();
  page = render();
  assert.match(text(page), /Playing/);
  assert.equal(env.animationFrames.size, 1);
  finishSound(env);
  render();
  assert.equal(env.animationFrames.size, 0);
});

test('rapid example changes keep only the latest selection and old loading resolution cannot replace it', async () => {
  const env = makeRuntime();
  const waiting = [];
  env.setScheduler(() => {
    const request = deferred();
    waiting.push(request);
    return request.promise;
  });
  const render = env.explainer();
  let page = render();
  const minor = exampleChoice(page, 'Minor');
  const major = exampleChoice(page, 'Major');
  minor.props.onClick();
  major.props.onClick();
  assert.equal(env.schedules.length, 2);
  assert.deepEqual(
    plain(env.schedules[0]).map(event => event.note),
    [48, 51, 55]
  );
  assert.deepEqual(
    plain(env.schedules[1]).map(event => event.note),
    [48, 52, 55]
  );
  page = render();
  assert.equal(exampleChoice(page, 'Major').props['aria-pressed'], true);
  waiting[1].resolve();
  await tick();
  page = render();
  assert.match(text(section(page, 'lesson-sound-copy')), /Major/);
  assert.equal(env.animationFrames.size, 1);
  const timers = env.timers.size;
  waiting[0].resolve();
  await tick();
  page = render();
  assert.equal(
    env.timers.size,
    timers,
    'older load cannot install another completion timer'
  );
  assert.match(text(section(page, 'lesson-sound-copy')), /Major/);
  button(page, 'Stop sound').props.onClick();
  page = render();
  assert.equal(env.animationFrames.size, 0);
  assert.equal(env.timers.size, 0);
  assert.equal(env.schedules.length, 2);
  assert.equal(soundingKeys(page).length, 0);
});

test('Stop, Back, practice/next links, visibility, route changes, and unmount cancel loading without late audio or animation', async t => {
  for (const leave of [
    'stop',
    'back',
    'practice',
    'next',
    'hidden',
    'route',
    'unmount',
  ]) {
    await t.test(leave, async () => {
      const env = makeRuntime();
      const waiting = deferred();
      env.setScheduler(() => waiting.promise);
      const render = env.explainer();
      let page = render();
      exampleChoice(page, 'Minor').props.onClick();
      page = render();
      const before = env.cancellations();
      if (leave === 'stop') button(page, 'Stop sound').props.onClick();
      if (leave === 'back')
        allNodes(page)
          .find(node => hasClass(node, 'music-back'))
          .props.onClick();
      if (leave === 'practice') practiceLink(page).props.onClick();
      if (leave === 'next')
        allNodes(page)
          .find(node => hasClass(node, 'lesson-next-topic'))
          .props.onClick();
      if (leave === 'hidden') {
        env.document.hidden = true;
        env.documentEvents.get('visibilitychange')();
      }
      if (leave === 'route') {
        env.location.key = 'another-route';
        render();
      }
      if (leave === 'unmount') env.unmount();
      waiting.resolve();
      await tick();
      finishSound(env);
      if (leave !== 'unmount') page = render();
      assert.ok(env.cancellations() > before);
      assert.equal(
        env.schedules.length,
        1,
        'late completion never starts a new sound'
      );
      assert.equal(env.timers.size, 0);
      assert.equal(env.animationFrames.size, 0);
      assert.equal(soundingKeys(page).length, 0);
      assert.equal(env.saves.length, 0);
    });
  }
});

test('audio Transport time drives actual active pitches only after audio is ready; stopping clears animation', async () => {
  const env = makeRuntime();
  const waiting = deferred();
  env.setScheduler(() => waiting.promise);
  const render = env.explainer();
  let page = render();
  button(page, 'Play the example').props.onClick();
  page = render();
  env.advanceFrame(0.1);
  page = render();
  assert.equal(soundingKeys(page).length, 0, 'loading is not sounding');
  waiting.resolve();
  await tick();
  page = render();
  assert.equal(env.animationFrames.size, 1);
  env.advanceFrame(0.1);
  page = render();
  assert.equal(soundingKeys(page).length, 3);
  assert.equal(
    frameButtons(page).filter(node => hasClass(node, 'is-sounding')).length,
    1
  );
  env.advanceFrame(2);
  page = render();
  assert.equal(
    soundingKeys(page).length,
    0,
    'silence gaps do not leave highlighted notes'
  );
  env.setScheduler(async () => {});
  button(page, 'Hear the detail separately').props.onClick();
  await tick();
  page = render();
  const detail = env.schedules.at(-1);
  env.advanceFrame(detail[1].time + 0.05);
  page = render();
  assert.equal(
    soundingKeys(page).length,
    1,
    'arpeggio highlights only the member that sounds'
  );
  assert.equal(
    allNodes(page).filter(
      node => hasClass(node, 'lesson-piano-key') && hasClass(node, 'is-example')
    ).length,
    3,
    'whole chord structure remains outlined'
  );
  button(page, 'Stop sound').props.onClick();
  page = render();
  assert.equal(soundingKeys(page).length, 0);
  assert.equal(env.animationFrames.size, 0);
});

test('Inspect this moment is a silent structure action that also stops current playback', async () => {
  const env = makeRuntime();
  const render = env.explainer('triads-arpeggiated');
  let page = render();
  const frames = frameButtons(page);
  assert.ok(frames.length >= 3);
  frames.at(-1).props.onClick();
  page = render();
  assert.equal(env.schedules.length, 0);
  assert.equal(frameButtons(page).at(-1).props['aria-pressed'], true);
  assert.equal(soundingKeys(page).length, 0);
  button(page, 'Play the example').props.onClick();
  await tick();
  page = render();
  env.advanceFrame(0.1);
  page = render();
  assert.ok(soundingKeys(page).length > 0);
  const before = env.schedules.length;
  frameButtons(page).at(-1).props.onClick();
  page = render();
  assert.equal(env.schedules.length, before);
  assert.equal(env.animationFrames.size, 0);
  assert.equal(env.timers.size, 0);
  assert.equal(soundingKeys(page).length, 0);
  assert.equal(frameButtons(page).at(-1).props['aria-pressed'], true);
});

test('A/B controls preserve one key, selected-first ordering, and example state without autoplay on selector changes', async t => {
  for (const lessonId of [
    'triads-core',
    'degrees-core',
    'inversions-core',
    'sevenths-core',
    'progressions-minor',
  ]) {
    await t.test(lessonId, async () => {
      const env = makeRuntime();
      const render = env.explainer(lessonId);
      let page = render();
      const lesson = env.lessons.find(item => item.id === lessonId);
      const examples = env.examples(lessonId);
      const selector = allNodes(page).find(node => node.type === 'select');
      selector.props.onChange({
        currentTarget: { value: examples.at(-1).choice.id },
      });
      page = render();
      assert.equal(env.schedules.length, 0);
      const compared = examples.at(-1);
      assert.equal(examples[0].tonic, compared.tonic);
      button(page, 'Play both').props.onClick();
      assert.equal(
        env.schedules.length,
        1,
        'A/B starts in its explicit gesture'
      );
      const both = plain(env.schedules[0]);
      assert.deepEqual(
        both,
        plain(env.buildLearningPlayback(lesson, [examples[0], compared]).events)
      );
      const referenceCount = examples[0].referenceEvents.length;
      assert.deepEqual(
        both.slice(0, referenceCount),
        plain(examples[0].referenceEvents)
      );
      const first = both.slice(
        referenceCount,
        referenceCount + examples[0].events.length
      );
      const second = both.slice(referenceCount + examples[0].events.length);
      assert.deepEqual(
        first.map(event => event.note),
        plain(examples[0].events).map(event => event.note)
      );
      assert.deepEqual(
        second.map(event => event.note),
        plain(compared.events).map(event => event.note)
      );
      const firstEnd = Math.max(
        ...first.map(event => event.time + event.duration)
      );
      assert.ok(second[0].time >= firstEnd + 0.8);
      await tick();
      page = render();
      assert.equal(
        exampleChoice(page, examples[0].choice.label.en).props['aria-pressed'],
        true
      );
      finishSound(env);
      render();
      assert.equal(env.animationFrames.size, 0);
      assert.equal(env.saves.length, 0);
    });
  }
});

test('every catalog lesson renders real structures and can play its selected example, detail, and A/B', async t => {
  for (const lesson of makeRuntime().lessons) {
    await t.test(lesson.id, async () => {
      const env = makeRuntime();
      const render = env.explainer(lesson.id);
      let page = render();
      assert.equal(env.schedules.length, 0);
      assert.ok(
        section(
          page,
          lesson.mode === 'guitar' ? 'guitar-diagram' : 'lesson-piano'
        )
      );
      assert.ok(frameButtons(page).length);
      assert.doesNotMatch(text(page), /undefined|NaN|Infinity/);
      assert.equal(practiceLink(page).props.to, `/practice/${lesson.id}`);
      assert.equal(
        allNodes(section(page, 'lesson-example-choices')).filter(
          node => node.type === 'button'
        ).length,
        lesson.choices.length
      );
      button(page, 'Play the example').props.onClick();
      await tick();
      page = render();
      env.advanceFrame(0.1);
      page = render();
      assert.ok(
        lesson.mode === 'guitar'
          ? allNodes(section(page, 'guitar-diagram')).some(node =>
              hasClass(node, 'is-sounding')
            )
          : soundingKeys(page).length,
        `${lesson.id} has real sounding pitches`
      );
      finishSound(env);
      page = render();
      button(page, 'Hear the detail separately').props.onClick();
      await tick();
      render();
      finishSound(env);
      page = render();
      button(page, 'Play both').props.onClick();
      await tick();
      render();
      finishSound(env);
      page = render();
      assert.equal(env.schedules.length, 3);
      assert.equal(env.animationFrames.size, 0);
      assert.doesNotMatch(text(page), /NaN|undefined|Infinity/);
      assert.equal(env.saves.length, 0);
      env.unmount();
    });
  }
});

test('learning remains interactive with blocked storage and has Chinese copy plus useful invalid routes', async () => {
  const env = makeRuntime({ storageUnavailable: true });
  const render = env.explainer();
  let page = render();
  exampleChoice(page, 'Minor').props.onClick();
  await tick();
  render();
  finishSound(env);
  page = render();
  assert.match(text(section(page, 'lesson-sound-copy')), /Minor/);
  assert.equal(env.saves.length, 0);
  const chinese = makeRuntime();
  chinese.setLanguage('zh-CN');
  const translated = chinese.explainer()();
  button(translated, '播放示例');
  assert.match(text(translated), /听见，也看见|低音/);
  const invalid = makeRuntime().explainer('missing')();
  assert.match(text(invalid), /This lesson isn’t here yet/);
  assert.equal(
    allNodes(invalid).find(node => node.type === 'a').props.to,
    '/learn'
  );
});
