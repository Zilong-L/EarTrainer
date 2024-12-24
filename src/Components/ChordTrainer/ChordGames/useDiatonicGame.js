import { useState, useEffect } from "react";
import { Key } from "tonal";

const useDiatonicGame = (chord, settings) => {
  const [chordPool, setChordPool] = useState([]);
  const [currentChord, setCurrentChord] = useState(null);
  const { rootNote, scaleType, ignoreTranspose } = settings;

  // Generate the chord pool whenever rootNote or scaleType changes
  useEffect(() => {
    console.log("Generating diatonic chords...");
    let key;
    if (scaleType === "major") {
      key = Key.majorKey(rootNote);
    } else {
      const minorKey = Key.minorKey(rootNote);
      console.log("Minor Key:", minorKey.harmonic);
      console.log(scaleType)
      if (scaleType === "harmonic") {
        key = minorKey.harmonic;
      } else if (scaleType === "melodic") {
        key = minorKey.melodic;
      } else if (scaleType === "natural") {
        key = minorKey.natural;
      }
    }
    console.log("Key Details:", key);
    if(!key) return;
    // Map triads to replace major chord notation
    const formattedTriads = key.triads.map((chord) => {
      if (!chord.endsWith("m") && !chord.endsWith("dim")) {
        return `${chord}M`; // Add "M" for major chords
      }
      return chord; // Keep other chords unchanged
    });

    console.log("Formatted Chord Pool:", formattedTriads);
    setChordPool(formattedTriads);
  }, [rootNote, scaleType]);

  useEffect(() => {
    if (chordPool.length > 0) {
      const randomChord = chordPool[Math.floor(Math.random() * chordPool.length)];
        console.log("Initial Chord:", randomChord);
        setCurrentChord(randomChord);
    }
  }, [chordPool]);  

  // Pick the next chord from the chord pool
  const getNextChord = () => {
    if (chordPool.length === 0) {
      console.warn("Chord pool is empty. Ensure rootNote and scaleType are set.");
      return;
    }
    const randomChord = chordPool[Math.floor(Math.random() * chordPool.length)];
    console.log("Next Chord:", randomChord);
    setCurrentChord(randomChord);
  };
  useEffect(() => {
    if (!chord || !currentChord) return;
  
    const sharpToFlatMap = {
      'A#': 'Bb',
      'C#': 'Db',
      'D#': 'Eb',
      'F#': 'Gb',
      'G#': 'Ab',
    };
  
    // Normalize the root note to flat notation
    const normalizeRootNote = (root) => sharpToFlatMap[root] || root;
  
    // Normalize a full chord (root note + type)
    const normalizeChord = (chord) => {
      const match = chord.match(/^([A-G][b#]?)(.*)$/); // Regex to split root and type
      if (!match) return chord; // Return as-is if it doesn't match the pattern
      const [, root, type] = match; // Extract root and type
      return `${normalizeRootNote(root)}${type}`; // Combine normalized root with type
    };
  
    let chords = chord.split(', ').filter((chord) => chord.length > 0);
    if (ignoreTranspose) {
      chords = chords.map((chord) => chord.split('/')[0]);
    }
  
    // Normalize all chords in the pool to flat notation
    chords = chords.map(normalizeChord);
  
    console.log("Chords:", chords);
  
    // Normalize the current chord for comparison
    const normalizedCurrentChord = normalizeChord(currentChord);
    console.log("Normalized Chords:", chords, "Normalized Current Chord:", normalizedCurrentChord);
  
    if (chords.includes(normalizedCurrentChord)) {
      getNextChord();
    }
  }, [chord, currentChord, ignoreTranspose, getNextChord]);
  
  return {
    chordPool, // The available diatonic chords
    currentChord, // The currently selected chord
  };
};

export default useDiatonicGame;
