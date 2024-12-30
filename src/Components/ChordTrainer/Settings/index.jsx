import React, { useState, useEffect, useLayoutEffect } from 'react';
import '@styles/scrollbar.css';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import SoundSettings from '@EarTrainers/DegreeTrainer/Settings/SoundSettings';
import ChordPracticeSettings from '@ChordTrainer/ChordGames/ChordPracticeGame/ChordPracticeSettings';
import DiatonicSettings from '@ChordTrainer/ChordGames/DiatonicGame/DiatonicSettings';
import {getSamplerInstance} from '@utils/ToneInstance';
const Settings = ({ isOpen, setIsOpen, settings }) => {
  const { t } = useTranslation('chordGame');
  const globalSettings = settings.globalSettings;
  const chordPracticeSettings = settings.chordPracticeGameSettings;
  const diatonicGameSettings = settings.diatonicGameSettings;
  const { mode, setMode } = globalSettings;
  const [currentSettings, setCurrentSettings] = useState('Chord Practice');
  const playNote = () =>{
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
      return(
          <SoundSettings settings={globalSettings}  playNote={playNote} />
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
      <div className="w-full max-w-5xl h-[80vh] rounded-lg bg-white dark:bg-slate-800 shadow-lg pointer-events-auto flex flex-col">
        {/* Header */}
        <div className="w-full p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t('settings.title')}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content Container */}
        <div className="flex flex-1 overflow-hidden">
          {/* Navigation Sidebar */}
          <div className="w-48 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-full">
          
          {/* Navigation Items */}
          <nav className="p-2 space-y-1">
            {['Chord Practice', 'Diatonic', 'Progression'].map((m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`w-full px-3 py-2 text-left rounded-md transition-colors
                  ${
                    currentSettings === m
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                {t(`settings.modes.${m.toLowerCase().replace(' ', '')}`)}
              </button>
            ))}
            
            {/* Sound Settings Button */}
            <button
              onClick={() => handleSettingsChange('Sound Settings')}
              className={`w-full px-3 py-2 text-left rounded-md transition-colors
                ${
                  currentSettings === 'Sound Settings'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
            >
              {t('settings.modes.soundSettings')}
            </button>
          </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 pt-6 pb-0 overflow-y-auto h-full box-border scrollbar-hide bg-white dark:bg-slate-800" style={{ 
              scrollbarGutter: 'stable'
            }}>
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
