import React, { useState } from 'react';
import {
  Grid,
  Box,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getSamplerInstance } from '@utils/ToneInstance';

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

function SoundSettings({ settings, setCurrentPage }) {
  const { t } = useTranslation('chordGame'); 
  const { selectedInstrument, setSelectedInstrument } = settings;
  const samplerInstance = getSamplerInstance(); // Sampler instance for sound handling
  const [isSwitching, setIsSwitching] = useState(false); // State to manage button disable state
  const [selectedQuality, setSelectedQuality] = useState('low'); // Default quality level

  const playNote = () => {
    const sampler = samplerInstance.sampler;
    sampler.triggerAttackRelease('C4', '8n');
  };

  const handleInstrumentSelect = async (instrument) => {
    setIsSwitching(true); // Disable all buttons during switching
    try {
      // Change the sampler to the selected instrument and quality
      await samplerInstance.changeSampler(instrument, selectedQuality);

      // Update the selected instrument in settings
      setSelectedInstrument(instrument);
      console.log(
        `Sampler successfully changed to: ${instrument} with quality: ${selectedQuality}`
      );

      // Play a cue sound using playNote
      playNote();
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
      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          left: 0,
          width: '100%',
          backdropFilter: 'blur(20px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        
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
            disabled={isSwitching} // Disable during instrument switching
          >
            <MenuItem value="low">{t('settings.quality.low')}</MenuItem>
            <MenuItem value="medium">{t('settings.quality.medium')}</MenuItem>
            <MenuItem value="high">{t('settings.quality.high')}</MenuItem>
            <MenuItem value="full">{t('settings.quality.full')}</MenuItem>
          </Select>
        </FormControl>

        {/* Instrument Buttons */}
        <Grid container spacing={2}>
          {instrumentsList.map((instrument) => (
            <Grid item xs={6} key={instrument}>
              <Button
                variant={
                  selectedInstrument === instrument ? 'contained' : 'outlined'
                } // Highlight selected instrument
                color="secondary"
                onClick={() => handleInstrumentSelect(instrument)}
                disabled={isSwitching} // Disable the button when switching
                fullWidth
                sx={{
                  textTransform: 'capitalize', // Keep instrument names readable
                  justifyContent: 'center',
                }}
              >
                {t(`settings.instruments.${instrument}`)}{' '}
                {/* Use i18n for instrument names */}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}

export default SoundSettings;
