import React from 'react';
import { useTranslation } from 'react-i18next';
import { LightBulbIcon } from '@heroicons/react/24/solid';
import { motion } from 'motion/react';
import Button from '@components/SharedComponents/Button';

const DesktopReplayButtons = ({
    handleStartGame,
    onReplay,
    onBrokenChord,
    onPlayTonic,
    isPlayingSound,
    gameStarted,
}) => {
    const { t } = useTranslation('chordTrainer');

    if (!gameStarted) return <div className="hidden lg:flex justify-center items-center gap-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Button onClick={handleStartGame} className='w-32 h-32 rounded-full shadow-md flex items-center justify-center bg-bg-accent text-text-primary text-4xl transition-colors'>start</Button>
    </div>
    return (
        <div className="hidden lg:flex justify-center items-center gap-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.button
                key="replay-button"
                initial={{ scale: 0 }}
                animate={{ x: 0, scale: 1, transition: { duration: 0.5, bounce: 0.3, type: 'spring' } }}
                exit={{ scale: 0 }}
                whileHover={{ scale: isPlayingSound ? 1 : 1.05, duration: 0.5 }}
                whileTap={{ scale: isPlayingSound ? 1 : 0.95 }}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                onClick={isPlayingSound ? undefined : onReplay}
                className={`w-32 h-32 rounded-full shadow-md flex items-center justify-center bg-bg-accent text-text-primary text-3xl transition-colors ${isPlayingSound ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <span className=" text-4xl">{t('buttons.replay')}</span>
            </motion.button>
            <motion.button
                key="broken-chord-button"
                initial={{ scale: 0 }}
                animate={{ x: 0, scale: 1, transition: { duration: 0.5, bounce: 0.3, type: 'spring' } }}
                exit={{ scale: 0 }}
                whileHover={{ scale: isPlayingSound ? 1 : 1.05, duration: 0.5 }}
                whileTap={{ scale: isPlayingSound ? 1 : 0.95 }}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                onClick={isPlayingSound ? undefined : onBrokenChord}
                className={`w-32 h-32 rounded-full shadow-md flex items-center justify-center bg-bg-accent text-text-primary text-3xl transition-colors ${isPlayingSound ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <span className=" text-4xl">{t('buttons.stair')}</span>
            </motion.button>
            <motion.button
                key="play-tonic-button"
                initial={{ scale: 0 }}
                animate={{ x: 0, scale: 1, transition: { duration: 0.5, bounce: 0.3, type: 'spring' } }}
                exit={{ scale: 0 }}
                whileHover={{ scale: isPlayingSound ? 1 : 1.05, duration: 0.5 }}
                whileTap={{ scale: isPlayingSound ? 1 : 0.95 }}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                onClick={isPlayingSound ? undefined : onPlayTonic}
                className={`w-32 h-32 rounded-full shadow-md flex items-center justify-center bg-bg-accent text-text-primary text-3xl transition-colors ${isPlayingSound ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                title={t('buttons.playTonic')}
            >
                <LightBulbIcon className="h-6 w-6" />
            </motion.button>
        </div>
    );
};

const PhoneReplayButtons = ({
    handleStartGame,
    onReplay,
    onBrokenChord,
    onPlayTonic,
    isPlayingSound,
    gameStarted,
}) => {
    const { t } = useTranslation('chordTrainer');

    if (!gameStarted) return <div className="grid ">
        <Button onClick={handleStartGame} className="text-4xl lg:hidden">start</Button>
    </div>
    return (
        <div className="grid grid-cols-2 gap-4 lg:hidden">
            <Button
                onClick={isPlayingSound ? undefined : onReplay}
                className={`w-full h-16 bg-bg-common hover:bg-bg-hover text-text-main rounded-lg transition-colors flex items-center justify-center ${isPlayingSound ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <span className=" text-4xl">{t('buttons.replay')}</span>
            </Button>
            <Button
                onClick={isPlayingSound ? undefined : onBrokenChord}
                className={`w-full h-16 bg-bg-common hover:bg-bg-hover text-text-main rounded-lg transition-colors flex items-center justify-center ${isPlayingSound ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <span className=" text-4xl">{t('buttons.stair')}</span>
            </Button>
            <Button
                onClick={isPlayingSound ? undefined : onPlayTonic}
                className={`w-full h-16 bg-bg-common hover:bg-bg-hover text-text-main rounded-lg transition-colors flex items-center justify-center ${isPlayingSound ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={t('buttons.playTonic')}
            >
                <LightBulbIcon className="h-6 w-6" />
            </Button>
        </div>
    );
};

export { DesktopReplayButtons, PhoneReplayButtons }; 