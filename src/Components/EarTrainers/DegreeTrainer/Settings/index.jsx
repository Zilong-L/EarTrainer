import React, { useState } from 'react';
import PracticeSettings from './PracticeSettings';
import VolumeSettings from './VolumeSettings';
import Statistics from './Statistics';
import SoundSettings from './SoundSettings';
import GameSettings from './GameSettings';
import { useTranslation } from 'react-i18next';
import './styles.css';

function DegreeTrainerSettings({ settings, isSettingsOpen, setIsSettingsOpen, playNote, setGameState }) {
  const { t } = useTranslation('degreeTrainer');
  const [currentPage, setCurrentPage] = useState('home');

  const closeSettings = () => {
    setIsSettingsOpen(false);
    
    setGameState((pre)=>pre!='end'?'playing':'end');
    document.body.classList.remove('modal-open');
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
    document.body.classList.add('modal-open');
  };

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={closeSettings} />
      <div className="relative w-[90%] max-w-4xl h-[80vh] bg-bg-common rounded-lg shadow-xl overflow-hidden">
        {/* Header with Settings label and close button */}
        <div className="flex items-center p-4 border-b border-bg-accent">
          {/* Mobile back button - always takes space but hidden when not needed */}
          <div className="w-8 md:hidden">
            {currentPage !== 'home' && (
              <button
                onClick={() => setCurrentPage('home')}
                className="p-2 hover:bg-bg-hover rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>
          
          <h2 className="text-xl font-semibold text-text-primary flex-1 text-center md:text-left">
            {t('settings.Settings')}
          </h2>
          
          <button
            onClick={closeSettings}
            className="p-2 hover:bg-bg-hover rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content container with navigation and content area */}
        <div className="flex h-[calc(100%-4rem)]">
          {/* Navigation Sidebar - Hidden on mobile */}
          <div className="w-48 border-r border-bg-accent bg-bg-common h-full hidden md:block">
          <nav className="p-4 space-y-2 bg-bg-common">
            <button
              onClick={() => setCurrentPage('game')}
              className={`w-full px-4 py-3 text-left rounded-lg ${
                currentPage === 'game' 
                  ? 'bg-notification-bg text-notification-text'
                  : 'text-text-primary hover:bg-bg-hover'
              }`}
            >
              {t('settings.GameSettings')}
            </button>
            <button
              onClick={() => setCurrentPage('practice')}
              className={`w-full px-4 py-3 text-left rounded-lg ${
                currentPage === 'practice' 
                  ? 'bg-notification-bg text-notification-text'
                  : 'text-text-primary hover:bg-bg-hover'
              }`}
            >
              {t('settings.PracticeSettings')}
            </button>
            <button
              onClick={() => setCurrentPage('statistics')}
              className={`w-full px-4 py-3 text-left rounded-lg ${
                currentPage === 'statistics'
                  ? 'bg-notification-bg text-notification-text'
                  : 'text-text-primary'
              }`}
            >
              {t('settings.Statistics')}
            </button>
            <button
              onClick={() => setCurrentPage('volume')}
              className={`w-full px-4 py-3 text-left rounded-lg ${
                currentPage === 'volume'
                  ? 'bg-notification-bg text-notification-text'
                  : 'text-text-primary'
              }`}
            >
              {t('settings.VolumeSettings')}
            </button>
            <button
              onClick={() => setCurrentPage('sound')}
              className={`w-full px-4 py-3 text-left rounded-lg ${
                currentPage === 'sound'
                  ? 'bg-notification-bg text-notification-text'
                  : 'text-text-primary'
              }`}
            >
              {t('settings.SoundSettings')}
            </button>
          </nav>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 flex flex-col pb-6 bg-bg-common"> {/* Add bottom padding to container */}
          <div className="p-6 overflow-y-auto h-full box-border scrollbar-hide bg-bg-common" style={{ 
            paddingBottom: '0',
            scrollbarGutter: 'stable' // Reserve space for scrollbar
          }}>
          {/* Home content - Different for mobile and desktop */}
          {currentPage === 'home' && (
            <div className="p-6">
              {/* Mobile navigation */}
              <div className="md:hidden">
              <div className="grid grid-cols-1 gap-4">
              <button
              onClick={() => setCurrentPage('game')}
              className={`p-6 bg-bg-common rounded-lg hover:bg-bg-hover transition-colors ${
                currentPage === 'game' 
                  ? 'bg-notification-bg text-notification-text'
                  : 'text-text-primary hover:bg-bg-hover'
              }`}
            >
              <h3 className="text-lg font-semibold text-text-primary">
              {t('settings.GameSettings')}
              </h3>
            </button>
                <button
                  onClick={() => setCurrentPage('practice')}
                  className={`p-6 bg-bg-common rounded-lg hover:bg-bg-hover transition-colors ${
                    currentPage === 'practice' 
                      ? 'bg-notification-bg text-notification-text'
                      : 'text-text-primary'
                  }`}
                >
                  <h3 className="text-lg font-semibold text-text-primary">
                    {t('settings.PracticeSettings')}
                  </h3>
                </button>
                <button
                  onClick={() => setCurrentPage('statistics')}
                  className="p-6 bg-bg-common rounded-lg hover:bg-bg-hover transition-colors"
                >
                  <h3 className="text-lg font-semibold text-text-primary">
                    {t('settings.Statistics')}
                  </h3>
                </button>
                <button
                  onClick={() => setCurrentPage('volume')}
                  className="p-6 bg-bg-common rounded-lg hover:bg-bg-hover transition-colors"
                >
                  <h3 className="text-lg font-semibold text-text-primary">
                    {t('settings.VolumeSettings')}
                  </h3>
                </button>
                <button
                  onClick={() => setCurrentPage('sound')}
                  className="p-6 bg-bg-common rounded-lg hover:bg-bg-hover transition-colors"
                >
                  <h3 className="text-lg font-semibold text-text-primary">
                    {t('settings.SoundSettings')}
                  </h3>
                </button>
              </div>
              
              {/* Desktop placeholder */}
              
            </div>
            </div> 
          )}
          {currentPage === 'home' && (
            <div className="hidden md:block text-center text-text-secondary">
              <p className="text-2xl">{t('settings.selectSetting')}</p>
            </div>
          )}
          {currentPage === 'game' && (
            <GameSettings settings={settings}  />
          )}
          {currentPage === 'practice' && (
            <PracticeSettings settings={settings}  />
          )}
          {currentPage === 'volume' && (
            <VolumeSettings settings={settings}  />
          )}
          {currentPage === 'statistics' && (
            <Statistics settings={settings}  />
          )}
          {currentPage === 'sound' && (
            <SoundSettings settings={settings}  playNote={playNote} />
          )}
          </div>
        </div>
      </div>
    </div></div>
  );
}

export default DegreeTrainerSettings;
