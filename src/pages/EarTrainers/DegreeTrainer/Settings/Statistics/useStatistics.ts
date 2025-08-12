import { useEffect, useState } from 'react';
import { get, set } from 'idb-keyval';

export interface DegreeRecord {
  total: number;
  correct: number;
}

export type PracticeRecords = Record<string, DegreeRecord>;
const useStatistics = () => {
  const [practiceRecords, setPracticeRecords] = useState<PracticeRecords>({});
  const [currentPracticeRecords, setCurrentPracticeRecords] = useState<DegreeRecord>({ total: 0, correct: 0 });

  // Load from IndexedDB initially
  useEffect(() => {
    get<PracticeRecords>('degreeTrainerRecords').then((data) => {
      if (data) setPracticeRecords(data);
    });
  }, []);

  const updatePracticeRecords = (degree: string, isCorrect: boolean) => {
    setPracticeRecords((prevRecords) => {
      const newRecords: PracticeRecords = { ...prevRecords };
      if (!newRecords[degree]) {
        newRecords[degree] = { total: 0, correct: 0 };
      }
      newRecords[degree].total += 1;
      if (isCorrect) {
        newRecords[degree].correct += 1;
      }

      // async write
      set('degreeTrainerRecords', newRecords);
      return newRecords;
    });

    setCurrentPracticeRecords((prev) => ({
      total: prev.total + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
    }));
  };

  return {
    practiceRecords,
    setPracticeRecords,
    currentPracticeRecords,
    setCurrentPracticeRecords,
    updatePracticeRecords,
  } as const;
};

export default useStatistics;
