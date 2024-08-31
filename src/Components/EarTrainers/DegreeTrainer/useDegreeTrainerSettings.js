import { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { degrees } from '@utils/Constants';

const useDegreeTrainerSettings = () => {
  const [bpm, setBpm] = useState(40);
  const [droneVolume, setDroneVolume] = useState(0.3);
  const [pianoVolume, setPianoVolume] = useState(1.0);
  const [rootNote, setRootNote] = useState(Tone.Frequency('C3').toMidi());
  const [range, setRange] = useState([Tone.Frequency('C3').toMidi(), Tone.Frequency('C4').toMidi()]);
  const [practiceRecords, setPracticeRecords] = useState({});
  const [currentNotes, setCurrentNotes] = useState(degrees);

  useEffect(() => {
    const storedRecords = JSON.parse(localStorage.getItem('degreeTrainerRecords')) || {};
    setPracticeRecords(storedRecords);
  }, []);

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
    }
  }, []);

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
    setBpm,
    setDroneVolume,
    setPianoVolume,
    setRootNote,
    setRange,
    setPracticeRecords,
    updatePracticeRecords,
    setCurrentNotes
  };
};

export default useDegreeTrainerSettings;