import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

interface AdvanceSettingsState {
  // 0 = instant advance (current behavior)
  holdToAdvanceMs: number;
  setHoldToAdvanceMs: (ms: number) => void;
}

export const useAdvanceSettingsStore = create<AdvanceSettingsState>()(
  persist(
    set => ({
      holdToAdvanceMs: 800,
      setHoldToAdvanceMs: ms =>
        set({ holdToAdvanceMs: clamp(Math.round(ms), 0, 3000) }),
    }),
    {
      name: 'chord-trainer-advance-settings',
    }
  )
);
