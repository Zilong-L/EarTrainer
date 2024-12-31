import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { getDroneInstance } from '@utils/ToneInstance';

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
function Statistics({ settings  }) {
  const { t } = useTranslation('degreeTrainer');
  const { stats: { practiceRecords, setPracticeRecords } } = settings;
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
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          {t('settings.DeleteData')}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsDeleteConfirmOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-80">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {t('settings.ConfirmDelete')}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {t('settings.DeleteConfirmation')}
            </p>
            <div className="flex justify-between">
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {t('settings.Delete')}
              </button>
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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
