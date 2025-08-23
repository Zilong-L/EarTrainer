import { SampleLibrary } from '@utils/Tone/SampleLibrary';
import { Gain, Chorus, getDestination, getContext, loaded, now, Filter, Panner, Player } from 'tone';
import { Note } from 'tonal';


interface DroneInstance {
    sampler: SamplerManager;
    start: () => void;
    stop: () => void;
    playOnce: () => void;
    setVolume: (value: number) => void;
    updateRoot: (rootNote: number | string) => void;
}

let answerGainNode: Gain = new Gain(0.5).toDestination();

let globalChorous: Chorus = new Chorus({
    frequency: 0.1,
    delayTime: 10,
    depth: 0.71,
    feedback: 0.47,
    spread: 181,
    wet: 1.0
}).connect(getDestination());
getContext().lookAhead = 0;

class SamplerManager {
    sampler: any;
    filter: Filter;
    gainNode: Gain;
    panner: Panner;

    constructor(instrument: string = "triangle", quality: string = "medium", filterFreq: number = 1200, panVal: number = 0) {
        console.log(`Loading ${instrument} sampler...`);
        this.sampler = SampleLibrary.load({
            instruments: instrument,
            baseUrl: "/samples/",
            quality: quality
        });

        this.filter = new Filter({ frequency: filterFreq, type: "lowpass", rolloff: -12 });
        this.gainNode = new Gain(0.5);
        this.panner = new Panner(panVal);

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

        await loaded();
        console.log(`${instrumentName} sampler loaded (via loaded).`);
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
                    droneSynth.triggerAttack(currentRoot, now());
                }
            }

            function stop(): void {
                if (rootPlaying) {
                    droneSynth.triggerRelease(currentRoot, now());
                    rootPlaying = false;
                }
            }

            function playOnce(): void {
                droneSynth.triggerAttackRelease(currentRoot, 1, now());
            }

            function updateRoot(rootNote: number | string): void {
                if (typeof rootNote === "number") {
                    rootNote = Note.fromMidi(rootNote);
                }
                droneSynth.triggerRelease(currentRoot, now());
                currentRoot = rootNote as string;
                if (!rootPlaying) { return; }
                droneSynth.triggerAttack(rootNote as string, now());
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

const preloadAudio = ((): (path: string) => Player | null => {
    let cache: Record<string, Player> = {};
    return (path: string): Player | null => {
        if (!path) {
            return null;
        }
        if (cache[path]) {
            return cache[path];
        }
        cache[path] = new Player(path).connect(answerGainNode);
        return cache[path];
    };
})();

const getAnswerGainNode = (): Gain => {
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
