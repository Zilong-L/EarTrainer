import React, { useState } from 'react';
import { Frequency } from 'tone';
import { isCorrect } from '@utils/GameLogics';
import {
  SolfegeMapping,
  shortcuts,
} from '@EarTrainers/DegreeTrainer/Constants';
import Button from '@components/Button';
import { motion } from 'motion/react';

interface Note {
  name: string;
  distance: number;
}

interface CardStackProps {
  currentNote: string;
  disabledNotes: string[];
  filteredNotes: Note[];
  isAdvance: string;
  setActiveNote: (note: string) => void;
  rootNote: string;
  isHandfree: boolean;
  useSolfege: boolean;
  bpm: number;
  gameState: string;
}

const CardStack: React.FC<CardStackProps> = ({
  currentNote,
  disabledNotes,
  filteredNotes,
  isAdvance,
  setActiveNote,
  rootNote,
  // isHandfree,
  useSolfege,
  bpm,
  gameState,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div>
      <div
        className={`hidden lg:${gameState == 'end' ? 'hidden' : ''} lg:flex items-center justify-center h-64 mb-4 relative`}
      >
        <div
          className="flex h-full items-center"
          style={{ width: `${Math.min(filteredNotes.length, 12) * 15}%` }}
        >
          {filteredNotes.slice(0, 12).map((note, index) => {
            const noteName = Frequency(
              Frequency(rootNote).toMidi() + note.distance,
              'midi'
            ).toNote();
            const isCorrectAnswer = isCorrect(noteName, currentNote);
            const isDisabled = disabledNotes.some(
              disabledNote =>
                noteName.slice(0, -1) === disabledNote.slice(0, -1)
            );
            const totalCards = filteredNotes.length;

            // 🎯 Keep your original calculations
            const minDistance = 15;
            const maxDistance = 20;
            const cardDistance =
              maxDistance - (maxDistance - minDistance) * (totalCards / 12);
            const positionRatio =
              (index - (totalCards - 1) / 2) / (totalCards / 2);

            const maxRotation = 15;
            const maxVerticalOffset = 100;
            const rotation = maxRotation * positionRatio;
            const verticalOffset =
              (0.4 + 0.4 * Math.pow(positionRatio, 2)) * maxVerticalOffset;

            let offsetX = 0;
            if (hoveredIndex !== null) {
              const distance = index - hoveredIndex;
              const offsetMagnitude =
                cardDistance *
                3 *
                (totalCards / 12) *
                Math.exp(-0.1 * Math.pow(Math.abs(distance), 2));
              offsetX = Math.sign(distance) * offsetMagnitude;
            }
            const left = `calc(50% - 3rem + ${(index - totalCards / 2) * cardDistance}%)`;
            return (
              <motion.div
                key={noteName}
                initial={{
                  x: offsetX,
                  rotateZ: rotation,
                  y: verticalOffset,
                  scale: 1,
                }}
                animate={{
                  x: offsetX,
                  rotateZ: rotation,
                  y: verticalOffset,
                  scale: 1,
                  transition: { duration: 0.2, ease: 'linear' },
                }}
                whileHover={{
                  scale: 1.3,
                  rotateZ: 0,
                  y: 0,
                  transition: { duration: 0.1, ease: 'linear' },
                }}
                whileDrag={{ scale: 1.3, rotateZ: 0 }}
                dragSnapToOrigin
                className={`absolute h-32 w-24 md:h-[14rem] md:w-[10rem] rounded-xl shadow-lg flex flex-col 
      items-center justify-between py-4 text-2xl md:text-3xl font-bold 
      ${isCorrectAnswer && isAdvance !== 'No' ? 'bg-green-500 text-white' : 'bg-bg-accent text-text-primary'}
                  ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}
                style={{
                  left,
                  transformOrigin: 'bottom center',
                }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                onClick={() => {
                  setActiveNote(noteName);
                }}
              >
                <span className="select-none">
                  {useSolfege
                    ? SolfegeMapping[
                        note.name as keyof typeof SolfegeMapping
                      ] || note.name
                    : note.name}
                </span>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium">
                  {shortcuts[note.name as keyof typeof shortcuts]}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <div
        className={`flex flex-wrap  gap-3 mb-4 lg:hidden ${gameState == 'end' ? 'hidden' : ''}`}
      >
        {filteredNotes.map(note => {
          const noteName = Frequency(
            Frequency(rootNote).toMidi() + note.distance,
            'midi'
          ).toNote();
          const isCorrectAnswer =
            isCorrect(noteName, currentNote) && isAdvance !== 'No';
          const isDisabled = disabledNotes.some(
            disabledNote => noteName.slice(0, -1) === disabledNote.slice(0, -1)
          );

          return (
            <motion.div
              key={note.name}
              initial={{ scale: 1 }}
              whileTap={{ scale: 0.95 }}
              className="w-[30%]"
              onClick={() => setActiveNote(noteName)}
            >
              <Button
                variant="primary"
                className={`h-16 w-full text-2xl relative transition-[background-color] duration-[300ms] ${isCorrectAnswer ? 'bg-green-500 text-white' : ''} ${isDisabled ? 'opacity-50' : ''}`}
                style={
                  isCorrectAnswer && isAdvance
                    ? ({
                        '--x': `${Math.random() * 100}%`,
                        '--y': `${Math.random() * 100}%`,
                        '--animation-duration': `${(60 / bpm) * 1.5}s`,
                      } as React.CSSProperties)
                    : {}
                }
                disabled={isDisabled}
                data-note={noteName.slice(0, -1)}
              >
                {useSolfege
                  ? SolfegeMapping[note.name as keyof typeof SolfegeMapping] ||
                    note.name
                  : note.name}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CardStack;
