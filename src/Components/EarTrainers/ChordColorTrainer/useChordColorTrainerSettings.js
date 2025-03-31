import { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { getDroneInstance } from '@utils/ToneInstance';
import { chordPreset } from "@components/EarTrainers/ChordColorTrainer/Constants";
import { degrees, defaultDegreeChordTypes, CHORD_TYPES } from "@components/EarTrainers/ChordColorTrainer/Constants";
// 定义和弦类型常量

const useChordColorTrainerSettings = () => {
  const [bpm, setBpm] = useState(40);
  const [droneVolume, setDroneVolume] = useState(0.3);
  const [pianoVolume, setPianoVolume] = useState(1.0);
  const [rootNote, setRootNote] = useState(Tone.Frequency('C3').toMidi());
  const [range, setRange] = useState([Tone.Frequency('C3').toNote(), Tone.Frequency('C4').toNote()]);
  const [practiceRecords, setPracticeRecords] = useState({});
  const [currentNotes, setCurrentNotes] = useState(degrees);
  const [preset, setPreset] = useState('major');
  const [customPresets, setCustomPresets] = useState({});
  const [muteDrone, setMuteDrone] = useState(false);
  const [isStatOpen, setIsStatOpen] = useState(true);

  const drone = getDroneInstance();
  // 存储每个级数对应的和弦类型数组
  const [degreeChordTypes, setDegreeChordTypes] = useState(defaultDegreeChordTypes);



  useEffect(() => {
    const storedRecords = JSON.parse(localStorage.getItem('ChordColorTrainerRecords')) || {};
    setPracticeRecords(storedRecords);
  }, []);



  // 新增 useEffect 从 localStorage 加载 degreeChordTypes 设置
  useEffect(() => {
    const storedSettings = JSON.parse(localStorage.getItem('ChordColorTrainerSettings'));
    if (storedSettings) {
      setBpm(storedSettings.bpm || 40);
      setDroneVolume(storedSettings.droneVolume || 0.3);
      setPianoVolume(storedSettings.pianoVolume || 1.0);
      setRootNote(storedSettings.rootNote || Tone.Frequency('C3').toMidi());
      setRange(storedSettings.range || [Tone.Frequency('C3').toNote(), Tone.Frequency('C4').toNote()]);
      setCurrentNotes(storedSettings.currentNotes || degrees);
      setPreset(storedSettings.preset || 'major');
      setCustomPresets(storedSettings.customPresets || {});
      setMuteDrone(storedSettings.muteDrone || false);
      setIsStatOpen(storedSettings.isStatOpen || false);
    }
  }, []);
  useEffect(() => {
    setDegreeChordTypes(customPresets[preset] || chordPreset[preset] || defaultDegreeChordTypes);
    console.log('runs here')
  }, [preset])
  // useEffect(() => {
  //   if(muteDrone){
  //     drone.stop()
  //   }else{
  //     drone.start()
  //   }
  // },[muteDrone])

  const updatePracticeRecords = (degree, isCorrect) => {
    setPracticeRecords((prevRecords) => {
      const updatedRecords = {
        ...prevRecords,
        [degree]: {
          total: (prevRecords[degree]?.total || 0) + 1,
          correct: (prevRecords[degree]?.correct || 0) + (isCorrect ? 1 : 0),
        },
      };
      localStorage.setItem('ChordColorTrainerRecords', JSON.stringify(updatedRecords));
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
    setBpm,
    setDroneVolume,
    setPianoVolume,
    setRootNote,
    setRange,
    setPracticeRecords,
    updatePracticeRecords,
    setCurrentNotes,
    degreeChordTypes,
    setDegreeChordTypes,
    CHORD_TYPES,
    preset,
    setPreset,
    customPresets,
    setCustomPresets,
    muteDrone,
    setMuteDrone,
    isStatOpen,
    setIsStatOpen
  };
};

export default useChordColorTrainerSettings;