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
