import { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { degrees } from '@utils/Constants';
import { getPianoInstance, getDroneInstance } from '@utils/ToneInstance';
import useSequenceTrainerSettings from './useSequenceTrainerSettings';

const useSequenceTrainer = () => {
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
    sequenceLength,
    setSequenceLength,
    saveSettings
  } = useSequenceTrainerSettings();

  const [currentSequence, setCurrentSequence] = useState([]);
  const [sequenceIndex, setSequenceIndex] = useState(0); // 新增状态
  const [disabledNotes, setDisabledNotes] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [filteredNotes, setFilteredNotes] = useState(degrees);
  const [possibleMidiList, setPossibleMidiList] = useState([]);
  const [activeNote, setActiveNote] = useState(null);

  const piano = getPianoInstance();
  const drone = getDroneInstance();
  const pianoSampler = piano.sampler;
  const generateRandoSequenceBasedOnRoot = () => {
    const sequence = [];
    for (let i = 0; i < sequenceLength; i++) {
      const randomIndex = Math.floor(Math.random() * possibleMidiList.length);
      sequence.push(possibleMidiList[randomIndex]);
    }
    return sequence;
  };
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
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    Tone.getTransport().cancel();
    setGameStarted(true);
    setDisabledNotes([]);
    const sequence = generateRandoSequenceBasedOnRoot();
    setCurrentSequence(sequence);
    setSequenceIndex(0); // 重置序列索引
    playSequence(sequence, 1);
    drone.start();
    Tone.getTransport().start();
  };

  const playSequence = (sequence = null, delay = 0) => {
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    Tone.getTransport().cancel();
    if (!sequence) {
      sequence = currentSequence;
    }
    if (pianoSampler._buffers && pianoSampler._buffers.loaded) {
      sequence.forEach((note, index) => {
        pianoSampler.triggerAttackRelease(note, 60 / bpm, Tone.now() + delay + index * (60 / bpm));
      });
    }
  };

  const generateRandomSequenceBasedOnRoot = () => {
    if (possibleMidiList.length === 0) return [];
    const sequence = [];
    for (let i = 0; i < sequenceLength; i++) { // 使用状态变量
      const nextNoteMidi = possibleMidiList[Math.floor(Math.random() * possibleMidiList.length)];
      sequence.push(Tone.Frequency(nextNoteMidi, 'midi').toNote());
    }
    return sequence;
  };

  const handleNoteGuess = (guessedNote) => {
    const guessedNoteMidi = Tone.Frequency(guessedNote).toMidi();
    const currentNoteMidi = Tone.Frequency(currentSequence[sequenceIndex]).toMidi(); // 使用序列索引
    const guessedDegree = calculateDegree(guessedNoteMidi, currentNoteMidi);
    const isCorrect = guessedNoteMidi % 12 === currentNoteMidi % 12;
    if (isCorrect) {
      setDisabledNotes([]);
      updatePracticeRecords(guessedDegree, isCorrect);
      setSequenceIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= currentSequence.length) {
          const newSequence = generateRandomSequenceBasedOnRoot();
          setCurrentSequence(newSequence);
          playSequence(newSequence);
          return 0;
        } else {
          // playSequence(currentSequence.slice(nextIndex));
          return nextIndex;
        }
      });
      setActiveNote(null);
    } else {
      if (!disabledNotes.includes(guessedNote)) {
        setDisabledNotes((prev) => [...prev, guessedNote]);
        updatePracticeRecords(guessedDegree, isCorrect);
      }
      playSequence([guessedNote]);
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
    setSequenceIndex(0); // 重置序列索引
  }, [possibleMidiList,sequenceLength]);

  const endGame = () => {
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    Tone.getTransport().cancel();
    setGameStarted(false);
    setDisabledNotes([]);
    drone.stop();
  };

  return {
    currentSequence,
    sequenceIndex, // 返回序列索引
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
    playSequence,
    setPracticeRecords,
    currentSequence,
    sequenceIndex,
    endGame,
    sequenceLength,
    setSequenceLength,
    saveSettings
  };
};

export default useSequenceTrainer;