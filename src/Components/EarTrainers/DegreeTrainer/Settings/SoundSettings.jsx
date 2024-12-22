import React, { useState } from 'react';
import { Grid, Button, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useTranslation } from 'react-i18next';
import { getSamplerInstance } from '@utils/ToneInstance'; // Import the sampler instance manager

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
  const { selectedInstrument, setSelectedInstrument } = settings;
  const samplerInstance = getSamplerInstance(); // Get the sampler instance to use changeSampler
  const [isSwitching, setIsSwitching] = useState(false); // State to manage button disable state
  const [selectedQuality, setSelectedQuality] = useState('low'); // Default quality level

  const handleInstrumentSelect = async (instrument) => {
    setIsSwitching(true); // Disable all buttons
    try {
      // Change the sampler to the selected instrument and quality
      await samplerInstance.changeSampler(instrument, selectedQuality);

      // Update the selected instrument in settings
      setSelectedInstrument(instrument);
      console.log(`Sampler successfully changed to: ${instrument} with quality: ${selectedQuality}`);

      // Play a cue sound using playNote from DegreeTrainerSettings
      playNote(); // Use the existing function to provide auditory feedback
    } catch (error) {
      console.error(`Error changing sampler to: ${instrument}`, error);
    } finally {
      setIsSwitching(false); // Re-enable all buttons
    }
  };

  const handleQualityChange = (event) => {
    setSelectedQuality(event.target.value);
    console.log(`Quality set to: ${event.target.value}`);
  };

  return (
    <>
      {/* Title */}
      <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
        {t('settings.SoundSettings')}
      </Typography>

      {/* Quality Selector */}
      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <InputLabel>{t('settings.qualityLabel')}</InputLabel>
        <Select
          value={selectedQuality}
          onChange={handleQualityChange}
          disabled={isSwitching} // Disable when switching instruments
        >
          <MenuItem value="low" sx={{color: (theme) => theme.palette.text.paper }}                 >{t('settings.quality.low')}</MenuItem>
          <MenuItem value="medium" sx={{color: (theme) => theme.palette.text.paper }}>{t('settings.quality.medium')}</MenuItem>
          <MenuItem value="high" sx={{color: (theme) => theme.palette.text.paper }}>{t('settings.quality.high')}</MenuItem>
          <MenuItem value="full" sx={{color: (theme) => theme.palette.text.paper }}>{t('settings.quality.full')}</MenuItem>
        </Select>
      </FormControl>

      {/* Instrument Buttons */}
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        {instrumentsList.map((instrument) => (
          <Grid item xs={6} key={instrument}>
            <Button
              variant={selectedInstrument === instrument ? 'contained' : 'outlined'} // Highlight selected instrument
              color="secondary"
              onClick={() => handleInstrumentSelect(instrument)}
              disabled={isSwitching} // Disable the button when switching
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

      {/* Home Button */}
      <Button
        color="secondary"
        onClick={() => setCurrentPage('home')}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          fontSize: '1.2rem',
          marginLeft: 'auto',
          marginTop: '1rem',
        }}
        disabled={isSwitching} // Disable Home button when switching
      >
        <HomeIcon />
      </Button>
    </>
  );
}

export default SoundSettings;
