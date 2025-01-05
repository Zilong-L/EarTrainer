import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect, useState } from 'react';
import { getDroneInstance } from '@utils/ToneInstance';
import { Sampler } from 'tone';

const usePracticeSettings = () => {
  const [bpm, setBpm] = useLocalStorage('degreeTrainerBPM', 60);
  const [rootNote, setRootNote] = useLocalStorage('degreeTrainerRootNote', 'C4');
  const [range, setRange] = useState([48,72])
  const [autoAdvance, setAutoAdvance] = useLocalStorage('degreeTrainerAutoAdvance', true);

  useEffect(() => {
    localStorage.setItem('degreeTrainerRange', JSON.stringify(range));
  }, [range]);
  useEffect(() => {
    getDroneInstance().updateRoot(rootNote);
  }, [rootNote]);

  return {
    bpm,
    setBpm,
    rootNote,
    setRootNote,
    range,
    setRange,
    autoAdvance,
    setAutoAdvance
  };
};

export default usePracticeSettings;
