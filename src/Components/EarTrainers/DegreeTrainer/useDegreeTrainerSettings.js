import { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { degrees, initialUserProgress } from '@components/EarTrainers/DegreeTrainer/Constants';
import { getDroneInstance, getSamplerInstance } from '@utils/ToneInstance';
import toast from 'react-hot-toast';
import {useLocalStorage} from '@uidotdev/usehooks';

const useDegreeTrainerSettings = () => {
  const [mode, setMode] = useLocalStorage('degreeTrainerMode', 'free');
  const [currentLevel, setCurrentLevel] = useLocalStorage('degreeTrainerCurrentLevel', initialUserProgress[0]);
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
  const [userProgress, setUserProgress] = useLocalStorage('degreeTrainerUserProgress', initialUserProgress);

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
    if (mode == 'free') {
      return;
    }
    if (Math.round(currentPracticeRecords.correct / currentPracticeRecords.total.toFixed(2) * 100) >= 90 && currentPracticeRecords.total >= 30) {
      const nextLevel = currentLevel.level + 1;
      if (userProgress[nextLevel - 1].unlocked) {
        return;
      }

      const newUserProgress = [...userProgress];
      newUserProgress[nextLevel - 1].unlocked = true;
      setUserProgress(newUserProgress);
      toast.success(`🎉 Level ${nextLevel} unlocked!`);
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
      if (updatedCurrentPracticeRecord.total >= 30 && Math.round(updatedCurrentPracticeRecord.correct / updatedCurrentPracticeRecord.total.toFixed(2) * 100) > userProgress[currentLevel.level - 1].best) {
        const newUserProgress = [...userProgress];
        newUserProgress[currentLevel.level - 1].best = Math.round(updatedCurrentPracticeRecord.correct / updatedCurrentPracticeRecord.total.toFixed(2) * 100);
        setUserProgress(newUserProgress);
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
