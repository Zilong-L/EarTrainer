import { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { degrees } from '@components/EarTrainers/SequenceTrainer/Constants';
import { getPianoInstance, getDroneInstance } from '@utils/ToneInstance';
import { playNotes, cancelAllSounds } from '@utils/ToneInstance';

const useSequenceTrainer = (settings) => {
  const {
    bpm,
    droneVolume,
    pianoVolume,
    rootNote,
    range,
    currentNotes,
    updatePracticeRecords,
    sequenceLength,
  } = settings;

  const [currentSequence, setCurrentSequence] = useState([]);
  const [sequenceIndex, setSequenceIndex] = useState(0);
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
    setGameStarted(true);
    setDisabledNotes([]);
    const sequence = generateRandomSequenceBasedOnRoot();
    setCurrentSequence(sequence);
    setSequenceIndex(0);
    playSequence(sequence, 1);
    drone.start();
  };

  const playSequence = (sequence = null, delay = 0.05) => {
    if (!sequence) {
      sequence = currentSequence;
    }
    playNotes(sequence, delay, bpm);
  };

  const generateRandomSequenceBasedOnRoot = () => {
    if (possibleMidiList.length === 0) return [];
    const sequence = [];
    for (let i = 0; i < sequenceLength; i++) {
      const nextNoteMidi = possibleMidiList[Math.floor(Math.random() * possibleMidiList.length)];
      sequence.push(Tone.Frequency(nextNoteMidi, 'midi').toNote());
    }
    return sequence;
  };

  const handleNoteGuess = (guessedNote) => {
    const guessedNoteMidi = Tone.Frequency(guessedNote).toMidi();
    const currentNoteMidi = Tone.Frequency(currentSequence[sequenceIndex]).toMidi();
    const guessedDegree = calculateDegree(guessedNoteMidi, currentNoteMidi);
    const isCorrect = guessedNoteMidi % 12 === currentNoteMidi % 12;
    if (isCorrect) {
      setDisabledNotes([]);
      updatePracticeRecords(guessedDegree, isCorrect);
      setSequenceIndex((prevIndex) => {
        pianoSampler.triggerAttackRelease(currentSequence[prevIndex], 60 / bpm);
        const nextIndex = prevIndex + 1;
        
        if (nextIndex >= currentSequence.length) {
          const newSequence = generateRandomSequenceBasedOnRoot();
          setCurrentSequence(newSequence);
          playSequence(newSequence, 1);
          return 0;
        } else {
          return nextIndex;
        }
      });
    } else {
      pianoSampler.triggerAttackRelease(guessedNote, 60 / bpm);
      if (!disabledNotes.includes(guessedNote)) {
        setDisabledNotes((prev) => [...prev, guessedNote]);
        updatePracticeRecords(guessedDegree, isCorrect);
      }
    }
    setActiveNote(null);
  };

  const calculateDegree = (guessedNoteMidi, currentNoteMidi) => {
    const interval = (guessedNoteMidi - rootNote) % 12;
    return degrees.find(degree => degree.distance === interval)?.name || "Unknown";
  };

  useEffect(() => {
    const newSequence = generateRandomSequenceBasedOnRoot();
    setCurrentSequence(newSequence);
    setSequenceIndex(0);
  }, [possibleMidiList, sequenceLength]);

  const endGame = () => {
    cancelAllSounds();
    setGameStarted(false);
    setDisabledNotes([]);
    drone.stop();
  };

  return {
    currentSequence,
    sequenceIndex,
    disabledNotes,
    gameStarted,
    filteredNotes,
    possibleMidiList,
    activeNote,
    setActiveNote,
    startGame,
    playSequence,
    endGame,
  };
};

export default useSequenceTrainer;