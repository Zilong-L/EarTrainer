import { Transport, Frequency } from 'tone';
import { getSamplerInstance } from './samplers';

interface NoteEvent {
  note: number | string;
  time: number;
  duration: number;
}

function playNotes(
  input: number | string | Array<number | string>,
  delay: number = 0.05,
  bpm: number = 60
): number {
  const activeTransport = Transport;
  if (activeTransport) {
    activeTransport.stop();
    activeTransport.cancel();
  }

  const { sampler } = getSamplerInstance();
  const notes = Array.isArray(input) ? input : [input];

  notes.forEach((note, index) => {
    activeTransport.schedule(
      time => {
        if (
          sampler.name === 'PolySynth' ||
          sampler.name === 'Synth' ||
          (sampler as any)._buffers?.loaded
        ) {
          if (typeof note === 'number') {
            sampler.triggerAttackRelease(
              [Frequency(note, 'midi').toNote()],
              60 / bpm,
              time
            );
          } else {
            sampler.triggerAttackRelease([note], 60 / bpm, time);
          }
        }
      },
      `+${index * (60 / bpm) + delay}`
    );
  });

  activeTransport.start();
  return notes.length * (60 / bpm) + delay;
}

function playNotesTogether(
  input: number | string | Array<number | string>,
  delay: number = 10,
  bpm: number = 60
): number {
  const activeTransport = Transport;
  if (activeTransport) {
    activeTransport.stop();
    activeTransport.cancel();
  }

  const { sampler } = getSamplerInstance();
  const notes = Array.isArray(input) ? input : [input];

  activeTransport.schedule(time => {
    if (
      sampler.name === 'PolySynth' ||
      sampler.name === 'Synth' ||
      (sampler as any)._buffers?.loaded
    ) {
      notes.forEach(note => {
        if (typeof note === 'number') {
          sampler.triggerAttackRelease(
            [Frequency(note, 'midi').toNote()],
            60 / bpm,
            time
          );
        } else {
          sampler.triggerAttackRelease([note], 60 / bpm, time);
        }
      });
    }
  }, delay);

  activeTransport.start();
  return 60 / bpm + delay;
}

function cancelAllSounds(): void {
  const activeTransport = Transport;
  if (activeTransport) {
    activeTransport.stop();
    activeTransport.cancel();
  }
}

function scheduleNotes(events: NoteEvent[]): void {
  const activeTransport = Transport;
  if (activeTransport) {
    activeTransport.stop();
    activeTransport.cancel();
  }

  const { sampler } = getSamplerInstance();

  events.forEach(event => {
    const { note, time, duration } = event;
    activeTransport.schedule(transportTime => {
      if (typeof note === 'number') {
        sampler.triggerAttackRelease(
          Frequency(note, 'midi').toNote(),
          duration,
          transportTime
        );
      } else {
        sampler.triggerAttackRelease(note, duration, transportTime);
      }
    }, time);
  });

  if (activeTransport.state !== 'started') {
    activeTransport.start();
  }
}

function playNotesAdditive(
  input: number | string | Array<number | string>,
  duration: string = '8n'
): void {
  const { sampler } = getSamplerInstance();
  const notes = Array.isArray(input) ? input : [input];

  if (
    sampler.name === 'PolySynth' ||
    sampler.name === 'Synth' ||
    (sampler as any)._buffers?.loaded
  ) {
    const notesToPlay = notes.map(note =>
      typeof note === 'number' ? Frequency(note, 'midi').toNote() : note
    );
    sampler.triggerAttackRelease(notesToPlay, duration);
  }
}

export {
  playNotes,
  cancelAllSounds,
  playNotesTogether,
  scheduleNotes,
  playNotesAdditive,
};
