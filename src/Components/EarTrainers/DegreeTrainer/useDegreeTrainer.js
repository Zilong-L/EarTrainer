import { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { degrees } from '@components/EarTrainers/DegreeTrainer/Constants';
import { getPianoInstance, getDroneInstance } from '@utils/ToneInstance';

const useDegreeTrainer = (settings) => {
  const {
    isHandfree,
    bpm,
    droneVolume,
    pianoVolume,
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

  const piano = getPianoInstance();
  const drone = getDroneInstance();
  const pianoSampler = piano.sampler;

  useEffect(() => {
    drone.updateRoot(rootNote);
    drone.setVolume(droneVolume);
    piano.setVolume(pianoVolume);
  }, [droneVolume, pianoVolume, rootNote]);

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
      }, (60/bpm)*1100);

      return () => clearTimeout(timer);
    }else if(isHandfree && gameStarted){
      const timer = setTimeout(() => {
        playNote(currentNote);
        setIsAdvance(true);
      }, (60/bpm)*1100);
      return () => clearTimeout(timer);
    }
  }, [isAdvance,gameStarted,isHandfree]);

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

  const playNote = (note = null, delay = 0) => {
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    Tone.getTransport().cancel();
    if (!note) {
      note = currentNote;
    }
    if (pianoSampler._buffers && pianoSampler._buffers.loaded) {
      console.log('play note',note)
      pianoSampler.triggerAttackRelease(note, 60 / bpm, Tone.now() + delay);
    }
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

  const calculateDegree = (guessedNoteMidi, currentNoteMidi) => {
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