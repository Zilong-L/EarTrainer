import { useState, useEffect } from "react";
import { Chord, ChordType, Key, Midi, Note } from "tonal";
import { detect } from "@tonaljs/chord-detect";
const useDiatonicGame = () => {
  const [targetChord, setTargetChord] = useState("");
  const [detectedChords, setDetectedChords] = useState([]);
  const [activeNotes, setActiveNotes] = useState([]);

  const [chordPool, setChordPool] = useState([]);
  const [rootNote, setRootNote] = useState("C");
  const [scaleType, setScaleType] = useState("major");
  const [ignoreTranspose, setIgnoreTranspose] = useState(true);

  useEffect(() => {
    if(!activeNotes) return;
    const notesString = activeNotes.map((note) => Midi.midiToNoteName(note));
    const chordResult = detect(notesString, { assumePerfectFifth: true });
    setDetectedChords(chordResult);
  }, [activeNotes]);

  // Generate the chord pool whenever rootNote or scaleType changes
  useEffect(() => {
    console.log("Generating diatonic chords...");
    let key;
    // Determine the key based on scale type
    if (scaleType === "major") {
      key = Key.majorKey(rootNote);
    } else {
      const minorKey = Key.minorKey(rootNote);
      console.log("Minor Key:", minorKey);
      if (scaleType === "harmonic") {
        key = minorKey.harmonic;
      } else if (scaleType === "melodic") {
        key = minorKey.melodic;
      } else if (scaleType === "natural") {
        key = minorKey.natural;
      }
    }

    console.log("Key Details:", key);
    if (!key) return;

    setChordPool(key.chords);
    
  }, [rootNote, scaleType]);

  useEffect(() => {
    if (chordPool.length > 0) {
      getNextChord();
    }
  }, [chordPool]);

  // Pick the next chord from the chord pool
  const getNextChord = () => {
    if (chordPool.length === 0) {
      console.warn("Chord pool is empty. Ensure rootNote and scaleType are set.");
      return;
    }
    let randomChord;
    do{
      randomChord = chordPool[Math.floor(Math.random() * chordPool.length)];

    }while(randomChord === targetChord)
    console.log("Next Chord:", randomChord);
    setTargetChord(randomChord);
  };

  useEffect(() => {
    if (!detectedChords || !targetChord) return;
    let detectedChordsForComparison = detectedChords
    let targetChordForComparison = targetChord;
    

    if(ignoreTranspose){
      detectedChordsForComparison = detectedChordsForComparison.map(ch => ch.split('/')[0])
      targetChordForComparison = targetChord.split('/')[0];
    }
    if(
      detectedChordsForComparison.some(ch => Chord.get(ch).name === Chord.get(targetChordForComparison).name)
    ) {
      getNextChord();
    }
  }, [detectedChords, targetChord, ignoreTranspose]);

  return {
    targetChord,
    detectedChords,
    activeNotes,
    chordPool, // The available diatonic chords
    targetChord, // The currently selected chord
    rootNote, // The root note of the scale
    scaleType, // The type of scale (major, minor, harmonic, melodic)
    ignoreTranspose, // Whether to ignore transposition when comparing chords
    setTargetChord, // Function to update targetChord
    setActiveNotes, // Function to update activeNotes
    setRootNote, // Function to update rootNote
    setScaleType, // Function to update scaleType
    setIgnoreTranspose, // Function to update ignoreTranspose
  };
};

export default useDiatonicGame;
