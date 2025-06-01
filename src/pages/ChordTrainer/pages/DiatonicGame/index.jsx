import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Cog6ToothIcon, BookOpenIcon } from '@heroicons/react/24/solid';

import Header from '@components/Header';
import HeaderTitle from '@components/HeaderTitle';
import HeaderButtons from '@components/HeaderButtons';
import HeaderButton from '@components/HeaderButton';

import Settings from '@ChordTrainer/components/Settings';
import DiatonicSettings from './DiatonicSettings';
import useDiatonicGame from './useDiatonicGame'
import GameDisplay from './GameDisplay'
import useSettingsModalStore from '@ChordTrainer/stores/settingsStore';
const DiatonicGame = () => {
    const { t, i18n } = useTranslation('chordGame');
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
