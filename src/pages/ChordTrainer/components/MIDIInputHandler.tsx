import React, { useEffect } from 'react';
import PianoVisualizer from '@components/PianoVisualizer';
import { Note } from 'tonal';
import { getSamplerInstance } from '@utils/Tone/samplers';
import { useTranslation } from 'react-i18next';
import useI18nStore from '@stores/i18nStore';
import { getNiceChordName } from '@utils/ChordTrainer/GameLogics';

interface MIDIInputHandlerProps {
  activeNotes: number[];
  setActiveNotes: (notes: number[]) => void;
  targetChord: string;
  detectedChords: string[];
  sustainedNotes: number[];
  setSustainedNotes: (notes: number[]) => void;
}

const MIDIInputHandler: React.FC<MIDIInputHandlerProps> = ({
  activeNotes,
  setActiveNotes,
  targetChord,
  detectedChords,
  sustainedNotes,
  setSustainedNotes,
}) => {
  const { namespace } = useI18nStore();
  const { t } = useTranslation(namespace);
  let sustainActive = false;
  const sustainedNotesSet = new Set<number>();
  const pressingNotes = new Set<number>();

  const midiMessageHandler = (message: any) => {
    const [command, note, velocity] = message.data;
    const pianoSampler = getSamplerInstance().sampler;

    if (command === 176 && note === 64) {
      sustainActive = velocity > 0;

      if (!sustainActive) {
        sustainedNotesSet.forEach(n => {
          if (!pressingNotes.has(n)) {
            pianoSampler.triggerRelease(Note.fromMidi(n));
          }
        });
        sustainedNotesSet.clear();
        pressingNotes.forEach(n => sustainedNotesSet.add(n));
      }
    } else if (command === 144 && velocity > 0) {
      pianoSampler.triggerAttack(
        Note.fromMidi(note),
        undefined,
        velocity / 128
      );
      pressingNotes.add(note);
      sustainedNotesSet.add(note);
    } else if (command === 128 || (command === 144 && velocity === 0)) {
      pressingNotes.delete(note);
      if (!sustainActive) {
        pianoSampler.triggerRelease(Note.fromMidi(note));
        sustainedNotesSet.delete(note);
      }
    }

    const activeNotesArray = Array.from(sustainedNotesSet).sort(
      (a, b) => a - b
    );
    const sustainedOnlyArray = activeNotesArray.filter(
      n => !pressingNotes.has(n)
    );
    setActiveNotes(activeNotesArray);
    setSustainedNotes(sustainedOnlyArray);
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

  const sustainedNotesSetForRender = new Set(sustainedNotes);
  const pressedNotesForRender = activeNotes.filter(
    midi => !sustainedNotesSetForRender.has(midi)
  );

  return (
    <div className="w-full space-y-4">
      <div className="p-4 rounded-lg bg-bg-common space-y-4">
        <h3 className="text-lg font-medium text-text-primary">
          {t('detectedChords')}:{' '}
          <span>{getNiceChordName(detectedChords).join(', ')}</span>
        </h3>
        <div className="ct-hide-mobile-portrait">
          <PianoVisualizer
            targetChord={targetChord}
            pressedNotes={pressedNotesForRender}
            sustainedNotes={sustainedNotes}
            activeNotes={activeNotes}
          />
        </div>
      </div>
    </div>
  );
};

export default MIDIInputHandler;
