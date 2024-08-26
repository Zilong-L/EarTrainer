import React, { useState, useEffect } from 'react';
import { CssBaseline, Box, Button, Typography, AppBar, Toolbar, Container, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import * as Tone from 'tone';

import MenuIcon from '@mui/icons-material/Menu';
import ReplayIcon from '@mui/icons-material/Replay';
import SettingsIcon from '@mui/icons-material/Settings';

import Sidebar from '@components/Sidebar';
import DegreeTrainerSettings from '@components/EarTrainers/DegreeTrainerSettings';
import { getPianoInstance, getDroneInstance } from '@components/ToneInstance';

const apps = [{ name: 'Ear Trainer', path: '/ear-trainer' }, { name: 'Chord Trainer', path: '/chord-trainer' }];
const noteRange = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];
const degrees = [
  { degree: 0, name: "I", distance: 0 },
  { degree: 1, name: "II", },
  { degree: 2, name: "III" },
  { degree: 3, name: "IV" },
  { degree: 4, name: "V" },
  { degree: 5, name: "VI" },
  { degree: 6, name: "VII" },

]
const intervals = [0,2,4,5,7,9,11]
const EarTrainer = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentNotes, setCurrentNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState("");
  const [disabledNotes, setDisabledNotes] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  

  const [bpm, setBpm] = useState(60);
  const [droneVolume, setDroneVolume] = useState(0.3);
  const [pianoVolume, setPianoVolume] = useState(0.3);
  const [rootNote, setRootNote] = useState(36);
  const [Range, setRange] = useState([Tone.Frequency('C3').toMidi(),Tone.Frequency('C6').toMidi()])

  const piano = getPianoInstance();
  const drone = getDroneInstance();

  const pianoSampler = piano.sampler;
  useEffect(() => {
    console.log('Degree Trainer mounted');
    drone.updateRoot(rootNote);

    return () => {
      console.log('Release all scheduled notes');

      drone.stop();
      Tone.getTransport().stop();
      Tone.getTransport().cancel(); // Cancel all scheduled events
      // Here, you would clean up any resources, such as cancelling subscriptions, clearing timers, or removing event listeners.
    };
  }, []);
  useEffect(() => {
    drone.updateRoot(rootNote);
    drone.setVolume(droneVolume);
    piano.setVolume(pianoVolume);
  }
    , [droneVolume, pianoVolume, rootNote]);
  useEffect(()=>{
    const newNotes = intervals.map((interval)=>Tone.Frequency(rootNote+interval,'midi').toNote())
    setCurrentNotes(newNotes)
    console.log(newNotes)
  },[rootNote])
  useEffect(()=>{
    console.log(Range)
  },[Range])

  const startGame = () => {
    // Reset transport for each game start
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    Tone.getTransport().cancel(); // Clear all previous scheduled events

    setGameStarted(true);
    setDisabledNotes([]);

    // const endtime = playKeyEstablishMelody();
    const note = noteRange[Math.floor(Math.random() * noteRange.length)];
    setCurrentNote(note);

    // Schedule the random note to play after the melody
    drone.start();
    playNote(note);

    // Start the transport
    Tone.getTransport().start();
  };

  // Function to replay the melody within the game
  const playNote = (note = null) => {
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    Tone.getTransport().cancel(); // Clear all previous scheduled events
    if (!note) {
      note = currentNote;
    }
    pianoSampler.triggerAttackRelease(note, 60 / bpm);
  };



  const handleNoteGuess = (note) => {
    if (note === currentNote) {
      setDisabledNotes([]); // Reset for next round
      const nextNote = noteRange[Math.floor(Math.random() * noteRange.length)];
      console.log(nextNote)
      setCurrentNote(nextNote);
      playNote(nextNote)
    } else {
      setDisabledNotes((prev) => [...prev, note]);
    }
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
            color="primary"  // Make the button stand out with a primary color
            sx={{ boxShadow: 'none', }}
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
            <Button variant="contained" key={item.name} component={Link} to={item.path} sx={{
              display: 'none',
              '@media (min-width:600px)': { display: 'block', boxShadow: 'none', textTransform: 'none' }
            }}>
              {item.name}
            </Button>
          ))}
        </Toolbar>
      </AppBar>
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between', // Space out content to push buttons to the bottom
          paddingTop: '4rem',
          paddingBottom: '2rem',
          paddingX: '1.5rem',

        }}
      >
        <CssBaseline />
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <DegreeTrainerSettings
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
          Range = {Range}
          setRange= {setRange}
        />
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {!gameStarted && (
            <Button
              variant="contained"
              color="primary"
              onClick={startGame}
              sx={{ height: '30vh' }}
              fullWidth
            >
              <Typography variant='h2'>Start</Typography>
            </Button>
          )}
          {gameStarted && (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={() => playNote()}
                fullWidth
                sx={{
                  marginBottom: 2,
                  textTransform: 'none',
                  padding: '1rem',
                  display: 'flex', // Use flexbox for centering
                  justifyContent: 'center', // Center horizontally
                  alignItems: 'center', // Center vertically
                }}
              >
                <ReplayIcon sx={{ fontSize: '4rem' }} /> {/* Adjust the size of the icon */}
              </Button>
            </>
          )}
        </Box>
        {gameStarted && (
          <Grid container spacing={2}>
            {degrees.map((note) => (
              <Grid item xs={4} key={note.name}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleNoteGuess(noteRange[note.degree])}
                  disabled={disabledNotes.includes(noteRange[note.degree])}
                  fullWidth
                  sx={{ textTransform: 'none', fontSize: '2rem' }}
                >
                  {note.name}
                </Button>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
};

export default EarTrainer;
