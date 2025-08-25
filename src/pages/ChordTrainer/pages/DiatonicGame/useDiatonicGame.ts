import { useState, useEffect } from 'react';
import { Key, Midi } from 'tonal';
import { detect } from '@tonaljs/chord-detect';
import { compareChords } from '@utils/ChordTrainer/GameLogics';

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

  useEffect(() => {
    if (chordPool.length > 0) {
      getNextChord();
    }
  }, [chordPool]);

  // Pick the next chord from the chord pool
  const getNextChord = () => {
    if (chordPool.length === 0) {
      return;
    }
    let randomChord: string;
    do {
      randomChord = chordPool[Math.floor(Math.random() * chordPool.length)];
    } while (randomChord === targetChord);
    setTargetChord(randomChord);
  };

  useEffect(() => {
    if (!detectedChords || !targetChord) return;
    const isMatch = compareChords(detectedChords, targetChord, ignoreTranspose);
    if (isMatch) {
      getNextChord();
    }
  }, [detectedChords, ignoreTranspose]);

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
  };
};

export default useDiatonicGame;
