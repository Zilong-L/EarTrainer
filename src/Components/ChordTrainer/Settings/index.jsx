import React, { useState, useEffect, useLayoutEffect } from 'react';
import '@styles/scrollbar.css';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import SoundSettings from './SoundSettings';
import ChordPracticeSettings from '@ChordTrainer/ChordGames/ChordPracticeGame/ChordPracticeSettings';
import DiatonicSettings from '@ChordTrainer/ChordGames/DiatonicGame/DiatonicSettings';

const Settings = ({ isOpen, setIsOpen, settings }) => {
  const { t } = useTranslation('chordGame');
  const globalSettings = settings.globalSettings;
  const chordPracticeSettings = settings.chordPracticeGameSettings;
  const diatonicGameSettings = settings.diatonicGameSettings;
  const { mode, setMode } = globalSettings;
  const [currentSettings, setCurrentSettings] = useState('Chord Practice');

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
      return <SoundSettings settings={settings} />;
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
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-full max-w-2xl h-[600px] overflow-y-auto rounded-lg bg-white dark:bg-slate-800 shadow-lg pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('settings.title')}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded-t-lg">
          {['Chord Practice', 'Diatonic', 'Progression'].map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`flex-1 p-2 mx-1 text-sm font-medium rounded-md transition-colors
                ${
                  currentSettings === m
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
            >
              {t(`settings.modes.${m.toLowerCase().replace(' ', '')}`)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4">
          {renderModeContent()}

          {/* Sound Settings */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => handleSettingsChange('Sound Settings')}
              className={`w-full px-4 py-2 text-left rounded-md transition-colors
                ${
                  currentSettings === 'Sound Settings'
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
            >
              {t('settings.modes.soundSettings')}
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Settings;
