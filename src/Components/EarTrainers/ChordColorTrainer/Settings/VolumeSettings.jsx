import React from 'react';
import { useTranslation } from 'react-i18next';
import HorizontalSlider from '@components/SharedComponents/slider/HorizontalSlider';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

function VolumeSettings({ settings, setShowVolumeSettings }) {
  const { t } = useTranslation('chordTrainer');

  const {
    droneVolume,
    pianoVolume,
    setDroneVolume,
    setPianoVolume,
  } = settings;

  return (
    <div className="relative">
      {/* Back Button */}
      <button
        onClick={() => setShowVolumeSettings(false)}
        className="absolute -top-16 -left-4 px-4 py-2 bg-accent text-text-primary rounded-lg hover:bg-accent-hover transition-colors z-10"
      >
        <ArrowUturnLeftIcon className="w-6 h-6" />
      </button>

      {/* Volume Controls */}
      <div className="space-y-12 pt-16">
        <div className="space-y-12">
          <div>
            <div className="flex justify-between items-baseline mb-6">
              <h2 className="text-2xl font-bold text-text-primary">
                {t('volumeSettings.droneVolume')}
              </h2>

            </div>
            <div className="flex items-center space-x-4">
              <HorizontalSlider
                value={droneVolume}
                setState={setDroneVolume}
                min={0}
                max={1}
                step={0.01}
                className="flex-1"
              />

            </div>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-6">
              <h2 className="text-2xl font-bold text-text-primary">
                {t('volumeSettings.pianoVolume')}
              </h2>

            </div>
            <div className="flex items-center space-x-4">
              <HorizontalSlider
                value={pianoVolume}
                setState={setPianoVolume}
                min={0}
                max={1}
                step={0.01}
                className="flex-1"
              />

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VolumeSettings;
