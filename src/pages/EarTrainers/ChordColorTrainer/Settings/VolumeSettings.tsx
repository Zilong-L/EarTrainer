import React from 'react';
import { useTranslation } from 'react-i18next';
import HorizontalSlider from '@components/slider/HorizontalSlider';
import useChordColorTrainerSettingsStore from '@stores/chordColorTrainerSettingsStore';
import useI18nStore from '@stores/i18nStore';
interface VolumeSettingsProps {
  setShowVolumeSettings?: (show: boolean) => void;
}

const VolumeSettings: React.FC<VolumeSettingsProps> = () => {

  const { namespace } = useI18nStore();
  const { t } = useTranslation(namespace);

  const {
    droneVolume,
    pianoVolume,
    setDroneVolume,
    setPianoVolume,
  } = useChordColorTrainerSettingsStore();

  return (
    <div className="relative">
      {/* Back Button */}

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
              />

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolumeSettings;
