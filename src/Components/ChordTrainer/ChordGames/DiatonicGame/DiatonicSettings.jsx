import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import { Midi, Note } from 'tonal';
import { useTranslation } from 'react-i18next';

const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const DiatonicSettings = ({diatonicGameSettings}) => {
  const { t } = useTranslation('chordGame');
  
  const { rootNote, setRootNote, scaleType, setScaleType } = diatonicGameSettings;
  // Convert MIDI to flat notation

  const handleRootNoteChange = (event) => {
    const selectedNote = event.target.value;
    console.log(selectedNote);
    setRootNote(selectedNote); // Save MIDI value
  };

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        {t('settings.diatonic.title')}
      </Typography>

      {/* Root Note Selector */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>{t('settings.diatonic.rootNote')}</InputLabel>
        <Select value={rootNote} onChange={handleRootNoteChange}>
          {flatNotes.map((note) => (
            <MenuItem key={note} value={note}>
              {note}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Scale Type Selector */}
      <FormControl fullWidth>
        <InputLabel>{t('settings.diatonic.scaleType')}</InputLabel>
        <Select value={scaleType} onChange={(e) => setScaleType(e.target.value)}>
          <MenuItem value="major">{t('settings.diatonic.major')}</MenuItem>
          <MenuItem value="harmonic">{t('settings.diatonic.harmonicMinor')}</MenuItem>
          <MenuItem value="melodic">{t('settings.diatonic.melodicMinor')}</MenuItem>
          <MenuItem value="natural">{t('settings.diatonic.naturalMinor')}</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default DiatonicSettings;
