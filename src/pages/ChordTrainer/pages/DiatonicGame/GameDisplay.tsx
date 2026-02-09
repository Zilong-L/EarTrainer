import React, { useMemo, useState } from 'react';
import { Progression } from 'tonal';
import MIDIInputHandler from '../../components/MIDIInputHandler';
import HoldToAdvanceControl from '@ChordTrainer/components/HoldToAdvanceControl';
import ChordQueueScroller from '@ChordTrainer/components/ChordQueueScroller';
import ShowDegreesControl from '@ChordTrainer/components/ShowDegreesControl';
import { BookOpenIcon } from '@heroicons/react/24/solid';
import ProgressionBookModal from './ProgressionBookModal';
import { useDiatonicProgressionStore } from './diatonicProgressionStore';
import { DIATONIC_PROGRESSIONS } from './progressions';
import { useTranslation } from 'react-i18next';
import useI18nStore from '@stores/i18nStore';

interface GameDisplayProps {
  diatonicGameSettings: any;
}

const GameDisplay: React.FC<GameDisplayProps> = ({ diatonicGameSettings }) => {
  const { namespace } = useI18nStore();
  const { t } = useTranslation(namespace);
  const [isBookOpen, setIsBookOpen] = useState(false);

  const progressionId = useDiatonicProgressionStore(s => s.progressionId);
  const progressionMode = useDiatonicProgressionStore(s => s.mode);

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

  const selectedProgressionName = useMemo(() => {
    if (progressionMode !== 'progression' || !progressionId) return '';
    return DIATONIC_PROGRESSIONS.find(p => p.id === progressionId)?.name ?? '';
  }, [progressionId, progressionMode]);

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="flex-1 min-h-[30vh] flex items-center justify-center">
        <ChordQueueScroller
          items={scrollerItems}
          targetIndex={targetIndex}
          holdMs={holdToAdvanceMs ?? 0}
          isFilling={holdPhase === 'filling'}
          runId={holdRunId ?? 0}
          successId={holdSuccessId ?? 0}
        />
      </div>
      <div className="mt-auto w-full flex flex-col gap-3 pb-2">
        <MIDIInputHandler
          activeNotes={activeNotes}
          targetChord={targetChord}
          setActiveNotes={setActiveNotes}
          detectedChords={detectedChords}
          sustainedNotes={sustainedNotes}
          setSustainedNotes={setSustainedNotes}
        />
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsBookOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-bg-accent bg-bg-common px-3 pt-2 pb-2 shadow-sm shrink-0 hover:bg-bg-hover"
            title={
              selectedProgressionName
                ? `${t('diatonicBook.button')}: ${selectedProgressionName}`
                : t('diatonicBook.button')
            }
            aria-label={t('diatonicBook.button')}
          >
            <BookOpenIcon className="h-5 w-5 text-text-secondary" />
            <span className="text-xs font-semibold tracking-wide text-text-secondary whitespace-nowrap uppercase">
              {selectedProgressionName || t('diatonicBook.button')}
            </span>
          </button>
          <ShowDegreesControl value={showDegree} onChange={setShowDegree} />
          <HoldToAdvanceControl />
        </div>
      </div>

      <ProgressionBookModal
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        targetTonic={rootNote}
      />
    </div>
  );
};

export default GameDisplay;
