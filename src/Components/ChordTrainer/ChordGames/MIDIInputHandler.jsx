import React, { useEffect, useState } from 'react';
import { Midi, Note } from 'tonal';
import { getSamplerInstance } from '@utils/ToneInstance';
import { Typography, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { detect } from "@tonaljs/chord-detect";


const MIDIInputHandler = ({ chord, setChord }) => {
  const { t } = useTranslation('chordGame');
  const [activeNotes, setActiveNotes] = useState([]);
  let sustainActive = false;
  let sustainedNotes = new Set();
  let pressingNotes = new Set();

  const midiMessageHandler = (message) => {
    const [command, note, velocity] = message.data;
    const pianoSampler = getSamplerInstance().sampler;

    if (command === 176 && note === 64) {
      sustainActive = velocity > 0;

      if (!sustainActive) {
        sustainedNotes.forEach((n) => {
          if (!pressingNotes.has(n)) {
            pianoSampler.triggerRelease(Note.fromMidi(n));
          }
        });
        sustainedNotes.clear();
        pressingNotes.forEach((n) => sustainedNotes.add(n));
      }
    } else if (command === 144 && velocity > 0) {
      pianoSampler.triggerAttack(Note.fromMidi(note), undefined, velocity / 128);
      pressingNotes.add(note);
      sustainedNotes.add(note);
    } else if (command === 128 || (command === 144 && velocity === 0)) {
      pressingNotes.delete(note);
      if (!sustainActive) {
        pianoSampler.triggerRelease(Note.fromMidi(note));
        sustainedNotes.delete(note);
      }
    }

    setActiveNotes(Array.from(sustainedNotes).sort((a, b) => a - b));
  };
  useEffect(() => {
    let inputs = [];
    const setupMIDI = async () => {
      if (navigator.requestMIDIAccess == null) {
        console.warn(t('midi.noAccess'));
        return;
      }
      const midi = await navigator.requestMIDIAccess();
      console.log(t('midi.loaded'));
      inputs = Array.from(midi.inputs.values());
      for (let input of inputs) {
        input.onmidimessage = (message) => midiMessageHandler(message);
      }
    };
  
    setupMIDI();
  
    return () => {
      // Unsubscribe message handlers when component unmounts
      for (let input of inputs) {
        input.onmidimessage = null;
      }
    };
  }, []);
  

  useEffect(() => {
    const notesString = activeNotes.map((note) => Midi.midiToNoteName(note));
    const chordResult = detect(notesString, { assumePerfectFifth: true });
    if (chordResult.length > 0) {
      setChord(chordResult.join(', '));
    } else {
      setChord('');
    }
  }, [activeNotes]);

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h3" component="h3">
        {t('chord')}: {chord}
      </Typography>
      <Typography variant="h3" component="h3">
        {t('notes')}: {activeNotes.map((midi) => Note.fromMidi(midi)).join(', ')}
      </Typography>
    </Box>
  );
};

export default MIDIInputHandler;
