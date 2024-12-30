import React from 'react';
import { useTranslation } from 'react-i18next';

function VolumeSettings({ settings }) {
  const { t } = useTranslation('degreeTrainer');
  const { droneVolume, setDroneVolume, pianoVolume, setPianoVolume } = settings;

  return (
    <div className="p-6 space-y-12">
      <div className="space-y-3">
        <div className="flex justify-between items-center mb-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('settings.DroneVolume')}
          </label>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {Math.round(droneVolume * 100)}%
          </span>
        </div>
        <div className="slider">
          <div className="slider__track dark:bg-slate-700" />
          <div className="slider__range" style={{ width: `${droneVolume * 100}%` }} />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={droneVolume}
            onChange={(e) => setDroneVolume(parseFloat(e.target.value))}
            className="thumb"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center mb-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('settings.PianoVolume')}
          </label>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {Math.round(pianoVolume * 100)}%
          </span>
        </div>
        <div className="slider">
          <div className="slider__track dark:bg-slate-700" />
          <div className="slider__range" style={{ width: `${pianoVolume * 100}%` }} />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={pianoVolume}
            onChange={(e) => setPianoVolume(parseFloat(e.target.value))}
            className="thumb"
          />
        </div>
      </div>
    </div>
  );
}

export default VolumeSettings;
