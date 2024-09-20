import React, { useState } from 'react';
import { CssBaseline, Container,  Paper, Box, Button,  Typography,AppBar,Toolbar,Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';

import Sidebar from './Sidebar';
import RandomNote from './RandomNote';
import MenuIcon from '@mui/icons-material/Menu';
const apps = [{name: 'Ear Trainer', path: '/ear-trainer'}, {name: 'Chord Trainer', path: '/chord-trainer'}]

const ChordTrainer = () => {
  const [chordType, setChordType] = useState('Major');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar is visible by default

  return (<>
    <AppBar position="static" sx={{
      boxShadow: 0
      }}>
        <Toolbar sx={{ color: (theme) => theme.palette.text.primary }}>

          <Typography variant="h6" sx={{ marginLeft: '15px', flexGrow: 1 }}>
            Chord Trainer
          </Typography>

          <Button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            variant="contained"
            color="primary"  // Make the button stand out with a primary color
            sx={{ boxShadow: 'none', '@media (min-width:600px)': { display: 'none' } }}
          >
            <MenuIcon />
          </Button>

          {apps.map((item)=>(<Button variant="contained" component={Link} to={item.path} key={item.name}sx={{
            display: 'none',
            '@media (min-width:600px)': { display: 'block', boxShadow: 'none', textTransform: 'none' }
          }}>{item.name}</Button>))
          }
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
    
      <CssBaseline />
      <Sidebar  isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
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
            <Container maxWidth="lg" >

          <Box
            sx={{
              position: 'absolute',
              bottom: '20px',  // Better positioning near the top
              left: '110px', // Aligns the button to the right with padding
            }}
          >

          </Box>

          <RandomNote chordType={chordType} />

          </Container>
        </Paper>
    </Box>
    </>
  );
};

export default ChordTrainer;
