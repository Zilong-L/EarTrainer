import React, { useState } from 'react';
import PracticeSettings from './PracticeSettings';
import VolumeSettings from './VolumeSettings';
import Statistics from './Statistics';
import SoundSettings from './SoundSettings';
import { useTranslation } from 'react-i18next';

function DegreeTrainerSettings({ settings, isSettingsOpen, setIsSettingsOpen, playNote, setGameState }) {
  const { t } = useTranslation('degreeTrainer');
  const [currentPage, setCurrentPage] = useState('practice');

  const closeSettings = () => {
    setIsSettingsOpen(false);
    setGameState('playing');
    document.body.classList.remove('modal-open');
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
    document.body.classList.add('modal-open');
  };

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={closeSettings} />
      <div className="relative w-[90%] max-w-4xl h-[80vh] bg-slate-50 dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden">
        {/* Header with Settings label and close button */}
        <div className="flex items-center p-4 border-b border-slate-200 dark:border-slate-700">
          {/* Mobile back button - always takes space but hidden when not needed */}
          <div className="w-8 md:hidden">
            {currentPage !== 'home' && (
              <button
                onClick={() => setCurrentPage('home')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>
          
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex-1 text-center md:text-left">
            {t('settings.Settings')}
          </h2>
          
          <button
            onClick={closeSettings}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content container with navigation and content area */}
        <div className="flex h-[calc(100%-4rem)]">
          {/* Navigation Sidebar - Hidden on mobile */}
          <div className="w-48 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-full hidden md:block">
          <nav className="p-4 space-y-2 bg-slate-50 dark:bg-slate-800">
            <button
              onClick={() => setCurrentPage('practice')}
              className={`w-full px-4 py-3 text-left rounded-lg ${
                currentPage === 'practice' 
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {t('settings.PracticeSettings')}
            </button>
            <button
              onClick={() => setCurrentPage('statistics')}
              className={`w-full px-4 py-3 text-left rounded-lg ${
                currentPage === 'statistics'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {t('settings.Statistics')}
            </button>
            <button
              onClick={() => setCurrentPage('volume')}
              className={`w-full px-4 py-3 text-left rounded-lg ${
                currentPage === 'volume'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {t('settings.VolumeSettings')}
            </button>
            <button
              onClick={() => setCurrentPage('sound')}
              className={`w-full px-4 py-3 text-left rounded-lg ${
                currentPage === 'sound'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {t('settings.SoundSettings')}
            </button>
          </nav>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 flex flex-col pb-6 bg-white dark:bg-slate-800"> {/* Add bottom padding to container */}
          <div className="p-6 overflow-y-auto h-full box-border scrollbar-hide bg-white dark:bg-slate-800" style={{ 
            paddingBottom: '0',
            scrollbarGutter: 'stable' // Reserve space for scrollbar
          }}>
          {/* Mobile navigation - Only show grid on mobile */}
          {currentPage === 'home' && (
            <div className="p-6 md:hidden">
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => setCurrentPage('practice')}
                  className={`p-6 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors ${
                    currentPage === 'practice' 
                      ? 'bg-cyan-700 text-white'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {t('settings.PracticeSettings')}
                  </h3>
                </button>
                <button
                  onClick={() => setCurrentPage('statistics')}
                  className="p-6 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {t('settings.Statistics')}
                  </h3>
                </button>
                <button
                  onClick={() => setCurrentPage('volume')}
                  className="p-6 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {t('settings.VolumeSettings')}
                  </h3>
                </button>
                <button
                  onClick={() => setCurrentPage('sound')}
                  className="p-6 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {t('settings.SoundSettings')}
                  </h3>
                </button>
              </div>
            </div>
          )}
          {currentPage === 'practice' && (
            <PracticeSettings settings={settings} setCurrentPage={setCurrentPage} setGameState={setGameState}/>
          )}
          {currentPage === 'volume' && (
            <VolumeSettings settings={settings} setCurrentPage={setCurrentPage} />
          )}
          {currentPage === 'statistics' && (
            <Statistics settings={settings} setCurrentPage={setCurrentPage} />
          )}
          {currentPage === 'sound' && (
            <SoundSettings settings={settings} setCurrentPage={setCurrentPage} playNote={playNote} />
          )}
          </div>
        </div>
      </div>
    </div></div>
  );
}

export default DegreeTrainerSettings;
