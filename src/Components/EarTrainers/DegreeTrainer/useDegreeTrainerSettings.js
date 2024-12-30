import { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { degrees, initialUserProgress } from '@components/EarTrainers/DegreeTrainer/Constants';
import { getDroneInstance, getSamplerInstance } from '@utils/ToneInstance';
import toast from 'react-hot-toast';
import {useLocalStorage} from '@uidotdev/usehooks';

const useDegreeTrainerSettings = () => {
  const [mode, setMode] = useLocalStorage('degreeTrainerMode', 'free');
  const [currentLevel, setCurrentLevel] = useState( initialUserProgress[0]);

  const [customNotes, setCustomNotes] = useState(degrees);

  const [isHandfree, setIsHandfree] = useLocalStorage('degreeTrainerIsHandfree', false);
  const [isStatOpen, setIsStatOpen] = useLocalStorage('degreeTrainerIsStatOpen', true);
  const [repeatWhenAdvance, setRepeatWhenAdvance] = useLocalStorage('degreeTrainerRepeatWhenAdvance', true);

  const [bpm, setBpm] = useLocalStorage('degreeTrainerBpm', 40);
  const [droneVolume, setDroneVolume] = useLocalStorage('degreeTrainerDroneVolume', 0.5);
  const [pianoVolume, setPianoVolume] = useLocalStorage('degreeTrainerPianoVolume', 1.0);

  const [range, setRange] = useState([Tone.Frequency('C3').toMidi(), Tone.Frequency('C4').toMidi()]);
  const [rootNote, setRootNote] = useState('C3');

  const [selectedInstrument, setSelectedInstrument] = useLocalStorage('degreeTrainerSelectedInstrument', 'bass-electric');
  const [selectedQuality, setSelectedQuality] = useLocalStorage('degreeTrainerSelectedQuality', 'low');

  const [practiceRecords, setPracticeRecords] = useLocalStorage('degreeTrainerPracticeRecords', {});
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

  const [progressVersion, setProgressVersion] = useLocalStorage('degreeTrainerProgressVersion', 0);
  const [userProgress, setUserProgress] = useLocalStorage('degreeTrainerUserProgress', initialUserProgress);

  // Run migration once when component mounts
  useEffect(() => {
    if (progressVersion === 0) {
      const migratedProgress = migrateUserProgress(userProgress);
      setUserProgress(migratedProgress);
      setProgressVersion(1);
    }
  }, [progressVersion, setProgressVersion, setUserProgress, userProgress]);

  const [currentPracticeRecords, setCurrentPracticeRecords] = useState({ total: 0, correct: 0 });
  

  const drone = getDroneInstance();
  const samplerInstance = getSamplerInstance();
  const [isLoadingInstrument, setIsLoadingInstrument] = useState(false);

  useEffect(() => {
    const loadInstrument = async () => {
      setIsLoadingInstrument(true);
      await samplerInstance.changeSampler(selectedInstrument, selectedQuality);
      setIsLoadingInstrument(false);
    };
    loadInstrument();
  }, [selectedInstrument, selectedQuality]);

  useEffect(() => {
    drone.updateRoot(rootNote);
  }, [rootNote]);
  useEffect(() => {
    drone.setVolume(droneVolume);
    samplerInstance.setVolume(pianoVolume);
  }, [droneVolume, pianoVolume]);




  const unlockLevel = () => {
    if (mode === 'free') {
      return;
    }

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
  }
  useEffect(unlockLevel, [currentPracticeRecords])

  const updatePracticeRecords = (degree, isCorrect) => {
    // Update both practiceRecords and currentPracticeRecord
    setPracticeRecords((prevRecords) => {
      const updatedRecords = {
        ...prevRecords,
        [degree]: {
          total: (prevRecords[degree]?.total || 0) + 1,
          correct: (prevRecords[degree]?.correct || 0) + (isCorrect ? 1 : 0),
        },
      };

      // Update current practice record based on current degree
      const updatedCurrentPracticeRecord = {
        total: (currentPracticeRecords?.total || 0) + 1,
        correct: (currentPracticeRecords?.correct || 0) + (isCorrect ? 1 : 0),
      };

      // Set current practice record in state
      setCurrentPracticeRecords(updatedCurrentPracticeRecord);
      const currentLevelData = userProgress[currentLevel.level - 1];
      if (updatedCurrentPracticeRecord.total >= currentLevelData.minTests) {
        const correctRate = Math.round((updatedCurrentPracticeRecord.correct / updatedCurrentPracticeRecord.total) * 100);
        if (correctRate > currentLevelData.best) {
          const newUserProgress = [...userProgress];
          newUserProgress[currentLevel.level - 1].best = correctRate;
          setUserProgress(newUserProgress);
        }
      }

      // Return both updated records
      return updatedRecords;
    });
  };


  return {
    bpm,
    droneVolume,
    pianoVolume,
    rootNote,
    range,
    practiceRecords,

    isHandfree,
    isStatOpen,
    mode,
    userProgress,
    currentLevel,
    repeatWhenAdvance,
    selectedQuality,
    isLoadingInstrument,
    customNotes,
    setIsLoadingInstrument,
    setSelectedQuality,
    setRepeatWhenAdvance,
    setCurrentLevel,
    setUserProgress,
    resetUserProgress,
    setMode,
    setBpm,
    setCustomNotes,
    setDroneVolume,
    setPianoVolume,
    setRootNote,
    setRange,
    currentPracticeRecords,
    setCurrentPracticeRecords,
    setPracticeRecords,
    updatePracticeRecords,
    setIsHandfree,
    setIsStatOpen,
    selectedInstrument,
    setSelectedInstrument
  };
};

export default useDegreeTrainerSettings;
