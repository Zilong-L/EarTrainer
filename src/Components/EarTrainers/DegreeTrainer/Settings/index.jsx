import React, { useState } from 'react';
import { Modal, Box, Button, Typography, Container } from '@mui/material';
import PracticeSettings from './PracticeSettings';
import VolumeSettings from './VolumeSettings';
import Statistics from './Statistics';
import SoundSettings from './SoundSettings'; // Import SoundSettings
import { useTranslation } from 'react-i18next';

function DegreeTrainerSettings({ settings, isSettingsOpen, setIsSettingsOpen, playNote }) {
  const { t } = useTranslation('degreeTrainer');
  const [currentPage, setCurrentPage] = useState('home'); // Tracks which sub-page to display

  const closeSettings = () => {
    setIsSettingsOpen(false);
    setCurrentPage('home');
    playNote();
    settings.saveSettingsToLocalStorage(); // Save settings on close
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
          bgcolor: (theme) => theme.palette.background.modal,
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          height: '80vh',
          overflowY: 'auto',
        }}
      >
        <Typography variant="h4" sx={{ textAlign: 'center' }}>
          {t('settings.Settings')}
        </Typography>
        {currentPage === 'home' && (
          <Container sx={{ marginTop: '3rem' }}>
            <Button
              sx={{
                color: 'text.primary',
                display: 'block',
                fontSize: '1.5rem',
                width: '100%',
                textAlign: 'left',
                marginBottom: '1rem',
              }}
              onClick={() => setCurrentPage('practice')}
            >
              {t('settings.PracticeSettings')}
            </Button>
            <Button
              sx={{
                color: 'text.primary',
                display: 'block',
                fontSize: '1.5rem',
                width: '100%',
                textAlign: 'left',
                marginBottom: '1rem',
              }}
              onClick={() => setCurrentPage('statistics')}
            >
              {t('settings.Statistics')}
            </Button>
            <Button
              sx={{
                color: 'text.primary',
                display: 'block',
                fontSize: '1.5rem',
                width: '100%',
                textAlign: 'left',
                marginBottom: '1rem',
              }}
              onClick={() => setCurrentPage('volume')}
            >
              {t('settings.VolumeSettings')}
            </Button>
            <Button
              sx={{
                color: 'text.primary',
                display: 'block',
                fontSize: '1.5rem',
                width: '100%',
                textAlign: 'left',
              }}
              onClick={() => setCurrentPage('sound')}
            >
              {t('settings.SoundSettings')}
            </Button>
          </Container>
        )}
        {currentPage === 'practice' && (
          <PracticeSettings settings={settings} setCurrentPage={setCurrentPage} />
        )}
        {currentPage === 'volume' && (
          <VolumeSettings settings={settings} setCurrentPage={setCurrentPage} />
        )}
        {currentPage === 'statistics' && (
          <Statistics settings={settings} setCurrentPage={setCurrentPage} />
        )}
        {currentPage === 'sound' && (
          <SoundSettings settings={settings} setCurrentPage={setCurrentPage} playNote={playNote} />
        )}
      </Box>
    </Modal>
  );
}

export default DegreeTrainerSettings;
