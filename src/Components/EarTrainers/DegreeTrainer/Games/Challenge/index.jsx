import React from 'react';
import Button from '@components/SharedComponents/Button';
import { useTranslation } from 'react-i18next';
import { ArrowPathIcon, ForwardIcon } from '@heroicons/react/24/solid';
import CardStack from '../Shared/CardStack';

const ChallengeMode = ({ ChallengeTrainerSettings }) => {
  const { 
    currentNote,
    disabledNotes,
    filteredNotes,
    isAdvance,
    setActiveNote,
    playNote,
    gameState,
    setGameState,
    rootNote,
    currentPracticeRecords,
    currentLevel,
    bpm,
    setIsAdvance,
    useSolfege,
    isHandfree
  } = ChallengeTrainerSettings;
  const { t } = useTranslation('degreeTrainer');

  const renderRecords = () => {
    const totalResults = currentPracticeRecords;
    const accuracy = totalResults.total > 0 
      ? Math.round((totalResults.correct / totalResults.total) * 100)
      : 0;

    return (
      <div className="space-y-3 text-text-primary md:space-y-4">
        <p className="text-lg md:text-2xl">{t('home.level')}: {currentLevel.level}</p>
        <p className="text-lg md:text-2xl">{t('home.totalAttempts')} {totalResults.total} / {currentLevel.minTests}</p>
        <p className="text-lg md:text-2xl">{t('home.correctCount')} {totalResults.correct}</p>
        <p className="text-2xl md:text-4xl">
          {accuracy >= 90 ? '⭐⭐⭐' :
           accuracy >= 80 ? '⭐⭐' :
           accuracy >= 70 ? '⭐' : ''}
        </p>
      </div>
    );
  };

  return (
 <div className="flex flex-col justify-end h-full mb-8">
    <div className="flex-grow" />
  <CardStack
      currentNote={currentNote}
      disabledNotes={disabledNotes}
      filteredNotes={filteredNotes}
      isAdvance={isAdvance}
      setActiveNote={setActiveNote}
      rootNote={rootNote}
      isHandfree={isHandfree}
      useSolfege={useSolfege}
      bpm={bpm}
    >
    </CardStack>
      <Button
        variant="primary"
        onClick={() => {
          if (gameState === 'end') {
            setGameState('start');
          } else {
            if (isAdvance == 'Ready') {
              setIsAdvance('Now');
            } else {
              playNote(currentNote);
            }
          }
        }}
        className="lg:hidden w-full p-4 md:p-6 flex justify-center items-center"
      >
        {gameState === 'end' ? (
          <ForwardIcon className="w-12 h-12 md:w-16 md:h-16" />
        ) : isAdvance == 'Ready' ?
          <ForwardIcon className="w-12 h-12 md:w-16 md:h-16" />
          : (
            <ArrowPathIcon className="w-12 h-12 md:w-16 md:h-16" />
          )}
      </Button>  
      </div>
      );
};

export default ChallengeMode;
