import { useEffect, useState, useRef } from 'react';
import { Note } from 'tonal';
import { getSamplerInstance, ensureAudioStarted } from '@utils/Tone/samplers';
import { useTranslation } from 'react-i18next';
import { getChords } from '@utils/ChordTrainer/GameLogics';
import { useSoundSettingsStore } from '@stores/soundSettingsStore';
import PianoVisualizer from './PianoVisualizer';

interface MIDIInputHandlerProps {
  activeNotes: number[];
  setActiveNotes: (notes: number[]) => void;
}

// Mounted only after the user explicitly enables MIDI in listening settings.
export default function MIDIInputHandler({
  activeNotes,
  setActiveNotes,
}: MIDIInputHandlerProps) {
  const playMidiSounds = useSoundSettingsStore(state => state.playMidiSounds);
  const options = useRef({ playMidiSounds, setActiveNotes });
  options.current = { playMidiSounds, setActiveNotes };
  const { t } = useTranslation('chordColorTrainer');
  const [sustainedNotes, setSustainedNotes] = useState<number[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let disposed = false;
    let midi: MIDIAccess | undefined;
    const handlers = new Map<MIDIInput, (event: MIDIMessageEvent) => void>();
    const pressed = new Map<string, number>();
    const sounding = new Map<string, number>();
    const sustainChannels = new Set<string>();
    const refresh = () => {
      const notes = [...new Set(sounding.values())].sort((a, b) => a - b);
      const held = new Set(pressed.values());
      options.current.setActiveNotes(notes);
      setSustainedNotes(notes.filter(note => !held.has(note)));
    };
    const handleMessage = (device: string, event: MIDIMessageEvent) => {
      if (disposed || !event.data || event.data.length < 3) return;
      const [status, note, velocity] = event.data;
      const command = status & 0xf0;
      const channel = `${device}:${status & 0x0f}`;
      const key = `${channel}:${note}`;
      const sampler = getSamplerInstance().sampler;
      if (command === 0xb0 && note === 64) {
        if (velocity >= 64) sustainChannels.add(channel);
        else {
          sustainChannels.delete(channel);
          for (const [voiceKey, pitch] of sounding) {
            if (voiceKey.startsWith(`${channel}:`) && !pressed.has(voiceKey)) {
              if (options.current.playMidiSounds)
                sampler.triggerRelease(Note.fromMidi(pitch));
              sounding.delete(voiceKey);
            }
          }
        }
      } else if (command === 0x90 && velocity > 0) {
        pressed.set(key, note);
        sounding.set(key, note);
        if (options.current.playMidiSounds) {
          void ensureAudioStarted()
            .then(() => {
              if (!disposed && sounding.has(key))
                getSamplerInstance().sampler.triggerAttack(
                  Note.fromMidi(note),
                  undefined,
                  velocity / 127
                );
            })
            .catch(() => setError(true));
        }
      } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
        pressed.delete(key);
        if (!sustainChannels.has(channel)) {
          sounding.delete(key);
          if (options.current.playMidiSounds)
            sampler.triggerRelease(Note.fromMidi(note));
        }
      }
      refresh();
    };
    const connectInputs = () => {
      if (!midi || disposed) return;
      for (const [input, handler] of handlers) {
        if (input.state === 'disconnected') {
          input.removeEventListener('midimessage', handler);
          handlers.delete(input);
        }
      }
      for (const input of midi.inputs.values()) {
        if (handlers.has(input) || input.state === 'disconnected') continue;
        const handler = (event: MIDIMessageEvent) =>
          handleMessage(input.id, event);
        handlers.set(input, handler);
        input.addEventListener('midimessage', handler);
      }
    };
    if (!navigator.requestMIDIAccess) setError(true);
    else
      void navigator
        .requestMIDIAccess({ sysex: false })
        .then(access => {
          if (disposed) return;
          midi = access;
          connectInputs();
          midi.addEventListener('statechange', connectInputs);
        })
        .catch(() => {
          if (!disposed) setError(true);
        });
    return () => {
      disposed = true;
      midi?.removeEventListener('statechange', connectInputs);
      for (const [input, handler] of handlers)
        input.removeEventListener('midimessage', handler);
      getSamplerInstance().releaseAll();
      options.current.setActiveNotes([]);
    };
  }, []);

  const held = activeNotes.filter(note => !sustainedNotes.includes(note));
  return (
    <div>
      {error && (
        <p role="status" className="chord-lab-error">
          {t('midi.error')}
        </p>
      )}
      <PianoVisualizer
        detectedChords={getChords(activeNotes) || []}
        activeNotes={activeNotes}
        pressedNotes={held}
        sustainedNotes={sustainedNotes}
      />
    </div>
  );
}
