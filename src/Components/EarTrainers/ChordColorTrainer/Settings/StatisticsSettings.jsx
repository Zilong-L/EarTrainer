import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useTranslation } from 'react-i18next';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Statistics({ settings, setShowStatistics }) {
  const { t } = useTranslation('chordTrainer');
  const { practiceRecords, isStatOpen, setPracticeRecords, setIsStatOpen } = settings;
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

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
          label: t('statistics.chartLabel'),
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    };
  };

  const handleDeleteConfirm = () => {
    localStorage.removeItem('ChordColorTrainerRecords');
    setPracticeRecords({});
    setIsDeleteConfirmOpen(false);
  };

  return (
    <div className="space-y-6 relative">
      {/* Chart */}
      <button
        onClick={() => setShowStatistics(false)}
        className="absolute -top-16 -left-4 px-4 py-2 bg-accent text-text-primary rounded-lg hover:bg-accent-hover transition-colors z-10"
      >
        <ArrowUturnLeftIcon className="w-6 h-6" />
      </button>
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-text-primary">
          {t('statistics.chordAccuracy')}
        </h3>
        <div className="w-full h-64">
          <Bar data={generateChartData()} />
        </div>
      </div>

      {/* Statistics Toggle */}
      <div className="flex items-center justify-between p-4 bg-bg-accent rounded-lg cursor-pointer hover:bg-bg-accent-hover transition-colors">
        <span className="text-text-primary">{t('statistics.statistics')}</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isStatOpen}
            onChange={() => setIsStatOpen(!isStatOpen)}
          />
          <div className="w-11 h-6 bg-bg-main peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
        </label>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => setIsDeleteConfirmOpen(true)}
        className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        {t('statistics.deleteLocalData')}
      </button>

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-bg-main rounded-lg p-6 w-[90%] max-w-md">
            <h3 className="text-xl font-bold text-text-primary mb-4">
              {t('statistics.confirmDeleteTitle')}
            </h3>
            <p className="text-text-secondary mb-6">
              {t('statistics.confirmDeleteDescription')}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 border border-bg-accent text-text-primary rounded-lg hover:bg-bg-accent transition-colors"
              >
                {t('statistics.cancel')}
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                {t('statistics.delete')}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default Statistics;
