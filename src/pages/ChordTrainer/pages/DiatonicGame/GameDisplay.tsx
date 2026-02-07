import React from 'react';
import { Progression } from 'tonal';
import MIDIInputHandler from '../../components/MIDIInputHandler';
import FillingChordTitle from '@ChordTrainer/components/FillingChordTitle';
import HoldToAdvanceControl from '@ChordTrainer/components/HoldToAdvanceControl';

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
    holdToAdvanceMs,
    holdPhase,
    holdRunId,
    holdSuccessId,
  } = diatonicGameSettings;

  const romanNumeral = targetChord
    ? Progression.toRomanNumerals(rootNote, [targetChord])[0]
    : '';

  return (
    <div className="h-[65vh] flex flex-col justify-center">
      <div className="h-[30vh] w-full flex items-end justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <FillingChordTitle
            display={
              showDegree ? (
                <span className="relative group inline-block">
                  <span className="cursor-pointer">{romanNumeral}</span>
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2  py-2 px-3 bg-slate-900 text-slate-100 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    {targetChord}
                    <span className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-slate-900"></span>
                  </span>
                </span>
              ) : (
                targetChord
              )
            }
            fillText={showDegree ? romanNumeral : targetChord}
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
          showDegree={showDegree}
          setShowDegree={setShowDegree}
        />
      </div>
    </div>
  );
};

export default GameDisplay;
