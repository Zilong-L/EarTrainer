import React from 'react';
import { useTranslation } from 'react-i18next';
import FreeSettings from '@EarTrainers/DegreeTrainer/Games/Free/FreeSettings';
import ChallengeSettings from '@EarTrainers/DegreeTrainer/Games/Challenge/ChallengeSettings';
import { useDegreeTrainerSettings } from '@EarTrainers/DegreeTrainer/Settings/useDegreeTrainerSettings';

function GameSettings({ currentGameSettings }) {
  const {
    mode,
    setMode,
    stats: {
      setCurrentPracticeRecords,
    }
  } = useDegreeTrainerSettings()


  const { t } = useTranslation('degreeTrainer');


  return (
    <div className="p-6 space-y-12">
      <div className="flex gap-2">
        <button
          onClick={() => {
            setMode('free');
            setCurrentPracticeRecords({ total: 0, correct: 0 });
          }}
          className={`flex-1 py-2 rounded-lg transition-colors ${mode === 'free'
            ? 'bg-notification-bg text-notification-text'
            : 'bg-bg-main text-text-primary hover:bg-bg-hover'
            }`}
        >
          {t('intro.freeMode')}
        </button>
        <button
          onClick={() => {
            setMode('challenge');
            setCurrentPracticeRecords({ total: 0, correct: 0 });

          }}
          className={`flex-1 py-2 rounded-lg transition-colors ${mode === 'challenge'
            ? 'bg-notification-bg text-notification-text'
            : 'bg-bg-main text-text-primary hover:bg-bg-hover'
            }`}
        >
          {t('intro.challengeMode')}
        </button>
      </div>

      {mode === 'free' && (
        <FreeSettings
          FreeTrainerSettings={currentGameSettings}
        />
      )}

      {mode === 'challenge' && (
        <ChallengeSettings
          ChallengeTrainerSettings={currentGameSettings}
        />
      )}
    </div>
  );
}

export default GameSettings;
