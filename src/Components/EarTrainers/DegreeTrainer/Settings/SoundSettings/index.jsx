import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import IOSInput from '@components/SharedComponents/IOSInput';
import { useDegreeTrainerSettings } from '@components/EarTrainers/DegreeTrainer/Settings/useDegreeTrainerSettings';
const instrumentsList = [
  'bass-electric', 'bassoon', 'cello', 'clarinet', 'contrabass', 'flute',
  'french-horn', 'guitar-acoustic', 'guitar-electric', 'guitar-nylon',
  'harmonium', 'harp', 'organ', 'piano', 'saxophone', 'trombone',
  'trumpet', 'tuba', 'violin', 'xylophone','triangle', 'square', 'sawtooth', 'pad'
];

function SoundSettings({ settings, playNote }) {
  const { t } = useTranslation('degreeTrainer');
  const { 
    sound: {
      selectedInstrument, 
      setSelectedInstrument,
      isLoadingInstrument, 
      selectedQuality, 
      setSelectedQuality,
      dronePan,
      setDronePan,
      droneFilter,
      setDroneFilter
    }
  } = useDegreeTrainerSettings();

  const handleInstrumentSelect = (instrument) => {
    setSelectedInstrument(instrument);
  };

  useEffect(() => {
    console.log(isLoadingInstrument)
    if (!isLoadingInstrument) {
      playNote();
    }
  }, [isLoadingInstrument]);

  const handleQualityChange = (event) => {
    setSelectedQuality(event.target.value);
    console.log(`Quality set to: ${event.target.value}`);
  };

  return (
    <div className="p-6 space-y-12 max-w-[800px] mx-auto">
      {/* Quality Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-text-primary mb-2">
          {t('settings.qualityLabel')}
        </label>
        <select
          value={selectedQuality}
          onChange={handleQualityChange}
          disabled={isLoadingInstrument}
          className="w-full px-4 py-2 border border-bg-accent rounded-lg bg-bg-main text-text-primary focus:ring-2 focus:ring-accent focus:border-accent disabled:opacity-50"
        >
          <option value="low">{t('settings.quality.low')}</option>
          <option value="medium">{t('settings.quality.medium')}</option>
          <option value="high">{t('settings.quality.high')}</option>
          <option value="full">{t('settings.quality.full')}</option>
        </select>
      </div>

      {/* Drone Effects */}
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-text-primary mb-2">
            {t('settings.dronePan')}
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <IOSInput
                value={dronePan}
                setValue={setDronePan}
                min={-1}
                max={1}
                width={60}
                height={120}
              />
            </div>
            <span className="w-16 text-center text-text-primary">
              {dronePan.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-text-primary mb-2">
            {t('settings.droneFilter')}
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <IOSInput
                value={droneFilter}
                setValue={setDroneFilter}
                min={20}
                max={2000}
                width={60}
                height={120}
              />
            </div>
            <span className="w-16 text-center text-text-primary">
              {droneFilter.toFixed(0)} Hz
            </span>
          </div>
        </div>
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
                ? 'bg-notification-bg text-notification-text'
                : 'bg-bg-main text-text-primary'
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
