import { useEffect, useState } from 'react';
import { get, set } from 'idb-keyval';

const useStatistics = () => {
  const [practiceRecords, setPracticeRecords] = useState({});
  const [currentPracticeRecords, setCurrentPracticeRecords] = useState({ total: 0, correct: 0 });

  // 初次加载时从 IndexedDB 获取数据
  useEffect(() => {
    get('degreeTrainerRecords').then((data) => {
      if (data) setPracticeRecords(data);
    });
  }, []);

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

      // 异步写入 IndexedDB
      set('degreeTrainerRecords', newRecords);
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
