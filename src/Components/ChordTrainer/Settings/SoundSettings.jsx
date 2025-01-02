import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getSamplerInstance } from '@utils/ToneInstance';

const instrumentsList = [
  'bass-electric', 'bassoon', 'cello', 'clarinet', 'contrabass', 'flute',
  'french-horn', 'guitar-acoustic', 'guitar-electric', 'guitar-nylon',
  'harmonium', 'harp', 'organ', 'piano', 'saxophone', 'trombone',
  'trumpet', 'tuba', 'violin', 'xylophone',
];

function SoundSettings({ settings }) {
  const { t } = useTranslation('chordGame');
  const { selectedInstrument, setSelectedInstrument } = settings;
  const samplerInstance = getSamplerInstance();
  const [isSwitching, setIsSwitching] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('low');

  const playNote = () => {
    const sampler = samplerInstance.sampler;
    sampler.triggerAttackRelease('C4', '8n');
  };

  const handleInstrumentSelect = async (instrument) => {
    setIsSwitching(true);
    try {
      await samplerInstance.changeSampler(instrument, selectedQuality);
      setSelectedInstrument(instrument);
      console.log(`Sampler successfully changed to: ${instrument} with quality: ${selectedQuality}`);
      playNote();
    } catch (error) {
      console.error(`Error changing sampler to: ${instrument}`, error);
    } finally {
      setIsSwitching(false);
    }
  };

  const handleQualityChange = (event) => {
    setSelectedQuality(event.target.value);
    console.log(`Quality set to: ${event.target.value}`);
  };

  return (
    <div className="space-y-6 px-6 pt-6 pb-0">
      {/* Header */}
      <div className="sticky top-0 left-0 w-full z-50 flex items-center justify-center p-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {t('settings.SoundSettings')}
        </h2>
      </div>

      {/* Quality Selector */}
      <div className="px-8 py-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('settings.qualityLabel')}
          </label>
          <select
            value={selectedQuality}
            onChange={handleQualityChange}
            disabled={isSwitching}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50"
          >
            <option value="low">{t('settings.quality.low')}</option>
            <option value="medium">{t('settings.quality.medium')}</option>
            <option value="high">{t('settings.quality.high')}</option>
            <option value="full">{t('settings.quality.full')}</option>
          </select>
        </div>

        {/* Instrument Buttons */}
        <div className="grid grid-cols-2 gap-4">
          {instrumentsList.map((instrument) => (
            <button
              key={instrument}
              onClick={() => handleInstrumentSelect(instrument)}
              disabled={isSwitching}
              className={`px-4 py-2 rounded-lg transition-all capitalize text-center
                ${selectedInstrument === instrument
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600'
                }
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {t(`settings.instruments.${instrument}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SoundSettings;
