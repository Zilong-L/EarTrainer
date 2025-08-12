import { useLocalStorage } from '@uidotdev/usehooks';
import { useEffect, useState } from 'react';
import { getDroneInstance } from '@utils/Tone/samplers';
import { Note } from 'tonal';

export interface PracticeSettings {
  bpm: number;
  setBpm: (v: number) => void;
  rootNote: string;
  setRootNote: (n: string) => void;
  range: [number, number];
  setRange: (r: [number, number]) => void;
  autoAdvance: boolean;
  setAutoAdvance: (v: boolean) => void;
  useSolfege: boolean;
  setUseSolfege: (v: boolean) => void;
  autoChangeRoot: boolean;
  setAutoChangeRoot: (v: boolean) => void;
  changeInterval: number; // seconds
  setChangeInterval: (v: number) => void;
}

const usePracticeSettings = (): PracticeSettings => {
  const [bpm, setBpm] = useLocalStorage<number>('degreeTrainerBPM', 60);
  const [rootNote, setRootNote] = useLocalStorage<string>('degreeTrainerRootNote', 'C2');
  const [range, _setRange] = useState<[number, number]>([36, 48]);
  const [autoAdvance, setAutoAdvance] = useLocalStorage<boolean>('degreeTrainerAutoAdvance', true);
  const [useSolfege, setUseSolfege] = useLocalStorage<boolean>('degreeTrainerUseSolfege', true);
  const [autoChangeRoot, setAutoChangeRoot] = useLocalStorage<boolean>('degreeTrainerAutoChangeRoot', false);
  const [changeInterval, setChangeInterval] = useLocalStorage<number>('degreeTrainerChangeInterval', 120); // seconds

  const setRange = (newRange: [number, number]) => {
    _setRange(newRange);
    localStorage.setItem('degreeTrainerRange', JSON.stringify(newRange));
  };

  useEffect(() => {
    const storedRange = localStorage.getItem('degreeTrainerRange');
    if (storedRange) {
      try {
        const parsed = JSON.parse(storedRange) as [number, number];
        if (Array.isArray(parsed) && parsed.length === 2) {
          _setRange([Number(parsed[0]), Number(parsed[1])]);
        }
      } catch {
        // ignore corrupt value
      }
    }
  }, []);

  // Auto-change root note logic
  useEffect(() => {
    let interval: number | undefined;
    if (autoChangeRoot) {
      interval = window.setInterval(() => {
        const newRoot = Note.fromMidi(Math.floor(Math.random() * 12) + 36);
        setRootNote(newRoot);
      }, changeInterval * 1000);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [autoChangeRoot, changeInterval, setRootNote]);

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
  };
};

export default usePracticeSettings;
