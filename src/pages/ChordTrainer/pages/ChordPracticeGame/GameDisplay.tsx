import React from 'react';
import MIDIInputHandler from '../../components/MIDIInputHandler';
import { getNiceChordName } from '@utils/ChordTrainer/GameLogics';
import HoldToAdvanceControl from '@ChordTrainer/components/HoldToAdvanceControl';
import ChordQueueScroller from '@ChordTrainer/components/ChordQueueScroller';

interface GameDisplayProps {
  chordPracticeGameSettings: any;
}

const GameDisplay: React.FC<GameDisplayProps> = ({
  chordPracticeGameSettings,
}) => {
  const {
    targetChord,
    chordQueue,
    targetIndex,
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
  const queue = (chordQueue ?? []) as Array<{ id: number; chord: string }>;
  const queueTitles = getNiceChordName(queue.map(q => q.chord));
  const scrollerItems = queue.map((q, idx) => ({
    id: q.id,
    label: queueTitles[idx] ?? '',
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
