import React, { useState } from 'react';
import { CssBaseline, Container,  Paper, Box, Button,  Typography,AppBar,Toolbar } from '@mui/material';
import { Link } from 'react-router-dom';

import ChordTrainerSidebar from './ChordTrainerSidebar';
import RandomNote from './RandomNote';
import MenuIcon from '@mui/icons-material/Menu';

const ChordTrainer = () => {
  const [chordType, setChordType] = useState('Major');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // ChordTrainerSidebar is visible by default

  return (<>
    <AppBar position="static" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar sx={{ color:(theme)=>theme.palette.text.primary }}>
          <Button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                variant="contained"
                color="primary"  // Make the button stand out with a primary color
                sx={{boxShadow:'none'}}
              >
                <MenuIcon/>
              </Button>
          <Typography variant="h6" sx={{ marginLeft:'15px', flexGrow: 1 }}>
              Chord Trainer
            </Typography>
            <Button variant="contained"  sx={{boxShadow:'none'}} component={Link} to="/ear-trainer">Ear Trainer</Button>
            <Button variant="contained" sx={{boxShadow:'none'}} component={Link} to="/chord-trainer">Chord Trainer</Button>
            {/* Add more buttons for additional trainers */}
          </Toolbar>
        </AppBar>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
    
      <CssBaseline />
      <ChordTrainerSidebar chordType={chordType} setChordType={setChordType} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
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

          </Box>

          <RandomNote chordType={chordType} />


        </Paper>
      </Container>
    </Box>
    </>
  );
};

export default ChordTrainer;
