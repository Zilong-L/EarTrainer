import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { getDroneInstance } from '@utils/ToneInstance';
import { useDegreeTrainerSettings } from '@components/EarTrainers/DegreeTrainer/Settings/useDegreeTrainerSettings';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
function Statistics() {
  const { t } = useTranslation('degreeTrainer');
  const { stats: { practiceRecords, setPracticeRecords } } = useDegreeTrainerSettings();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  console.log('practiceRecords:', practiceRecords);
  const calculateAccuracy = (record) => {
    return record.total > 0 ? (record.correct / record.total) * 100 : 0;
  };

  const generateChartData = () => {
    const labels = Object.keys(practiceRecords);
    const data = labels.map((degree) => calculateAccuracy(practiceRecords[degree]));
    return {
      labels,
      datasets: [
        {
          label: t('settings.Statistics'),
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
      options: {
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    };
  };

  const handleDeleteConfirm = () => {
    localStorage.removeItem('degreeTrainerRecords');
    setPracticeRecords({});
    setIsDeleteConfirmOpen(false);
  };



  return (
    <div className="p-6 space-y-12">
      <div>
        <Bar data={generateChartData()} />
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => setIsDeleteConfirmOpen(true)}
          className="px-4 py-2 bg-error-bg text-error-text rounded-lg"
        >
          {t('settings.DeleteData')}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsDeleteConfirmOpen(false)} />
          <div className="relative bg-bg-common p-6 rounded-lg shadow-xl w-80">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {t('settings.ConfirmDelete')}
            </h3>
            <p className="text-text-secondary mb-6">
              {t('settings.DeleteConfirmation')}
            </p>
            <div className="flex justify-between">
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-error-bg text-error-text rounded-lg"
              >
                {t('settings.Delete')}
              </button>
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 border border-bg-accent rounded-lg bg-bg-common text-text-primary"
              >
                {t('settings.Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Statistics;
