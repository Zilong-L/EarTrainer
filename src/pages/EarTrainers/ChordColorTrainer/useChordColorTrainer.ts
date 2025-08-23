import { useState, useEffect } from 'react';
import { getTransport } from 'tone';
import { DegreeToDistance } from '@utils/Constants';
import { VoicingDictionary } from '@EarTrainers/ChordColorTrainer/Constants';
import { getSamplerInstance, getDroneInstance } from '@utils/Tone/samplers';  // Added scheduleNotes
import { scheduleNotes } from '@utils/Tone/playbacks';  // Added scheduleNotes
import { Chord, Voicing, Interval, Note, Midi } from 'tonal';
import { playNotesTogether, playNotes } from '@utils/Tone/playbacks';
import useChordColorTrainerSettings from './useChordColorTrainerSettings';
import { getChords, compareChords } from '@utils/ChordTrainer/GameLogics';

const useChordColorTrainer = (chordPlayOption: string) => {
  const {
    bpm,
    droneVolume,
    pianoVolume,
    rootNote,
    range,
    degreeChordTypes,
    updatePracticeRecords,
    // selectedInstrument,
  } = useChordColorTrainerSettings();

  const [currentChord, setCurrentChord] = useState<any>('');
  const [disabledChords, setDisabledChords] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [filteredChords, setFilteredChords] = useState<any[]>([]);
  const [activeChord, setActiveChord] = useState('');
  const [activeNotes, setActiveNotes] = useState<number[]>([]); // Define activeNotes state
  const [isAdvance, setIsAdvance] = useState<string>('No');

  const piano = getSamplerInstance();
  const drone = getDroneInstance();

  useEffect(() => {
    drone.updateRoot(rootNote);
    drone.setVolume(droneVolume);
    piano.setVolume(pianoVolume);
  }, [droneVolume, pianoVolume, rootNote]);


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
    getTransport().stop();
    getTransport().position = 0;
    getTransport().cancel();
    setGameStarted(true);
    playChordColorPattern(currentChord.notes);
    getTransport().start();
  };

  const playTonic = () => {
    playNotesTogether(rootNote, 0.05, bpm);
  };

  const playChord = (notes: string[] | null = null, delay = 0.05) => {
    if (!notes) {
      notes = currentChord.notes;
    }
    if (notes) playNotesTogether(notes, delay, bpm);
  };

  const playBrokenChord = (notes: string[] | null = null, delay = 0.05) => {
    if (!notes) {
      notes = currentChord.notes;
    }
    if (notes) playNotes(notes, delay, bpm);
  };

  // New function for the specific playback pattern using scheduleNotes exclusively
  const playChordColorPattern = (notes: string[]) => {
    if (!notes || notes.length === 0) {
      notes = currentChord.notes;
    }

    const t = 60 / bpm; // Time unit based on bpm
    let events = null;
    let reversedNotes; // Declare reversedNotes outside the switch

    switch (chordPlayOption) {
      case 'random':
        // Implement random chord play logic
        const randomNotes = [...notes].sort(() => Math.random() - 0.5);
        events = randomNotes.map((note, i) => ({
          note: note,
          time: i * 0.25 * t, // Relative time
          duration: 2 * t, // Sustain notes
        }));
        break;
      case 'ascending':
        // Implement ascending chord play logic
        events = notes.map((note, i) => ({
          note: note,
          time: i * 0.25 * t, // Relative time
          duration: 2 * t, // Sustain notes
        }));
        break;
      case 'descending':
        // Implement descending chord play logic
        reversedNotes = notes.slice().reverse();
        events = reversedNotes.map((note, i) => ({
          note: note,
          time: i * 0.25 * t, // Relative time
          duration: 2 * t, // Sustain notes
        }));
        break;
      default:
        // Default: Original pattern provided by user
        // 1. Upscale arpeggio
        const upscaleArpeggioEvents = notes.map((note, i) => ({
          note: note,
          time: i * 0.25 * t, // Relative time
          duration: (4 - i * 0.25) * t,
        }));

        // 2. First full chord
        const firstFullChordEvents = notes.map((note) => ({
          note: note,
          time: 2 * t, // After upscale
          duration: 2 * t,
        }));

        // 3. Downscale arpeggio
        reversedNotes = notes.slice().reverse(); // Assign here
        const downscaleArpeggioEvents = reversedNotes.map((note, i) => ({
          note: note,
          time: (4 + 0.25 * i) * t, // After first full chord
          duration: (4 - i * 0.25) * t, // Simplified duration
        }));

        // 4. Second full chord
        const secondFullChordEvents = notes.map((note) => ({
          note: note,
          time: 6 * t, // After downscale
          duration: 2 * t,
        }));

        events = [...upscaleArpeggioEvents, ...firstFullChordEvents, ...downscaleArpeggioEvents, ...secondFullChordEvents];
        break;
      case 'block':
        // Implement block chord play logic
        events = notes.map((note) => ({
          note: note,
          time: 0, // All notes at the same time
          duration: 2 * t, // Sustain notes
        }));
        break;
    }

    scheduleNotes(events);
  };

  useEffect(() => {
    if (isAdvance === 'Pending') {
      if (activeNotes.length === 0) {
        setIsAdvance('Now');
      }
      return;  // Early return
    }

    if (activeNotes && activeNotes.length > 0) {
      const detectedChords = getChords(activeNotes);
      if (detectedChords && detectedChords.length > 0) {
        const steps = DegreeToDistance[currentChord?.degree] || 0;
        const midiNote = Midi.toMidi(rootNote || 'C4');
        const noteName = midiNote ? Midi.midiToNoteName(midiNote + steps) : null;
        const note = (noteName || '').slice(0, -1);
        const chordType = currentChord?.chordType || '';
        const chord = note + chordType;
        const isCorrect = compareChords(detectedChords as any, chord);
        if (isCorrect) {
          if (activeNotes.length >= 6) {
            setIsAdvance('Pending');  // Changed from 'Now' to 'Pending'
          } else {
            setIsAdvance('Ready');  // Unchanged
          }
        }
      }
    }
  }, [activeNotes, currentChord, rootNote, isAdvance]);  // Added isAdvance to dependencies

  const getNotesForChord = (numeral: string) => {

    const numeralDegree = /([IV]+)([b#]?)/.exec(numeral)?.[0] || ''
    const steps = DegreeToDistance[numeralDegree] || 0;
    const midiNote = Midi.toMidi(rootNote || 'C4');
    const noteName = midiNote ? Midi.midiToNoteName(midiNote + steps) : null;
    const note = (noteName || '').slice(0, -1);

    const chordType = numeral.slice(numeralDegree.length);
    const chord = Chord.get(note + chordType);
    const chordRange = [
      range[0],
      Note.fromMidi((Note.midi(range[1]) || 0) + Interval.semitones('P8')),
    ];
    const dictionary = VoicingDictionary.rootPosition;
    const possibleChords = Voicing.search(chord.symbol, chordRange, dictionary as any);
    const notes = possibleChords[
      Math.floor(Math.random() * possibleChords.length)
    ];
    return notes;
  };

  const handleChordGuess = (guessedChord: string) => {
    // If in 'Ready' state, just play the sound for comparison, don't guess/record/disable
    if (isAdvance !== 'No') {
      const notes = getNotesForChord(guessedChord);
      playChordColorPattern(notes);
      setActiveChord(''); // Reset active chord after playing
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
    setActiveChord('');
  };

  const endGame = () => {
    getTransport().stop();
    getTransport().position = 0;
    getTransport().cancel();
    setGameStarted(false);
    setDisabledChords([]);
    setIsAdvance('No');
    drone.stop();
  };

  // 将 degreeChordTypes 对象转换为数组并过滤掉空的级数和弦组合
  useEffect(() => {
    if (degreeChordTypes) {
      const allCombinations = degreeChordTypes.flatMap((chord: any) =>
        chord.chordTypes?.map((chordType: any) => ({ degree: chord.degree, chordType })) || []
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
