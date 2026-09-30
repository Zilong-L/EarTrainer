import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import {
  makeRuntime,
  allNodes,
  text,
  button,
  choice,
  finishSound,
  tick,
  answerFieldset,
  plain,
} from './helpers/practice-runtime.mjs';

const selects = page => allNodes(page).filter(n => n.type === 'select');
const change = (page, value) => {
  const select = selects(page).find(n =>
    allNodes(n).some(option => option.props?.value === value)
  );
  assert.ok(select, `setup option ${value}`);
  select.props.onChange({ currentTarget: { value } });
};

test('guitar room hides target frets and stops a pending sweep when setup changes', async () => {
  const env = makeRuntime({ leakSentinels: true });
  const render = env.page('guitar-strums');
  let page = render();
  assert.equal(env.schedules.length, 0);
  assert.equal(selects(page).length, 3);
  assert.equal(
    allNodes(page).some(n => n.props?.className === 'guitar-diagram'),
    false
  );
  assert.doesNotMatch(
    text(page),
    /ANSWER_.*SENTINEL|Open Am|Open A|fret 5|A ·|E ·|D ·/
  );
  button(page, 'Play').props.onClick();
  await tick();
  const original = plain(env.schedules[0]);
  const cancels = env.cancellations();
  change(render(), 'slow');
  page = render();
  assert.ok(env.cancellations() > cancels);
  finishSound(env);
  assert.equal(answerFieldset(render()).props.disabled, true);
  choice(render(), 'Major').props.onClick();
  assert.doesNotMatch(text(render()), /Yes · Major/);
  button(render(), 'Play').props.onClick();
  await tick();
  const slow = plain(env.schedules.at(-1));
  assert.deepEqual(
    slow.map(e => e.note),
    original.map(e => e.note)
  );
  assert.equal(slow.at(-1).time, 0.2);
  finishSound(env);
  assert.equal(answerFieldset(render()).props.disabled, false);
  change(render(), 'guitar-acoustic');
  render();
  assert.equal(env.schedules.length, 2, 'settings never autoplay');
  button(render(), 'Play').props.onClick();
  await tick();
  assert.ok(
    env.schedules.at(-1).every(e => e.instrument === 'guitar-acoustic')
  );
  env.unmount();
  assert.equal(env.timers.size, 0);
});

test('guitar Learn holds chord quality while changing true fret diagrams and A/B voicings', async () => {
  const env = makeRuntime();
  const render = env.explainer('guitar-strums');
  let page = render();
  assert.equal(env.schedules.length, 0);
  const diagram = allNodes(page).find(
    n => n.props?.className === 'guitar-diagram'
  );
  assert.match(diagram.props['aria-label'], /Open A/);
  const shapeButton = allNodes(page).find(
    n => n.type === 'button' && /E-form, fret 5/.test(text(n))
  );
  shapeButton.props.onClick();
  page = render();
  assert.equal(env.schedules.length, 0);
  assert.match(
    allNodes(page).find(n => n.props?.className === 'guitar-diagram').props[
      'aria-label'
    ],
    /E-form, fret 5/
  );
  button(page, 'Same chord, another voicing').props.onClick();
  await tick();
  const notes = env.schedules.at(-1);
  const first = notes.slice(0, 6),
    second = notes.slice(6);
  const classes = events => [...new Set(events.map(e => e.note % 12))].sort();
  assert.deepEqual(classes(first), classes(second));
  assert.notDeepEqual(
    first.map(e => e.note),
    second.map(e => e.note)
  );
  assert.ok(second[0].time > Math.max(...first.map(e => e.time + e.duration)));
  button(render(), 'Stop sound').props.onClick();
  assert.equal(env.timers.size, 0);
  env.unmount();
});

test('guitar diagrams retain full size over the shared icon sizing rule', () => {
  const css = readFileSync(
    new URL('../src/features/training/lessonExplainer.css', import.meta.url),
    'utf8'
  );
  assert.match(
    css,
    /\.trainer-app \.guitar-diagram svg\s*\{[^}]*width: 100%;[^}]*height: auto;/
  );
});
