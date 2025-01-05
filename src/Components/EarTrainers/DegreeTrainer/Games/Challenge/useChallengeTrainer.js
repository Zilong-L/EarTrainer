import { useState, useEffect, useMemo } from 'react';
import * as Tone from 'tone';
import { degrees, initialUserProgress } from '@components/EarTrainers/DegreeTrainer/Constants';
import { getDroneInstance, playNotes } from '@utils/ToneInstance';
import toast from 'react-hot-toast';
import { useLocalStorage } from '@uidotdev/usehooks';
import { generateRandomNoteBasedOnRoot,    getPossibleNotesInRange,handleNoteGuess,handleGameLogic } from '@utils/GameLogics';
const useChallengeTrainer = (settings) => {
  const {
    isHandfree,
    mode,
    practice: {
      bpm,
      rootNote,
      range,
      autoAdvance
    },
    stats: {
      updatePracticeRecords,
      currentPracticeRecords,
      setCurrentPracticeRecords
    }
  } = settings;

  const [currentLevel, setCurrentLevel] = useState(initialUserProgress[0]);
  const [userProgress, setUserProgress] = useLocalStorage('degreeTrainerUserProgress', initialUserProgress);
  
  const [progressVersion, setProgressVersion] = useLocalStorage('degreeTrainerProgressVersion', 0);

  const updateLevel = (index) => {
    setCurrentLevel(userProgress[index]);
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
    setCurrentLevel(initialUserProgress[0]);
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
    if(mode !== 'challenge') return;
    const currentLevelData = userProgress[currentLevel.level - 1];
    const totalTests = currentPracticeRecords.total;

    // Only proceed if minimum tests completed
    if (totalTests >= currentLevelData.minTests) {
      const correctRate = Math.round((currentPracticeRecords.correct / totalTests) * 100);

      // Update best score if improved
      if (correctRate > currentLevelData.best) {
        const newUserProgress = [...userProgress];
        newUserProgress[currentLevel.level - 1].best = correctRate;
        setUserProgress(newUserProgress);
      }

      // Unlock next level if 1 star is achieved (70% accuracy)
      if (correctRate >= 70) {
        const nextLevel = currentLevel.level + 1;
        if (nextLevel <= userProgress.length && !userProgress[nextLevel - 1].unlocked) {
          const newUserProgress = [...userProgress];
          newUserProgress[nextLevel - 1].unlocked = true;
          setUserProgress(newUserProgress);
          toast.success(`🎉 Level ${nextLevel} unlocked!`);
        }
      }

      // Update stars for current level only if new rating is higher
      const newUserProgress = [...userProgress];
      const currentStars = newUserProgress[currentLevel.level - 1].stars;

      if (correctRate >= 90 && currentStars < 3) {
        newUserProgress[currentLevel.level - 1].stars = 3;
      } else if (correctRate >= 80 && currentStars < 2) {
        newUserProgress[currentLevel.level - 1].stars = 2;
      } else if (correctRate >= 70 && currentStars < 1) {
        newUserProgress[currentLevel.level - 1].stars = 1;
      }

      // Only update if stars actually changed
      if (newUserProgress[currentLevel.level - 1].stars !== currentStars) {
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
    return degrees.map((note, index) => ({
      ...note,
      enable: currentLevel.degrees[index],
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
      console.log('running')
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
    const newNote = generateRandomNoteBasedOnRoot(possibleNotesInRange, currentNote);
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

  const playNote = (note = null, delay = 0.05) => {
    if (!note) {
      note = currentNote;
    }
    playNotes(note, delay, bpm);
  };


  useEffect(() => {
    if (!activeNote) return;
    handleNoteGuess(activeNote, currentNote, rootNote, disabledNotes,setDisabledNotes, isAdvance,setIsAdvance, updatePracticeRecords, playNote, setActiveNote,autoAdvance);
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
    setIsAdvance ,
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
    updateLevel

    
  };
};

export default useChallengeTrainer;
