import React, { useState } from 'react';
import { Typography, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import MIDIInputHandler from './MIDIInputHandler';
import useDiatonicGame from '@ChordTrainer/ChordGames/useDiatonicGame';

const DiatonicGame = ({settings}) => {
  const { t } = useTranslation('chordGame');
  const [chord, setChord] = useState("")
  const { currentChord } = useDiatonicGame(chord,settings);
  return (
    <Grid container direction="column" alignItems="center" justifyContent="center" style={{ height: '75vh', paddingLeft: '10%' }}>
      <Grid item style={{ height: '30vh', width: '100%' }}>
        <Typography color="inherit" variant="h1" component="h2" gutterBottom align="left">
          {currentChord}
        </Typography>
      </Grid>
      <Grid item sx={{ width: '100%' }}>
        <MIDIInputHandler chord={chord} setChord={setChord} />
      </Grid>
    </Grid>
  );
};

export default DiatonicGame;
