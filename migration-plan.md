# TypeScript Migration Plan

This document outlines the phased plan for migrating the ChordTrainer project from JavaScript to TypeScript. The migration is structured in phases to ensure a safe and orderly transition. All files within a single phase can be migrated simultaneously, but each phase should be completed before moving to the next.

---

### Phase 1: Foundational Utilities & Constants
*These files have no internal JavaScript dependencies and can be migrated first.*
- [ ] `src/i18n.js`
- [ ] `src/pages/EarTrainers/DegreeTrainer/Constants.js`
- [ ] `src/pages/EarTrainers/DegreeTrainer/Games/Free/presets.js`
- [ ] `src/pages/EarTrainers/DegreeTrainer/Settings/PracticeSettings/usePracticeSettings.js`
- [ ] `src/pages/EarTrainers/DegreeTrainer/Settings/Statistics/useStatistics.js`
- [ ] `src/pages/EarTrainers/DegreeTrainer/Settings/VolumeSettings/useVolumeSettings.js`
- [ ] `src/utils/ChordTrainer/Constants.js`
- [ ] `src/utils/Constants.js`
- [ ] `src/utils/Tone/SampleLibrary.js`

### Phase 2: Core Logic & Hooks
*These files depend only on modules from Phase 1.*
- [ ] `src/pages/EarTrainers/DegreeTrainer/Settings/useDegreeTrainerSettings.jsx`
- [ ] `src/utils/ChordTrainer/GameLogics.js`
- [ ] `src/utils/GameLogics.js`
- [ ] `src/utils/Tone/samplers.legacy.js`

### Phase 3: Components & Settings
*These files depend on modules from the previous phases.*
- [ ] `src/components/Settings/SettingsPanel.jsx`
- [ ] `src/components/Settings/SoundSettings/useSoundSettings.js`
- [ ] `src/components/slider/RangeSlider.jsx`
- [ ] `src/pages/EarTrainers/DegreeTrainer/Games/Challenge/ChallengeSettings.jsx`
- [ ] `src/pages/EarTrainers/DegreeTrainer/Games/Challenge/useChallengeTrainer.js`
- [ ] `src/pages/EarTrainers/DegreeTrainer/Games/Free/FreeSettings.jsx`
- [ ] `src/pages/EarTrainers/DegreeTrainer/Games/Free/useFreeTrainer.js`
- [ ] `src/utils/Tone/playbacks.legacy.js`

### Phase 4: More Components & Settings
- [ ] `src/components/Settings/SoundSettings/index.jsx`
- [ ] `src/pages/EarTrainers/DegreeTrainer/Games/Shared/AudioPitchDetector.jsx`
- [ ] `src/pages/EarTrainers/DegreeTrainer/Settings/PracticeSettings/index.jsx`
- [ ] `src/pages/EarTrainers/DegreeTrainer/Settings/VolumeSettings/index.jsx`

### Phase 5: Higher-Level Components
- [ ] `src/pages/EarTrainers/DegreeTrainer/Games/Shared/ThresholdSlider.jsx`
- [ ] `src/pages/EarTrainers/DegreeTrainer/Settings/Statistics/index.jsx`

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
