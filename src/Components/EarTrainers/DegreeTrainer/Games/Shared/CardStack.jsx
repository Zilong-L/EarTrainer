import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { isCorrect } from '@utils/GameLogics';
import { SolfegeMapping, shortcuts } from '@components/EarTrainers/DegreeTrainer/Constants';
import Button from '@components/SharedComponents/Button';
import { motion } from "motion/react";



const CardStack = ({
  currentNote,
  disabledNotes,
  filteredNotes,
  isAdvance,
  setActiveNote,
  rootNote,
  isHandfree,
  useSolfege,
  bpm,
  gameState
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div>
      <div className={`hidden lg:${gameState == 'end' ? 'hidden' : ''} lg:flex items-center justify-center h-64 mb-4 relative`}>
        <div className="flex h-full items-center" style={{ width: `${Math.min(filteredNotes.length, 12) * 15}%` }}>
          {filteredNotes.slice(0, 12).map((note, index) => {
            const noteName = Tone.Frequency(Tone.Frequency(rootNote).toMidi() + note.distance, "midi").toNote();
            const isCorrectAnswer = isCorrect(noteName, currentNote);
            const isDisabled = disabledNotes.some((disabledNote) => noteName.slice(0, -1) === disabledNote.slice(0, -1));
            const totalCards = filteredNotes.length;

            // 🎯 Keep your original calculations
            const minDistance = 15;
            const maxDistance = 20;
            const cardDistance = maxDistance - (maxDistance - minDistance) * (totalCards / 12);
            const positionRatio = (index - (totalCards - 1) / 2) / (totalCards / 2);

            const maxRotation = 15;
            const maxVerticalOffset = 100;
            const rotation = maxRotation * positionRatio;
            const verticalOffset = (0.4 + 0.4 * Math.pow(positionRatio, 2)) * maxVerticalOffset;

            const distance = index - hoveredIndex;
            const offsetMagnitude = cardDistance * 3 * (totalCards / 12) * Math.exp(-0.1 * Math.pow(Math.abs(distance), 2));
            const offsetX = Math.sign(distance) * offsetMagnitude;
            const left = `calc(50% - 3rem + ${(index - totalCards / 2) * cardDistance}%)`;
            return <motion.div
              key={noteName}
              initial={{ x: offsetX, rotateZ: rotation, y: verticalOffset, scale: 1 }}
              animate={{ x: offsetX, rotateZ: rotation, y: verticalOffset, scale: 1,transition:{duration:0.2,ease:'linear' } }}
              whileHover={{ scale: 1.3, rotateZ: 0, y: 0, zIndex: 50 ,transition:{duration:0.1,ease:'linear' }}}
              whileDrag={{ scale: 1.3, zIndex: 50, rotateZ: 0, }}
              drag
              dragSnapToOrigin
              className={`absolute h-32 w-24 md:h-[14rem] md:w-[10rem] rounded-xl shadow-lg flex flex-col 
      items-center justify-between py-4 text-2xl md:text-3xl font-bold 
      ${isCorrectAnswer && isAdvance !== 'No' ? 'bg-gradient-to-b from-green-600 to-green-400' : 'bg-bg-accent text-text-primary'}
                  ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}
              style={{
                left,
                transformOrigin: "bottom center",
              }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              onClick={() => {
                setActiveNote(noteName);
              }}
            >
              <span className="select-none">{useSolfege ? SolfegeMapping[note.name] || note.name : note.name}</span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium">
                {shortcuts[note.name]}
              </div>
            </motion.div>
          }
          )
          }


        </div>
      </div>
      <div className={`grid grid-cols-3 gap-4 mb-4 lg:hidden ${gameState == 'end' ? 'hidden' : ''}`}>
        {filteredNotes.map((note) => {
          const noteName = Tone.Frequency(Tone.Frequency(rootNote).toMidi() + note.distance, 'midi').toNote();
          const isCorrectAnswer = isCorrect(noteName, currentNote) && isAdvance !== 'No';

          return (
            <Button
              key={note.name}
              variant="primary"
              onClick={() => setActiveNote(noteName)}
              className={`h-16 text-2xl relative ${isCorrectAnswer ? 'correct-answer' : ''}`}
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
    </div>
  );
};

export default CardStack;
