import { useState, useEffect, useMemo, useCallback } from 'react';
import { Key, Midi } from 'tonal';
import { detect } from '@tonaljs/chord-detect';
import { compareChords } from '@utils/ChordTrainer/GameLogics';
import { useAdvanceSettingsStore } from '@ChordTrainer/stores/advanceSettingsStore';
import useHoldToAdvance from '@ChordTrainer/hooks/useHoldToAdvance';

const useDiatonicGame = () => {
  const [targetChord, setTargetChord] = useState<string>('');
  const [detectedChords, setDetectedChords] = useState<string[]>([]);
  const [activeNotes, setActiveNotes] = useState<number[]>([]);
  const [sustainedNotes, setSustainedNotes] = useState<number[]>([]);

  const [chordPool, setChordPool] = useState<string[]>([]);
  const [rootNote, setRootNote] = useState<string>('C');
  const [scaleType, setScaleType] = useState<string>('major');
  const [ignoreTranspose, setIgnoreTranspose] = useState<boolean>(true);
  const [chordType, setChordType] = useState<string>('triads');
  const [showDegree, setShowDegree] = useState<boolean>(false);

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
  const getNextChord = useCallback(() => {
    if (chordPool.length === 0) {
      return;
    }
    setTargetChord(prev => {
      let randomChord: string;
      do {
        randomChord = chordPool[Math.floor(Math.random() * chordPool.length)];
      } while (randomChord === prev && chordPool.length > 1);
      return randomChord;
    });
  }, [chordPool]);

  useEffect(() => {
    if (chordPool.length > 0) {
      getNextChord();
    }
  }, [chordPool, getNextChord]);

  const holdToAdvanceMs = useAdvanceSettingsStore(s => s.holdToAdvanceMs);

  const isMatch = useMemo(() => {
    if (!targetChord || detectedChords.length === 0) return false;
    return compareChords(detectedChords, targetChord, ignoreTranspose);
  }, [detectedChords, targetChord, ignoreTranspose]);

  const {
    phase: holdPhase,
    runId: holdRunId,
    successId: holdSuccessId,
  } = useHoldToAdvance({
    isMatch,
    holdMs: holdToAdvanceMs,
    onAdvance: getNextChord,
    resetKey: targetChord,
  });

  return {
    targetChord,
    detectedChords,
    activeNotes,
    chordPool, // The available diatonic chords
    rootNote, // The root note of the scale
    scaleType, // The type of scale (major, minor, harmonic, melodic)
    ignoreTranspose, // Whether to ignore transposition when comparing chords
    setTargetChord, // Function to update targetChord
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
