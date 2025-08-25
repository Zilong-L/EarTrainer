import React, { useEffect, useState, useRef } from 'react';
import { Note } from 'tonal';
import { getSamplerInstance } from '@utils/Tone/samplers';
import { useTranslation } from 'react-i18next';
import useI18nStore from '@stores/i18nStore';
import { getChords } from '@utils/ChordTrainer/GameLogics';
import { Portal } from '@headlessui/react';
import { useSoundSettingsStore } from '@stores/soundSettingsStore';
import PianoVisualizer from './PianoVisualizer';

interface MIDIInputHandlerProps {
  activeNotes: number[];
  setActiveNotes: (notes: number[]) => void;
}

const MIDIInputHandler: React.FC<MIDIInputHandlerProps> = ({
  activeNotes,
  setActiveNotes,
}) => {
  const playMidiSounds = useSoundSettingsStore(state => state.playMidiSounds);
  const playMidiSoundsRef = useRef(playMidiSounds);
  useEffect(() => {
    playMidiSoundsRef.current = playMidiSounds;
  }, [playMidiSounds]);
  const { namespace } = useI18nStore();
  const { t } = useTranslation(namespace);
  let sustainActive = false;
  const sustainedNotesSet = new Set<number>();
  const pressingNotes = new Set<number>();
  const [detectedChords, setDetectedChords] = useState<string[]>([]);

  useEffect(() => {
    if (!activeNotes || activeNotes.length === 0) return;
    const chordResult = getChords(activeNotes);
    setDetectedChords(chordResult || []);
  }, [activeNotes]);

  const midiMessageHandler = (message: any) => {
    const [command, note, velocity] = message.data;
    const pianoSampler = getSamplerInstance().sampler;

    if (command === 176 && note === 64) {
      sustainActive = velocity > 0;

      if (!sustainActive) {
        sustainedNotesSet.forEach(n => {
          if (!pressingNotes.has(n)) {
            if (playMidiSoundsRef.current) {
              pianoSampler.triggerRelease(Note.fromMidi(n));
            }
          }
        });
        sustainedNotesSet.clear();
        pressingNotes.forEach(n => sustainedNotesSet.add(n));
      }
    } else if (command === 144 && velocity > 0) {
      if (playMidiSoundsRef.current) {
        pianoSampler.triggerAttack(
          Note.fromMidi(note),
          undefined,
          velocity / 128
        );
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
    let inputs: any[] = [];
    const setupMIDI = async () => {
      if ((navigator as any).requestMIDIAccess == null) {
        console.warn(t('midi.noAccess'));
        return;
      }
      const midi = await (navigator as any).requestMIDIAccess();
      console.log(t('midi.loaded'));
      inputs = Array.from(midi.inputs.values());
      for (const input of inputs) {
        input.onmidimessage = (message: any) => midiMessageHandler(message);
      }
    };

    setupMIDI();

    return () => {
      // Unsubscribe message handlers when component unmounts
      for (const input of inputs) {
        input.onmidimessage = null;
      }
    };
  }, []);

  return (
    <div className="w-full space-y-4 ">
      <Portal>
        <PianoVisualizer
          detectedChords={detectedChords}
          activeNotes={activeNotes}
        />
      </Portal>
    </div>
  );
};

export default MIDIInputHandler;
