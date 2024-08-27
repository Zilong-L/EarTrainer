import React, { useState } from 'react';
import { Modal, Box, Button, Slider, Checkbox, Typography, Grid } from '@mui/material';
import { getPianoInstance, getDroneInstance } from '@components/ToneInstance';
import HomeIcon from '@mui/icons-material/Home';
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
  setCurrentNotes,
  playNote
}) {
  const [showDegreeSettings, setShowDegreeSettings] = useState(false);
  const [showVolumeSettings, setShowVolumeSettings] = useState(false);
  const drone = getDroneInstance();
  const piano = getPianoInstance();
  let midiMin = drone.rootMin;
  let midiMax = drone.rootMax;

  const handleDegreeToggle = (index) => {
    const newNotes = [...currentNotes];
    newNotes[index].enable = !newNotes[index].enable;
    setCurrentNotes(newNotes);
  };
  
  const closeSettings = () => {
    setIsSettingsOpen(false);
    setShowDegreeSettings(false);
    setShowVolumeSettings(false);
    playNote();
  };

  return (
    <Modal open={isSettingsOpen} onClose={closeSettings}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: 500,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          height: '80vh',
          overflowY: 'auto',
        }}
      >
        <h2 style={{ fontSize: '2rem', textAlign: 'center' }}>设置</h2>

        {!showDegreeSettings && !showVolumeSettings ? (
          <>
            <Button sx={{ display: 'block', fontSize: '1.5rem', width: '100%', textAlign: 'left', marginBottom: '1rem' }} color='secondary' onClick={() => setShowDegreeSettings(true)}>
              练习设置
            </Button>
            <Button sx={{ display: 'block', fontSize: '1.5rem', width: '100%', textAlign: 'left' }} color='secondary' onClick={() => setShowVolumeSettings(true)}>
              音量设置
            </Button>
          </>
        ) : showDegreeSettings ? (
          <>
            
           

            
            <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
              <label id="note-range-slider" style={{ fontSize: '1.1rem' }}>
                Note Range
              </label>
              <Slider
                color='secondary'
                value={range}
                valueLabelFormat={(value) => Tone.Frequency(value, 'midi').toNote()}
                onChange={(_, newValue) => {
                  if (Math.abs(newValue[1] - newValue[0]) >= 12) {
                    console.log(newValue);
                    setRange(newValue);
                  }
                }}
                disableSwap
                min={Tone.Frequency('C3').toMidi()}
                max={Tone.Frequency('C6').toMidi()}
                valueLabelDisplay="auto"
                sx={{ '.MuiSlider-valueLabel': { fontSize: '1rem' } }}
              />
            </div>
            <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
              <label style={{ fontSize: '1.1rem' }}>Root Note</label>
              <Slider color='secondary' valueLabelFormat={(value) => Tone.Frequency(value, 'midi').toNote()} value={rootNote} onChange={(e, value) => setRootNote(value)} min={midiMin} max={midiMax} valueLabelDisplay="auto" sx={{ '.MuiSlider-valueLabel': { fontSize: '1rem' } }} />
            </div>
            <div style={{ padding: '6px 8px', }}>
              <label style={{ fontSize: '1.1rem' }}>BPM: </label>
              <Slider color='secondary' value={bpm} onChange={(e, value) => setBpm(value)} min={40} max={200} valueLabelDisplay="auto" sx={{ '.MuiSlider-valueLabel': { fontSize: '1rem' } }} />
            </div>
            <div style={{ padding: '6px 8px',fontSize: '1.1rem' }}>
              <label style={{ fontSize: '1.1rem' }}>选择练习级数</label>
              <Grid container spacing={1}sx={{marginTop:'4px',paddingLeft:0}}>
                {currentNotes.map((note, index) => (
                  <Grid item xs={4} key={note.name} sx={{padding:0}}>
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
                      <Typography variant="body2" sx={{ marginLeft: '4px', fontSize: '1.1rem' }}>
                        {note.name}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </div>
            <Button
              color='secondary'
              onClick={() => setShowDegreeSettings(false)}
              sx={{ display: 'flex', justifyContent: 'flex-center', fontSize: '1.2rem', marginLeft: 'auto' }}
            >
              <HomeIcon/>
            </Button>
          </>
        ) : (
          <>

            <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
              <label style={{ fontSize: '1.1rem' }}>Drone Volume</label>
              <Slider color='secondary' value={droneVolume} valueLabelFormat={(value) => Math.round(value * 100)} onChange={(e, value) => setDroneVolume(value)} min={0} max={1} step={0.01} valueLabelDisplay="auto" sx={{ '.MuiSlider-valueLabel': { fontSize: '1rem' } }} />
            </div>
            <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
              <label style={{ fontSize: '1.1rem' }}>Piano Volume </label>
              <Slider color='secondary' valueLabelFormat={(value) => Math.round(value * 100)} value={pianoVolume} onChange={(e, value) => setPianoVolume(value)} min={0} max={1} step={0.01} valueLabelDisplay="auto" sx={{ '.MuiSlider-valueLabel': { fontSize: '1rem' } }} />
            </div>
            
            <Button
              color='secondary'
              onClick={() => setShowVolumeSettings(false)}
              sx={{ display: 'flex', justifyContent: 'flex-center', fontSize: '1.2rem', marginLeft: 'auto' }}
            >
              <HomeIcon/>
            </Button>
          </>
        )}
      </Box>
    </Modal>
  );
}

export default DegreeTrainerSettings;
