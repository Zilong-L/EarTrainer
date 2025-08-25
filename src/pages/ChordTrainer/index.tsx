import React, { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Routes, Route } from 'react-router-dom';
import useI18nStore from '@stores/i18nStore';

import ChordTrainerOutlet from './ChordTrainerOutlet';
import DiatonicGame from './pages/DiatonicGame';
import ChordPracticeGame from './pages/ChordPracticeGame';

const ChordTrainer: React.FC = () => {
  const setNamespace = useI18nStore(state => state.setNamespace);
  useEffect(() => {
    setNamespace('chordGame');
    // Clear lingering settings-error toasts when entering ChordTrainer
    toast.dismiss('settings-error');
    return () => {
      toast.dismiss('settings-error');
    };
  }, [setNamespace]);
  return (
    <div className="flex flex-col h-[100vh]">
      <Routes>
        <Route path="/" element={<ChordTrainerOutlet />}>
          <Route path="chord-practice" element={<ChordPracticeGame />} />
          <Route path="diatonic" element={<DiatonicGame />} />
          <Route path="" element={<ChordPracticeGame />} />
        </Route>
      </Routes>
    </div>
  );
};

export default ChordTrainer;
