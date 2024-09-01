// toneInstance.js
import * as Tone from 'tone';
let pianoSampler = null;
let droneInstance = null;

let pianoGainNode = null
function getPianoGainNode() {
  if (!pianoGainNode) {
    pianoGainNode = new Tone.Gain(0.5).toDestination(); // Initialize with a default volume (0.5)
  }
  return pianoGainNode;
}
function getPianoInstance() {
  
  if (!pianoSampler) {
    pianoSampler = new Tone.Sampler({
      urls: {
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
    });
    pianoSampler.connect(getPianoGainNode());
  }
  function setVolume(value) {
    const clampedValue = Math.min(1, Math.max(0, value)); // Clamp between 0 and 1
    getPianoGainNode().gain.value = clampedValue; // Map to 0-0
  }
  return {
    sampler: pianoSampler,
    setVolume
  };
}

function getDroneInstance() {
  let masterGainNode = null;
  let rootMax = Tone.Frequency("C5").toMidi();
  let rootMin = Tone.Frequency("C2").toMidi();
  if (!droneInstance) {
    const rootOscillator = new Tone.Oscillator("C2", "sine");
    const octaveOscillator = new Tone.Oscillator("C3", "sine");
    const fifthOscillator = new Tone.Oscillator("G2", "sine");

    const rootGain = new Tone.Gain(0.8);
    const octaveGain = new Tone.Gain(0.2);
    const fifthGain = new Tone.Gain(0.1);

    // Create a limiter to prevent distortion
    const limiter = new Tone.Limiter(-10).toDestination();

    // Adjust the master gain node as needed
    masterGainNode = new Tone.Gain(0.35);

    rootOscillator.connect(rootGain);
    octaveOscillator.connect(octaveGain);
    fifthOscillator.connect(fifthGain);

    rootGain.connect(masterGainNode);
    octaveGain.connect(masterGainNode);
    fifthGain.connect(masterGainNode);

    // Connect the master gain to the limiter
    masterGainNode.connect(limiter);

    function start() {
      rootOscillator.start();
      octaveOscillator.start();
      fifthOscillator.start();
    }

    function stop() {
      rootOscillator.stop();
      octaveOscillator.stop();
      fifthOscillator.stop();
    }

    function setVolume(value) {
      const clampedValue = Math.min(1, Math.max(0, value));
      masterGainNode.gain.value = clampedValue * 0.35; // Adjusted volume
    }

    // Create an updateRoot function to change the root note
    function updateRoot(rootMidiValue) {
      if(rootMidiValue > rootMax || rootMidiValue < rootMin){
        return
      }
      // Define the new root, octave, and fifth based on the root MIDI value
      const rootNote = Tone.Frequency(rootMidiValue, "midi").toNote();
      const octaveNote = Tone.Frequency(rootMidiValue + 12, "midi").toNote();
      const fifthNote = Tone.Frequency(rootMidiValue + 7, "midi").toNote();

      // Update oscillator frequencies
      rootOscillator.frequency.value = rootNote;
      octaveOscillator.frequency.value = octaveNote;
      fifthOscillator.frequency.value = fifthNote;
    }

    // Return the drone instance with start, stop, setVolume, and updateRoot functions
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


function playNotes(input, delay = 0, bpm = 60) {
  // 取消之前的播放
  const activeTransport = Tone.getTransport();
  if (activeTransport) {
    activeTransport.stop();
    activeTransport.cancel();
  }

  const pianoInstance = getPianoInstance();
  const { sampler } = pianoInstance;

  // 处理 MIDI 输入和音符字符串输入
  const notes = Array.isArray(input) ? input : [input];

  notes.forEach((note, index) => {
    activeTransport.schedule((time) => {
      if (sampler._buffers && sampler._buffers.loaded) {
        // 检查是否为 MIDI 值
        if (typeof note === 'number') {
          sampler.triggerAttackRelease(Tone.Frequency(note, 'midi').toNote(), 60 / bpm, time);
        } else {
          sampler.triggerAttackRelease(note, 60 / bpm, time);
        }
      }
    }, `+${index * (60 / bpm) + delay}`);
  });

  activeTransport.start();
}

function playNotesTogether(input, delay = 0, bpm = 60) {
  // 取消之前的播放
  const activeTransport = Tone.getTransport();
  if (activeTransport) {
    activeTransport.stop();
    activeTransport.cancel();
  }

  const pianoInstance = getPianoInstance();
  const { sampler } = pianoInstance;

  // 处理 MIDI 输入和音符字符串输入
  const notes = Array.isArray(input) ? input : [input];

  // 播放和弦音符
  activeTransport.schedule((time) => {
    if (sampler._buffers && sampler._buffers.loaded) {
      notes.forEach(note => {
        // 检查是否为 MIDI 值
        if (typeof note === 'number') {
          sampler.triggerAttackRelease(Tone.Frequency(note, 'midi').toNote(), 60 / bpm, time);
        } else {
          sampler.triggerAttackRelease(note, 60 / bpm, time);
        }
      });
    }
  }, delay);

  activeTransport.start();
}


function cancelAllSounds() {
  const activeTransport = Tone.getTransport();

  if (activeTransport) {
    activeTransport.stop();
    activeTransport.cancel();
  }
}

export { getPianoInstance, getDroneInstance, playNotes, cancelAllSounds,playNotesTogether };
