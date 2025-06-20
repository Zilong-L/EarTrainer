import * as Tone from 'tone';
import { degrees } from '@EarTrainers/DegreeTrainer/Constants';
import { Note, Range } from 'tonal';
import { preloadAudio } from '@utils/Tone/samplers';

const getNextNote = (possibleNotesInRange, currentNote) => {
  if (possibleNotesInRange.length === 0) return null;
  let nextNote = null;
  do {
    nextNote = possibleNotesInRange[Math.floor(Math.random() * possibleNotesInRange.length)];
  } while (nextNote === currentNote && possibleNotesInRange.length < 3);
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
const calculateInterval = (guessedNote, targetNote) => {
  let guessedNoteMidi;
  if (!Tone.isNumber(guessedNote)
  ) {
    guessedNoteMidi = Tone.Frequency(guessedNote).toMidi();
  }
  else {
    guessedNoteMidi = guessedNote;
  }
  const interval = ((guessedNoteMidi - Tone.Frequency(targetNote).toMidi()) % 12 + 12) % 12;
  return interval;
};


const isCorrect = (guessedNote, currentNote) => {
  const guessedNoteMidi = Tone.Frequency(guessedNote).toMidi();
  const currentNoteMidi = Tone.Frequency(currentNote).toMidi();
  return guessedNoteMidi % 12 === currentNoteMidi % 12;
};
const getPossibleNotesInRange = (rootNote, range, degrees) => {
  if (!rootNote || !range || !degrees) return [];
  // Get enabled intervals
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

const handleNoteGuess = (activeNote, currentNote, rootNote, disabledNotes, setDisabledNotes, isAdvance, setIsAdvance, updatePracticeRecords, playNote, setActiveNote, autoAdvance) => {
  if (isAdvance == 'Ready' || isAdvance == 'Next') {
    // only play notes because user has made a correct guess
    playNote(activeNote);
    setActiveNote(null);
    return;
  }

  const correct = isCorrect(activeNote, currentNote);
  const guessedDegree = calculateDegree(activeNote, rootNote);
  if (correct) {
    setDisabledNotes([]);
    updatePracticeRecords(guessedDegree, correct);
    playNote(currentNote);
    if (autoAdvance) {
      setIsAdvance('Next');
    } else {
      setIsAdvance('Ready');
    }
  } else {
    if (!disabledNotes.includes(activeNote)) {
      setDisabledNotes((prev) => [...prev, activeNote]);
      updatePracticeRecords(guessedDegree, correct);
    }
    playNote(activeNote);
  }
  setActiveNote(null);
};

const advanceGame = (possibleNotesInRange, currentNote, setCurrentNote, playNote, setDisabledNotes, setIsAdvance, jCutMode = false, bpm) => {
  const nextNote = getNextNote(possibleNotesInRange, currentNote);
  setCurrentNote(nextNote);
  if (jCutMode) {
    playNote(nextNote, 60 / bpm, 3);
  } else {
    playNote(nextNote, 0.05, 3);
  }
  setDisabledNotes([]);
  setIsAdvance('No');
};

function handleGameLogic({ isAdvance, isHandfree, gameState, bpm, currentNote, rootNote, possibleNotesInRange, setCurrentNote, playNote, setDisabledNotes, setIsAdvance, useSolfege }) {
  const timerDuration = (60 / bpm) * 2000;


  const handfreeGame = () => {
    const player = preloadAudio('/answers/Solfege.mp3');

    if (player.loaded) {
      const offset = calculateOffset(currentNote, rootNote);
      player.start(Tone.now(), offset, 1.0);

      // if(useSolfege){
      // shiftPicthAndPlay(player, calculateShift(currentNote));
      // }
      // else{
      //   player.start(Tone.now()+0.5);
      //   player.stop(Tone.now()+1.0)
      // }
    }
    setIsAdvance('Next'); // Set to advance
  };

  if (isAdvance == 'Next') {
    const timer = setTimeout(() => advanceGame(possibleNotesInRange, currentNote, setCurrentNote, playNote, setDisabledNotes, setIsAdvance, false, bpm), timerDuration);
    return () => clearTimeout(timer);
  }
  if (isAdvance == 'Now') {
    advanceGame(possibleNotesInRange, currentNote, setCurrentNote, playNote, setDisabledNotes, setIsAdvance, false, bpm)
  }
  else if (isHandfree && gameState === 'playing') {
    const timer = setTimeout(handfreeGame, timerDuration);
    return () => clearTimeout(timer);
  }
}

const calculateShift = (note) => {
  const C3Midi = Note.midi('C2');
  const noteMidi = Note.midi(note);
  return noteMidi - C3Midi;
}
const calculateOffset = (currentNote, rootNote) => {
  const degree = calculateInterval(currentNote, rootNote);
  const degreeName = calculateDegree(currentNote, rootNote);
  const pitchShift = calculateShift(currentNote);
  const soundLengthOfEachDegree = 49;

  const soundOffset = soundLengthOfEachDegree * degree + 12 + pitchShift;
  return soundOffset;
}
export { getNextNote, isCorrect, calculateDegree, getPossibleNotesInRange, handleNoteGuess, handleGameLogic, advanceGame };
