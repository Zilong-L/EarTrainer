import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PracticeSettings from './PracticeSettings';
import VolumeSettings from './VolumeSettings';
import Statistics from './StatisticsSettings';

function ChordColorTrainerSettings({
  isSettingsOpen,
  setIsSettingsOpen,
  playChord,
  settings,
}) {
  const { t } = useTranslation('chordTrainer');

  const {
    isStatOpen,
    bpm,
    droneVolume,
    pianoVolume,
    rootNote,
    range,
    currentNotes,
    degreeChordTypes,
    preset,
    customPresets,
  } = settings;

  const [showPracticeSettings, setShowPracticeSettings] = useState(false);
  const [showVolumeSettings, setShowVolumeSettings] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);

  const closeSettings = () => {
    setIsSettingsOpen(false);
    setShowPracticeSettings(false);
    setShowVolumeSettings(false);
    setShowStatistics(false);
    playChord();
    saveSettingsToLocalStorage();
  };

  function saveSettingsToLocalStorage() {
    const settingsToSave = {
      bpm,
      droneVolume,
      pianoVolume,
      rootNote,
      range,
      currentNotes,
      degreeChordTypes,
      preset,
      customPresets,
      isStatOpen
    };
    localStorage.setItem('ChordColorTrainerSettings', JSON.stringify(settingsToSave));
  }

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10" onClick={closeSettings}>
      <div className="bg-bg-main rounded-lg p-6 w-[80%] max-w-[500px] h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-center text-text-primary mb-8">
          {t('settingsMenu.settings')}
        </h2>

        {!showPracticeSettings && !showVolumeSettings && !showStatistics ? (
          <div className="space-y-4">
            <button
              className="w-full text-left text-lg text-text-primary hover:text-accent transition-colors p-3 rounded-lg hover:bg-bg-accent"
              onClick={() => setShowPracticeSettings(true)}
            >
              {t('settingsMenu.practiceSettings')}
            </button>
            <button
              className="w-full text-left text-lg text-text-primary hover:text-accent transition-colors p-3 rounded-lg hover:bg-bg-accent"
              onClick={() => setShowStatistics(true)}
            >
              {t('settingsMenu.statistics')}
            </button>
            <button
              className="w-full text-left text-lg text-text-primary hover:text-accent transition-colors p-3 rounded-lg hover:bg-bg-accent"
              onClick={() => setShowVolumeSettings(true)}
            >
              {t('settingsMenu.volumeSettings')}
            </button>
          </div>
        ) : showPracticeSettings ? (
          <PracticeSettings
            settings={settings}
            setShowPracticeSettings={setShowPracticeSettings}
            customPresets={customPresets}
          />
        ) : showStatistics ? (
          <Statistics settings={settings} setShowStatistics={setShowStatistics} />
        ) : (
          <VolumeSettings settings={settings} setShowVolumeSettings={setShowVolumeSettings} />
        )}
      </div>
    </div>
  );
}

export default ChordColorTrainerSettings;
