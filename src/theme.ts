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
      main: '#red',
    },
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          color: 'white',
          '&.Mui-selected': {
            color: 'white', // Ensure selected tab text is also white
            borderBottom: '2px solid white', // Add a white underline for the active tab
          },
        },
      },
    },
  },
});

export default theme;
