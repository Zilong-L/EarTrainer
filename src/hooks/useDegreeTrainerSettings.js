import { useState, useEffect } from 'react';
import * as Tone from 'tone';

const useDegreeTrainerSettings = () => {
  const [bpm, setBpm] = useState(40);
  const [droneVolume, setDroneVolume] = useState(0.3);
  const [pianoVolume, setPianoVolume] = useState(1.0);
  const [rootNote, setRootNote] = useState(Tone.Frequency('C3').toMidi());
  const [range, setRange] = useState([Tone.Frequency('C3').toMidi(), Tone.Frequency('C4').toMidi()]);
  const [practiceRecords, setPracticeRecords] = useState({});

  useEffect(() => {
    const storedRecords = JSON.parse(localStorage.getItem('degreeTrainerRecords')) || {};
    setPracticeRecords(storedRecords);
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
    setBpm,
    setDroneVolume,
    setPianoVolume,
    setRootNote,
    setRange,
    setPracticeRecords,
    updatePracticeRecords,
  };
};

export default useDegreeTrainerSettings;