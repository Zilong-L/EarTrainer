import React from 'react';
import SettingsPanel from '@components/Settings/SettingsPanel';
import SoundSettings from '@components/Settings/SoundSettings';
import useChordPracticeGame from './useChordPracticeGame';
import ChordPracticeSettings from './ChordPracticeSettings';
import GameDisplay from './GameDisplay';
import useSettingsModalStore from '@ChordTrainer/stores/settingsStore';

const ChordPracticeGame: React.FC = () => {
  const { isOpen, setIsOpen } = useSettingsModalStore();
  const chordPracticeGame = useChordPracticeGame();

  return (
    <>
      <div className="max-w-6xl mx-auto px-0 sm:px-4 h-full flex flex-col">
        <GameDisplay chordPracticeGameSettings={chordPracticeGame} />
      </div>
      <SettingsPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="settings.title"
        components={[
          {
            id: 'game',
            label: 'settings.modes.game',
            component: ChordPracticeSettings,
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

export default ChordPracticeGame;
