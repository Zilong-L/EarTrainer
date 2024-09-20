import React, { useState } from 'react';
import { Modal, Box, Button, Container, Typography } from '@mui/material';
import PracticeSettings from './PracticeSettings';
import VolumeSettings from './VolumeSettings';
import Statistics from './StatisticsSettings';
import { useTranslation } from 'react-i18next';

function ChordColorTrainerSettings({
  isSettingsOpen,
  setIsSettingsOpen,
  playChord,
  settings,
}) {
  const { t } = useTranslation('chordTrainer');

  const {
    bpm,
    droneVolume,
    pianoVolume,
    rootNote,
    range,
    currentNotes,
    degreeChordTypes,
    preset,
    customPresets,
  } = settings;

  const [showPracticeSettings, setShowPracticeSettings] = useState(false);
  const [showVolumeSettings, setShowVolumeSettings] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);

  const closeSettings = () => {
    setIsSettingsOpen(false);
    setShowPracticeSettings(false);
    setShowVolumeSettings(false);
    setShowStatistics(false);
    playChord();
    saveSettingsToLocalStorage();
  };

  function saveSettingsToLocalStorage() {
    const settingsToSave = {
      bpm,
      droneVolume,
      pianoVolume,
      rootNote,
      range,
      currentNotes,
      degreeChordTypes,
      preset,
      customPresets,
    };
    localStorage.setItem('ChordColorTrainerSettings', JSON.stringify(settingsToSave));
  }

  return (
    <Modal
      open={isSettingsOpen}
      onClose={closeSettings}
      sx={{ color: (theme) => theme.palette.text.primary }}
    >
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
          {t('settingsMenu.settings')}
        </Typography>

        {!showPracticeSettings && !showVolumeSettings && !showStatistics ? (
          <>
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
                onClick={() => setShowPracticeSettings(true)}
              >
                {t('settingsMenu.practiceSettings')}
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
                onClick={() => setShowStatistics(true)}
              >
                {t('settingsMenu.statistics')}
              </Button>
              <Button
                sx={{
                  color: 'text.primary',
                  display: 'block',
                  fontSize: '1.5rem',
                  width: '100%',
                  textAlign: 'left',
                }}
                onClick={() => setShowVolumeSettings(true)}
              >
                {t('settingsMenu.volumeSettings')}
              </Button>
            </Container>
          </>
        ) : showPracticeSettings ? (
          <PracticeSettings
            settings={settings}
            setShowPracticeSettings={setShowPracticeSettings}
            customPresets={customPresets}
          />
        ) : showStatistics ? (
          <Statistics settings={settings} setShowStatistics={setShowStatistics} />
        ) : (
          <VolumeSettings settings={settings} setShowVolumeSettings={setShowVolumeSettings} />
        )}
      </Box>
    </Modal>
  );
}

export default ChordColorTrainerSettings;
