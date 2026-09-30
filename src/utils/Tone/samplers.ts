import { SampleLibrary, type Quality } from '@utils/Tone/SampleLibrary';
import {
  Gain,
  Chorus,
  Limiter,
  getContext,
  now,
  start as startAudio,
  Filter,
  Panner,
  Player,
  PolySynth,
  Sampler,
  Synth,
} from 'tone';
import { Note } from 'tonal';

type Instrument = Sampler | PolySynth<Synth>;

interface DroneInstance {
  sampler: SamplerManager;
  start: () => void;
  stop: () => void;
  playOnce: () => void;
  setVolume: (value: number) => void;
  updateRoot: (rootNote: number | string) => void;
}

// This limits summed digital peaks, not headphone/speaker sound pressure.
// Start with a low device volume; the browser cannot guarantee hearing safety.
const outputLimiter = new Limiter(-6).toDestination();
const answerGainNode = new Gain(0.2).connect(outputLimiter);

// Keep the exported spelling for existing callers. Ear training needs stable pitch.
const globalChorous = new Chorus({
  frequency: 0.1,
  delayTime: 3,
  depth: 0.1,
  feedback: 0,
  spread: 180,
  wet: 0,
}).connect(outputLimiter);

// Keep Tone's scheduling look-ahead; setting it to zero causes late/jittery notes.
let audioStartPromise: Promise<void> | null = null;
function ensureAudioStarted(): Promise<void> {
  if (getContext().state === 'running') return Promise.resolve();
  if (!audioStartPromise) {
    audioStartPromise = startAudio().finally(() => {
      audioStartPromise = null;
    });
  }
  return audioStartPromise;
}

function clamp(value: number, min: number, max: number): number {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;
}

function normalizeQuality(quality: string): Quality {
  return ['low', 'medium', 'high', 'full'].includes(quality)
    ? (quality as Quality)
    : 'medium';
}

class SamplerManager {
  sampler: Instrument;
  filter: Filter;
  gainNode: Gain;
  panner: Panner;
  activeInstrument = 'triangle';
  private loadGeneration = 0;
  private pendingLoad: Promise<void> = Promise.resolve();

  constructor(
    instrument = 'triangle',
    quality = 'medium',
    filterFreq = 12000,
    panVal = 0,
    private readonly maxGain = 0.7
  ) {
    // A ready local synth keeps the app usable while samples load or fail.
    this.sampler = SampleLibrary.loadSynth('triangle') as PolySynth<Synth>;
    this.filter = new Filter({
      frequency: filterFreq,
      type: 'lowpass',
      rolloff: -12,
    });
    this.gainNode = new Gain(maxGain * 0.5);
    this.panner = new Panner(panVal);

    // Wire the shared processing path once. New instruments connect only to it.
    this.filter.chain(this.panner, this.gainNode, globalChorous);
    this.sampler.connect(this.filter);
    if (instrument !== 'triangle') {
      void this.changeSampler(instrument, quality).catch(error => {
        console.warn(
          'Using the local synth because samples failed to load.',
          error
        );
      });
    }
  }

  get ready(): Promise<void> {
    // A rejected load still leaves the previous instrument ready to use.
    return this.pendingLoad.catch(() => undefined);
  }

  get loaded(): boolean {
    return (
      !this.sampler.disposed &&
      (!(this.sampler instanceof Sampler) || this.sampler.loaded)
    );
  }

  setVolume(value: number): void {
    this.gainNode.gain.rampTo(clamp(value, 0, 1) * this.maxGain, 0.05);
  }

  setFilterFrequency(freq: number): void {
    this.filter.frequency.rampTo(clamp(freq, 20, 20000), 0.1);
  }

  setPortamento(value: number): void {
    if (this.sampler instanceof PolySynth) {
      this.sampler.set({ portamento: clamp(value, 0, 1) });
    }
  }

  setPan(value: number): void {
    this.panner.pan.rampTo(clamp(value, -1, 1), 0.1);
  }

  releaseAll(): void {
    this.sampler.releaseAll(now());
  }

  cancel(): void {
    const previous = this.sampler;
    previous.releaseAll(now());
    if (previous instanceof PolySynth && previous.activeVoices > 0) {
      // PolySynth.releaseAll does not mark voice allocations as released. A
      // rapid replay of the same pitch can otherwise release an old voice and
      // leave the new voice sounding. Reset using public settings/APIs only.
      const replacement = new PolySynth(Synth, previous.get());
      replacement.volume.value = previous.volume.value;
      replacement.maxPolyphony = previous.maxPolyphony;
      replacement.connect(this.filter);
      this.sampler = replacement;
      previous.disconnect();
      previous.dispose();
    }
  }

  changeSampler(instrumentName: string, quality = 'medium'): Promise<void> {
    const generation = ++this.loadGeneration;
    const load = this.loadInstrument(
      instrumentName,
      normalizeQuality(quality),
      generation
    );
    this.pendingLoad = load;
    return load;
  }

  private async loadInstrument(
    instrumentName: string,
    quality: Quality,
    generation: number
  ): Promise<void> {
    let candidate: Instrument | null = null;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      await new Promise<void>((resolve, reject) => {
        candidate = SampleLibrary.load({
          instruments: instrumentName,
          baseUrl: '/samples/',
          quality,
          onload: resolve,
          onerror: reject,
        }) as Instrument;
        if (!candidate) {
          reject(new Error(`Unknown instrument: ${instrumentName}`));
          return;
        }
        if (!(candidate instanceof Sampler) || candidate.loaded) {
          resolve();
        } else {
          // A stalled network must not leave settings and playback stuck forever.
          timeout = setTimeout(
            () => reject(new Error('Instrument loading timed out.')),
            20000
          );
        }
      });
      if (!candidate) return;
      const nextSampler = candidate as Instrument;
      if (generation !== this.loadGeneration) {
        nextSampler.dispose();
        return;
      }
      nextSampler.connect(this.filter);
      const previousSampler = this.sampler;
      this.sampler = nextSampler;
      this.activeInstrument = instrumentName;
      previousSampler.releaseAll(now());
      previousSampler.disconnect();
      previousSampler.dispose();
    } catch (error) {
      (candidate as Instrument | null)?.dispose();
      // Ignore obsolete failures; the newest request owns the state and error.
      if (generation === this.loadGeneration) throw error;
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }
}

let foregroundInstance: SamplerManager | null = null;
function getSamplerInstance(): SamplerManager {
  foregroundInstance ??= new SamplerManager();
  return foregroundInstance;
}

let bassInstance: SamplerManager | null = null;
function getBassInstance(): SamplerManager {
  // Separate synthesis, filter and gain; no instrument/sample download dependency.
  bassInstance ??= new SamplerManager('triangle', 'medium', 650, 0, 0.24);
  return bassInstance;
}

let droneInstance: DroneInstance | null = null;
function getDroneInstance(): DroneInstance {
  if (!droneInstance) {
    const sampler = new SamplerManager('triangle', 'medium', 1200, 0, 0.35);
    let rootPlaying = false;
    let currentRoot = 'C2';
    let generation = 0;
    let releaseTimeout: number | undefined;

    function stop(): void {
      generation++;
      rootPlaying = false;
      if (releaseTimeout !== undefined)
        getContext().clearTimeout(releaseTimeout);
      releaseTimeout = undefined;
      sampler.cancel();
    }

    function attack(once: boolean): void {
      const request = ++generation;
      void ensureAudioStarted()
        .then(() => {
          if (request !== generation) return;
          sampler.sampler.triggerAttack(currentRoot, now(), 0.65);
          if (once) {
            releaseTimeout = getContext().setTimeout(() => {
              if (request === generation) sampler.releaseAll();
              releaseTimeout = undefined;
            }, 1);
          }
        })
        .catch(error => console.warn('Audio could not start.', error));
    }

    function start(): void {
      if (!rootPlaying) {
        rootPlaying = true;
        attack(false);
      }
    }

    function playOnce(): void {
      if (!rootPlaying) attack(true);
    }

    function updateRoot(rootNote: number | string): void {
      const nextRoot =
        typeof rootNote === 'number' ? Note.fromMidi(rootNote) : rootNote;
      if (!nextRoot || nextRoot === currentRoot) return;
      generation++;
      sampler.cancel();
      currentRoot = nextRoot;
      if (rootPlaying) attack(false);
    }

    droneInstance = {
      sampler,
      start,
      stop,
      playOnce,
      setVolume: sampler.setVolume.bind(sampler),
      updateRoot,
    };
  }
  return droneInstance;
}

const audioCache: Record<string, Player> = {};
function preloadAudio(path: string): Player | null {
  if (!path) return null;
  audioCache[path] ??= new Player({
    url: path,
    onerror: error => console.warn('Could not load answer audio.', error),
  }).connect(answerGainNode);
  return audioCache[path];
}

function releasePlaybackVoices(): void {
  foregroundInstance?.cancel();
  bassInstance?.cancel();
}

function stopAllVoices(): void {
  releasePlaybackVoices();
  droneInstance?.stop();
  Object.values(audioCache).forEach(player => {
    if (player.state === 'started') player.stop();
  });
}

const getAnswerGainNode = (): Gain => answerGainNode;

export {
  getSamplerInstance,
  getBassInstance,
  getDroneInstance,
  preloadAudio,
  getAnswerGainNode,
  globalChorous,
  ensureAudioStarted,
  releasePlaybackVoices,
  stopAllVoices,
};
