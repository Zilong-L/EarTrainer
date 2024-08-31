import React, { useState, useEffect } from 'react';
import { CssBaseline, Box, Button, Typography, AppBar,Paper, Toolbar, Container, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ReplayIcon from '@mui/icons-material/Replay';
import SettingsIcon from '@mui/icons-material/Settings';
import Sidebar from '@components/Sidebar';
import SequenceTrainerSettings from '@components/EarTrainers/SequenceTrainer/SequenceTrainerSettings';
import IntroModal from '@components/EarTrainers/SequenceTrainer/SequenceTrainerIntro';
import useSequenceTrainer from '@components/EarTrainers/SequenceTrainer/useSequenceTrainer';
import useSequenceTrainerSettings from '@components/EarTrainers/SequenceTrainer/useSequenceTrainerSettings';
import { apps, keyMap, degrees } from '@utils/Constants';
import * as Tone from 'tone';

let midi = null;
const SequenceTrainer = () => {
  const settings = useSequenceTrainerSettings();
  const {
    currentSequence,
    sequenceIndex,
    disabledNotes,
    gameStarted,
    filteredNotes,
    setActiveNote,
    startGame,
    endGame,
    playSequence,
  } = useSequenceTrainer(settings);
  const {
    bpm,
    currentNotes,
    practiceRecords,
    droneVolume,
    pianoVolume,
    rootNote,
    range,
    sequenceLength,
    setBpm,
    setDroneVolume,
    setPianoVolume,
    setRootNote,
    setRange,
    setCurrentNotes,
    setPracticeRecords,
    setSequenceLength,
    saveSettings
  } = settings;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatOpen, setIsStatOpen] = useState(true);
  const [isIntroOpen, setIsIntroOpen] = useState(true);

  const handleIntroClose = () => {
    setIsIntroOpen(false);
    startGame();
  };

  const handleReplay = () => {
    playSequence(0);
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      const now = new Date();
      console.log(`Current Date and Time: ${now.toISOString()}`);
      const key = event.key;
      if (key === 'r') {
        handleReplay();
        return;
      }

      let degreeIndex;
      if (keyMap[key] !== undefined) {
        degreeIndex = keyMap[key];
      }
      if (degreeIndex !== undefined) {
        const selectedDegree = degrees[degreeIndex];
        const noteName = Tone.Frequency(rootNote + selectedDegree.distance, 'midi').toNote().slice(0, -1);
        const button = document.querySelector(`button[data-note="${noteName}"]`);
        if (button) {
          button.click();
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [filteredNotes, rootNote, currentSequence]);

  useEffect(() => {
    const midiMessageHandler = (message) => {
      const [command, note, velocity] = message.data;
      if (command === 144 && velocity > 0) {
        const noteName = Tone.Frequency(note, 'midi').toNote();
        const noteWithoutOctave = noteName.slice(0, -1);
        setActiveNote(noteName);
      }
    };
    (async () => {
      if (navigator.requestMIDIAccess == null) {
        return;
      }
      if (midi == null) {
        midi = await navigator.requestMIDIAccess();
        console.log("MIDI loaded for sequence trainer");
      }
      if (midi) {
        console.log('midi is already loaded, now register listener');
        const inputs = midi.inputs.values();
        for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
          input.value.onmidimessage = midiMessageHandler;
        }
      }
    })();
    return () => {
      console.log('midi is not deleted, but delete listener');
      if(midi){
        const inputs = midi.inputs.values();
        for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
          input.value.onmidimessage = null;
        }
      }
      endGame();
    };
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
        <Typography variant="body1" sx={{ color: (theme) => theme.palette.text.paper }}>总尝试: {totalResults.total}</Typography>
        <Typography variant="body1" sx={{ color: (theme) => theme.palette.text.paper }}>正确数: {totalResults.correct}</Typography>
        <Typography variant="body1" sx={{ color: (theme) => theme.palette.text.paper }}>
          正确率: {totalResults.total > 0 ? Math.round((totalResults.correct / totalResults.total).toFixed(2) * 100) + '%' : '0%'}
        </Typography>
      </>
    );
  };

  const renderSequenceProgress = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        {currentSequence.map((note, index) => (
          <Box
            key={index}
            sx={{
              width: '2rem',
              height: '2rem',
              backgroundColor: index === sequenceIndex ? 'primary.main' : 'grey.300',
              margin: '0 0.5rem',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
            }}
          >
            {index + 1}
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <>
      <AppBar position="static" sx={{ boxShadow: 0, paddingX: '0.5rem' }}>
        <Toolbar sx={{ color: (theme) => theme.palette.text.primary, height: '64px' }}>
          <Typography variant="h5" sx={{ flexGrow: 1, textAlign: 'left' }}>
            <Link to="/ear-trainer" style={{ textDecoration: 'none', color: 'inherit' }}>
              Ear Trainer
            </Link>
          </Typography>
          <Button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            variant="contained"
            color="primary"
            sx={{ boxShadow: 'none' }}
          >
            <SettingsIcon />
          </Button>
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
              {item.name}
            </Button>
          ))}
        </Toolbar>
      </AppBar>
      <Paper sx={{borderRadius:0}}>
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
            <SequenceTrainerSettings
              isSettingsOpen={isSettingsOpen}
              setIsSettingsOpen={setIsSettingsOpen}
              bpm={bpm}
              setBpm={setBpm}
              droneVolume={droneVolume}
              setDroneVolume={setDroneVolume}
              pianoVolume={pianoVolume}
              setPianoVolume={setPianoVolume}
              rootNote={rootNote}
              setRootNote={setRootNote}
              range={range}
              setRange={setRange}
              currentNotes={currentNotes}
              setCurrentNotes={setCurrentNotes}
              playSequence={playSequence}
              isStatOpen={isStatOpen}
              setIsStatOpen={setIsStatOpen}
              practiceRecords={practiceRecords}
              setPracticeRecords={setPracticeRecords}
              sequenceLength={sequenceLength}
              setSequenceLength={setSequenceLength}
              saveSettings={saveSettings}
            />
            <IntroModal isOpen={isIntroOpen} handleClose={handleIntroClose} />
            {gameStarted && (
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', marginBottom: '2rem' }}>
                {isStatOpen && renderRecords()}
                {renderSequenceProgress()}
                <Box sx={{ flexGrow: 1 }} />
                <Grid container spacing={2} sx={{ marginBottom: '1rem' }}>
                  {filteredNotes.map((note) => (
                    <Grid item xs={4} key={note.name}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setActiveNote(Tone.Frequency(rootNote + note.distance, 'midi').toNote())}
                        fullWidth
                        sx={{
                          textTransform: 'none',
                          fontSize: '1.5rem',
                          height: '4rem',
                          background: disabledNotes.some(disabledNote => Tone.Frequency(rootNote + note.distance, 'midi').toNote().slice(0, -1) === disabledNote.slice(0, -1)) ? (theme) => theme.palette.action.disabled : 'default',
                        }}
                        data-note={Tone.Frequency(rootNote + note.distance, 'midi').toNote().slice(0, -1)}
                      >
                        {note.name}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleReplay}
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

export default SequenceTrainer;