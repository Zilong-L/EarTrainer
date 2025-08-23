import React from 'react';
// @ts-ignore
import Settings from '@ChordTrainer/components/Settings';
import useChordPracticeGame from './useChordPracticeGame';
import ChordPracticeSettings from './ChordPracticeSettings';
import GameDisplay from './GameDisplay';
import useSettingsModalStore from '@ChordTrainer/stores/settingsStore';

const ChordPracticeGame: React.FC = () => {
    const { isOpen, setIsOpen } = useSettingsModalStore();
    const chordPracticeGame = useChordPracticeGame();

    return (
        <main>
            <div className="flex-1 pt-20 overflow-y-auto bg-bg-main">
                <div className="max-w-6xl mx-auto">
                    <GameDisplay chordPracticeGameSettings={chordPracticeGame} />
                </div>
            </div>
            <Settings
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                gameSettingsComponent={<ChordPracticeSettings />}
            />
        </main>
    );
};

export default ChordPracticeGame;