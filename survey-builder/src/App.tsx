import React, { Suspense } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import useMediaQuery from '@mui/material/useMediaQuery'
import { CircularProgress, Box } from '@mui/material'
import { SurveyProvider } from './context/SurveyContext'

// Lazy load the main SurveyBuilder component
const SurveyBuilder = React.lazy(() => import('./components/SurveyBuilder'))

function App() {
  // Detect user's system theme preference
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  

  // Create theme based on user preference
  const theme = React.useMemo(() => createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
      primary: {
        main: prefersDarkMode ? '#6366f1' : '#4358a3', // Lighter blue for dark mode, original for light mode
        light: prefersDarkMode ? '#818cf8' : '#6366f1',
        dark: prefersDarkMode ? '#4338ca' : '#181a43',
        contrastText: '#ffffff',
      },
      secondary: {
        main: prefersDarkMode ? '#6366f1' : '#4358a3',
        light: prefersDarkMode ? '#818cf8' : '#6366f1',
        dark: prefersDarkMode ? '#4338ca' : '#2b3d8b',
        contrastText: '#ffffff',
      },
      // MUI will automatically generate dark/light variants based on mode
      ...(prefersDarkMode ? {
        // Dark mode specific overrides
        background: {
          default: '#121212',
          paper: '#1e1e1e',
        },
        text: {
          primary: '#ffffff',
          secondary: '#b3b3b3',
        },
      } : {
        // Light mode specific overrides
        background: {
          default: '#eef0f8', // CAPTRS neutral.lightGray
          paper: '#ffffff',
        },
        text: {
          primary: '#000000', // CAPTRS neutral.black
          secondary: '#6b7280',
        },
      }),
    },
  typography: {
    fontFamily: '"Open Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"DM Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 'bold',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"DM Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 'bold',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontFamily: '"DM Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 'bold',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontFamily: '"DM Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 'medium',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontFamily: '"DM Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 'medium',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontFamily: '"DM Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 'medium',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    body1: {
      fontFamily: '"Open Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 'regular',
      lineHeight: 1.6,
      letterSpacing: '0',
    },
    body2: {
      fontFamily: '"Open Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 'regular',
      lineHeight: 1.6,
      letterSpacing: '0',
    },
    button: {
      fontFamily: '"Open Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 'semibold',
      lineHeight: 1.5,
      letterSpacing: '0',
      textTransform: 'none',
    },
  },
  spacing: 4, // Base spacing unit of 4px
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 'semibold',
          padding: '12px 24px',
          boxShadow: prefersDarkMode 
            ? '0 2px 4px rgba(0, 0, 0, 0.3)' 
            : '0 2px 4px rgba(43, 61, 139, 0.2)',
          '&:hover': {
            boxShadow: prefersDarkMode 
              ? '0 4px 8px rgba(0, 0, 0, 0.4)' 
              : '0 4px 8px rgba(43, 61, 139, 0.3)',
          },
          '&.Mui-disabled': {
            backgroundColor: prefersDarkMode ? '#424242' : '#d1d5db',
            color: prefersDarkMode ? '#757575' : '#374151',
            borderColor: prefersDarkMode ? '#616161' : '#9ca3af',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: prefersDarkMode ? '#424242' : '#d1d5db',
              boxShadow: 'none',
            },
          },
        },
        contained: {
          background: prefersDarkMode 
            ? 'linear-gradient(45deg, #4358a3 0%, #6366f1 100%)'
            : 'linear-gradient(45deg, #181a43 0%, #4358a3 100%)',
          '&:hover': {
            background: prefersDarkMode 
              ? 'linear-gradient(45deg, #3b4a8f 0%, #5a5fcf 100%)'
              : 'linear-gradient(45deg, #2b3d8b 0%, #4358a3 100%)',
          },
          '&.Mui-disabled': {
            background: prefersDarkMode ? '#424242' : '#d1d5db',
            color: prefersDarkMode ? '#757575' : '#374151',
            '&:hover': {
              background: prefersDarkMode ? '#424242' : '#d1d5db',
            },
          },
        },
        outlined: {
          borderColor: prefersDarkMode ? '#4358a3' : '#2b3d8b',
          color: prefersDarkMode ? '#6366f1' : '#2b3d8b',
          '&:hover': {
            backgroundColor: prefersDarkMode 
              ? 'rgba(67, 88, 163, 0.08)' 
              : 'rgba(43, 61, 139, 0.04)',
          },
          '&.Mui-disabled': {
            borderColor: prefersDarkMode ? '#616161' : '#9ca3af',
            color: prefersDarkMode ? '#757575' : '#374151',
            '&:hover': {
              backgroundColor: 'transparent',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #eef0f8',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #eef0f8',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: prefersDarkMode 
            ? 'linear-gradient(45deg, #1e1e1e 0%, #4358a3 100%)'
            : 'linear-gradient(45deg, #181a43 0%, #4358a3 100%)',
          boxShadow: prefersDarkMode 
            ? '0 2px 8px rgba(0, 0, 0, 0.3)'
            : '0 2px 8px rgba(43, 61, 139, 0.2)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2b3d8b',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2b3d8b',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 'semibold',
        },
        colorPrimary: {
          backgroundColor: '#2b3d8b',
          color: '#ffffff',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
                 root: {
           '&.Mui-disabled': {
             backgroundColor: '#d1d5db',
             color: '#374151',
             '&:hover': {
               backgroundColor: '#d1d5db',
             },
           },
         },
      },
    },
    },
  }), [prefersDarkMode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SurveyProvider>
        <Suspense fallback={
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight="100vh"
            flexDirection="column"
            gap={2}
          >
            <CircularProgress size={48} />
            <Box component="p" color="text.secondary">
              Loading Survey Builder...
            </Box>
          </Box>
        }>
          <SurveyBuilder />
        </Suspense>
      </SurveyProvider>
    </ThemeProvider>
  )
}

export default App 