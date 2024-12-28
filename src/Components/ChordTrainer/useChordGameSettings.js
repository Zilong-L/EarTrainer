import { useState, useEffect } from 'react';
import { getDroneInstance, getSamplerInstance } from '@utils/ToneInstance';

const useChordGameSettings = () => {
  const [mode, setMode] = useState('Chord Practice'); // Default mode: "Chord Practice"
  const [bpm, setBpm] = useState(40);
  const [selectedInstrument, setSelectedInstrument] = useState('bass-electric');
  const [pianoVolume, setPianoVolume] = useState(1.0);

  const drone = getDroneInstance();
  const piano = getSamplerInstance();

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
    bpm,
    pianoVolume,
    mode,
    selectedInstrument,
    setMode,
    setBpm,
    setPianoVolume,
    setSelectedInstrument,
    saveSettingsToLocalStorage,
  };
};

export default useChordGameSettings;
