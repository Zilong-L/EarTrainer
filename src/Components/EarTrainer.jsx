import React, { useState } from 'react';
import { CssBaseline, Container,  Paper, Box, Button,  Typography,AppBar,Toolbar } from '@mui/material';
import {  Link } from 'react-router-dom';
import EarTrainerSidebar from './EarTrainerSidebar';
import RandomNote from './RandomNote';

const EarTrainer = () => {
  const [chordType, setChordType] = useState('Major');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // EarTrainerSidebar is visible by default

  return (
    <>
      <AppBar position="static" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ color: (theme) => theme.palette.text.primary }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Music Trainer
          </Typography>
          <Button color="inherit" component={Link} to="/">Chord Trainer</Button>
          <Button color="inherit" component={Link} to="/ear-trainer">Ear Trainer</Button>
          {/* Add more buttons for additional trainers */}
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CssBaseline />
        <EarTrainerSidebar chordType={chordType} setChordType={setChordType} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <Container maxWidth="lg" sx={{ flexGrow: 1, width: '1000px', height: '100%', paddingY: '10px' }}>
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
              color: (theme) => theme.palette.text.secondary
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
    </>
  );
};

export default EarTrainer;
