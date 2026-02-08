import React from 'react';
import { Progression } from 'tonal';
import MIDIInputHandler from '../../components/MIDIInputHandler';
import HoldToAdvanceControl from '@ChordTrainer/components/HoldToAdvanceControl';
import ChordQueueScroller from '@ChordTrainer/components/ChordQueueScroller';
import ShowDegreesControl from '@ChordTrainer/components/ShowDegreesControl';

interface GameDisplayProps {
  diatonicGameSettings: any;
}

const GameDisplay: React.FC<GameDisplayProps> = ({ diatonicGameSettings }) => {
  const {
    targetChord,
    chordQueue,
    targetIndex,
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

  const queue = (chordQueue ?? []) as Array<{ id: number; chord: string }>;
  const chords = queue.map(q => q.chord);
  const queueLabels =
    chords.length && showDegree
      ? chords.map(
          chord => Progression.toRomanNumerals(rootNote, [chord])[0] ?? ''
        )
      : chords;

  const scrollerItems = queue.map((q, idx) => ({
    id: q.id,
    label: queueLabels[idx] ?? '',
    title: showDegree ? q.chord : undefined,
  }));

  return (
    <div className="min-h-[65vh] flex flex-col justify-center gap-4">
      <div className="w-full min-h-[30vh] flex flex-col gap-3">
        <ChordQueueScroller
          items={scrollerItems}
          targetIndex={targetIndex}
          holdMs={holdToAdvanceMs ?? 0}
          isFilling={holdPhase === 'filling'}
          runId={holdRunId ?? 0}
          successId={holdSuccessId ?? 0}
        />
        <div className="flex flex-wrap items-center justify-end gap-3">
          <ShowDegreesControl value={showDegree} onChange={setShowDegree} />
          <HoldToAdvanceControl />
        </div>
      </div>
      <div className="w-full">
        <MIDIInputHandler
          activeNotes={activeNotes}
          targetChord={targetChord}
          setActiveNotes={setActiveNotes}
          detectedChords={detectedChords}
          sustainedNotes={sustainedNotes}
          setSustainedNotes={setSustainedNotes}
        />
      </div>
    </div>
  );
};

export default GameDisplay;
