import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import useI18nStore from '@stores/i18nStore';

import ChordTrainerOutlet from './ChordTrainerOutlet';
import DiatonicGame from './pages/DiatonicGame';
import ChordPracticeGame from './pages/ChordPracticeGame';

const ChordTrainer: React.FC = () => {
  const setNamespace = useI18nStore(state => state.setNamespace);
  useEffect(() => {
    setNamespace('chordGame');
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
