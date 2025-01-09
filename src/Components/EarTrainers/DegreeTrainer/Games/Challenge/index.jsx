import React from 'react';
import Button from '@components/SharedComponents/Button';
import * as Tone from 'tone';
import { useTranslation } from 'react-i18next';
import { isCorrect } from '@utils/GameLogics';
import { ArrowPathIcon, ForwardIcon } from '@heroicons/react/24/solid';
import { SolfegeMapping } from '@components/EarTrainers/DegreeTrainer/Constants';

const ChallengeMode = ({ChallengeTrainerSettings}) => {
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
      {renderRecords()}
      <div className="flex-grow" />
      <div className="grid grid-cols-3 gap-4 mb-4 md:gap-6">
        {filteredNotes.map((note) => {
          const noteName = Tone.Frequency(Tone.Frequency(rootNote).toMidi() + note.distance, 'midi').toNote();
          const isCorrectAnswer = isCorrect(noteName, currentNote) && isAdvance !=='No';
          
          return (
            <Button
              key={note.name}
              variant="primary"
              onClick={() => setActiveNote(noteName)}
              className={`h-16 text-2xl md:h-24 md:text-3xl relative ${
                isCorrectAnswer ? 'correct-answer' : ''
              }`}
              style={isCorrectAnswer && isAdvance ? {
                '--x': `${Math.random() * 100}%`,
                '--y': `${Math.random() * 100}%`,
                '--animation-duration': `${(60 / bpm) * 1.5}s`
              } : {}}
              disabled={disabledNotes.some(disabledNote => 
                noteName.slice(0, -1) === disabledNote.slice(0, -1)
              )}
              data-note={noteName.slice(0, -1)}
            >
              {useSolfege ? SolfegeMapping[note.name] || note.name : note.name}
            </Button>
          );
        })}
      </div>
      <Button
        variant="primary"
        onClick={() => {
          if (gameState === 'end') {
            setGameState('start');
          } else {
            if(isAdvance == 'Ready'){
              setIsAdvance('Now');
            }else {
            playNote(currentNote);
          }
          }
        }}
        className="w-full p-4 md:p-6 flex justify-center items-center"
      >
        {gameState === 'end' ? (
          <ForwardIcon className="w-12 h-12 md:w-16 md:h-16" />
        ) : isAdvance == 'Ready'?
        <ForwardIcon className="w-12 h-12 md:w-16 md:h-16" />
        :(
          <ArrowPathIcon className="w-12 h-12 md:w-16 md:h-16" />
        )}
      </Button>
    </div>
  );
};

export default ChallengeMode;
