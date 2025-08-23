import React from 'react';
import { useTranslation } from 'react-i18next';
import useI18nStore from '@stores/i18nStore';
import { ChordType } from 'tonal';
import CustomListbox from '@components/Listbox';
import { useChordPracticeStore } from '../../stores/chordPracticeStore';

const chordTypes = {
  Triads: ['Major', 'Minor', 'Diminished', 'Augmented'],
  Sevenths: ['Major seventh', 'Minor seventh', 'Dominant seventh', 'Half-Diminished', 'Diminished seventh'],
};

const inversions = ['random', 'root', 'first', 'second', 'third'];
const drillModes = ['random', 'circle_fifths', 'circle_fourths', 'semitone_up', 'semitone_down'];

const ChordPracticeSettings: React.FC = () => {
  const chordTypesAll = ChordType.names();
  const { namespace } = useI18nStore();
  const { t } = useTranslation(namespace);
  const {
    selectedChordTypes,
    setSelectedChordTypes,
    proMode,
    setProMode,
    drillMode,
    setDrillMode,
    selectedInversions,
    setSelectedInversions
  } = useChordPracticeStore();

  const handleChordSelect = (chord: string) => {
    const alias = ChordType.get(chord.toLowerCase()).aliases[0];
    const newSelectedChords = selectedChordTypes.includes(alias)
      ? selectedChordTypes.filter((c) => c !== alias)
      : [...selectedChordTypes, alias];

    if (newSelectedChords.length > 0) {
      setSelectedChordTypes(newSelectedChords);
    }
  };

  const handleInversionSelect = (inversion: string) => {
    const newSelectedInversions = selectedInversions.includes(inversion)
      ? selectedInversions.filter((i) => i !== inversion)
      : [...selectedInversions, inversion];

    if (newSelectedInversions.length > 0) {
      setSelectedInversions(newSelectedInversions);
    }
  };

  const isSeventhSelected = selectedChordTypes.some(type => type.includes('7') || type.includes('M7') || type.includes('m7'));


  return (
    <div className="space-y-6 px-6">
      <h3 className="md:hidden text-xl font-semibold text-slate-900 dark:text-slate-100">
        {t('settings.title')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-6 space-y-6 md:space-y-0">
        {/* Column 1 */}
        <div className="space-y-6">
          {/* Inversion Selector */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t('settings.inversions.title')}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {inversions
                .filter(inv => inv !== 'third' || isSeventhSelected)
                .map((inversion) => (
                  <button
                    key={inversion}
                    onClick={() => handleInversionSelect(inversion)}
                    className={`w-full px-4 py-2 text-center rounded-lg transition-all ${selectedInversions.includes(inversion)
                        ? 'bg-notification-bg text-notification-text'
                        : 'bg-bg-common text-text-primary'
                      }`}
                  >
                    {t(`settings.inversions.${inversion}`)}
                  </button>
                ))}
            </div>
          </div>

          {/* Drill Mode Selector */}
          <CustomListbox
            value={drillMode}
            onChange={setDrillMode}
            options={drillModes}
            label={t('settings.drillModes.title')}
            t={t}
            translationPath="settings.drillModes"
          />
        </div>

        {/* Column 2 */}
        <div className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-700 h-full">
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
        </div>
      </div>


      {/* Chord Selector */}
      <div className="space-y-4 pt-4">
        {proMode
          ? <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
            {chordTypesAll.map((chord) => (
              <button
                key={chord}
                onClick={() => handleChordSelect(chord)}
                className={`w-full px-4 py-2 text-left rounded-lg transition-all ${selectedChordTypes.includes(ChordType.get(chord.toLocaleLowerCase()).aliases[0])
                    ? 'bg-notification-bg text-notification-text'
                    : 'bg-bg-common text-text-primary'
                  }`}
              >
                {chord}
              </button>
            ))}
          </div>
          : Object.entries(chordTypes).map(([category, chords]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {t(`settings.chordCategories.${category}`)}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {chords.map((chord) => (
                  <button
                    key={chord}
                    onClick={() => handleChordSelect(chord)}
                    className={`w-full px-4 py-2 text-left rounded-lg transition-all ${selectedChordTypes.includes(ChordType.get(chord.toLocaleLowerCase()).aliases[0])
                        ? 'bg-notification-bg text-notification-text'
                        : 'bg-bg-common text-text-primary'
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