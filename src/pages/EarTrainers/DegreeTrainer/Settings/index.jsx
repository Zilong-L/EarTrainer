import React, { useEffect } from 'react';
import PracticeSettings from './PracticeSettings';
import VolumeSettings from './VolumeSettings';
import Statistics from './Statistics';
import SoundSettings from '../../../../Components/SharedComponents/Settings/SoundSettings';
import GameSettings from './GameSettings';
import SettingsPanel from '../../../../Components/SharedComponents/Settings/SettingsPanel';

function DegreeTrainerSettings({ isSettingsOpen, onClose }) {
  // Get the setNamespace function from the i18n store

  // Define the settings components specific to DegreeTrainer
  const settingsComponents = [
    { id: 'game', label: 'settings.GameSettings', component: GameSettings },
    { id: 'practice', label: 'settings.PracticeSettings', component: PracticeSettings },
    { id: 'statistics', label: 'settings.Statistics', component: Statistics },
    { id: 'volume', label: 'settings.VolumeSettings', component: VolumeSettings },
    { id: 'sound', label: 'settings.SoundSettings', component: SoundSettings }
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
