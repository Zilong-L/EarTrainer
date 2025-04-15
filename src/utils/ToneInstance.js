// toneInstance.js
import { SampleLibrary } from '@utils/SampleLibrary';
import * as Tone from 'tone';
import { Note } from 'tonal';
let audioCache = null
let droneInstance = null;

let answerGainNode = new Tone.Gain(0.5).toDestination();

let pitchShifter = new Tone.PitchShift(0).connect(answerGainNode);
let globalChorous = new Tone.Chorus({
  frequency: 0.1,
  delayTime: 10,
  depth: 0.71,
  feedback: 0.47,
  spread: 181,
  wet: 1.0
}).connect(Tone.getDestination());
const shiftPicthAndPlay = (player, steps) => {
  pitchShifter.pitch = steps;
  player.start();
}



Tone.getContext().lookAhead = 0;
let globalSampler = null;

// **获取全局 Sampler**
function getSamplerInstance() {
  return globalSampler;
}

// **创建新的 Sampler**
class SamplerManager {
  constructor(instrument = "triangle", quality = "medium", filterFreq = 1200, panVal = 0) {
    this.sampler = SampleLibrary.load({
      instruments: instrument,
      baseUrl: "/samples/",
      quality: quality
    });

    // 添加效果
    this.filter = new Tone.Filter({ frequency: filterFreq, type: "lowpass", rolloff: -12 });
    this.gainNode = new Tone.Gain(0.5); // -6 dB
    this.panner = new Tone.Panner(panVal);

    // 连接音频链
    this.sampler.chain(this.filter, this.panner, this.gainNode, globalChorous);
  }

  setVolume(value) {
    this.gainNode.gain.rampTo(Math.min(1, value * 0.7));
  }

  setFilterFrequency(freq) {
    this.filter.frequency.rampTo(freq, 0.1);
  }
  setPortamento(value) {
    this.sampler.portamento = value;
  }

  setPan(value) {
    this.panner.pan.rampTo(value, 0.1);
  }

  async changeSampler(instrumentName, quality = "low") {
    const newSampler = SampleLibrary.load({
      instruments: instrumentName,
      baseUrl: "/samples/",
      quality: quality
    });

    await Tone.loaded();
    this.sampler.disconnect();
    newSampler.chain(this.filter, this.panner, this.gainNode, globalChorous);
    this.sampler.dispose();
    this.sampler = newSampler;
  }
}



function getDroneInstance() {
  let rootMax = Tone.Frequency("C5").toMidi();
  let rootMin = Tone.Frequency("C2").toMidi();

  if (!droneInstance) {
    const sampler = new SamplerManager('triangle'); // 载入 pad 采样器
    const droneSynth = sampler.sampler; // 获取 Tone.Sampler 实例

    let rootPlaying = false;
    let currentRoot = "C2"; // 初始音符

    function start() {
      if (!rootPlaying) {
        rootPlaying = true;
        droneSynth.triggerAttack(currentRoot, Tone.now()); // 使用音符名
      }
    }

    function stop() {
      if (rootPlaying) {
        droneSynth.triggerRelease(currentRoot, Tone.now()); // 使用音符名
        rootPlaying = false;
      }
    }

    function playOnce() {
      droneSynth.triggerAttackRelease(currentRoot, 1, Tone.now());
    }

    function updateRoot(rootNote) {
      if (typeof rootNote === "number") {
        rootNote = Note.fromMidi(rootNote);
      }
      droneSynth.triggerRelease(currentRoot, Tone.now());
      currentRoot = rootNote;
      if (!rootPlaying) { return; }
      // 计算当前根音与目标音之间的音高偏移（单位：半音）

      droneSynth.triggerAttack(rootNote, Tone.now());

    }

    droneInstance = {
      sampler,
      start,
      stop,
      playOnce,
      setVolume: sampler.setVolume.bind(sampler), // 确保正确绑定
      updateRoot,
      rootMin,
      rootMax
    };
  }

  return droneInstance;
}



const preloadAudio = () => {
  if (!audioCache) {
    audioCache = new Tone.Player('/answers/Solfege.mp3').connect(pitchShifter)
  }
  return audioCache;
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
  console.log(sampler)

  // 处理 MIDI 输入和音符字符串输入
  const notes = Array.isArray(input) ? input : [input];
  notes.forEach((note, index) => {
    activeTransport.schedule((time) => {
      if (sampler.name == "PolySynth" || sampler.name == "Synth" || sampler._buffers && sampler._buffers.loaded) {
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

    if (sampler.name == "PolySynth" || sampler.name == "Synth" || sampler._buffers && sampler._buffers.loaded) {
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

function main() {
  globalSampler = new SamplerManager("pad");
}

main();

export { getSamplerInstance, getDroneInstance, preloadAudio, playNotes, cancelAllSounds, playNotesTogether, getAnswerGainNode, shiftPicthAndPlay, globalChorous, scheduleNotes };  // Add scheduleNotes to exports
