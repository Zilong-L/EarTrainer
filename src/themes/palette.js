import { createTheme } from '@mui/material';
import NunitoRegular from '@assets/font/Nunito-Regular.ttf';
import NunitoBold from '@assets/font/Nunito-Bold.ttf';
const base = createTheme({
  typography: {
    fontFamily: 'Nunito, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Nunito';
          src: url(${NunitoRegular}) format('truetype');
          font-weight: 400;
        }
        @font-face {
          font-family: 'Nunito';
          src: url(${NunitoBold}) format('truetype');
          font-weight: 700;
        }
      `,
    },
  },
})
const earTrainerTheme = createTheme({
  ...base,
  palette: {
    primary: { main: '#FFFBE6' }, // Chord Trainer primary color
    secondary: { main: '#FFFBE6' }, // Optional secondary color
    background: {
      default: '#FFFBE6', // Background for pages
      paper: '#FFFBE6', // Background for paper surfaces (cards, modals)
      modal: 'FFFBE6'
    },
    text: {
      primary: '#202020', // Main text color
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
})
const chordTrainerTheme = createTheme({
  ...base,
  palette: {
    primary: { main: '#222831' }, // Ear Trainer primary color
    secondary: { main: '#222831' }, // Optional secondary color
    background: {
      default: '#222831', // Background for pages
      paper: '#222831', // Background for paper surfaces
    },
    text: {
      primary: '#ffffff', // Main text color
      secondary: '#ffffff', // Secondary text color
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
})
const themes = {
    '/':earTrainerTheme ,
    '/ear-trainer': earTrainerTheme,
    '/chord-trainer': chordTrainerTheme,
    // Add more themes for additional trainers
    
  };

export default themes;