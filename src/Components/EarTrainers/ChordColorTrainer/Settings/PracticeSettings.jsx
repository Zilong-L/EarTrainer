import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { CHORD_TYPES, chordPreset } from '@components/EarTrainers/ChordColorTrainer/Constants';
import { useTranslation } from 'react-i18next';
import ValueAdjuster from '@components/SharedComponents/ValueAdjuster';
import RangeSlider from '@components/SharedComponents/slider/RangeSlider';
import { Midi, Note } from "tonal";
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { Disclosure } from '@headlessui/react'; // Import Disclosure
import useChordColorTrainerSettingsStore from '@stores/chordColorTrainerSettingsStore';
import useI18nStore from '@stores/i18nStore';

function PracticeSettings({ setShowPracticeSettings }) {
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
    isLoadingPreset,
    setIsLoadingPreset,
  } = useChordColorTrainerSettingsStore();
  const [newPresetName, setNewPresetName] = useState('');
  const [editingPreset, setEditingPreset] = useState(null);

  useEffect(() => {
    setIsLoadingPreset(true);
    if (preset && chordPreset[preset]) {
      setDegreeChordTypes(chordPreset[preset]);
    } else if (preset && customPresets[preset]) {
      setDegreeChordTypes(customPresets[preset]);
    }
    setTimeout(setIsLoadingPreset(false), 0)
  }, [preset, customPresets, setDegreeChordTypes, setIsLoadingPreset]);

  const handleChordTypeToggle = (degreeIndex, chordType) => {
    if (isLoadingPreset) return;
    const newDegreeChordTypes = [...degreeChordTypes];
    const chordTypes = newDegreeChordTypes[degreeIndex].chordTypes;
    if (chordTypes.includes(chordType)) {
      newDegreeChordTypes[degreeIndex].chordTypes = chordTypes.filter((type) => type !== chordType);
    } else {
      newDegreeChordTypes[degreeIndex].chordTypes.push(chordType);
    }
    setDegreeChordTypes(newDegreeChordTypes);
    setCustomPresets({ ...customPresets, [preset]: newDegreeChordTypes });
  };

  const handlePresetChange = (presetValue) => {
    setPreset(presetValue);
    if (presetValue === 'custom') {
      let newPresetNameValue = t('practiceSettings.custom') + '1';
      let counter = 1;
      while (customPresets[newPresetNameValue]) {
        counter++;
        newPresetNameValue = `${t('practiceSettings.custom')}${counter}`;
      }
      const updatedCustomPresets = { ...customPresets, [newPresetNameValue]: chordPreset['custom'] };
      setCustomPresets(updatedCustomPresets);
      setPreset(newPresetNameValue);
    }
  };

  const handleCopyPreset = (presetName) => {
    const newPresetNameValue = `Copy of ${presetName}`;
    const updatedCustomPresets = { ...customPresets, [newPresetNameValue]: degreeChordTypes };
    setCustomPresets(updatedCustomPresets);
    setPreset(newPresetNameValue);
  };

  const handleDeleteCustomPreset = (presetName) => {
    const updatedCustomPresets = { ...customPresets };
    delete updatedCustomPresets[presetName];
    setCustomPresets(updatedCustomPresets);
    if (preset === presetName) {
      setPreset('大调');
    }
  };

  const handleEditPresetName = (presetName) => {
    setEditingPreset(presetName);
    setNewPresetName(presetName);
  };

  const handleSavePresetName = () => {
    if (newPresetName && newPresetName !== editingPreset) {
      const updatedCustomPresets = { ...customPresets };
      updatedCustomPresets[newPresetName] = updatedCustomPresets[editingPreset];
      delete updatedCustomPresets[editingPreset];
      setCustomPresets(updatedCustomPresets);
      setPreset(newPresetName);
    }
    setEditingPreset(null);
  };

  return (
    <div className="space-y-6 relative">
      {/* Note Range */}
      <RangeSlider
        value={[Tone.Frequency(range[0]).toMidi(), Tone.Frequency(range[1]).toMidi()]}
        onChange={(value) => setRange([
          Tone.Frequency(value[0], 'midi').toNote(),
          Tone.Frequency(value[1], 'midi').toNote()
        ])}
        min={Tone.Frequency('C2').toMidi()}
        max={Tone.Frequency('C6').toMidi()}
        step={12}
        label={t('practiceSettings.noteRange')}
        displayFunction={(value) => Tone.Frequency(value, 'midi').toNote()}
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
          displayFunction={(value) => `${value} BPM`}
        />

        <ValueAdjuster
          title={t('practiceSettings.rootNote')}
          value={Tone.Frequency(rootNote).toMidi()}
          setValue={(value) => setRootNote(Tone.Frequency(value, 'midi').toNote())}
          min={Tone.Frequency('C2').toMidi()}
          max={Tone.Frequency('C6').toMidi()}
          step={1}
          displayFunction={(value) => Tone.Frequency(value, 'midi').toNote()}
        />
      </div>

      {/* Preset Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-primary">
          {t('practiceSettings.selectPreset')}
        </label>
        {editingPreset === preset ? (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="w-full px-2 py-1 border border-bg-accent rounded-md bg-bg-main text-text-primary focus:ring-2 focus:ring-accent focus:border-accent"
            />
            <button onClick={handleSavePresetName} className="px-2 py-1 rounded-md bg-bg-accent text-text-primary">Save</button>
          </div>
        ) : (
          <select
            value={preset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="w-full px-4 py-2 border border-bg-accent rounded-lg bg-bg-main text-text-primary focus:ring-2 focus:ring-accent focus:border-accent"
          >
            {Object.keys(chordPreset)
              .filter((presetName) => presetName !== 'custom')
              .map((presetName) => (
                <option key={presetName} value={presetName}>
                  {presetName}
                </option>
              ))}
            {Object.keys(customPresets).map((presetName) => (
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
          <button onClick={() => handleCopyPreset(preset)} className="px-2 py-1 rounded-md bg-bg-accent text-text-primary">
            📋
          </button>
        </div>
      </div>

      {/* Custom Preset Editor */}
      {!Object.keys(chordPreset).includes(preset) && degreeChordTypes && (
        <div className="space-y-4">
          {degreeChordTypes?.map((degree, index) => (
            <Disclosure as="div" key={index} className="border border-bg-accent rounded-lg overflow-hidden">
              {({ open }) => ( // Use render prop to get open state
                <>
                  {/* Restore semantic styling with explicit text color and padding */}
                  <Disclosure.Button className="w-full px-4 py-2 flex items-center justify-between bg-bg-accent hover:bg-bg-accent-hover transition-colors text-left">
                    <span className="text-text-primary font-semibold">{degree.name}</span> {/* Label with primary text color */}
                    {degree.degree}
                    <span className="text-text-secondary ml-auto"> {/* Arrow with secondary text color */}
                      {open ? '▼' : '▶'}
                    </span>
                  </Disclosure.Button>
                  <Disclosure.Panel className="p-4 grid grid-cols-2 gap-2">
                    {CHORD_TYPES.map((chordType) => (
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
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          ))}
        </div>
      )}
    </div>
  );
}

export default PracticeSettings;
