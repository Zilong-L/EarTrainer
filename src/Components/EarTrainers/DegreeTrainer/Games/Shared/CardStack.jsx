import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { isCorrect } from '@utils/GameLogics';
import { SolfegeMapping } from '@components/EarTrainers/DegreeTrainer/Constants';
import Button from '@components/SharedComponents/Button';
const CardStack = ({ 
  currentNote,
  disabledNotes,
  filteredNotes,
  isAdvance,
  setActiveNote,
  rootNote,
  isHandfree,
  useSolfege,
  renderHeader,
  bpm,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [time, setTime] = useState(Date.now());
  const timeOffsets = useRef([]);
  const [hoverRotations, setHoverRotations] = useState(Array(12).fill(0).map(() => ({ rotateX: 0, rotateY: 0 })));

  useEffect(() => {
    timeOffsets.current = filteredNotes.slice(0, 12).map(() => Math.random() * 10000);
  }, [filteredNotes]);

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 50);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = useCallback((event, index) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    const deltaX = (mouseX - centerX) / (rect.width / 2);
    const deltaY = (mouseY - centerY) / (rect.height / 2);

    const maxRotate = 10;
    const rotateY = deltaX * maxRotate;
    const rotateX = -deltaY * maxRotate;
    setHoverRotations(prev => ({
      ...prev,
      [index]: { rotateX, rotateY }
    }));
  }, []);

  const handleMouseLeave = useCallback((index) => {
    setHoveredIndex(null);
  }, []);

  return (
    <div>
      <div className="hidden lg:flex items-center justify-center h-64 mb-4 relative">
        <div className="flex h-full items-center" style={{ width: `${Math.min(filteredNotes.length, 12) * 15}%` }}>
          {filteredNotes.slice(0, 12).map((note, index) => {
            const noteName = Tone.Frequency(Tone.Frequency(rootNote).toMidi() + note.distance, 'midi').toNote();
            const isCorrectAnswer = isCorrect(noteName, currentNote);
            const isDisabled = disabledNotes.some(disabledNote =>
              noteName.slice(0, -1) === disabledNote.slice(0, -1)
            );
            const totalCards = filteredNotes.length;
            
            const minDistance = 15;
            const maxDistance = 20;
            const cardDistance = maxDistance - (maxDistance - minDistance) * (totalCards/12);
            const distance = index - hoveredIndex;
            const offsetMagnitude = cardDistance * 3*(totalCards/12) * Math.exp(-0.1*Math.pow(Math.abs(distance), 2));

            const offsetX = Math.sign(distance) * offsetMagnitude;
            const maxRotation = 15;
            const maxVerticalOffset = 100;
            const positionRatio = (index - (totalCards-1 ) / 2) / (totalCards / 2);

            const rotation = maxRotation * positionRatio;
            const verticalOffset = (0.4+0.4*Math.pow(positionRatio,2)) * maxVerticalOffset;
            const mouseRotation = hoverRotations[index];
            const timeFactor = (time + timeOffsets.current[index]) * 0.001;
            const baseRotateX = Math.sin(timeFactor) * 15;
            const baseRotateY = Math.cos(timeFactor) * 15;
            
            const rotateX =  baseRotateX;
            const rotateY =  baseRotateY;
        
            let cardTransform = hoveredIndex === null
              ? `rotateZ(${rotation}deg) translateY(${verticalOffset}%) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
              : `rotateZ(${rotation}deg) translateY(${verticalOffset}%) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(${offsetX}%)`;

            if(hoveredIndex === index&&mouseRotation){
              cardTransform = ` translateY(4rem) rotateX(${mouseRotation.rotateX}deg) rotateY(${mouseRotation.rotateY}deg) translateX(${offsetX}%) scale(1.3)`;
            }

            const cardZIndex = hoveredIndex === index ? 50 : index + 1;
            if (isHandfree && isCorrectAnswer && index !== hoveredIndex) {
              setHoveredIndex(index);
            }

            return (
              <div
                key={note.name}
                onMouseMove={(e) => handleMouseMove(e, index)}
                onMouseLeave={() => handleMouseLeave(index)}
                className={`
                  absolute h-32 w-24  md:h-[14rem] md:w-[10rem] rounded-xl shadow-[4px_1px_0px_rgba(0,0,0,0.6),0_2px_4px_-2px_rgba(0,0,0,0.2)]
                  flex flex-col items-center justify-between py-4 text-2xl md:text-3xl font-bold
                  transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]  
                  ${hoveredIndex === index ? `shadow-[8px_10px_1px_rgba(0,0,0,0.7)] z-50` :''}
                  z-[${cardZIndex}]
                  ${isCorrectAnswer && isAdvance !=='No'? 'bg-gradient-to-b from-green-600 to-green-400' : 'bg-gradient-to-b from-blue-500 to-blue-600'}
                  ${isDisabled ? 'opacity-50 pointer-events-none' : ''}
                `}
                style={{
                  left: `calc(50% - 3rem + ${(index - filteredNotes.length / 2) * cardDistance}%)`,
                  transform: cardTransform,
                  transformOrigin: 'bottom center',
                  willChange: 'transform',
                  perspective: '1000px',
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onClick={() => {
                  setHoveredIndex(index);
                  setActiveNote(noteName);
                }}
                data-note={noteName.slice(0, -1)}
              >
                <span className="select-none">
                  {useSolfege ? SolfegeMapping[note.name] || note.name : note.name}
                </span>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4 lg:hidden">
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
