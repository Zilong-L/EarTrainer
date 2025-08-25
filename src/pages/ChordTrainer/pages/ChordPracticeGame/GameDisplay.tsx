import React from 'react';
import MIDIInputHandler from '../../components/MIDIInputHandler';
import { getNiceChordName } from '@utils/ChordTrainer/GameLogics';

interface GameDisplayProps {
  chordPracticeGameSettings: any;
}

const GameDisplay: React.FC<GameDisplayProps> = ({
  chordPracticeGameSettings,
}) => {
  const {
    targetChord,
    detectedChords,
    activeNotes,
    setActiveNotes,
    sustainedNotes,
    setSustainedNotes,
  } = chordPracticeGameSettings;

  return (
    <div className="h-[65vh]  flex flex-col justify-center">
      <div className="h-[30vh] w-full">
        <h1 className="text-6xl font-bold text-left mb-4 text-text-primary ">
          {getNiceChordName([targetChord])}
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
          showDegree={false}
          setShowDegree={() => {}}
        />
      </div>
    </div>
  );
};

export default GameDisplay;
