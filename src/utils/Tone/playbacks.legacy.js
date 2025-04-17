// toneInstance.js
import * as Tone from 'tone';
import { getSamplerInstance, globalChorous, getAnswerGainNode } from './samplers';
function playNotes(input, delay = 0.05, bpm = 60) {
  // Cancel previous playback
  const activeTransport = Tone.getTransport();
  if (activeTransport) {
    activeTransport.stop();
    activeTransport.cancel();
  }

  const { sampler } = getSamplerInstance();

  // Handle MIDI input and note string input
  const notes = Array.isArray(input) ? input : [input];
  notes.forEach((note, index) => {
    activeTransport.schedule((time) => {
      if (sampler.name == "PolySynth" || sampler.name == "Synth" || sampler._buffers && sampler._buffers.loaded) {
        // Check if it's a MIDI value
        if (typeof note === 'number') {
          sampler.triggerAttackRelease([Tone.Frequency(note, 'midi').toNote()], 60 / bpm, time);
        } else {
          sampler.triggerAttackRelease([note], 60 / bpm, time);
        }
      }
    }, `+${index * (60 / bpm) + delay}`);
  });

  activeTransport.start();
  return notes.length * (60 / bpm) + delay;
}

function playNotesTogether(input, delay = 10, bpm = 60) {
  // Cancel previous playback
  const activeTransport = Tone.getTransport();
  if (activeTransport) {
    activeTransport.stop();
    activeTransport.cancel();
  }

  const { sampler } = getSamplerInstance();

  // Handle MIDI input and note string input
  const notes = Array.isArray(input) ? input : [input];

  // Play chord notes
  activeTransport.schedule((time) => {
    if (sampler.name == "PolySynth" || sampler.name == "Synth" || sampler._buffers && sampler._buffers.loaded) {
      notes.forEach(note => {
        // Check if it's a MIDI value
        if (typeof note === 'number') {
          sampler.triggerAttackRelease([Tone.Frequency(note, 'midi').toNote()], 60 / bpm, time);
        } else {
          sampler.triggerAttackRelease([note], 60 / bpm, time);
        }
      });
    }
  }, delay);

  activeTransport.start();
  return 60 / bpm + delay;
}


function cancelAllSounds() {
  const activeTransport = Tone.getTransport();

  if (activeTransport) {
    activeTransport.stop();
    activeTransport.cancel();
  }
}
function scheduleNotes(events) {
  const activeTransport = Tone.getTransport();
  if (activeTransport) {
    activeTransport.stop();
    activeTransport.cancel();
  }

  const pianoInstance = getSamplerInstance();
  const { sampler } = pianoInstance;

  events.forEach(event => {
    const { note, time, duration } = event;
    activeTransport.schedule((transportTime) => {
      if (typeof note === 'number') {  // Handle MIDI numbers
        sampler.triggerAttackRelease(Tone.Frequency(note, 'midi').toNote(), duration, transportTime);
      } else {
        sampler.triggerAttackRelease(note, duration, transportTime);
      }
    }, time);  // Schedule at the specified time
  });

  if (activeTransport.state !== 'started') {
    activeTransport.start();
  }
}



export { playNotes, cancelAllSounds, playNotesTogether, scheduleNotes };
