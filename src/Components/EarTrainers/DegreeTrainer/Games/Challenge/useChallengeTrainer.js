import { useState, useEffect, useMemo } from 'react';
import * as Tone from 'tone';
import { degrees, initialUserProgress } from '@components/EarTrainers/DegreeTrainer/Constants';
import { getDroneInstance, playNotes,preloadAudio } from '@utils/ToneInstance';
import toast from 'react-hot-toast';
import { useLocalStorage } from '@uidotdev/usehooks';
import { generateRandomNoteBasedOnRoot, isCorrect, calculateDegree, getPossibleNotesInRange } from '@utils/GameLogics';
const useChallengeTrainer = (settings) => {
  const {
    isHandfree,
    mode,
    practice: {
      bpm,
      rootNote,
      range,
      repeatWhenAdvance
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


  // const currentLevelData = userProgress[currentLevel.level - 1];
  // if (updatedCurrentPracticeRecord.total >= currentLevelData.minTests) {
  //   const correctRate = Math.round((updatedCurrentPracticeRecord.correct / updatedCurrentPracticeRecord.total) * 100);
  //   if (correctRate > currentLevelData.best) {
  //     const newUserProgress = [...userProgress];
  //     newUserProgress[currentLevel.level - 1].best = correctRate;
  //     setUserProgress(newUserProgress);
  //   }
  // }


  const [currentNote, setCurrentNote] = useState("");
  const [disabledNotes, setDisabledNotes] = useState([]);
  const [gameState, setGameState] = useState('end');
  const [activeNote, setActiveNote] = useState(null);
  const [isAdvance, setIsAdvance] = useState(false);

  const drone = getDroneInstance();


  const currentNotes = useMemo(() => {
    return degrees.map((note, index) => ({
      ...note,
      enable: currentLevel.degrees[index],
    }));
  }, [currentLevel]);
  useEffect(() => {
    if (isAdvance) {
      if (repeatWhenAdvance) {
        const timer = setTimeout(() => {
          const nextNote = generateRandomNoteBasedOnRoot(possibleNotesInRange, currentNote);
          setCurrentNote(nextNote);
          playNote(nextNote);
          setIsAdvance(false);
        }, (60 / bpm) * 2000);
        return () => clearTimeout(timer);
      }
      else {
        const timer = setTimeout(() => {
          const nextNote = generateRandomNoteBasedOnRoot(possibleNotesInRange, currentNote);
          setCurrentNote(nextNote);
          playNote(nextNote);
          setIsAdvance(false);
        }, (60 / bpm) * 1000);
        return () => clearTimeout(timer);
      }
    } else if (isHandfree && gameState == 'playing') {
      const degree = calculateDegree(Tone.Frequency(currentNote).toMidi(), rootNote);
      console.log(degree)
      const player = preloadAudio(degree);
      if (repeatWhenAdvance) {
        const timer = setTimeout(() => {
          if (player.loaded) {
            player.start();
          }
          setTimeout(() => {
            setIsAdvance(true); // Set to advance
            playNote(currentNote); // Play the note
          }, 1000); // Adjust delay as needed
        }, (60 / bpm) * 2000);
        return () => clearTimeout(timer);
      }
      else {
        const timer = setTimeout(() => {
          if (player.loaded) {
            player.start();
          }
          setIsAdvance(true); // Set to advance
        }, (60 / bpm) * 2000);
        return () => clearTimeout(timer);
      }
    }
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
    handleNoteGuess(activeNote);
  }, [activeNote]);
  const handleNoteGuess = (guessedNote) => {
    const correct = isCorrect(guessedNote, currentNote);
    const guessedDegree = calculateDegree(guessedNote, rootNote);
    if (correct) {
      setDisabledNotes([]);
      updatePracticeRecords(guessedDegree, correct);
      if (repeatWhenAdvance) {
        playNote(currentNote);
      }
      setIsAdvance(true);
    } else {
      if (!disabledNotes.includes(guessedNote)) {
        setDisabledNotes((prev) => [...prev, guessedNote]);
        updatePracticeRecords(guessedDegree, correct);
      }
      playNote(guessedNote);
    }
    setActiveNote(null);
  };



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
