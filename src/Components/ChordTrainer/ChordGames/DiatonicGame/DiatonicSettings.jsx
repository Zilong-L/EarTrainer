import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomListbox from '@shared/Listbox';

const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const chordTypes = ['triads', 'sevenths', 'mixed'];
const scaleTypes = ['major', 'harmonic', 'melodic', 'natural'];

const DiatonicSettings = ({diatonicGameSettings}) => {
  const { t } = useTranslation('chordGame');
  
  const { 
    rootNote, 
    setRootNote, 
    scaleType, 
    setScaleType,
    chordType,
    setChordType,
    showDegree,
    setShowDegree
  } = diatonicGameSettings;

  const handleRootNoteChange = (e) => {
    setRootNote(e.target.value);
  };

  const handleScaleTypeChange = (e) => {
    setScaleType(e.target.value);
  };

  return (
    <div className="space-y-6 px-6 pt-6 pb-0">
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {t('settings.diatonic.title')}
      </h3>

      {/* Root Note Selector */}
      <CustomListbox
        value={rootNote}
        onChange={setRootNote}
        options={flatNotes}
        label={t('settings.diatonic.rootNote')}
        t={t}
      />

      {/* Scale Type Selector */}
      <CustomListbox
        value={scaleType}
        onChange={setScaleType}
        options={scaleTypes}
        label={t('settings.diatonic.scaleType')}
        t={t}
        translationPath="settings.diatonic"
      />

      {/* Chord Type Selector */}
      <CustomListbox
        value={chordType}
        onChange={setChordType}
        options={chordTypes}
        label={t('settings.diatonic.chordType')}
        t={t}
        translationPath="settings.diatonic"
      />

      {/* Show Degrees Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('settings.diatonic.showDegrees')}
        </label>
        <button
          onClick={() => setShowDegree(!showDegree)}
          className={`${
            showDegree ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
        >
          <span
            className={`${
              showDegree ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </button>
      </div>
    </div>
  );
};

export default DiatonicSettings;
