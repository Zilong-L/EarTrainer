import React from 'react';
import { useTranslation } from 'react-i18next';
import { LightBulbIcon } from '@heroicons/react/24/solid';
import Button from '@components/SharedComponents/Button';
import MotionButton from '@components/SharedComponents/MotionButton';
import useI18nStore from '@stores/i18nStore';
const DesktopReplayButtons = ({
    handleStartGame,
    onReplay,
    onBrokenChord,
    onPlayTonic,
    isPlayingSound,
    gameStarted,
    isAdvance,
    setIsAdvance,
}) => {
    const { namespace } = useI18nStore();
    const { t } = useTranslation(namespace);
    console.log(t('buttons.next'))
    if (!gameStarted) return <div className="hidden lg:flex justify-center items-center gap-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Button onClick={handleStartGame} className='w-32 h-32 rounded-full shadow-md flex items-center justify-center bg-bg-accent text-text-primary text-4xl transition-colors'>start</Button>
    </div>;

    return (
        <div className="hidden lg:flex justify-center items-center gap-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <MotionButton
                onClick={onReplay}
                isDisabled={isPlayingSound}
                className="w-32 h-32 bg-bg-accent text-text-primary text-3xl"
            >
                <span className="text-4xl">{t('buttons.replay')}</span>
            </MotionButton>
            <MotionButton
                onClick={onBrokenChord}
                isDisabled={isPlayingSound}
                className="w-32 h-32 bg-bg-accent text-text-primary text-3xl"
            >
                <span className="text-4xl">{t('buttons.stair')}</span>
            </MotionButton>
            <MotionButton
                onClick={onPlayTonic}
                isDisabled={isPlayingSound}
                className="w-32 h-32 bg-bg-accent text-text-primary text-3xl"
                title={t('buttons.playTonic')}
            >
                <LightBulbIcon className="h-6 w-6" />
            </MotionButton>
            {isAdvance === 'Ready' && (
                <MotionButton
                    onClick={() => setIsAdvance('Now')}
                    isDisabled={isPlayingSound}
                    className="w-32 h-32 bg-green-500 text-white text-4xl"
                >
                    {t('buttons.next') || 'Next'}
                </MotionButton>
            )}
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
    isAdvance,
    setIsAdvance,
}) => {
    const { namespace } = useI18nStore();
    const { t } = useTranslation(namespace);

    if (!gameStarted) return <div className="grid ">
        <Button onClick={handleStartGame} className="text-4xl lg:hidden">start</Button>
    </div>;

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
            {isAdvance === 'Ready' && (
                <Button
                    onClick={() => setIsAdvance('Now')}
                    className="w-full h-16 bg-green-500 text-white text-4xl rounded-lg transition-colors flex items-center justify-center"
                >
                    {t('buttons.next') || 'Next'}
                </Button>
            )}
        </div>
    );
};

export { DesktopReplayButtons, PhoneReplayButtons };
