import { useState, useEffect } from "react";
import { Chord, Key, Midi, Note,Progression } from "tonal";
import { detect } from "@tonaljs/chord-detect";
const useDiatonicGame = () => {
  const [targetChord, setTargetChord] = useState("");
  const [detectedChords, setDetectedChords] = useState([]);
  const [activeNotes, setActiveNotes] = useState([]);

  const [chordPool, setChordPool] = useState([]);
  const [rootNote, setRootNote] = useState("C");
  const [scaleType, setScaleType] = useState("major");
  const [ignoreTranspose, setIgnoreTranspose] = useState(true);
  const [chordType, setChordType] = useState('triads');
  const [showDegree, setShowDegree] = useState(false);

  useEffect(() => {
    if(!activeNotes) return;
    const notesString = activeNotes.map((note) => Midi.midiToNoteName(note));
    const chordResult = detect(notesString, { assumePerfectFifth: true });
    setDetectedChords(chordResult);
  }, [activeNotes]);

  // Generate the chord pool whenever rootNote or scaleType changes
  useEffect(() => {
    let key;
    // Determine the key based on scale type
    console.log(scaleType)
    if (scaleType === "major") {
      key = Key.majorKey(rootNote);
    } else {
      const minorKey = Key.minorKey(rootNote);
      if (scaleType === "harmonic") {
        key = minorKey.harmonic;
      } else if (scaleType === "melodic") {
        key = minorKey.melodic;
      } else if (scaleType === "natural") {
        key = minorKey.natural;
      }
    }
    if (!key) return;
    console.log(key);
    let chords = [];
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
    let randomChord;
    do{
      randomChord = chordPool[Math.floor(Math.random() * chordPool.length)];

    }while(randomChord === targetChord)
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
    // Get all detected chords with their properties
    const detectedChordObjects = detectedChordsForComparison.map(ch => Chord.get(ch));
    // Generate all enharmonics while preserving the original chord type
    const enharmonicsChords = detectedChordObjects.map(chord => {
      const enharmonicTonic = Note.enharmonic(chord.tonic);
      // Use the original chord type instead of current chordType
      return Chord.getChord(chord.type, enharmonicTonic).symbol;
    });
    const augmentedChords = [...detectedChordsForComparison, ...enharmonicsChords];
    
    // Get target chord properties
    const targetChordObj = Chord.get(targetChordForComparison);
    // Generate target chord enharmonic
    const targetEnharmonicTonic = Note.enharmonic(targetChordObj.tonic);
    const targetEnharmonicChord = Chord.getChord(targetChordObj.type, targetEnharmonicTonic).symbol;
    
    // Check if any chord in the augmented list matches the target chord or its enharmonic
    const isMatch = augmentedChords.some(ch => {
      const detectedChord = Chord.get(ch);
      const match = detectedChord?.name === targetChordObj?.name || 
                    detectedChord?.name === Chord.get(targetEnharmonicChord)?.name;
      return match;
    });

    if (isMatch) {
      getNextChord();
    }
  }, [detectedChords,  ignoreTranspose]);

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
    chordType, // The type of chords to practice (triads, sevenths, mixed)
    setChordType, // Function to update chordType
    showDegree, // Whether to show chord degrees
    setShowDegree, // Function to update showDegree
  };
};

export default useDiatonicGame;
