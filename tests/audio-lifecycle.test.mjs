import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const root = new URL('../', import.meta.url);
const tick = () => new Promise(resolve => setTimeout(resolve, 0));

function loadModule(path, dependencies) {
  const source = readFileSync(new URL(path, root), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const exports = {};
  vm.runInNewContext(
    outputText,
    {
      exports,
      module: { exports },
      require: name => dependencies[name] ?? require(name),
      console: { warn() {}, error() {}, log() {} },
      setTimeout,
      clearTimeout,
    },
    { filename: path }
  );
  return exports;
}

function makeTone() {
  const nodes = [];
  const timers = new Map();
  let timerId = 0;
  const context = {
    state: 'suspended',
    lookAhead: 0.1,
    setTimeout(callback, seconds) {
      const id = ++timerId;
      timers.set(id, { callback, seconds });
      return id;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
  };
  function param(value) {
    return {
      value,
      rampTo(next) {
        this.value = next;
      },
    };
  }
  class AudioNode {
    constructor(options) {
      this.disposed = false;
      this.connections = [];
      this.calls = [];
      this.volume = param(0);
      this.options = options;
      nodes.push(this);
    }
    connect(node) {
      this.connections.push(node);
      return this;
    }
    chain(...chain) {
      let previous = this;
      for (const next of chain) {
        previous.connect(next);
        previous = next;
      }
      return this;
    }
    toDestination() {
      this.destination = true;
      return this;
    }
    disconnect() {
      this.connections = [];
      return this;
    }
    dispose() {
      this.disposed = true;
      return this;
    }
    triggerAttack(...args) {
      this.calls.push(['attack', ...args]);
    }
    triggerRelease(...args) {
      this.calls.push(['release', ...args]);
    }
    releaseAll(...args) {
      this.calls.push(['releaseAll', ...args]);
    }
    set(options) {
      this.settings = options;
    }
    get() {
      return this.settings ?? {};
    }
  }
  class Sampler extends AudioNode {
    constructor(urls, options) {
      super(options);
      this.loaded = false;
      this.urls = urls;
    }
  }
  class PolySynth extends AudioNode {
    constructor(options) {
      super(options);
      this.name = 'PolySynth';
    }
  }
  class Gain extends AudioNode {
    constructor(value) {
      super(value);
      this.gain = param(value);
    }
  }
  class Filter extends AudioNode {
    constructor(options) {
      super(options);
      this.frequency = param(options.frequency);
    }
  }
  class Panner extends AudioNode {
    constructor(value) {
      super(value);
      this.pan = param(value);
    }
  }
  class Player extends AudioNode {
    constructor(options) {
      super(options);
      this.state = 'stopped';
    }
    stop() {
      this.state = 'stopped';
      this.calls.push(['stop']);
    }
  }
  const transport = {
    events: [],
    starts: [],
    stops: 0,
    position: 12,
    stop() {
      this.stops++;
    },
    cancel() {
      this.events = [];
    },
    schedule(callback, time) {
      this.events.push({ callback, time });
    },
    start(...args) {
      this.starts.push(args);
    },
  };
  const tone = {
    Gain,
    Filter,
    Panner,
    Player,
    Sampler,
    PolySynth,
    Synth: class extends AudioNode {},
    Chorus: class extends AudioNode {},
    Limiter: class extends AudioNode {},
    getContext: () => context,
    now: () => 5,
    start: async () => {
      context.state = 'running';
    },
    Transport: transport,
    Frequency: midi => ({ toNote: () => `midi:${midi}` }),
    Time: duration => ({
      toSeconds: () => (duration === '8n' ? 0.25 : Number(duration)),
    }),
  };
  return { tone, nodes, context, timers, transport };
}

function makeSamplers() {
  const env = makeTone();
  const pending = [];
  const library = {
    loadSynth: () => new env.tone.PolySynth(),
    load(options) {
      if (
        ['triangle', 'square', 'sawtooth', 'pad'].includes(options.instruments)
      ) {
        return new env.tone.PolySynth();
      }
      const sampler = new env.tone.Sampler({}, options);
      pending.push({ ...options, sampler });
      return sampler;
    },
  };
  const api = loadModule('src/utils/Tone/samplers.ts', {
    tone: env.tone,
    '@utils/Tone/SampleLibrary': { SampleLibrary: library },
  });
  return { ...env, api, pending };
}

function makePlayback() {
  const env = makeTone();
  const foreground = {
    sampler: new env.tone.PolySynth(),
    ready: Promise.resolve(),
    loaded: true,
  };
  const bass = {
    sampler: new env.tone.PolySynth(),
    ready: Promise.resolve(),
    loaded: true,
  };
  const managerApi = {
    getSamplerInstance: () => foreground,
    getBassInstance: () => bass,
    ensureAudioStarted: async () => {},
    releasePlaybackVoices() {
      foreground.sampler.releaseAll();
      bass.sampler.releaseAll();
    },
    stopAllVoices() {
      managerApi.releasePlaybackVoices();
      managerApi.allStopped = true;
    },
  };
  const api = loadModule('src/utils/Tone/playbacks.ts', {
    tone: env.tone,
    './samplers': managerApi,
  });
  return { ...env, api, foreground, bass, managerApi };
}

function makeGuitarPlayback() {
  const env = makeSamplers();
  const playback = loadModule('src/utils/Tone/playbacks.ts', {
    tone: env.tone,
    './samplers': env.api,
  });
  return { ...env, api: { ...env.api, ...playback } };
}

function finishSamples(pending) {
  pending.forEach(load => {
    load.sampler.loaded = true;
    load.onload();
  });
}

function guitarSweep(instrument = 'guitar-acoustic') {
  return Array.from({ length: 6 }, (_, guitarString) => ({
    note: 40 + guitarString * 5,
    time: guitarString * 0.025,
    duration: 1,
    guitarString,
    instrument,
  }));
}

test('foreground has one dry, filtered, gain-controlled path and independent bass', () => {
  const { api, nodes, context } = makeSamplers();
  const foreground = api.getSamplerInstance();
  const bass = api.getBassInstance();
  assert.equal(foreground.sampler.connections.length, 1);
  assert.equal(foreground.sampler.connections[0], foreground.filter);
  assert.equal(foreground.filter.connections[0], foreground.panner);
  assert.equal(foreground.panner.connections[0], foreground.gainNode);
  assert.equal(foreground.gainNode.connections[0], api.globalChorous);
  assert.equal(api.globalChorous.options.wet, 0);
  assert.equal(api.globalChorous.options.feedback, 0);
  assert.equal(nodes.find(node => node.destination).options, -6);
  assert.equal(context.lookAhead, 0.1);
  assert.notEqual(bass.sampler, foreground.sampler);
  assert.notEqual(bass.gainNode, foreground.gainNode);
  assert.equal(bass.gainNode.gain.value, 0.12);
  foreground.setVolume(100);
  assert.equal(foreground.gainNode.gain.value, 0.7);
  foreground.setVolume(-1);
  assert.equal(foreground.gainNode.gain.value, 0);
  foreground.setVolume(NaN);
  assert.equal(foreground.gainNode.gain.value, 0);
});

test('instrument switching only installs the latest load and disposes stale candidates', async () => {
  const { api, pending } = makeSamplers();
  const manager = api.getSamplerInstance();
  const original = manager.sampler;
  const first = manager.changeSampler('piano', 'medium');
  const second = manager.changeSampler('flute', 'high');
  pending[1].sampler.loaded = true;
  pending[1].onload();
  await second;
  assert.equal(manager.sampler, pending[1].sampler);
  assert.equal(original.disposed, true);
  pending[0].sampler.loaded = true;
  pending[0].onload();
  await first;
  assert.equal(pending[0].sampler.disposed, true);
  assert.equal(manager.activeInstrument, 'flute');
  assert.equal(manager.sampler.disposed, false);
  assert.equal(manager.filter.connections.length, 1);
});

test('load errors retain a usable local fallback and ready does not reject', async () => {
  const { api, pending } = makeSamplers();
  const manager = api.getSamplerInstance();
  const fallback = manager.sampler;
  const load = manager.changeSampler('piano');
  pending[0].onerror(new Error('network unavailable'));
  await assert.rejects(load, /network unavailable/);
  await manager.ready;
  assert.equal(manager.sampler, fallback);
  assert.equal(manager.loaded, true);
  assert.equal(fallback.disposed, false);
  assert.equal(pending[0].sampler.disposed, true);
});

test('audio unlock is deduplicated and retries after a failed unlock', async () => {
  const { api, tone } = makeSamplers();
  let rejectStart;
  let starts = 0;
  tone.start = () => {
    starts++;
    return new Promise((_resolve, reject) => {
      rejectStart = reject;
    });
  };
  const first = api.ensureAudioStarted();
  const second = api.ensureAudioStarted();
  assert.equal(first, second);
  assert.equal(starts, 1);
  rejectStart(new Error('resume blocked'));
  await assert.rejects(first, /resume blocked/);
  tone.start = async () => {
    starts++;
  };
  await api.ensureAudioStarted();
  assert.equal(starts, 2);
});

test('quality samples cover the full MIDI range, retaining both register endpoints', () => {
  const { tone } = makeTone();
  const { SampleLibrary } = loadModule('src/utils/Tone/SampleLibrary.ts', {
    tone,
  });
  const { Note } = require('tonal');
  for (const instrument of SampleLibrary.list) {
    const source = Object.keys(SampleLibrary[instrument]).sort(
      (a, b) => Note.midi(a) - Note.midi(b)
    );
    for (const quality of ['low', 'medium', 'high', 'full']) {
      const sampler = SampleLibrary.load({ instruments: instrument, quality });
      const keys = Object.keys(sampler.urls);
      assert.equal(keys[0], source[0], `${instrument} ${quality} low endpoint`);
      assert.equal(
        keys.at(-1),
        source.at(-1),
        `${instrument} ${quality} high endpoint`
      );
      assert.ok(
        keys.every(
          (key, index) =>
            index === 0 || Note.midi(key) > Note.midi(keys[index - 1])
        )
      );
      if (quality === 'full') assert.equal(keys.length, source.length);
    }
  }
  const sampler = SampleLibrary.load({
    instruments: 'piano',
    quality: 'medium',
    ext: '.ogg',
  });
  assert.ok(Object.values(sampler.urls).every(url => url.endsWith('.ogg')));
  assert.throws(
    () => SampleLibrary.load({ instruments: 'not-an-instrument' }),
    /Unknown instrument/
  );
});

test('scheduled events route bass independently, clamp velocity, and rewind transport', async () => {
  const { api, transport, foreground, bass } = makePlayback();
  await api.scheduleNotes([
    { note: 60, time: 0, duration: 1, velocity: 10 },
    { note: 'C2', time: 0.1, duration: 2, voice: 'bass' },
  ]);
  assert.equal(transport.position, 0);
  assert.equal(transport.events.length, 4);
  assert.deepEqual(transport.starts[0], [5, 0]);
  transport.events[0].callback(5);
  transport.events[2].callback(5.1);
  assert.deepEqual(foreground.sampler.calls.at(-1), [
    'attack',
    'midi:60',
    5,
    1,
  ]);
  assert.deepEqual(bass.sampler.calls.at(-1), ['attack', 'C2', 5.1, 0.65]);
  transport.events[1].callback(6);
  assert.deepEqual(foreground.sampler.calls.at(-1), ['release', 'midi:60', 6]);
});

test('cancelling during audio unlock prevents a late playback from starting', async () => {
  const { api, managerApi, transport } = makePlayback();
  let unlock;
  managerApi.ensureAudioStarted = () =>
    new Promise(resolve => {
      unlock = resolve;
    });
  const scheduling = api.scheduleNotes([{ note: 'C4', time: 0, duration: 1 }]);
  api.cancelAllSounds();
  unlock();
  await scheduling;
  assert.equal(transport.events.length, 0);
  assert.equal(transport.starts.length, 0);
  assert.equal(managerApi.allStopped, true);
});

test('the newest playback wins while instrument loading is pending', async () => {
  const { api, foreground, transport } = makePlayback();
  let ready;
  foreground.ready = new Promise(resolve => {
    ready = resolve;
  });
  const old = api.scheduleNotes([{ note: 'C4', time: 0, duration: 1 }]);
  const latest = api.scheduleNotes([{ note: 'D4', time: 0.5, duration: 1 }]);
  ready();
  await Promise.all([old, latest]);
  assert.equal(transport.starts.length, 1);
  assert.equal(transport.events.length, 2);
  transport.events[0].callback(5.5);
  assert.equal(foreground.sampler.calls.at(-1)[1], 'D4');
});

test('cancelled callbacks cannot trigger or release notes in a new playback', async () => {
  const { api, foreground, transport } = makePlayback();
  await api.scheduleNotes([{ note: 'C4', time: 0, duration: 10 }]);
  const oldEvents = [...transport.events];
  await api.scheduleNotes([{ note: 'C4', time: 0, duration: 1 }]);
  const calls = foreground.sampler.calls.length;
  oldEvents.forEach(event => event.callback(15));
  assert.equal(foreground.sampler.calls.length, calls);
});

test('additive release timers are cancelled with all sounds', async () => {
  const { api, foreground, timers } = makePlayback();
  api.playNotesAdditive('C4');
  await tick();
  assert.equal(timers.size, 1);
  assert.equal(foreground.sampler.calls.at(-1)[0], 'attack');
  api.cancelAllSounds();
  assert.equal(timers.size, 0);
  assert.equal(foreground.sampler.calls.at(-1)[0], 'releaseAll');
});

test('playback helpers preserve duration returns and sanitize timing', async () => {
  const { api, transport } = makePlayback();
  assert.equal(api.playNotes(['C4', 'E4'], -1, 0), 2);
  await tick();
  assert.equal(transport.events[0].time, 0);
  assert.equal(api.playNotesTogether('C4'), 1.05);
  await tick();
  assert.equal(transport.events[0].time, 0.05);
  await api.scheduleNotes([{ note: 'C4', time: -1, duration: 0 }]);
  assert.equal(transport.events.length, 0);
});

test('sound settings default new users to piano and preserve persisted preferences', async () => {
  const originalStorage = globalThis.localStorage;
  try {
    for (const persisted of [
      undefined,
      {
        selectedInstrument: 'bass-electric',
        selectedQuality: 'high',
        isLoadingInstrument: true,
      },
    ]) {
      const data = new Map();
      if (persisted)
        data.set(
          'sound-settings-storage',
          JSON.stringify({ state: persisted, version: 0 })
        );
      globalThis.localStorage = {
        getItem: key => data.get(key) ?? null,
        setItem: (key, value) => data.set(key, value),
        removeItem: key => data.delete(key),
      };
      const loads = [];
      const { useSoundSettingsStore } = loadModule(
        'src/stores/soundSettingsStore.ts',
        {
          '@utils/Tone/samplers': {
            getSamplerInstance: () => ({
              changeSampler: async (...args) => {
                loads.push(args);
              },
            }),
            getDroneInstance: () => ({
              sampler: { setPan() {}, setFilterFrequency() {} },
            }),
          },
        }
      );
      await tick();
      const state = useSoundSettingsStore.getState();
      assert.equal(
        state.selectedInstrument,
        persisted?.selectedInstrument ?? 'piano'
      );
      assert.equal(
        state.selectedQuality,
        persisted?.selectedQuality ?? 'medium'
      );
      assert.equal(state.isLoadingInstrument, false);
      assert.equal(loads.length, 1);
      assert.ok(
        !(
          'isLoadingInstrument' in
          JSON.parse(data.get('sound-settings-storage')).state
        )
      );
    }
  } finally {
    if (originalStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = originalStorage;
  }
});

test('cancellation resets active synth allocations before a same-pitch replay', () => {
  const { api } = makeSamplers();
  const manager = api.getSamplerInstance();
  const previous = manager.sampler;
  previous.activeVoices = 1;
  previous.maxPolyphony = 16;
  previous.volume.value = -8;
  previous.settings = { oscillator: { type: 'triangle' } };
  api.releasePlaybackVoices();
  assert.equal(previous.disposed, true);
  assert.notEqual(manager.sampler, previous);
  assert.equal(manager.sampler.volume.value, -8);
  assert.equal(manager.sampler.maxPolyphony, 16);
  assert.equal(manager.sampler.connections[0], manager.filter);
});

test('bass-only sequences do not wait on foreground sample downloads', async () => {
  const { api, foreground, transport } = makePlayback();
  foreground.ready = new Promise(() => {});
  await api.scheduleNotes([
    { note: 'C2', time: 0, duration: 1, voice: 'bass' },
  ]);
  assert.equal(transport.starts.length, 1);
});

test('guitar strings load strict samples through independent shared-safe output paths', async () => {
  const { api, pending, nodes, tone } = makeSamplers();
  api.setGuitarVolume(0.3);
  const low = api.getGuitarStringInstance(0, 'guitar-acoustic');
  const high = api.getGuitarStringInstance(5, 'guitar-acoustic');
  assert.notEqual(low, high);
  assert.notEqual(low.sampler, high.sampler);
  assert.equal(pending.length, 2);
  assert.ok(pending.every(load => load.instruments === 'guitar-acoustic'));
  assert.equal(nodes.filter(node => node instanceof tone.PolySynth).length, 0);
  assert.equal(low.gainNode.gain.value, 0.21);
  assert.equal(low.sampler.connections[0], low.filter);
  assert.equal(low.filter.connections[0], low.panner);
  assert.equal(low.panner.connections[0], low.gainNode);
  assert.equal(low.gainNode.connections[0], api.globalChorous);
  assert.equal(low.loaded, false);
  finishSamples(pending);
  await Promise.all([low.ready, high.ready]);
  assert.equal(low.loaded, true);
  const foreground = api.getSamplerInstance();
  assert.notEqual(foreground.sampler, low.sampler);
  assert.notEqual(foreground.gainNode, low.gainNode);
  api.stopAllVoices();
  assert.equal(low.sampler.calls.at(-1)[0], 'releaseAll');
});

test('unison notes on different guitar strings attack and release independently', async () => {
  const { api, pending, transport } = makeGuitarPlayback();
  const playback = api.scheduleNotes([
    { note: 64, time: 0, duration: 0.4, guitarString: 2 },
    { note: 64, time: 0.03, duration: 1.2, guitarString: 5 },
  ]);
  await tick();
  assert.equal(pending.length, 2);
  finishSamples(pending);
  await playback;
  const first = api.getGuitarStringInstance(2);
  const second = api.getGuitarStringInstance(5);
  transport.events[0].callback(5);
  transport.events[2].callback(5.03);
  assert.deepEqual(first.sampler.calls.at(-1), ['attack', 'midi:64', 5, 0.8]);
  assert.deepEqual(second.sampler.calls.at(-1), [
    'attack',
    'midi:64',
    5.03,
    0.8,
  ]);
  const secondCalls = second.sampler.calls.length;
  transport.events[1].callback(5.4);
  assert.deepEqual(first.sampler.calls.at(-1), ['release', 'midi:64', 5.4]);
  assert.equal(second.sampler.calls.length, secondCalls);
  transport.events[3].callback(6.23);
  assert.deepEqual(second.sampler.calls.at(-1), ['release', 'midi:64', 6.23]);
});

test('an older string release cannot truncate a later same-string strum', async () => {
  const { api, pending, transport } = makeGuitarPlayback();
  const playback = api.scheduleNotes([
    { note: 64, time: 0, duration: 1, guitarString: 5 },
    { note: 64, time: 0.5, duration: 1, guitarString: 5 },
  ]);
  await tick();
  assert.equal(pending.length, 1);
  finishSamples(pending);
  await playback;
  const sampler = pending[0].sampler;
  transport.events[0].callback(5);
  transport.events[2].callback(5.5);
  const calls = sampler.calls.length;
  transport.events[1].callback(6);
  assert.equal(sampler.calls.length, calls);
  transport.events[3].callback(6.5);
  assert.deepEqual(sampler.calls.at(-1), ['release', 'midi:64', 6.5]);
});

test('guitar-only playback waits just for used strings, without waiting for piano', async () => {
  const { api, pending, transport } = makeGuitarPlayback();
  const foreground = api.getSamplerInstance();
  const pianoLoad = foreground.changeSampler('piano');
  const playback = api.scheduleNotes([
    { note: 'E4', time: 0, duration: 1, guitarString: 5 },
  ]);
  await tick();
  assert.deepEqual(
    pending.map(load => load.instruments),
    ['piano', 'guitar-acoustic']
  );
  finishSamples(pending.slice(1));
  await playback;
  assert.equal(transport.starts.length, 1);
  assert.equal(transport.events.length, 2);
  assert.equal(foreground.activeInstrument, 'triangle');
  finishSamples(pending.slice(0, 1));
  await pianoLoad;
});

test('repeated guitar replays reuse a bounded six-string bank and cancel old sweeps', async () => {
  const { api, pending, transport, nodes, tone } = makeGuitarPlayback();
  const firstPlayback = api.scheduleNotes(guitarSweep());
  await tick();
  assert.equal(pending.length, 6);
  finishSamples(pending);
  await firstPlayback;
  const managers = Array.from({ length: 6 }, (_, index) =>
    api.getGuitarStringInstance(index)
  );
  const nodeCount = nodes.length;
  for (let replay = 0; replay < 12; replay++) {
    const previousEvents = [...transport.events];
    previousEvents[0].callback(5);
    await api.scheduleNotes(guitarSweep());
    const calls = pending.map(load => load.sampler.calls.length);
    previousEvents.forEach(event => event.callback(15));
    assert.deepEqual(
      pending.map(load => load.sampler.calls.length),
      calls
    );
    managers.forEach((manager, index) => {
      assert.equal(api.getGuitarStringInstance(index), manager);
    });
    assert.equal(transport.events.length, 12);
  }
  assert.equal(pending.length, 6);
  assert.equal(nodes.length, nodeCount);
  assert.equal(
    nodes.filter(node => node instanceof tone.Sampler && !node.disposed).length,
    6
  );
  assert.equal(nodes.filter(node => node instanceof tone.PolySynth).length, 0);
  const events = [...transport.events];
  api.cancelAllSounds();
  const calls = pending.map(load => load.sampler.calls.length);
  events.forEach(event => event.callback(15));
  assert.deepEqual(
    pending.map(load => load.sampler.calls.length),
    calls
  );
  assert.equal(transport.events.length, 0);
  assert.equal(transport.position, 0);
  assert.ok(
    pending.every(load => load.sampler.calls.at(-1)[0] === 'releaseAll')
  );
});

test('Stop disposes pending guitar loads and prevents late audio or errors', async () => {
  const { api, pending, transport, nodes } = makeGuitarPlayback();
  const playback = api.scheduleNotes(guitarSweep());
  await tick();
  assert.equal(pending.length, 6);
  api.cancelAllSounds();
  await playback;
  assert.ok(pending.every(load => load.sampler.disposed));
  assert.equal(nodes.filter(node => !node.disposed).length, 3);
  finishSamples(pending);
  pending[0].onerror(new Error('obsolete load failure'));
  await tick();
  assert.equal(transport.starts.length, 0);
  assert.equal(transport.events.length, 0);
  assert.ok(pending.every(load => load.sampler.connections.length === 0));
});

test('cancelling guitar during audio unlock never allocates a late string bank', async () => {
  const { api, pending, tone, transport } = makeGuitarPlayback();
  let unlock;
  tone.start = () =>
    new Promise(resolve => {
      unlock = resolve;
    });
  const playback = api.scheduleNotes(guitarSweep());
  api.cancelAllSounds();
  unlock();
  await playback;
  assert.equal(pending.length, 0);
  assert.equal(transport.events.length, 0);
  assert.equal(transport.starts.length, 0);
});

test('guitar style switching disposes the old bank and only the latest load starts', async () => {
  const { api, pending, transport, nodes, tone } = makeGuitarPlayback();
  const old = api.scheduleNotes(guitarSweep('guitar-acoustic'));
  await tick();
  const acoustic = [...pending];
  const latest = api.scheduleNotes(guitarSweep('guitar-nylon'));
  await tick();
  assert.ok(acoustic.every(load => load.sampler.disposed));
  assert.equal(pending.length, 12);
  const nylon = pending.slice(6);
  finishSamples(nylon);
  await Promise.all([old, latest]);
  assert.equal(transport.starts.length, 1);
  assert.equal(transport.events.length, 12);
  finishSamples(acoustic);
  await tick();
  assert.equal(transport.starts.length, 1);
  assert.equal(
    nodes.filter(node => node instanceof tone.Sampler && !node.disposed).length,
    6
  );
  transport.events[0].callback(5);
  assert.equal(nylon[0].sampler.calls.at(-1)[0], 'attack');
  assert.ok(
    acoustic.every(
      load => !load.sampler.calls.some(call => call[0] === 'attack')
    )
  );
});

test('style switching outside playback settles and invalidates pending guitar readiness', async () => {
  const { api, pending, transport } = makeGuitarPlayback();
  const playback = api.scheduleNotes([
    { note: 40, time: 0, duration: 1, guitarString: 0 },
  ]);
  await tick();
  const obsolete = pending[0];
  const nylon = api.getGuitarStringInstance(0, 'guitar-nylon');
  await playback;
  assert.equal(obsolete.sampler.disposed, true);
  assert.equal(transport.starts.length, 0);
  assert.equal(transport.events.length, 0);
  finishSamples(pending);
  await nylon.ready;
  assert.equal(nylon.loaded, true);
});

test('guitar load failure rejects playback, cleans pending strings, and can retry samples', async () => {
  const { api, pending, transport, tone, nodes } = makeGuitarPlayback();
  const playback = api.scheduleNotes(guitarSweep());
  await tick();
  pending[2].onerror(new Error('guitar network failure'));
  await assert.rejects(playback, /guitar network failure/);
  assert.equal(transport.starts.length, 0);
  assert.equal(transport.events.length, 0);
  assert.ok(pending.every(load => load.sampler.disposed));
  assert.equal(nodes.filter(node => node instanceof tone.PolySynth).length, 0);
  const retry = api.scheduleNotes(guitarSweep());
  await tick();
  finishSamples(pending.slice(6));
  await retry;
  assert.equal(transport.starts.length, 1);
  assert.equal(pending.length, 12);
});

test('guitar volume is clamped, kept on replay/style switches, and independent of piano', async () => {
  const { api, pending } = makeSamplers();
  const foreground = api.getSamplerInstance();
  api.setGuitarVolume(0.2);
  const acoustic = api.getGuitarStringInstance(0);
  finishSamples(pending);
  await acoustic.ready;
  assert.equal(acoustic.gainNode.gain.value, 0.2 * 0.7);
  api.setGuitarVolume(2);
  assert.equal(acoustic.gainNode.gain.value, 0.7);
  assert.equal(foreground.gainNode.gain.value, 0.35);
  const nylon = api.getGuitarStringInstance(0, 'guitar-nylon');
  assert.equal(acoustic.sampler.disposed, true);
  assert.equal(acoustic.filter.disposed, true);
  assert.equal(acoustic.panner.disposed, true);
  assert.equal(acoustic.gainNode.disposed, true);
  assert.equal(nylon.gainNode.gain.value, 0.7);
  finishSamples(pending.slice(1));
  await nylon.ready;
  api.setGuitarVolume(-1);
  assert.equal(nylon.gainNode.gain.value, 0);
  api.setGuitarVolume(NaN);
  assert.equal(nylon.gainNode.gain.value, 0);
  assert.equal(api.getGuitarStringInstance(0, 'guitar-nylon'), nylon);
});

test('guitar playback validates string indexes and rejects mixed styles before allocating', async () => {
  const { api, pending, transport } = makeGuitarPlayback();
  for (const index of [-1, 6, NaN, 0.5]) {
    assert.throws(
      () => api.getGuitarStringInstance(index),
      /index from 0 to 5/
    );
  }
  await api.scheduleNotes([
    { note: 64, time: 0, duration: 1, guitarString: 6 },
  ]);
  await assert.rejects(
    api.scheduleNotes([
      {
        note: 40,
        time: 0,
        duration: 1,
        guitarString: 0,
        instrument: 'guitar-acoustic',
      },
      {
        note: 64,
        time: 0,
        duration: 1,
        guitarString: 5,
        instrument: 'guitar-nylon',
      },
    ]),
    /one guitar instrument/
  );
  assert.equal(pending.length, 0);
  assert.equal(transport.starts.length, 0);
});
