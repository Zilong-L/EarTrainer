import { useState,useRef, useEffect, useMemo } from 'react';
import * as Tone from 'tone';
import { degrees } from '@components/EarTrainers/DegreeTrainer/Constants';
import { getDroneInstance, playNotes } from '@utils/ToneInstance';
import { generateRandomNoteBasedOnRoot, isCorrect, calculateDegree, getPossibleNotesInRange, handleNoteGuess, handleGameLogic } from '@utils/GameLogics';
import { useDegreeTrainerSettings } from '@EarTrainers/DegreeTrainer/Settings/useDegreeTrainerSettings';
const useFreeTrainer = () => {
  const {
    isHandfree,
    practice: {
      bpm,
      rootNote,
      range,
      autoAdvance,
      useSolfege
    },
    stats:{updatePracticeRecords}
  } = useDegreeTrainerSettings();

  const [currentNote, setCurrentNote] = useState("");
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [disabledNotes, setDisabledNotes] = useState([]);
  const [gameState, setGameState] = useState('end');
  const [activeNote, setActiveNote] = useState(null);
  const [isAdvance, setIsAdvance] = useState('No');
  const [customNotes, _setCustomNotes] = useState(degrees);

  const playNoteTimeoutRef = useRef(null);
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
    if(!localStorage.getItem('degreeTrainerCustomNotes')) {
      return;
    }
    const customNotes = JSON.parse(localStorage.getItem('degreeTrainerCustomNotes'));
    setCustomNotes(customNotes);
  }, []);


  const drone = getDroneInstance();



  const currentNotes = useMemo(() => customNotes, [customNotes]);

  const filteredNotes = useMemo(() => {
    if(!currentNotes) return [];
    return currentNotes.filter(note => note.enable);
  }, [currentNotes]);

  const possibleNotesInRange = useMemo(() => {
    return getPossibleNotesInRange(rootNote, range, currentNotes);
  }, [rootNote, range, currentNotes]);

  // handle guesses
  useEffect(() => {
    if (!activeNote) return;
    handleNoteGuess(activeNote, currentNote, rootNote, disabledNotes, setDisabledNotes, isAdvance, setIsAdvance, updatePracticeRecords, playNote, setActiveNote,autoAdvance);
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
      autoAdvance,
      useSolfege
    });
  }, [isAdvance, gameState, isHandfree]);



  useEffect(() => {
    if (gameState === 'playing') {
      const newNote = generateRandomNoteBasedOnRoot(possibleNotesInRange, currentNote);
      setCurrentNote(newNote);
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
    // 取消之前的 timeout（如果存在）
    if (playNoteTimeoutRef.current) {
      clearTimeout(playNoteTimeoutRef.current);
    }
    playNotes(note, delay, bpm / time);
    setIsPlayingSound(true);

    playNoteTimeoutRef.current = setTimeout(() => {
      setIsPlayingSound(false);
      console.log('set false');
      playNoteTimeoutRef.current = null; // 清除引用
    }, (60 / (bpm / time)) * 1000);
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
    isHandfree,
    setIsAdvance,
    bpm,
    setActiveNote,
    startGame,
    playNote,
    endGame,
    setGameState,
    useSolfege,
    isPlayingSound
  };
};

export default useFreeTrainer;
