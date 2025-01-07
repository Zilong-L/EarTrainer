import React from 'react';
import MIDIInputHandler from '../MIDIInputHandler';
import {getNiceChordName} from '@utils/ChordTrainer/GameLogics';
const ChordPracticeGame = ({chordPracticeGameSettings}) => {
  const { targetChord, detectedChords, activeNotes, setActiveNotes } = chordPracticeGameSettings;
  
  return (
    <div className="h-[65vh] pl-[10%] flex flex-col justify-center">
      <div className="h-[30vh] w-full">
        <h1 className="text-6xl font-bold text-left mb-4 text-text-primary font-jazz">
          {getNiceChordName([targetChord])}
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

export default ChordPracticeGame;
