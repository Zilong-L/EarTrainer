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
let earTrainerTheme = createTheme({
  ...base,
  palette: {
    primary: { main: '#6C4E31' }, 
    secondary: { main: '#f4b350' }, 
    success:{
      main:'#109c8e'
    },
    background: {
      default: '#000000', // Light grey background for pages
      paper: '#FFEAC5', // White background for paper surfaces (cards, modals)
      modal: '#603F26', // White background for modals
    },
    bg:{
      primary:'#6C4E31',
    },
    text: {
      primary: '#ffffff', // Dark grey main text color
      secondary: '#aaaaaa', // Medium grey secondary text color
      disabled: '#BDBDBD', // Light grey disabled text color
      paper: '#634806',
      modal: '#ffffff'
    },
    divider: '#E0E0E0', // Light grey divider color
    action: {
      active: '#4CAF50', // Active icon color: Green
      hover: '#E8F5E9', // Light green hover color
      selected: '#C8E6C9', // Light green selected color
      selectedHover: '#A5D6A7', // Slightly darker green for selected hover
      disabled: '#E0E0E0', // Light grey disabled color
    },
  },
});
const chordTrainerTheme = createTheme({
  ...base,

  palette: {
    primary: { main: '#3F51B5' }, // Primary color: Indigo
    secondary: { main: '#FF4081' }, // Secondary color: Pink
    background: {
      default: '#303030', // Dark grey background for pages
      paper: '#424242', // Darker grey background for paper surfaces
    },
    text: {
      primary: '#FFFFFF', // White main text color
      secondary: '#BDBDBD', // Light grey secondary text color
      disabled: '#757575', // Medium grey disabled text color
      selected: '#616161',
      //dark for selected option
    },
    divider: '#BDBDBD', // Light grey divider color
    action: {
      active: '#FF4081', // Active icon color: Pink
      hover: '#222222', // Light pink hover color
      selected: '#222222', // Light pink selected color
      selectedHover: '#222222', // Slightly darker pink for selected hover
      disabled: '#BDBDBD', // Light grey disabled color
    },
  },
  components: {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#757575', // Custom background color for selected state
            '&:hover': {
              backgroundColor: '#757575', // Custom background color for hover state when selected
            },
          },
          '&:hover': {
            backgroundColor: '#757575', // Custom background color for hover state
          },
        },
      },
    },
  },
});
const themes = {
    '/':earTrainerTheme ,
    '/ear-trainer': earTrainerTheme,
    '/chord-trainer': chordTrainerTheme,
    // Add more themes for additional trainers
    
  };

export default themes;