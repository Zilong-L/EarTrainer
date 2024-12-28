import { useState, useEffect } from "react";
import { detect } from "@tonaljs/chord-detect";
import { Chord,  Midi, Note } from 'tonal';




const useChordPracticeGame = () => {
  const [targetChord, setTargetChord] = useState("");
  const [detectedChords, setDetectedChords] = useState([]);
  const [activeNotes, setActiveNotes] = useState([]);
  const [ignoreTranspose, setIgnoreTranspose] = useState(true);
  const [chordType, setChordType] = useState("Major");
  const [proMode, setProMode] = useState(false);

  const notes = Array(12).fill(0).map((_, i) => Note.transposeFifths("C", i - Math.floor(6)));
  useEffect(() => {

    if(!activeNotes) return;
    const notesString = activeNotes.map((note) => Midi.midiToNoteName(note));
    const chordResult = detect(notesString, { assumePerfectFifth: true });
    setDetectedChords(chordResult);
  }, [activeNotes]);

  useEffect(() => {
    let detectedChordsForComparison = detectedChords
    let targetChordForComparison = targetChord;
    

    if(ignoreTranspose){
      detectedChordsForComparison = detectedChordsForComparison.map(ch => ch.split('/')[0])
      targetChordForComparison = targetChord.split('/')[0];
    }
    if(
      detectedChordsForComparison.some(ch => Chord.get(ch).name === Chord.get(targetChordForComparison).name)
    ) {
      getNextChord()
    }
  }, [detectedChords]);
  useEffect(() => {
    getNextChord();
  }, [chordType]);
  function getNextChord() {
    const symbol = Chord.get(chordType.toLowerCase()).aliases[0];
    let currentRoot = Chord.get(targetChord).tonic;
    let newRoot;
    do {
    newRoot = notes[Math.floor(Math.random() * notes.length)];
    } while (currentRoot === newRoot);
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
  };
};

export default useChordPracticeGame;
