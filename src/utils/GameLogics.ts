import { Frequency, isNumber, now } from 'tone';
import { degrees } from '@EarTrainers/DegreeTrainer/Constants';
import { Note, Range } from 'tonal';
import { preloadAudio } from '@utils/Tone/samplers';
import { Dispatch, SetStateAction } from 'react';
const getNextNote = (
  possibleNotesInRange: string[],
  currentNote: string | null
): string | null => {
  if (possibleNotesInRange.length === 0) return null;
  let nextNote: string | null = null;
  do {
    nextNote =
      possibleNotesInRange[
        Math.floor(Math.random() * possibleNotesInRange.length)
      ] ?? null;
  } while (nextNote === currentNote && possibleNotesInRange.length < 3);
  return nextNote;
};

const calculateDegree = (
  guessedNote: string | number,
  targetNote: string
): string => {
  let guessedNoteMidi: number;
  if (!isNumber(guessedNote)) {
    guessedNoteMidi = Frequency(guessedNote).toMidi();
  } else {
    guessedNoteMidi = guessedNote;
  }
  const interval =
    (((guessedNoteMidi - Frequency(targetNote).toMidi()) % 12) + 12) % 12;
  return (
    degrees.find(degree => degree.distance === interval)?.name || 'Unknown'
  );
};

const calculateInterval = (
  guessedNote: string | number,
  targetNote: string
): number => {
  let guessedNoteMidi: number;
  if (!isNumber(guessedNote)) {
    guessedNoteMidi = Frequency(guessedNote).toMidi();
  } else {
    guessedNoteMidi = guessedNote;
  }
  const interval =
    (((guessedNoteMidi - Frequency(targetNote).toMidi()) % 12) + 12) % 12;
  return interval;
};

const isCorrect = (guessedNote: string, currentNote: string): boolean => {
  const guessedNoteMidi = Frequency(guessedNote).toMidi();
  const currentNoteMidi = Frequency(currentNote).toMidi();
  return guessedNoteMidi % 12 === currentNoteMidi % 12;
};

const getPossibleNotesInRange = (
  rootNote: string,
  range: [number, number],
  degreesSetting: { enable: boolean; interval: string }[]
): string[] => {
  if (!rootNote || !range || !degreesSetting) return [];
  const enabledIntervals = degreesSetting
    .filter(d => d.enable)
    .map(d => d.interval);
  const scaleNotes = enabledIntervals
    .map(interval => Note.transpose(rootNote, interval))
    .filter((note): note is string => Boolean(note));
  const scaleNoteSet = new Set<string>();
  scaleNotes.forEach(note => {
    scaleNoteSet.add(Note.pitchClass(note));
    scaleNoteSet.add(Note.enharmonic(Note.pitchClass(note)));
  });
  const allNotesInRange = Range.chromatic([
    Note.fromMidi(range[0]),
    Note.fromMidi(range[1]),
  ]);
  const possibleNotesInRange = allNotesInRange.filter(note => {
    const pitchClass = Note.pitchClass(note);
    return (
      scaleNoteSet.has(pitchClass) ||
      scaleNoteSet.has(Note.enharmonic(pitchClass))
    );
  });
  return possibleNotesInRange;
};

const handleNoteGuess = (
  activeNote: string,
  currentNote: string,
  rootNote: string,
  disabledNotes: string[],
  setDisabledNotes: (fn: (prev: string[]) => string[]) => void,
  isAdvance: 'Ready' | 'Next' | 'No' | 'Now',
  setIsAdvance: (v: 'Ready' | 'Next' | 'No' | 'Now') => void,
  updatePracticeRecords: (degreeName: string, correct: boolean) => void,
  playNote: (note: string, dur?: number, velocity?: number) => void,
  setActiveNote: (v: string | null) => void,
  autoAdvance: boolean
) => {
  if (isAdvance == 'Ready' || isAdvance == 'Next') {
    playNote(activeNote);
    setActiveNote(null);
    return;
  }

  const correct = isCorrect(activeNote, currentNote);
  const guessedDegree = calculateDegree(activeNote, rootNote);
  if (correct) {
    setDisabledNotes([] as any);
    updatePracticeRecords(guessedDegree, correct);
    playNote(currentNote);
    if (autoAdvance) {
      setIsAdvance('Next');
    } else {
      setIsAdvance('Ready');
    }
  } else {
    if (!disabledNotes.includes(activeNote)) {
      setDisabledNotes(prev => [...prev, activeNote]);
      updatePracticeRecords(guessedDegree, correct);
    }
    playNote(activeNote);
  }
  setActiveNote(null);
};

const advanceGame = (
  possibleNotesInRange: string[],
  currentNote: string | null,
  setCurrentNote: Dispatch<SetStateAction<string>>,
  playNote: (note: string, dur?: number, velocity?: number) => void,
  setDisabledNotes: (v: string[]) => void,
  setIsAdvance: (v: 'Ready' | 'Next' | 'No' | 'Now') => void,
  jCutMode = false,
  bpm: number
) => {
  const nextNote = getNextNote(possibleNotesInRange, currentNote);
  if (!nextNote) return;
  setCurrentNote(nextNote);
  if (nextNote) {
    if (jCutMode) {
      playNote(nextNote, 60 / bpm, 3);
    } else {
      playNote(nextNote, 0.05, 3);
    }
  }
  setDisabledNotes([]);
  setIsAdvance('No');
};

function handleGameLogic({
  isAdvance,
  isHandfree,
  gameState,
  bpm,
  currentNote,
  rootNote,
  possibleNotesInRange,
  setCurrentNote,
  playNote,
  setDisabledNotes,
  setIsAdvance,
}: {
  isAdvance: 'Ready' | 'Next' | 'No' | 'Now';
  isHandfree: boolean;
  gameState: 'playing' | 'paused' | 'stopped';
  bpm: number;
  currentNote: string | null;
  rootNote: string;
  possibleNotesInRange: string[];
  setCurrentNote: Dispatch<SetStateAction<string>>;
  playNote: (n: string, dur?: number, velocity?: number) => void;
  setDisabledNotes: (v: string[]) => void;
  setIsAdvance: (v: 'Ready' | 'Next' | 'No' | 'Now') => void;
}) {
  const timerDuration = (60 / bpm) * 2000;

  const handfreeGame = () => {
    const player = preloadAudio('/answers/Solfege.mp3');

    if (player && player.loaded) {
      const offset = calculateOffset(currentNote!, rootNote);
      player.start(now(), offset, 1.0);
    }
    setIsAdvance('Next');
  };

  if (isAdvance == 'Next') {
    const timer = setTimeout(
      () =>
        advanceGame(
          possibleNotesInRange,
          currentNote,
          setCurrentNote,
          playNote,
          setDisabledNotes,
          setIsAdvance,
          false,
          bpm
        ),
      timerDuration
    );
    return () => clearTimeout(timer);
  }
  if (isAdvance == 'Now') {
    advanceGame(
      possibleNotesInRange,
      currentNote,
      setCurrentNote,
      playNote,
      setDisabledNotes,
      setIsAdvance,
      false,
      bpm
    );
  } else if (isHandfree && gameState === 'playing') {
    const timer = setTimeout(handfreeGame, timerDuration);
    return () => clearTimeout(timer);
  }
}

const calculateShift = (note: string): number => {
  const C3Midi = Note.midi('C2')!;
  const noteMidi = Note.midi(note)!;
  return noteMidi - C3Midi;
};

const calculateOffset = (currentNote: string, rootNote: string): number => {
  const degree = calculateInterval(currentNote, rootNote);
  const pitchShift = calculateShift(currentNote);
  const soundLengthOfEachDegree = 49;

  const soundOffset = soundLengthOfEachDegree * degree + 12 + pitchShift;
  return soundOffset;
};

export {
  getNextNote,
  isCorrect,
  calculateDegree,
  getPossibleNotesInRange,
  handleNoteGuess,
  handleGameLogic,
  advanceGame,
};
