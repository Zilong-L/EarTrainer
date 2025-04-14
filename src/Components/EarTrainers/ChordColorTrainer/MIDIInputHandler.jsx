import React, { useEffect, useState, useRef } from 'react';
import { Note, Chord } from 'tonal';
import { getSamplerInstance } from '@utils/ToneInstance';
import { useTranslation } from 'react-i18next';
import { getChords, getNiceChordName } from '@utils/ChordTrainer/GameLogics';
import PianoVisualizer from '@components/SharedComponents/PianoVisualizer';

const MIDIInputHandler = ({ activeNotes, setActiveNotes, targetChord, playMidiSounds }) => {
  const playMidiSoundsRef = useRef(playMidiSounds);  // Initialize with the prop value

  useEffect(() => {
    playMidiSoundsRef.current = playMidiSounds;  // Update ref when prop changes
  }, [playMidiSounds]);
  // Removed duplicate declaration to fix TypeScript error
  const [showDegree, setShowDegree] = useState(false);
  const { t } = useTranslation('chordGame');
  let sustainActive = false;
  let sustainedNotesSet = new Set();
  let pressingNotes = new Set();
  const [detectedChords, setDetectedChords] = useState([]);

  useEffect(() => {
    if (!activeNotes) return;
    const chordResult = getChords(activeNotes);
    setDetectedChords(chordResult);
  }, [activeNotes]);

  const midiMessageHandler = (message) => {
    const [command, note, velocity] = message.data;
    const pianoSampler = getSamplerInstance().sampler;

    if (command === 176 && note === 64 && playMidiSoundsRef.current) {
      sustainActive = velocity > 0;

      if (!sustainActive) {
        sustainedNotesSet.forEach((n) => {
          if (!pressingNotes.has(n)) {
            if (playMidiSoundsRef.current) {
              pianoSampler.triggerRelease(Note.fromMidi(n));
            }
          }
        });
        sustainedNotesSet.clear();
        pressingNotes.forEach((n) => sustainedNotesSet.add(n));
      }
    } else if (command === 144 && velocity > 0) {
      if (playMidiSoundsRef.current) {
        pianoSampler.triggerAttack(Note.fromMidi(note), undefined, velocity / 128);
      }
      pressingNotes.add(note);
      sustainedNotesSet.add(note);
    } else if (command === 128 || (command === 144 && velocity === 0)) {
      pressingNotes.delete(note);
      if (!sustainActive) {
        if (playMidiSoundsRef.current) {
          pianoSampler.triggerRelease(Note.fromMidi(note));
        }
        sustainedNotesSet.delete(note);
      }
    }

    setActiveNotes(Array.from(sustainedNotesSet).sort((a, b) => a - b));

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

  return (
    <div className="w-full space-y-4 ">

    </div>
  );
};

export default MIDIInputHandler;
