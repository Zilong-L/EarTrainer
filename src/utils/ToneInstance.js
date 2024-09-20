// toneInstance.js
import { note } from 'tonal';
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
    pianoSampler = new Tone.PolySynth()
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
    const rootOscillator = new Tone.OmniOscillator("C2", "sine");
    const fifthOscillator = new Tone.OmniOscillator("G2", "sine");
    const octaveOscillator = new Tone.OmniOscillator("C3", "sine");
    // 创建压缩器
    const compressor = new Tone.Compressor({
      threshold: -20, // 阈值，单位为分贝
      ratio: 4,        // 压缩比例
      attack: 0.003,  // 攻击时间，单位为秒
      release: 0.25    // 释放时间，单位为秒
    })

    const rootGain = new Tone.Gain(0.8);
    const fifthGain = new Tone.Gain(0.3);
    const octaveGain = new Tone.Gain(0.3);

    const reverb = new Tone.Reverb({
      decay: 50,
      preDelay: 0.01
    }).toDestination();

    // const chorus = new Tone.Chorus(4, 2.5, 1.0).start();

    const filter = new Tone.Filter({
      frequency: 400,
      type: "lowpass",
      rolloff: -12
    });

    masterGainNode = new Tone.Gain(1.0)

    // 连接振荡器到各自的增益节点
    rootOscillator.connect(rootGain);
    fifthOscillator.connect(fifthGain);
    octaveOscillator.connect(octaveGain);
    // 连接增益节点到压缩器
    rootGain.connect(compressor);
    fifthGain.connect(compressor);
    octaveGain.connect(compressor);
    // 连接压缩器到主增益节点
    compressor.connect(masterGainNode);

    // 连接主增益节点到过滤器，然后到混响，最后到压缩器的目的地
    masterGainNode.connect(filter);
    filter.connect(reverb);
    // 现在直接连接到 destination
    

    const lfo = new Tone.LFO({
      frequency: 0.1,
      min: -5,
      max: 5
    }).start();

    lfo.connect(rootOscillator.detune);
    lfo.connect(fifthOscillator.detune);

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
      masterGainNode.gain.value = clampedValue * 0.35;
    }

    function updateRoot(rootMidiValue) {
      if(rootMidiValue > rootMax || rootMidiValue < rootMin){
        return;
      }
      const rootNote = Tone.Frequency(rootMidiValue, "midi").toNote();
      const fifthNote = Tone.Frequency(rootMidiValue + 7, "midi").toNote();
      const ocataveNote = Tone.Frequency(rootMidiValue + 12, "midi").toNote();
      rootOscillator.frequency.value = rootNote;
      fifthOscillator.frequency.value = fifthNote;
      octaveOscillator.frequency.value = ocataveNote;
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



function playNotes(input, delay = 0.05, bpm = 60) {
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

  const pianoInstance = getPianoInstance();
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

export { getPianoInstance, getDroneInstance, playNotes, cancelAllSounds,playNotesTogether };
