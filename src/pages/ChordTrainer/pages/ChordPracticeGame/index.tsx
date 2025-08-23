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
        <main>
            <div className="flex-1 pt-20 overflow-y-auto bg-bg-main">
                <div className="max-w-6xl mx-auto">
                    <GameDisplay chordPracticeGameSettings={chordPracticeGame} />
                </div>
            </div>
            <SettingsPanel
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="settings.title"
                components={[
                    {
                        id: 'game',
                        label: 'settings.modes.game',
                        component: ChordPracticeSettings
                    },
                    {
                        id: 'sound',
                        label: 'settings.modes.soundSettings',
                        component: SoundSettings
                    }
                ]}
            />
        </main>
    );
};

export default ChordPracticeGame;