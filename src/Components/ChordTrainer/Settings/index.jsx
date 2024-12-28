import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  Box,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import SoundSettings from './SoundSettings';
import ChordPracticeSettings from '@ChordTrainer/ChordGames/ChordPracticeGame/ChordPracticeSettings';
import DiatonicSettings from '@ChordTrainer/ChordGames/DiatonicGame/DiatonicSettings';

const Settings = ({ isOpen, setIsOpen, settings }) => {
  const { t } = useTranslation('chordGame');
  const globalSettings = settings.globalSettings;
  const chordPracticeSettings = settings.chordPracticeGameSettings;
  const diatonicGameSettings = settings.diatonicGameSettings;
  const { mode, setMode } = globalSettings;
  const [currentSettings, setCurrentSettings] = useState('Chord Practice'); // Track the current settings page

  const listItemStyles = {
    pl: 4,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const handleModeChange = (newMode) => {
    // Update both game mode and current settings page
    setMode(newMode);
    setCurrentSettings(newMode);
  };

  const handleSettingsChange = (settingsPage) => {
    // Update only the settings page, without affecting the game mode
    setCurrentSettings(settingsPage);
  };

  const renderModeContent = () => {
    if (currentSettings === 'Chord Practice') {
      return <ChordPracticeSettings chordPracticeSettings={chordPracticeSettings} />;
    } else if (currentSettings === 'Diatonic') {
      return (
        <DiatonicSettings diatonicGameSettings={diatonicGameSettings} />
      );
    } else if (currentSettings === 'Progression') {
      return (
        <List sx={{ color: (theme) => theme.palette.text.secondary }}>
          <ListItemText primary="Progression Mode Settings Coming Soon!" />
        </List>
      );
    } else if (currentSettings === 'Sound Settings') {
      return <SoundSettings settings={settings} />;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          bgcolor: (theme) => theme.palette.background.default,
        },
      }}
    >
      <DialogTitle >
        <Typography >{t('settings.title')}</Typography>
        <IconButton
          onClick={() => setIsOpen(false)}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-evenly',
            mb: 2,
            bgcolor: (theme) => theme.palette.background.paper,
            borderRadius: 1,
            py: 1,
          }}
        >
          {['Chord Practice', 'Diatonic', 'Progression'].map((m) => (
            <ListItemButton
              key={m}
              selected={currentSettings === m}
              onClick={() => handleModeChange(m)} // Update both mode and current settings
              sx={{ textAlign: 'center', flexGrow: 1 }}
            >
              <ListItemText primary={t(`settings.modes.${m.toLowerCase().replace(' ', '')}`)} />
            </ListItemButton>
          ))}
        </Box>

        {renderModeContent()}

        <Divider sx={{ my: 2 }} />

        <List>
          <ListItemButton
            onClick={() => handleSettingsChange('Sound Settings')} // Only update settings page
            selected={currentSettings === 'Sound Settings'}
            sx={listItemStyles}
          >
            <ListItemText primary={t('settings.modes.soundSettings')} />
          </ListItemButton>
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
