import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Bars3Icon, Cog6ToothIcon } from '@heroicons/react/24/solid';
import Header from '@components/SharedComponents/Header';
import HeaderTitle from '@components/SharedComponents/HeaderTitle';
import HeaderButtons from '@components/SharedComponents/HeaderButtons';
import HeaderButton from '@components/SharedComponents/HeaderButton';

import Sidebar from '@components/Sidebar';
import ChordPracticeGame from '@ChordTrainer/ChordGames/ChordPracticeGame';
import DiatonicGame from '@ChordTrainer/ChordGames/DiatonicGame';
import Settings from './Settings';

import useChordGameSettings from '@ChordTrainer/useChordGameSettings';
import useChordPracticeGame from '@ChordTrainer/ChordGames/ChordPracticeGame/useChordPracticeGame';
import useDiatonicGame from '@ChordTrainer/ChordGames/DiatonicGame/useDiatonicGame';

const apps = [
  { name: 'earTrainer', path: '/ear-trainer' }
];

const ChordTrainer = () => {
  const { t } = useTranslation('chordGame');
  const [isAppSidebarOpen, setIsAppSidebarOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const globalSettings = useChordGameSettings();
  const chordPracticeGameSettings = useChordPracticeGame();
  const diatonicGameSettings = useDiatonicGame();
  const settings = {globalSettings, chordPracticeGameSettings,diatonicGameSettings}
  const { mode } = globalSettings;

  const renderGameMode = () => {
    switch (mode) {
      case 'Chord Practice':
        return <ChordPracticeGame chordPracticeGameSettings={chordPracticeGameSettings} />;
      case 'Diatonic':
        return <DiatonicGame diatonicGameSettings={diatonicGameSettings} />;
      case 'Progression':
        return <div>Progression Mode Coming Soon!</div>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[100vh] font-jazz">
      <Header>
        <HeaderTitle>{t('trainer.title')}</HeaderTitle>
        <HeaderButtons>
            <HeaderButton onClick={() => setIsSettingsModalOpen(true)}>
              <Cog6ToothIcon className="h-6 w-6" />
            </HeaderButton>
            <HeaderButton onClick={() => setIsAppSidebarOpen(!isAppSidebarOpen)} className="md:hidden">
              <Bars3Icon className="h-6 w-6" />
            </HeaderButton>
            <div className="hidden md:flex">
              {apps.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="px-4 py-2 rounded-md bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {t(`trainer.apps.${item.name}`)}
                </Link>
              ))}
            </div>
            
        </HeaderButtons>
      </Header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isAppSidebarOpen} setIsOpen={setIsAppSidebarOpen} />
        
        <main className="flex-1 pt-20 overflow-y-auto bg-slate-50 dark:bg-slate-900">
          <div className="max-w-6xl mx-auto">
            {renderGameMode()}
          </div>
        </main>
      </div>

      {/* Settings Modal */}
      <Settings
        isOpen={isSettingsModalOpen}
        setIsOpen={setIsSettingsModalOpen}
        settings={settings}
      />
    </div>
  );
};

export default ChordTrainer;
