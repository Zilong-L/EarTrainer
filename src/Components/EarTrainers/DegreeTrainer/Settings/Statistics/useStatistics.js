import { useLocalStorage } from '@uidotdev/usehooks';
import { useState } from 'react';

const useStatistics = () => {
  const [practiceRecords, setPracticeRecords] = useLocalStorage('degreeTrainerRecords', {});
  const [currentPracticeRecords, setCurrentPracticeRecords] = useState( { total: 0, correct: 0 });

  const updatePracticeRecords = (degree, isCorrect) => {
    setPracticeRecords(prevRecords => {
      const newRecords = { ...prevRecords };
      if (!newRecords[degree]) {
        newRecords[degree] = { total: 0, correct: 0 };
      }
      newRecords[degree].total += 1;
      if (isCorrect) {
        newRecords[degree].correct += 1;
      }
      return newRecords;
    });

    setCurrentPracticeRecords(prev => ({
      total: prev.total + 1,
      correct: prev.correct + (isCorrect ? 1 : 0)
    }));
  };

  return {
    practiceRecords,
    setPracticeRecords,
    currentPracticeRecords,
    setCurrentPracticeRecords,
    updatePracticeRecords
  };
};

export default useStatistics;
