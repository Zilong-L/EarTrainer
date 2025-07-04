import React, { useEffect } from 'react';
import PianoVisualizer from '@components/PianoVisualizer';
import { Chord, Note } from 'tonal';
import { getSamplerInstance } from '@utils/Tone/samplers';
import { useTranslation } from 'react-i18next';
import { getNiceChordName } from '@utils/ChordTrainer/GameLogics'
const MIDIInputHandler = ({ activeNotes, setActiveNotes, targetChord, detectedChords, sustainedNotes, setSustainedNotes, showDegree, setShowDegree }) => {
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
    <div className="w-full space-y-4 ">
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
        <PianoVisualizer targetChord={targetChord} activeNotes={activeNotes} />
        {targetChord && (
          <div className="mt-4 flex items-center justify-end">
            <button
              onClick={() => setShowDegree(!showDegree)}
              className={`${showDegree ? 'bg-notification-bg' : 'bg-bg-accent'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
              <span
                className={`${showDegree ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </button>
            <span className="ml-2 text-sm font-medium text-text-primary">
              {t('settings.diatonic.showDegrees')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MIDIInputHandler;
