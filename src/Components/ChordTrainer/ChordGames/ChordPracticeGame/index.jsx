import React,{useState} from 'react';
import { Typography, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import MIDIInputHandler from '../MIDIInputHandler';

const ChordPracticeGame = ({chordPracticeGameSettings}) => {
  const { targetChord, detectedChords,activeNotes, setActiveNotes } = chordPracticeGameSettings;
  return (
    <Grid container direction="column" alignItems="center" justifyContent="center" style={{ height: '75vh', paddingLeft: '10%' }}>
      <Grid item style={{ height: '30vh', width: '100%' }}>
        <Typography color="inherit" variant="h1" component="h2" gutterBottom align="left">
          {targetChord}
        </Typography>
      </Grid>
      <Grid item sx={{ width: '100%' }}>
        <MIDIInputHandler activeNotes={activeNotes} setActiveNotes={setActiveNotes} detectedChords={detectedChords} />
      </Grid>
    </Grid>
  );
};

export default ChordPracticeGame;
