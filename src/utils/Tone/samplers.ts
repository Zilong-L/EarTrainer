import { SampleLibrary } from '@utils/Tone/SampleLibrary';
import * as Tone from 'tone';
import { Note } from 'tonal';


interface DroneInstance {
    sampler: SamplerManager;
    start: () => void;
    stop: () => void;
    playOnce: () => void;
    setVolume: (value: number) => void;
    updateRoot: (rootNote: number | string) => void;
}

let answerGainNode: Tone.Gain = new Tone.Gain(0.5).toDestination();

let globalChorous: Tone.Chorus = new Tone.Chorus({
    frequency: 0.1,
    delayTime: 10,
    depth: 0.71,
    feedback: 0.47,
    spread: 181,
    wet: 1.0
}).connect(Tone.getDestination());
Tone.getContext().lookAhead = 0;

class SamplerManager {
    sampler: Tone.Sampler;
    filter: Tone.Filter;
    gainNode: Tone.Gain;
    panner: Tone.Panner;

    constructor(instrument: string = "triangle", quality: string = "medium", filterFreq: number = 1200, panVal: number = 0) {
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

    setVolume(value: number): void {
        this.gainNode.gain.rampTo(Math.min(1, value * 0.7));
    }

    setFilterFrequency(freq: number): void {
        this.filter.frequency.rampTo(freq, 0.1);
    }

    setPortamento(value: number): void {
        (this.sampler as any).portamento = value;
    }

    setPan(value: number): void {
        this.panner.pan.rampTo(value, 0.1);
    }

    async changeSampler(instrumentName: string, quality: string = "low"): Promise<void> {
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

const getSamplerInstance = ((): () => SamplerManager => {
    let globalSampler: SamplerManager | null = null;
    return (): SamplerManager => {
        if (!globalSampler) {
            globalSampler = new SamplerManager("triangle");
            globalSampler.sampler.connect(globalChorous);
        }
        return globalSampler;
    };
})();

const getDroneInstance = ((): () => DroneInstance => {
    let droneInstance: DroneInstance | null = null;
    return (): DroneInstance => {
        if (!droneInstance) {
            const sampler = new SamplerManager('triangle');
            const droneSynth = sampler.sampler;

            let rootPlaying = false;
            let currentRoot = "C2";

            function start(): void {
                if (!rootPlaying) {
                    rootPlaying = true;
                    droneSynth.triggerAttack(currentRoot, Tone.now());
                }
            }

            function stop(): void {
                if (rootPlaying) {
                    droneSynth.triggerRelease(currentRoot, Tone.now());
                    rootPlaying = false;
                }
            }

            function playOnce(): void {
                droneSynth.triggerAttackRelease(currentRoot, 1, Tone.now());
            }

            function updateRoot(rootNote: number | string): void {
                if (typeof rootNote === "number") {
                    rootNote = Note.fromMidi(rootNote);
                }
                droneSynth.triggerRelease(currentRoot, Tone.now());
                currentRoot = rootNote as string;
                if (!rootPlaying) { return; }
                droneSynth.triggerAttack(rootNote as string, Tone.now());
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
    };
})();

const preloadAudio = ((): (path: string) => Tone.Player | null => {
    let cache: Record<string, Tone.Player> = {};
    return (path: string): Tone.Player | null => {
        if (!path) {
            return null;
        }
        if (cache[path]) {
            return cache[path];
        }
        cache[path] = new Tone.Player(path).connect(answerGainNode);
        return cache[path];
    };
})();

const getAnswerGainNode = (): Tone.Gain => {
    return answerGainNode;
};

function main(): void {
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
