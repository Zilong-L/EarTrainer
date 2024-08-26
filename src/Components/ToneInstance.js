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
  let rootMax = Tone.Frequency("C5").toMidi()
  let rootMin = Tone.Frequency("C2").toMidi()
  if (!droneInstance) {
    // Initialize the oscillators with updated names
    const rootOscillator = new Tone.Oscillator("C2", "sine");
    const octaveOscillator = new Tone.Oscillator("C3", "sine"); // First harmonic
    const fifthOscillator = new Tone.Oscillator("G2", "sine"); // Second harmonic

    // Initialize gain nodes for each part
    const rootGain = new Tone.Gain(0.8); // Strongest component
    const octaveGain = new Tone.Gain(0.2); // Quieter harmonic
    const fifthGain = new Tone.Gain(0.1); // Even quieter harmonic

    // Create a master gain node to control overall volume
    masterGainNode = new Tone.Gain(0.075).toDestination(); // Default volume at midpoint

    // Connect oscillators to their respective gain nodes
    rootOscillator.connect(rootGain);
    octaveOscillator.connect(octaveGain);
    fifthOscillator.connect(fifthGain);

    // Connect gain nodes to the master gain node
    rootGain.connect(masterGainNode);
    octaveGain.connect(masterGainNode);
    fifthGain.connect(masterGainNode);

    // Create a start function that starts all oscillators
    function start() {
      rootOscillator.start();
      octaveOscillator.start();
      fifthOscillator.start();
    }

    // Create a stop function that stops all oscillators
    function stop() {
      rootOscillator.stop();
      octaveOscillator.stop();
      fifthOscillator.stop();
    }

    // Create a setVolume function that maps 0-1 to 0-0.15
    function setVolume(value) {
      const clampedValue = Math.min(1, Math.max(0, value)); // Clamp between 0 and 1
      masterGainNode.gain.value = clampedValue * 0.35; // Map to 0-0.15
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



export { getPianoInstance,  getDroneInstance };
