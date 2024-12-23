import React, { useState } from 'react';
import { Modal, Box, Button, Typography, Container } from '@mui/material';
import PracticeSettings from './PracticeSettings';
import VolumeSettings from './VolumeSettings';
import Statistics from './Statistics';
import SoundSettings from './SoundSettings'; // Import SoundSettings
import { useTranslation } from 'react-i18next';
import { settingsElementStyles } from '@ui/Styles';

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
          borderRadius: 2,
          height: '80vh',
          overflowY: 'auto',
        }}
      >

        {currentPage === 'home' && (
          <Box>
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
              <Typography
                variant="h4"
                sx={{
                  textAlign: 'center',
                  fontSize: '1.3rem',
                  height: '32px',
                  display: 'flex', // Enable flexbox
                  alignItems: 'center', // Center items vertically
                  justifyContent: 'center', // Center items horizontally (optional for single-line text)
                }}
              >
                {t('settings.Settings')}
              </Typography>
            </Box>
            <Box sx={{padding: '22px 32px'}}>
           
            <Button
            sx={settingsElementStyles}
           
              onClick={() => setCurrentPage('practice')}
              >
              {t('settings.PracticeSettings')}
            </Button>
           
           
            <Button
            sx={settingsElementStyles}
              onClick={() => setCurrentPage('statistics')}
              >
              {t('settings.Statistics')}
            </Button>
           
           
            <Button
            sx={settingsElementStyles}
              onClick={() => setCurrentPage('volume')}
              >
              {t('settings.VolumeSettings')}
            </Button>
           
           
            <Button
            sx={settingsElementStyles}
              onClick={() => setCurrentPage('sound')}
              >
              {t('settings.SoundSettings')}
            </Button>
           
              </Box>
      </Box>

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
