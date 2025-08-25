import PracticeSettings from './PracticeSettings';
import VolumeSettings from './VolumeSettings';
import Statistics from './Statistics';
import SoundSettings from '@components/Settings/SoundSettings';
import GameSettings from './GameSettings';
import SettingsPanel from '@components/Settings/SettingsPanel';

interface DegreeTrainerSettingsProps {
  isSettingsOpen: boolean;
  onClose: () => void;
}

function DegreeTrainerSettings({
  isSettingsOpen,
  onClose,
}: DegreeTrainerSettingsProps) {
  // Define the settings components specific to DegreeTrainer
  const settingsComponents = [
    { id: 'game', label: 'settings.GameSettings', component: GameSettings },
    {
      id: 'practice',
      label: 'settings.PracticeSettings',
      component: PracticeSettings,
    },
    { id: 'statistics', label: 'settings.Statistics', component: Statistics },
    {
      id: 'volume',
      label: 'settings.VolumeSettings',
      component: VolumeSettings,
    },
    { id: 'sound', label: 'settings.SoundSettings', component: SoundSettings },
  ];

  return (
    <SettingsPanel
      isOpen={isSettingsOpen}
      onClose={onClose}
      components={settingsComponents}
    />
  );
}

export default DegreeTrainerSettings;
