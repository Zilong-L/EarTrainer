import React from 'react';
import { useTranslation } from 'react-i18next';
import HorizontalSlider from '@components/slider/HorizontalSlider';
const instrumentsList = [
  'bass-electric', 'bassoon', 'cello', 'clarinet', 'contrabass', 'flute',
  'french-horn', 'guitar-acoustic', 'guitar-electric', 'guitar-nylon',
  'harmonium', 'harp', 'organ', 'piano', 'saxophone', 'trombone',
  'trumpet', 'tuba', 'violin', 'xylophone', 'triangle', 'square', 'sawtooth', 'pad'
];
import { useSoundSettingsStore } from '@stores/soundSettingsStore';
const SoundSettings: React.FC = () => {
  const { t } = useTranslation('degreeTrainer');
  const {
    selectedInstrument,
    isLoadingInstrument,
    selectedQuality,
    dronePan,
    setDronePan,
    droneFilter,
    setDroneFilter,
    changeInstrument // Destructure the new callback
  } = useSoundSettingsStore();

  const clamps = {
    dronePan: {
      min: -1,
      max: 1
    },
    droneFilter: {
      min: 20,
      max: 2000
    }
  };

  // useEffect(() => {
  //   if (!isLoadingInstrument) {
  //     console.log('play')

  //   }
  // }, [isLoadingInstrument]);

  // Removed handleQualityChange function
  // console.log(clamps)
  return (
    <div className="p-6 space-y-12 max-w-[800px] mx-auto">
      {/* Quality Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-text-primary mb-2">
          {t('settings.qualityLabel')}
        </label>
        <select
          value={selectedQuality}
          onChange={(event) => changeInstrument(selectedInstrument, event.target.value)}
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
      <div className="flex flex-col">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-text-primary mb-2">
            {t('settings.dronePan')}
          </label>
          <div className="grid items-center gap-4">
            <HorizontalSlider
              min={clamps.dronePan.min}
              max={clamps.dronePan.max}
              step={0.01}
              setState={setDronePan}
              value={dronePan}
              mapFunction={(value) => value.toFixed(2)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-text-primary mb-2">
            {t('settings.droneFilter')}
          </label>
          <div className="flex items-center gap-4">
            <HorizontalSlider
              min={clamps.droneFilter.min}
              max={clamps.droneFilter.max}
              step={1}
              setState={setDroneFilter}
              value={droneFilter}
              mapFunction={(value) => Math.round(value)}
            />
          </div>
        </div>
      </div>

      {/* Instrument Grid */}
      <div className="grid grid-cols-2 gap-3">
        {instrumentsList.map((instrument) => (
          <button
            key={instrument}
            onClick={() => changeInstrument(instrument, selectedQuality)}
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
};

export default SoundSettings;
