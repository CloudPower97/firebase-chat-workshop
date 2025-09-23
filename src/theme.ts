import { red } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          color: 'white',
          '&.Mui-selected': {
            color: 'white', // Ensure selected tab text is also white
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: 'white',
        },
      },
    },
  },
});

export default theme;
