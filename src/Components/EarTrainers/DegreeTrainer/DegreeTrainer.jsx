import React, { useState, useEffect } from 'react';
import { CssBaseline, Paper, Box, Button, Typography, ToggleButton, AppBar, Tooltip, Toolbar, Container, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ReplayIcon from '@mui/icons-material/Replay';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import SettingsIcon from '@mui/icons-material/Settings';
import Sidebar from '@components/Sidebar';
import DegreeTrainerSettings from '@components/EarTrainers/DegreeTrainer/DegreeTrainerSettings';
import IntroModal from '@components/EarTrainers/DegreeTrainer/DegreeTrainerIntro';
import useDegreeTrainer from '@components/EarTrainers/DegreeTrainer/useDegreeTrainer';
import useDegreeTrainerSettings from '@components/EarTrainers/DegreeTrainer/useDegreeTrainerSettings';
import { apps, keyMap, degrees } from '@components/EarTrainers/DegreeTrainer/Constants';
import { useTranslation } from 'react-i18next';

import * as Tone from 'tone';

let midi = null;
const EarTrainer = () => {
  const settings = useDegreeTrainerSettings();
  const { t } = useTranslation('degreeTrainer');
  const {
    currentNote,
    disabledNotes,
    gameStarted,
    filteredNotes,
    isAdvance,
    isCorrect,
    setActiveNote,
    startGame,
    endGame,
    playNote
  } = useDegreeTrainer(settings);

  const {
    rootNote,
    practiceRecords,
    isHandfree,
    setIsHandfree,
  } = settings;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatOpen, setIsStatOpen] = useState(true);
  const [isIntroOpen, setIsIntroOpen] = useState(true);

  const handleIntroClose = () => {
    setIsIntroOpen(false);
    startGame();
  };
  useEffect(() => {
    return () => {
      endGame();
    }
  }, []);

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
        const selectedDegree = degrees[degreeIndex];
        const noteName = Tone.Frequency(rootNote + selectedDegree.distance, 'midi').toNote().slice(0, -1); // 获取对应的音符名称
        // 模拟点击对应的按钮
        const button = document.querySelector(`button[data-note="${noteName}"]`);
        if (button) {
          button.click();
        }
      }

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
        const noteWithoutOctave = noteName.slice(0, -1); // 去掉最后一位（八度）
        // 模拟点击对应的按钮，忽略八度
        // const buttons = document.querySelectorAll(`button[data-note="${noteWithoutOctave}"]`); // 匹配以音符字母开头的按钮

        // buttons.forEach(button => {
        //     button.click();
        // });
        setActiveNote(noteName)
      }

    };
    (async () => {
      if (navigator.requestMIDIAccess == null) {
        return;
      }
      if (midi == null) {
        midi = await navigator.requestMIDIAccess();
        console.log("MIDI loaded for degree trainer");
      }
      if (midi) {
        console.log('midi is already loaded, now register listener')
        const inputs = midi.inputs.values();
        for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
          input.value.onmidimessage = midiMessageHandler
        }
      }
    })();
    return () => {
      console.log('midi is not deleted, but delete listener')
      if (midi) {
        const inputs = midi.inputs.values();
        for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
          input.value.onmidimessage = null
        }
      }
    }
  }, []);
  const renderRecords = () => {
    const totalResults = Object.values(practiceRecords).reduce(
      (acc, record) => {
        acc.total += record.total;
        acc.correct += record.correct;
        return acc;
      },
      { total: 0, correct: 0 }
    );

    return (
      <>
        <Typography variant="body1" sx={{ color: (theme) => theme.palette.text.paper }}>{t('home.totalAttempts')} {totalResults.total}</Typography>
        <Typography variant="body1" sx={{ color: (theme) => theme.palette.text.paper }}>{t('home.correctCount')} {totalResults.correct}</Typography>
        <Typography variant="body1" sx={{ color: (theme) => theme.palette.text.paper }}>
          {t('home.accuracyRate')} {totalResults.total > 0 ? Math.round((totalResults.correct / totalResults.total).toFixed(2) * 100) + '%' : '0%'}
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
          <Tooltip title={isHandfree?t('buttons.handfreeOff'):t('buttons.handfreeOn')}>
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
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              variant="contained"
              color="primary"
              sx={{ boxShadow: 'none' }}
            >
              <SettingsIcon />
            </Button>
          </Tooltip>
          <Button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            variant="contained"
            color="primary"
            sx={{ boxShadow: 'none', '@media (min-width:600px)': { display: 'none' } }}
          >
            <MenuIcon />
          </Button>
          {apps.map((item) => (
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
          ))}
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
          <DegreeTrainerSettings
            settings={settings}
            isSettingsOpen={isSettingsOpen}
            setIsSettingsOpen={setIsSettingsOpen}
            playNote={playNote}
            isStatOpen={isStatOpen}
            setIsStatOpen={setIsStatOpen}
          />
          <IntroModal isOpen={isIntroOpen} handleClose={handleIntroClose} />
          {gameStarted && (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', marginBottom: '2rem' }}>
              {isStatOpen && renderRecords()}
              <Box sx={{ flexGrow: 1 }} />
              <Grid container spacing={2} sx={{ marginBottom: '1rem' }}>
                {filteredNotes.map((note) => {
                  const noteName = Tone.Frequency(rootNote + note.distance, 'midi').toNote();
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
                onClick={() => playNote(currentNote)}
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
                <ReplayIcon sx={{ fontSize: '3rem' }} />
              </Button>
            </Box>
          )}
        </Container>
      </Paper>
    </>
  );
};

export default EarTrainer;