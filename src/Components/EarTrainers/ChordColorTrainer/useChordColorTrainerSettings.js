import { useEffect } from 'react';
import { chordPreset } from "@components/EarTrainers/ChordColorTrainer/Constants";
import { CHORD_TYPES } from "@components/EarTrainers/ChordColorTrainer/Constants";
import useChordColorTrainerSettingsStore from '../../../stores/chordColorTrainerSettingsStore';
import { useSoundSettingsStore } from '@stores/soundSettingsStore';
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
    setIsStatOpen,
  } = useChordColorTrainerSettingsStore();
  const { selectedInstrument } = useSoundSettingsStore((state) => state.selectedInstrument);

  useEffect(() => {
    const storedRecords = JSON.parse(localStorage.getItem('ChordColorTrainerRecords')) || {};
    setPracticeRecords(storedRecords);
  }, [setPracticeRecords]);
  useEffect(() => {
    setDegreeChordTypes(customPresets[preset] || chordPreset[preset] || degreeChordTypes);
  }, [preset, customPresets, setDegreeChordTypes]);

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