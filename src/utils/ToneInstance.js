// toneInstance.js
import { note } from 'tonal';
import {SampleLibrary} from '@utils/SampleLibrary'; 
import * as Tone from 'tone';
import { Note } from 'tonal';
const audioCache = {};
let sampler = null;
let droneInstance = null;
let samplerChorus = new Tone.Chorus(4, 20, 1);
let samplerGainNode = new Tone.Gain(0.5);
let answerGainNode = new Tone.Gain(0.5);
let samplerReverb = new Tone.Reverb({
  decay: 1,
  wet: 1,
}).toDestination();
let samplerFilter = new Tone.Filter({
  type: "bandpass",

});


Tone.getContext().lookAhead = 0;
function getSamplerInstance() {
  if (!sampler) {
    sampler = SampleLibrary.load({
      instruments: 'bass-electric', // Default instrument
      baseUrl: '/samples/', // Adjust path to your samples directory,
      quality: 'medium'
    });
    sampler.connect(samplerGainNode);
    samplerGainNode.connect(samplerChorus);
    samplerChorus.connect(samplerReverb);
    sampler.chain(samplerFilter,samplerReverb);
  }

  function setVolume(value) {
    const clampedValue = Math.min(1, Math.max(0, value)); // Clamp between 0 and 1
    samplerGainNode.gain.value = clampedValue;
  }

  async function changeSampler(instrumentName,quality='low') {
    // Load the new instrument
    const newSampler = SampleLibrary.load({
      instruments: instrumentName,
      baseUrl: '/samples/', // Adjust path to your samples directory
      quality: quality
    });

    // Wait for the new instrument samples to load
    await Tone.loaded();

    // Disconnect the old sampler and connect the new one
    sampler.disconnect();
    newSampler.connect(samplerGainNode);
    sampler.dispose();

    // Replace the current sampler with the new one
    sampler = newSampler;
    console.log(`Sampler changed to: ${instrumentName}`);
  }

  return {
    sampler: sampler,
    setVolume,
    changeSampler
  };
}

function getDroneInstance() {
  let masterGainNode = null;
  let rootMax = Tone.Frequency("C5").toMidi();
  let rootMin = Tone.Frequency("C2").toMidi();
  if (!droneInstance) {
    const droneSampler = SampleLibrary.load({
      instruments: 'contrabass', // Default instrument
      baseUrl: '/samples/',
      quality: 'medium'
    });

    const compressor = new Tone.Compressor({
      threshold: -20,
      ratio: 4,
      attack: 0.003,
      release: 0.25
    });

    const reverb = new Tone.Reverb({
      decay: 2,
      preDelay: 0.01
    }).toDestination();

    const filter = new Tone.Filter({
      frequency: 400,
      type: "lowpass",
      rolloff: -12
    });

    masterGainNode = new Tone.Gain(0.8);

    // Connect the effects chain
    droneSampler.chain(masterGainNode,samplerFilter,samplerReverb)

    let intervalId = null;
    let rootPlaying = false;

    function start() {
      if (droneSampler.loaded) {
        // Play root continuously
        rootPlaying = true;
        
        // Create interval with random timing between 5-10 seconds
        const playNextNote = () => {
          const now = Tone.now();
          droneSampler.triggerAttack(currentRoot, now);
          
          // Schedule next note with random delay
          const nextInterval = Math.random() * 2000 + 3000; // 5000-10000ms (5-10 seconds)
          intervalId = setTimeout(playNextNote, nextInterval);
        };
        
        // Start the first note
        playNextNote();
      }
    }

    function stop() {
      if (droneSampler.loaded) {
        // Clear the timeout
        if (intervalId) {
          clearTimeout(intervalId);
          intervalId = null;
        }
        
        // Release the root note
        if (rootPlaying) {
          droneSampler.triggerRelease(currentRoot, Tone.now() + 0.5);

          rootPlaying = false;
        }
      }
    }

    function setVolume(value) {
      const clampedValue = Math.min(1, Math.max(0, value));
      masterGainNode.gain.value = clampedValue * 0.35;
    }

    let currentRoot = "C2";
    let currentFifth = "G2";
    let currentOctave = "C3";

    function updateRoot(rootNote) {
      if (typeof rootNote === "number") {
        rootNote = Note.fromMidi(rootNote);
      }
      
      // Release any currently playing notes
      if (rootPlaying) {
        droneSampler.triggerRelease([currentRoot, currentFifth, currentOctave], Tone.now() + 0.1);
      }
      
      currentRoot = rootNote;
      currentFifth = Note.transpose(rootNote, "P5");
      currentOctave = Note.transpose(rootNote, "P8");
      
      // Immediately play the new root note
      if (droneSampler.loaded) {
        droneSampler.triggerAttack(currentRoot, Tone.now() + 0.15);
      }
      
      // If the loop is running, it will automatically use the new notes
      // on its next iteration.
    }

    droneInstance = {
      start,
      stop,
      setVolume,
      updateRoot,
      rootMin,
      rootMax
    };
  }

  return droneInstance;
}


const preloadAudio = (degree) => {
  if (!audioCache[degree]) {
    audioCache[degree] = new Tone.Player(`/answers/${degree}.wav`).connect(answerGainNode);
    answerGainNode.toDestination();
  }
  return audioCache[degree];
};

const getAnswerGainNode = () => {
  return answerGainNode;
};
function playNotes(input, delay = 0.05, bpm = 60) {
  // 取消之前的播放
  const activeTransport = Tone.getTransport();
  if (activeTransport) {
    activeTransport.stop();
    activeTransport.cancel();
  }

  const pianoInstance = getSamplerInstance();
  const { sampler } = pianoInstance;

  // 处理 MIDI 输入和音符字符串输入
  const notes = Array.isArray(input) ? input : [input];
  notes.forEach((note, index) => {
    activeTransport.schedule((time) => {
      if (sampler.name == "PolySynth"||sampler._buffers && sampler._buffers.loaded) {
        // 检查是否为 MIDI 值
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
  // 取消之前的播放
  const activeTransport = Tone.getTransport();
  if (activeTransport) {
    activeTransport.stop();
    activeTransport.cancel();
  }

  const pianoInstance = getSamplerInstance();
  const { sampler } = pianoInstance;

  // 处理 MIDI 输入和音符字符串输入
  const notes = Array.isArray(input) ? input : [input];

  // 播放和弦音符
  activeTransport.schedule((time) => {
    if (sampler.name == "PolySynth"||sampler._buffers && sampler._buffers.loaded) {
      notes.forEach(note => {
        // 检查是否为 MIDI 值
        if (typeof note === 'number') {
          sampler.triggerAttackRelease([Tone.Frequency(note, 'midi').toNote()], 60 / bpm, time);
        } else {
          sampler.triggerAttackRelease([note], 60 / bpm, time);
        }
      });
    }
  }, delay);

  activeTransport.start();
  return 60 /bpm + delay;
}


function cancelAllSounds() {
  const activeTransport = Tone.getTransport();

  if (activeTransport) {
    activeTransport.stop();
    activeTransport.cancel();
  }
}

export { getSamplerInstance, getDroneInstance, preloadAudio, playNotes, cancelAllSounds, playNotesTogether, getAnswerGainNode };
