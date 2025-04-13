import { useState, useEffect } from 'react';

import * as Tone from 'tone';
import { defaultDegreeChordTypes, VoicingDictionary } from '@components/EarTrainers/ChordColorTrainer/Constants';
import { getSamplerInstance, getDroneInstance, scheduleNotes } from '@utils/ToneInstance';  // Added scheduleNotes
import { Progression, Chord, Voicing, Interval, Note } from 'tonal';
import { playNotesTogether, playNotes } from '@utils/ToneInstance';
import useChordColorTrainerSettings from './useChordColorTrainerSettings';
const useChordColorTrainer = () => {
  const {
    bpm,
    droneVolume,
    pianoVolume,
    rootNote,
    range,
    degreeChordTypes,
    updatePracticeRecords,
    selectedInstrument,
  } = useChordColorTrainerSettings();

  // 获取全局音色设置

  const [currentChord, setCurrentChord] = useState('');
  const [disabledChords, setDisabledChords] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [filteredChords, setFilteredChords] = useState([]);
  const [activeChord, setActiveChord] = useState('');
  // Pending state: 'No' | 'Ready' | 'Now'
  const [isAdvance, setIsAdvance] = useState('No');

  const piano = getSamplerInstance();
  const drone = getDroneInstance();

  useEffect(() => {
    drone.updateRoot(rootNote);
    drone.setVolume(droneVolume);
    piano.setVolume(pianoVolume);
  }, [droneVolume, pianoVolume, rootNote]);

  // 音色变化时切换采样器
  useEffect(() => {
    if (piano && piano.changeSampler) {
      piano.changeSampler(selectedInstrument, 'low');
    }
  }, [selectedInstrument]);

  useEffect(() => {
    const newChord = generateRandomChord();
    console.log(newChord);
    setCurrentChord(newChord);
  }, [filteredChords]);

  useEffect(() => {
    if (activeChord) {
      handleChordGuess(activeChord);
    }
  }, [activeChord]);

  useEffect(() => {
    if (isAdvance === 'Now') {
      advanceGame();
    }
    // Do nothing if 'No' or 'Ready'
  }, [isAdvance]);

  const advanceGame = () => {
    const nextChord = generateRandomChord();
    setCurrentChord(nextChord);
    setIsAdvance('No');
    setDisabledChords([]);
    // playChord(nextChord.notes, 0.2); // Replaced with new pattern
    playChordColorPattern(nextChord.notes);
  };
  const startGame = () => {
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    Tone.getTransport().cancel();
    setGameStarted(true);
    setIsAdvance('Now'); // Start with advancing to the first chord
    Tone.getTransport().start();
  };

  const playTonic = () => {
    playNotesTogether(rootNote, 0.05, bpm);
  };

  const playChord = (notes = null, delay = 0.05) => {
    if (!notes) {
      notes = currentChord.notes;
    }
    playNotesTogether(notes, delay, bpm);
  };

  const playBrokenChord = (notes = null, delay = 0.05) => {
    if (!notes) {
      notes = currentChord.notes;
    }
    playNotes(notes, delay, bpm);
  };

  // New function for the specific playback pattern using scheduleNotes exclusively
  const playChordColorPattern = (notes) => {
    if (!notes || notes.length === 0) {
      notes = currentChord.notes;
    }

    const t = 60 / bpm; // Time unit based on bpm

    const events = [];

    // 1. Upscale arpeggio
    notes.forEach((note, i) => {
      events.push({
        note: note,
        time: i * 0.25 * t, // Relative time
        duration: (4 - i * 0.25) * t,
      });
    });

    // 2. First full chord
    notes.forEach((note) => {
      events.push({
        note: note,
        time: 2 * t, // After upscale
        duration: 2 * t,
      });
    });

    // 3. Downscale arpeggio
    const reversedNotes = notes.slice().reverse();
    reversedNotes.forEach((note, i) => {
      events.push({
        note: note,
        time: (4 + 0.25 * i) * t, // After first full chord
        duration: (4 - i * 0.25) * t, // Simplified duration
      });
    });

    // 4. Second full chord
    notes.forEach((note) => {
      events.push({
        note: note,
        time: 6 * t, // After downscale
        duration: 2 * t,
      });
    });

    scheduleNotes(events); // Pass events to scheduleNotes for handling
  };

  const getNotesForChord = (degree, chordType) => {
    const chord = Progression.fromRomanNumerals(rootNote.slice(0, -1), [
      `${degree}${chordType}`,
    ])[0]; // 使用随机的级数和和弦类型
    const chordRange = [
      range[0],
      Note.fromMidi(Note.midi(range[1]) + Interval.semitones('P8')),
    ];
    const dictionary = VoicingDictionary.rootPosition;
    console.log(dictionary);
    // TODO:this can be configured later to allow different voicings
    // for now, we only have root position voicings
    const possibleChords = Voicing.search(chord, chordRange, dictionary);
    console.log('pi', possibleChords, chord);
    const notes = possibleChords[
      Math.floor(Math.random() * possibleChords.length)
    ];
    console.log(notes);
    return notes;
  };

  const handleChordGuess = (guessedChord) => {
    const isCorrect =
      guessedChord === `${currentChord.degree}${currentChord.chordType}`;
    if (isCorrect) {
      setIsAdvance('Ready'); // Pending state, wait for user to trigger next
      updatePracticeRecords(guessedChord, isCorrect);
      playChordColorPattern(currentChord.notes); // Play current chord on correct guess
    } else {
      setDisabledChords((prev) => [...prev, guessedChord]);
      updatePracticeRecords(guessedChord, isCorrect);
      // Play the guessed chord's notes simultaneously on incorrect guess
      const [degree, chordType] = [
        guessedChord.slice(0, -1),
        guessedChord.slice(-1),
      ];
      const notes = getNotesForChord(degree, chordType);
      playChordColorPattern(notes);
    }
    setActiveChord(null);
  };

  const endGame = () => {
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    Tone.getTransport().cancel();
    setGameStarted(false);
    setDisabledChords([]);
    setIsAdvance('No');
    drone.stop();
  };

  // 将 degreeChordTypes 对象转换为数组并过滤掉空的级数和弦组合
  useEffect(() => {
    const allCombinations = degreeChordTypes.flatMap((chord) =>
      chord.chordTypes.map((chordType) => ({ degree: chord.degree, chordType }))
    );
    setFilteredChords(allCombinations);
  }, [degreeChordTypes, rootNote]);

  // 生成一个随机的级数和和弦类型组合
  const generateRandomChord = () => {
    const RomanNumeral =
      filteredChords[Math.floor(Math.random() * filteredChords.length)];
    if (!RomanNumeral) {
      return null;
    }
    // 生成和弦的音符
    const chord = Progression.fromRomanNumerals(rootNote.slice(0, -1), [
      `${RomanNumeral.degree}${RomanNumeral.chordType}`,
    ])[0]; // 使用随机的级数和和弦类型
    const chordRange = [
      range[0],
      Note.fromMidi(Note.midi(range[1]) + Interval.semitones('P8')),
    ];
    const dictionary = VoicingDictionary.rootPosition;
    console.log(dictionary);
    // TODO:this can be configured later to allow different voicings
    // for now, we only have root position voicings
    const possibleChords = Voicing.search(chord, chordRange, dictionary);
    console.log('pi', possibleChords, chord);
    const notes =
      possibleChords[Math.floor(Math.random() * possibleChords.length)];
    console.log(notes);
    return { ...RomanNumeral, notes: notes };
  };

  return {
    currentChord,
    disabledChords,
    gameStarted,
    filteredChords,
    activeChord,
    isAdvance,
    setIsAdvance,
    bpm,
    setActiveChord,
    startGame,
    playChord,
    endGame,
    playTonic,
    playBrokenChord,
    playChordColorPattern,
  };
};

export default useChordColorTrainer;
