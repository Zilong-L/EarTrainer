import { useState, useEffect, useMemo, useRef } from 'react';
import * as Tone from 'tone';
import { degrees, initialUserProgress, DEGREES_MAP, type UserProgress } from '@EarTrainers/DegreeTrainer/Constants';
import { getDroneInstance } from '@utils/Tone/samplers';
import { playNotes } from '@utils/Tone/playbacks';
import toast from 'react-hot-toast';
import { useLocalStorage } from '@uidotdev/usehooks';
import { getNextNote, getPossibleNotesInRange, handleNoteGuess, handleGameLogic } from '@utils/GameLogics';
import { useDegreeTrainerSettings } from '@EarTrainers/DegreeTrainer/Settings/useDegreeTrainerSettings';

const useChallengeTrainer = () => {
  const {
    isHandfree,
    mode,
    practice: { bpm, rootNote, range, autoAdvance, useSolfege },
    stats: { updatePracticeRecords, currentPracticeRecords, setCurrentPracticeRecords },
  } = useDegreeTrainerSettings();

  const [currentLevel, setCurrentLevel] = useLocalStorage<number>('degreeTrainerCurrentLevel', 1);
  const [userProgress, setUserProgress] = useLocalStorage<UserProgress[]>('degreeTrainerUserProgress', initialUserProgress);
  const [progressVersion, setProgressVersion] = useLocalStorage<number>('degreeTrainerProgressVersion', 0);
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const playNoteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateLevel = (index: number) => {
    setCurrentLevel(index);
    setCurrentPracticeRecords({ total: 0, correct: 0 });
  };

  const migrateUserProgress = (oldProgress: UserProgress[]): UserProgress[] => {
    return oldProgress.map((level, index) => {
      const newLevel: UserProgress = {
        ...initialUserProgress[index],
        best: level.best || 0,
        unlocked: level.unlocked || false,
      };

      if (newLevel.best >= 90) newLevel.stars = 3;
      else if (newLevel.best >= 80) newLevel.stars = 2;
      else if (newLevel.best >= 70) newLevel.stars = 1;
      else newLevel.stars = 0;

      return newLevel;
    });
  };

  const resetUserProgress = () => {
    setUserProgress(initialUserProgress);
    setCurrentLevel(0);
  };

  useEffect(() => {
    if (progressVersion === 0) {
      const migratedProgress = migrateUserProgress(userProgress);
      setUserProgress(migratedProgress);
      setProgressVersion(1);
    }
  }, [progressVersion, setProgressVersion, setUserProgress, userProgress]);

  const unlockLevel = () => {
    if (mode !== 'challenge') return;
    const currentLevelData = userProgress[currentLevel];
    const totalTests = currentPracticeRecords.total;
    if (totalTests >= currentLevelData.minTests) {
      const correctRate = Math.round((currentPracticeRecords.correct / totalTests) * 100);
      if (correctRate > currentLevelData.best) {
        const newUserProgress = [...userProgress];
        newUserProgress[currentLevel].best = correctRate;
        setUserProgress(newUserProgress);
      }

      if (correctRate >= 70) {
        const nextLevel = currentLevel + 1;
        if (nextLevel <= userProgress.length - 1 && !userProgress[nextLevel].unlocked) {
          const newUserProgress = [...userProgress];
          newUserProgress[nextLevel].unlocked = true;
          setUserProgress(newUserProgress);
          toast.success(`🎉 Level ${nextLevel + 1} unlocked!`);
        }
      }

      const newUserProgress = [...userProgress];
      const currentStars = newUserProgress[currentLevel].stars;
      if (correctRate >= 90 && currentStars < 3) newUserProgress[currentLevel].stars = 3;
      else if (correctRate >= 80 && currentStars < 2) newUserProgress[currentLevel].stars = 2;
      else if (correctRate >= 70 && currentStars < 1) newUserProgress[currentLevel].stars = 1;

      if (newUserProgress[currentLevel].stars !== currentStars) {
        setUserProgress(newUserProgress);
      }
    }
  };
  useEffect(unlockLevel, [currentPracticeRecords]);

  const [currentNote, setCurrentNote] = useState<string>('');
  const [disabledNotes, setDisabledNotes] = useState<string[]>([]);
  const [gameState, setGameState] = useState<'end' | 'start' | 'playing' | 'paused'>('end');
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [isAdvance, setIsAdvance] = useState<'No' | 'Ready' | 'Next' | 'Now'>('No');

  const drone = getDroneInstance();

  const currentNotes = useMemo(() => {
    return degrees.map((note, index) => ({ ...note, enable: DEGREES_MAP['LEVEL_' + (currentLevel + 1)][index] }));
  }, [currentLevel]);

  useEffect(() => {
    handleGameLogic({
      isAdvance,
      isHandfree,
      gameState: gameState === 'playing' ? 'playing' : 'stopped',
      bpm,
      currentNote,
      rootNote,
      possibleNotesInRange,
      setCurrentNote,
      playNote,
      setDisabledNotes,
      setIsAdvance,
    } );
  }, [isAdvance, gameState, isHandfree]);

  useEffect(() => {
    if (gameState == 'start') {
      Tone.getTransport().stop();
      Tone.getTransport().position = 0;
      Tone.getTransport().cancel();
      setDisabledNotes([]);
      drone.start();
      Tone.getTransport().start();
      setGameState('playing');
    }
  }, [gameState, currentNote]);

  useEffect(() => () => { endGame(); }, []);

  const filteredNotes = useMemo(() => currentNotes.filter((note) => note.enable), [currentNotes]);

  const possibleNotesInRange = useMemo(() => {
    return getPossibleNotesInRange(rootNote, range, currentNotes);
  }, [rootNote, range, currentNotes]);

  useEffect(() => {
    const newNote = getNextNote(possibleNotesInRange, currentNote);
    setCurrentNote(newNote || '');
    if (gameState === 'playing') {
      playNote();
    }
  }, [possibleNotesInRange]);

  useEffect(() => {
    if (gameState === 'playing') {
      playNote();
    } else if (gameState === 'end') {
      setDisabledNotes([]);
      setCurrentPracticeRecords({ total: 0, correct: 0 });
    }
  }, [gameState]);

  const startGame = () => setGameState('start');

  const playNote = (note: string | null = null, delay = 0.05, time = 1) => {
    const noteToPlay = note ?? currentNote;
    if (playNoteTimeoutRef.current) clearTimeout(playNoteTimeoutRef.current);
    playNotes(noteToPlay, delay, bpm / time);
    setIsPlayingSound(true);
    playNoteTimeoutRef.current = setTimeout(() => {
      setIsPlayingSound(false);
      playNoteTimeoutRef.current = null;
    }, (60 / (bpm / time)) * 1000);
  };

  useEffect(() => {
    if (!activeNote) return;
    handleNoteGuess(
      activeNote,
      currentNote,
      rootNote,
      disabledNotes,
      setDisabledNotes ,
      isAdvance,
      setIsAdvance,
      updatePracticeRecords,
      playNote,
      setActiveNote,
      autoAdvance
    );
  }, [activeNote]);

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
    bpm,
    isAdvance,
    setIsAdvance,
    setActiveNote,
    currentPracticeRecords,
    setCurrentPracticeRecords,
    startGame,
    playNote,
    endGame,
    setGameState,
    userProgress,
    currentLevel,
    setCurrentLevel,
    resetUserProgress,
    updateLevel,
    useSolfege,
    isHandfree,
    isPlayingSound,
  } as const;
};

export default useChallengeTrainer;
