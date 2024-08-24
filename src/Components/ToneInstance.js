// toneInstance.js
import * as Tone from 'tone';

let pianoSampler = null;
let toneInstance = null;
let droneInstance = null;

let pianoGainNode = null
let droneGainNode = null;


function getPianoSampler() {
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
  return pianoSampler;
}
function getPianoGainNode() {
  if (!pianoGainNode) {
    pianoGainNode = new Tone.Gain(0.5).toDestination(); // Initialize with a default volume (0.5)
  }
  return pianoGainNode;
}
function getToneInstance() {
  if (!toneInstance) {
    toneInstance = Tone; // Assign the Tone.js library as the global instance
  }
  return toneInstance;
}


function getDroneInstance() {
  let masterGainNode = null;

  if (!droneInstance) {
    // Initialize the oscillators
    const C2 = new Tone.Oscillator("C2", "sine");
    const C3 = new Tone.Oscillator("C3", "sine"); // First harmonic
    const G2 = new Tone.Oscillator("G2", "sine"); // Second harmonic
    const E3 = new Tone.Oscillator("E3", "sine"); // Second harmonic

    // Initialize gain nodes for each part
    const C2Gain = new Tone.Gain(0.8); // Strongest component
    const C3Gain = new Tone.Gain(0.2); // Quieter harmonic
    const G2Gain = new Tone.Gain(0.1); // Even quieter harmonic

    // Create a master gain node to control overall volume
    masterGainNode = new Tone.Gain(0.075).toDestination(); // Default volume at midpoint

    // Connect oscillators to their respective gain nodes
    C2.connect(C2Gain);
    C3.connect(C3Gain);
    G2.connect(G2Gain);

    // Connect gain nodes to the master gain node
    C2Gain.connect(masterGainNode);
    C3Gain.connect(masterGainNode);
    G2Gain.connect(masterGainNode);

    // Create a start function that starts all oscillators
    function start() {
      C2.start();
      C3.start();
      G2.start();
    }

    // Create a stop function that stops all oscillators
    function stop() {
      C2.stop();
      C3.stop();
      G2.stop();
    }

    // Create a setVolume function that maps 0-1 to 0-0.15
    function setVolume(value) {
      const clampedValue = Math.min(1, Math.max(0, value)); // Clamp between 0 and 1
      masterGainNode.gain.value = clampedValue * 0.15; // Map to 0-0.15
    }

    // Return the drone instance with start, stop, and setVolume functions
    droneInstance = {
      start,
      stop,
      setVolume,
    };
  }

  return droneInstance;
}

export { getPianoSampler, getToneInstance, getDroneInstance, getPianoGainNode };
