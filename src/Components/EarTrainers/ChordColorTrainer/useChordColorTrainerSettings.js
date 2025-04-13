import { useEffect } from 'react';
import * as Tone from 'tone';
import { getDroneInstance } from '@utils/ToneInstance';
import { chordPreset } from "@components/EarTrainers/ChordColorTrainer/Constants";
import { CHORD_TYPES } from "@components/EarTrainers/ChordColorTrainer/Constants";
import useChordColorTrainerSettingsStore from '../../../stores/chordColorTrainerSettingsStore';
import useSoundSettings from '@components/SharedComponents/Settings/SoundSettings/useSoundSettings';

const useChordColorTrainerSettings = () => {
  const {
    bpm,
    droneVolume,
    pianoVolume,
    rootNote,
    range,
    practiceRecords,
    currentNotes,
    preset,
    customPresets,
    muteDrone,
    isStatOpen,
    degreeChordTypes,
    setBpm,
    setDroneVolume,
    setPianoVolume,
    setRootNote,
    setRange,
    setPracticeRecords,
    updatePracticeRecords,
    setCurrentNotes,
    setDegreeChordTypes,
    setPreset,
    setCustomPresets,
    setMuteDrone,
    setIsStatOpen
  } = useChordColorTrainerSettingsStore();
  const { selectedInstrument } = useSoundSettings();

  useEffect(() => {
    const storedRecords = JSON.parse(localStorage.getItem('ChordColorTrainerRecords')) || {};
    setPracticeRecords(storedRecords);
  }, [setPracticeRecords]);

  useEffect(() => {
    setDegreeChordTypes(customPresets[preset] || chordPreset[preset] || degreeChordTypes);
    console.log('runs here');
  }, [preset, customPresets, setDegreeChordTypes, degreeChordTypes]);

  return {
    bpm,
    droneVolume,
    pianoVolume,
    rootNote,
    range,
    practiceRecords,
    currentNotes,
    setBpm,
    setDroneVolume,
    setPianoVolume,
    setRootNote,
    setRange,
    setPracticeRecords,
    updatePracticeRecords,
    setCurrentNotes,
    degreeChordTypes,
    setDegreeChordTypes,
    CHORD_TYPES,
    preset,
    setPreset,
    customPresets,
    setCustomPresets,
    muteDrone,
    setMuteDrone,
    isStatOpen,
    setIsStatOpen,
    selectedInstrument
  };
};
export default useChordColorTrainerSettings;