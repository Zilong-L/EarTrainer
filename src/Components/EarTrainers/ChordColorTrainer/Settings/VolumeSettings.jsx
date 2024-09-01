import React from 'react';
import { Slider, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

function VolumeSettings({ settings,setShowVolumeSettings }) {
  const { droneVolume, pianoVolume, setDroneVolume, setPianoVolume } = settings;

  return (
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
  );
}

export default VolumeSettings;