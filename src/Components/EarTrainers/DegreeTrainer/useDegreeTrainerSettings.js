import { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { degrees,initialUserProgress } from '@components/EarTrainers/DegreeTrainer/Constants';

import {getDroneInstance,getPianoInstance,} from '@utils/ToneInstance';
const useDegreeTrainerSettings = () => {
  const [mode, setMode] = useState('free'); // 
  const [currentLevel , setCurrentLevel ] = useState({});
  const [bpm, setBpm] = useState(40);
  const [droneVolume, setDroneVolume] = useState(0.3);
  const [pianoVolume, setPianoVolume] = useState(1.0);
  const [rootNote, setRootNote] = useState(Tone.Frequency('C3').toMidi());
  const [range, setRange] = useState([Tone.Frequency('C3').toMidi(), Tone.Frequency('C4').toMidi()]);
  const [practiceRecords, setPracticeRecords] = useState({});
  const [userProgress, setUserProgress] = useState(initialUserProgress);
  const [currentNotes, setCurrentNotes] = useState(degrees);
  const [isHandfree, setIsHandfree] = useState(false);
  const [isStatOpen, setIsStatOpen] = useState(true);
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
    console.log()
    if(currentLevel.degrees){
      setCurrentNotesBasedOnBooleanArray(currentLevel.degrees)
    }
  },[currentLevel,mode])
  useEffect(() => {
    console.log(userProgress)

    for(let i = userProgress.length - 1; i >= 0; i--){
      if(userProgress[i].unlocked){
        setCurrentLevel(userProgress[i])
        break
      }
    }
  }, [userProgress]);
  // 新增 useEffect 从 localStorage 加载设置
  useEffect(() => {
    const storedSettings = JSON.parse(localStorage.getItem('degreeTrainerSettings'));
    console.log(storedSettings)
    if (storedSettings) {
      setBpm(storedSettings.bpm || 40);
      setDroneVolume(storedSettings.droneVolume || 0.3);
      setPianoVolume(storedSettings.pianoVolume || 1.0);
      setRootNote(storedSettings.rootNote || Tone.Frequency('C3').toMidi());
      setRange(storedSettings.range || [Tone.Frequency('C3').toMidi(), Tone.Frequency('C4').toMidi()]);
      setCurrentNotes(storedSettings.currentNotes || degrees);
      setIsStatOpen(storedSettings.isStatOpen );
      setUserProgress(storedSettings.userProgress || initialUserProgress);
      
    }
  }, []);
  function setCurrentNotesBasedOnBooleanArray(boolArray) {
    console.log('hi')
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
      userProgress
    };
    localStorage.setItem('degreeTrainerSettings', JSON.stringify(settings));
  }

  const updatePracticeRecords = (degree, isCorrect) => {
    setPracticeRecords((prevRecords) => {
      const updatedRecords = {
        ...prevRecords,
        [degree]: {
          total: (prevRecords[degree]?.total || 0) + 1,
          correct: (prevRecords[degree]?.correct || 0) + (isCorrect ? 1 : 0),
        },
      };
      localStorage.setItem('degreeTrainerRecords', JSON.stringify(updatedRecords));
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
    setCurrentLevel,
    setUserProgress,
    setMode,
    setBpm,
    setDroneVolume,
    setPianoVolume,
    setRootNote,
    setRange,
    setPracticeRecords,
    updatePracticeRecords,
    setCurrentNotes,
    setIsHandfree,
    saveSettingsToLocalStorage,
    setIsStatOpen
  };
};

export default useDegreeTrainerSettings;