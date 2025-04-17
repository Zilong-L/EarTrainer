import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import * as Tone from 'tone';
import { degrees, defaultDegreeChordTypes } from "@components/EarTrainers/ChordColorTrainer/Constants";

interface PracticeRecord {
    total: number;
    correct: number;
}

interface PracticeRecords {
    [degree: string]: PracticeRecord;
}

// Correct the type to store the full DegreeInfo array for custom presets
interface CustomPresets {
    [presetName: string]: DegreeInfo[];
}

interface DegreeInfo {
    name?: string;
    degree?: string;
    distance: number;
    enable?: boolean;
    chordTypes?: string[];
}

interface ChordColorTrainerState {
    bpm: number;
    droneVolume: number;
    pianoVolume: number;
    rootNote: string;
    range: [string, string];
    practiceRecords: PracticeRecords;
    currentNotes: DegreeInfo[];
    preset: string;
    customPresets: CustomPresets;
    muteDrone: boolean;
    isStatOpen: boolean;
    degreeChordTypes: DegreeInfo[];
    chordPlayOption: string;
}

interface ChordColorTrainerActions {
    setBpm: (bpm: number) => void;
    setDroneVolume: (droneVolume: number) => void;
    setPianoVolume: (pianoVolume: number) => void;
    setRootNote: (rootNote: string) => void;
    setRange: (range: [string, string]) => void;
    setPracticeRecords: (practiceRecords: PracticeRecords) => void;
    updatePracticeRecords: (degree: string, isCorrect: boolean) => void;
    setCurrentNotes: (currentNotes: DegreeInfo[]) => void;
    setPreset: (preset: string) => void;
    setCustomPresets: (customPresets: CustomPresets) => void;
    setMuteDrone: (muteDrone: boolean) => void;
    setIsStatOpen: (isStatOpen: boolean) => void;
    setDegreeChordTypes: (degreeChordTypes: DegreeInfo[]) => void;
}

const useChordColorTrainerSettingsStore = create<ChordColorTrainerState & ChordColorTrainerActions>()(
    persist(
        (set) => ({
            bpm: 40,
            droneVolume: 0.3,
            pianoVolume: 1.0,
            rootNote: 'C3',
            range: [Tone.Frequency('C3').toNote(), Tone.Frequency('C4').toNote()],
            practiceRecords: {},
            currentNotes: degrees,
            preset: 'major',
            customPresets: {},
            muteDrone: false,
            isStatOpen: true,
            degreeChordTypes: defaultDegreeChordTypes,
            chordPlayOption: 'default',

            setBpm: (bpm) => set({ bpm }),
            setDroneVolume: (droneVolume) => set({ droneVolume }),
            setPianoVolume: (pianoVolume) => set({ pianoVolume }),
            setRootNote: (rootNote) => set({ rootNote }),
            setRange: (range) => set({ range }),
            setPracticeRecords: (practiceRecords) => set({ practiceRecords }),
            updatePracticeRecords: (degree, isCorrect) => set((state) => {
                const updatedRecords = {
                    ...state.practiceRecords,
                    [degree]: {
                        total: (state.practiceRecords[degree]?.total || 0) + 1,
                        correct: (state.practiceRecords[degree]?.correct || 0) + (isCorrect ? 1 : 0),
                    },
                };
                return { practiceRecords: updatedRecords };
            }),
            setCurrentNotes: (currentNotes) => set({ currentNotes }),
            setPreset: (preset) => set({ preset }),
            setCustomPresets: (customPresets) => set({ customPresets }),
            setMuteDrone: (muteDrone) => set({ muteDrone }),
            setIsStatOpen: (isStatOpen) => set({ isStatOpen }),
            setDegreeChordTypes: (degreeChordTypes: DegreeInfo[]) => set({ degreeChordTypes }),
            setChordPlayOption: (chordPlayOption: string) => set({ chordPlayOption }),
        }),
        {
            name: 'ChordColorTrainerSettings',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.setPreset(state.preset || 'major');
                }
            },
        } as PersistOptions<ChordColorTrainerState & ChordColorTrainerActions>
    )
);

export default useChordColorTrainerSettingsStore;
