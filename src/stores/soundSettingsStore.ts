import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSamplerInstance, getDroneInstance } from '@utils/Tone/samplers';

interface SoundSettingsState {
  selectedInstrument: string;
  selectedQuality: string;
  dronePan: number;
  droneFilter: number;
  isLoadingInstrument: boolean;
  instrumentLoadError: string | null;
  playMidiSounds: boolean;
  setSelectedInstrument: (instrument: string) => void;
  setSelectedQuality: (quality: string) => void;
  setDronePan: (pan: number) => void;
  setDroneFilter: (filter: number) => void;
  setIsLoadingInstrument: (loading: boolean) => void;
  setPlayMidiSounds: (playMidiSounds: boolean) => void;
  changeInstrument: (
    newInstrument: string,
    newQuality: string
  ) => Promise<void>;
}

let instrumentRequest = 0;

export const useSoundSettingsStore = create<SoundSettingsState>()(
  persist(
    (set): SoundSettingsState => ({
      selectedInstrument: 'piano',
      selectedQuality: 'medium',
      dronePan: 0,
      droneFilter: 1200,
      isLoadingInstrument: false,
      instrumentLoadError: null,
      playMidiSounds: true,
      setSelectedInstrument: instrument =>
        set({ selectedInstrument: instrument }),
      setSelectedQuality: quality => set({ selectedQuality: quality }),
      setDronePan: pan => {
        const value = Number.isFinite(pan) ? Math.min(1, Math.max(-1, pan)) : 0;
        getDroneInstance().sampler.setPan(value);
        set({ dronePan: value });
      },
      setDroneFilter: filter => {
        const value = Number.isFinite(filter)
          ? Math.min(2000, Math.max(20, filter))
          : 1200;
        getDroneInstance().sampler.setFilterFrequency(value);
        set({ droneFilter: value });
      },
      setIsLoadingInstrument: loading => set({ isLoadingInstrument: loading }),
      setPlayMidiSounds: playMidiSounds => set({ playMidiSounds }),
      changeInstrument: async (newInstrument, newQuality) => {
        const request = ++instrumentRequest;
        set({ isLoadingInstrument: true, instrumentLoadError: null });
        try {
          await getSamplerInstance().changeSampler(newInstrument, newQuality);
          if (request !== instrumentRequest) return;
          set({
            selectedInstrument: newInstrument,
            selectedQuality: newQuality,
          });
        } catch (error) {
          if (request !== instrumentRequest) return;
          console.warn(
            'Instrument unavailable; keeping the previous usable sound.',
            error
          );
          set({ instrumentLoadError: newInstrument });
        } finally {
          if (request === instrumentRequest)
            set({ isLoadingInstrument: false });
        }
      },
    }),
    {
      name: 'sound-settings-storage',
      // Do not restore transient loading/error state from a previous session.
      partialize: state => ({
        selectedInstrument: state.selectedInstrument,
        selectedQuality: state.selectedQuality,
        dronePan: state.dronePan,
        droneFilter: state.droneFilter,
        playMidiSounds: state.playMidiSounds,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<SoundSettingsState> | undefined;
        return {
          ...current,
          selectedInstrument:
            saved?.selectedInstrument ?? current.selectedInstrument,
          selectedQuality: saved?.selectedQuality ?? current.selectedQuality,
          dronePan: saved?.dronePan ?? current.dronePan,
          droneFilter: saved?.droneFilter ?? current.droneFilter,
          playMidiSounds: saved?.playMidiSounds ?? current.playMidiSounds,
        };
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) console.warn('Could not restore sound settings.', error);
        if (state) {
          state.setDronePan(state.dronePan);
          state.setDroneFilter(state.droneFilter);
          void state.changeInstrument(
            state.selectedInstrument,
            state.selectedQuality
          );
        }
      },
    }
  )
);
