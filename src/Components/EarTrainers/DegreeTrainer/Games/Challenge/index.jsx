import React from 'react';
import { useTranslation } from 'react-i18next';
import CardStack from '../Shared/CardStack';
import { DesktopStartButton, PhoneStartButton } from '../Shared/StartButtons';

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
    userProgress,
    bpm,
    setIsAdvance,
    useSolfege,
    isHandfree,
    isPlayingSound
  } = ChallengeTrainerSettings;
  const { t } = useTranslation('degreeTrainer');

  const renderRecords = () => {
    const totalResults = currentPracticeRecords;
    const accuracy = totalResults.total > 0 
      ? Math.round((totalResults.correct / totalResults.total) * 100)
      : 0;

    return (
      <div className="space-y-3 text-text-primary md:space-y-4">
        <p className="text-lg md:text-2xl">{t('home.level')}: {currentLevel+1}</p>
        <p className="text-lg md:text-2xl">{t('home.totalAttempts')} {totalResults.total} / {userProgress[currentLevel].minTests}</p>
        <p className="text-lg md:text-2xl">{t('home.correctCount')} {totalResults.correct}</p>
        <p className="text-2xl md:text-4xl">
          {accuracy >= 90 ? '⭐⭐⭐' :
           accuracy >= 80 ? '⭐⭐' :
           accuracy >= 70 ? '⭐' : ''}
        </p>
      </div>
    );
  };
  const handleButton = () => {
    if (gameState === 'end') {
      setGameState('start');
    } else {
      if (isAdvance === 'Ready') {
        setIsAdvance('Now');
      } else {
        playNote(currentNote);
      }
    }
  }
  return (
 <div className="flex flex-col justify-end h-full mb-8">
    {renderRecords()}
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
      gameState={gameState}
    >
    </CardStack>
    {isHandfree?<></>:(<div
        className="
          hidden
          lg:flex
          items-center
          justify-center
          absolute
          top-1/2
          left-1/2
          transform
          -translate-x-1/2
          -translate-y-1/2
        "
      >
        <DesktopStartButton
          gameState={gameState}
          isAdvance={isAdvance}
          isPlayingSound={isPlayingSound}
          onClick={handleButton}
        />
      </div>)}
      <PhoneStartButton gameState={gameState} isAdvance={isAdvance} onClick={handleButton} isPlayingSound={isPlayingSound} /> 
      </div>
      );
};

export default ChallengeMode;
