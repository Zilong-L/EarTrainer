import React, { useState, useEffect } from "react";
import { Typography, Grid } from "@mui/material";
import MIDIInputHandler from "./MIDIInputHandler";
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
const sharpNotes = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
const chordTypeAbbreviations = {
  Major: "M",
  Minor: "m",
  Diminished: "dim",
  Augmented: "aug",
  "Dominant 7th": "7",
  "Major 7th": "M7",
  "Minor 7th": "m7",
  "Half Diminished 7th": "m7-5",
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
const RandomNote = ({ chordType }) => {
  const [currentNote, setCurrentNote] = useState("C");
  const [chord, setChord] = useState("C");
  const notes = flatNotes;
  useEffect(() => {
    const targetChord = currentNote + chordTypeAbbreviations[chordType];
    const chordCandidates = chord.split(", ");

    let newNote = notes[Math.floor(Math.random() * notes.length)];
    while (newNote == currentNote) {
      newNote = notes[Math.floor(Math.random() * notes.length)];
    }
    if (chordCandidates.includes(targetChord)) {
      setCurrentNote(newNote);
    }
    if (chordCandidates.some((chord) => chord.split("/")[0] === targetChord)) {
      setCurrentNote(newNote);
    }
  }, [chord]);

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justify="center"
      style={{ height: "100vh", paddingLeft: "10%" }}
    >
      <Grid item style={{ height: "30vh", width: "100%" }}>
        <Typography variant="h1" component="h2" gutterBottom align="left">
          {currentNote}
          {chordTypeAbbreviations[chordType]}
        </Typography>
      </Grid>
      <Grid item sx={{ width: "100%" }}>
        <MIDIInputHandler chord={chord} setChord={setChord} />
      </Grid>
    </Grid>
  );
};

export default RandomNote;
