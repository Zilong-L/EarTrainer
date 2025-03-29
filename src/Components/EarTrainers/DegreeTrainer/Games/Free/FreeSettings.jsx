import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { modes } from './presets';
import { degrees } from '@components/EarTrainers/DegreeTrainer/Constants';

function FreeSettings({ FreeTrainerSettings }) {
  const { customNotes, handleDegreeToggle, setCustomNotes, selectedMode, setSelectedMode } = FreeTrainerSettings;
  const { t } = useTranslation('degreeTrainer');

  // Reset all intervals when component mounts


  const handleModeSelect = (modeName) => {
    setSelectedMode(modeName);
    const mode = modes[modeName];
    if (mode) {
      const newNotes = degrees.map(note => ({
        ...note,
        enable: mode.intervals.includes(note.distance)
      }));
      setCustomNotes(newNotes);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-primary">
          {t('settings.SelectMode')}
        </label>
        <select
          value={selectedMode}
          onChange={(e) => handleModeSelect(e.target.value)}
          className="w-full px-4 py-2 border border-bg-accent rounded-lg bg-bg-main text-text-primary focus:ring-2 focus:ring-accent focus:border-accent"
        >
          <option value="">{t('settings.selectMode')}</option>
          {Object.entries(modes).map(([key, mode]) => (
            <option key={key} value={key}>
              {mode.name}
            </option>
          ))}
        </select>
      </div>

      {/* Custom Interval Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-primary">
          {t('settings.SelectDegrees')}
        </label>
        <div className="grid grid-cols-3 gap-3">
          {customNotes.map((note, index) => (
            <div
              key={note.name}
              onClick={() => handleDegreeToggle(index)}
              className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-bg-main rounded"
            >
              <input
                type="checkbox"
                checked={note.enable}
                onChange={() => { }}
                className="rounded"
              />
              <span className="text-text-secondary">{note.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FreeSettings;
