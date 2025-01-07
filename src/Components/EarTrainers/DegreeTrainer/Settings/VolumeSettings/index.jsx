import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Slider from '@components/SharedComponents/Slider';

function VolumeSettings({ settings }) {

  // Keep Tone.js volumes in sync with settings

  const { t } = useTranslation('degreeTrainer');
  const { volume: { droneVolume, setDroneVolume, pianoVolume, setPianoVolume,answerVolume ,setAnswerVolume } } = settings;

  return (
    <div className="p-6 space-y-12">
      <Slider
        label={t('settings.DroneVolume')}
        value={droneVolume}
        onChange={(e) => setDroneVolume(parseFloat(e.target.value))}
        min={0}
        max={1}
        step={0.01}
        displayValue={`${Math.round(droneVolume * 100)}%`}
      />

      <Slider
        label={t('settings.PianoVolume')}
        value={pianoVolume}
        onChange={(e) => setPianoVolume(parseFloat(e.target.value))}
        min={0}
        max={1}
        step={0.01}
        displayValue={`${Math.round(pianoVolume * 100)}%`}
      />

      <Slider
        label={t('settings.AnswerVolume')}
        value={answerVolume}
        onChange={(e) => setAnswerVolume(parseFloat(e.target.value))}
        min={0}
        max={1}
        step={0.01}
        displayValue={`${Math.round(answerVolume * 100)}%`}
      />
    </div>
  );
}

export default VolumeSettings;
