import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Chord, Note } from 'tonal';
import { getSamplerInstance, getDroneInstance } from '@utils/Tone/samplers';
import { cancelAllSounds, scheduleNotes } from '@utils/Tone/playbacks';
import useChordColorTrainerSettingsStore from '@stores/chordColorTrainerSettingsStore';
import useChordColorTrainerSettings from './useChordColorTrainerSettings';
import { getChords, compareChords } from '@utils/ChordTrainer/GameLogics';
import {
  buildChordQuestion,
  chooseNextChord,
  createChordEvents,
  type ChordQuestion,
} from './musicTheory';

const useChordColorTrainer = (chordPlayOption: string) => {
  const { t } = useTranslation('chordColorTrainer');
  const settings = useChordColorTrainerSettings();
  const {
    bpm,
    pianoVolume,
    rootNote,
    range,
    degreeChordTypes,
    updatePracticeRecords,
    preset,
  } = settings;
  const { inversionMode, bassEnabled, bassLevel, backingMode } =
    useChordColorTrainerSettingsStore();
  const [currentChord, setCurrentChord] = useState<ChordQuestion | null>(null);
  const [disabledChords, setDisabledChords] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [activeNotes, setActiveNotes] = useState<number[]>([]);
  const [isAdvance, setIsAdvance] = useState('No');
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastGuess, setLastGuess] = useState('');
  const [wasRevealed, setWasRevealed] = useState(false);
  const [session, setSession] = useState({
    answered: 0,
    correct: 0,
    streak: 0,
  });
  const answeredRef = useRef(false);
  const finishTimer = useRef<ReturnType<typeof setTimeout>>();
  const playbackRef = useRef(0);
  const currentRef = useRef<ChordQuestion | null>(null);

  const filteredChords = useMemo(() => {
    const all = degreeChordTypes.flatMap(chord =>
      (chord.chordTypes || []).map(chordType => ({
        degree: chord.degree || '',
        chordType,
      }))
    );
    return all.filter(
      (choice, index) =>
        all.findIndex(
          other =>
            other.degree === choice.degree &&
            Chord.get(['C', other.chordType]).chroma ===
              Chord.get(['C', choice.chordType]).chroma
        ) === index &&
        buildChordQuestion(choice, rootNote, range, inversionMode) !== null
    );
  }, [degreeChordTypes, rootNote, range, inversionMode]);

  const stopPlayback = useCallback(() => {
    playbackRef.current += 1;
    clearTimeout(finishTimer.current);
    cancelAllSounds();
    getDroneInstance().stop();
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    getSamplerInstance().setVolume(pianoVolume);
  }, [pianoVolume]);

  // A setting change creates a fresh question, but never starts sound by itself.
  useEffect(() => {
    stopPlayback();
    const choice = chooseNextChord(filteredChords, currentRef.current);
    const next = choice
      ? buildChordQuestion(choice, rootNote, range, inversionMode)
      : null;
    currentRef.current = next;
    setCurrentChord(next);
    setDisabledChords([]);
    setLastGuess('');
    setWasRevealed(false);
    setIsAdvance('No');
    answeredRef.current = false;
  }, [filteredChords, rootNote, range, inversionMode, stopPlayback]);

  const playEvents = useCallback(
    async (events: Parameters<typeof scheduleNotes>[0]) => {
      if (!events.length) return false;
      stopPlayback();
      const request = playbackRef.current;
      try {
        await scheduleNotes(events);
        if (request !== playbackRef.current) return false;
        setIsPlaying(true);
        const seconds = Math.max(
          ...events.map(event => event.time + event.duration)
        );
        finishTimer.current = setTimeout(
          () => setIsPlaying(false),
          (seconds + 0.5) * 1000
        );
        return true;
      } catch {
        if (request === playbackRef.current) {
          setIsPlaying(false);
          toast.error(t('training.audioError'), { id: 'audio-error' });
        }
        return false;
      }
    },
    [stopPlayback, t]
  );

  const playQuestion = useCallback(
    (question: ChordQuestion | null, pattern = chordPlayOption) => {
      if (!question) return Promise.resolve(false);
      return playEvents(
        createChordEvents(question, pattern, bpm, {
          bassEnabled,
          bassLevel,
          backingMode,
          tonic: rootNote,
          minor: preset === '小调',
        })
      );
    },
    [
      playEvents,
      chordPlayOption,
      bpm,
      bassEnabled,
      bassLevel,
      backingMode,
      rootNote,
      preset,
    ]
  );

  const playChordColorPattern = useCallback(
    () => playQuestion(currentChord),
    [playQuestion, currentChord]
  );
  const playChord = useCallback(
    () => playQuestion(currentChord, 'block'),
    [playQuestion, currentChord]
  );
  const playBass = useCallback(
    () =>
      currentChord
        ? playEvents([
            {
              note: currentChord.bassNote,
              time: 0.05,
              duration: 1.4,
              voice: 'bass',
              velocity: 0.45,
            },
          ])
        : Promise.resolve(false),
    [currentChord, playEvents]
  );
  const playTonic = useCallback(
    () =>
      playEvents([
        { note: rootNote, time: 0.05, duration: 1.2, velocity: 0.6 },
      ]),
    [rootNote, playEvents]
  );

  const startGame = useCallback(async () => {
    if (!currentChord) return;
    if (await playQuestion(currentChord)) setGameStarted(true);
  }, [currentChord, playQuestion]);

  const advanceGame = useCallback(async () => {
    const choice = chooseNextChord(filteredChords, currentChord);
    const next = choice
      ? buildChordQuestion(choice, rootNote, range, inversionMode)
      : null;
    if (!next) return;
    answeredRef.current = false;
    currentRef.current = next;
    setCurrentChord(next);
    setIsAdvance('No');
    setDisabledChords([]);
    setLastGuess('');
    setWasRevealed(false);
    await playQuestion(next);
  }, [
    filteredChords,
    currentChord,
    rootNote,
    range,
    inversionMode,
    playQuestion,
  ]);

  const recordFirstAttempt = useCallback(
    (correct: boolean) => {
      if (!currentChord || answeredRef.current) return;
      answeredRef.current = true;
      updatePracticeRecords(
        `${currentChord.degree}${currentChord.chordType}`,
        correct
      );
      setSession(previous => ({
        answered: previous.answered + 1,
        correct: previous.correct + Number(correct),
        streak: correct ? previous.streak + 1 : 0,
      }));
    },
    [currentChord, updatePracticeRecords]
  );

  const setActiveChord = useCallback(
    (guess: string) => {
      if (!gameStarted || !currentChord || disabledChords.includes(guess))
        return;
      const correct =
        guess === `${currentChord.degree}${currentChord.chordType}`;
      if (isAdvance !== 'No') {
        const choice = filteredChords.find(
          chord => `${chord.degree}${chord.chordType}` === guess
        );
        if (choice)
          void playQuestion(
            buildChordQuestion(choice, rootNote, range, inversionMode)
          );
        return;
      }
      recordFirstAttempt(correct);
      setLastGuess(guess);
      if (correct) {
        setIsAdvance('Ready');
        setDisabledChords([]);
        void playQuestion(currentChord);
      } else {
        setDisabledChords(previous => [...previous, guess]);
        // Keep the target audible after a miss; comparisons are available after reveal.
        void playQuestion(currentChord);
      }
    },
    [
      gameStarted,
      currentChord,
      disabledChords,
      isAdvance,
      filteredChords,
      playQuestion,
      rootNote,
      range,
      inversionMode,
      recordFirstAttempt,
    ]
  );

  const revealAnswer = useCallback(() => {
    if (!gameStarted || !currentChord || isAdvance !== 'No') return;
    recordFirstAttempt(false);
    setWasRevealed(true);
    setIsAdvance('Ready');
    setDisabledChords([]);
  }, [gameStarted, currentChord, isAdvance, recordFirstAttempt]);

  useEffect(() => {
    if (
      !gameStarted ||
      isAdvance !== 'No' ||
      !currentChord ||
      !activeNotes.length
    )
      return;
    if (compareChords(getChords(activeNotes) || [], currentChord.symbol)) {
      setActiveChord(`${currentChord.degree}${currentChord.chordType}`);
    }
  }, [activeNotes, currentChord, gameStarted, isAdvance, setActiveChord]);

  useEffect(() => {
    const hide = () => {
      if (document.hidden) stopPlayback();
    };
    document.addEventListener('visibilitychange', hide);
    return () => {
      document.removeEventListener('visibilitychange', hide);
      stopPlayback();
    };
  }, [stopPlayback]);

  const bassPitchClass = currentChord
    ? Note.pitchClass(currentChord.bassNote)
    : '';
  return {
    currentChord,
    disabledChords,
    gameStarted,
    filteredChords,
    isAdvance,
    setActiveChord,
    startGame,
    advanceGame,
    playChord,
    playTonic,
    playBass,
    playChordColorPattern,
    activeNotes,
    setActiveNotes,
    stopPlayback,
    revealAnswer,
    wasRevealed,
    session,
    lastGuess,
    isPlaying,
    bassPitchClass,
  };
};

export default useChordColorTrainer;
