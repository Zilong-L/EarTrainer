import React from 'react';

import SettingsPanel from '@components/Settings/SettingsPanel';
import SoundSettings from '@components/Settings/SoundSettings';
import DiatonicSettings from './DiatonicSettings';
import useDiatonicGame from './useDiatonicGame';
import GameDisplay from './GameDisplay';
import useSettingsModalStore from '@ChordTrainer/stores/settingsStore';

const DiatonicGame: React.FC = () => {
  const { isOpen, setIsOpen } = useSettingsModalStore();
  const DiatonicGame = useDiatonicGame();
  return (
    <>
      <div className="max-w-6xl mx-auto px-0 sm:px-4 h-full flex flex-col">
        <GameDisplay diatonicGameSettings={DiatonicGame} />
      </div>
      <SettingsPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="settings.title"
        components={[
          {
            id: 'game',
            label: 'settings.modes.game',
            component: DiatonicSettings,
            props: { diatonicGameSettings: DiatonicGame },
          },
          {
            id: 'sound',
            label: 'settings.modes.soundSettings',
            component: SoundSettings,
          },
        ]}
      />
    </>
  );
};

export default DiatonicGame;
