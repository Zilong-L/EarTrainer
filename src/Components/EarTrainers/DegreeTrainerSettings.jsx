import React, { useState } from 'react';
import { Modal, Box, Button, Slider, Checkbox, Typography, Grid } from '@mui/material';
import { getPianoInstance, getDroneInstance } from '@components/ToneInstance';
import * as Tone from 'tone';

function DegreeTrainerSettings({
  isSettingsOpen,
  setIsSettingsOpen,
  bpm,
  setBpm,
  droneVolume,
  setDroneVolume,
  pianoVolume,
  setPianoVolume,
  rootNote,
  setRootNote,
  range,
  setRange,
  currentNotes,
  setCurrentNotes
}) {
  const [showDegreeSettings, setShowDegreeSettings] = useState(false);
  const drone = getDroneInstance();
  const piano = getPianoInstance();
  let midiMin = drone.rootMin;
  let midiMax = drone.rootMax;

  const handleDegreeToggle = (index) => {
    const newNotes = [...currentNotes];
    newNotes[index].enable = !newNotes[index].enable;
    setCurrentNotes(newNotes);
  };
  const closeSettings = () => { setIsSettingsOpen(false); setShowDegreeSettings(false) }

  return (
    <Modal open={isSettingsOpen} onClose={closeSettings}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 300,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          height: '80vh',
          overflowY: 'auto',
        }}
      >
        <h2>设置</h2>

        {!showDegreeSettings ? (
          <>
            <Button sx={{display:'block'}} color='secondary' onClick={() => setShowDegreeSettings(true)}>选择练习级数</Button>
            <div style={{ padding: '6px 8px' }}>
              <label>BPM: </label>
              <Slider color='secondary' value={bpm} onChange={(e, value) => setBpm(value)} min={40} max={200} valueLabelDisplay="auto" />
            </div>
            <div style={{ padding: '6px 8px' }}>
              <label id="note-range-slider" >
                Note Range
              </label>
              <Slider
                color='secondary'
                value={range}
                valueLabelFormat={(value) => Tone.Frequency(value, 'midi').toNote()}
                onChange={(_, newValue) => {
                  if (Math.abs(newValue[1] - newValue[0]) >= 12) { // 确保范围至少有12个MIDI值
                    console.log(newValue);
                    setRange(newValue);
                  }
                }}
                disableSwap
                min={Tone.Frequency('C3').toMidi()}
                max={Tone.Frequency('C6').toMidi()}
                valueLabelDisplay="auto"
              />
            </div>
            <div style={{ padding: '6px 8px' }}>
              <label>Drone Volume</label>
              <Slider color='secondary' value={droneVolume} valueLabelFormat={(value) => Math.round(value * 100)} onChange={(e, value) => setDroneVolume(value)} min={0} max={1} step={0.01} valueLabelDisplay="auto" />
            </div>
            <div style={{ padding: '6px 8px' }}>
              <label>Piano Volume </label>
              <Slider color='secondary' valueLabelFormat={(value) => Math.round(value * 100)} value={pianoVolume} onChange={(e, value) => setPianoVolume(value)} min={0} max={1} step={0.01} valueLabelDisplay="auto" />
            </div>
            <div style={{ padding: '6px 8px' }}>
              <label>Root Note</label>
              <Slider color='secondary' valueLabelFormat={(value) => Tone.Frequency(value, 'midi').toNote()} value={rootNote} onChange={(e, value) => setRootNote(value)} min={midiMin} max={midiMax} valueLabelDisplay="auto" />
            </div>

          </>
        ) : (
          <>
            <Typography variant="h6" sx={{ paddingBottom: '1rem', paddingLeft: '6px' }}>选择要练习的级数</Typography>

            <Grid container spacing={1}>
              {currentNotes.map((note, index) => (
                <Grid item xs={4} key={note.name}>
                  <Box
                    onClick={() => handleDegreeToggle(index)}
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
                      checked={note.enable}
                      tabIndex={-1}
                      size="small"
                      sx={{ padding: '2px' }}
                    />
                    <Typography variant="body2" sx={{ marginLeft: '4px' }}>
                      {note.name}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Button
              color='secondary'
              onClick={() => setShowDegreeSettings(false)}
              sx={{ marginLeft: 'auto' }}
            >
              返回
            </Button>

          </>
        )}

      </Box>
    </Modal>
  );
}

export default DegreeTrainerSettings;
