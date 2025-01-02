import { useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";
import { detect } from "@tonaljs/chord-detect";
import { Chord, Midi, Note ,ChordType} from 'tonal';
import { compareChords,getInversion,sortChordsByCommonality} from '@utils/ChordTrainer/GameLogics';
import {strangeChrods} from '@utils/ChordTrainer/Constants'

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
  const [selectedInversion, setSelectedInversion] = useLocalStorage('chordPractice.selectedInversion', "random");
  const [chordType, setChordType] = useLocalStorage('chordPractice.chordType', "M");
  const [proMode, setProMode] = useLocalStorage('chordPractice.proMode', false);
  const [drillMode, setDrillMode] = useLocalStorage('chordPractice.drillMode', DRILL_MODES.RANDOM);
  const [drillIndex, setDrillIndex] = useState(0);

  const notes = Array(12).fill(0).map((_, i) => Note.transposeFifths("C", i - Math.floor(6)));
  useEffect(() => {
    if(!activeNotes) return;
    const notesString = activeNotes.map((note) => Midi.midiToNoteName(note));
    let chordResult = detect(notesString, { assumePerfectFifth: true });
    if(!chordResult) {
      setDetectedChords([]);
      return;
    }
    //sort to show common chords first
    let chordResultObjects = chordResult.map(chord => Chord.get(chord));
    chordResultObjects = chordResultObjects.filter((chord)=>!strangeChrods.includes(chord.type))
    
    chordResult = sortChordsByCommonality(chordResultObjects)
    setDetectedChords(chordResult);
  }, [activeNotes]);

  useEffect(() => {
    const isMatch = compareChords(detectedChords, targetChord, selectedInversion === "root");
    if (isMatch) {
      getNextChord();
    }
  }, [detectedChords]);
  
  useEffect(() => {
    getNextChord();
  }, [chordType]);
  

  const getNextChord = useCallback(() => {
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
  }, [drillMode, selectedInversion, chordType, targetChord]);
  return {
    targetChord,
    detectedChords,
    proMode,
    setProMode,
    activeNotes,
    setActiveNotes,
    chordType,
    setChordType,
    selectedInversion,
    setSelectedInversion,
    drillMode,
    setDrillMode,
  };
};

export default useChordPracticeGame;
