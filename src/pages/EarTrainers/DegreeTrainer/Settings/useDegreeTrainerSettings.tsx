import { createContext, useContext, useState, type ReactNode } from 'react';
import useSafeLocalStorage from '../hooks/useSafeLocalStorage';
import useVolumeSettings from '@EarTrainers/DegreeTrainer/Settings/VolumeSettings/useVolumeSettings';
import usePracticeSettings from '@EarTrainers/DegreeTrainer/Settings/PracticeSettings/usePracticeSettings';
import useStatistics from '@EarTrainers/DegreeTrainer/Settings/Statistics/useStatistics';

type DegreeTrainerSettingsContextValue = {
  mode: string;
  setMode: (value: string) => void;
  isHandfree: boolean;
  setIsHandfree: (value: boolean) => void;
  volume: ReturnType<typeof useVolumeSettings>;
  practice: ReturnType<typeof usePracticeSettings>;
  stats: ReturnType<typeof useStatistics>;
};

const DegreeTrainerSettingsContext = createContext<
  DegreeTrainerSettingsContextValue | undefined
>(undefined);

export const useDegreeTrainerSettings =
  (): DegreeTrainerSettingsContextValue => {
    const ctx = useContext(DegreeTrainerSettingsContext);
    if (!ctx) {
      throw new Error(
        'useDegreeTrainerSettings must be used within a DegreeTrainerSettingsProvider'
      );
    }
    return ctx;
  };

export const DegreeTrainerSettingsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [mode, setMode] = useSafeLocalStorage<string>(
    'degreeTrainerMode',
    'free'
  );
  const [isHandfree, setIsHandfree] = useState(false);
  const volume = useVolumeSettings();
  const practice = usePracticeSettings();
  const stats = useStatistics();

  const value: DegreeTrainerSettingsContextValue = {
    mode,
    setMode,
    isHandfree,
    setIsHandfree,
    volume,
    practice,
    stats,
  };

  return (
    <DegreeTrainerSettingsContext.Provider value={value}>
      {children}
    </DegreeTrainerSettingsContext.Provider>
  );
};
