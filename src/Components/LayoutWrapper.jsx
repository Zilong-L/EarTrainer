import React from 'react';
import { CssBaseline, Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ChordTrainer from './ChordTrainer';  // Adjust the import path as needed
import EarTrainer from './EarTrainer';  // Adjust the import path as needed

const LayoutWrapper = () => {
  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <CssBaseline />
        <AppBar position="static" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar > 
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Music Trainer
            </Typography>
            <Button color="inherit" component={Link} to="/">Chord Trainer</Button>
            <Button color="inherit" component={Link} to="/ear-trainer">Ear Trainer</Button>
          </Toolbar>
        </AppBar>
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<ChordTrainer />} />
            <Route path="/ear-trainer" element={<EarTrainer />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
};

export default LayoutWrapper;
