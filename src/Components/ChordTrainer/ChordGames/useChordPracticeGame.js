import { useState, useEffect } from "react";

const flatNotes = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

const chordTypeAbbreviations = {
  Major: "M",
  Minor: "m",
  Diminished: "dim",
  Augmented: "aug",
  "Dominant 7th": "7",
  "Major 7th": "maj7",
  "Minor 7th": "m7",
  "Half Diminished 7th": "m7b5",
  "Diminished 7th": "dim7",
  "Augmented 7th": "aug7",
  "Dominant 9th": "9",
  "Major 9th": "M9",
  "Minor 9th": "m9",
  "Dominant 11th": "11",
  "Major 11th": "M11",
  "Minor 11th": "m11",
  "Dominant 13th": "13",
  "Major 13th": "M13",
  "Minor 13th": "m13",
};

const useChordPracticeGame = (settings) => {
  const [currentNote, setCurrentNote] = useState("C");
  const [chord, setChord] = useState("");
  const {chordType, setChordType} = settings;
  const notes = flatNotes;

  useEffect(() => {
    const targetChord = currentNote + chordTypeAbbreviations[chordType];

    let newNote = notes[Math.floor(Math.random() * notes.length)];
    while (newNote === currentNote) {
      newNote = notes[Math.floor(Math.random() * notes.length)];
    }

    if (
      chord.split(", ").includes(targetChord) ||
      chord.split(", ").some((ch) => ch.split("/")[0] === targetChord)
    ) {
      setCurrentNote(newNote);
    }
  }, [chord, chordType]);

  return {
    currentNote,
    chordTypeAbbreviation: chordTypeAbbreviations[chordType],
    chord,
    setChord,
  };
};

export default useChordPracticeGame;
