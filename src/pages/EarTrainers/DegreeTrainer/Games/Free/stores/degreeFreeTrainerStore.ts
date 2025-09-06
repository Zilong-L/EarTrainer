import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { DEFAULT_ENABLED_DEGREES } from '@EarTrainers/DegreeTrainer/Constants';
import {
  ScaleDegree,
  distanceToDegree,
} from '@EarTrainers/DegreeTrainer/utils/presets';

interface FreeTrainerState {
  selectedMode: string;
  enabledDegrees: ScaleDegree[];
}

interface FreeTrainerActions {
  setSelectedMode: (mode: string) => void;
  setEnabledDegrees: (enabled: ScaleDegree[]) => void;
  toggleDegree: (degree: ScaleDegree) => void;
}

const initialEnabledDegrees: ScaleDegree[] = DEFAULT_ENABLED_DEGREES;

const useDegreeFreeTrainerStore = create<
  FreeTrainerState & FreeTrainerActions
>()(
  persist(
    (set, get) => ({
      selectedMode: '',
      enabledDegrees: initialEnabledDegrees,

      setSelectedMode: mode => set({ selectedMode: mode }),
      setEnabledDegrees: enabled => set({ enabledDegrees: enabled }),
      toggleDegree: degree => {
        const current = new Set(get().enabledDegrees);
        const willDisable = current.has(degree);
        if (willDisable && current.size <= 1) {
          toast.error('至少保留一个音级', { id: 'settings-error' });
          return;
        }
        if (current.has(degree)) current.delete(degree);
        else current.add(degree);
        set({ enabledDegrees: Array.from(current) as ScaleDegree[] });
      },
    }),
    {
      name: 'DegreeFreeTrainerSettings',
      onRehydrateStorage: () => state => {
        // Migrate legacy localStorage key: degreeTrainerCustomNotes -> enabledDegrees
        try {
          const raw = localStorage.getItem('degreeTrainerCustomNotes');
          if (raw) {
            try {
              const parsed = JSON.parse(raw) as {
                distance: number;
                enable: boolean;
              }[];
              const enabled = parsed
                .filter(n => n.enable)
                .map(n => distanceToDegree(n.distance));
              if (state && enabled.length) state.setEnabledDegrees(enabled);
            } catch {
              // ignore corrupt value
            }
          }
        } catch (e) {
          // ignore storage errors
        }
      },
    } as PersistOptions<FreeTrainerState & FreeTrainerActions>
  )
);

export default useDegreeFreeTrainerStore;
