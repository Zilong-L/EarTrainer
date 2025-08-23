import React from 'react';
import { Routes, Route } from 'react-router-dom';

import ChordTrainerOutlet from './ChordTrainerOutlet';
import DiatonicGame from './pages/DiatonicGame';
import ChordPracticeGame from './pages/ChordPracticeGame';

const ChordTrainer: React.FC = () => {
  return (
    <div className="flex flex-col h-[100vh]">
      <Routes>
        <Route path='/' element={<ChordTrainerOutlet />}>
          <Route path="chord-practice" element={<ChordPracticeGame />} />
          <Route path="diatonic" element={<DiatonicGame />} />
          <Route path="" element={<ChordPracticeGame />} />
        </Route>
      </Routes>
    </div>
  );
};

export default ChordTrainer;