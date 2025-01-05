import React from 'react';
import Button from '@components/SharedComponents/Button';
import * as Tone from 'tone';
import { useTranslation } from 'react-i18next';
import { isCorrect } from '@utils/GameLogics';

const FreeMode = ({FreeTrainerSettings}) => {
  const { 
    currentNote,
    disabledNotes,
    filteredNotes,
    isAdvance,
    setActiveNote,
    playNote,
    gameState,
    setGameState,
    rootNote
  } = FreeTrainerSettings;
  const { t } = useTranslation('degreeTrainer');

  return (
    <div className="flex flex-col justify-end h-full mb-8">
      <div className="flex-grow" />
      <div className="grid grid-cols-3 gap-4 mb-4 md:gap-6">
        {filteredNotes.map((note) => {
          const noteName = Tone.Frequency(Tone.Frequency(rootNote).toMidi() + note.distance, 'midi').toNote();
          const isCorrectAnswer = isCorrect(noteName, currentNote);
          
          return (
            <Button
              key={note.name}
              variant="primary"
              onClick={() => setActiveNote(noteName)}
              className={`h-16 text-2xl md:h-24 md:text-3xl ${
                isCorrectAnswer && isAdvance
                  ? 'bg-green-200 hover:bg-green-200 dark:bg-green-200 dark:hover:bg-green-200'
                  : ''
              }`}
              disabled={disabledNotes.some(disabledNote => 
                noteName.slice(0, -1) === disabledNote.slice(0, -1)
              )}
              data-note={noteName.slice(0, -1)}
            >
              {note.name}
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
            playNote(currentNote);
          }
        }}
        className="w-full p-4 md:p-6 flex justify-center items-center"
      >
        {gameState === 'end' ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 md:w-16 md:h-16">
            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 md:w-16 md:h-16">
            <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" />
          </svg>
        )}
      </Button>
    </div>
  );
};

export default FreeMode;
