import React, { useState, useEffect, useRef } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { useTranslation } from 'react-i18next';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

function Statistics({ settings, setShowStatistics }) {
  const { t } = useTranslation('chordTrainer');
  const { practiceRecords, isStatOpen, setPracticeRecords, setIsStatOpen } = settings;
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const chartRef = useRef(null);
  const plotInstance = useRef(null);

  const calculateAccuracy = (record) => {
    return record.total > 0 ? (record.correct / record.total) * 100 : 0;
  };

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (plotInstance.current && chartRef.current) {
        plotInstance.current.setSize({
          width: chartRef.current.offsetWidth,
          height: 256
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    const labels = Object.keys(practiceRecords);
    const data = labels.map((degree) => calculateAccuracy(practiceRecords[degree]));

    const opts = {
      width: chartRef.current.offsetWidth,
      height: 256,
      padding: [20, 10, 10, 40], // [top, right, bottom, left]
      cursor: {
        show: true,
        points: {
          show: true,
          size: 5,
        }
      },
      axes: [
        {
          scale: 'x',
          values: (_, vals) => labels,
          size: 40,
          gap: 5,
          grid: { show: true },
        },
        {
          scale: 'y',
          values: (_, vals) => vals.map(v => v + '%'),
          size: 40,
          gap: 5,
          grid: { show: true },
        },
      ],
      scales: {
        x: {
          time: false,
        },
        y: {
          auto: false,
          range: [0, 100],
        },
      },
      series: [
        {
          label: 'Degree',
        },
        {
          label: 'Accuracy',
          stroke: 'rgba(75, 192, 192, 1)',
          fill: 'rgba(75, 192, 192, 0.2)',
          width: 2,
          points: {
            show: true,
            stroke: 'rgba(75, 192, 192, 1)',
            fill: 'white',
            size: 4,
          },
          value: (_, v) => v.toFixed(1) + '%',
        },
      ],
    };

    // Cleanup previous instance
    if (plotInstance.current) {
      plotInstance.current.destroy();
    }

    // Create new instance
    plotInstance.current = new uPlot(opts, [
      Array.from({ length: labels.length }, (_, i) => i),  // x values as indices
      data,
    ], chartRef.current);

    return () => {
      if (plotInstance.current) {
        plotInstance.current.destroy();
      }
    };
  }, [practiceRecords]);

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
        <div className="w-full h-64 overflow-hidden">
          <div ref={chartRef} className="w-full h-full"></div>
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
