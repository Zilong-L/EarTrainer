import React, { useState, useEffect } from 'react';
import { CssBaseline, Box, Button, Typography, AppBar, Toolbar, Container, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import * as Tone from 'tone';

import MenuIcon from '@mui/icons-material/Menu';
import ReplayIcon from '@mui/icons-material/Replay';
import SettingsIcon from '@mui/icons-material/Settings';

import Sidebar from '@components/Sidebar';
import DegreeTrainerSettings from '@components/EarTrainers/DegreeTrainerSettings';
import { getPianoInstance, getDroneInstance } from '@utils/ToneInstance';
import IntroModal from '@components/EarTrainers/DegreeTrainerIntro';  // 新增导入
import {apps, keyMap, degrees} from '@utils/Constants'


let midi = null;
const EarTrainer = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatOpen,setIsStatOpen] = useState(true);
  const [isIntroOpen, setIsIntroOpen] = useState(true); // 控制 IntroModal 的显示状态

  const [currentNote, setCurrentNote] = useState("");
  const [disabledNotes, setDisabledNotes] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);

  const [bpm, setBpm] = useState(40);
  const [currentNotes, setCurrentNotes] = useState(degrees);
  const [filteredNotes, setFilteredNotes] = useState(degrees);
  const [possibleMidiList, setPossibleMidiList] = useState([]);

  const [practiceRecords, setPracticeRecords] = useState({});
  const [droneVolume, setDroneVolume] = useState(0.3);
  const [pianoVolume, setPianoVolume] = useState(1.0);
  const [rootNote, setRootNote] = useState(Tone.Frequency('C3').toMidi());
  const [range, setRange] = useState([Tone.Frequency('C3').toMidi(), Tone.Frequency('C4').toMidi()]);

  const piano = getPianoInstance();
  const drone = getDroneInstance();

  const pianoSampler = piano.sampler;

  const [activeNote, setActiveNote] = useState(null); // 新增状态

  // 在组件挂载时加载练习记录
  useEffect(() => {
    const storedRecords = JSON.parse(localStorage.getItem('degreeTrainerRecords')) || {};
    setPracticeRecords(storedRecords);
  }, []);

  // 更新练习记录并存储到 localStorage
  const updatePracticeRecords = (degree, isCorrect) => {
    setPracticeRecords((prevRecords) => {
      const updatedRecords = {
        ...prevRecords,
        [degree]: {
          total: (prevRecords[degree]?.total || 0) + 1,
          correct: (prevRecords[degree]?.correct || 0) + (isCorrect ? 1 : 0),
        },
      };
      localStorage.setItem('degreeTrainerRecords', JSON.stringify(updatedRecords));
      return updatedRecords;
    });
  };

  // 计算音程
  const calculateDegree = (guessedNoteMidi, currentNoteMidi) => {
    const interval = (guessedNoteMidi - rootNote) % 12;
    return degrees.find(degree => degree.distance === interval)?.name || "Unknown";
  };

  useEffect(() => {
    console.log('Degree Trainer mounted');
    return () => {
      console.log('drone stopped');
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
  }, [droneVolume, pianoVolume, rootNote]);

  useEffect(() => {
    const newNotes = currentNotes.filter((obj) => obj.enable);
    setFilteredNotes(newNotes);
  }, [currentNotes]);

  useEffect(() => {
    const newNote = generateRandomNoteBasedOnRoot();
    setCurrentNote(newNote);
  }, [possibleMidiList]);

  const startGame = () => {
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    Tone.getTransport().cancel(); // Clear all previous scheduled events

    setGameStarted(true);
    setDisabledNotes([]);

    const note = generateRandomNoteBasedOnRoot();
    setCurrentNote(note);
    playNote(note, 1);

    drone.start();
    Tone.getTransport().start();
  };

  const playNote = (note=null , delay = 0) => {
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    Tone.getTransport().cancel(); // Clear all previous scheduled events
    if(!note){
      note = currentNote
    }
    if (pianoSampler._buffers&&pianoSampler._buffers.loaded) {
        pianoSampler.triggerAttackRelease(note, 60 / bpm, Tone.now() + delay);
    }
  };

  const generateRandomNoteBasedOnRoot = () => {
    if (possibleMidiList.length === 0) return null;
    const nextNoteMidi = possibleMidiList[Math.floor(Math.random() * possibleMidiList.length)];
    return Tone.Frequency(nextNoteMidi, 'midi').toNote();
  };

  useEffect(() => {
    const expandedIntervals = [];

    filteredNotes.forEach((note) => {
      for (let octaveShift = -4; octaveShift <= 4; octaveShift++) {
        const midiValue = rootNote + note.distance + octaveShift * 12;
        expandedIntervals.push(midiValue);
      }
    });

    const newIntervalList = expandedIntervals.filter(
      (midi) => midi >= range[0] && midi <= range[1]
    );

    setPossibleMidiList(newIntervalList);
    console.log(`possible notes ${newIntervalList.map((e)=>Tone.Frequency(e,'midi').toNote())}`);
  }, [rootNote, range, filteredNotes]);

  useEffect(() => {
    if (activeNote) {
      handleNoteGuess(activeNote);
    }
  }, [activeNote]);

  const handleNoteGuess = (guessedNote) => {
    const guessedNoteMidi = Tone.Frequency(guessedNote).toMidi();
    const currentNoteMidi = Tone.Frequency(currentNote).toMidi();

    const guessedDegree = calculateDegree(guessedNoteMidi, currentNoteMidi);
    const isCorrect = guessedNoteMidi % 12 === currentNoteMidi % 12;

    if (isCorrect) {
      setDisabledNotes([]);
      updatePracticeRecords(guessedDegree, isCorrect);
      setCurrentNote(() => {
        const nextNote = generateRandomNoteBasedOnRoot(rootNote, filteredNotes);
        playNote(nextNote);
        return nextNote;
      });
      setActiveNote(null)
    } else {
      if (!disabledNotes.includes(guessedNote)) {
        setDisabledNotes((prev) => [...prev, guessedNote]);
        updatePracticeRecords(guessedDegree, isCorrect);
      }
      playNote(guessedNote);
    }
    setActiveNote(null)
  };

  const handleIntroClose = () => {
    setIsIntroOpen(false);
    startGame(); // 在关闭 IntroModal 后开始游戏
  };

  const renderRecords = () => {
    const totalResults = Object.values(practiceRecords).reduce(
      (acc, record) => {
        acc.total += record.total;
        acc.correct += record.correct;
        return acc;
      },
      { total: 0, correct: 0 }
    );

    return <>
      <Typography variant="body1">
        总尝试: {totalResults.total}
      </Typography>
      <Typography variant="body1">
        正确数: {totalResults.correct}
      </Typography>
      <Typography variant="body1">
        正确率: {totalResults.total>0?Math.round((totalResults.correct/totalResults.total).toFixed(2)*100)+'%':'0%'}
      </Typography>
    </>
  }

  const loadSettingsFromLocalStorage = () => {
    const storedSettings = JSON.parse(localStorage.getItem('degreeTrainerSettings'));
    if (storedSettings) {
      setBpm(storedSettings.bpm);
      setDroneVolume(storedSettings.droneVolume);
      setPianoVolume(storedSettings.pianoVolume);
      setRootNote(storedSettings.rootNote);
      setRange(storedSettings.range);
      setCurrentNotes(storedSettings.currentNotes);
    }
  };

  useEffect(() => {
    loadSettingsFromLocalStorage(); // 在组件挂载时加载设置
  }, []);

  const handleKeyPress = (event) => {
    const key = event.key;
    if (key === 'r' || key === ' ') {
      playNote(currentNote);
      return;
    }
    
    let degreeIndex;
    if (keyMap[key] !== undefined) {
      degreeIndex = keyMap[key];
    }
    if (degreeIndex !== undefined) {
      const selectedDegree = degrees[degreeIndex];
      const noteName = Tone.Frequency(rootNote + selectedDegree.distance, 'midi').toNote().slice(0,-1); // 获取对应的音符名称
      // 模拟点击对应的按钮
      const button = document.querySelector(`button[data-note="${noteName}"]`);
      if (button) {
        button.click();
      }
    }

    // Hit the replay button if R or space is pressed
    
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [filteredNotes, rootNote]);
  
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
  useEffect(() => {
    (async () => {
      if (navigator.requestMIDIAccess == null) {
        return;
      }
      if(midi == null){
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
      return ()=>{
        console.log('midi is not deleted, but delete listener')
        const inputs = midi.inputs.values();
        for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
            input.value.onmidimessage = null
        }
      }

    }, []);


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
          isStatOpen={isStatOpen}
          setIsStatOpen={setIsStatOpen}
          practiceRecords={practiceRecords}
          setPracticeRecords={setPracticeRecords}
        />
        <IntroModal isOpen={isIntroOpen} handleClose={handleIntroClose} />
        {gameStarted && (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', marginBottom: '2rem' }}>
            {isStatOpen && renderRecords()}
            <Box sx={{ flexGrow: 1 }} /> {/* 这个空的 Box 会推动下面的内容到底部 */}
            <Grid container spacing={2} sx={{ marginBottom: '1rem' }}>
              {filteredNotes.map((note) => (
                <Grid item xs={4} key={note.name}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setActiveNote(Tone.Frequency(rootNote + note.distance, 'midi').toNote())} // 设置激活音符
                    fullWidth
                    sx={{
                      textTransform: 'none',
                      fontSize: '1.5rem',
                      height: '4rem',
                      '&:active': { transform: 'scale(0.85)', transition: 'transform 0.5s' },
                      background: disabledNotes.some(disabledNote => Tone.Frequency(rootNote + note.distance, 'midi').toNote().slice(0, -1) === disabledNote.slice(0, -1)) ? (theme) => theme.palette.action.disabled : 'default', // 设置透明度以模拟禁用样式
                    }}
                    data-note={Tone.Frequency(rootNote + note.distance, 'midi').toNote().slice(0, -1)} // 添加 data-note 属性
                  >
                    {note.name} 
                  </Button>
                </Grid>
              ))}
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
    </>
  );
};

export default EarTrainer;