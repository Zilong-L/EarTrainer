import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomListbox from '@components/Listbox';

const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const chordTypes = ['triads', 'sevenths', 'mixed'];
const scaleTypes = ['major', 'harmonic', 'melodic', 'natural'];

const DiatonicSettings = ({ diatonicGameSettings }) => {
  const { t } = useTranslation('chordGame');
  console.log(diatonicGameSettings)
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
    <div className="space-y-6 px-6 pb-6 bg-bg-main">
      <h3 className="md:hidden text-xl font-semibold text-text-primary">
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

      <div className="h-20 flex-shrink-0"></div>
    </div>
  );
};

export default DiatonicSettings;
