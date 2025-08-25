import React from 'react';
import { useTranslation } from 'react-i18next';
import { LightBulbIcon } from '@heroicons/react/24/solid';
import Button from '@components/Button';
import MotionButton from '@components/MotionButton';
import useI18nStore from '@stores/i18nStore';

interface ReplayButtonsProps {
  handleStartGame: () => void;
  onReplay: () => void;
  onPlayChordSimple: () => void;
  onPlayTonic: () => void;
  gameStarted: boolean;
  isAdvance: string;
  setIsAdvance: (value: string) => void;
  isLoadingInstrument: boolean;
}

const DesktopReplayButtons: React.FC<ReplayButtonsProps> = ({
  handleStartGame,
  onReplay,
  onPlayChordSimple, // Changed from onBrokenChord
  onPlayTonic,
  gameStarted,
  isAdvance,
  setIsAdvance,
  isLoadingInstrument,
}) => {
  const { namespace } = useI18nStore();
  const { t } = useTranslation(namespace);

  if (!gameStarted)
    return (
      <div className="hidden lg:flex justify-center items-center gap-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Button
          onClick={handleStartGame}
          disabled={isLoadingInstrument}
          className={`w-32 h-32 rounded-full shadow-md flex items-center justify-center bg-bg-accent text-text-primary text-4xl transition-colors ${isLoadingInstrument ? 'opacity-50' : ''}`}
        >
          {t('buttons.start')}
        </Button>
      </div>
    );

  return (
    <div className="hidden lg:flex justify-center items-center gap-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <MotionButton
        onClick={onReplay}
        isDisabled={isLoadingInstrument}
        className={`w-32 h-32 bg-bg-accent text-text-primary text-3xl ${isLoadingInstrument ? 'opacity-50' : ''}`}
      >
        <span className="text-4xl">{t('buttons.replay')}</span>
      </MotionButton>
      <MotionButton
        onClick={onPlayChordSimple} // Use the new prop
        isDisabled={isLoadingInstrument}
        className={`w-32 h-32 bg-bg-accent text-text-primary text-3xl ${isLoadingInstrument ? 'opacity-50' : ''}`}
      >
        <span className="text-4xl">{t('buttons.chord')}</span>{' '}
        {/* Change translation key */}
      </MotionButton>
      <MotionButton
        onClick={onPlayTonic}
        isDisabled={isLoadingInstrument}
        className={`w-32 h-32 bg-bg-accent text-text-primary text-3xl ${isLoadingInstrument ? 'opacity-50' : ''}`}
        title={t('buttons.playTonic')}
      >
        <LightBulbIcon className="h-6 w-6" />
      </MotionButton>
      <MotionButton
        onClick={() => setIsAdvance('Now')}
        isDisabled={isLoadingInstrument}
        className={`w-32 h-32 text-4xl ${isAdvance === 'No' ? 'bg-bg-accent text-text-primary' : isAdvance === 'Pending' ? 'bg-green-700 text-white' : 'bg-green-500 text-white'} ${isLoadingInstrument ? 'opacity-50' : ''}`}
      >
        {t('buttons.next')}
      </MotionButton>
    </div>
  );
};

const PhoneReplayButtons: React.FC<ReplayButtonsProps> = ({
  handleStartGame,
  onReplay,
  onPlayChordSimple, // Changed from onBrokenChord
  onPlayTonic,
  gameStarted,
  isAdvance,
  setIsAdvance,
  isLoadingInstrument,
}) => {
  const { namespace } = useI18nStore();
  const { t } = useTranslation(namespace);

  if (!gameStarted)
    return (
      <div className="grid ">
        <Button
          onClick={handleStartGame}
          disabled={isLoadingInstrument}
          className={`text-4xl lg:hidden ${isLoadingInstrument ? 'opacity-50' : ''}`}
        >
          {t('buttons.start')}
        </Button>
      </div>
    );

  return (
    <div className="grid grid-cols-2 gap-4 lg:hidden">
      <Button
        onClick={onReplay}
        disabled={isLoadingInstrument}
        className={`w-full h-16 bg-bg-common hover:bg-bg-hover text-text-main rounded-lg transition-colors flex items-center justify-center ${isLoadingInstrument ? 'opacity-50' : ''}`}
      >
        <span className=" text-4xl">{t('buttons.replay')}</span>
      </Button>
      <Button
        onClick={onPlayChordSimple} // Use the new prop
        disabled={isLoadingInstrument}
        className={`w-full h-16 bg-bg-common hover:bg-bg-hover text-text-main rounded-lg transition-colors flex items-center justify-center ${isLoadingInstrument ? 'opacity-50' : ''}`}
      >
        <span className=" text-4xl">{t('buttons.chord')}</span>{' '}
        {/* Change translation key */}
      </Button>
      <Button
        onClick={onPlayTonic}
        disabled={isLoadingInstrument}
        className={`w-full h-16 bg-bg-common hover:bg-bg-hover text-text-main rounded-lg transition-colors flex items-center justify-center ${isLoadingInstrument ? 'opacity-50' : ''}`}
        title={t('buttons.playTonic')}
      >
        <LightBulbIcon className="h-6 w-6" />
      </Button>
      <Button
        onClick={() => setIsAdvance('Now')}
        disabled={isLoadingInstrument}
        className={`w-full h-16 text-4xl rounded-lg transition-colors flex items-center justify-center bg-bg-common hover:bg-bg-hover text-text-main ${isAdvance === 'No' ? 'bg-bg-accent text-text-primary' : isAdvance === 'Pending' ? 'bg-green-700 text-white' : 'bg-green-500 text-white'} ${isLoadingInstrument ? 'opacity-50' : ''}`}
      >
        {t('buttons.next')}
      </Button>
    </div>
  );
};

export { DesktopReplayButtons, PhoneReplayButtons };
