import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DRILL_MODES = {
  RANDOM: 'random',
  CIRCLE_FIFTHS: 'circle_fifths',
  CIRCLE_FOURTHS: 'circle_fourths',
  SEMITONE_UP: 'semitone_up',
  SEMITONE_DOWN: 'semitone_down'
};

interface ChordPracticeState {
  selectedInversions: string[];
  selectedChordTypes: string[];
  proMode: boolean;
  drillMode: string;
  setSelectedInversions: (inversions: string[]) => void;
  setSelectedChordTypes: (types: string[]) => void;
  setProMode: (proMode: boolean) => void;
  setDrillMode: (drillMode: string) => void;
}

export const useChordPracticeStore = create<ChordPracticeState>()(
  persist(
    (set) => ({
      selectedInversions: ["random"],
      selectedChordTypes: ["M"],
      proMode: false,
      drillMode: DRILL_MODES.RANDOM,
      setSelectedInversions: (inversions) => set({ selectedInversions: inversions }),
      setSelectedChordTypes: (types) => set({ selectedChordTypes: types }),
      setProMode: (proMode) => set({ proMode }),
      setDrillMode: (drillMode) => set({ drillMode }),
    }),
    {
      name: 'chord-practice-settings', // unique name for local storage
    }
  )
);
