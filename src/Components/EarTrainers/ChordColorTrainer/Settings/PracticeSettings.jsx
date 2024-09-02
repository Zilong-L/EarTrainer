import React, { useState, useEffect } from 'react';
import { Slider, Grid, Box, Checkbox, Typography, Divider, Button, FormControl, InputLabel,Input, Select, MenuItem, TextField, Accordion, AccordionSummary, AccordionDetails, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import * as Tone from 'tone';
import { CHORD_TYPES, chordPreset } from '@components/EarTrainers/ChordColorTrainer/Constants';

function PracticeSettings({ settings, setShowPracticeSettings }) {
  const { range, rootNote, bpm, degreeChordTypes, setRange, setRootNote, setBpm, setDegreeChordTypes, preset, setPreset, customPresets, setCustomPresets } = settings;
  const [newPresetName, setNewPresetName] = useState('');
  const [editingPreset, setEditingPreset] = useState(null);



  const handleChordTypeToggle = (degreeIndex, chordType) => {
    const newDegreeChordTypes = [...degreeChordTypes];
    const chordTypes = newDegreeChordTypes[degreeIndex].chordTypes;
    if (chordTypes.includes(chordType)) {
      newDegreeChordTypes[degreeIndex].chordTypes = chordTypes.filter(type => type !== chordType);
    } else {
      newDegreeChordTypes[degreeIndex].chordTypes.push(chordType);
    }
    setDegreeChordTypes(newDegreeChordTypes);
    setCustomPresets({ ...customPresets, [preset]: newDegreeChordTypes });
  };

  const handlePresetChange = (preset) => {
    setPreset(preset);
    if (preset === 'custom') {
      let newPresetName = '自定义1';
      let counter = 1;
      while (customPresets[newPresetName]) {
        counter++;
        newPresetName = `自定义${counter}`;
      }
      const updatedCustomPresets = { ...customPresets, [newPresetName]: chordPreset['custom'] };
      setCustomPresets(updatedCustomPresets);
      setPreset(newPresetName);
    } 
  };

  const handleDeleteCustomPreset = (presetName) => {
    const updatedCustomPresets = { ...customPresets };
    delete updatedCustomPresets[presetName];
    setCustomPresets(updatedCustomPresets);
    if (preset === presetName) {
      setPreset('major'); // 重置为默认预设
      setDegreeChordTypes(chordPreset['major']);
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
            {Object.keys(chordPreset).filter(presetName => presetName !== 'custom').map((presetName) => (
              <MenuItem disableRipple={true} key={presetName} value={presetName} sx={{color: 'text.paper'}}>
                {presetName}
              </MenuItem>
            ))}
            {Object.keys(customPresets).map((presetName) => (
              <MenuItem disableRipple={true} key={presetName} value={presetName} sx={{color: 'text.paper', display: 'flex', alignItems: 'center'}}>
                {editingPreset === presetName ? (
                  <div>
                    <Input
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      onKeyDown={(e) => {
                        e.stopPropagation(); // 阻止事件冒泡
                        if (e.key === 'Enter') handleSavePresetName();
                      }}
                      onBlur={handleSavePresetName}
                      autoFocus
                      size="small"
                      sx={{ color: 'text.paper'}} // 修改输入框里的字的颜色
                      onClick={(e) => e.stopPropagation()} // 阻止事件冒泡
                    />
                    <Button
                      onClick={handleSavePresetName}
                      sx={{ color: 'text.paper', marginLeft: 'auto' }}
                    >
                      保存
                    </Button>
                  </div>
                ) : (
                  <>
                    {presetName}
                    {preset !== presetName && (
                      <>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPresetName(presetName);
                          }}
                          size="small"
                          sx={{  marginLeft: 'auto',color: 'primary.main', '&:active': { animation: 'none' }, '&:focus': { animation: 'none' } }} // 禁止button active和focus的动画
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomPreset(presetName);
                          }}
                          size="small"
                          sx={{  color: 'error.main' }} // 禁止button active和focus的动画
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </>
                )}
              </MenuItem>
            ))}
            <MenuItem disableRipple={true} value="custom" sx={{color: 'text.paper'}}>自定义</MenuItem>

          </Select>
        </FormControl>
      </div>
      {!Object.keys(chordPreset).includes(preset) && (
        <div style={{ padding: '6px 8px', fontSize: '1.1rem' }} >
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
              sx={{ backgroundColor: 'primary.main', color: 'text.primary' }}
            >
              <Typography style={{ fontSize: '1.1rem' }}>编辑预设</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: 'primary.main', color: 'text.primary' }}>
              <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
                <Grid container spacing={1} sx={{ marginTop: '4px', paddingLeft: 0 }}>
                  {degreeChordTypes.map((degree, degreeIndex) => (
                    <Grid item xs={12} key={degree.degree} sx={{ padding: 0 }}>
                      <Divider />
                      <Typography variant="body2" sx={{ fontSize: '1.1rem', marginY: '12px' }}>
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
            </AccordionDetails>
          </Accordion>
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