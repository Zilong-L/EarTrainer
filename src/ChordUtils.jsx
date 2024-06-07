const NOTE_VAL_DICT = {
    'C': 0, 'C♯': 1, 'Db': 1, 'D': 2, 'D♯': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F♯': 6, 'Gb': 6, 'G': 7, 'G♯': 8,
    'Ab': 8, 'A': 9, 'A♯': 10, 'Bb': 10, 'B': 11
};

const midiToPitchClass = (midiNote) => {
    const pitchClasses = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
    return pitchClasses[midiNote % 12];
  };
  
  const midiToNoteWithOctave = (midiNote) => {
    const pitchClasses = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    return `${pitchClasses[midiNote % 12]}${octave}`;
  };
  function midiToNoteABC(midiNumber) {
    const noteNames = ["C", "^C", "D", "^D", "E", "F", "^F", "G", "^G", "A", "^A", "B"];
    const octaveIndex = Math.floor((midiNumber-60) / 12) - 1;
    const noteIndex = midiNumber % 12;
    const noteBase = noteNames[noteIndex];

    // Adjust the note representation for ABC notation octaves
    if (octaveIndex < -1) {
        // Lower octaves (C, and below)
        return noteBase + ",".repeat(Math.abs(octaveIndex + 1));
    } else if (octaveIndex == -1 ) {
        // Middle C to B above middle C (C to B)
        return noteBase;
    } else {
        // Upper octaves (c' and above)
        return noteBase.toLowerCase() + "'".repeat(octaveIndex);
    }
}

// Define this according to actual musical theory
const DEFAULT_QUALITIES = [
    ['5', [0, 7]],
    ['no5', [0, 4]],
    ['omit5', [0, 4]],
    ['m(no5)', [0, 3]],
    ['m(omit5)', [0, 3]],
    ['', [0, 4, 7]],
    ['maj', [0, 4, 7]],
    ['m', [0, 3, 7]],
    ['min', [0, 3, 7]],
    ['-', [0, 3, 7]],
    ['dim', [0, 3, 6]],
    ['b5', [0, 4, 6]],
    ['aug', [0, 4, 8]],
    ['sus2', [0, 2, 7]],
    ['sus4', [0, 5, 7]],
    ['sus', [0, 5, 7]],
    ['6', [0, 4, 7, 9]],
    ['6b5', [0, 4, 6, 9]],  
    ['6-5', [0, 4, 6, 9]],  
    ['7', [0, 4, 7, 10]],
    ['7-5', [0, 4, 6, 10]],
    ['7b5', [0, 4, 6, 10]],
    ['7+5', [0, 4, 8, 10]],
    ['7♯5', [0, 4, 8, 10]],
    ['7sus4', [0, 5, 7, 10]],
    ['m6', [0, 3, 7, 9]],
    ['m7', [0, 3, 7, 10]],
    ['m7-5', [0, 3, 6, 10]],
    ['m7b5', [0, 3, 6, 10]],
    ['m7+5', [0, 3, 8, 10]],
    ['m7♯5', [0, 3, 8, 10]],
    ['dim6', [0, 3, 6, 8]],
    ['dim7', [0, 3, 6, 9]],
    ['M7', [0, 4, 7, 11]],
    ['maj7', [0, 4, 7, 11]],
    ['maj7+5', [0, 4, 8, 11]],
    ['M7+5', [0, 4, 8, 11]],
    ['mmaj7', [0, 3, 7, 11]],
    ['mM7', [0, 3, 7, 11]],
    ['add4', [0, 4, 5, 7]],
    ['majadd4', [0, 4, 5, 7]],
    ['Madd4', [0, 4, 5, 7]],
    ['madd4', [0, 3, 5, 7]],
    ['add9', [0, 4, 7, 14]],
    ['majadd9', [0, 4, 7, 14]],
    ['Madd9', [0, 4, 7, 14]],
    ['madd9', [0, 3, 7, 14]],
    ['sus4add9', [0, 5, 7, 14]],
    ['sus4add2', [0, 2, 5, 7]],
    ['2', [0, 4, 7, 14]],
    ['add11', [0, 4, 7, 17]],
    ['4', [0, 4, 7, 17]],
    ['m69', [0, 3, 7, 9, 14]],
    ['69', [0, 4, 7, 9, 14]],
    ['9', [0, 4, 7, 10, 14]],
    ['m9', [0, 3, 7, 10, 14]],
    ['M9', [0, 4, 7, 11, 14]],
    ['maj9', [0, 4, 7, 11, 14]],
    ['9sus4', [0, 5, 7, 10, 14]],
    ['7-9', [0, 4, 7, 10, 13]],
    ['7b9', [0, 4, 7, 10, 13]],
    ['7(b9)', [0, 4, 7, 10, 13]],   
    ['7+9', [0, 4, 7, 10, 15]],
    ['7♯9', [0, 4, 7, 10, 15]],
    ['9-5', [0, 4, 6, 10, 14]],
    ['9b5', [0, 4, 6, 10, 14]],
    ['9+5', [0, 4, 8, 10, 14]],
    ['9♯5', [0, 4, 8, 10, 14]],
    ['7♯9b5', [0, 4, 6, 10, 15]],
    ['7♯9♯5', [0, 4, 8, 10, 15]],
    ['m7b9b5', [0, 3, 6, 10, 13]],
    ['7b9b5', [0, 4, 6, 10, 13]],
    ['7b9♯5', [0, 4, 8, 10, 13]],
    ['11', [0, 7, 10, 14, 17]],
    ['7+11', [0, 4, 7, 10, 18]],
    ['7♯11', [0, 4, 7, 10, 18]],
    ['maj7+11', [0, 4, 7, 11, 18]],
    ['M7+11', [0, 4, 7, 11, 18]],
    ['maj7♯11', [0, 4, 7, 11, 18]],
    ['M7♯11', [0, 4, 7, 11, 18]],
    ['7b9♯9', [0, 4, 7, 10, 13, 15]],
    ['7b9♯11', [0, 4, 7, 10, 13, 18]],
    ['7♯9♯11', [0, 4, 7, 10, 15, 18]],
    ['7-13', [0, 4, 7, 10, 20]],
    ['7b13', [0, 4, 7, 10, 20]],
    ['m7add11', [0, 3, 7, 10, 17]],
    ['maj7add11', [0, 4, 7, 11, 17]],
    ['M7add11', [0, 4, 7, 11, 17]],
    ['mmaj7add11', [0, 3, 7, 11, 17]],
    ['mM7add11', [0, 3, 7, 11, 17]],
    ['7b9b13', [0, 4, 7, 10, 13, 17, 20]],
    ['9+11', [0, 4, 7, 10, 14, 18]],
    ['9♯11', [0, 4, 7, 10, 14, 18]],
    ['m11', [0, 3, 7, 10, 14, 17]],    
    ['13', [0, 4, 7, 10, 14, 21]],
    ['13-9', [0, 4, 7, 10, 13, 21]],
    ['13b9', [0, 4, 7, 10, 13, 21]],
    ['13+9', [0, 4, 7, 10, 15, 21]],
    ['13♯9', [0, 4, 7, 10, 15, 21]],
    ['13+11', [0, 4, 7, 10, 18, 21]],
    ['13♯11', [0, 4, 7, 10, 18, 21]],
    ['maj13', [0, 4, 7, 11, 14, 21]],
    ['M13', [0, 4, 7, 11, 14, 21]],
    ['maj7add13', [0, 4, 7, 9, 11, 14]],
    ['M7add13', [0, 4, 7, 9, 11, 14]],
];



class QualityManager {
    constructor() {
        this.qualities = DEFAULT_QUALITIES;
    }

    findQualityFromComponents(components) {
        for (const quality of this.qualities) {
            if (quality[1].every((val, index) => val === components[index]) && components.length === quality[1].length) {
                return quality[0]; // Returning the chord name
            }
        }
        return null;
    }
}

function noteToVal(note) {
    if (!(note in NOTE_VAL_DICT)) {
        throw new Error(`Unknown note ${note}`);
    }
    return NOTE_VAL_DICT[note];
}

function getAllRotatedNotes(notes) {
    const notesList = [];
    const len = notes.length;
    for (let i = 0; i < len; i++) {
        notesList.push([...notes.slice(i), ...notes.slice(0, i)]);
    }
    return notesList;
}


function notesToPositions(notes, root) {
    const rootPos = noteToVal(root);
    let currentPos = rootPos;
    let positions = [];

    notes.forEach(note => {
        let notePos = noteToVal(note);
        if (notePos < currentPos) {
            notePos += 12 * Math.ceil((currentPos - notePos) / 12);
        }
        positions.push(notePos - rootPos);
        currentPos = notePos;
    });

    return positions;
}

function findChordsFromNotes(notes) {
    if (notes.length === 0) {
        return []
    }
    const root = notes[0];
    const rootAndPositions = [];
    for (const rotatedNotes of getAllRotatedNotes(notes)) {
        const rotatedRoot = rotatedNotes[0];
        rootAndPositions.push([rotatedRoot, notesToPositions(rotatedNotes, rotatedRoot)]);
    }
    const chords = [];
    const qualityManager = new QualityManager();
    for (const [tempRoot, positions] of rootAndPositions) {
        const quality = qualityManager.findQualityFromComponents(positions);
        if (quality === null) {
            continue;
        }
        let chord;
        if (tempRoot === root) {
            chord = `${root}${quality}`;
        } else {
            chord = `${tempRoot}${quality}/${root}`;
        }
        chords.push(chord);
    }
    return chords;
}

// inversion 0 is the root position.
function getInversion(rootNote,chordType,inversion){

}

export {findChordsFromNotes, midiToPitchClass, midiToNoteWithOctave,midiToNoteABC }