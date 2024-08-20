import React, { useState } from 'react';
import { CssBaseline, Container, Grid, Paper, Box,Button,Modal,Typography} from '@mui/material';
import EarTrainerSidebar from './EarTrainerSidebar';
import logo from '@assets/logo.png'
import RandomNote from './RandomNote';
import EastOutlinedIcon from '@mui/icons-material/EastOutlined';

const EarTrainer = () => {
  const [chordType, setChordType] = useState('Major');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // EarTrainerSidebar is visible by default

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <EarTrainerSidebar chordType={chordType} setChordType={setChordType} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Container maxWidth="lg" sx={{ flexGrow: 1, width: '1000px', height: '100%', paddingY: '10px'}}>
  <Paper

    sx={{
      paddingTop: '100px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'auto',
      width: "100%",
      position: 'relative',  // Ensures absolute positioning is relative to Paper
      color:(theme)=>theme.palette.text.secondary 
    }}
  >
          <Box
            sx={{
              position: 'absolute',
              bottom: '20px',  // Better positioning near the top
              left: '110px', // Aligns the button to the right with padding
            }}
          >
            <Button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              variant="contained"
              color="primary"  // Make the button stand out with a primary color
              sx={{
                textTransform: 'uppercase',  // Add a slight emphasis
                paddingX: '15px',  // Add horizontal padding for better aesthetics
                paddingY: '8px',
              }}
            >
              Change Chord
            </Button>
          </Box>
    <RandomNote chordType={chordType} />
    

  </Paper>
</Container>
    </Box>
  );
};

export default EarTrainer;
