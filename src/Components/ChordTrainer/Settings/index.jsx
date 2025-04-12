import React, { useState, useEffect, useLayoutEffect } from 'react';
import '@styles/scrollbar.css';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import SoundSettings from '@components/SharedComponents/Settings/SoundSettings';
import ChordPracticeSettings from '@ChordTrainer/ChordGames/ChordPracticeGame/ChordPracticeSettings';
import DiatonicSettings from '@ChordTrainer/ChordGames/DiatonicGame/DiatonicSettings';
import { getSamplerInstance } from '@utils/ToneInstance';
const Settings = ({ isOpen, setIsOpen, settings }) => {
  const { t } = useTranslation('chordGame');
  const globalSettings = settings.globalSettings;

  const chordPracticeSettings = settings.chordPracticeGameSettings;
  const diatonicGameSettings = settings.diatonicGameSettings;
  const { mode, setMode } = globalSettings;
  const [currentSettings, setCurrentSettings] = useState('Chord Practice');
  useEffect(() => {
    console.log('haha ')
    setCurrentSettings(mode);
  }, [mode]);
  const playNote = () => {
    getSamplerInstance().sampler.triggerAttackRelease('C4', '2n');
    console.log('play')
  }
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setCurrentSettings(newMode);
  };

  const handleSettingsChange = (settingsPage) => {
    setCurrentSettings(settingsPage);
  };

  const renderModeContent = () => {
    if (currentSettings === 'Chord Practice') {
      return <ChordPracticeSettings chordPracticeSettings={chordPracticeSettings} />;
    } else if (currentSettings === 'Diatonic') {
      return <DiatonicSettings diatonicGameSettings={diatonicGameSettings} />;
    } else if (currentSettings === 'Progression') {
      return (
        <div className="p-4 text-slate-700 dark:text-slate-300">
          Progression Mode Settings Coming Soon!
        </div>
      );
    } else if (currentSettings === 'Sound Settings') {
      return (
        <SoundSettings settings={globalSettings} playNote={playNote} />
      )
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="w-full max-w-5xl h-[80vh] rounded-lg bg-bg-main shadow-lg pointer-events-auto flex flex-col">
          {/* Header */}
          <div className="w-full p-4 border-b border-bg-accent bg-bg-common flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">
              {t('settings.title')}
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-bg-accent text-text-secondary"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Content Container */}
          <div className="flex flex-1 overflow-hidden">
            {/* Navigation Sidebar */}
            <div className="pt-2 w-48 border-r border-bg-accent bg-bg-common h-full">

              {/* Navigation Items */}
              <nav className="p-2 space-y-1">
                {['Chord Practice', 'Diatonic', 'Progression'].map((m) => (
                  <button
                    key={m}
                    onClick={() => handleModeChange(m)}
                    className={`w-full px-3 py-2 text-left rounded-md transition-colors
                  ${currentSettings === m
                        ? 'bg-notification-bg text-notification-text'
                        : 'text-text-primary hover:bg-bg-accent'
                      }`}
                  >
                    {t(`settings.modes.${m.toLowerCase().replace(' ', '')}`)}
                  </button>
                ))}

                {/* Sound Settings Button */}
                <button
                  onClick={() => handleSettingsChange('Sound Settings')}
                  className={`w-full px-3 py-2 text-left rounded-md transition-colors
                ${currentSettings === 'Sound Settings'
                      ? 'bg-notification-bg text-notification-text'
                      : 'text-text-primary bg-bg-common'
                    }`}
                >
                  {t('settings.modes.soundSettings')}
                </button>
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col pb-6 bg-bg-main">
              <div className="px-6 overflow-y-auto h-full box-border bg-bg-main" >
                {renderModeContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
