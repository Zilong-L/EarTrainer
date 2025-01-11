import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect, useState } from 'react';
import { getDroneInstance } from '@utils/ToneInstance';
import { Sampler } from 'tone';
import {Note} from 'tonal';
const usePracticeSettings = () => {
  const [bpm, setBpm] = useLocalStorage('degreeTrainerBPM', 60);
  const [rootNote, setRootNote] = useLocalStorage('degreeTrainerRootNote', 'C2');
  const [range, _setRange] = useState([24,36])
  const [autoAdvance, setAutoAdvance] = useLocalStorage('degreeTrainerAutoAdvance', true);
  const [useSolfege, setUseSolfege] = useLocalStorage('degreeTrainerUseSolfege', false);
  const [autoChangeRoot, setAutoChangeRoot] = useLocalStorage('degreeTrainerAutoChangeRoot', false);
  const [changeInterval, setChangeInterval] = useLocalStorage('degreeTrainerChangeInterval', 120); // in seconds

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
  // Auto-change root note logic
  useEffect(() => {
    let interval;
    if (autoChangeRoot) {
      interval = setInterval(() => {
        // Get random note between C2 and B2
        const newRoot = Note.fromMidi(Math.floor(Math.random() * 12) + 36);
        setRootNote(newRoot);
      }, changeInterval * 1000);
    }
    
    return () => clearInterval(interval);
  }, [autoChangeRoot, changeInterval]);

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
    autoChangeRoot,
    setAutoChangeRoot,
    changeInterval,
    setChangeInterval,
    autoChangeRoot,
    setAutoChangeRoot,
    changeInterval,
    setChangeInterval
  };
};

export default usePracticeSettings;
