import React, { useEffect, useState } from 'react';
import { Grid, Box, Button, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useTranslation } from 'react-i18next';


const instrumentsList = [
  'bass-electric',
  'bassoon',
  'cello',
  'clarinet',
  'contrabass',
  'flute',
  'french-horn',
  'guitar-acoustic',
  'guitar-electric',
  'guitar-nylon',
  'harmonium',
  'harp',
  'organ',
  'piano',
  'saxophone',
  'trombone',
  'trumpet',
  'tuba',
  'violin',
  'xylophone',
];

function SoundSettings({ settings, setCurrentPage, playNote }) {
  const { t } = useTranslation('degreeTrainer');
  const { selectedInstrument, setSelectedInstrument,isLoadingInstrument, setIsLoadingInstrument,selectedQuality , setSelectedQuality} = settings;

  const handleInstrumentSelect = (instrument) => {
    setSelectedInstrument(instrument); // Update the selected instrument
  };
  useEffect(() => {
    if(!isLoadingInstrument)
    {
      playNote()
    }
  },[isLoadingInstrument])

  const handleQualityChange = (event) => {
    setSelectedQuality(event.target.value);
    console.log(`Quality set to: ${event.target.value}`);
  };

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
          {t('settings.SoundSettings')}
        </Typography>
      </Box>
      {/* Quality Selector */}
      <Box sx={{ padding: '22px 32px' }}>
      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <InputLabel>{t('settings.qualityLabel')}</InputLabel>
        <Select
          value={selectedQuality}
          onChange={handleQualityChange}
          disabled={isLoadingInstrument} // Disable when switching instruments
        >
          <MenuItem value="low" sx={{ color: (theme) => theme.palette.text.paper }}                 >{t('settings.quality.low')}</MenuItem>
          <MenuItem value="medium" sx={{ color: (theme) => theme.palette.text.paper }}>{t('settings.quality.medium')}</MenuItem>
          <MenuItem value="high" sx={{ color: (theme) => theme.palette.text.paper }}>{t('settings.quality.high')}</MenuItem>
          <MenuItem value="full" sx={{ color: (theme) => theme.palette.text.paper }}>{t('settings.quality.full')}</MenuItem>
        </Select>
      </FormControl>

      {/* Instrument Buttons */}
      <Grid container spacing={2} >
        {instrumentsList.map((instrument) => (
          <Grid item xs={6} key={instrument}>
            <Button
              variant={selectedInstrument === instrument ? 'contained' : 'outlined'} // Highlight selected instrument
              color="secondary"
              onClick={() => handleInstrumentSelect(instrument)}
              disabled={isLoadingInstrument} // Disable the button when switching
              fullWidth
              sx={{
                textTransform: 'capitalize', // Keep instrument names readable
                justifyContent: 'center',
              }}
            >
              {t(`settings.instruments.${instrument}`)} {/* Use i18n to translate instrument names */}
            </Button>
          </Grid>
        ))}
      </Grid>
        </Box>


    </>
  );
}

export default SoundSettings;
