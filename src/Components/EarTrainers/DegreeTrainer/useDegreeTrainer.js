import { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { degrees } from '@components/EarTrainers/DegreeTrainer/Constants';
import { getDroneInstance, playNotes } from '@utils/ToneInstance';
const audioCache = {};

import { Note, Range } from 'tonal';


const preloadAudio = (degree) => {
  if (!audioCache[degree]) {
    audioCache[degree] = new Tone.Player(`/answers/${degree}.wav`).toDestination();
  }
  return audioCache[degree];
};

const useDegreeTrainer = (settings) => {
  const {
    isHandfree,
    bpm,
    rootNote,
    range,
    repeatWhenAdvance,
    updatePracticeRecords,
    mode,
    customNotes,
    currentLevel,
  } = settings;

  const [currentNote, setCurrentNote] = useState("");
  const [disabledNotes, setDisabledNotes] = useState([]);

  const [gameState, setGameState] = useState('end');
  const [currentNotes, setCurrentNotes] = useState(degrees);
  const [filteredNotes, setFilteredNotes] = useState(degrees);

  const [possibleNotesInRange, setPossibleNotesInRange] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [isAdvance, setIsAdvance] = useState(false);

  const drone = getDroneInstance();

  // update currentNotes based on settings
  useEffect(() => {
    if (mode == 'free') {
      if (currentNotes.length != customNotes.length || !currentNotes.every((note, index) => note.enable === customNotes[index].enable)) {
        setCurrentNotes(customNotes);
      }
    }
    else if (mode != 'free' && currentLevel.degrees) {
      const needsUpdate = currentNotes.some((note, index) => note.enable !== currentLevel.degrees[index]);
      
      if (needsUpdate) {
        const newNotes = currentNotes.map((note, index) => ({
          ...note,
          enable: currentLevel.degrees[index],
        }));
        setCurrentNotes(newNotes);
      }
    }
  }, [currentLevel, mode, currentNotes]);

  // update filteredNotes based on currentNotes
  useEffect(() => {
    // Filter the enabled notes and update the filtered notes state
    const newNotes = currentNotes.filter((obj) => obj.enable);
    setFilteredNotes(newNotes);
  }, [currentNotes]);

  // update if possibleNotesInRange changes
  useEffect(() => {
    const newList = getPossibleNotesInRange(rootNote, range, currentNotes)
    if (newList.length != possibleNotesInRange.length || !newList.every((note, index) => note === possibleNotesInRange[index])) {
      setPossibleNotesInRange(newList)
      
    }
  }, [rootNote, range, currentNotes]);

  // when possibleNotesInRange changes, generate a new note and play it
  useEffect(() => {
    const newNote = generateRandomNoteBasedOnRoot();
    setCurrentNote(newNote);
    
    if (gameState == 'playing') {
      playNote();
    }
  }, [possibleNotesInRange]);

  // when game resumes from pause, play the current note
  useEffect(() => {
    if (gameState == 'playing') {
      playNote();
    }
  }, [gameState])

  // handle guesses
  useEffect(() => {
    if (activeNote && !isAdvance) {
      handleNoteGuess(activeNote);
    }
  }, [activeNote, isAdvance]);


  useEffect(() => {
    if (isAdvance) {
      if (repeatWhenAdvance) {
        const timer = setTimeout(() => {
          const nextNote = generateRandomNoteBasedOnRoot();
          setCurrentNote(nextNote);
          playNote(nextNote);
          setIsAdvance(false);
        }, (60 / bpm) * 2000);
        return () => clearTimeout(timer);
      }
      else {
        const timer = setTimeout(() => {
          const nextNote = generateRandomNoteBasedOnRoot();
          setCurrentNote(nextNote);
          playNote(nextNote);
          setIsAdvance(false);
        }, (60 / bpm) * 1000);
        return () => clearTimeout(timer);
      }
    } else if (isHandfree && gameState == 'playing') {
      const degree = calculateDegree(Tone.Frequency(currentNote).toMidi());
      const player = preloadAudio(degree);
      if (repeatWhenAdvance) {
        const timer = setTimeout(() => {
          if (player.loaded) {
            player.start();
          }
          setTimeout(() => {
            setIsAdvance(true); // Set to advance
            playNote(currentNote); // Play the note
          }, 1000); // Adjust delay as needed
        }, (60 / bpm) * 2000);
        return () => clearTimeout(timer);
      }
      else {
        const timer = setTimeout(() => {
          if (player.loaded) {
            player.start();
          }
          setIsAdvance(true); // Set to advance
        }, (60 / bpm) * 2000);
        return () => clearTimeout(timer);
      }
    }
  }
, [isAdvance, gameState, isHandfree]);

  useEffect(() => {
    if (gameState == 'start') {
      Tone.getTransport().stop();
      Tone.getTransport().position = 0;
      Tone.getTransport().cancel();
      setDisabledNotes([]);
      drone.start();
      Tone.getTransport().start();
      setGameState('playing')
      
    }
  }
    , [gameState, currentNote]);

  const startGame = () => {
    setGameState('start');
  };

  const playNote = (note = null, delay = 0.05) => {
    if (!note) {
      note = currentNote;
    }
    playNotes(note, delay, bpm)
  };

  const getPossibleNotesInRange = (rootNote, range, degrees) => {
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

  const generateRandomNoteBasedOnRoot = () => {
    if (possibleNotesInRange.length === 0) return null;
    let nextNote = null;
    do {
      nextNote = possibleNotesInRange[Math.floor(Math.random() * possibleNotesInRange.length)];
    } while (nextNote === currentNote && possibleNotesInRange.length !== 1);
    return nextNote
  };

  const handleNoteGuess = (guessedNote) => {
    const guessedNoteMidi = Tone.Frequency(guessedNote).toMidi();
    const currentNoteMidi = Tone.Frequency(currentNote).toMidi();
    const isCorrect = guessedNoteMidi % 12 === currentNoteMidi % 12;
    const guessedDegree = calculateDegree(guessedNoteMidi, currentNoteMidi);
    
    if (isCorrect) {
      setDisabledNotes([]);
      updatePracticeRecords(guessedDegree, isCorrect);
      if (repeatWhenAdvance) {
        playNote(currentNote);
      }
      setIsAdvance(true);
    } else {
      if (!disabledNotes.includes(guessedNote)) {
        setDisabledNotes((prev) => [...prev, guessedNote]);
        updatePracticeRecords(guessedDegree, isCorrect);
      }
      playNote(guessedNote);
    }
    setActiveNote(null);
  };



  const calculateDegree = (guessedNoteMidi) => {
    const interval = ((guessedNoteMidi - Tone.Frequency(rootNote).toMidi()) % 12 + 12) % 12;
    return degrees.find(degree => degree.distance === interval)?.name || "Unknown";
  };
  const isCorrect = (guessedNote) => {
    const guessedNoteMidi = Tone.Frequency(guessedNote).toMidi();
    const currentNoteMidi = Tone.Frequency(currentNote).toMidi();
    return guessedNoteMidi % 12 === currentNoteMidi % 12;

  }

  const endGame = () => {
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    Tone.getTransport().cancel();
    setGameState('end');
    setDisabledNotes([]);
    drone.stop();
  };

  return {
    currentNote,
    disabledNotes,
    gameState,
    filteredNotes,
    activeNote,
    isAdvance,
    isCorrect,
    setActiveNote,
    startGame,
    playNote,
    endGame,
    setGameState
  };
};

export default useDegreeTrainer;
