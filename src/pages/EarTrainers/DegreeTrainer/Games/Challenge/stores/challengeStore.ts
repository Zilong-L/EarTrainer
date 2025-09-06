import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import {
  initialUserProgress,
  type UserProgress,
} from '@EarTrainers/DegreeTrainer/Constants';

interface ChallengeGameStatusState {
  currentLevel: number; // 0-based index
  userProgress: UserProgress[];
  progressVersion: number;
}

interface ChallengeGameStatusActions {
  setCurrentLevel: (level: number) => void;
  setUserProgress: (progress: UserProgress[]) => void;
  setProgressVersion: (v: number) => void;
  resetUserProgress: () => void;
}

const useChallengeStore = create<
  ChallengeGameStatusState & ChallengeGameStatusActions
>()(
  persist(
    set => ({
      currentLevel: 1, // align with previous default (level 2 visually), adapted downstream
      userProgress: initialUserProgress,
      progressVersion: 0,

      setCurrentLevel: level => set({ currentLevel: level }),
      setUserProgress: progress => set({ userProgress: progress }),
      setProgressVersion: v => set({ progressVersion: v }),
      resetUserProgress: () =>
        set({ userProgress: initialUserProgress, currentLevel: 0 }),
    }),
    {
      name: 'DegreeChallengeTrainerGameStatus',
      onRehydrateStorage: () => state => {
        // Migrate legacy localStorage keys
        try {
          const rawLevel = localStorage.getItem('degreeTrainerCurrentLevel');
          const rawProgress = localStorage.getItem('degreeTrainerUserProgress');
          const rawVersion = localStorage.getItem(
            'degreeTrainerProgressVersion'
          );

          if (state) {
            if (rawLevel) {
              const lvl = Number(rawLevel);
              if (!Number.isNaN(lvl)) state.setCurrentLevel(lvl);
            }
            if (rawProgress) {
              try {
                const parsed = JSON.parse(rawProgress) as UserProgress[];
                if (Array.isArray(parsed) && parsed.length)
                  state.setUserProgress(parsed);
              } catch {}
            }
            if (rawVersion) {
              const ver = Number(rawVersion);
              if (!Number.isNaN(ver)) state.setProgressVersion(ver);
            }
          }
        } catch {
          // ignore migration errors
        }
      },
    } as PersistOptions<ChallengeGameStatusState & ChallengeGameStatusActions>
  )
);

export default useChallengeStore;
