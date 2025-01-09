import React from 'react';
import { useTranslation } from 'react-i18next';
import FreeSettings from '@components/EarTrainers/DegreeTrainer/Games/Free/FreeSettings';
import ChallengeSettings from '@components/EarTrainers/DegreeTrainer/Games/Challenge/ChallengeSettings';

function GameSettings({ settings }) {
  const {
      mode,
    setMode,
    stats:{
      setCurrentPracticeRecords,
    }
  } = settings


  const { t } = useTranslation('degreeTrainer');


  return (
    <div className="p-6 space-y-12">
      <div className="flex gap-2">
        <button
          onClick={() => {
            setMode('free');
            setCurrentPracticeRecords({ total: 0, correct: 0 });
          }}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            mode === 'free'
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
          className={`flex-1 py-2 rounded-lg transition-colors ${
            mode === 'challenge'
              ? 'bg-notification-bg text-notification-text'
              : 'bg-bg-main text-text-primary hover:bg-bg-hover'
          }`}
        >
          {t('intro.challengeMode')}
        </button>
      </div>

      {mode === 'free' && (
        <FreeSettings 
        FreeTrainerSettings={settings.FreeTrainerSettings}
        />
      )}

      {mode === 'challenge' && (
        <ChallengeSettings 
        ChallengeTrainerSettings={settings.ChallengeTrainerSettings}
        />
      )}
    </div>
  );
}

export default GameSettings;
