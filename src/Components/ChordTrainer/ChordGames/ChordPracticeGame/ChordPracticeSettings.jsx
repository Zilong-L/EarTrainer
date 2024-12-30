import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChordType } from 'tonal';

const chordTypes = {
  Triads: ['Major', 'Minor', 'Diminished', 'Augmented'],
  Sevenths: ['Major 7th', 'Minor 7th', 'Dominant 7th', 'Half Diminished 7th', 'Diminished 7th'],
};

const ChordPracticeSettings = ({ chordPracticeSettings }) => {
  const chordTypesAll = ChordType.names();
  const { t } = useTranslation('chordGame');
  const { chordType, setChordType, proMode, setProMode, drillMode, setDrillMode } = chordPracticeSettings;

  const handleChordSelect = (chord) => () => {
    setChordType(chord);
  };

  const handleModeToggle = () => {
    setProMode(!proMode);
  };

  return (
    <div className="space-y-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {t('settings.title')}
      </h3>

      {/* Mode Toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-700">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('settings.easyMode')}
        </span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={proMode}
            onChange={handleModeToggle}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-cyan-600"></div>
          <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('settings.proMode')}
          </span>
        </label>
      </div>

      {/* Drill Mode Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('settings.drillModes.title')}
        </label>
        <select
          value={drillMode}
          onChange={(e) => setDrillMode(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-base"
        >
          <option value="random">{t('settings.drillModes.random')}</option>
          <option value="circle_fifths">{t('settings.drillModes.circle_fifths')}</option>
          <option value="circle_fourths">{t('settings.drillModes.circle_fourths')}</option>
          <option value="semitone_up">{t('settings.drillModes.semitone_up')}</option>
          <option value="semitone_down">{t('settings.drillModes.semitone_down')}</option>
        </select>
      </div>

      {/* Chord Selector */}
      <div className="space-y-4">
        {proMode
          ? chordTypesAll.map((chord) => (
              <button
                key={chord}
                onClick={handleChordSelect(chord)}
                className={`w-full px-4 py-2 text-left rounded-lg transition-all ${
                  chordType === chord
                    ? 'bg-cyan-600 text-slate-100'
                    : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100'
                }`}
              >
                {chord}
              </button>
            ))
          : Object.entries(chordTypes).map(([category, chords]) => (
              <div key={category}>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {t(`settings.chordCategories.${category}`)}
                </h4>
                <div className="space-y-2">
                  {chords.map((chord) => (
                    <button
                      key={chord}
                      onClick={handleChordSelect(chord)}
                      className={`w-full px-4 py-2 text-left rounded-lg transition-all ${
                        chordType === chord
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {t(`settings.chords.${chord}`)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default ChordPracticeSettings;
