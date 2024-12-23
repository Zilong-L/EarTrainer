import React from 'react';
import { Box, Typography, Slider, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useTranslation } from 'react-i18next';
import {settingsElementStyles} from '@ui/Styles';
function VolumeSettings({ settings, setCurrentPage }) {
  const { t } = useTranslation('degreeTrainer');
  const { droneVolume, setDroneVolume, pianoVolume, setPianoVolume } = settings;

  return (
    <>
    <Box
        sx={{
          position: 'sticky', // Keeps the banner fixed at the top during scrolling
          top: 0,
          left: 0,
          width: '100%', // Full width of the screen
          backdropFilter: 'blur(20px)', // Blur effect for the banner
          zIndex: 1000, // Ensure it stays above other content
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center', // Center the text
          padding: '16px 16px',
        }}
      >
        {/* Home Button */}
        <Button
          color="secondary"
          onClick={() => setCurrentPage('home')}
          sx={{
            position: 'absolute', // Position it without affecting layout
            left: '10px', // Offset from the left edge
            top: '50%', // Vertically align center
            transform: 'translateY(-50%)', // Adjust for the button's height
            fontSize: '1.2rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <HomeIcon />
        </Button>

        {/* Centered Text */}
        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          {t('settings.VolumeSettings')}
        </Typography>
      </Box>
      {/* Quality Selector */}
      <Box sx={{ padding: '22px 32px' }}>
      <div style={settingsElementStyles}>
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
      <div style={settingsElementStyles}>
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
   
      </Box>
    </>
  );
}

export default VolumeSettings;
