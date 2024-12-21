import React, { useEffect, useState } from "react";
import { Midi, Note } from "tonal";
import { getSamplerInstance } from '@utils/ToneInstance';
import { Typography, Box } from "@mui/material";
import { detect } from "@tonaljs/chord-detect";
let notes = [];
let midi = null;


const MIDIInputHandler = ({ chord, setChord }) => {
  const [activeNotes, setActiveNotes] = useState([]);
  const midiMessageHandler = (message) => {
    const [command, note, velocity] = message.data;
    const pianoSampler = getSamplerInstance().sampler;
    console.log(note)
    if (command === 144 && velocity > 0) {
      // Note on
      notes = notes.concat(note);
      pianoSampler.triggerAttack(Note.fromMidi(note));
    } else if (command === 128 || (command === 144 && velocity === 0)) {
      // Note off
      pianoSampler.triggerRelease(Note.fromMidi(note));
      notes = notes.filter((n) => n !== note);
    }

    setActiveNotes([...new Set(notes.sort((a, b) => a - b))]);
  };
  useEffect(() => {
    (async () => {
      if (navigator.requestMIDIAccess == null) {
        return;
      }
      if(midi == null){
        midi = await navigator.requestMIDIAccess();
        console.log("MIDI loaded");
      }
      if (midi) {
          console.log('hi')
          const inputs = midi.inputs.values();
          for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
            input.value.onmidimessage = midiMessageHandler
          }
        }

      })();
      return ()=>{
        const inputs = midi.inputs.values();
        for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
            input.value.onmidimessage = null
        }
      }

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
       <Typography
      variant="h3"
      component="h3"
      sx={{
        width: '100%',
        fontSize: {
          xs: '2rem', // 小屏幕 (extra small)：1.5rem
          sm: '2rem',   // 中小屏幕 (small)：2rem
          md: '2.5rem', // 中等屏幕 (medium)：2.5rem
          lg: '3rem',   // 大屏幕 (large)：3rem
          xl: '3.5rem', // 超大屏幕 (extra large)：3.5rem
        },
      }}
    >
        {"Chord: " + chord}
      </Typography>
      <Typography
      variant="h3"
      component="h3"
      sx={{
        width: '100%',
        fontSize: {
          xs: '2rem', // 小屏幕 (extra small)：1.5rem
          sm: '2rem',   // 中小屏幕 (small)：2rem
          md: '2.5rem', // 中等屏幕 (medium)：2.5rem
          lg: '3rem',   // 大屏幕 (large)：3rem
          xl: '3.5rem', // 超大屏幕 (extra large)：3.5rem
        },
      }}
    >
        {"Notes: " + activeNotes.map((midi) => Note.fromMidi(midi)).join(", ")}
      </Typography>
    </Box>
  );
};

export default MIDIInputHandler;
