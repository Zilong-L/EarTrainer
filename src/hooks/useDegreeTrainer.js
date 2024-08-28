import { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { degrees } from '@utils/Constants';
import { getPianoInstance, getDroneInstance } from '@utils/ToneInstance';
import useDegreeTrainerSettings from './useDegreeTrainerSettings';

const useDegreeTrainer = () => {
  const {
    bpm,
    droneVolume,
    pianoVolume,
    rootNote,
    range,
    practiceRecords,
    currentNotes,
    setBpm,
    setDroneVolume,
    setPianoVolume,
    setRootNote,
    setRange,
    setPracticeRecords,
    updatePracticeRecords,
    setCurrentNotes,
  } = useDegreeTrainerSettings();

  const [currentNote, setCurrentNote] = useState("");
  const [disabledNotes, setDisabledNotes] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [filteredNotes, setFilteredNotes] = useState(degrees);
  const [possibleMidiList, setPossibleMidiList] = useState([]);
  const [activeNote, setActiveNote] = useState(null);

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
    const guessedDegree = calculateDegree(guessedNoteMidi, currentNoteMidi);
    const isCorrect = guessedNoteMidi % 12 === currentNoteMidi % 12;
    if (isCorrect) {
      setDisabledNotes([]);
      updatePracticeRecords(guessedDegree, isCorrect);
      setCurrentNote(() => {
        const nextNote = generateRandomNoteBasedOnRoot(rootNote, filteredNotes);
        playNote(nextNote);
        return nextNote;
      });
      setActiveNote(null);
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

  return {
    currentNote,
    disabledNotes,
    gameStarted,
    bpm,
    currentNotes,
    filteredNotes,
    possibleMidiList,
    practiceRecords,
    droneVolume,
    pianoVolume,
    rootNote,
    range,
    activeNote,
    setActiveNote,
    setBpm,
    setDroneVolume,
    setPianoVolume,
    setRootNote,
    setRange,
    setCurrentNotes,
    startGame,
    playNote,
    setPracticeRecords
  };
};

export default useDegreeTrainer;