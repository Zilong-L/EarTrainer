import React from 'react';
import { Box, Typography, Slider, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useTranslation } from 'react-i18next';

function VolumeSettings({ settings, setCurrentPage }) {
  const { t } = useTranslation('degreeTrainer');
  const { droneVolume, setDroneVolume, pianoVolume, setPianoVolume } = settings;

  return (
    <>
      <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
        <label style={{ fontSize: '1.1rem' }}>{t('settings.DroneVolume')}</label>
        <Slider
          color="secondary"
          value={droneVolume}
          valueLabelFormat={(value) => Math.round(value * 100)}
          onChange={(e, value) => setDroneVolume(value)}
          min={0}
          max={1}
          step={0.01}
          valueLabelDisplay="auto"
          sx={{ '.MuiSlider-valueLabel': { fontSize: '1rem' } }}
        />
      </div>
      <div style={{ padding: '6px 8px', fontSize: '1.1rem' }}>
        <label style={{ fontSize: '1.1rem' }}>{t('settings.PianoVolume')}</label>
        <Slider
          color="secondary"
          value={pianoVolume}
          valueLabelFormat={(value) => Math.round(value * 100)}
          onChange={(e, value) => setPianoVolume(value)}
          min={0}
          max={1}
          step={0.01}
          valueLabelDisplay="auto"
          sx={{ '.MuiSlider-valueLabel': { fontSize: '1rem' } }}
        />
      </div>
      <Button
        color="secondary"
        onClick={() => setCurrentPage('home')}
        sx={{ display: 'flex', justifyContent: 'flex-center', fontSize: '1.2rem', marginLeft: 'auto' }}
      >
        <HomeIcon />
      </Button>
    </>
  );
}

export default VolumeSettings;
