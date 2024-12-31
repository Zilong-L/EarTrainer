import { useState, useEffect, useMemo } from 'react';
import * as Tone from 'tone';
import { degrees } from '@components/EarTrainers/DegreeTrainer/Constants';
import { getDroneInstance, playNotes, preloadAudio } from '@utils/ToneInstance';
import { generateRandomNoteBasedOnRoot, isCorrect, calculateDegree, getPossibleNotesInRange } from '@utils/GameLogics';

const useFreeTrainer = (settings) => {
  const {
    isHandfree,
    practice: {
      bpm,
      rootNote,
      range,
      repeatWhenAdvance
    }
  } = settings;

  const [currentNote, setCurrentNote] = useState("");
  const [disabledNotes, setDisabledNotes] = useState([]);
  const [gameState, setGameState] = useState('end');
  const [activeNote, setActiveNote] = useState(null);
  const [isAdvance, setIsAdvance] = useState(false);
  const [customNotes, setCustomNotes] = useState(degrees);

  useEffect(() => {
    if (!activeNote) {
      return;
    }
    handleNoteGuess(activeNote);
  }, [activeNote]);
  const handleDegreeToggle = (index) => {
    const newCustomNotes = [...customNotes];
    newCustomNotes[index].enable = !newCustomNotes[index].enable;
    setCustomNotes(newCustomNotes);
  };
  useEffect(() => {
    localStorage.setItem('degreeTrainerCustomNotes', JSON.stringify(customNotes));
  }, [customNotes]);
  useEffect(() => {
    const customNotes = JSON.parse(localStorage.getItem('degreeTrainerCustomNotes'));
    setCurrentNote(customNotes);
  }, []);


  const drone = getDroneInstance();



  const currentNotes = useMemo(() => customNotes, [customNotes]);

  const filteredNotes = useMemo(() => {
    return currentNotes.filter(note => note.enable);
  }, [currentNotes]);

  const possibleNotesInRange = useMemo(() => {
    return getPossibleNotesInRange(rootNote, range, currentNotes);
  }, [rootNote, range, currentNotes]);

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
          const nextNote = generateRandomNoteBasedOnRoot(possibleNotesInRange, currentNote);
          setCurrentNote(nextNote);
          playNote(nextNote);
          setIsAdvance(false);
        }, (60 / bpm) * 2000);
        return () => clearTimeout(timer);
      }
      else {
        const timer = setTimeout(() => {
          const nextNote = generateRandomNoteBasedOnRoot(possibleNotesInRange, currentNote);
          setCurrentNote(nextNote);
          playNote(nextNote);
          setIsAdvance(false);
        }, (60 / bpm) * 1000);
        return () => clearTimeout(timer);
      }
    } else if (isHandfree && gameState == 'playing') {

      const degree = calculateDegree(Tone.Frequency(currentNote).toMidi(), rootNote);
      console.log(degree)
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
    const newNote = generateRandomNoteBasedOnRoot(possibleNotesInRange, currentNote);
    setCurrentNote(newNote);

    if (gameState === 'playing') {
      playNote();
    }
  }, [possibleNotesInRange]);

  useEffect(() => {
    if (gameState === 'playing') {
      playNote();
    }
    else if (gameState === 'end') {
      setDisabledNotes([]);
    }
  }, [gameState]);

  const startGame = () => {
    setGameState('start');
  };

  const playNote = (note = null, delay = 0.05) => {
    if (!note) {
      note = currentNote;
    }
    playNotes(note, delay, bpm);
  };


  const handleNoteGuess = (guessedNote) => {
    const correct = isCorrect(guessedNote, currentNote);
    const guessedDegree = calculateDegree(guessedNote, rootNote);
    
    if (correct) {
      setDisabledNotes([]);
      settings.stats.updatePracticeRecords(guessedDegree, correct);
      if (repeatWhenAdvance) {
        playNote(currentNote);
      }
      setIsAdvance(true);
    } else {
      if (!disabledNotes.includes(guessedNote)) {
        setDisabledNotes((prev) => [...prev, guessedNote]);
        settings.stats.updatePracticeRecords(guessedDegree, correct);
      }
      playNote(guessedNote);
    }
    setActiveNote(null);
  };

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
    useEffect(() => {
      console.log('running')
      return () => {
        endGame();
      }
    }
      , []);
  const endGame = () => {
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    Tone.getTransport().cancel();
    setGameState('end');
    setDisabledNotes([]);
    drone.stop();
  };

  return {
    rootNote,
    currentNote,
    filteredNotes,
    disabledNotes,
    gameState,
    activeNote,
    handleDegreeToggle,
    customNotes,
    isAdvance,
    setActiveNote,
    startGame,
    playNote,
    endGame,
    setGameState
  };
};

export default useFreeTrainer;
