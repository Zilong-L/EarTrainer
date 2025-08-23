import React from 'react';
import { useSoundSettingsStore } from '@stores/soundSettingsStore';
import { playNotesAdditive } from '@utils/Tone/playbacks';

const START_NOTE = 48; // C3
const END_NOTE = 71;   // B4
const WHITE_KEY_WIDTH = 14;
const BLACK_KEY_WIDTH = 8;
const WHITE_KEY_HEIGHT = 40;
const BLACK_KEY_HEIGHT = 24;
const SVG_PADDING_X = 40; // Left padding for speaker icons etc.
const SVG_PADDING_Y = 10; // Top/bottom padding

interface Key {
  midi: number;
  isBlack: boolean;
  x: number;
  width: number;
  height: number;
}

interface PianoVisualizerProps {
  activeNotes?: number[];
  detectedChords?: string[];
}

// Helper to check if a MIDI note is black
const isBlackKey = (midiNote: number): boolean => {
    const pitchClass = midiNote % 12;
    return [1, 3, 6, 8, 10].includes(pitchClass);
};

// Generate all keys in the range
const generateKeys = (start: number, end: number): Key[] => {
    const keys: Key[] = [];
    let whiteKeyIndex = 0;
    for (let midi = start; midi <= end; midi++) {
        const black = isBlackKey(midi);
        keys.push({
            midi: midi,
            isBlack: black,
            x: black ? getBlackKeyX(midi, start) : getWhiteKeyX(whiteKeyIndex),
            width: black ? BLACK_KEY_WIDTH : WHITE_KEY_WIDTH,
            height: black ? BLACK_KEY_HEIGHT : WHITE_KEY_HEIGHT,
        });
        if (!black) {
            whiteKeyIndex++;
        }
    }
    return keys;
};

// Calculate X position for white keys based on their index within the range
const getWhiteKeyX = (index: number): number => {
    return SVG_PADDING_X + index * WHITE_KEY_WIDTH;
};

// Calculate X position for black keys based on their MIDI note relative to the start note
const getBlackKeyX = (midiNote: number, startNote: number): number => {
    // Find the index of the preceding white key
    let precedingWhiteKeyIndex = 0;
    for (let i = startNote; i < midiNote; i++) {
        if (!isBlackKey(i)) {
            precedingWhiteKeyIndex++;
        }
    }
    // Position black key slightly offset from the preceding white key's right edge
    return SVG_PADDING_X + precedingWhiteKeyIndex * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2;
};

// Updated getKeyColor to use MIDI notes
function getKeyColor(midiNote: number, activeMidiNotes: number[], rootMidiNote: number | null, isBlackKey: boolean): string {
    // Check if this specific MIDI note is the root note
    if (rootMidiNote === midiNote) return '#FFD700'; // Gold for root

    // Check if this specific MIDI note is active
    if (activeMidiNotes.includes(midiNote)) {
        return isBlackKey ? '#1565C0' : '#4FC3F7'; // Dark blue/light blue for active notes
    }

    // Default colors
    return isBlackKey ? 'black' : 'white';
}

const PianoVisualizer: React.FC<PianoVisualizerProps> = ({ activeNotes = [], detectedChords = [] }) => {
    const playMidiSounds = useSoundSettingsStore((state) => state.playMidiSounds);
    const setPlayMidiSounds = useSoundSettingsStore((state) => state.setPlayMidiSounds);

    // Get the lowest active note as the potential root (or null if none)
    const rootNoteMidi = activeNotes.length > 0 ? Math.min(...activeNotes) : null;

    const keys = generateKeys(START_NOTE, END_NOTE);
    const totalWhiteKeys = keys.filter(k => !k.isBlack).length;
    const svgWidth = SVG_PADDING_X * 2 + totalWhiteKeys * WHITE_KEY_WIDTH; // Calculate width based on white keys + padding
    const svgHeight = WHITE_KEY_HEIGHT + SVG_PADDING_Y * 2;

    const handleKeyClick = (midiNote: number) => {
        if (playMidiSounds) {
            playNotesAdditive([midiNote]);
        }
    };

    return (
        <div className="font-chewy hidden md:block absolute right-4 top-[38.2%] -translate-y-[50%] text-white rounded gap-4 bg-black/50 p-4 w-[300px]">

            <div className="flex  justify-between flex-col">
                <div className="text-4xl font-bold ">
                    {detectedChords[0] || '-'}
                </div>

                <div className="text-md min-h-6 min-w-[200]  flex">
                    {detectedChords.length > 1 &&
                        detectedChords.slice(1).map((chord, i) => (
                            <div key={i}>{chord + ','}&nbsp;</div>
                        ))
                    }
                </div>
            </div>

            {/* Adjusted SVG size */}
            <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} xmlns="http://www.w3.org/2000/svg" className="mt-4">
                {/* Background rectangle */}
                <rect x="1" y="1" width={svgWidth - 2} height={svgHeight - 2} rx="6" fill="#f2f2f2" stroke="black" strokeWidth="2" />

                {/* Speaker Icon Placeholder Circles (adjust position based on new width) */}
                <circle cx="14" cy={SVG_PADDING_Y + 6} r="4" fill="#888" />
                <circle cx="14" cy={svgHeight / 2} r="4" fill="#888" />
                <circle cx="14" cy={svgHeight - SVG_PADDING_Y - 6} r="4" fill="#888" />

                {/* Render White Keys first */}
                {keys.filter(key => !key.isBlack).map(key => (
                    <rect
                        key={`key-${key.midi}`}
                        x={key.x}
                        y={SVG_PADDING_Y}
                        width={key.width}
                        height={key.height}
                        fill={getKeyColor(key.midi, activeNotes, rootNoteMidi, false)}
                        stroke="black"
                        strokeWidth="1"
                        onClick={() => handleKeyClick(key.midi)}
                        className="cursor-pointer"
                    />
                ))}

                {/* Render Black Keys on top */}
                {keys.filter(key => key.isBlack).map(key => (
                    <rect
                        key={`key-${key.midi}`}
                        x={key.x}
                        y={SVG_PADDING_Y}
                        width={key.width}
                        height={key.height}
                        fill={getKeyColor(key.midi, activeNotes, rootNoteMidi, true)}
                        stroke="black"
                        strokeWidth="1"
                        onClick={() => handleKeyClick(key.midi)}
                        className="cursor-pointer"
                    />
                ))}

                {/* Speaker icon (adjust position based on new width) */}
                <g onClick={() => setPlayMidiSounds(!playMidiSounds)} className="cursor-pointer">
                    <rect x="235" y="15" width="30" height="30" fill="transparent" />
                    {playMidiSounds ? (
                        <>
                            <path d="M242 24 Q250 30 242 36" stroke="black" strokeWidth="3" fill="none" />
                            <path d="M248 20 Q258 30 248 40" stroke="black" strokeWidth="3" fill="none" />
                        </>
                    ) : (
                        <>
                            <line x1="244" y1="22" x2="252" y2="38" stroke="black" strokeWidth="3" />
                            <line x1="252" y1="22" x2="244" y2="38" stroke="black" strokeWidth="3" />
                        </>
                    )}
                </g>
            </svg>
        </div>
    );
};

export default PianoVisualizer;