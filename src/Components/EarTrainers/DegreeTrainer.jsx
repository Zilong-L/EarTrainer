import React, { useState,useEffect } from 'react';
import { CssBaseline, Box, Button, Typography, AppBar, Toolbar, Container, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ReplayIcon from '@mui/icons-material/Replay';
import Sidebar from '@components/Sidebar';
import { getPianoSampler, getToneInstance,getDroneInstance,getPianoGainNode } from '@components/ToneInstance';

const apps = [{ name: 'Ear Trainer', path: '/ear-trainer' }, { name: 'Chord Trainer', path: '/chord-trainer' }];
const noteRange = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];
const keyEstablishMelody = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
const degrees = [
  {degree:0,name:"I"},
  {degree:1,name:"II"},
  {degree:2,name:"III"},
  {degree:3,name:"IV"},
  {degree:4,name:"V"},
  {degree:5,name:"VI"},
  {degree:6,name:"VII"},
  
]
const EarTrainer = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState("");
  const [disabledNotes, setDisabledNotes] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);

  const [bpm,setBpm]=useState(120);
  const [droneVolume,setDroneVolume]=useState(1);
  const [pianoVolume,setPianoVolume]=useState(1.0);


  const Tone = getToneInstance();
  const pianoSampler = getPianoSampler();
  const drone = getDroneInstance();
  const pianoGain = getPianoGainNode();
  useEffect(() => {
    console.log('Degree Trainer mounted');

    drone.setVolume(droneVolume);
    pianoGain.gain.value = pianoVolume; 

    // Cleanup function
    return () => {
      console.log('Release all scheduled notes');
      drone.stop();
      
      Tone.Transport.stop();
      Tone.Transport.cancel(); // Cancel all scheduled events
      // Here, you would clean up any resources, such as cancelling subscriptions, clearing timers, or removing event listeners.
    };
  }, []); 

  
  const startGame = () => {
    // Reset transport for each game start
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    Tone.Transport.cancel(); // Clear all previous scheduled events
    
    setGameStarted(true);
    setDisabledNotes([]);
    
    // const endtime = playKeyEstablishMelody();
    const note = noteRange[Math.floor(Math.random() * noteRange.length)];
    setCurrentNote(note);
    
    // Schedule the random note to play after the melody
    drone.start();
    playNote(note);
  
    // Start the transport
    Tone.Transport.start();
  };
  
  // Function to replay the melody within the game
  const playNote = (note = null) => {
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    Tone.Transport.cancel(); // Clear all previous scheduled events
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
      <AppBar position="static" sx={{ boxShadow: 0 }}>
        <Toolbar sx={{ color: (theme) => theme.palette.text.primary }}>
          <Typography variant="h6" sx={{ marginLeft: '15px', flexGrow: 1 }} component={Link} to='/ear-trainer'>
            Ear Trainer
          </Typography>
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
          maxWidth="md" 
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center', // Center vertically
            alignItems: 'center',     // Center horizontally
            paddingTop:'30vh',
            '@media (min-width:600px)': { paddingTop: '4rem' }
          }}
        >
        <CssBaseline />
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      {!gameStarted && (
        <Button
          variant="contained"
          color="secondary"
          onClick={startGame}
          sx={{ marginTop: '25vh',height:'30vh' }}
          fullWidth
        >
          <Typography variant='h2'>Start</Typography>
        </Button>
      )}
      {gameStarted && (
        <>

<Button
  variant="contained"
  color="secondary"
  onClick={() => playNote()}
  fullWidth
  sx={{
    marginBottom: 2,
    textTransform: 'none',
    padding:'1rem',
    display: 'flex', // Use flexbox for centering
    justifyContent: 'center', // Center horizontally
    alignItems: 'center', // Center vertically
  }}
>
  <ReplayIcon sx={{ fontSize: '4rem' }} /> {/* Adjust the size of the icon */}
</Button>
          <Grid container spacing={2}>
            {degrees.map((note) => (
              <Grid item xs={4} key={note.name}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleNoteGuess(noteRange[note.degree])}
                  disabled={disabledNotes.includes(noteRange[note.degree])}
                  fullWidth
                  sx={{ textTransform: 'none',fontSize: '2rem','@media (min-width:600px)': { } }}
                >
                  {note.name}
                </Button>
              </Grid>
            ))}
          </Grid>
        </>
      )}
      </Container>
    </>
  );
};

export default EarTrainer;
