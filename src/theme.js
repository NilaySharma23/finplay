import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#20BEFF', // Bright blue (Kaggle-inspired)
      light: '#5DD5FF',
      dark: '#0B8BC7',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF6B35', // Orange-red accent
      light: '#FF8A5B',
      dark: '#CC4A1F',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0F1419', // Very dark blue-grey (Kaggle-like)
      paper: '#1A202C', // Slightly lighter for cards
    },
    surface: {
      main: '#2D3748', // Medium grey for elevated surfaces
      light: '#4A5568',
      dark: '#1A202C',
    },
    text: {
      primary: '#F7FAFC', // Almost white
      secondary: '#CBD5E0', // Light grey
      disabled: '#718096',
    },
    success: {
      main: '#48BB78', // Green for positive actions
      light: '#68D391',
      dark: '#38A169',
    },
    warning: {
      main: '#ED8936', // Orange for warnings
      light: '#F6AD55',
      dark: '#C05621',
    },
    error: {
      main: '#F56565', // Red for errors
      light: '#FC8181',
      dark: '#E53E3E',
    },
    info: {
      main: '#4299E1', // Blue for info
      light: '#63B3ED',
      dark: '#3182CE',
    },
    // Custom colors for gamification
    gamification: {
      gold: '#FFD700',
      silver: '#C0C0C0',
      bronze: '#CD7F32',
      streak: '#FF4500',
      progress: '#20BEFF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.25,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.35,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#CBD5E0',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#A0AEC0',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #0F1419 0%, #1A202C 100%)',
          minHeight: '100vh',
          scrollbarWidth: 'thin',
          scrollbarColor: '#4A5568 #1A202C',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#1A202C',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#4A5568',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#718096',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A202C',
          borderBottom: '1px solid #2D3748',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A202C',
          border: '1px solid #2D3748',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            borderColor: '#4A5568',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 20px',
          fontWeight: 600,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
        },
        outlined: {
          borderColor: '#4A5568',
          '&:hover': {
            borderColor: '#20BEFF',
            backgroundColor: 'rgba(32, 190, 255, 0.04)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#2D3748',
            borderRadius: '8px',
            '& fieldset': {
              borderColor: '#4A5568',
            },
            '&:hover fieldset': {
              borderColor: '#718096',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#20BEFF',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#A0AEC0',
            '&.Mui-focused': {
              color: '#20BEFF',
            },
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: '#2D3748',
          borderRadius: '4px',
          height: '8px',
        },
        bar: {
          borderRadius: '4px',
          background: 'linear-gradient(90deg, #20BEFF 0%, #48BB78 100%)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#2D3748',
          color: '#F7FAFC',
          fontWeight: 500,
          '&.MuiChip-colorSuccess': {
            backgroundColor: '#48BB78',
            color: '#ffffff',
          },
          '&.MuiChip-colorPrimary': {
            backgroundColor: '#20BEFF',
            color: '#ffffff',
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A202C',
          borderRadius: '12px',
          overflow: 'hidden',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#2D3748',
          '& .MuiTableCell-head': {
            color: '#F7FAFC',
            fontWeight: 600,
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#2D3748',
          color: '#CBD5E0',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1A202C',
          borderRight: '1px solid #2D3748',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          margin: '4px 8px',
          '&:hover': {
            backgroundColor: '#2D3748',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          '&.MuiAlert-standardSuccess': {
            backgroundColor: '#22543D',
            color: '#C6F6D5',
            border: '1px solid #38A169',
          },
          '&.MuiAlert-standardError': {
            backgroundColor: '#742A2A',
            color: '#FED7D7',
            border: '1px solid #E53E3E',
          },
          '&.MuiAlert-standardWarning': {
            backgroundColor: '#744210',
            color: '#FEFCBF',
            border: '1px solid #D69E2E',
          },
          '&.MuiAlert-standardInfo': {
            backgroundColor: '#1E3A5F',
            color: '#BEE3F8',
            border: '1px solid #3182CE',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: '#2D3748',
          borderRadius: '8px',
          padding: '4px',
          '& .MuiTab-root': {
            borderRadius: '6px',
            margin: '0 2px',
            minHeight: '48px',
            transition: 'all 0.2s ease-in-out',
            '&.Mui-selected': {
              backgroundColor: '#20BEFF',
              color: '#ffffff',
            },
            '&:hover': {
              backgroundColor: '#4A5568',
            },
          },
          '& .MuiTabs-indicator': {
            display: 'none',
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiSelect-select': {
            backgroundColor: '#2D3748',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#4A5568',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#718096',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#20BEFF',
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: '#718096',
          '&.Mui-checked': {
            color: '#20BEFF',
          },
        },
      },
    },
  },
  // Custom breakpoints for responsive design
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

// Custom component styles for gamification elements
export const gamificationStyles = {
  progressCard: {
    background: 'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)',
    border: '1px solid #4A5568',
    borderRadius: '16px',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #20BEFF 0%, #48BB78 50%, #FFD700 100%)',
    },
  },
  
  streakBadge: {
    background: 'linear-gradient(135deg, #FF4500 0%, #FF6B35 100%)',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(255, 69, 0, 0.3)',
  },
  
  moduleCard: {
    background: 'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)',
    border: '1px solid #4A5568',
    borderRadius: '16px',
    padding: '20px',
    transition: 'all 0.3s ease-in-out',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      borderColor: '#20BEFF',
      '&::before': {
        opacity: 1,
      },
    },
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, rgba(32, 190, 255, 0.1) 0%, rgba(72, 187, 120, 0.1) 100%)',
      opacity: 0,
      transition: 'opacity 0.3s ease-in-out',
    },
  },
  
  tradingCard: {
    background: 'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)',
    border: '1px solid #4A5568',
    borderRadius: '12px',
    padding: '20px',
    backdropFilter: 'blur(10px)',
  },
  
  chatBubble: {
    user: {
      background: 'linear-gradient(135deg, #20BEFF 0%, #4299E1 100%)',
      color: '#ffffff',
      borderRadius: '18px 18px 4px 18px',
      padding: '12px 16px',
      marginLeft: 'auto',
      maxWidth: '70%',
    },
    ai: {
      background: 'linear-gradient(135deg, #2D3748 0%, #4A5568 100%)',
      color: '#F7FAFC',
      borderRadius: '18px 18px 18px 4px',
      padding: '12px 16px',
      marginRight: 'auto',
      maxWidth: '70%',
      border: '1px solid #718096',
    },
  },
  
  leaderboardRow: {
    '&:nth-of-type(1)': {
      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
      border: '1px solid rgba(255, 215, 0, 0.3)',
    },
    '&:nth-of-type(2)': {
      background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.1) 0%, rgba(192, 192, 192, 0.05) 100%)',
      border: '1px solid rgba(192, 192, 192, 0.3)',
    },
    '&:nth-of-type(3)': {
      background: 'linear-gradient(135deg, rgba(205, 127, 50, 0.1) 0%, rgba(205, 127, 50, 0.05) 100%)',
      border: '1px solid rgba(205, 127, 50, 0.3)',
    },
  },
  
  glassmorphism: {
    background: 'rgba(26, 32, 44, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(74, 85, 104, 0.3)',
    borderRadius: '16px',
  },
  
  neonGlow: {
    boxShadow: '0 0 20px rgba(32, 190, 255, 0.3), 0 0 40px rgba(32, 190, 255, 0.1)',
  },
  
  successGlow: {
    boxShadow: '0 0 20px rgba(72, 187, 120, 0.3), 0 0 40px rgba(72, 187, 120, 0.1)',
  },
  
  warningGlow: {
    boxShadow: '0 0 20px rgba(237, 137, 54, 0.3), 0 0 40px rgba(237, 137, 54, 0.1)',
  },
};

// Animation utilities
export const animations = {
  fadeInUp: {
    '@keyframes fadeInUp': {
      '0%': {
        opacity: 0,
        transform: 'translateY(30px)',
      },
      '100%': {
        opacity: 1,
        transform: 'translateY(0)',
      },
    },
    animation: 'fadeInUp 0.6s ease-out',
  },
  
  slideInRight: {
    '@keyframes slideInRight': {
      '0%': {
        opacity: 0,
        transform: 'translateX(30px)',
      },
      '100%': {
        opacity: 1,
        transform: 'translateX(0)',
      },
    },
    animation: 'slideInRight 0.5s ease-out',
  },
  
  pulse: {
    '@keyframes pulse': {
      '0%, 100%': {
        transform: 'scale(1)',
      },
      '50%': {
        transform: 'scale(1.05)',
      },
    },
    animation: 'pulse 2s infinite',
  },
  
  float: {
    '@keyframes float': {
      '0%, 100%': {
        transform: 'translateY(0px)',
      },
      '50%': {
        transform: 'translateY(-10px)',
      },
    },
    animation: 'float 3s ease-in-out infinite',
  },
};

export default theme;