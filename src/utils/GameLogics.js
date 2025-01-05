import * as Tone from 'tone';
import { degrees } from '@components/EarTrainers/DegreeTrainer/Constants';
import { Note, Range } from 'tonal';
import { preloadAudio } from '@utils/ToneInstance';

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

const handleNoteGuess = (guessedNote,currentNote,rootNote,disabledNotes,setDisabledNotes,isAdvance,setIsAdvance,updatePracticeRecords,playNote,setActiveNote) => {
    if(isAdvance){
        // only play notes because user has made a correct guess
        playNote(activeNote);
        setActiveNote(null);
        return;
    }
    const correct = isCorrect(guessedNote, currentNote);
    const guessedDegree = calculateDegree(guessedNote, rootNote);
    if (correct) {
      setDisabledNotes([]);
      updatePracticeRecords(guessedDegree, correct);
      playNote(currentNote);
      setIsAdvance(true);
    } else {
      if (!disabledNotes.includes(guessedNote)) {
        setDisabledNotes((prev) => [...prev, guessedNote]);
        updatePracticeRecords(guessedDegree, correct);
      }
      playNote(guessedNote);
    }
    setActiveNote(null);
  };

  function handleGameLogic({ isAdvance, isHandfree, gameState, bpm, currentNote, rootNote, possibleNotesInRange, setCurrentNote, playNote, setDisabledNotes, setIsAdvance, autoAdvance }) {
    const timerDuration = (60 / bpm) * 2000;
  
    const advanceGame = () => {
      const nextNote = generateRandomNoteBasedOnRoot(possibleNotesInRange, currentNote);
      setCurrentNote(nextNote);
      playNote(nextNote);
      setDisabledNotes([]);
      setIsAdvance(false);
    };
  
    const handfreeGame = () => {
      const degree = calculateDegree(Tone.Frequency(currentNote).toMidi(), rootNote);
      const player = preloadAudio(degree);
      if (player.loaded) {
        player.start();
      }
      setIsAdvance(true); // Set to advance
    };
  
    if (isAdvance && autoAdvance) {
      const timer = setTimeout(advanceGame, timerDuration);
      return () => clearTimeout(timer);
    } else if (isHandfree && gameState === 'playing') {
      const timer = setTimeout(handfreeGame, timerDuration);
      return () => clearTimeout(timer);
    }
  }
  
export { generateRandomNoteBasedOnRoot, isCorrect, calculateDegree, getPossibleNotesInRange,handleNoteGuess,handleGameLogic };
