import { useState } from 'react';
import toast from 'react-hot-toast';
import { Frequency } from 'tone';
import {
  CHORD_TYPES,
  chordPreset,
} from '@EarTrainers/ChordColorTrainer/Constants';
import { useTranslation } from 'react-i18next';
import ValueAdjuster from '@components/ValueAdjuster';
import RangeSlider from '@components/slider/RangeSlider';

import useChordColorTrainerSettingsStore from '@stores/chordColorTrainerSettingsStore';
import useI18nStore from '@stores/i18nStore';

const PracticeSettings: React.FC = () => {
  const { namespace } = useI18nStore();
  const { t } = useTranslation(namespace);
  const {
    range,
    rootNote,
    bpm,
    degreeChordTypes,
    setRange,
    setRootNote,
    setBpm,
    setDegreeChordTypes,
    preset,
    setPreset,
    customPresets,
    setCustomPresets,
  } = useChordColorTrainerSettingsStore();
  const [newPresetName, setNewPresetName] = useState('');
  const [editingPreset, setEditingPreset] = useState<string | null>(null);

  const handleChordTypeToggle = (degreeIndex: number, chordType: string) => {
    const newDegreeChordTypes = [...degreeChordTypes];
    const chordTypes = newDegreeChordTypes[degreeIndex]?.chordTypes || [];
    const isRemoving = chordTypes.includes(chordType);

    if (isRemoving) {
      const totalSelected = newDegreeChordTypes.reduce(
        (sum, d) => sum + (d.chordTypes?.length || 0),
        0
      );
      if (totalSelected <= 1) {
        toast.error('至少保留一个和弦类型', { id: 'settings-error' });
        return; // disallow removing the last remaining selection
      }
      newDegreeChordTypes[degreeIndex].chordTypes = chordTypes.filter(
        type => type !== chordType
      );
    } else {
      newDegreeChordTypes[degreeIndex].chordTypes = [...chordTypes, chordType];
    }

    setDegreeChordTypes(newDegreeChordTypes);
    setCustomPresets({
      ...customPresets,
      [preset]: newDegreeChordTypes as any,
    });
  };

  const handlePresetChange = (presetValue: string) => {
    setPreset(presetValue);
    if (presetValue === 'custom') {
      let newPresetNameValue = t('practiceSettings.custom') + '1';
      let counter = 1;
      while (customPresets[newPresetNameValue]) {
        counter++;
        newPresetNameValue = `${t('practiceSettings.custom')}${counter}`;
      }
      const updatedCustomPresets = {
        ...customPresets,
        [newPresetNameValue]: chordPreset['custom'] as any,
      };
      setCustomPresets(updatedCustomPresets);
      setPreset(newPresetNameValue);
    }
  };

  const handleCopyPreset = (presetName: string) => {
    const newPresetNameValue = `Copy of ${presetName}`;
    const deepCopiedDegreeChordTypes = structuredClone(degreeChordTypes);
    const updatedCustomPresets = {
      ...customPresets,
      [newPresetNameValue]: deepCopiedDegreeChordTypes as any,
    };
    setCustomPresets(updatedCustomPresets);
    setPreset(newPresetNameValue);
  };

  const handleDeleteCustomPreset = (presetName: string) => {
    const updatedCustomPresets = { ...customPresets };
    delete updatedCustomPresets[presetName];
    setCustomPresets(updatedCustomPresets);
    if (preset === presetName) {
      const firstCustomPreset = Object.keys(updatedCustomPresets)[0];
      setPreset(firstCustomPreset || '大调');
    }
  };

  const handleEditPresetName = (presetName: string) => {
    setEditingPreset(presetName);
    setNewPresetName(presetName);
  };

  const handleSavePresetName = () => {
    if (newPresetName && newPresetName !== editingPreset && editingPreset) {
      const updatedCustomPresets = { ...customPresets };
      updatedCustomPresets[newPresetName] = updatedCustomPresets[editingPreset];
      delete updatedCustomPresets[editingPreset];
      setCustomPresets(updatedCustomPresets);
      setPreset(newPresetName);
    }
    setEditingPreset(null);
  };

  return (
    <div className="space-y-6 relative ">
      {/* Note Range */}
      <RangeSlider
        value={[Frequency(range[0]).toMidi(), Frequency(range[1]).toMidi()]}
        onChange={value =>
          setRange([
            Frequency(value[0], 'midi').toNote(),
            Frequency(value[1], 'midi').toNote(),
          ])
        }
        min={Frequency('C2').toMidi()}
        max={Frequency('C6').toMidi()}
        step={1}
        minDistance={12}
        label={t('practiceSettings.noteRange')}
        displayFunction={value => Frequency(value, 'midi').toNote()}
      />

      {/* BPM and Root Note Controls */}
      <div className="grid grid-cols-2 gap-6">
        <ValueAdjuster
          title={t('practiceSettings.bpm')}
          value={bpm}
          setValue={setBpm}
          min={40}
          max={200}
          step={1}
          displayFunction={value => `${value} BPM`}
        />

        <ValueAdjuster
          title={t('practiceSettings.rootNote')}
          value={Frequency(rootNote).toMidi()}
          setValue={value => setRootNote(Frequency(value, 'midi').toNote())}
          min={Frequency('C2').toMidi()}
          max={Frequency('C6').toMidi()}
          step={1}
          displayFunction={value => Frequency(value, 'midi').toNote()}
        />
      </div>

      {/* Preset Selector */}
      <div className="space-y-2 ">
        <label className="block text-sm font-medium text-text-primary">
          {t('practiceSettings.selectPreset')}
        </label>
        {editingPreset === preset ? (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newPresetName}
              onChange={e => setNewPresetName(e.target.value)}
              className="w-full px-2 py-1 border border-bg-accent rounded-md bg-bg-main text-text-primary focus:ring-2 focus:ring-accent focus:border-accent"
            />
            <button
              onClick={handleSavePresetName}
              className="px-2 py-1 rounded-md bg-bg-accent text-text-primary"
            >
              Save
            </button>
          </div>
        ) : (
          <select
            value={preset}
            onChange={e => handlePresetChange(e.target.value)}
            className="w-full px-4 py-2 border border-bg-accent rounded-lg bg-bg-main text-text-primary focus:ring-2 focus:ring-accent focus:border-accent"
          >
            {Object.keys(chordPreset)
              .filter(presetName => presetName !== 'custom')
              .map(presetName => (
                <option key={presetName} value={presetName}>
                  {presetName}
                </option>
              ))}
            {Object.keys(customPresets).map(presetName => (
              <option key={presetName} value={presetName}>
                {presetName}
              </option>
            ))}
            <option value="custom">{t('practiceSettings.custom')}</option>
          </select>
        )}
        <div className="flex items-center space-x-2  right-0 top-8">
          <button
            onClick={() => handleEditPresetName(preset)}
            disabled={!Object.keys(customPresets).includes(preset)}
            className="px-2 py-1 rounded-md bg-bg-accent text-text-primary disabled:opacity-50"
          >
            ✏️
          </button>
          <button
            onClick={() => handleDeleteCustomPreset(preset)}
            disabled={!Object.keys(customPresets).includes(preset)}
            className="px-2 py-1 rounded-md bg-bg-accent text-text-primary disabled:opacity-50"
          >
            🗑️
          </button>
          <button
            onClick={() => handleCopyPreset(preset)}
            disabled={Object.keys(chordPreset).includes(preset)}
            className="px-2 py-1 rounded-md bg-bg-accent text-text-primary disabled:opacity-50"
          >
            📋
          </button>
        </div>
      </div>

      {/* Custom Preset Editor */}
      {!Object.keys(chordPreset).includes(preset) && degreeChordTypes && (
        <div className="grid grid-cols-4">
          {degreeChordTypes?.map((degree, index) => (
            <div
              key={index}
              className="border border-bg-accent  overflow-hidden"
            >
              <div className="w-full px-4 py-2 flex items-center justify-between bg-bg-accent hover:bg-bg-accent-hover transition-colors text-left">
                {degree.degree}
              </div>
              <div className="p-4 grid grid-cols-2 gap-2">
                {CHORD_TYPES.map(chordType => (
                  <label
                    key={chordType}
                    className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-bg-accent rounded"
                  >
                    <input
                      type="checkbox"
                      checked={degree.chordTypes.includes(chordType)}
                      onChange={() => handleChordTypeToggle(index, chordType)}
                      className="rounded accent-accent"
                    />
                    <span className="text-text-secondary">{chordType}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PracticeSettings;
