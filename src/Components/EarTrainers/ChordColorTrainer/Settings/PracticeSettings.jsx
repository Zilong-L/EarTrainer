import React, { useState } from 'react';
import { Slider, Grid, Box, Checkbox, Typography, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import * as Tone from 'tone';
import { CHORD_TYPES, chordPreset } from '@components/EarTrainers/ChordColorTrainer/Constants';

function PracticeSettings({ settings, setShowPracticeSettings }) {
  const { range, rootNote, bpm, degreeChordTypes, setRange, setRootNote, setBpm, setDegreeChordTypes, preset, setPreset } = settings;

  const handleChordTypeToggle = (degreeIndex, chordType) => {
    const newDegreeChordTypes = [...degreeChordTypes];
    const chordTypes = newDegreeChordTypes[degreeIndex].chordTypes;
    if (chordTypes.includes(chordType)) {
      newDegreeChordTypes[degreeIndex].chordTypes = chordTypes.filter(type => type !== chordType);
    } else {
      newDegreeChordTypes[degreeIndex].chordTypes.push(chordType);
    }
    setDegreeChordTypes(newDegreeChordTypes);
  };

  const handlePresetChange = (preset) => {
    setPreset(preset);
    if (preset === 'major') {
      setDegreeChordTypes(chordPreset.major);
    } else if (preset === 'minor') {
      setDegreeChordTypes(chordPreset.minor);
    }
  };

  return (
    <>
      

      <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
        <label id="note-range-slider" style={{ fontSize: '1.1rem' }}>
          Note Range
        </label>
        <Slider
          color='secondary'
          value={range.map(note => Tone.Frequency(note).toMidi())}
          valueLabelFormat={(value) => Tone.Frequency(value, 'midi').toNote()}
          onChange={(_, newValue) => {
            if (Math.abs(newValue[1] - newValue[0]) >= 12) {
              const newRange = newValue.map(midi => Tone.Frequency(midi, 'midi').toNote());
              setRange(newRange);
            }
          }}
          disableSwap
          min={Tone.Frequency('C2').toMidi()}
          max={Tone.Frequency('C6').toMidi()}
          valueLabelDisplay="auto"
          sx={{ '.MuiSlider-valueLabel': { fontSize: '1rem' } }}
        />
      </div>
      <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
        <label style={{ fontSize: '1.1rem' }}>Root Note</label>
        <Slider
          color='secondary'
          valueLabelFormat={(value) => Tone.Frequency(value, 'midi').toNote()}
          value={rootNote}
          onChange={(e, value) => setRootNote(value)}
          min={Tone.Frequency('C2').toMidi()}
          max={Tone.Frequency('C6').toMidi()}
          valueLabelDisplay="auto"
          sx={{ '.MuiSlider-valueLabel': { fontSize: '1rem' } }}
        />
      </div>
      <div style={{ padding: '6px 8px', }}>
        <label style={{ fontSize: '1.1rem' }}>BPM: </label>
        <Slider
          color='secondary'
          value={bpm}
          onChange={(e, value) => setBpm(value)}
          min={40}
          max={200}
          valueLabelDisplay="auto"
          sx={{ '.MuiSlider-valueLabel': { fontSize: '1rem' } }}
        />
      </div>
      <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
        <FormControl fullWidth>
          <InputLabel id="preset-selector-label" style={{ fontSize: '1.1rem' }}>选择预设</InputLabel>
          <Select
            labelId="preset-selector-label"
            id="preset-selector"
            value={preset}
            label="选择预设"
            onChange={(e) => handlePresetChange(e.target.value)}
            style={{ fontSize: '1.1rem' }}
           
          >
            <MenuItem value="major" sx={{color: 'text.paper'}}>大调</MenuItem>
            <MenuItem value="minor" sx={{color: 'text.paper'}}>小调</MenuItem>
            <MenuItem value="customize" sx={{color: 'text.paper'}}>自定义</MenuItem>
          </Select>
        </FormControl>
      </div>
      {preset === 'customize' && (
        <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
          <label style={{ fontSize: '1.1rem' }}>选择练习级数</label>
          <Grid container spacing={1} sx={{ marginTop: '4px', paddingLeft: 0 }}>
            {degreeChordTypes.map((degree, degreeIndex) => (
              <Grid item xs={12} key={degree.degree} sx={{ padding: 0 }}>
                <Typography variant="body2" sx={{ fontSize: '1.1rem', marginBottom: '4px' }}>
                  {degree.degree}
                </Typography>
                <Grid container spacing={1}>
                  {CHORD_TYPES.map((chordType, chordIndex) => (
                    <Grid item xs={4} key={chordType} sx={{ padding: 0 }}>
                      <Box
                        onClick={() => handleChordTypeToggle(degreeIndex, chordType)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          padding: '4px',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        <Checkbox
                          color='secondary'
                          checked={degree.chordTypes.includes(chordType)}
                          tabIndex={-1}
                          size="small"
                          sx={{ padding: '2px' }}
                        />
                        <Typography variant="body2" sx={{ marginLeft: '4px', fontSize: '1.1rem' }}>
                          {chordType}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            ))}
          </Grid>
        </div>
      )}

      <Button
        color='secondary'
        onClick={() => setShowPracticeSettings(false)}
        sx={{ display: 'flex', justifyContent: 'flex-center', fontSize: '1.2rem', marginLeft: 'auto' }}
      >
        <HomeIcon />
      </Button>
    </>
  );
}

export default PracticeSettings;