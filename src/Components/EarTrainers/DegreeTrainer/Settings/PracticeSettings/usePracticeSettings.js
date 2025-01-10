import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect, useState } from 'react';
import { getDroneInstance } from '@utils/ToneInstance';
import { Sampler } from 'tone';

const usePracticeSettings = () => {
  const [bpm, setBpm] = useLocalStorage('degreeTrainerBPM', 60);
  const [rootNote, setRootNote] = useLocalStorage('degreeTrainerRootNote', 'C2');
  const [range, _setRange] = useState([36,48])
  const [autoAdvance, setAutoAdvance] = useLocalStorage('degreeTrainerAutoAdvance', true);
  const [useSolfege, setUseSolfege] = useLocalStorage('degreeTrainerUseSolfege', false);

  const setRange = (newRange) => {
    _setRange(newRange);
    localStorage.setItem('degreeTrainerRange', JSON.stringify(newRange));
  }
  useEffect(() => {
    const storedRange = localStorage.getItem('degreeTrainerRange');
    if (storedRange) {
      _setRange(JSON.parse(storedRange));
    }
  }, []);
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
    setAutoAdvance,
    useSolfege,
    setUseSolfege,
    useSolfege,
    setUseSolfege
  };
};

export default usePracticeSettings;
