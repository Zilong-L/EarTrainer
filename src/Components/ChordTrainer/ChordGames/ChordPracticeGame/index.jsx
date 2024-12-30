import React from 'react';
import MIDIInputHandler from '../MIDIInputHandler';

const ChordPracticeGame = ({chordPracticeGameSettings}) => {
  const { targetChord, detectedChords, activeNotes, setActiveNotes } = chordPracticeGameSettings;
  
  return (
    <div className="h-[75vh] pl-[10%] flex flex-col items-center justify-center">
      <div className="h-[30vh] w-full">
        <h1 className="text-6xl font-bold text-left mb-4 text-gray-900 dark:text-gray-100">
          {targetChord}
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
