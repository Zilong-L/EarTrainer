import React, { useState, useEffect } from 'react';
import { CssBaseline, Paper, Box, Button, Typography, ToggleButton, AppBar, Tooltip, Toolbar, Container, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ReplayIcon from '@mui/icons-material/Replay';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import SettingsIcon from '@mui/icons-material/Settings';
import Sidebar from '@components/Sidebar';
import DegreeTrainerSettings from '@components/EarTrainers/DegreeTrainer/Settings';
import useDegreeTrainer from '@components/EarTrainers/DegreeTrainer/useDegreeTrainer';
import useDegreeTrainerSettings from '@components/EarTrainers/DegreeTrainer/useDegreeTrainerSettings';
import { apps, keyMap, degrees } from '@components/EarTrainers/DegreeTrainer/Constants';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import {Note}from 'tonal';

import * as Tone from 'tone';

let midi = null;
const EarTrainer = () => {
  const settings = useDegreeTrainerSettings();
  const { t } = useTranslation('degreeTrainer');
  const {
    currentNote,
    disabledNotes,
    gameState,
    filteredNotes,
    isAdvance,
    isCorrect,
    setActiveNote,
    setGameState,
    playNote
  } = useDegreeTrainer(settings);

  const {
    isStatOpen,
    rootNote,
    currentPracticeRecords,
    setMode,
    isHandfree,
    setIsHandfree,
    mode,
    currentLevel
  } = settings;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const openSettings = () => {
    setIsSettingsOpen(true);
    setGameState('paused');
    document.body.classList.add('modal-open');
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
    document.body.classList.remove('modal-open');
  };

  // Start game based on mode when component mounts


  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key;
      if (key === 'r') {
        playNote(currentNote);
        return;
      }

      let degreeIndex;
      if (keyMap[key] !== undefined) {
        degreeIndex = keyMap[key];
      }
      if (degreeIndex !== undefined) {
        const noteName = Note.pitchClass(Note.transpose(rootNote, degrees[degreeIndex].interval)); // 获取对应的音符名称
        // 模拟点击对应的按钮
        console.log('noteName', noteName);
        const button = document.querySelector(`button[data-note="${noteName}"]`);
        if (button) {
          button.click();
        }
      }
      console.log('key', key);
      // Hit the replay button if R or space is pressed

    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [filteredNotes, rootNote, currentNote]);

  useEffect(() => {
    const midiMessageHandler = (message) => {
      const [command, note, velocity] = message.data;
      if (command === 144 && velocity > 0) {
        const noteName = Tone.Frequency(note, 'midi').toNote(); // 获取当前音符名称
        setActiveNote(noteName)
      }

    };
    (async () => {
      if (navigator.requestMIDIAccess == null) {
        return;
      }
      if (midi == null) {
        midi = await navigator.requestMIDIAccess();
        
      }
      if (midi) {
        
        const inputs = midi.inputs.values();
        for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
          input.value.onmidimessage = midiMessageHandler
        }
      }
    })();
    return () => {
      
      if (midi) {
        const inputs = midi.inputs.values();
        for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
          input.value.onmidimessage = null
        }
      }
    }
  }, []);
  const renderRecords = () => {
    const totalResults = currentPracticeRecords

    return (
      <>
        {mode == 'challenge' && <Typography variant="body1" sx={{ color: (theme) => theme.palette.text.paper }}>{t('home.level')}: {currentLevel.level}</Typography>}
        <Typography variant="body1" sx={{ color: (theme) => theme.palette.text.paper }}>{t('home.totalAttempts')} {totalResults.total}{mode == 'challenge' && ` / ${currentLevel.minTests}`}</Typography>
        <Typography variant="body1" sx={{ color: (theme) => theme.palette.text.paper }}>{t('home.correctCount')} {totalResults.correct}</Typography>
        <Typography variant="body1" sx={{ color: (theme) => theme.palette.text.paper }}>
          {Math.round((totalResults.correct / totalResults.total).toFixed(2) * 100) >= 90 ? '⭐⭐⭐' :
           Math.round((totalResults.correct / totalResults.total).toFixed(2) * 100) >= 80 ? '⭐⭐' :
           Math.round((totalResults.correct / totalResults.total).toFixed(2) * 100) >= 70 ? '⭐' : ''}
        </Typography>
      </>
    );
  };

  return (
    <>
      <AppBar position="static" sx={{ boxShadow: 0, paddingX: '0.5rem' }}>
        <Toolbar sx={{ height: '64px', color: (theme) => theme.palette.text.primary }}>

          <Typography variant="h5" sx={{ flexGrow: 1, textAlign: 'left', color: (theme) => theme.palette.text.primary }}>
            <Link to="/ear-trainer" style={{ textDecoration: 'none', color: 'inherit' }}>
              {t('home.title')}
            </Link>
          </Typography>
          <Tooltip title={isHandfree ? t('buttons.handfreeOff') : t('buttons.handfreeOn')}>
            <ToggleButton
              value="check"
              selected={isHandfree}
              onChange={() => setIsHandfree(!isHandfree)}
              sx={{
                marginRight: '0.5rem', boxShadow: 'none',
                "&.Mui-selected, &.Mui-selected:hover": {
                  color: (theme) => theme.palette.text.paper,
                  backgroundColor: (theme) => theme.palette.background.paper
                },
                color: (theme) => theme.palette.text.primary,
                border: 'none'
              }}
            >
              <AllInclusiveIcon />
            </ToggleButton>
          </Tooltip>
          <Tooltip title={t("buttons.settings")}>
            <Button
              onClick={() => openSettings()}
              variant="contained"
              color="primary"
              sx={{ boxShadow: 'none', marginRight: '0.5rem' }}
            >
              <SettingsIcon />
            </Button>
          </Tooltip>

          
          <a
            href="https://blog.barnman.cc/music/degree-trainer-help"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', '@media (minWidth:600px)': { display: 'none' } }}
          >
            <Button
              variant="contained"
              color="primary"
              sx={{ boxShadow: 'none',  borderStyle: 'solid', borderColor: 'currentColor' }}
            >
              {t('buttons.help')}
            </Button>
          </a>

          {/* {apps.map((item) => (
            <Button
              variant="contained"
              key={item.name}
              component={Link}
              to={item.path}
              sx={{
                display: 'none',
                '@media (min-width:600px)': { display: 'block', boxShadow: 'none', textTransform: 'none' },
              }}
            >
              {t(`buttons.${item.name}`)}
            </Button>
          ))} */}
        </Toolbar>
      </AppBar>
      <Paper sx={{ borderRadius: 0 }}>
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: 'calc(100svh - 64px)',
            paddingY: '1rem',
            paddingX: '1.5rem',
          }}
        >
          <CssBaseline />
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          <div className="pr-4"> {/* Add right padding for scrollbar placeholder */}
            <DegreeTrainerSettings
              settings={settings}
              isSettingsOpen={isSettingsOpen}
              setIsSettingsOpen={closeSettings}
              playNote={playNote}
              setGameState={setGameState}
            />
          </div>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', marginBottom: '2rem' }}>
              {isStatOpen && renderRecords()}
              <Box sx={{ flexGrow: 1 }} />
              <Grid container spacing={2} sx={{ marginBottom: '1rem' }}>
                {filteredNotes.map((note) => {
                  const noteName = Tone.Frequency(Tone.Frequency(rootNote).toMidi() + note.distance, 'midi').toNote();
                  const isCorrectAnswer = isCorrect(noteName)
                  return (
                    <Grid item xs={4} key={note.name}>
                      <Button
                        variant="contained"
                        onClick={() => setActiveNote(noteName)}
                        fullWidth
                        sx={{
                          textTransform: 'none',
                          fontSize: '1.5rem',
                          height: '4rem',
                          background: disabledNotes.some(disabledNote => noteName.slice(0, -1) === disabledNote.slice(0, -1)) ?
                            (theme) => theme.palette.action.disabled :
                            isCorrectAnswer && isAdvance ?
                              (theme) => theme.palette.success.main :
                              'default',
                          color: isCorrectAnswer && isAdvance ?
                            (theme) => theme.palette.success.contrastText :
                            'default',
                          '&:hover': {
                            background: disabledNotes.some(
                              (disabledNote) => noteName.slice(0, -1) === disabledNote.slice(0, -1)
                            )
                              ? (theme) => theme.palette.action.disabled
                              : isCorrectAnswer && isAdvance
                                ? (theme) => theme.palette.success.main
                                : 'default',
                          },

                        }}
                        data-note={noteName.slice(0, -1)}
                      >
                        {note.name}
                      </Button>
                    </Grid>
                  );
                })}
              </Grid>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  if (gameState === 'end') {
                    setGameState('start');
                  } else {
                    playNote(currentNote);
                  }
                }}
                fullWidth
                sx={{
                  textTransform: 'none',
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 'auto',
                }}
              >
                {gameState === 'end' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <ReplayIcon sx={{ fontSize: '3rem' }} />
                )}
              </Button>
            </Box>
          
        </Container>
      </Paper>
      <Toaster />
    </>
  );
};

export default EarTrainer;
