declare module '@utils/Tone/SampleLibrary' {
    import { Sampler } from 'tone';

    interface LoadOptions {
        instruments: string;
        baseUrl: string;
        quality: string;
    }

    const SampleLibrary: {
        load: (options: LoadOptions) => Sampler;
    };

    export { SampleLibrary };
}
