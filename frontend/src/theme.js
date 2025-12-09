import { createTheme } from '@mui/material/styles';

const seaGreen = '#2E8B57';
const black = '#111111';
const white = '#ffffff';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: seaGreen, contrastText: white },
    secondary: { main: black, contrastText: white },
    background: { default: white, paper: white },
    text: { primary: black, secondary: '#4b5563' },
    success: { main: '#22c55e' },
    warning: { main: '#f59e0b' },
    info: { main: '#0ea5e9' },
    error: { main: '#ef4444' },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: [
      'Inter','ui-sans-serif','system-ui','-apple-system','Segoe UI','Roboto','Helvetica Neue','Arial'
    ].join(','),
    h4: { fontWeight: 800 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
});

export default theme;
export const colors = { seaGreen, black, white };