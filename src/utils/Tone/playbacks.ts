import { Transport, Frequency, Time, getContext, now } from 'tone';
import {
  getSamplerInstance,
  getBassInstance,
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
      (typeof event.note === 'string' || Number.isFinite(event.note))
  );
  if (!validEvents.length) return;

  // Tone.start runs from the originating click, before waiting for sample loading.
  await ensureAudioStarted();
  if (validEvents.some(event => event.voice !== 'bass')) {
    await getSamplerInstance().ready;
  }
  if (generation !== playbackGeneration) return;

  validEvents.forEach(event => {
    const manager =
      event.voice === 'bass' ? getBassInstance() : getSamplerInstance();
    const note = toNote(event.note);
    Transport.schedule(time => {
      if (generation !== playbackGeneration || !manager.loaded) return;
      manager.sampler.triggerAttack(note, time, velocityFor(event));
    }, event.time);
    // Own the release schedule, so cancelled synth notes cannot later release
    // a new note of the same pitch through PolySynth's internal delayed timer.
    Transport.schedule(time => {
      if (generation === playbackGeneration && manager.loaded) {
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
