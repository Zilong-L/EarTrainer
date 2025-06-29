import React, { useState, useEffect, useRef } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { useTranslation } from 'react-i18next';
import { useDegreeTrainerSettings } from '@EarTrainers/DegreeTrainer/Settings/useDegreeTrainerSettings';

function Statistics() {
  const { t } = useTranslation('degreeTrainer');
  const { stats: { practiceRecords, setPracticeRecords } } = useDegreeTrainerSettings();
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
    localStorage.removeItem('degreeTrainerRecords');
    setPracticeRecords({});
    setIsDeleteConfirmOpen(false);
  };

  return (
    <div className="p-6 space-y-12">
      <div className="w-full h-64 overflow-hidden">
        <div ref={chartRef} className="w-full h-full"></div>
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
