import React from 'react';
import { useTranslation } from 'react-i18next';
import { LightBulbIcon } from '@heroicons/react/24/solid';
import Button from '@components/SharedComponents/Button';
import MotionButton from '@components/SharedComponents/MotionButton';
import useI18nStore from '@stores/i18nStore';
const DesktopReplayButtons = ({
    handleStartGame,
    onReplay,
    onPlayChordSimple, // Changed from onBrokenChord
    onPlayTonic,
    gameStarted,
    isAdvance,
    setIsAdvance,
}) => {
    const { namespace } = useI18nStore();
    const { t } = useTranslation(namespace);

    if (!gameStarted) return <div className="hidden lg:flex justify-center items-center gap-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Button onClick={handleStartGame} className='w-32 h-32 rounded-full shadow-md flex items-center justify-center bg-bg-accent text-text-primary text-4xl transition-colors'>{t('buttons.start')}</Button>
    </div>;

    return (
        <div className="hidden lg:flex justify-center items-center gap-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <MotionButton
                onClick={onReplay}
                className="w-32 h-32 bg-bg-accent text-text-primary text-3xl"
            >
                <span className="text-4xl">{t('buttons.replay')}</span>
            </MotionButton>
            <MotionButton
                onClick={onPlayChordSimple} // Use the new prop
                className="w-32 h-32 bg-bg-accent text-text-primary text-3xl"
            >
                <span className="text-4xl">{t('buttons.chord')}</span> {/* Change translation key */}
            </MotionButton>
            <MotionButton
                onClick={onPlayTonic}
                className="w-32 h-32 bg-bg-accent text-text-primary text-3xl"
                title={t('buttons.playTonic')}
            >
                <LightBulbIcon className="h-6 w-6" />
            </MotionButton>
            {isAdvance === 'Ready' && (
                <MotionButton
                    onClick={() => setIsAdvance('Now')}
                    className="w-32 h-32 bg-green-500 text-white text-4xl"
                >
                    {t('buttons.next')}
                </MotionButton>
            )}
        </div>
    );
};

const PhoneReplayButtons = ({
    handleStartGame,
    onReplay,
    onPlayChordSimple, // Changed from onBrokenChord
    onPlayTonic,
    gameStarted,
    isAdvance,
    setIsAdvance,
}) => {
    const { namespace } = useI18nStore();
    const { t } = useTranslation(namespace);

    if (!gameStarted) return <div className="grid ">
        <Button onClick={handleStartGame} className="text-4xl lg:hidden">{t('buttons.start')}</Button>
    </div>;

    return (
        <div className="grid grid-cols-2 gap-4 lg:hidden">
            <Button
                onClick={onReplay}
                className={`w-full h-16 bg-bg-common hover:bg-bg-hover text-text-main rounded-lg transition-colors flex items-center justify-center`}
            >
                <span className=" text-4xl">{t('buttons.replay')}</span>
            </Button>
            <Button
                onClick={onPlayChordSimple} // Use the new prop
                className={`w-full h-16 bg-bg-common hover:bg-bg-hover text-text-main rounded-lg transition-colors flex items-center justify-center`}
            >
                <span className=" text-4xl">{t('buttons.chord')}</span> {/* Change translation key */}
            </Button>
            <Button
                onClick={onPlayTonic}
                className={`w-full h-16 bg-bg-common hover:bg-bg-hover text-text-main rounded-lg transition-colors flex items-center justify-center`}
                title={t('buttons.playTonic')}
            >
                <LightBulbIcon className="h-6 w-6" />
            </Button>
            {isAdvance === 'Ready' && (
                <Button
                    onClick={() => setIsAdvance('Now')}
                    className="w-full h-16 bg-green-500 text-white text-4xl rounded-lg transition-colors flex items-center justify-center"
                >
                    {t('buttons.next')}
                </Button>
            )}
        </div>
    );
};

export { DesktopReplayButtons, PhoneReplayButtons };
