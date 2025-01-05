import { useState, useEffect, useMemo } from 'react';
import * as Tone from 'tone';
import { degrees } from '@components/EarTrainers/DegreeTrainer/Constants';
import { getDroneInstance, playNotes } from '@utils/ToneInstance';
import { generateRandomNoteBasedOnRoot, isCorrect, calculateDegree, getPossibleNotesInRange, handleNoteGuess, handleGameLogic } from '@utils/GameLogics';

const useFreeTrainer = (settings) => {
  const {
    isHandfree,
    practice: {
      bpm,
      rootNote,
      range,
      autoAdvance
    }
  } = settings;

  const [currentNote, setCurrentNote] = useState("");
  const [disabledNotes, setDisabledNotes] = useState([]);
  const [gameState, setGameState] = useState('end');
  const [activeNote, setActiveNote] = useState(null);
  const [isAdvance, setIsAdvance] = useState('No');
  const [customNotes, _setCustomNotes] = useState(degrees);

  const setCustomNotes = (notes) => {
    _setCustomNotes(notes);
    localStorage.setItem('degreeTrainerCustomNotes', JSON.stringify(notes));
  };
  const handleDegreeToggle = (index) => {
    const newCustomNotes = [...customNotes];
    newCustomNotes[index].enable = !newCustomNotes[index].enable;
    setCustomNotes(newCustomNotes);
  };

  useEffect(() => {
    const customNotes = JSON.parse(localStorage.getItem('degreeTrainerCustomNotes'));
    setCustomNotes(customNotes);
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
    if (!activeNote) return;
    handleNoteGuess(activeNote, currentNote, rootNote, disabledNotes, setDisabledNotes, isAdvance, setIsAdvance, settings.stats.updatePracticeRecords, playNote, setActiveNote,autoAdvance);
  }, [activeNote]);

  useEffect(() => {
    handleGameLogic({
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
      isAdvance,
      setIsAdvance,
      autoAdvance
    });
  }, [isAdvance, gameState, isHandfree]);



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

  const playNote = (note = null, delay = 0.05,time = 1) => {
    if (!note) {
      note = currentNote;
    }
      playNotes(note, delay, bpm/time);

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
    setIsAdvance,
    bpm,
    setActiveNote,
    startGame,
    playNote,
    endGame,
    setGameState
  };
};

export default useFreeTrainer;
