import React from 'react';
import { Note,Chord, midi} from 'tonal';

const PianoVisualizer = ({ targetChord,activeNotes }) => {
  const startNote = 36; // C2
  const endNote = 84;   // C6
  const activeNotesSet = new Set(activeNotes);
  let targetNotes = Chord.notes(targetChord).map((note) => Note.simplify(note));
  targetNotes =[...targetNotes,...  targetNotes.map((note) => Note.enharmonic(note)) ]

  const bass = targetChord.split('/')[1];
  // Piano key patterns
  const KEYS_IN_OCTAVE = 12;
  const WHITE_KEYS_IN_OCTAVE = 7;

  const isBassNote = (midiNote) => {
    return Note.pitchClass(Note.fromMidi(midiNote)) === bass && midiNote<Note.midi('C3');
  }
  const isTargetNote = (midiNote) => {
      return targetNotes.includes(Note.pitchClass(Note.fromMidi(midiNote))) && midiNote>=Note.midi('C3')&&midiNote<=Note.midi('C4');
  }
  const isBlackKey = (midiNote) => {
    const noteInOctave = (midiNote - startNote) % KEYS_IN_OCTAVE;
    return [1, 3, 6, 8, 10].includes(noteInOctave);
  };

  const getWhiteKeyIndex = (midiNote) => {
    const noteInOctave = (midiNote - startNote) % KEYS_IN_OCTAVE;
    const octaveOffset = Math.floor((midiNote - startNote) / KEYS_IN_OCTAVE) * WHITE_KEYS_IN_OCTAVE;
    const whiteKeyMap = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];
    return octaveOffset + whiteKeyMap[noteInOctave];
  };

  const getBlackKeyOffset = (midiNote) => {
    const totalWhiteKeys = whiteKeys.length;
    const whiteKeyWidth = 100 / totalWhiteKeys;
    const whiteKeyIndex = getWhiteKeyIndex(midiNote);
    // Position black key between white keys, slightly to the left of center
    return `${whiteKeyIndex * whiteKeyWidth + (whiteKeyWidth * 0.7)}%`;
  };

  const isNoteActive = (midiNote) => activeNotesSet.has(midiNote);

  const whiteKeys = Array.from({ length: endNote - startNote + 1 })
    .map((_, index) => startNote + index)
    .filter(midiNote => !isBlackKey(midiNote));

  const blackKeys = Array.from({ length: endNote - startNote + 1 })
    .map((_, index) => startNote + index)
    .filter(midiNote => isBlackKey(midiNote));

  return (
    <div className="w-full overflow-x-auto p-4">
      <div className="relative h-48 flex" style={{ minWidth: '600px' }}>
        {/* White keys */}
        <div className="absolute top-0 left-0 right-0 bottom-0 flex">
          {whiteKeys.map((midiNote) => (
            <div
              key={midiNote}
              className={`relative flex-1 border border-gray-300 
                ${isNoteActive(midiNote) 
                  ? 'bg-notification-text shadow-inner' 
                  : isTargetNote(midiNote)||isBassNote(midiNote)?'bg-showcase-bg':  'bg-white hover:bg-gray-50'
                }
                transition-colors duration-100
                rounded-b-lg
                flex items-end justify-center
                pb-2 text-xs text-[#b9b9b9]
              `}
            >
              {Note.fromMidi(midiNote).includes('C') ? Note.fromMidi(midiNote) : ''}
            </div>
          ))}
        </div>
        {/* Black keys */}
        <div className="absolute top-0 left-0 right-0">
          {blackKeys.map((midiNote) => (
            <div
              key={midiNote}
              style={{
                position: 'absolute',
                left: getBlackKeyOffset(midiNote),
                width: '1.8%',
              }}
              className={`h-28 z-10 
                ${isNoteActive(midiNote)
                  ? 'bg-notification-text shadow-lg' 
                  :  isTargetNote(midiNote)||isBassNote(midiNote)?'bg-showcase-bg':'shadow-lg bg-gray-900 hover:bg-gray-800'
                }
                transition-colors duration-100
                rounded-b-lg
                flex items-end justify-center
                pb-2 text-xs text-[#b9b9b9]
              `}
            >
              {Note.fromMidi(midiNote).includes('C') ? Note.fromMidi(midiNote) : ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PianoVisualizer;
