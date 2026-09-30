import { chordPreset } from '@EarTrainers/ChordColorTrainer/Constants';
import { CHORD_TYPES } from '@EarTrainers/ChordColorTrainer/Constants';
import useChordColorTrainerSettingsStore from '../../../stores/chordColorTrainerSettingsStore';
import { useSoundSettingsStore } from '@stores/soundSettingsStore';

const useChordColorTrainerSettings = () => {
  const {
    bpm,
    droneVolume,
    pianoVolume,
    rootNote,
    range,
    firstAttemptRecords,
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
    setFirstAttemptRecords,
    updatePracticeRecords,
    setCurrentNotes,
    setDegreeChordTypes,
    setPreset,
    setCustomPresets,
    setMuteDrone,
    setIsStatOpen,
  } = useChordColorTrainerSettingsStore();
  const { selectedInstrument } = useSoundSettingsStore();

  return {
    bpm,
    droneVolume,
    pianoVolume,
    rootNote,
    range,
    practiceRecords: firstAttemptRecords,
    currentNotes,
    setBpm,
    setDroneVolume,
    setPianoVolume,
    setRootNote,
    setRange,
    setPracticeRecords: setFirstAttemptRecords,
    updatePracticeRecords,
    setCurrentNotes,
    degreeChordTypes:
      customPresets[preset] || chordPreset[preset] || degreeChordTypes,
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
    selectedInstrument,
  };
};
export default useChordColorTrainerSettings;
