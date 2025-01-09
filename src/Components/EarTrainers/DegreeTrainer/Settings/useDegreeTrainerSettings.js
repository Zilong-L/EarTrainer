import { useLocalStorage } from '@uidotdev/usehooks';
import useSoundSettings from '@EarTrainers/DegreeTrainer/Settings/SoundSettings/useSoundSettings';
import useVolumeSettings from '@EarTrainers/DegreeTrainer/Settings/VolumeSettings/useVolumeSettings';
import usePracticeSettings from '@EarTrainers/DegreeTrainer/Settings/PracticeSettings/usePracticeSettings';
import useStatistics from '@EarTrainers/DegreeTrainer/Settings/Statistics/useStatistics';
import { useState } from 'react';

const useDegreeTrainerSettings = () => {
  const [mode, setMode] = useLocalStorage('degreeTrainerMode', 'free');
  const [isHandfree,setIsHandfree] = useState(false); 
  const sound = useSoundSettings();
  const volume = useVolumeSettings();
  const practice = usePracticeSettings();
  const stats = useStatistics();

  return {
    mode,
    setMode,
    isHandfree,
    setIsHandfree,
    sound,
    volume,
    practice,
    stats
  };
};

export default useDegreeTrainerSettings;
