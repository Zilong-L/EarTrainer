import { createTheme } from '@mui/material';

const earTrainerTheme = createTheme({
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
})
const chordTrainerTheme = createTheme({
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
})
const themes = {
    '/':earTrainerTheme ,
    '/ear-trainer': earTrainerTheme,
    '/chord-trainer': chordTrainerTheme,
    // Add more themes for additional trainers
  };

export default themes;