import React from 'react';
import { useTranslation } from 'react-i18next';
import PracticeSettings from './PracticeSettings';
import VolumeSettings from './VolumeSettings';
import Statistics from './StatisticsSettings';
import SoundSettings from '@components/SharedComponents/Settings/SoundSettings';
import SettingsPanel from '@components/SharedComponents/Settings/SettingsPanel';
import useI18nStore from '@stores/i18nStore';
function ChordColorTrainerSettings({
  isSettingsOpen,
  setIsSettingsOpen,
  playChord,
}) {
  const { namespace } = useI18nStore()
  const { t } = useTranslation(namespace);

  const closeSettings = () => {
    setIsSettingsOpen(false);
    playChord();
  };

  const components = [
    {
      id: 'sound',
      label: 'settingsMenu.soundSettings',
      component: SoundSettings,
    },
    {
      id: 'practice',
      label: 'settingsMenu.practiceSettings',
      component: PracticeSettings,
    },
    {
      id: 'statistics',
      label: 'settingsMenu.statistics',
      component: Statistics,
    },
    {
      id: 'volume',
      label: 'settingsMenu.volumeSettings',
      component: VolumeSettings,
    },
  ];

  return (
    <SettingsPanel
      isOpen={isSettingsOpen}
      onClose={closeSettings}
      components={components}
      title={t('settingsMenu.settings')}
    />
  );
}

export default ChordColorTrainerSettings;
