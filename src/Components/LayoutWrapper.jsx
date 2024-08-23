import React from 'react';
import { CssBaseline, Box,  ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import ChordTrainer from './ChordTrainer';
import EarTrainer from './EarTrainer';
import themes from '@themes/palette.js'
// Import additional trainers here

// Define themes for each trainer


const LayoutWrapper = () => {
  return (
    <Router>
      <ThemedContent />
    </Router>
  );
};

const ThemedContent = () => {
  const location = useLocation();
  const currentTheme = themes[location.pathname] || themes['/'];

  return (
    <ThemeProvider theme={currentTheme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <CssBaseline />
        
          <Routes>
            <Route path="/" element={<EarTrainer />} />
            <Route path="/chord-trainer" element={<ChordTrainer />} />
            <Route path="/ear-trainer" element={<EarTrainer />} />
          </Routes>
        
      </Box>
    </ThemeProvider>
  );
};

export default LayoutWrapper;
