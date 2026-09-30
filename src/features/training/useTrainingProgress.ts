import { useEffect, useState } from 'react';
import {
  getProgress,
  summarizeProgress,
  PROGRESS_EVENT,
} from '../practice/progress';

export default function useTrainingProgress() {
  const [progress, setProgress] = useState(getProgress);
  useEffect(() => {
    const update = () => setProgress(getProgress());
    window.addEventListener('storage', update);
    window.addEventListener(PROGRESS_EVENT, update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener(PROGRESS_EVENT, update);
    };
  }, []);
  return { progress, summary: summarizeProgress(progress) };
}
