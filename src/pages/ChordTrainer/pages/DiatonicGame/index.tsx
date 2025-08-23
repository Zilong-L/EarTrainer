import React from 'react';

// @ts-ignore
import Settings from '@ChordTrainer/components/Settings';
import DiatonicSettings from './DiatonicSettings';
import useDiatonicGame from './useDiatonicGame'
import GameDisplay from './GameDisplay'
import useSettingsModalStore from '@ChordTrainer/stores/settingsStore';

const DiatonicGame: React.FC = () => {
    const { isOpen, setIsOpen } = useSettingsModalStore();
    const DiatonicGame = useDiatonicGame();
    return (
        <main>
            <div className="flex-1 pt-20 overflow-y-auto bg-bg-main">
                <div className="max-w-6xl mx-auto">
                    <GameDisplay diatonicGameSettings={DiatonicGame} />
                </div>
            </div>
            <Settings
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                gameSettingsComponent={<DiatonicSettings diatonicGameSettings={DiatonicGame} />}
            />
        </main>
    );
};

export default DiatonicGame;