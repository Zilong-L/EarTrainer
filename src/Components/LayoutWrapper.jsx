import React, { useState } from 'react';
import { CssBaseline, Container, Grid, Paper, Box,Button} from '@mui/material';
import Sidebar from './Sidebar';
import logo from '@assets/logo.png'
import RandomNote from './RandomNote';
import EastOutlinedIcon from '@mui/icons-material/EastOutlined';

const LayoutWrapper = () => {
  const [chordType, setChordType] = useState('Major Triad');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar is visible by default

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Box sx={{ position: 'absolute',  zIndex: 1300 }}>
        <Button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          sx={{ 
            m: 1, 
            transform: isSidebarOpen ? 'rotateY(180deg)' : 'rotateY(0deg)',  // Rotate the icon
            transition: 'transform 300ms ease',  // Smooth transition for rotation
            color:'black'
          }}
        >
          <EastOutlinedIcon />
        </Button>
      </Box>
      <Sidebar chordType={chordType} setChordType={setChordType} isOpen={isSidebarOpen} />
      <Container maxWidth="lg" sx={{ flexGrow: 1, width: '1000px', height: '100vh' ,paddingY:'10px' }}>
        <Paper sx={{
          paddingTop: '100px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'auto',
          width: "100%",
          position: 'relative'  // Add this line to make Paper a relative container
        }}>
          <RandomNote chordType={chordType}/>
          <img src={logo} alt="Logo" style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            maxWidth: '100px',
            maxHeight: '100px'
          }} />
        </Paper>
      </Container>
    </Box>
  );
};

export default LayoutWrapper;
