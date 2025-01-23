import React from 'react';
import Button from '@components/SharedComponents/Button';
import { useTranslation } from 'react-i18next';
import { ArrowPathIcon, ForwardIcon } from '@heroicons/react/24/solid';
import CardStack from '../Shared/CardStack';

const FreeMode = ({ FreeTrainerSettings }) => {
  const {
    currentNote,
    disabledNotes,
    filteredNotes,
    isAdvance,
    setIsAdvance,
    setActiveNote,
    playNote,
    bpm,
    gameState,
    setGameState,
    rootNote,
    isHandfree,
    useSolfege
  } = FreeTrainerSettings;
  const { t } = useTranslation('degreeTrainer');

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

export default FreeMode;
