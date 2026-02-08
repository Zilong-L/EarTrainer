import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { detect } from '@tonaljs/chord-detect';
import { Chord, Midi, Note } from 'tonal';
import {
  compareChords,
  getInversion,
  sortChordsByCommonality,
} from '@utils/ChordTrainer/GameLogics';
import { strangeChords } from '@utils/ChordTrainer/Constants';
import { useChordPracticeStore } from '../../stores/chordPracticeStore';
import { useAdvanceSettingsStore } from '@ChordTrainer/stores/advanceSettingsStore';
import useHoldToAdvance from '@ChordTrainer/hooks/useHoldToAdvance';

const QUEUE_SIZE = 5;
const TARGET_INDEX = 1;

type QueueItem = {
  id: number;
  chord: string;
};

const useChordPracticeGame = () => {
  const [chordQueue, setChordQueue] = useState<QueueItem[]>([]);
  const [detectedChords, setDetectedChords] = useState<string[]>([]);
  const [activeNotes, setActiveNotes] = useState<number[]>([]);
  const [sustainedNotes, setSustainedNotes] = useState<number[]>([]);
  const queueIdRef = useRef(0);

  const { selectedInversions, selectedChordTypes, drillMode } =
    useChordPracticeStore();
  const holdToAdvanceMs = useAdvanceSettingsStore(s => s.holdToAdvanceMs);

  const notes = useMemo(
    () =>
      Array(12)
        .fill(0)
        .map((_, i) => Note.transposeFifths('C', i - Math.floor(6))),
    []
  );

  const getNextChordAfter = useCallback(
    (prevChord: string | null) => {
      if (selectedChordTypes.length === 0 || selectedInversions.length === 0) {
        return '';
      }

      const chordType =
        selectedChordTypes[
          Math.floor(Math.random() * selectedChordTypes.length)
        ]!;
      const currentRoot = prevChord ? Chord.get(prevChord).tonic : 'C';

      let newRoot: string;
      switch (drillMode) {
        case 'circle_fifths':
          newRoot = Note.simplify(Note.transpose(currentRoot || 'C', 'P5'));
          break;
        case 'circle_fourths':
          newRoot = Note.simplify(Note.transpose(currentRoot || 'C', 'P4'));
          break;
        case 'semitone_up':
          newRoot = Note.simplify(Note.transpose(currentRoot || 'C', 'm2'));
          break;
        case 'semitone_down':
          newRoot = Note.simplify(Note.transpose(currentRoot || 'C', '-m2'));
          break;
        case 'random':
        default:
          do {
            newRoot = notes[Math.floor(Math.random() * notes.length)]!;
          } while (currentRoot === newRoot);
          break;
      }

      const maxInversion = chordType.includes('7') ? 3 : 2;
      const selectedInversion =
        selectedInversions[
          Math.floor(Math.random() * selectedInversions.length)
        ]!;

      let position: number;
      switch (selectedInversion) {
        case 'root':
          position = 0;
          break;
        case 'first':
          position = 1;
          break;
        case 'second':
          position = 2;
          break;
        case 'third':
          position = 3;
          break;
        case 'random':
          position = Math.floor(Math.random() * (maxInversion + 1));
          break;
        default:
          position = 0;
      }

      return getInversion(newRoot, chordType, position) as string;
    },
    [drillMode, selectedChordTypes, selectedInversions, notes]
  );

  const initQueue = useCallback(() => {
    const next: QueueItem[] = [];
    let prev: string | null = null;
    for (let i = 0; i < QUEUE_SIZE; i++) {
      const chord = getNextChordAfter(prev);
      next.push({ id: queueIdRef.current++, chord });
      prev = chord || prev;
    }
    setChordQueue(next);
  }, [getNextChordAfter]);

  const advanceQueue = useCallback(() => {
    setChordQueue(prevQueue => {
      if (prevQueue.length !== QUEUE_SIZE) return prevQueue;
      const last = prevQueue[prevQueue.length - 1]?.chord ?? null;
      const nextChord = getNextChordAfter(last);
      return [
        ...prevQueue.slice(1),
        { id: queueIdRef.current++, chord: nextChord },
      ];
    });
  }, [getNextChordAfter]);

  useEffect(() => {
    if (!activeNotes || activeNotes.length === 0) {
      setDetectedChords([]);
      return;
    }
    const notesString = activeNotes.map(
      note => Midi.midiToNoteName(note) || ''
    );
    let chordResult = detect(notesString, { assumePerfectFifth: true });
    if (!chordResult) {
      setDetectedChords([]);
      return;
    }
    let chordResultObjects = chordResult.map(chord => Chord.get(chord));
    chordResultObjects = chordResultObjects.filter(
      chord => !strangeChords.includes(chord.type)
    );
    chordResult = sortChordsByCommonality(chordResultObjects);
    setDetectedChords(chordResult);
  }, [activeNotes]);

  const targetChord = chordQueue[TARGET_INDEX]?.chord ?? '';

  const isMatch = useMemo(() => {
    if (!targetChord || activeNotes.length === 0) return false;
    return compareChords(
      detectedChords,
      targetChord,
      selectedInversions.length === 1 && selectedInversions[0] === 'root'
    );
  }, [detectedChords, targetChord, activeNotes.length, selectedInversions]);

  const {
    phase: holdPhase,
    runId: holdRunId,
    successId: holdSuccessId,
  } = useHoldToAdvance({
    isMatch,
    holdMs: holdToAdvanceMs,
    onAdvance: advanceQueue,
    resetKey: targetChord,
  });

  useEffect(() => {
    initQueue();
  }, [initQueue]);

  return {
    targetChord,
    chordQueue,
    targetIndex: TARGET_INDEX,
    detectedChords,
    activeNotes,
    setActiveNotes,
    sustainedNotes,
    setSustainedNotes,
    holdToAdvanceMs,
    holdPhase,
    holdRunId,
    holdSuccessId,
  };
};

export default useChordPracticeGame;
