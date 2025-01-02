import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChordType } from 'tonal';
import CustomListbox from '@shared/Listbox';

const chordTypes = {
  Triads: ['Major', 'Minor', 'Diminished', 'Augmented'],
  Sevenths: ['Major seventh', 'Minor seventh', 'Dominant seventh', 'Half-Diminished', 'Diminished seventh'],
};

const inversions = ['random', 'root', 'first', 'second', 'third'];
const drillModes = ['random', 'circle_fifths', 'circle_fourths', 'semitone_up', 'semitone_down'];

const ChordPracticeSettings = ({ chordPracticeSettings }) => {
  const chordTypesAll = ChordType.names();
  console.log(ChordType.names())
  const { t } = useTranslation('chordGame');
  const { chordType, setChordType, proMode, setProMode, drillMode, setDrillMode, selectedInversion, setSelectedInversion } = chordPracticeSettings;

  const handleChordSelect = (chord) => {
    const chordLower = chord.toLowerCase();
    setChordType(ChordType.get(chordLower).aliases[0]);
  };

  return (
    <div className="space-y-6 px-6  ">
      <h3 className="md:hidden text-xl font-semibold text-slate-900 dark:text-slate-100">
        {t('settings.title')}
      </h3>

      {/* Inversion Selector */}
      <CustomListbox
        value={selectedInversion}
        onChange={setSelectedInversion}
        options={inversions.filter(inv => inv !== 'third' || chordType.includes('7'))}
        label={t('settings.inversions.title')}
        t={t}
        translationPath="settings.inversions"
      />



      {/* Drill Mode Selector */}
      <CustomListbox
        value={drillMode}
        onChange={setDrillMode}
        options={drillModes}
        label={t('settings.drillModes.title')}
        t={t}
        translationPath="settings.drillModes"
      />
      {/* Mode Toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-700">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('settings.basicChords')}
        </span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={proMode}
            onChange={() => setProMode(!proMode)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-cyan-600"></div>
          <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('settings.moreChords')}
          </span>
        </label>
      </div>
      {/* Chord Selector */}
      <div className="space-y-4">
        {proMode
          ? chordTypesAll.map((chord) => (
              <button
                key={chord}
                onClick={() => handleChordSelect(chord)}
                className={`w-full px-4 py-2 text-left rounded-lg transition-all ${
                  chordType === ChordType.get(chord.toLocaleLowerCase()).aliases[0]
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
                      onClick={() => handleChordSelect(chord)}
                      className={`w-full px-4 py-2 text-left rounded-lg transition-all ${
                        chordType === ChordType.get(chord.toLocaleLowerCase()).aliases[0]
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
