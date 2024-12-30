import React, { useEffect } from 'react';
import { Note } from 'tonal';
import { getSamplerInstance } from '@utils/ToneInstance';
import { useTranslation } from 'react-i18next';

const MIDIInputHandler = ({ activeNotes, setActiveNotes, detectedChords }) => {
  const { t } = useTranslation('chordGame');
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

  return (
    <div className="w-full space-y-4">
      <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-700">
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
          {t('detectedChords')}: <span className="font-normal">{detectedChords.join(', ')}</span>
        </h3>
      </div>
      <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-700">
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
          {t('notes')}: <span className="font-normal">{activeNotes.map((midi) => Note.fromMidi(midi)).join(', ')}</span>
        </h3>
      </div>
    </div>
  );
};

export default MIDIInputHandler;
