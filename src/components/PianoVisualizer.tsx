import React from 'react';
import { Note } from 'tonal';

interface PianoVisualizerProps {
  targetChord?: string;
  /**
   * Backward-compat: if `pressedNotes`/`sustainedNotes` are omitted, `activeNotes`
   * will be treated as "pressed" for rendering.
   */
  activeNotes?: number[];
  /** Notes that are currently physically held down (note-on without note-off). */
  pressedNotes?: number[];
  /** Notes that are still sounding only due to sustain pedal (key released). */
  sustainedNotes?: number[];
}

const PianoVisualizer: React.FC<PianoVisualizerProps> = ({
  targetChord,
  activeNotes = [],
  pressedNotes,
  sustainedNotes,
}) => {
  const startNote = 36; // C2
  const endNote = 84; // C6
  const pressedNotesSet = new Set(pressedNotes ?? activeNotes);
  const sustainedNotesSet = new Set(sustainedNotes ?? []);
  // let targetNotes = Chord.notes(targetChord).map((note) => Note.simplify(note));
  // targetNotes =[...targetNotes,...  targetNotes.map((note) => Note.enharmonic(note)) ]

  const bass = targetChord ? targetChord.split('/')[1] : null;
  // Piano key patterns
  const KEYS_IN_OCTAVE = 12;
  const WHITE_KEYS_IN_OCTAVE = 7;

  const isBassNote = (midiNote: number) => {
    if (!bass) return false;
    const c3Midi = Note.midi('C3');
    return (
      Note.pitchClass(Note.fromMidi(midiNote)) === bass &&
      c3Midi !== null &&
      midiNote < c3Midi
    );
  };
  const isTargetNote = (midiNote: number) => {
    midiNote;
    return false;
    // return targetNotes.includes(Note.pitchClass(Note.fromMidi(midiNote))) && midiNote>=Note.midi('C3')&&midiNote<=Note.midi('C4');
  };
  const isBlackKey = (midiNote: number) => {
    const noteInOctave = (midiNote - startNote) % KEYS_IN_OCTAVE;
    return [1, 3, 6, 8, 10].includes(noteInOctave);
  };

  const getWhiteKeyIndex = (midiNote: number) => {
    const noteInOctave = (midiNote - startNote) % KEYS_IN_OCTAVE;
    const octaveOffset =
      Math.floor((midiNote - startNote) / KEYS_IN_OCTAVE) *
      WHITE_KEYS_IN_OCTAVE;
    const whiteKeyMap = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];
    return octaveOffset + whiteKeyMap[noteInOctave];
  };

  const getBlackKeyOffset = (midiNote: number) => {
    const totalWhiteKeys = whiteKeys.length;
    const whiteKeyWidth = 100 / totalWhiteKeys;
    const whiteKeyIndex = getWhiteKeyIndex(midiNote);
    // Position black key between white keys, slightly to the left of center
    return `${whiteKeyIndex * whiteKeyWidth + whiteKeyWidth * 0.7}%`;
  };

  const isNotePressed = (midiNote: number) => pressedNotesSet.has(midiNote);
  const isNoteSustained = (midiNote: number) =>
    !isNotePressed(midiNote) && sustainedNotesSet.has(midiNote);

  const whiteKeys = Array.from({ length: endNote - startNote + 1 })
    .map((_, index) => startNote + index)
    .filter(midiNote => !isBlackKey(midiNote));

  const blackKeys = Array.from({ length: endNote - startNote + 1 })
    .map((_, index) => startNote + index)
    .filter(midiNote => isBlackKey(midiNote));

  return (
    <div className="w-full overflow-x-auto">
      <div className="relative h-48 flex" style={{ minWidth: '600px' }}>
        {/* White keys */}
        <div className="absolute top-0 left-0 right-0 bottom-0 flex">
          {whiteKeys.map(midiNote => (
            <div
              key={midiNote}
              className={`relative flex-1 border border-gray-300 
                ${
                  isNotePressed(midiNote)
                    ? 'bg-notification-text shadow-inner'
                    : isNoteSustained(midiNote)
                      ? 'bg-notification-text opacity-60 shadow-inner'
                    : isTargetNote(midiNote) || isBassNote(midiNote)
                      ? 'bg-showcase-bg'
                      : 'bg-white hover:bg-gray-50'
                }
                transition-colors duration-100
                rounded-b-lg
                flex items-end justify-center
                pb-2 text-xs text-[#b9b9b9]
              `}
            >
              {Note.fromMidi(midiNote).includes('C')
                ? Note.fromMidi(midiNote)
                : ''}
            </div>
          ))}
        </div>
        {/* Black keys */}
        <div className="absolute top-0 left-0 right-0">
          {blackKeys.map(midiNote => (
            <div
              key={midiNote}
              style={{
                position: 'absolute',
                left: getBlackKeyOffset(midiNote),
                width: '1.8%',
              }}
              className={`h-28 z-10 
                ${
                  isNotePressed(midiNote)
                    ? 'bg-notification-text shadow-lg'
                    : isNoteSustained(midiNote)
                      ? 'bg-notification-text opacity-60 shadow-lg'
                    : isTargetNote(midiNote) || isBassNote(midiNote)
                      ? 'bg-showcase-bg'
                      : 'shadow-lg bg-gray-900 hover:bg-gray-800'
                }
                transition-colors duration-100
                rounded-b-lg
                flex items-end justify-center
                pb-2 text-xs text-[#b9b9b9]
              `}
            >
              {Note.fromMidi(midiNote).includes('C')
                ? Note.fromMidi(midiNote)
                : ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PianoVisualizer;
