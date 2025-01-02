import { useState, useEffect } from "react";
import { detect } from "@tonaljs/chord-detect";
import { Chord, Midi, Note ,ChordType} from 'tonal';
import { compareChords,getInversion } from '@ChordTrainer/utils/GameLogics';

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
  const [selectedInversion, setSelectedInversion] = useState("random"); // "root", "first", "second", "third", "random"
  const [chordType, setChordType] = useState("M");
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
    const isMatch = compareChords(detectedChords, targetChord, selectedInversion === "root");
    if (isMatch) {
      getNextChord();
    }
  }, [detectedChords,ignoreTranspose]);
  
  useEffect(() => {
    getNextChord();
  }, [chordType]);
  

  function getNextChord() {
    // Convert chord type names to match Tonal's format

    const chordtype = chordType;
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
    
    // Handle inversions based on selection
    let nextTargetChord;
    const maxInversion = chordtype.includes('7') ? 3 : 2;
    
    let position;
    switch(selectedInversion) {
      case "root":
        position = 0;
        break;
      case "first":
        position = 1;
        break;
      case "second":
        position = 2;
        break;
      case "third":
        position = 3;
        break;
      case "random":
        position = Math.floor(Math.random() * (maxInversion + 1));
        break;
      default:
        position = 0;
    }
    
    nextTargetChord = getInversion(newRoot, chordtype, position);

    
    setTargetChord(nextTargetChord);
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
    selectedInversion,
    setSelectedInversion,
    drillMode,
    setDrillMode,
  };
};

export default useChordPracticeGame;
