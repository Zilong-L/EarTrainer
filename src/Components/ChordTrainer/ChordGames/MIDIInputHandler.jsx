import React, { useEffect } from 'react';
import PianoVisualizer from './PianoVisualizer';
import { Chord, Note } from 'tonal';
import { getSamplerInstance } from '@utils/ToneInstance';
import { useTranslation } from 'react-i18next';
import {getNiceChordName} from '@utils/ChordTrainer/GameLogics'
const MIDIInputHandler = ({ activeNotes, setActiveNotes, targetChord,detectedChords,sustainedNotes,setSustainedNotes }) => {
  const { t } = useTranslation('chordGame');
  let sustainActive = false;
  let sustainedNotesSet = new Set();
  let pressingNotes = new Set();

  const midiMessageHandler = (message) => {
    const [command, note, velocity] = message.data;
    const pianoSampler = getSamplerInstance().sampler;

    if (command === 176 && note === 64) {
      sustainActive = velocity > 0;

      if (!sustainActive) {
        sustainedNotesSet.forEach((n) => {
          if (!pressingNotes.has(n)) {
            pianoSampler.triggerRelease(Note.fromMidi(n));
          }
        });
        sustainedNotesSet.clear();
        pressingNotes.forEach((n) => sustainedNotesSet.add(n));
      }
    } else if (command === 144 && velocity > 0) {
      pianoSampler.triggerAttack(Note.fromMidi(note), undefined, velocity / 128);
      pressingNotes.add(note);
      sustainedNotesSet.add(note);
    } else if (command === 128 || (command === 144 && velocity === 0)) {
      pressingNotes.delete(note);
      if (!sustainActive) {
        pianoSampler.triggerRelease(Note.fromMidi(note));
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
    <div className="w-full space-y-4 p-4">
      <div className="p-4 rounded-lg bg-bg-common">
        <h3 className="text-lg font-medium text-text-primary">
          {t('detectedChords')}: <span>{getNiceChordName(detectedChords).join(', ')}</span>
        </h3>
      </div>
      <div className="p-4 rounded-lg bg-bg-common">
        <h3 className="text-lg font-medium text-text-primary">
          {t('notes')}: <span>{activeNotes.map((midi) => Note.fromMidi(midi)).join(', ')}</span>
        </h3>
      </div>
      <div className="p-4 rounded-lg bg-bg-common">
      
      <PianoVisualizer targetChord={targetChord}activeNotes={activeNotes} />
      </div>
    </div>
  );
};

export default MIDIInputHandler;
