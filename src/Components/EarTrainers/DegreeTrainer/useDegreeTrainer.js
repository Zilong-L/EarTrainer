import { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { degrees } from '@components/EarTrainers/DegreeTrainer/Constants';
import {  getDroneInstance,playNotes } from '@utils/ToneInstance';

const audioCache = {};

const preloadAudio = (degree) => {
  if (!audioCache[degree]) {
    console.log(`First load degree: ${degree}`);
    audioCache[degree] = new Tone.Player(`/answers/${degree}.wav`).toDestination();
  } else {
    console.log(`Using cached audio for degree: ${degree}`);
  }
  return audioCache[degree];
};

const useDegreeTrainer = (settings) => {
  const {
    isHandfree,
    bpm,
    rootNote,
    range,
    currentNotes,
    updatePracticeRecords,
  } = settings;

  const [currentNote, setCurrentNote] = useState("");
  const [disabledNotes, setDisabledNotes] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [filteredNotes, setFilteredNotes] = useState(degrees);
  const [possibleMidiList, setPossibleMidiList] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [isAdvance, setIsAdvance] = useState(false);

  const drone = getDroneInstance();


  useEffect(() => {
    const newNotes = currentNotes.filter((obj) => obj.enable);
    setFilteredNotes(newNotes);
  }, [currentNotes]);

  useEffect(() => {
    const newNote = generateRandomNoteBasedOnRoot();
    setCurrentNote(newNote);
  }, [possibleMidiList]);

  useEffect(() => {
    const expandedIntervals = [];
    filteredNotes.forEach((note) => {
      for (let octaveShift = -4; octaveShift <= 4; octaveShift++) {
        const midiValue = rootNote + note.distance + octaveShift * 12;
        expandedIntervals.push(midiValue);
      }
    });
    const newIntervalList = expandedIntervals.filter(
      (midi) => midi >= range[0] && midi <= range[1]
    );
    setPossibleMidiList(newIntervalList);
  }, [rootNote, range, filteredNotes]);

  useEffect(() => {
    if (activeNote) {
      handleNoteGuess(activeNote);
    }
  }, [activeNote]);

  useEffect(() => {
    if (isAdvance) {
      const timer = setTimeout(() => {
        const nextNote = generateRandomNoteBasedOnRoot();
        setCurrentNote(nextNote);
        playNote(nextNote);
        setIsAdvance(false);
      }, (60/bpm)*2000);
  
      return () => clearTimeout(timer);
    } else if (isHandfree && gameStarted) {
      const degree = calculateDegree(Tone.Frequency(currentNote).toMidi());
      const player = preloadAudio(degree);

      const timer = setTimeout(() => {
        if(player.loaded){
          player.start();
        }
        setTimeout(() => {
          setIsAdvance(true); // Set to advance
          playNote(currentNote); // Play the note
        }, 1000); // Adjust delay as needed
      }, (60/bpm)*2000);
      return () => clearTimeout(timer);
    }
  }, [isAdvance, gameStarted, isHandfree]);

  const startGame = () => {
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    Tone.getTransport().cancel();
    setGameStarted(true);
    setDisabledNotes([]);
    const note = generateRandomNoteBasedOnRoot();
    setCurrentNote(note);
    playNote(note, 1);
    drone.start();
    Tone.getTransport().start();
  };

  const playNote = (note = null, delay = 0.05) => {
    if (!note) {
      note = currentNote;
    }
    playNotes(note,delay ,bpm)
  };

  const generateRandomNoteBasedOnRoot = () => {
    if (possibleMidiList.length === 0) return null;
    const nextNoteMidi = possibleMidiList[Math.floor(Math.random() * possibleMidiList.length)];
    return Tone.Frequency(nextNoteMidi, 'midi').toNote();
  };

  const handleNoteGuess = (guessedNote) => {
    const guessedNoteMidi = Tone.Frequency(guessedNote).toMidi();
    const currentNoteMidi = Tone.Frequency(currentNote).toMidi();
    const isCorrect = guessedNoteMidi % 12 === currentNoteMidi % 12;
    const guessedDegree = calculateDegree(guessedNoteMidi, currentNoteMidi);
    if (isCorrect) {
      setDisabledNotes([]);
      updatePracticeRecords(guessedDegree, isCorrect);
      playNote(currentNote);
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
    const interval = (guessedNoteMidi - rootNote) % 12;
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
    setGameStarted(false);
    setDisabledNotes([]);
    drone.stop();
  };

  return {
    currentNote,
    disabledNotes,
    gameStarted,
    filteredNotes,
    possibleMidiList,
    activeNote,
    isAdvance,
    isCorrect,
    setActiveNote,
    startGame,
    playNote,
    endGame
  };
};

export default useDegreeTrainer;