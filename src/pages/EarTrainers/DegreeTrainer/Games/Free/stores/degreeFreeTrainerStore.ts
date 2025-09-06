import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import toast from 'react-hot-toast';
// DEFAULT_ENABLED_DEGREES kept in Constants for reference; Free mode now defaults to Ionian
import {
  ScaleDegree,
  distanceToDegree,
} from '@EarTrainers/DegreeTrainer/utils/presets';
import { freeModePresets } from '../presets';

interface FreeTrainerState {
  selectedMode: string;
  enabledDegrees: ScaleDegree[];
  customPresets: Record<string, ScaleDegree[]>;
}

interface FreeTrainerActions {
  setSelectedMode: (mode: string) => void;
  setEnabledDegrees: (enabled: ScaleDegree[]) => void;
  toggleDegree: (degree: ScaleDegree) => void;
  setCustomPresets: (presets: Record<string, ScaleDegree[]>) => void;
}

const initialEnabledDegrees: ScaleDegree[] = freeModePresets.ionian.enabledDegrees;

const useDegreeFreeTrainerStore = create<
  FreeTrainerState & FreeTrainerActions
>()(
  persist(
    (set, get) => ({
      selectedMode: 'ionian',
      enabledDegrees: initialEnabledDegrees,
      customPresets: {},

      setSelectedMode: mode => {
        // Switch active preset/mode. If built-in, apply its degrees; if custom, load stored
        set({ selectedMode: mode });
        if (freeModePresets[mode]) {
          set({ enabledDegrees: freeModePresets[mode].enabledDegrees });
        } else {
          const custom = get().customPresets[mode];
          if (custom && custom.length) set({ enabledDegrees: custom });
        }
      },
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
        const next = Array.from(current) as ScaleDegree[];
        set({ enabledDegrees: next });

        // If currently on a custom preset, keep it in sync
        const mode = get().selectedMode;
        const isBuiltin = !!freeModePresets[mode];
        if (!isBuiltin && mode) {
          const updated = { ...get().customPresets, [mode]: next };
          set({ customPresets: updated });
        }
      },
      setCustomPresets: presets => set({ customPresets: presets }),
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
        } catch {
          // ignore storage errors
        }
      },
    } as PersistOptions<FreeTrainerState & FreeTrainerActions>
  )
);

export default useDegreeFreeTrainerStore;
