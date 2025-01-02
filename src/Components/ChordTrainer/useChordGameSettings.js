import { useState, useEffect } from 'react';
import { getDroneInstance, getSamplerInstance } from '@utils/ToneInstance';
import { useLocalStorage } from '@uidotdev/usehooks';
import useSoundSettings from '@EarTrainers/DegreeTrainer/Settings/SoundSettings/useSoundSettings';
const useChordGameSettings = () => {
  const [mode, setMode] = useLocalStorage('ChordTrainer_Mode', 'Chord Practice');
  const [bpm, setBpm] = useLocalStorage('ChordTrainer_Bpm', 40);
  const [pianoVolume, setPianoVolume] = useLocalStorage('ChordTrainer_PianoVolume', 1.0);
  const drone = getDroneInstance();
  const piano = getSamplerInstance();
  const sound = useSoundSettings();
  const {selectedInstrument, selectedQuality,setIsLoadingInstrument} = sound
  useEffect(() => {
    const loadInstrument = async () => {
      setIsLoadingInstrument(true);
      await getSamplerInstance().changeSampler(selectedInstrument, selectedQuality);
      setIsLoadingInstrument(false);
    };
    loadInstrument();
  }, [selectedInstrument, selectedQuality]);

  // Update drone root note

  // Update volumes
  useEffect(() => {
    piano.setVolume(pianoVolume);
  }, [pianoVolume]);

  // Load settings from localStorage
  useEffect(() => {
    const storedSettings = JSON.parse(localStorage.getItem('ChordTrainerSettings'));
    if (storedSettings) {
      setMode(storedSettings.mode || 'Chord Practice');
      setBpm(storedSettings.bpm || 40);
      setPianoVolume(storedSettings.pianoVolume || 1.0);
      setRootNote(storedSettings.rootNote || 'C');
      setSelectedKey(storedSettings.selectedKey || 'C Major'); // Load key training settings
    }
  }, []);

  // Save settings to localStorage
  function saveSettingsToLocalStorage() {
    const settings = {

      mode,
      bpm,
      pianoVolume,
      selectedKey, // Save key training settings
    };
    localStorage.setItem('ChordTrainerSettings', JSON.stringify(settings));
  }

  return {
    sound,
    bpm,
    pianoVolume,
    mode,
    setMode,
    setBpm,
    setPianoVolume,
    saveSettingsToLocalStorage,
  };
};

export default useChordGameSettings;
