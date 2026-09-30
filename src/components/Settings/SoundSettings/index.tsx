import React from 'react';
import { useTranslation } from 'react-i18next';
import useI18nStore from '@stores/i18nStore';
import HorizontalSlider from '@components/slider/HorizontalSlider';
import CustomListbox from '@components/Listbox';
import useSoundSettings from './useSoundSettings';
const instrumentsList = [
  'bass-electric',
  'bassoon',
  'cello',
  'clarinet',
  'contrabass',
  'flute',
  'french-horn',
  'guitar-acoustic',
  'guitar-electric',
  'guitar-nylon',
  'harmonium',
  'harp',
  'organ',
  'piano',
  'saxophone',
  'trombone',
  'trumpet',
  'tuba',
  'violin',
  'xylophone',
  'triangle',
  'square',
  'sawtooth',
  'pad',
];
const SoundSettings: React.FC = () => {
  const { namespace } = useI18nStore();
  const { t } = useTranslation(namespace);
  const {
    selectedInstrument,
    isLoadingInstrument,
    selectedQuality,
    dronePan,
    setDronePan,
    droneFilter,
    setDroneFilter,
    changeInstrument,
    instrumentLoadError,
    clamps,
  } = useSoundSettings();

  return (
    <div className="p-6 space-y-12 max-w-[800px] mx-auto">
      <p className="text-sm text-text-secondary">
        {t('settings.soundSafety', {
          defaultValue:
            'Start with a low device volume. Digital peak limiting cannot guarantee safe headphone or speaker levels.',
        })}
      </p>
      {isLoadingInstrument && (
        <p role="status" className="text-sm text-text-secondary">
          {t('settings.loadingInstrument', {
            defaultValue: 'Loading instrument…',
          })}
        </p>
      )}
      {instrumentLoadError && (
        <p role="alert" className="text-sm text-text-primary">
          {t('settings.instrumentLoadError', {
            defaultValue:
              'This instrument could not load. The previous sound is still available; try selecting it again.',
          })}
        </p>
      )}
      {/* Quality Selector */}
      <div className="space-y-3">
        <CustomListbox
          value={selectedQuality}
          onChange={value => changeInstrument(selectedInstrument, value)}
          options={['low', 'medium', 'high', 'full']}
          label={t('settings.qualityLabel')}
          t={t}
          translationPath="settings.quality"
        />
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
              mapFunction={value => value.toFixed(2)}
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
              mapFunction={value => Math.round(value).toString()}
            />
          </div>
        </div>
      </div>

      {/* Instrument Grid */}
      <div className="grid grid-cols-2 gap-3">
        {instrumentsList.map(instrument => (
          <button
            key={instrument}
            aria-pressed={selectedInstrument === instrument}
            onClick={() => changeInstrument(instrument, selectedQuality)}
            disabled={isLoadingInstrument}
            className={`px-4 py-2 rounded-lg transition-all capitalize
              ${
                selectedInstrument === instrument
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
