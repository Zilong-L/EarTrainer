import * as Tone from 'tone';
import { degrees } from '@components/EarTrainers/DegreeTrainer/Constants';
import { Note, Range } from 'tonal';
const generateRandomNoteBasedOnRoot = (possibleNotesInRange, currentNote) => {
    if (possibleNotesInRange.length === 0) return null;
    let nextNote = null;
    do {
        nextNote = possibleNotesInRange[Math.floor(Math.random() * possibleNotesInRange.length)];
    } while (nextNote === currentNote && possibleNotesInRange.length !== 1);
    return nextNote;
};
const calculateDegree = (guessedNote, targetNote) => {
    let guessedNoteMidi;
    if (!Tone.isNumber(guessedNote)
    ) {
        guessedNoteMidi = Tone.Frequency(guessedNote).toMidi();
    }
    else {
        guessedNoteMidi = guessedNote;
    }
    const interval = ((guessedNoteMidi - Tone.Frequency(targetNote).toMidi()) % 12 + 12) % 12;
    return degrees.find(degree => degree.distance === interval)?.name || "Unknown";
};


const isCorrect = (guessedNote, currentNote) => {
    const guessedNoteMidi = Tone.Frequency(guessedNote).toMidi();
    const currentNoteMidi = Tone.Frequency(currentNote).toMidi();
    return guessedNoteMidi % 12 === currentNoteMidi % 12;
};
const getPossibleNotesInRange = (rootNote, range, degrees) => {
    console.log('heavy calculation');
    // Get enabled intervals
    console.log('calculating possible notes in range');
    const enabledIntervals = degrees
        .filter(degree => degree.enable)
        .map(degree => degree.interval);

    // Generate the scale notes by transposing the rootNote by each enabled interval
    const scaleNotes = enabledIntervals
        .map(interval => Note.transpose(rootNote, interval))
        .filter(note => note);

    // Create a set of pitch classes (both original and enharmonic) for matching
    const scaleNoteSet = new Set();
    scaleNotes.forEach(note => {
        scaleNoteSet.add(Note.pitchClass(note));
        scaleNoteSet.add(Note.enharmonic(Note.pitchClass(note)));
    });

    // Generate all possible notes within the MIDI range
    const allNotesInRange = Range.chromatic([Note.fromMidi(range[0]), Note.fromMidi(range[1])]);

    // Filter notes based on both original and enharmonic pitch classes
    const possibleNotesInRange = allNotesInRange.filter(note => {
        const pitchClass = Note.pitchClass(note);
        return scaleNoteSet.has(pitchClass) || scaleNoteSet.has(Note.enharmonic(pitchClass));
    });

    return possibleNotesInRange;
};


export { generateRandomNoteBasedOnRoot, isCorrect, calculateDegree, getPossibleNotesInRange };
