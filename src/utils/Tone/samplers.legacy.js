import { SampleLibrary } from '@utils/Tone/SampleLibrary';
import * as Tone from 'tone';
import { Note } from 'tonal';

let answerGainNode = new Tone.Gain(0.5).toDestination();

let globalChorous = new Tone.Chorus({
    frequency: 0.1,
    delayTime: 10,
    depth: 0.71,
    feedback: 0.47,
    spread: 181,
    wet: 1.0
}).connect(Tone.getDestination());
Tone.getContext().lookAhead = 0;

class SamplerManager {
    constructor(instrument = "triangle", quality = "medium", filterFreq = 1200, panVal = 0) {
        console.log(`Loading ${instrument} sampler...`);
        this.sampler = SampleLibrary.load({
            instruments: instrument,
            baseUrl: "/samples/",
            quality: quality
        });



        this.filter = new Tone.Filter({ frequency: filterFreq, type: "lowpass", rolloff: -12 });
        this.gainNode = new Tone.Gain(0.5);
        this.panner = new Tone.Panner(panVal);

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
        console.log(`Loading ${instrumentName} sampler...`);
        const newSampler = SampleLibrary.load({
            instruments: instrumentName,
            baseUrl: "/samples/",
            quality: quality
        });

        await Tone.loaded();
        console.log(`${instrumentName} sampler loaded (via Tone.loaded).`);
        this.sampler.disconnect();
        newSampler.chain(this.filter, this.panner, this.gainNode, globalChorous);
        this.sampler.dispose();
        this.sampler = newSampler;
    }
}

const getSamplerInstance = (() => {
    let globalSampler = null;
    return () => {
        if (!globalSampler) {
            globalSampler = new SamplerManager("triangle");
            globalSampler.sampler.connect(globalChorous);
        }
        return globalSampler;
    }
})();

const getDroneInstance = (() => {
    let droneInstance = null;
    return () => {
        if (!droneInstance) {
            const sampler = new SamplerManager('triangle');
            const droneSynth = sampler.sampler;

            let rootPlaying = false;
            let currentRoot = "C2";

            function start() {
                if (!rootPlaying) {
                    rootPlaying = true;
                    droneSynth.triggerAttack(currentRoot, Tone.now());
                }
            }

            function stop() {
                if (rootPlaying) {
                    droneSynth.triggerRelease(currentRoot, Tone.now());
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
                droneSynth.triggerAttack(rootNote, Tone.now());
            }

            droneInstance = {
                sampler,
                start,
                stop,
                playOnce,
                setVolume: sampler.setVolume.bind(sampler),
                updateRoot,
            };
        }
        return droneInstance;
    }
})();

const preloadAudio = (() => {
    let cache = {};
    return (path) => {
        if (!path) {
            return null;
        }
        if (cache[path]) {
            return cache[path];
        }
        cache[path] = new Tone.Player(path).connect(answerGainNode);
        return cache[path];
    }
})();

const getAnswerGainNode = () => {
    return answerGainNode;
};
function main() {
    getSamplerInstance();
}
main();
export {
    getSamplerInstance,
    getDroneInstance,
    preloadAudio,
    getAnswerGainNode,
    globalChorous
};
