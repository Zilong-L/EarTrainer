import React from 'react';
import { useTranslation } from 'react-i18next';

const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const DiatonicSettings = ({diatonicGameSettings}) => {
  const { t } = useTranslation('chordGame');
  
  const { rootNote, setRootNote, scaleType, setScaleType } = diatonicGameSettings;

  const handleRootNoteChange = (e) => {
    setRootNote(e.target.value);
  };

  const handleScaleTypeChange = (e) => {
    setScaleType(e.target.value);
  };

  return (
    <div className="space-y-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {t('settings.diatonic.title')}
      </h3>

      {/* Root Note Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('settings.diatonic.rootNote')}
        </label>
        <select
          value={rootNote}
          onChange={handleRootNoteChange}
          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-base"
        >
          {flatNotes.map((note) => (
            <option 
              key={note} 
              value={note}
              className="bg-white dark:bg-slate-700 py-2 text-base"
            >
              {note}
            </option>
          ))}
        </select>
      </div>

      {/* Scale Type Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('settings.diatonic.scaleType')}
        </label>
        <select
          value={scaleType}
          onChange={handleScaleTypeChange}
          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-base"
        >
          <option value="major" className="bg-white dark:bg-slate-700 py-2 text-base">{t('settings.diatonic.major')}</option>
          <option value="harmonic" className="bg-white dark:bg-slate-700 py-2 text-base">{t('settings.diatonic.harmonicMinor')}</option>
          <option value="melodic" className="bg-white dark:bg-slate-700 py-2 text-base">{t('settings.diatonic.melodicMinor')}</option>
          <option value="natural" className="bg-white dark:bg-slate-700 py-2 text-base">{t('settings.diatonic.naturalMinor')}</option>
        </select>
      </div>
    </div>
  );
};

export default DiatonicSettings;
