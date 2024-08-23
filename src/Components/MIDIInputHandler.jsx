import React, { useEffect, useState } from "react";
import { Midi, Note } from "tonal";
import * as Tone from "tone";
import { Typography, Box } from "@mui/material";
import { detect } from "@tonaljs/chord-detect";
let notes = [];
let midi = null;


const sampler = new Tone.Sampler({
  urls: {
    C1: "C1.mp3",
    C2: "C2.mp3",
    C3: "C3.mp3",
    C4: "C4.mp3",
    C5: "C5.mp3",
    C6: "C6.mp3",
    A1: "A1.mp3",
    A2: "A2.mp3",
    A3: "A3.mp3",
    A4: "A4.mp3",
    A5: "A5.mp3",
    A6: "A6.mp3",
    
  },
  release: 1,
  baseUrl: "https://tonejs.github.io/audio/salamander/",
}).toDestination();

Tone.loaded().then(() => {
  console.log("Sampler loaded and ready to use");
});

const MIDIInputHandler = ({ chord, setChord }) => {
  const [activeNotes, setActiveNotes] = useState([]);
  useEffect(() => {
    (async () => {
      if (navigator.requestMIDIAccess == null) {
        return;
      }
      if(midi == null){
        midi = await navigator.requestMIDIAccess();
        console.log("MIDI loaded");
        if (midi) {
          console.log('hi')
          const inputs = midi.inputs.values();
          for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
            input.value.onmidimessage = (message) => {
              const [command, note, velocity] = message.data;
              console.log(note)
              if (command === 144 && velocity > 0) {
                // Note on
                notes = notes.concat(note);
                sampler.triggerAttack(Note.fromMidi(note));
              } else if (command === 128 || (command === 144 && velocity === 0)) {
                // Note off
                sampler.triggerRelease(Note.fromMidi(note));
                notes = notes.filter((n) => n !== note);
              }
    
              setActiveNotes([...new Set(notes.sort((a, b) => a - b))]);
            };
          }
        }
      }

      })();
      return 

    }, []);


  useEffect(() => {
    const notesString = activeNotes.map((note) => Midi.midiToNoteName(note));
    const chordResult = detect(notesString, { assumePerfectFifth: true });
    if (chordResult.length > 0) {
      setChord(chordResult.join(", "));
    } else {
      setChord("");
    }
  }, [activeNotes]);

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h3" component="h3" sx={{ width: "100%" }}>
        {"Chord: " + chord}
      </Typography>
      <Typography variant="h3" component="h3" sx={{ width: "100%" }}>
        {"Notes: " + activeNotes.map((midi) => Note.fromMidi(midi)).join(", ")}
      </Typography>
    </Box>
  );
};

export default MIDIInputHandler;
