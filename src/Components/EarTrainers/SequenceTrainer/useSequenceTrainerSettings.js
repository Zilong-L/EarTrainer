import { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { degrees } from '@components/EarTrainers/SequenceTrainer/Constants';

const useSequenceTrainerSettings = () => {
  const [bpm, setBpm] = useState(40);
  const [droneVolume, setDroneVolume] = useState(0.3);
  const [pianoVolume, setPianoVolume] = useState(1.0);
  const [rootNote, setRootNote] = useState(Tone.Frequency('C3').toMidi());
  const [range, setRange] = useState([Tone.Frequency('C3').toMidi(), Tone.Frequency('C4').toMidi()]);
  const [practiceRecords, setPracticeRecords] = useState({});
  const [currentNotes, setCurrentNotes] = useState(degrees);
  const [sequenceLength, setSequenceLength] = useState(3);
  const [isStatOpen, setIsStatOpen] = useState(true);

  useEffect(() => {
    const storedRecords = JSON.parse(localStorage.getItem('sequenceTrainerRecords')) || {};
    setPracticeRecords(storedRecords);
  }, []);

  useEffect(() => {
    const storedSettings = JSON.parse(localStorage.getItem('sequenceTrainerSettings'));
    if (storedSettings) {
      setBpm(storedSettings.bpm || 40);
      setDroneVolume(storedSettings.droneVolume || 0.3);
      setPianoVolume(storedSettings.pianoVolume || 1.0);
      setRootNote(storedSettings.rootNote || Tone.Frequency('C3').toMidi());
      setRange(storedSettings.range || [Tone.Frequency('C3').toMidi(), Tone.Frequency('C4').toMidi()]);
      setCurrentNotes(storedSettings.currentNotes || degrees);
      setSequenceLength(storedSettings.sequenceLength || 3);
      setIsStatOpen(storedSettings.isStatOpen);
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
      localStorage.setItem('sequenceTrainerRecords', JSON.stringify(updatedRecords));
      return updatedRecords;
    });
  };

  const saveSettings = () => {
    const settings = {
      bpm,
      droneVolume,
      pianoVolume,
      rootNote,
      range,
      currentNotes,
      sequenceLength,
      isStatOpen
    };
    localStorage.setItem('sequenceTrainerSettings', JSON.stringify(settings));
  };

  return {
    bpm,
    droneVolume,
    pianoVolume,
    rootNote,
    range,
    practiceRecords,
    currentNotes,
    sequenceLength,
    isStatOpen,
    setBpm,
    setDroneVolume,
    setPianoVolume,
    setRootNote,
    setRange,
    setPracticeRecords,
    updatePracticeRecords,
    setCurrentNotes,
    setSequenceLength,
    saveSettings,
    setIsStatOpen
  };
};

export default useSequenceTrainerSettings;