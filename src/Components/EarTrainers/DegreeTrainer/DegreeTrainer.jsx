import React, { useState, useEffect } from 'react';
import FreeMode from '@components/EarTrainers/DegreeTrainer/Games/Free';
import ChallengeMode from '@components/EarTrainers/DegreeTrainer/Games/Challenge';
import { CssBaseline, Paper, Box, Button, Typography, ToggleButton, AppBar, Tooltip, Toolbar, Container, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import SettingsIcon from '@mui/icons-material/Settings';
import Sidebar from '@components/Sidebar';
import DegreeTrainerSettings from '@components/EarTrainers/DegreeTrainer/Settings';
import useFreeTrainer from '@components/EarTrainers/DegreeTrainer/Games/Free/useFreeTrainer';
import useChallengeTrainer from '@components/EarTrainers/DegreeTrainer/Games/Challenge/useChallengeTrainer';
import useDegreeTrainerSettings from '@components/EarTrainers/DegreeTrainer/Settings/useDegreeTrainerSettings';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import { keyMap,degrees } from '@components/EarTrainers/DegreeTrainer/Constants';
import {Note } from 'tonal';
import * as Tone from 'tone';


let midi = null;
const EarTrainer = () => {
  const globalSettings = useDegreeTrainerSettings();
  const { t } = useTranslation('degreeTrainer');
  const {
      isHandfree,
    setIsHandfree,
    mode,
  } = globalSettings;

  const FreeTrainerSettings = useFreeTrainer(globalSettings);
  const ChallengeTrainerSettings = useChallengeTrainer(globalSettings);

  const settings = {...globalSettings, FreeTrainerSettings, ChallengeTrainerSettings};
  const currentGameSettings = mode === 'free' ? FreeTrainerSettings : ChallengeTrainerSettings;
  const {
    playNote, 
    rootNote ,
    setActiveNote,
    filteredNotes,  
    setGameState,
    currentNote,
  } = currentGameSettings;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const openSettings = () => {
    setIsSettingsOpen(true);
    setGameState((pre)=>pre=='playing'?'paused':pre);
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
        const enharmonicNote = Note.enharmonic(noteName); // 获取对应的音符名称


        // 模拟点击对应的按钮
        const button1 = document.querySelector(`button[data-note="${noteName}"]`);
        const button2 = document.querySelector(`button[data-note="${enharmonicNote}"]`);
        if (button1) {
          button1.click();
        }
        if (button2) {
          button2.click();
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
      console.log('message', message);

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
            href="https://barnman.cc/music/degree-trainer-help"
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
            {mode === 'free' ? (
              <FreeMode 
                FreeTrainerSettings={FreeTrainerSettings}
              />
            ) : (
              <ChallengeMode 
              ChallengeTrainerSettings={ChallengeTrainerSettings}
              />
            )}
          
        </Container>
      </Paper>
      <Toaster />
    </>
  );
};

export default EarTrainer;
