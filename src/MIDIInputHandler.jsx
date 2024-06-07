import React, { useEffect, useState } from 'react';
import { detect }  from "@tonaljs/chord-detect";
import { Midi }  from "@tonaljs/midi";
import { Typography,Box } from '@mui/material';

let notes = []

const MIDIInputHandler = ({ chord, setChord }) => {
  const [activeNotes, setActiveNotes] = useState([]);

  useEffect(() => {
    (async () => {
      if(navigator.requestMIDIAccess == null){
        return;
      }
      const midi = await navigator.requestMIDIAccess();
      console.log(midi)
      if (midi) {
        const inputs = midi.inputs.values();
        for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
          input.value.onmidimessage = (message) => {
            const [command, note, velocity] = message.data;
            if (command === 144) {
              notes = notes.concat(note);
            } else if (command === 128) {
              notes = notes.filter(n => n !== note);
            }
            setActiveNotes(notes.sort((a,b)=>a-b));
          };
        }
      }})();
  }, []);

  useEffect(() => {
    const notesString = activeNotes.map(note => Midi.midiToNoteName(note));
    const chordResult = detect(notesString)
    if (chordResult.length > 0) {
      setChord(chordResult.join(', '));
    } else {
      setChord('');
    }
  }, [activeNotes, setChord]);

  return (
  <Box sx={{width:"100%"}}>
  <Typography variant="h3" component="h3"   sx={{width:"100%"}}>
      {"Chord: "+chord }
  </Typography>
  <Typography variant="h3" component="h3" sx={{width:"100%"}}>
  {"Notes: "+activeNotes.map(note => midiToNoteWithOctave(note)).join(', ')}
  </Typography>
  </Box>);
  }

export default MIDIInputHandler;