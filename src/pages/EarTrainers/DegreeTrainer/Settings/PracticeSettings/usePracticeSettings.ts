import useSafeLocalStorage from '../../hooks/useSafeLocalStorage';
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
  const [bpm, setBpm] = useSafeLocalStorage<number>('degreeTrainerBPM', 60);
  const [rootNote, setRootNote] = useSafeLocalStorage<string>(
    'degreeTrainerRootNote',
    'C2'
  );
  const [range, _setRange] = useState<[number, number]>([36, 48]);
  const [autoAdvance, setAutoAdvance] = useSafeLocalStorage<boolean>(
    'degreeTrainerAutoAdvance',
    true
  );
  const [useSolfege, setUseSolfege] = useSafeLocalStorage<boolean>(
    'degreeTrainerUseSolfege',
    true
  );
  const [autoChangeRoot, setAutoChangeRoot] = useSafeLocalStorage<boolean>(
    'degreeTrainerAutoChangeRoot',
    false
  );
  const [changeInterval, setChangeInterval] = useSafeLocalStorage<number>(
    'degreeTrainerChangeInterval',
    120
  ); // seconds

  const setRange = (newRange: [number, number]) => {
    _setRange(newRange);
    try {
      localStorage.setItem('degreeTrainerRange', JSON.stringify(newRange));
    } catch (error) {
      console.warn('Failed to save range to localStorage:', error);
      // 继续执行，仅内存状态生效
    }
  };

  useEffect(() => {
    try {
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
    } catch (error) {
      console.warn('Failed to read range from localStorage:', error);
      // 使用默认值，继续执行
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
