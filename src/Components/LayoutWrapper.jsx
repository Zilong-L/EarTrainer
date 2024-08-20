import React from 'react';
import { CssBaseline, Box, AppBar, Toolbar, Typography, Button, ThemeProvider, createTheme } from '@mui/material';
import { lighten } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import ChordTrainer from './ChordTrainer';
import EarTrainer from './EarTrainer';
// Import additional trainers here

// Define themes for each trainer
const themes = {
  '/': createTheme({
    palette: {
      primary: { main: '#00712D' }, // Chord Trainer primary color
      secondary: { main: '#FFD700' }, // Optional secondary color
      background: {
        default: '#FFFBE6', // Background for pages
        paper: '#fffefc', // Background for paper surfaces (cards, modals)
        modal: 'FFFBE6'
      },
      text: {
        primary: '#FFFEFE', // Main text color
        secondary: '#202020', // Secondary text color
        disabled: '#b0b0b0', // Disabled text color
      },
      divider: '#e0e0e0', // Divider color
      action: {
        active: '#6FDCE3', // Active icon color
        hover: '#efeeec', // Hover color
        selected: '#dddcda', // Selected color
        selectedHover:'#cdccca',
        disabled: '#cfd8dc', // Disabled color
      },
    },
  }),
  '/ear-trainer': createTheme({
    palette: {
      primary: { main: '#222831' }, // Ear Trainer primary color
      secondary: { main: '#393E46' }, // Optional secondary color
      background: {
        default: '#eeeeee', // Background for pages
        paper: '#f9f9f9', // Background for paper surfaces
      },
      text: {
        primary: '#EEEEEE', // Main text color
        secondary: '#393E46', // Secondary text color
        disabled: '#bdbdbd', // Disabled text color
      },
      divider: '#bdbdbd', // Divider color
      action: {
        active: '#ffffff', // Active icon color
        hover: '#e9e9e9', // Hover color
        selected: '#e1e1e1', // Selected color
        disabled: '#ffffff', // Disabled color
        selectedHover:'#d9d9d9'
      },
    },
  }),
  // Add more themes for additional trainers
};

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
        <AppBar position="static" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar sx={{ color:(theme)=>theme.palette.text.primary }}>
            <Typography variant="h6" sx={{ flexGrow: 1}}>
              Music Trainer
            </Typography>
            <Button color="inherit" component={Link} to="/">Chord Trainer</Button>
            <Button color="inherit" component={Link} to="/ear-trainer">Ear Trainer</Button>
            {/* Add more buttons for additional trainers */}
          </Toolbar>
        </AppBar>
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<ChordTrainer />} />
            <Route path="/ear-trainer" element={<EarTrainer />} />
            {/* Add more routes for additional trainers */}
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default LayoutWrapper;
