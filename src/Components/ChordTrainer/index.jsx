import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Bars3Icon, Cog6ToothIcon } from '@heroicons/react/24/solid';
import Header from '@components/SharedComponents/Header';
import HeaderTitle from '@components/SharedComponents/HeaderTitle';
import HeaderButtons from '@components/SharedComponents/HeaderButtons';
import HeaderButton from '@components/SharedComponents/HeaderButton';

import ChordPracticeGame from '@ChordTrainer/ChordGames/ChordPracticeGame';
import DiatonicGame from '@ChordTrainer/ChordGames/DiatonicGame';
import Settings from './Settings';

import useChordGameSettings from '@ChordTrainer/useChordGameSettings';
import useChordPracticeGame from '@ChordTrainer/ChordGames/ChordPracticeGame/useChordPracticeGame';
import useDiatonicGame from '@ChordTrainer/ChordGames/DiatonicGame/useDiatonicGame';


const ChordTrainer = () => {
  const { t } = useTranslation('chordGame');
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
    <div className="flex flex-col h-[100vh] ">
      <Header>
        <HeaderTitle>{t('trainer.title')}</HeaderTitle>
        <HeaderButtons>
            <HeaderButton onClick={() => setIsSettingsModalOpen(true)}>
              <Cog6ToothIcon className="h-6 w-6" />
            </HeaderButton>

            
            
        </HeaderButtons>
      </Header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        <main className="flex-1 pt-20 overflow-y-auto bg-bg-main">
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
