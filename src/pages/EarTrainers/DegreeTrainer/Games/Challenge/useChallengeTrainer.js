import { useState, useEffect, useMemo, useRef } from 'react';
import * as Tone from 'tone';
import { degrees, initialUserProgress, DEGREES_MAP } from '@EarTrainers/DegreeTrainer/Constants';
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
    practice: {
      bpm,
      rootNote,
      range,
      autoAdvance,
      useSolfege
    },
    stats: {
      updatePracticeRecords,
      currentPracticeRecords,
      setCurrentPracticeRecords
    }
  } = useDegreeTrainerSettings();

  const [currentLevel, setCurrentLevel] = useLocalStorage('degreeTrainerCurrentLevel', 1);
  const [userProgress, setUserProgress] = useLocalStorage('degreeTrainerUserProgress', initialUserProgress);

  const [progressVersion, setProgressVersion] = useLocalStorage('degreeTrainerProgressVersion', 0);
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const playNoteTimeoutRef = useRef(null);
  const updateLevel = (index) => {
    setCurrentLevel(index);
    setCurrentPracticeRecords({ total: 0, correct: 0 });
  };

  const migrateUserProgress = (oldProgress) => {
    return oldProgress.map((level, index) => {
      const newLevel = {
        ...initialUserProgress[index],
        best: level.best || 0,
        unlocked: level.unlocked || false
      };

      // Map best percentage to stars
      if (newLevel.best >= 90) {
        newLevel.stars = 3;
      } else if (newLevel.best >= 80) {
        newLevel.stars = 2;
      } else if (newLevel.best >= 70) {
        newLevel.stars = 1;
      } else {
        newLevel.stars = 0;
      }

      return newLevel;
    });
  };

  const resetUserProgress = () => {
    setUserProgress(initialUserProgress);
    setCurrentLevel(0);
  };

  // Run migration once when component mounts
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
    console.log(currentLevelData)
    // Only proceed if minimum tests completed
    if (totalTests >= currentLevelData.minTests) {
      const correctRate = Math.round((currentPracticeRecords.correct / totalTests) * 100);
      console.log(correctRate)
      // Update best score if improved
      if (correctRate > currentLevelData.best) {
        const newUserProgress = [...userProgress];
        newUserProgress[currentLevel].best = correctRate;
        setUserProgress(newUserProgress);
      }

      // Unlock next level if 1 star is achieved (70% accuracy)
      if (correctRate >= 70) {
        const nextLevel = currentLevel + 1;
        if (nextLevel <= userProgress.length && !userProgress[nextLevel].unlocked) {
          const newUserProgress = [...userProgress];
          newUserProgress[nextLevel].unlocked = true;
          setUserProgress(newUserProgress);
          toast.success(`🎉 Level ${nextLevel + 1} unlocked!`);
        }
      }

      // Update stars for current level only if new rating is higher
      const newUserProgress = [...userProgress];
      const currentStars = newUserProgress[currentLevel].stars;

      if (correctRate >= 90 && currentStars < 3) {
        newUserProgress[currentLevel].stars = 3;
      } else if (correctRate >= 80 && currentStars < 2) {
        newUserProgress[currentLevel].stars = 2;
      } else if (correctRate >= 70 && currentStars < 1) {
        newUserProgress[currentLevel].stars = 1;
      }

      // Only update if stars actually changed
      if (newUserProgress[currentLevel].stars !== currentStars) {
        setUserProgress(newUserProgress);
      }
    }
  };
  useEffect(unlockLevel, [currentPracticeRecords]);

  const [currentNote, setCurrentNote] = useState("");
  const [disabledNotes, setDisabledNotes] = useState([]);
  const [gameState, setGameState] = useState('end');
  const [activeNote, setActiveNote] = useState(null);
  const [isAdvance, setIsAdvance] = useState('No');

  const drone = getDroneInstance();


  const currentNotes = useMemo(() => {
    console.log('LEVEL_' + (currentLevel + 1))
    return degrees.map((note, index) => ({
      ...note,
      enable: DEGREES_MAP['LEVEL_' + (currentLevel + 1)][index],
    }));
  }, [currentLevel]);
  useEffect(() => {
    handleGameLogic({
      isAdvance,
      isHandfree,
      gameState,
      bpm,
      currentNote,
      rootNote,
      possibleNotesInRange,
      setCurrentNote,
      playNote,
      setDisabledNotes,
      setIsAdvance,
      useSolfege
    });
  }
    , [isAdvance, gameState, isHandfree]);

  useEffect(() => {
    if (gameState == 'start') {
      Tone.getTransport().stop();
      Tone.getTransport().position = 0;
      Tone.getTransport().cancel();
      setDisabledNotes([]);
      drone.start();
      Tone.getTransport().start();
      setGameState('playing')

    }
  }
    , [gameState, currentNote]);

  useEffect(() => {
    return () => {
      endGame();
    }
  }
    , []);
  const filteredNotes = useMemo(() => {
    return currentNotes.filter(note => note.enable);
  }, [currentNotes]);

  const possibleNotesInRange = useMemo(() => {
    return getPossibleNotesInRange(rootNote, range, currentNotes);
  }, [rootNote, range, currentNotes]);

  useEffect(() => {
    const newNote = getNextNote(possibleNotesInRange, currentNote);
    setCurrentNote(newNote);

    if (gameState === 'playing') {
      playNote();
    }
  }, [possibleNotesInRange]);

  useEffect(() => {
    if (gameState === 'playing') {
      playNote();
    }
    else if (gameState === 'end') {
      setDisabledNotes([]);
      setCurrentPracticeRecords({ total: 0, correct: 0 });
    }
  }, [gameState]);

  const startGame = () => {
    setGameState('start');
  };

  const playNote = (note = null, delay = 0.05, time = 1) => {
    if (!note) {
      note = currentNote;
    }
    // 取消之前的 timeout（如果存在）
    if (playNoteTimeoutRef.current) {
      clearTimeout(playNoteTimeoutRef.current);
    }
    playNotes(note, delay, bpm / time);
    setIsPlayingSound(true);

    playNoteTimeoutRef.current = setTimeout(() => {
      setIsPlayingSound(false);
      console.log('set false');
      playNoteTimeoutRef.current = null; // 清除引用
    }, (60 / (bpm / time)) * 1000);
  };


  useEffect(() => {
    if (!activeNote) return;
    handleNoteGuess(activeNote, currentNote, rootNote, disabledNotes, setDisabledNotes, isAdvance, setIsAdvance, updatePracticeRecords, playNote, setActiveNote, autoAdvance);
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
    isPlayingSound

  };
};

export default useChallengeTrainer;
