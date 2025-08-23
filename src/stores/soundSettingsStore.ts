import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSamplerInstance } from '@utils/Tone/samplers';
import { Sampler, PolySynth, Synth, Filter, Gain, Panner } from 'tone';

// Define the state and actions types
interface SoundSettingsState {
    selectedInstrument: string;
    selectedQuality: string; // Consider using a union type e.g., 'low' | 'medium' | 'high'
    dronePan: number;
    droneFilter: number;
    isLoadingInstrument: boolean;
    playMidiSounds: boolean;
    setSelectedInstrument: (instrument: string) => void;
    setSelectedQuality: (quality: string) => void; // Consider union type here too
    setDronePan: (pan: number) => void;
    setDroneFilter: (filter: number) => void;
    setIsLoadingInstrument: (loading: boolean) => void;
    setPlayMidiSounds: (playMidiSounds: boolean) => void;
    changeInstrument: (newInstrument: string, newQuality: string) => Promise<void>;
}

// Define the interface for the object returned by getSamplerInstance
// Based on the SamplerManager class in ToneInstance.js
interface SamplerManagerInstance {
    sampler: Sampler | PolySynth | Synth | any; // The actual sampler instance (Tone.Sampler or potentially others)
    filter: Filter;
    gainNode: Gain;
    panner: Panner;
    setSamplerLoading?: (loading: boolean) => void; // Made optional to resolve TS inference issue
    setVolume: (value: number) => void;
    setFilterFrequency: (freq: number) => void;
    setPortamento: (value: number) => void;
    setPan: (value: number) => void;
    changeSampler: (instrumentName: string, quality?: string) => Promise<void>; // Async method
}


// Function to handle loading the initial instrument after hydration
const loadInitialInstrument = (state: SoundSettingsState) => {
    console.log("Sound settings rehydrated. Loading initial instrument...");
    // Use the defined interface. getSamplerInstance might return null if not initialized.
    const samplerManager: SamplerManagerInstance | null = getSamplerInstance();
    if (samplerManager) { // Check if sampler manager instance exists
        // Use the store's own setter function via the 'state' object
        state.setIsLoadingInstrument(true);
        // Call changeSampler on the manager instance
        samplerManager // Corrected variable name here
            .changeSampler(state.selectedInstrument, state.selectedQuality) // Use the manager's method
            .then(() => {
                console.log(
                    `Initial instrument ${state.selectedInstrument} (${state.selectedQuality}) loaded successfully after hydration.`
                );
            })
            .catch((err: Error) => { // Type the error
                console.error(
                    "Failed to load initial instrument after hydration:",
                    err
                );
            })
            .finally(() => {
                state.setIsLoadingInstrument(false);
            });
    } else {
        console.warn("Sampler instance not available during rehydration.");
    }
};

// // Define the store creator type with middleware
// type SoundSettingsCreator = StateCreator<
//     SoundSettingsState,
//     [["zustand/persist", unknown]] // Define middleware types if needed, using unknown for simplicity here
// >;

export const useSoundSettingsStore = create<SoundSettingsState>()( // Use the ()() syntax for middleware
    persist(
        (set): SoundSettingsState => ({
            selectedInstrument: 'bass-electric',
            selectedQuality: 'medium', // Consider 'low' | 'medium' | 'high' union type
            dronePan: 0,
            droneFilter: 1200,
            isLoadingInstrument: false,
            playMidiSounds: true,
            setSelectedInstrument: (instrument) => set({ selectedInstrument: instrument }),
            setSelectedQuality: (quality) => set({ selectedQuality: quality }),
            setDronePan: (pan) => set({ dronePan: pan }),
            setDroneFilter: (filter) => set({ droneFilter: filter }),
            setIsLoadingInstrument: (loading) => set({ isLoadingInstrument: loading }),
            setPlayMidiSounds: (playMidiSounds) => set({ playMidiSounds }),
            changeInstrument: async (newInstrument, newQuality) => {
                console.log("Changing instrument to:", newInstrument, "Quality:", newQuality);
                const sampler = getSamplerInstance();
                if (!sampler) return;
                set({ isLoadingInstrument: true });
                try {
                    await sampler.changeSampler(newInstrument, newQuality);
                    set({
                        selectedInstrument: newInstrument,
                        selectedQuality: newQuality
                    });
                } catch (error) {
                    console.error("Failed to change instrument:", error);
                } finally {
                    set({ isLoadingInstrument: false });
                }
            },
        }),
        {
            name: 'sound-settings-storage', // localStorage key name
            onRehydrateStorage: () => (state, error) => {
                if (error) {
                    console.error("Failed to rehydrate sound settings:", error);
                } else if (state) {
                    // Call the extracted function
                    loadInitialInstrument(state);
                    // You could add calls to other rehydration functions here later
                }
            },
        }
    )
);
