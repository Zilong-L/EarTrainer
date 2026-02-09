import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DiatonicProgressionMode = 'random' | 'progression';

interface DiatonicProgressionState {
  mode: DiatonicProgressionMode;
  progressionId: string | null;
  requireSlashBass: boolean;

  setMode: (mode: DiatonicProgressionMode) => void;
  setProgressionId: (id: string | null) => void;
  setRequireSlashBass: (next: boolean) => void;
}

export const useDiatonicProgressionStore = create<DiatonicProgressionState>()(
  persist(
    set => ({
      mode: 'random',
      progressionId: null,
      requireSlashBass: true,
      setMode: mode => set({ mode }),
      setProgressionId: id =>
        set({
          progressionId: id,
          mode: id ? 'progression' : 'random',
        }),
      setRequireSlashBass: next => set({ requireSlashBass: next }),
    }),
    {
      name: 'diatonic-progression-settings',
    }
  )
);
