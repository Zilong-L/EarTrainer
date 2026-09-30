import { Transport, Frequency, Time, getContext, now } from 'tone';
import {
  getSamplerInstance,
  getBassInstance,
  getGuitarStringInstance,
  type GuitarInstrument,
  ensureAudioStarted,
  releasePlaybackVoices,
  stopAllVoices,
} from './samplers';

export interface NoteEvent {
  note: number | string;
  time: number;
  duration: number;
  voice?: 'foreground' | 'bass';
  velocity?: number;
  /** Physical string index, low E (0) through high E (5). */
  guitarString?: number;
  instrument?: GuitarInstrument;
}

let playbackGeneration = 0;
const additiveReleaseTimeouts = new Set<number>();

function cancelPlayback(allVoices = false): number {
  const generation = ++playbackGeneration;
  Transport.stop();
  Transport.cancel(0);
  Transport.position = 0;
  additiveReleaseTimeouts.forEach(id => getContext().clearTimeout(id));
  additiveReleaseTimeouts.clear();
  if (allVoices) stopAllVoices();
  else releasePlaybackVoices();
  return generation;
}

function cancelAllSounds(): void {
  cancelPlayback(true);
}

const toNote = (note: number | string): string =>
  typeof note === 'number' ? Frequency(note, 'midi').toNote() : note;

function velocityFor(event: NoteEvent): number {
  const defaultVelocity = event.voice === 'bass' ? 0.65 : 0.8;
  return Number.isFinite(event.velocity)
    ? Math.min(1, Math.max(0, event.velocity!))
    : defaultVelocity;
}

async function scheduleNotes(events: NoteEvent[]): Promise<void> {
  const generation = cancelPlayback();
  const validEvents = events.filter(
    event =>
      Number.isFinite(event.time) &&
      event.time >= 0 &&
      Number.isFinite(event.duration) &&
      event.duration > 0 &&
      (typeof event.note === 'string' || Number.isFinite(event.note)) &&
      (event.guitarString === undefined ||
        (Number.isInteger(event.guitarString) &&
          event.guitarString >= 0 &&
          event.guitarString <= 5))
  );
  if (!validEvents.length) return;

  const guitarInstruments = new Set(
    validEvents
      .filter(event => event.guitarString !== undefined)
      .map(event => event.instrument ?? 'guitar-acoustic')
  );
  if (guitarInstruments.size > 1) {
    throw new Error('A playback must use one guitar instrument.');
  }
  if (
    [...guitarInstruments].some(
      instrument =>
        instrument !== 'guitar-acoustic' && instrument !== 'guitar-nylon'
    )
  ) {
    throw new Error('Unknown guitar instrument.');
  }

  // Tone.start runs from the originating click, before waiting for sample loading.
  try {
    await ensureAudioStarted();
  } catch (error) {
    if (generation === playbackGeneration) throw error;
    return;
  }
  if (generation !== playbackGeneration) return;
  const managers = validEvents.map(event =>
    event.guitarString !== undefined
      ? getGuitarStringInstance(event.guitarString, event.instrument)
      : event.voice === 'bass'
        ? getBassInstance()
        : getSamplerInstance()
  );
  try {
    // Muted/unused strings and the foreground piano do not block guitar loads.
    await Promise.all([...new Set(managers)].map(manager => manager.ready));
  } catch (error) {
    if (generation === playbackGeneration) {
      cancelPlayback();
      throw error;
    }
    return;
  }
  if (
    generation !== playbackGeneration ||
    managers.some(manager => !manager.loaded)
  ) {
    return;
  }

  const stringAttacks = new Map<number, number>();
  validEvents.forEach((event, index) => {
    const manager = managers[index];
    const note = toNote(event.note);
    Transport.schedule(time => {
      if (generation !== playbackGeneration || !manager.loaded) return;
      if (event.guitarString !== undefined) {
        // A string can ring one note at a time. Its old release must not cut
        // off a subsequent strum of the same pitch on that physical string.
        manager.sampler.releaseAll(time);
        stringAttacks.set(event.guitarString, index);
      }
      manager.sampler.triggerAttack(note, time, velocityFor(event));
    }, event.time);
    // Own the release schedule, so cancelled synth notes cannot later release
    // a new note of the same pitch through PolySynth's internal delayed timer.
    Transport.schedule(time => {
      if (
        generation === playbackGeneration &&
        manager.loaded &&
        (event.guitarString === undefined ||
          stringAttacks.get(event.guitarString) === index)
      ) {
        manager.sampler.triggerRelease(note, time);
      }
    }, event.time + event.duration);
  });
  Transport.start(now(), 0);
}

function safeBeatDuration(bpm: number): number {
  return 60 / (Number.isFinite(bpm) && bpm > 0 ? bpm : 60);
}

function safeDelay(delay: number): number {
  return Number.isFinite(delay) ? Math.max(0, delay) : 0.05;
}

function playNotes(
  input: number | string | Array<number | string>,
  delay = 0.05,
  bpm = 60
): number {
  const notes = Array.isArray(input) ? input : [input];
  const duration = safeBeatDuration(bpm);
  const startDelay = safeDelay(delay);
  void scheduleNotes(
    notes.map((note, index) => ({
      note,
      time: index * duration + startDelay,
      duration,
    }))
  ).catch(error => console.warn('Audio could not start.', error));
  return notes.length * duration + startDelay;
}

function playNotesTogether(
  input: number | string | Array<number | string>,
  delay = 0.05,
  bpm = 60
): number {
  const notes = Array.isArray(input) ? input : [input];
  const duration = safeBeatDuration(bpm);
  const startDelay = safeDelay(delay);
  void scheduleNotes(
    notes.map(note => ({
      note,
      time: startDelay,
      duration,
    }))
  ).catch(error => console.warn('Audio could not start.', error));
  return duration + startDelay;
}

function playNotesAdditive(
  input: number | string | Array<number | string>,
  duration = '8n'
): void {
  const generation = playbackGeneration;
  const notes = (Array.isArray(input) ? input : [input]).map(toNote);
  const seconds = Time(duration).toSeconds();
  if (!notes.length || !Number.isFinite(seconds) || seconds <= 0) return;
  void ensureAudioStarted()
    .then(async () => {
      const manager = getSamplerInstance();
      await manager.ready;
      if (generation !== playbackGeneration || !manager.loaded) return;
      const sampler = manager.sampler;
      sampler.triggerAttack(notes, now(), 0.8);
      const id = getContext().setTimeout(() => {
        additiveReleaseTimeouts.delete(id);
        if (generation === playbackGeneration && !sampler.disposed) {
          sampler.triggerRelease(notes, now());
        }
      }, seconds);
      additiveReleaseTimeouts.add(id);
    })
    .catch(error => console.warn('Audio could not start.', error));
}

export {
  playNotes,
  cancelAllSounds,
  playNotesTogether,
  scheduleNotes,
  playNotesAdditive,
};
