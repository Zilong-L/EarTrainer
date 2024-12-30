import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HomeIcon } from '@heroicons/react/24/solid';
import { getDroneInstance } from '@utils/ToneInstance';

const instrumentsList = [
  'bass-electric', 'bassoon', 'cello', 'clarinet', 'contrabass', 'flute',
  'french-horn', 'guitar-acoustic', 'guitar-electric', 'guitar-nylon',
  'harmonium', 'harp', 'organ', 'piano', 'saxophone', 'trombone',
  'trumpet', 'tuba', 'violin', 'xylophone',
];

function SoundSettings({ settings, setCurrentPage, playNote }) {
  const { t } = useTranslation('degreeTrainer');
  const { 
    selectedInstrument, 
    setSelectedInstrument,
    isLoadingInstrument, 
    selectedQuality, 
    setSelectedQuality 
  } = settings;

  const handleInstrumentSelect = (instrument) => {
    setSelectedInstrument(instrument);
  };

  useEffect(() => {
    console.log(isLoadingInstrument)
    if (!isLoadingInstrument) {
      playNote();
      console.log('runs')
    }
  }, [isLoadingInstrument]);

  const handleQualityChange = (event) => {
    setSelectedQuality(event.target.value);
    console.log(`Quality set to: ${event.target.value}`);
  };

  return (
    <div className="p-6 space-y-12">
      {/* Quality Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {t('settings.qualityLabel')}
        </label>
        <select
          value={selectedQuality}
          onChange={handleQualityChange}
          disabled={isLoadingInstrument}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50"
        >
          <option value="low">{t('settings.quality.low')}</option>
          <option value="medium">{t('settings.quality.medium')}</option>
          <option value="high">{t('settings.quality.high')}</option>
          <option value="full">{t('settings.quality.full')}</option>
        </select>
      </div>

      {/* Instrument Grid */}
      <div className="grid grid-cols-2 gap-3">
        {instrumentsList.map((instrument) => (
          <button
            key={instrument}
            onClick={() => handleInstrumentSelect(instrument)}
            disabled={isLoadingInstrument}
            className={`px-4 py-2 rounded-lg transition-all capitalize
              ${selectedInstrument === instrument
                ? 'bg-cyan-700 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600'
              }
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {t(`settings.instruments.${instrument}`)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SoundSettings;
