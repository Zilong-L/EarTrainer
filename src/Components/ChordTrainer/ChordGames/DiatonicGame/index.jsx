import React from 'react';
import { useTranslation } from 'react-i18next';
import { Progression } from 'tonal';
import MIDIInputHandler from '../MIDIInputHandler';

const DiatonicGame = ({diatonicGameSettings}) => {
  const { 
    targetChord, 
    activeNotes, 
    detectedChords, 
    setActiveNotes,
    showDegree,
    rootNote
  } = diatonicGameSettings;
  
  return (
    <div className="h-[75vh] pl-[10%] flex flex-col justify-center">
      <div className="h-[30vh] w-full">
        <h1 className="text-6xl font-bold text-left mb-4 text-text-primary">
          {showDegree ? (
            <div className="relative group">
              <span className="cursor-pointer">
                {Progression.toRomanNumerals(rootNote, [targetChord])[0]}
              </span>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-slate-100 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {targetChord}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-slate-900"></div>
              </div>
            </div>
          ) : targetChord}
        </h1>
      </div>
      <div className="w-full">
        <MIDIInputHandler 
          activeNotes={activeNotes} 
          setActiveNotes={setActiveNotes} 
          detectedChords={detectedChords} 
        />
      </div>
    </div>
  );
};

export default DiatonicGame;
