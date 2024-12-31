import React from 'react';
import { useTranslation } from 'react-i18next';
import FreeSettings from '@components/EarTrainers/DegreeTrainer/Games/Free/FreeSettings';
import ChallengeSettings from '@components/EarTrainers/DegreeTrainer/Games/Challenge/ChallengeSettings';

function GameSettings({ settings }) {
  console.log('gamesettings', settings)
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
              ? 'bg-cyan-600 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
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
              ? 'bg-cyan-600 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
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
