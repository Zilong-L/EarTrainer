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
const degrees = [
  { name: "I", distance: 0, enable: true },
  { name: "IIb", distance: 1, enable: false },
  { name: "II", distance: 2, enable: true },
  { name: "IIIb", distance: 3, enable: true },
  { name: "III", distance: 4, enable: true },
  { name: "IV", distance: 5, enable: true },
  { name: "Vb", distance: 6, enable: false },
  { name: "V", distance: 7, enable: true },
  { name: "VIb", distance: 8, enable: false },
  { name: "VI", distance: 9, enable: true },
  { name: "VIIb", distance: 10, enable: false },
  { name: "VII", distance: 11, enable: true },
]
const EarTrainer = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState("");
  const [disabledNotes, setDisabledNotes] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);


  const [bpm, setBpm] = useState(60);
  const [currentNotes, setCurrentNotes] = useState(degrees);
  const [filteredNotes, setFilteredNotes] = useState(degrees);
  const [possibleMidiList, setPossibleMidiList] = useState([]);

  const [droneVolume, setDroneVolume] = useState(0.3);
  const [pianoVolume, setPianoVolume] = useState(0.3);
  const [rootNote, setRootNote] = useState(36);
  const [range, setRange] = useState([Tone.Frequency('C3').toMidi(), Tone.Frequency('C6').toMidi()])

  const piano = getPianoInstance();
  const drone = getDroneInstance();

  const pianoSampler = piano.sampler;
  useEffect(() => {
    console.log('Degree Trainer mounted');
    return () => {
      console.log('drone stopped')
      drone.stop();
      console.log('Release all scheduled notes');
      Tone.getTransport().stop();
      Tone.getTransport().cancel(); // Cancel all scheduled events
    };
  }, []);
  useEffect(() => {
    drone.updateRoot(rootNote);
    drone.setVolume(droneVolume);
    piano.setVolume(pianoVolume);
  }
    , [droneVolume, pianoVolume, rootNote]);
  useEffect(() => {
    const newNotes = currentNotes.filter((obj) => obj.enable)
    setFilteredNotes(newNotes)
  }, [currentNotes])
  
  useEffect(()=>{
    const newNote = generateRandomNoteBasedOnRoot();
    setCurrentNote(newNote);
    
  },[possibleMidiList])
  useEffect(() => {
    console.log(range)
  }, [range])

  const startGame = () => {
    // Reset transport for each game start
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    Tone.getTransport().cancel(); // Clear all previous scheduled events

    setGameStarted(true);
    setDisabledNotes([]);

    // const endtime = playKeyEstablishMelody();
    const note = generateRandomNoteBasedOnRoot();
    setCurrentNote(note);
    playNote(note,1);

    // Schedule the random note to play after the melody
    drone.start();

    // Start the transport
    Tone.getTransport().start();
  };

  // Function to replay the melody within the game
  const playNote = (note = null,delay=0) => {
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    Tone.getTransport().cancel(); // Clear all previous scheduled events
    if (!note) {
      note = currentNote;
    }
    pianoSampler.triggerAttackRelease(note, 60 / bpm,Tone.now()+delay);
  };


  const generateRandomNoteBasedOnRoot = () => {
    if (possibleMidiList.length === 0) return null;
    const nextNoteMidi = possibleMidiList[Math.floor(Math.random() * possibleMidiList.length)];
    return Tone.Frequency(nextNoteMidi, 'midi').toNote();
  };
  

  useEffect(() => {
    const expandedIntervals = [];

    // 扩展每个音符到所有可能的八度范围内
    filteredNotes.forEach((note) => {
      for (let octaveShift = -4; octaveShift <= 4; octaveShift++) {
        const midiValue = rootNote + note.distance + octaveShift * 12;
        expandedIntervals.push(midiValue);
      }
    });

    // 过滤掉不在范围内的音符
    const newIntervalList = expandedIntervals.filter(
      (midi) => midi >= range[0] && midi <= range[1]
    );

    setPossibleMidiList(newIntervalList);
    console.log(newIntervalList);
  }, [rootNote, range, filteredNotes]);

  const handleNoteGuess = (guessedNote) => {
    const guessedNoteMidi = Tone.Frequency(guessedNote).toMidi();
    const currentNoteMidi = Tone.Frequency(currentNote).toMidi();
    console.log(guessedNote,currentNote)
    // 检查两个音符是否在同一音阶内，即相差一个或多个八度
    if (guessedNoteMidi % 12 === currentNoteMidi % 12) {
      setDisabledNotes([]); // 重置禁用音符状态，准备下一轮
      setCurrentNote(() => {
        const nextNote = generateRandomNoteBasedOnRoot(rootNote, filteredNotes);
        playNote(nextNote);
        return nextNote;
      });
    } else {
      setDisabledNotes((prev) => [...prev, guessedNote]);
      playNote(); 
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
          justifyContent: 'space-between',
          height: 'calc(100vh - 64px)',
          paddingY: '1rem',
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
          range={range}
          setRange={setRange}
          currentNotes={currentNotes}
          setCurrentNotes={setCurrentNotes}
          playNote={playNote}
        />
        {!gameStarted ? (
          <Button
            variant="contained"
            color="primary"
            onClick={startGame}
            sx={{ height: '30vh', marginTop: 'auto', marginBottom: '2rem' }}
            fullWidth
          >
            <Typography variant='h2'>开始</Typography>
          </Button>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%',marginBottom:'2rem' }}>
            <Box sx={{ flexGrow: 1 }} /> {/* 这个空的 Box 会推动下面的内容到底部 */}
            <Grid container spacing={2} sx={{ marginBottom: '1rem' }}>
              {filteredNotes.map((note) => (
                <Grid item xs={4} key={note.name}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleNoteGuess(Tone.Frequency(rootNote + note.distance, 'midi').toNote())}
                    disabled={disabledNotes.includes(Tone.Frequency(rootNote + note.distance, 'midi').toNote())}
                    fullWidth
                    sx={{ textTransform: 'none', fontSize: '1.5rem', height: '4rem' }}
                  >
                    {note.name}
                  </Button>
                </Grid>
              ))}
            </Grid>
            <Button
              variant="contained"
              color="primary"
              onClick={() => playNote()}
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
    </>
  );
};

export default EarTrainer;
