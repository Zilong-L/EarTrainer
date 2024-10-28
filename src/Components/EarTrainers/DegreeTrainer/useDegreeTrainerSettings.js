import { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { degrees,initialUserProgress } from '@components/EarTrainers/DegreeTrainer/Constants';

import {getDroneInstance,getPianoInstance,} from '@utils/ToneInstance';
import toast from 'react-hot-toast';
const useDegreeTrainerSettings = () => {
  const [mode, setMode] = useState('free'); // 
  const [currentLevel , setCurrentLevel ] = useState(initialUserProgress[0]);
  const [bpm, setBpm] = useState(40);
  const [droneVolume, setDroneVolume] = useState(0.3);
  const [pianoVolume, setPianoVolume] = useState(1.0);
  const [rootNote, setRootNote] = useState(Tone.Frequency('C3').toMidi());
  const [range, setRange] = useState([Tone.Frequency('C3').toMidi(), Tone.Frequency('C4').toMidi()]);
  const [currentPracticeRecords, setCurrentPracticeRecords] = useState({total:0,correct:0});
  const [practiceRecords, setPracticeRecords] = useState({});
  const [userProgress, setUserProgress] = useState(initialUserProgress);
  const [currentNotes, setCurrentNotes] = useState(degrees);
  const [isHandfree, setIsHandfree] = useState(false);
  const [isStatOpen, setIsStatOpen] = useState(true);
  const [repeatWhenAdvance, setRepeatWhenAdvance] = useState(true);
  const drone = getDroneInstance();

  const piano = getPianoInstance();
  useEffect(() => {
    const storedRecords = JSON.parse(localStorage.getItem('degreeTrainerRecords')) || {};
    setPracticeRecords(storedRecords);
  }, []);
  useEffect(() => {
    drone.updateRoot(rootNote);
  }, [ rootNote]);
  useEffect(() => {
    drone.setVolume(droneVolume);
    piano.setVolume(pianoVolume);
  }, [droneVolume, pianoVolume]);
  useEffect(() => {
    if(mode == 'free'){
      return
    }
    if(currentLevel.degrees){
      setCurrentNotesBasedOnBooleanArray(currentLevel.degrees)
    }
  },[currentLevel,mode])
  
  // 新增 useEffect 从 localStorage 加载设置
  useEffect(() => {
    const storedSettings = JSON.parse(localStorage.getItem('degreeTrainerSettings'));
    if (storedSettings) {
      setBpm(storedSettings.bpm || 40);
      setDroneVolume(storedSettings.droneVolume || 0.3);
      setPianoVolume(storedSettings.pianoVolume || 1.0);
      setRootNote(storedSettings.rootNote || Tone.Frequency('C3').toMidi());
      setRange(storedSettings.range || [Tone.Frequency('C3').toMidi(), Tone.Frequency('C4').toMidi()]);
      setCurrentNotes(storedSettings.currentNotes || degrees);
      setIsStatOpen(storedSettings.isStatOpen );
      setUserProgress(storedSettings.userProgress || initialUserProgress);
      setCurrentLevel(storedSettings.currentLevel || {
        level: 1,
        degrees: [true, false, false, false, false, false, false, false, false, false, false, true], // 1 7
        unlocked: true,
        best: 0,
        notes: "1 7",
      });
      setRepeatWhenAdvance(storedSettings.repeatWhenAdvance || true);
    }
  }, []);
  function setCurrentNotesBasedOnBooleanArray(boolArray) {
    const newNotes = currentNotes.map((note, index) => {
      return {
        ...note,
        enable: boolArray[index],
      };
    });
    setCurrentNotes(newNotes);
  }
  function saveSettingsToLocalStorage() {
    const settings = {
      bpm,
      droneVolume,
      pianoVolume,
      rootNote,
      range,
      currentNotes,
      isStatOpen,
      userProgress,
      currentLevel,
      repeatWhenAdvance,
    };
    localStorage.setItem('degreeTrainerSettings', JSON.stringify(settings));
  }

  const unlockLevel = () => {
    if(mode=='free'){
      return;
    }
    if(Math.round(currentPracticeRecords.correct/currentPracticeRecords.total).toFixed(2)*100 >= 90 && currentPracticeRecords.total >= 30){
      const nextLevel = currentLevel.level+1;
      if(userProgress[nextLevel-1].unlocked){
        return;
      }

      const newUserProgress = [...userProgress];
      newUserProgress[nextLevel-1].unlocked = true;
      setUserProgress(newUserProgress);
      toast.success(`🎉 Level ${nextLevel} unlocked!`);
      saveSettingsToLocalStorage()
    }
  }
  useEffect(unlockLevel,[currentPracticeRecords])

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
      if(updatedCurrentPracticeRecord.total >= 30 && Math.round(updatedCurrentPracticeRecord.correct/updatedCurrentPracticeRecord.total).toFixed(2)*100 > userProgress[currentLevel.level-1].best){
        const newUserProgress = [...userProgress];
        newUserProgress[currentLevel.level-1].best = Math.round(updatedCurrentPracticeRecord.correct/updatedCurrentPracticeRecord.total).toFixed(2)*100;
        setUserProgress(newUserProgress);
        saveSettingsToLocalStorage();
      }
      // Save updated practiceRecords to localStorage
      localStorage.setItem('degreeTrainerRecords', JSON.stringify(updatedRecords));
  
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
    currentNotes,
    isHandfree,
    isStatOpen,
    mode,
    userProgress,
    currentLevel,
    repeatWhenAdvance,
    setRepeatWhenAdvance,
    setCurrentLevel,
    setUserProgress,
    setMode,
    setBpm,
    setDroneVolume,
    setPianoVolume,
    setRootNote,
    setRange,
    currentPracticeRecords,
    setCurrentPracticeRecords,
    setPracticeRecords,
    updatePracticeRecords,
    setCurrentNotes,
    setIsHandfree,
    saveSettingsToLocalStorage,
    setIsStatOpen
  };
};

export default useDegreeTrainerSettings;