import { useState, useEffect,useMemo } from 'react';
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
    setCurrentPracticeRecords
  } = settings;

  const [currentNote, setCurrentNote] = useState("");
  const [disabledNotes, setDisabledNotes] = useState([]);

  const [gameState, setGameState] = useState('end');

  const [activeNote, setActiveNote] = useState(null);
  const [isAdvance, setIsAdvance] = useState(false);

  const drone = getDroneInstance();
  const getPossibleNotesInRange = (rootNote, range, degrees) => {
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
  // update currentNotes based on settings
  const currentNotes = useMemo(() => {
    if (mode === 'free') {
      // Return customNotes directly in free mode
      return customNotes;
    } else if (mode !== 'free' && currentLevel.degrees) {
      // Map currentNotes based on currentLevel.degrees
      return degrees.map((note, index) => ({
        ...note,
        enable: currentLevel.degrees[index],
      }));
    }
    return []; // Default fallback if no mode matches
  }, [mode, customNotes, currentLevel]);

  const filteredNotes = useMemo(() => {
    if(!currentNotes) {
      return [];
      console.log("currentNotes is null")
    }

    return currentNotes.filter(note => note.enable);
  }, [currentNotes]);
  const possibleNotesInRange = useMemo(() => {
    console.log('updating possible notes in range');
    const newList = getPossibleNotesInRange(rootNote, range, currentNotes);
    return newList;
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
    else if (gameState == 'end') {
      setDisabledNotes([]);
      setCurrentPracticeRecords({ total: 0, correct: 0 })
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
    filteredNotes,
    disabledNotes,
    gameState,
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
