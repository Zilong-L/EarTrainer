import assert from 'node:assert/strict';
import test from 'node:test';
import {
  makeRuntime,
  tick,
  deferred,
  text,
  allNodes,
  button,
  plain,
  choice,
  response,
  answerFieldset,
  notes,
  finishSound,
} from './helpers/practice-runtime.mjs';

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

test('cancelled playback completion cannot unlock an answer or revive a stopped sound', async () => {
  for (const leave of ['stop', 'route', 'hidden', 'unmount']) {
    const env = makeRuntime();
    let completed = 0;
    const audio = env.audio('original-question');
    assert.equal(await audio.play(notes, 'target', () => completed++), true);
    const staleCompletion = [...env.timers.values()].find(
      timer => timer.delay !== 25000
    );
    assert.ok(staleCompletion);
    if (leave === 'stop') audio.stop();
    if (leave === 'route') env.audio('another-question');
    if (leave === 'hidden') {
      env.document.hidden = true;
      env.documentEvents.get('visibilitychange')();
    }
    if (leave === 'unmount') env.unmount();
    // A queued browser timer may already have left the timer queue.
    staleCompletion.callback();
    await tick();
    assert.equal(completed, 0, `${leave} invalidates even a queued completion`);
    assert.equal(env.timers.size, 0);
    assert.equal(
      env.schedules.length,
      1,
      'cancellation must never start audio'
    );
  }
});

test('continuous room begins on the sound with no intro, score ceremony, or autoplay', () => {
  const env = makeRuntime();
  const page = env.page()();
  assert.equal(env.schedules.length, 0);
  assert.equal(answerFieldset(page).props.disabled, true);
  button(page, 'Play');
  button(page, 'Hear the answer');
  button(page, 'Another sound →');
  assert.doesNotMatch(
    text(page),
    /Before you begin|of 8|Session complete|Correct first try|score/i
  );
  assert.equal(
    allNodes(page).some(node => node.type === 'progress'),
    false
  );
  assert.equal(
    allNodes(page).some(
      node => node.props?.className === 'music-example-panel'
    ),
    false
  );
  assert.equal(
    allNodes(page).some(node => node.type === 'details'),
    false
  );
  assert.doesNotMatch(
    text(page),
    /Explore the sounds|What to listen for|Hear the key|Hear the detail/
  );
  assert.equal(env.saves.length, 0);
});

test('no target answer leaks before one decision, and duplicate choices retain the original choice', async () => {
  const env = makeRuntime({ leakSentinels: true });
  const render = env.page();
  let page = render();
  const assertNoAnswer = root => {
    assert.doesNotMatch(
      text(root),
      /ANSWER_(EXPLANATION|HINT)_SENTINEL|Listen for Major|Yes · Major|You heard Minor/
    );
    assert.equal(
      allNodes(root).some(node =>
        /is-correct|is-selected/.test(node.props?.className ?? '')
      ),
      false
    );
    assert.equal(
      allNodes(root).some(node => node.props?.className === 'music-response'),
      false
    );
    for (const node of allNodes(root)) {
      for (const name of ['aria-label', 'aria-description', 'title', 'alt'])
        assert.doesNotMatch(
          String(node.props?.[name] ?? ''),
          /SENTINEL|answer.*major|correct.*major/i
        );
    }
  };
  assertNoAnswer(page);
  choice(page, 'Minor').props.onClick();
  assertNoAnswer(render());
  button(page, 'Play').props.onClick();
  await tick();
  page = render();
  assert.equal(
    answerFieldset(page).props.disabled,
    true,
    'scheduled does not mean target heard'
  );
  choice(page, 'Minor').props.onClick();
  assertNoAnswer(render());
  finishSound(env);
  page = render();
  assert.equal(answerFieldset(page).props.disabled, false);
  assertNoAnswer(page);
  const wrong = choice(page, 'Minor');
  const right = choice(page, 'Major');
  wrong.props.onClick();
  right.props.onClick();
  page = render();
  assert.match(text(page), /Listen for Major/);
  assert.match(text(page), /You heard Minor/);
  assert.doesNotMatch(text(page), /Yes · Major/);
  assert.equal(answerFieldset(page).props.disabled, true);
  assert.equal(env.saves.length, 0);
});

test('Continue generates and explicitly plays one next sound even under duplicate taps, past eight decisions', async () => {
  const env = makeRuntime();
  const render = env.page();
  let page = render();
  button(page, 'Play').props.onClick();
  await tick();
  finishSound(env);
  for (let index = 0; index < 16; index++) {
    page = render();
    assert.equal(
      answerFieldset(page).props.disabled,
      false,
      `target ${index + 1} heard`
    );
    choice(page, 'Major').props.onClick();
    page = render();
    assert.match(text(page), /Yes · Major/);
    const advance = button(page, 'Continue');
    const before = env.schedules.length;
    const generatedBefore = env.generatedQuestions.length;
    advance.props.onClick();
    advance.props.onClick();
    assert.equal(
      env.schedules.length,
      before + 1,
      'next starts in the explicit Continue gesture'
    );
    assert.equal(
      env.generatedQuestions.length,
      generatedBefore + 1,
      'duplicate Continue cannot skip a sound'
    );
    page = render();
    assert.equal(answerFieldset(page).props.disabled, true);
    assert.equal(
      allNodes(page).some(node => node.props?.className === 'music-response'),
      false
    );
    await tick();
    render();
    finishSound(env);
  }
  page = render();
  assert.equal(answerFieldset(page).props.disabled, false);
  assert.doesNotMatch(
    text(page),
    /Session complete|of 8|summary|accuracy|progress saved/i
  );
  assert.equal(env.saves.length, 0);
  assert.ok(
    env.storageWrites.every(
      write => write.key === 'eartrainer.listening-preferences.v1'
    )
  );
  for (const write of env.storageWrites)
    assert.deepEqual(Object.keys(JSON.parse(write.value)).sort(), [
      'lastLessonId',
      'volume',
    ]);
});

test('reveal works before play without scoring and duplicate skips cannot surprise-advance', async () => {
  const env = makeRuntime();
  const render = env.page();
  let page = render();
  button(page, 'Hear the answer').props.onClick();
  page = render();
  assert.match(text(page), /Listen for Major/);
  assert.equal(answerFieldset(page).props.disabled, true);
  assert.equal(env.schedules.length, 0, 'reveal does not silently start sound');
  button(page, 'Continue').props.onClick();
  await tick();
  finishSound(env);
  page = render();
  const skip = button(page, 'Another sound →');
  const before = env.schedules.length;
  skip.props.onClick();
  skip.props.onClick();
  assert.equal(env.schedules.length, before + 1);
  page = render();
  assert.equal(answerFieldset(page).props.disabled, true);
  await tick();
  finishSound(env);
  page = render();
  assert.equal(answerFieldset(page).props.disabled, false);
  assert.equal(env.saves.length, 0);
});

test('stopping while loading ignores the old resolution and requires a fresh full listen', async () => {
  const env = makeRuntime();
  const waiting = deferred();
  env.setScheduler(() => waiting.promise);
  const render = env.page();
  let page = render();
  button(page, 'Play').props.onClick();
  page = render();
  assert.match(text(page), /Preparing sound/);
  button(page, 'Stop').props.onClick();
  page = render();
  assert.equal(answerFieldset(page).props.disabled, true);
  waiting.resolve();
  await tick();
  finishSound(env);
  page = render();
  assert.equal(answerFieldset(page).props.disabled, true);
  assert.equal(env.timers.size, 0);
  assert.equal(env.schedules.length, 1);
  choice(page, 'Major').props.onClick();
  assert.equal(
    allNodes(render()).some(node => node.props?.className === 'music-response'),
    false
  );
  env.setScheduler(async () => {});
  button(page, 'Play').props.onClick();
  await tick();
  page = render();
  assert.equal(answerFieldset(page).props.disabled, true);
  finishSound(env);
  page = render();
  assert.equal(answerFieldset(page).props.disabled, false);
});

test('back, hidden tabs, route changes, and unmount cancel a pending next sound without late autoplay', async () => {
  for (const leave of ['back', 'hidden', 'route', 'unmount']) {
    const env = makeRuntime();
    const render = env.page();
    let page = render();
    button(page, 'Hear the answer').props.onClick();
    page = render();
    const waiting = deferred();
    env.setScheduler(() => waiting.promise);
    button(page, 'Continue').props.onClick();
    page = render();
    assert.equal(answerFieldset(page).props.disabled, true);
    const before = env.cancellations();
    if (leave === 'back')
      allNodes(page)
        .find(node => node.type === 'a')
        .props.onClick();
    if (leave === 'hidden') {
      env.document.hidden = true;
      env.documentEvents.get('visibilitychange')();
    }
    if (leave === 'route') {
      env.location.key = 'other-location';
      render();
    }
    if (leave === 'unmount') env.unmount();
    waiting.resolve();
    await tick();
    finishSound(env);
    assert.ok(env.cancellations() > before, `${leave} cancels audio`);
    assert.equal(env.timers.size, 0);
    assert.equal(
      env.schedules.length,
      1,
      `${leave} never starts a late extra sound`
    );
    if (leave !== 'unmount')
      assert.equal(answerFieldset(render()).props.disabled, true);
    assert.equal(env.saves.length, 0);
  }
});

test('tonal targets always bundle context, with learning content kept on a separate page', async () => {
  const env = makeRuntime({ leakSentinels: true });
  const render = env.page('degrees-core');
  let page = render();
  assert.doesNotMatch(
    text(page),
    /ANSWER_(EXPLANATION|HINT)_SENTINEL|Hear the key|Hear the detail|Explore the sounds|What to listen for/
  );
  assert.equal(
    allNodes(page).some(node => node.type === 'details'),
    false
  );
  const learningLink = allNodes(page).find(
    node => node.type === 'a' && text(node).trim() === 'Explore this sound'
  );
  assert.ok(learningLink);
  assert.equal(learningLink.props.to, '/learn/degrees-core');
  button(page, 'Play').props.onClick();
  await tick();
  const target = env.schedules.at(-1);
  const question = env.generatedQuestions[0];
  const referenceEnd = Math.max(
    ...question.referenceEvents.map(event => event.time + event.duration)
  );
  assert.deepEqual(
    plain(target.slice(0, question.referenceEvents.length)),
    plain(question.referenceEvents)
  );
  assert.ok(
    target.at(-1).time >= referenceEnd + 0.4,
    'the key reference precedes target'
  );
  page = render();
  button(page, 'Stop').props.onClick();
  page = render();
  assert.equal(
    answerFieldset(page).props.disabled,
    true,
    'interrupted context/target does not count as heard'
  );
  choice(page, '1 · Do').props.onClick();
  assert.equal(
    allNodes(render()).some(node => node.props?.className === 'music-response'),
    false
  );
  button(page, 'Play').props.onClick();
  await tick();
  finishSound(env);
  page = render();
  assert.equal(answerFieldset(page).props.disabled, false);
  choice(page, '1 · Do').props.onClick();
  page = render();
  assert.match(text(page), /Yes · 1 · Do/);
  assert.doesNotMatch(text(page), /ANSWER_(EXPLANATION|HINT)_SENTINEL/);
});

test('a wrong decision replays the actual target identically without replacing the first choice', async () => {
  const env = makeRuntime({ tonicIndex: 7 });
  const render = env.page();
  let page = render();
  button(page, 'Play').props.onClick();
  await tick();
  finishSound(env);
  const original = plain(env.schedules[0]);
  page = render();
  choice(page, 'Minor').props.onClick();
  page = render();
  const replay = button(response(page), 'Major');
  replay.props.onClick();
  await tick();
  assert.deepEqual(plain(env.schedules.at(-1)), original);
  finishSound(env);
  page = render();
  assert.match(text(page), /You heard Minor/);
  assert.equal(answerFieldset(page).props.disabled, true);
  assert.equal(env.saves.length, 0);
});

test('wrong choices replay genuine same-context alternatives, and Hear both contrasts actual then chosen', async t => {
  const cases = [
    { lessonId: 'triads-core', chosen: 'minor', offsets: [0, 3, 7] },
    { lessonId: 'degrees-core', chosen: '3', offsets: [4] },
    { lessonId: 'inversions-core', chosen: 'first', offsets: [4, 7, 12] },
    { lessonId: 'sevenths-core', chosen: 'min7', offsets: [0, 3, 7, 10] },
  ];
  for (const item of cases)
    await t.test(item.lessonId, async () => {
      const env = makeRuntime({ tonicIndex: 7 });
      const render = env.page(item.lessonId);
      let page = render();
      button(page, 'Play').props.onClick();
      await tick();
      finishSound(env);
      const actual = plain(env.schedules[0]);
      const question = env.generatedQuestions[0];
      const chosenLabel = question.choices.find(
        value => value.id === item.chosen
      ).label.en;
      page = render();
      choice(page, chosenLabel).props.onClick();
      page = render();
      button(response(page), chosenLabel).props.onClick();
      await tick();
      const chosen = plain(env.schedules.at(-1));
      const referenceCount = question.referenceEvents.length;
      assert.deepEqual(
        chosen.slice(0, referenceCount),
        plain(question.referenceEvents),
        'chosen sound keeps exactly the target key context'
      );
      assert.deepEqual(
        chosen.slice(referenceCount).map(event => event.note),
        item.offsets.map(offset => question.tonic + offset),
        'chosen category uses actual target root/register, not a canned labeled demo'
      );
      assert.notDeepEqual(
        chosen,
        actual,
        'the chosen alternative is musically different'
      );
      finishSound(env);
      page = render();
      button(response(page), question.answerLabel.en).props.onClick();
      await tick();
      assert.deepEqual(
        plain(env.schedules.at(-1)),
        actual,
        'actual replay is unchanged'
      );
      finishSound(env);
      page = render();
      button(response(page), 'Hear both').props.onClick();
      await tick();
      const both = plain(env.schedules.at(-1));
      assert.deepEqual(both.slice(0, actual.length), actual);
      const second = both.slice(actual.length);
      assert.equal(second.length, chosen.length);
      const shift = second[0].time - chosen[0].time;
      const actualEnd = Math.max(
        ...actual.map(event => event.time + event.duration)
      );
      assert.ok(
        shift >= actualEnd + 0.4,
        'a listening gap separates the alternatives'
      );
      second.forEach((event, index) => {
        assert.deepEqual({ ...event, time: chosen[index].time }, chosen[index]);
        assert.ok(
          Math.abs(event.time - chosen[index].time - shift) < 1e-8,
          'every chosen event shifts by the same amount'
        );
      });
      finishSound(env);
      page = render();
      assert.ok(text(page).includes(`You heard ${chosenLabel}`));
      assert.equal(answerFieldset(page).props.disabled, true);
      assert.equal(
        env.generatedQuestions.length,
        1,
        'comparison does not advance the question'
      );
      assert.equal(env.saves.length, 0);
    });
});

test('volume stays accessible and local even when all browser storage is denied', async () => {
  for (const storageUnavailable of [false, true]) {
    const env = makeRuntime({ storageUnavailable });
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
      allNodes(page).find(node => node.type === 'input').props[
        'aria-valuetext'
      ],
      '25%'
    );
    assert.equal(env.volumes.at(-1), 0.25);
    assert.equal(
      env.schedules.length,
      0,
      'volume changes cannot start playback'
    );
    button(page, 'Hear the answer').props.onClick();
    button(render(), 'Continue').props.onClick();
    await tick();
    finishSound(env);
    page = render();
    assert.equal(
      answerFieldset(page).props.disabled,
      false,
      'listening works without persistence'
    );
    assert.equal(env.saves.length, 0);
  }
});

test('every offered sound lesson can listen, decide, and continue through the same continuous controls', async t => {
  const catalog = makeRuntime().lessons;
  for (const lesson of catalog) {
    await t.test(lesson.id, async () => {
      const env = makeRuntime();
      const render = env.page(lesson.id);
      let page = render();
      assert.equal(env.schedules.length, 0, `${lesson.id} does not autoplay`);
      assert.equal(answerFieldset(page).props.disabled, true);
      const visibleChoices = allNodes(page).filter(
        node =>
          node.type === 'button' &&
          node.props?.className?.split(' ').includes('music-choice')
      );
      assert.equal(visibleChoices.length, lesson.choices.length);
      button(page, 'Play').props.onClick();
      await tick();
      render();
      finishSound(env);
      page = render();
      assert.equal(
        answerFieldset(page).props.disabled,
        false,
        `${lesson.id} unlocks after the target`
      );
      const question = env.generatedQuestions[0];
      assert.ok(question.answerLabel?.en, `${lesson.id} has its answer label`);
      choice(page, question.answerLabel.en).props.onClick();
      page = render();
      assert.ok(text(page).includes(`Yes · ${question.answerLabel.en}`));
      button(page, 'Continue').props.onClick();
      assert.equal(env.schedules.length, 2);
      await tick();
      render();
      finishSound(env);
      assert.equal(answerFieldset(render()).props.disabled, false);
      assert.equal(env.saves.length, 0);
      env.unmount();
    });
  }
});

test('continuous copy changes to Chinese and an invalid lesson links back to the listening path', () => {
  const env = makeRuntime();
  env.setLanguage('zh-CN');
  const page = env.page()();
  button(page, '播放');
  button(page, '听答案');
  assert.match(text(page), /聆听路线/);
  const other = makeRuntime();
  const invalid = other.page('unknown')();
  assert.match(text(invalid), /This sound isn’t here yet/);
  assert.equal(
    allNodes(invalid).find(node => node.type === 'a').props.to,
    '/learn'
  );
});
