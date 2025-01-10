import React, { createContext, useContext, useState } from 'react';
import { useLocalStorage } from '@uidotdev/usehooks';
import useSoundSettings from '@EarTrainers/DegreeTrainer/Settings/SoundSettings/useSoundSettings';
import useVolumeSettings from '@EarTrainers/DegreeTrainer/Settings/VolumeSettings/useVolumeSettings';
import usePracticeSettings from '@EarTrainers/DegreeTrainer/Settings/PracticeSettings/usePracticeSettings';
import useStatistics from '@EarTrainers/DegreeTrainer/Settings/Statistics/useStatistics';
// Create a context to store settings globally
const DegreeTrainerSettingsContext = createContext();

// Custom hook to access settings in components
export const useDegreeTrainerSettings = () => {
  return useContext(DegreeTrainerSettingsContext);
};

// The Provider component that will hold the settings
export const DegreeTrainerSettingsProvider = ({ children }) => {
  // State hooks for each setting
  const [mode, setMode] = useLocalStorage('degreeTrainerMode', 'free');
  const [isHandfree, setIsHandfree] = useState(false);
  const sound = useSoundSettings();
  const volume = useVolumeSettings();
  const practice = usePracticeSettings();
  const stats = useStatistics();

  // The value that will be passed down via context
  const value = {
    mode,
    setMode,
    isHandfree,
    setIsHandfree,
    sound,
    volume,
    practice,
    stats
  };

  return (
    <DegreeTrainerSettingsContext.Provider value={value}>
      {children}
    </DegreeTrainerSettingsContext.Provider>
  );
};

