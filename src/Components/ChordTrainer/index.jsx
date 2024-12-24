import React, { useState } from 'react';
import {
  CssBaseline,
  Container,
  Paper,
  Box,
  Button,
  Typography,
  AppBar,
  Toolbar,
} from '@mui/material';
import { Link } from 'react-router-dom';
import Sidebar from '@components/Sidebar'; // App-switching sidebar
import ChordPracticeGame from '@ChordTrainer/ChordGames/ChordPracticeGame'; // Practice mode component
import DiatonicGame from '@ChordTrainer/ChordGames//DiatonicGame'; // Diatonic mode component
// import ProgressionGame from './ProgressionGame'; // Progression mode component
import MenuIcon from '@mui/icons-material/Menu';
import Settings from './Settings'; // Settings modal
import useChordGameSettings from '@ChordTrainer/ChordGames/useChordGameSettings';
import { useTranslation } from 'react-i18next'; // Translation hook

const apps = [
  { name: 'earTrainer', path: '/ear-trainer' },
  { name: 'chordTrainer', path: '/chord-trainer' },
];

const ChordTrainer = () => {
  const { t } = useTranslation('chordGame'); // Translation namespace
  const [isAppSidebarOpen, setIsAppSidebarOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const settings = useChordGameSettings();
  const { mode } = settings; // Access the current mode from settings

  const renderGameMode = () => {
    switch (mode) {
      case 'Chord Practice':
        return <ChordPracticeGame settings={settings} />;
      case 'Diatonic':
        {
        return <DiatonicGame settings={settings} />;
        }
      case 'Progression':
        return <div>Progression Mode Coming Soon!</div>;
      default:
        return null;
    }
  };

  return (
    <>
      <AppBar position="static" sx={{ boxShadow: 0 }}>
        <Toolbar sx={{ color: (theme) => theme.palette.text.primary }}>
          <Typography variant="h6" sx={{ marginLeft: '15px', flexGrow: 1 }}>
            {t('trainer.title')} {/* Translate 'Chord Trainer' */}
          </Typography>
          {apps.map((item) => (
            <Button
              variant="contained"
              component={Link}
              to={item.path}
              key={item.name}
              sx={{
                display: 'none',
                '@media (min-width:600px)': { display: 'block', boxShadow: 'none', textTransform: 'none' },
              }}
            >
              {t(`trainer.apps.${item.name}`)} {/* Translate app names */}
            </Button>
          ))}
          <Button
            onClick={() => setIsSettingsModalOpen(true)} // Open settings modal
            variant="contained"
            sx={{ ml: 2, boxShadow: 'none' }}
          >
            {t('trainer.settings')} {/* Translate 'Settings' */}
          </Button>
          <Button
            onClick={() => setIsAppSidebarOpen(!isAppSidebarOpen)}
            variant="contained"
            color="primary"
            sx={{
              boxShadow: 'none',
              '@media (min-width:600px)': { display: 'none' }, // Hide on larger screens
            }}
          >
            <MenuIcon />
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'row' }}>
        {/* App-Switching Sidebar */}
        <Sidebar isOpen={isAppSidebarOpen} setIsOpen={setIsAppSidebarOpen} />

        {/* Main Content */}
        <CssBaseline />
        <Paper
          sx={{
            flexGrow: 1,
            padding: '100px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'auto',
            position: 'relative',
            color: (theme) => theme.palette.text.secondary,
          }}
        >
          <Container maxWidth="lg">{renderGameMode()}</Container> {/* Render appropriate game mode */}
        </Paper>
      </Box>

      {/* Settings Modal */}
      <Settings
        isOpen={isSettingsModalOpen}
        setIsOpen={setIsSettingsModalOpen}
        settings={settings}
      />
    </>
  );
};

export default ChordTrainer;
