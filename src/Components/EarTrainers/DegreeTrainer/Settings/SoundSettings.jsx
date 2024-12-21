import React from 'react';
import { Grid, Button, Typography } from '@mui/material';
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

  const handleInstrumentSelect = async (instrument) => {
    try {
      // Change the sampler to the selected instrument
      await samplerInstance.changeSampler(instrument);

      // Update the selected instrument in settings
      setSelectedInstrument(instrument);
      console.log(`Sampler successfully changed to: ${instrument}`);

      // Play a cue sound using playNote from DegreeTrainerSettings
      playNote(); // Use the existing function to provide auditory feedback
    } catch (error) {
      console.error(`Error changing sampler to: ${instrument}`, error);
    }
  };

  return (
    <>
      {/* Title */}
      <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
        {t('settings.SoundSettings')}
      </Typography>

      {/* Instrument Buttons */}
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        {instrumentsList.map((instrument) => (
          <Grid item xs={6} key={instrument}>
            <Button
              variant={selectedInstrument === instrument ? 'contained' : 'outlined'} // Highlight selected instrument
              color="secondary"
              onClick={() => handleInstrumentSelect(instrument)}
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
      >
        <HomeIcon />
      </Button>
    </>
  );
}

export default SoundSettings;
