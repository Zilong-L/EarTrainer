import { useState, useEffect } from "react";
import { detect } from "@tonaljs/chord-detect";
import { Chord, Midi, Note } from 'tonal';

const DRILL_MODES = {
  RANDOM: 'random',
  CIRCLE_FIFTHS: 'circle_fifths',
  CIRCLE_FOURTHS: 'circle_fourths',
  SEMITONE_UP: 'semitone_up',
  SEMITONE_DOWN: 'semitone_down'
};




const useChordPracticeGame = () => {
  const [targetChord, setTargetChord] = useState("");
  const [detectedChords, setDetectedChords] = useState([]);
  const [activeNotes, setActiveNotes] = useState([]);
  const [ignoreTranspose, setIgnoreTranspose] = useState(true);
  const [chordType, setChordType] = useState("Major");
  const [proMode, setProMode] = useState(false);
  const [drillMode, setDrillMode] = useState(DRILL_MODES.RANDOM);
  const [drillIndex, setDrillIndex] = useState(0);

  const notes = Array(12).fill(0).map((_, i) => Note.transposeFifths("C", i - Math.floor(6)));
  useEffect(() => {

    if(!activeNotes) return;
    const notesString = activeNotes.map((note) => Midi.midiToNoteName(note));
    const chordResult = detect(notesString, { assumePerfectFifth: true });
    setDetectedChords(chordResult);
  }, [activeNotes]);

  useEffect(() => {
    let detectedChordsForComparison = detectedChords;
    let targetChordForComparison = targetChord;
    if (ignoreTranspose) {
      detectedChordsForComparison = detectedChordsForComparison.map(ch => ch.split('/')[0]);
      targetChordForComparison = targetChord.split('/')[0];
    }
    // Get all tonics of detected chords
    const tonics = detectedChordsForComparison.map(ch => Chord.get(ch).tonic);
    // Generate all enharmonics for each tonic
    const enharmonicsList = tonics.map(t => Note.enharmonic(t));
    const enharmonicsChords = enharmonicsList.map(e => Chord.getChord(chordType.toLocaleLowerCase(), e).symbol);
    const augmentedChords = [...detectedChordsForComparison, ...enharmonicsChords];
    // Check if any chord in the augmented list matches the target chord
    if (augmentedChords.some(ch => Chord.get(ch)?.name === Chord.get(targetChordForComparison)?.name)) {
      getNextChord();
    }
  }, [detectedChords]);
  
  useEffect(() => {
    getNextChord();
  }, [chordType]);
  function getNextChord() {
    // Convert chord type names to match Tonal's format
    const chordTypeMap = {
      'Major': 'M',
      'Minor': 'm',
      'Diminished': 'dim',
      'Augmented': 'aug',
      'Major 7th': 'M7',
      'Minor 7th': 'm7',
      'Dominant 7th': '7',
      'Half Diminished 7th': 'm7b5',
      'Diminished 7th': 'dim7'
    };
    
    const symbol = chordTypeMap[chordType] || chordType;
    let currentRoot = targetChord ? Chord.get(targetChord).tonic : 'C';
    let newRoot;

    switch (drillMode) {
      case DRILL_MODES.CIRCLE_FIFTHS:
        newRoot = Note.simplify(Note.transpose(currentRoot, "P5"));
        setDrillIndex((drillIndex + 1) % 12);
        break;
        
      case DRILL_MODES.CIRCLE_FOURTHS:
        newRoot = Note.simplify(Note.transpose(currentRoot, "P4"));
        setDrillIndex((drillIndex + 11) % 12); // Move backwards in circle
        break;
        
      case DRILL_MODES.SEMITONE_UP:
        newRoot = Note.simplify(Note.transpose(currentRoot, "m2"));
        setDrillIndex((drillIndex + 1) % 12);
        break;
        
      case DRILL_MODES.SEMITONE_DOWN:
        newRoot = Note.simplify(Note.transpose(currentRoot, "-m2"));
        setDrillIndex((drillIndex + 1) % 12);
        break;
        
      case DRILL_MODES.RANDOM:
      default:
        do {
          newRoot = notes[Math.floor(Math.random() * notes.length)];
        } while (currentRoot === newRoot);
        break;
    }
    
    setTargetChord(`${newRoot}${symbol}`);
  }
  return {
    targetChord,
    detectedChords,
    proMode,
    setProMode,
    activeNotes,
    setActiveNotes,
    chordType,
    setChordType,
    ignoreTranspose,
    setIgnoreTranspose,
    drillMode,
    setDrillMode,
  };
};

export default useChordPracticeGame;
