import React from 'react';
import MIDIInputHandler from '../../components/MIDIInputHandler';
import { getNiceChordName } from '@utils/ChordTrainer/GameLogics';
import FillingChordTitle from '@ChordTrainer/components/FillingChordTitle';
import HoldToAdvanceControl from '@ChordTrainer/components/HoldToAdvanceControl';

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
    holdToAdvanceMs,
    holdPhase,
    holdRunId,
    holdSuccessId,
  } = chordPracticeGameSettings;
  const title = getNiceChordName([targetChord])[0] ?? '';

  return (
    <div className="h-[65vh]  flex flex-col justify-center">
      <div className="h-[30vh] w-full flex items-end justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <FillingChordTitle
            display={title}
            fillText={title}
            isFilling={holdPhase === 'filling'}
            holdMs={holdToAdvanceMs ?? 0}
            runId={holdRunId ?? 0}
            successId={holdSuccessId ?? 0}
          />
        </div>
        <HoldToAdvanceControl />
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
