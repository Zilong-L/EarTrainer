import { useState, useEffect } from 'react';
import { getDroneInstance, getSamplerInstance } from '@utils/ToneInstance';

const useChordGameSettings = () => {
  const [mode, setMode] = useState('Chord Practice'); // Default mode: "Chord Practice"
  const [bpm, setBpm] = useState(40);
  const [selectedInstrument, setSelectedInstrument] = useState('bass-electric');
  const [pianoVolume, setPianoVolume] = useState(1.0);
  const [rootNote, setRootNote] = useState('C');
  const [scaleType, setScaleType] = useState('major');
  const [chordType, setChordType] = useState('Major');
  const [ignoreTranspose,setIgnoreTranspose] = useState(true);
  // New state for Key Training
  const [selectedKey, setSelectedKey] = useState('C Major'); // Default key for Key Training

  const drone = getDroneInstance();
  const piano = getSamplerInstance();

  // Update drone root note

  console.log("mode: ", mode);
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
      rootNote,
      selectedKey, // Save key training settings
    };
    localStorage.setItem('ChordTrainerSettings', JSON.stringify(settings));
  }

  return {
    bpm,
    pianoVolume,
    rootNote,
    mode,
    selectedInstrument,
    chordType,
    ignoreTranspose,
    scaleType,
    selectedKey, // Expose selected key for Key Training
    setScaleType,
    setChordType,
    setMode,
    setBpm,
    setPianoVolume,
    setRootNote,
    setSelectedInstrument,
    setSelectedKey, // Setter for selected key
    saveSettingsToLocalStorage,
  };
};

export default useChordGameSettings;
