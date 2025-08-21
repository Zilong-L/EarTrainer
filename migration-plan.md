# TypeScript Migration Plan

This document outlines the phased plan for migrating the ChordTrainer project from JavaScript to TypeScript. The migration is structured in phases to ensure a safe and orderly transition. All files within a single phase can be migrated simultaneously, but each phase should be completed before moving to the next.

---

### Phase 1: Foundational Utilities & Constants
*These files have no internal JavaScript dependencies and can be migrated first.*
- [x] `src/i18n.js`
- [x] `src/pages/EarTrainers/DegreeTrainer/Constants.js`
- [x] `src/pages/EarTrainers/DegreeTrainer/Games/Free/presets.js`
- [x] `src/pages/EarTrainers/DegreeTrainer/Settings/PracticeSettings/usePracticeSettings.js`
- [x] `src/pages/EarTrainers/DegreeTrainer/Settings/Statistics/useStatistics.js`
- [x] `src/pages/EarTrainers/DegreeTrainer/Settings/VolumeSettings/useVolumeSettings.js`
- [x] `src/utils/ChordTrainer/Constants.js`
- [x] `src/utils/Constants.js`
- [x] `src/utils/Tone/SampleLibrary.js`

### Phase 2: Core Logic & Hooks
*These files depend only on modules from Phase 1.*
- [x] `src/pages/EarTrainers/DegreeTrainer/Settings/useDegreeTrainerSettings.jsx`
- [x] `src/utils/ChordTrainer/GameLogics.js`
- [x] `src/utils/GameLogics.js`
- [x] `src/utils/Tone/samplers.legacy.js`

### Phase 3: Components & Settings
*These files depend on modules from the previous phases.*
- [x] `src/components/Settings/SettingsPanel.tsx`
- [x] `src/components/Settings/SoundSettings/useSoundSettings.ts`
- [x] `src/components/slider/RangeSlider.tsx`
- [x] `src/pages/EarTrainers/DegreeTrainer/Games/Challenge/ChallengeSettings.tsx`
- [x] `src/pages/EarTrainers/DegreeTrainer/Games/Challenge/useChallengeTrainer.ts`
- [x] `src/pages/EarTrainers/DegreeTrainer/Games/Free/FreeSettings.tsx`
- [x] `src/pages/EarTrainers/DegreeTrainer/Games/Free/useFreeTrainer.ts`
- [x] `src/utils/Tone/playbacks.ts` (already migrated)

### Phase 4: More Components & Settings
- [x] `src/components/Settings/SoundSettings/index.tsx`
- [x] `src/pages/EarTrainers/DegreeTrainer/Games/Shared/AudioPitchDetector.tsx`
- [x] `src/pages/EarTrainers/DegreeTrainer/Settings/PracticeSettings/index.tsx`
- [x] `src/pages/EarTrainers/DegreeTrainer/Settings/VolumeSettings/index.tsx`

### Phase 5: Higher-Level Components
- [x] `src/pages/EarTrainers/DegreeTrainer/Games/Shared/ThresholdSlider.tsx` (TypeScript version created)
- [x] `src/pages/EarTrainers/DegreeTrainer/Games/Shared/ThresholdSlider.d.ts` (TypeScript definitions added)
- [x] `src/pages/EarTrainers/DegreeTrainer/Settings/Statistics/index.jsx` ✅ **COMPLETED**

### Phase 6: Game Logic & Entry Points
- [ ] `src/pages/EarTrainers/DegreeTrainer/Games/Shared/AudioWave.jsx`
- [ ] `src/pages/EarTrainers/DegreeTrainer/Settings/GameSettings/index.jsx`

### Phase 7: Core UI Components
- [ ] `src/pages/EarTrainers/DegreeTrainer/Games/Shared/StartButtons.jsx`
- [ ] `src/pages/EarTrainers/DegreeTrainer/Settings/index.jsx`

### Phase 8: Main Feature Pages
- [ ] `src/pages/EarTrainers/DegreeTrainer/DegreeTrainer.jsx`

### Phase 9: Application Entry
- [ ] `src/main.jsx`
