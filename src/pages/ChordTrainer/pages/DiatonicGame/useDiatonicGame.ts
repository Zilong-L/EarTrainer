import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Key, Midi } from 'tonal';
import { detect } from '@tonaljs/chord-detect';
import {
  chordTargetFromSymbol,
  isMatchSuperset,
} from '@utils/ChordTrainer/ChordTarget';
import { transposeChordSymbol } from '@utils/ChordTrainer/transposeChordSymbol';
import { useAdvanceSettingsStore } from '@ChordTrainer/stores/advanceSettingsStore';
import useHoldToAdvance from '@ChordTrainer/hooks/useHoldToAdvance';
import { useDiatonicProgressionStore } from './diatonicProgressionStore';
import { DIATONIC_PROGRESSIONS } from './progressions';

const QUEUE_SIZE = 5;
const TARGET_INDEX = 1;

type QueueItem = {
  id: number;
  chord: string;
};

const useDiatonicGame = () => {
  const [chordQueue, setChordQueue] = useState<QueueItem[]>([]);
  const [detectedChords, setDetectedChords] = useState<string[]>([]);
  const [activeNotes, setActiveNotes] = useState<number[]>([]);
  const [sustainedNotes, setSustainedNotes] = useState<number[]>([]);
  const queueIdRef = useRef(0);

  const [chordPool, setChordPool] = useState<string[]>([]);
  const [rootNote, setRootNote] = useState<string>('C');
  const [scaleType, setScaleType] = useState<string>('major');
  const [ignoreTranspose, setIgnoreTranspose] = useState<boolean>(true);
  const [chordType, setChordType] = useState<string>('triads');
  const [showDegree, setShowDegree] = useState<boolean>(false);
  const progressionCursorRef = useRef(0);

  const progressionMode = useDiatonicProgressionStore(s => s.mode);
  const progressionId = useDiatonicProgressionStore(s => s.progressionId);
  const requireSlashBass = useDiatonicProgressionStore(s => s.requireSlashBass);

  const progression = useMemo(() => {
    if (!progressionId) return null;
    return DIATONIC_PROGRESSIONS.find(p => p.id === progressionId) ?? null;
  }, [progressionId]);

  const isProgressionMode =
    progressionMode === 'progression' &&
    !!progression &&
    progression.steps.length > 0;

  useEffect(() => {
    if (!activeNotes) return;
    const notesString = activeNotes.map(
      note => Midi.midiToNoteName(note) || ''
    );
    const chordResult = detect(notesString, { assumePerfectFifth: true });
    setDetectedChords(chordResult);
  }, [activeNotes]);

  // Generate the chord pool whenever rootNote or scaleType changes
  useEffect(() => {
    let key: any;
    // Determine the key based on scale type
    console.log(scaleType);
    if (scaleType === 'major') {
      key = Key.majorKey(rootNote);
    } else {
      const minorKey = Key.minorKey(rootNote);
      if (scaleType === 'harmonic') {
        key = minorKey.harmonic;
      } else if (scaleType === 'melodic') {
        key = minorKey.melodic;
      } else if (scaleType === 'natural') {
        key = minorKey.natural;
      }
    }
    if (!key) return;
    console.log(key);
    let chords: string[] = [];
    // Get chords based on chord type selection
    if (chordType === 'triads') {
      chords = key.triads;
    } else if (chordType === 'sevenths') {
      chords = key.chords;
    } else if (chordType === 'mixed') {
      // Combine triads and seventh chords, removing duplicates
      chords = [...new Set([...key.triads, ...key.chords])];
    }

    setChordPool(chords);
  }, [rootNote, scaleType, chordType]);

  // Pick the next chord from the chord pool
  const getNextChordAfter = useCallback(
    (prevChord: string | null) => {
      if (isProgressionMode && progression) {
        const idx = progressionCursorRef.current % progression.steps.length;
        progressionCursorRef.current++;
        const step = progression.steps[idx]!;
        return transposeChordSymbol(
          step.symbol,
          progression.baseTonic,
          rootNote
        );
      }
      if (chordPool.length === 0) return '';
      let randomChord: string;
      do {
        randomChord = chordPool[Math.floor(Math.random() * chordPool.length)]!;
      } while (randomChord === prevChord && chordPool.length > 1);
      return randomChord;
    },
    [chordPool, isProgressionMode, progression, rootNote]
  );

  const initQueue = useCallback(() => {
    if (isProgressionMode) {
      const len = progression?.steps.length ?? 0;
      if (len > 0) {
        // Ensure queue[TARGET_INDEX] starts at step 0.
        progressionCursorRef.current =
          (((len - TARGET_INDEX) % len) + len) % len;
      } else {
        progressionCursorRef.current = 0;
      }
    }

    const canGenerate =
      (isProgressionMode && (progression?.steps.length ?? 0) > 0) ||
      chordPool.length > 0;

    if (!canGenerate) {
      setChordQueue([]);
      return;
    }
    const next: QueueItem[] = [];
    let prev: string | null = null;
    for (let i = 0; i < QUEUE_SIZE; i++) {
      const chord = getNextChordAfter(prev);
      next.push({ id: queueIdRef.current++, chord });
      prev = chord || prev;
    }
    setChordQueue(next);
  }, [
    chordPool.length,
    getNextChordAfter,
    isProgressionMode,
    progression?.steps.length,
  ]);

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
    initQueue();
  }, [initQueue]);

  const holdToAdvanceMs = useAdvanceSettingsStore(s => s.holdToAdvanceMs);

  const targetChord = chordQueue[TARGET_INDEX]?.chord ?? '';

  const requireBass = isProgressionMode
    ? requireSlashBass && targetChord.includes('/')
    : !ignoreTranspose;

  const target = useMemo(() => {
    return chordTargetFromSymbol(targetChord, { requireBass });
  }, [targetChord, requireBass]);

  const isMatch = useMemo(() => {
    if (!target) return false;
    return isMatchSuperset(activeNotes, target);
  }, [activeNotes, target]);

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

  return {
    targetChord,
    chordQueue,
    targetIndex: TARGET_INDEX,
    detectedChords,
    activeNotes,
    chordPool, // The available diatonic chords
    rootNote, // The root note of the scale
    scaleType, // The type of scale (major, minor, harmonic, melodic)
    ignoreTranspose, // Whether to ignore transposition when comparing chords
    setActiveNotes, // Function to update activeNotes
    sustainedNotes,
    setSustainedNotes,
    setRootNote, // Function to update rootNote
    setScaleType, // Function to update scaleType
    setIgnoreTranspose, // Function to update ignoreTranspose
    chordType, // The type of chords to practice (triads, sevenths, mixed)
    setChordType, // Function to update chordType
    showDegree, // Whether to show chord degrees
    setShowDegree, // Function to update showDegree
    holdToAdvanceMs,
    holdPhase,
    holdRunId,
    holdSuccessId,
  };
};

export default useDiatonicGame;
