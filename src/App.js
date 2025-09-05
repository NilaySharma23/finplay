import React, { useEffect, useState } from 'react';
import { 
  Container, AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, ListItemIcon, Box, CssBaseline, Fade, useMediaQuery, Avatar
} from '@mui/material';
import { Menu as MenuIcon, Dashboard as DashboardIcon, TrendingUp as TradingIcon, Chat as ChatIcon, Groups as LeagueIcon, SportsEsports as GamesIcon, School as LearnIcon, Home as HomeIcon, Login as LoginIcon, Logout as LogoutIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Components
import Home from './components/Home';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Trading from './components/Trading';
import Chatbot from './components/Chatbot';
import Login from './components/Login';
import Profile from './components/Profile';
import League from './components/League';
import Learn from './components/Learn';
import DemosAndGames from './components/DemosAndGames';
import Settings from './components/Settings';

// Theme
import theme from './theme';
import './App.css';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Navigation items configuration
  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon />, description: 'Your learning progress', authRequired: true },
    { path: '/trading', label: 'Virtual Trading', icon: <TradingIcon />, description: 'Practice with virtual money', authRequired: true },
    { path: '/chatbot', label: 'AI Buddy', icon: <ChatIcon />, description: 'Ask financial questions', authRequired: true },
    { path: '/league', label: 'Leagues', icon: <LeagueIcon />, description: 'Join competitions & view leaderboards', authRequired: true },
    { path: '/demos', label: 'Games & Demos', icon: <GamesIcon />, description: 'Interactive learning games', authRequired: true },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon />, description: 'Manage your preferences', authRequired: true },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', { currentUser: currentUser ? currentUser.uid : null, location: location.pathname });

      // If no user is authenticated, redirect to login
      if (!currentUser) {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        if (location.pathname !== '/' && location.pathname !== '/login') {
          console.log('Redirecting to /login (no user)');
          navigate('/login', { replace: true });
        }
        return;
      }

      // User is authenticated, check profile data
      setUser(currentUser);
      try {
        const userDoc = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDoc);
        console.log('User doc exists:', docSnap.exists());
        if (docSnap.exists()) {
          const userData = docSnap.data();
          console.log('User data:', userData);
          setUserProfile(userData);

          // Redirect to onboarding if username or language is missing
          if (!userData.username || !userData.language) {
            console.log('Redirecting to /onboarding (incomplete profile)');
            navigate('/onboarding', { replace: true });
          } else {
            // Redirect to dashboard if on home or login page
            if (location.pathname === '/' || location.pathname === '/login') {
              console.log('Redirecting to /dashboard (authenticated user)');
              navigate('/dashboard', { replace: true });
            }
          }
        } else {
          console.log('Redirecting to /onboarding (no user doc)');
          navigate('/onboarding', { replace: true });
        }
      } catch (err) {
        console.error('Error checking user data:', err);
        navigate('/onboarding', { replace: true });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      localStorage.removeItem('language');
      localStorage.removeItem('experience');
      console.log('User logged out, redirecting to /login');
      navigate('/login', { replace: true });
      setDrawerOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0F1419 0%, #1A202C 100%)'
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box className="loading-spinner" sx={{ mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#CBD5E0' }}>
              Loading FinPlay...
            </Typography>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar 
        position="sticky" 
        sx={{ 
          background: 'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)',
          borderBottom: '1px solid #4A5568',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              edge="start" 
              color="inherit" 
              onClick={toggleDrawer} 
              sx={{ 
                mr: 2,
                '&:hover': {
                  background: 'rgba(32, 190, 255, 0.1)',
                  transform: 'scale(1.1)',
                }
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #20BEFF 0%, #FF6B35 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              FinPlay
            </Typography>
          </Box>
          {user && userProfile && (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                cursor: 'pointer', 
                '&:hover': { 
                  transform: 'scale(1.02)', 
                  transition: 'transform 0.2s ease-in-out' 
                } 
              }} 
              onClick={() => navigate('/profile')}
            >
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ color: '#CBD5E0' }}>
                  {userProfile.username || user.email}
                </Typography>
                <Typography variant="caption" sx={{ color: '#A0AEC0' }}>
                  {userProfile.language?.toUpperCase()}
                </Typography>
              </Box>
              <Avatar 
                src={userProfile.profilePicture}
                sx={{ 
                  bgcolor: !userProfile.profilePicture ? '#20BEFF' : 'transparent',
                  width: 40,
                  height: 40,
                  border: '2px solid #4A5568'
                }}
              >
                {!userProfile.profilePicture && (userProfile.username || user.email || 'U')[0].toUpperCase()}
              </Avatar>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Drawer 
        open={drawerOpen} 
        onClose={toggleDrawer}
        PaperProps={{
          sx: {
            width: isMobile ? '80vw' : 280,
            background: 'linear-gradient(180deg, #1A202C 0%, #0F1419 100%)',
            border: 'none',
            borderRight: '1px solid #2D3748',
          }
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid #2D3748' }}>
          <Typography 
            variant="h6" 
            sx={{ 
              background: 'linear-gradient(135deg, #20BEFF 0%, #FF6B35 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 700,
              mb: 1
            }}
          >
            FinPlay
          </Typography>
          <Typography variant="body2" sx={{ color: '#A0AEC0' }}>
            Gamified Financial Learning
          </Typography>
        </Box>
        <List sx={{ px: 2, py: 1 }}>
          {!user ? (
            <>
              <ListItem 
                button 
                component={Link} 
                to="/"
                onClick={toggleDrawer}
                sx={{
                  borderRadius: '12px',
                  mb: 1,
                  backgroundColor: isActivePath('/') ? 'rgba(32, 190, 255, 0.1)' : 'transparent',
                  borderLeft: isActivePath('/') ? '3px solid #20BEFF' : '3px solid transparent',
                  '&:hover': {
                    backgroundColor: '#2D3748',
                    transform: 'translateX(4px)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: isActivePath('/') ? '#20BEFF' : '#CBD5E0' }}>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Home" 
                  sx={{ 
                    '& .MuiListItemText-primary': { 
                      color: isActivePath('/') ? '#20BEFF' : '#F7FAFC',
                      fontWeight: isActivePath('/') ? 600 : 400
                    }
                  }}
                />
              </ListItem>
              <ListItem 
                button 
                component={Link} 
                to="/login"
                onClick={toggleDrawer}
                sx={{
                  borderRadius: '12px',
                  mb: 1,
                  backgroundColor: isActivePath('/login') ? 'rgba(32, 190, 255, 0.1)' : 'transparent',
                  borderLeft: isActivePath('/login') ? '3px solid #20BEFF' : '3px solid transparent',
                  '&:hover': {
                    backgroundColor: '#2D3748',
                    transform: 'translateX(4px)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: isActivePath('/login') ? '#20BEFF' : '#CBD5E0' }}>
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Get Started" 
                  sx={{ 
                    '& .MuiListItemText-primary': { 
                      color: isActivePath('/login') ? '#20BEFF' : '#F7FAFC',
                      fontWeight: isActivePath('/login') ? 600 : 400
                    }
                  }}
                />
              </ListItem>
            </>
          ) : (
            <>
              {navigationItems.map((item) => (
                <ListItem 
                  key={item.path}
                  button 
                  component={Link} 
                  to={item.path}
                  onClick={toggleDrawer}
                  sx={{
                    borderRadius: '12px',
                    mb: 1,
                    backgroundColor: isActivePath(item.path) ? 'rgba(32, 190, 255, 0.1)' : 'transparent',
                    borderLeft: isActivePath(item.path) ? '3px solid #20BEFF' : '3px solid transparent',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: '#2D3748',
                      transform: 'translateX(4px)',
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: isActivePath(item.path) ? '#20BEFF' : '#CBD5E0',
                    minWidth: '40px'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <Box>
                    <ListItemText 
                      primary={item.label}
                      secondary={item.description}
                      sx={{ 
                        '& .MuiListItemText-primary': { 
                          color: isActivePath(item.path) ? '#20BEFF' : '#F7FAFC',
                          fontWeight: isActivePath(item.path) ? 600 : 400,
                          fontSize: '0.95rem'
                        },
                        '& .MuiListItemText-secondary': {
                          color: '#A0AEC0',
                          fontSize: '0.8rem'
                        }
                      }}
                    />
                  </Box>
                </ListItem>
              ))}
              <ListItem 
                button 
                onClick={handleLogout}
                sx={{
                  borderRadius: '12px',
                  mb: 1,
                  mt: 2,
                  borderTop: '1px solid #2D3748',
                  pt: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(245, 101, 101, 0.1)',
                    transform: 'translateX(4px)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: '#F56565', minWidth: '40px' }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Logout" 
                  sx={{ 
                    '& .MuiListItemText-primary': { 
                      color: '#F56565',
                      fontWeight: 500
                    }
                  }}
                />
              </ListItem>
            </>
          )}
        </List>
        {user && userProfile && (
          <Box sx={{ 
            mt: 'auto', 
            p: 2, 
            borderTop: '1px solid #2D3748',
            background: 'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  background: '#48BB78',
                  animation: 'pulse 2s infinite'
                }} 
              />
              <Typography variant="caption" sx={{ color: '#48BB78', fontWeight: 600 }}>
                ONLINE
              </Typography>
            </Box>
            {userProfile.streak && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#20BEFF' }}>
                  🔥 {userProfile.streak.count} day streak
                </Typography>
              </Box>
            )}
            <Typography variant="caption" sx={{ color: '#A0AEC0' }}>
              Virtual Balance: ₹{(userProfile.virtualBalance || 100000).toLocaleString()}
            </Typography>
          </Box>
        )}
      </Drawer>
      <Container 
        maxWidth="xl" 
        sx={{ 
          mt: 3, 
          mb: 4,
          px: { xs: 2, md: 3 },
          minHeight: 'calc(100vh - 120px)'
        }}
      >
        <Fade in={!loading} timeout={600}>
          <Box>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/onboarding" element={user ? <Onboarding /> : <Login />} />
              <Route path="/dashboard" element={user ? <Dashboard /> : <Login />} />
              <Route path="/trading" element={user ? <Trading /> : <Login />} />
              <Route path="/chatbot" element={user ? <Chatbot /> : <Login />} />
              <Route path="/league" element={user ? <League /> : <Login />} />
              <Route path="/demos" element={user ? <DemosAndGames /> : <Login />} />
              <Route path="/profile" element={user ? <Profile /> : <Login />} />
              <Route path="/settings" element={user ? <Settings /> : <Login />} />
              <Route path="/learn/:moduleId" element={user ? <Learn /> : <Login />} />
            </Routes>
          </Box>
        </Fade>
      </Container>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(32, 190, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 107, 53, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(72, 187, 120, 0.05) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
    </ThemeProvider>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}