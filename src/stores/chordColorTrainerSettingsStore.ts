import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { Frequency } from 'tone';
import {
  degrees,
  defaultDegreeChordTypes,
} from '@EarTrainers/ChordColorTrainer/Constants';

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
  chordTypes: string[];
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
  setChordPlayOption: (chordPlayOption: string) => void;
}

const useChordColorTrainerSettingsStore = create<
  ChordColorTrainerState & ChordColorTrainerActions
>()(
  persist(
    set => ({
      bpm: 40,
      droneVolume: 0.3,
      pianoVolume: 1.0,
      rootNote: 'C3',
      range: [Frequency('C3').toNote(), Frequency('C4').toNote()],
      practiceRecords: {},
      currentNotes: degrees.map(degree => ({
        ...degree,
        chordTypes: [],
      })),
      // Use Chinese preset keys to match Constants.chordPreset
      preset: '大调',
      customPresets: {},
      muteDrone: false,
      isStatOpen: true,
      degreeChordTypes: defaultDegreeChordTypes,
      chordPlayOption: 'default',

      setBpm: bpm => set({ bpm }),
      setDroneVolume: droneVolume => set({ droneVolume }),
      setPianoVolume: pianoVolume => set({ pianoVolume }),
      setRootNote: rootNote => set({ rootNote }),
      setRange: range => set({ range }),
      setPracticeRecords: practiceRecords => set({ practiceRecords }),
      updatePracticeRecords: (degree, isCorrect) =>
        set(state => {
          const updatedRecords = {
            ...state.practiceRecords,
            [degree]: {
              total: (state.practiceRecords[degree]?.total || 0) + 1,
              correct:
                (state.practiceRecords[degree]?.correct || 0) +
                (isCorrect ? 1 : 0),
            },
          };
          return { practiceRecords: updatedRecords };
        }),
      setCurrentNotes: currentNotes => set({ currentNotes }),
      setPreset: preset => set({ preset }),
      setCustomPresets: customPresets => set({ customPresets }),
      setMuteDrone: muteDrone => set({ muteDrone }),
      setIsStatOpen: isStatOpen => set({ isStatOpen }),
      setDegreeChordTypes: (degreeChordTypes: DegreeInfo[]) =>
        set({ degreeChordTypes }),
      setChordPlayOption: (chordPlayOption: string) => set({ chordPlayOption }),
    }),
    {
      name: 'ChordColorTrainerSettings',
      onRehydrateStorage: () => state => {
        if (state) {
          const migratePreset = (p?: string) => {
            if (!p) return '大调';
            if (p === 'major') return '大调';
            if (p === 'minor') return '小调';
            if (p === 'basic' || p === 'basic-color') return '基础色彩';
            return p;
          };
          state.setPreset(migratePreset(state.preset));
        }
      },
    } as PersistOptions<ChordColorTrainerState & ChordColorTrainerActions>
  )
);

export default useChordColorTrainerSettingsStore;
