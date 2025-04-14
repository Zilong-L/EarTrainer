import { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { DegreeToDistance } from '@utils/Constants';
import { defaultDegreeChordTypes, VoicingDictionary } from '@components/EarTrainers/ChordColorTrainer/Constants';
import { getSamplerInstance, getDroneInstance, scheduleNotes } from '@utils/ToneInstance';  // Added scheduleNotes
import { Chord, Voicing, Interval, Note, VoiceLeading, Midi } from 'tonal';
import { playNotesTogether, playNotes } from '@utils/ToneInstance';
import useChordColorTrainerSettings from './useChordColorTrainerSettings';
import { getChords, compareChords } from '@utils/ChordTrainer/GameLogics';

const useChordColorTrainer = (chordPlayOption) => {
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

  const [currentChord, setCurrentChord] = useState('');
  const [disabledChords, setDisabledChords] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [filteredChords, setFilteredChords] = useState([]);
  const [activeChord, setActiveChord] = useState('');
  const [activeNotes, setActiveNotes] = useState([]); // Define activeNotes state
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
    let reversedNotes; // Declare reversedNotes outside the switch

    switch (chordPlayOption) {
      case 'random':
        // Implement random chord play logic
        const randomNotes = [...notes].sort(() => Math.random() - 0.5);
        randomNotes.forEach((note, i) => {
          events.push({
            note: note,
            time: i * 0.25 * t, // Relative time
            duration: 2 * t, // Sustain notes
          });
        });
        break;
      case 'ascending':
        // Implement ascending chord play logic
        notes.forEach((note, i) => {
          events.push({
            note: note,
            time: i * 0.25 * t, // Relative time
            duration: 2 * t, // Sustain notes
          });
        });
        break;
      case 'descending':
        // Implement descending chord play logic
        reversedNotes = notes.slice().reverse();
        reversedNotes.forEach((note, i) => {
          events.push({
            note: note,
            time: i * 0.25 * t, // Relative time
            duration: 2 * t, // Sustain notes
          });
        });
        break;
      default:
        // Default: Original pattern provided by user
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
        reversedNotes = notes.slice().reverse(); // Assign here
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
        break;
    }

    scheduleNotes(events);
  };

  useEffect(() => {
    if (activeNotes && activeNotes.length > 0) {
      const detectedChords = getChords(activeNotes);
      if (detectedChords && detectedChords.length > 0) {
        const steps = DegreeToDistance[currentChord.degree] || 0;
        const note = Midi.midiToNoteName(Midi.toMidi(rootNote) + steps).slice(0, -1);
        const chordType = currentChord.chordType;
        const chord = note + chordType
        const isCorrect = compareChords(detectedChords, chord);
        if (isCorrect) {
          setIsAdvance('Ready');
        }
      }
    }
  }, [activeNotes, currentChord, rootNote]);

  const getNotesForChord = (numeral) => {

    const numeralDegree = /([IV]+)([b#]?)/.exec(numeral)[0]
    const steps = DegreeToDistance[numeralDegree] || 0;
    const note = Midi.midiToNoteName(Midi.toMidi(rootNote) + steps).slice(0, -1);

    const chordType = numeral.slice(numeralDegree.length);
    const chord = Chord.get(note + chordType);
    console.log(chord)
    const chordRange = [
      range[0],
      Note.fromMidi(Note.midi(range[1]) + Interval.semitones('P8')),
    ];
    const dictionary = VoicingDictionary.rootPosition;
    const possibleChords = Voicing.search(chord.symbol, chordRange, dictionary);
    console.log('possibleChords', possibleChords)
    const notes = possibleChords[
      Math.floor(Math.random() * possibleChords.length)
    ];
    console.log('notes', notes)
    return notes;
  };

  const handleChordGuess = (guessedChord) => {
    // If in 'Ready' state, just play the sound for comparison, don't guess/record/disable
    if (isAdvance === 'Ready') {
      const notes = getNotesForChord(guessedChord);
      playChordColorPattern(notes);
      setActiveChord(null); // Reset active chord after playing
      return; // Exit early, skip guessing logic
    }

    const isCorrect =
      guessedChord === `${currentChord.degree}${currentChord.chordType}`;
    if (isCorrect) {
      setIsAdvance('Ready'); // Pending state, wait for user to trigger next
      setDisabledChords([]); // Re-enable all buttons on correct guess
      updatePracticeRecords(guessedChord, isCorrect);
      playChordColorPattern(currentChord.notes); // Play current chord on correct guess
    } else {
      setDisabledChords((prev) => [...prev, guessedChord]);
      updatePracticeRecords(guessedChord, isCorrect);
      // Play the guessed chord's notes on incorrect guess
      const notes = getNotesForChord(guessedChord);
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
    if (degreeChordTypes) {
      const allCombinations = degreeChordTypes.flatMap((chord) =>
        chord.chordTypes.map((chordType) => ({ degree: chord.degree, chordType }))
      );
      setFilteredChords(allCombinations);
    }
  }, [degreeChordTypes, rootNote]);

  // 生成一个随机的级数和和弦类型组合
  const generateRandomChord = () => {
    if (!filteredChords || filteredChords.length === 0) {
      return null;
    }
    const RomanNumeral =
      filteredChords[Math.floor(Math.random() * filteredChords.length)];
    if (!RomanNumeral) {
      return null;
    }
    const notes = getNotesForChord(RomanNumeral.degree + RomanNumeral.chordType);
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
    activeNotes, // Export activeNotes
    setActiveNotes, // Export setActiveNotes
  };
};

export default useChordColorTrainer;
