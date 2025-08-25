import React from 'react';
import { Progression } from 'tonal';
import MIDIInputHandler from '../../components/MIDIInputHandler';

interface GameDisplayProps {
  diatonicGameSettings: any;
}

const GameDisplay: React.FC<GameDisplayProps> = ({ diatonicGameSettings }) => {
  const {
    targetChord,
    activeNotes,
    detectedChords,
    setActiveNotes,
    showDegree,
    rootNote,
    sustainedNotes,
    setSustainedNotes,
    setShowDegree,
  } = diatonicGameSettings;

  return (
    <div className="h-[65vh] flex flex-col justify-center">
      <div className="h-[30vh] w-full">
        <h1 className="text-6xl font-bold text-left mb-4 text-text-primary ">
          {showDegree ? (
            <div className="relative group">
              <span className="cursor-pointer">
                {Progression.toRomanNumerals(rootNote, [targetChord])[0]}
              </span>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2  py-2 bg-slate-900 text-slate-100 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {targetChord}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-slate-900"></div>
              </div>
            </div>
          ) : (
            targetChord
          )}
        </h1>
      </div>
      <div className="w-full">
        <MIDIInputHandler
          activeNotes={activeNotes}
          targetChord={targetChord}
          setActiveNotes={setActiveNotes}
          detectedChords={detectedChords}
          sustainedNotes={sustainedNotes}
          setSustainedNotes={setSustainedNotes}
          showDegree={showDegree}
          setShowDegree={setShowDegree}
        />
      </div>
    </div>
  );
};

export default GameDisplay;
