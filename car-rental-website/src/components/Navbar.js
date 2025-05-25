import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Tooltip,
  Snackbar,
  Alert,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon from '@mui/icons-material/Home';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import MapIcon from '@mui/icons-material/Map';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import CategoryIcon from '@mui/icons-material/Category';
import StarIcon from '@mui/icons-material/Star';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SignIn from './SignIn';
import SignUp from './SignUp';
import { PostCarDialog } from './PostCarDialog';
import { useNavigate, useLocation } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import MessageIcon from '@mui/icons-material/Message';

const buttonStyles = (iconColor) => ({
  color: iconColor,
  '&:hover': {
    color: '#3498db',
    cursor: 'pointer',
  },
  transition: 'color 0.3s ease',
});

const Navbar = ({ sx = {}, iconColor = '#fff' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showPostCar, setShowPostCar] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleAccountClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignInClick = () => {
    handleClose();
    setShowSignIn(true);
  };

  const handleSignUpClick = () => {
    handleClose();
    setShowSignUp(true);
  };

  const handleSwitchToSignUp = () => {
    setShowSignIn(false);
    setShowSignUp(true);
  };

  const handleSwitchToSignIn = () => {
    setShowSignUp(false);
    setShowSignIn(true);
  };

  const isAuthenticated = () => {
    try {
      const token = localStorage.getItem('token');
      // Additional check for token format if needed
      if (!token) return false;
      
      // Verify token is a valid JWT format (basic check)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        // Invalid token format, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        return false;
      }
      
      // Check if token is expired (only works if token has exp claim)
      try {
        const payload = JSON.parse(atob(tokenParts[1]));
        if (payload.exp && payload.exp < Date.now() / 1000) {
          // Token expired, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          return false;
        }
      } catch (e) {
        console.error('Error parsing token:', e);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Authentication check failed:', error);
      return false;
    }
  };

  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

  const handlePostCarClick = () => {
    if (!isLoggedIn) {
      // Show a message and open sign in dialog
      setSnackbar({
        open: true,
        message: 'Please sign in to post a car',
        severity: 'info'
      });
      setShowSignIn(true);
    } else {
      setShowPostCar(true);
    }
  };

  // Update login state when token changes
  React.useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(isAuthenticated());
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Check authentication status on component mount
    setIsLoggedIn(isAuthenticated());
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Add a custom event listener for login state changes
  React.useEffect(() => {
    const handleLoginStateChange = () => {
      setIsLoggedIn(isAuthenticated());
    };
    
    window.addEventListener('loginStateChanged', handleLoginStateChange);
    return () => window.removeEventListener('loginStateChanged', handleLoginStateChange);
  }, []);

  const handleSignInSuccess = (userName) => {
    setShowSignIn(false);
    setIsLoggedIn(true); // Update login state immediately
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('loginStateChanged'));
    
    // Show welcome message without navigating away
    setSnackbar({
      open: true,
      message: `Welcome back, ${userName}!`,
      severity: 'success',
      autoHideDuration: 5000,
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'center',
      },
      sx: {
        '& .MuiAlert-message': {
          fontSize: '1.1rem',
          fontWeight: 500,
        },
        '& .MuiAlert-icon': {
          fontSize: '1.5rem',
        },
        minWidth: '300px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        borderRadius: '12px',
      }
    });

    // Open post car dialog if that's what the user was trying to do
    if (localStorage.getItem('postCarAttempt') === 'true') {
      setShowPostCar(true);
      localStorage.removeItem('postCarAttempt');
    }
  };

  const handleSignUpSuccess = (userName) => {
    setShowSignUp(false);
    setIsLoggedIn(true);
    window.dispatchEvent(new Event('loginStateChanged'));
    
    // Show welcome message without navigating away
    setSnackbar({
      open: true,
      message: `Welcome, ${userName}! Your account has been created successfully.`,
      severity: 'success',
      autoHideDuration: 5000,
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'center',
      },
      sx: {
        minWidth: '350px',
      }
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Effect to show welcome message from location state
  // Add a cleanup effect to handle component unmount
  useEffect(() => {
    return () => {
      // Cleanup any pending state
      setSnackbar({ open: false, message: '', severity: 'info' });
    };
  }, []);

  useEffect(() => {
    if (location.state?.showWelcome && location.state?.userName) {
      setSnackbar({
        open: true,
        message: `Welcome, ${location.state.userName}!`,
        severity: 'success',
        autoHideDuration: 5000,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
        sx: {
          minWidth: '300px',
        }
      });
      // Clear the state to prevent message on refresh/re-navigate
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    
    // Clear any pending state
    setIsLoggedIn(false);
    handleClose();
    
    // Clear any existing cookies by setting an expired cookie
    document.cookie = 'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    // Clear any cached data in sessionStorage
    sessionStorage.clear();
    
    // Notify other components about the logout
    window.dispatchEvent(new Event('loginStateChanged'));
    
    // Show logout confirmation message
    setSnackbar({
      open: true,
      message: 'You have been successfully signed out.',
      severity: 'info',
      autoHideDuration: 1000, // Shorter duration before refresh
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'center',
      },
      sx: {
        minWidth: '300px',
      }
    });
    
    // Force a hard refresh after a short delay to ensure the message is seen
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#000', zIndex: 1200, ...sx }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ color: '#fff' }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon sx={{ color: '#fff' }} />
          </IconButton>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Navigate to homepage */}
            <Tooltip title="Home" arrow placement="bottom">
              <IconButton 
                color="inherit" 
                sx={{ color: '#fff' }}
                onClick={() => navigate('/')}
              >
                <HomeIcon sx={{ color: '#fff', fontSize: '1.5rem' }} />
              </IconButton>
            </Tooltip>
            {/* Navigate to all offers page */}
            <IconButton 
              color="inherit" 
              sx={{ color: '#fff' }}
              onClick={() => navigate('/offers')}
            >
              <DirectionsCarIcon sx={{ color: '#fff', fontSize: '1.5rem' }} />
            </IconButton>
            <Tooltip 
              title={isLoggedIn ? "Post a car" : "Sign in to post a car"} 
              arrow
              placement="bottom"
            >
              <IconButton 
                color="inherit" 
                sx={{ color: '#fff' }}
                onClick={handlePostCarClick}
              >
                <AddCircleIcon sx={{ 
                  color: '#fff',
                  fontSize: '1.5rem'
                }} />
              </IconButton>
            </Tooltip>
            {location.pathname === '/profile' && (
              <Tooltip title="Messages" arrow placement="bottom">
                <IconButton
                  color="inherit"
                  sx={{ color: '#fff' }}
                  onClick={() => navigate('/messages')}
                >
                  <MessageIcon sx={{ color: '#fff', fontSize: '1.5rem' }} />
                </IconButton>
              </Tooltip>
            )}
            <IconButton
              color="inherit"
              sx={{
                color: '#fff',
                '&:hover': {
                  color: '#3498db',
                  cursor: 'pointer',
                },
                transition: 'color 0.3s ease',
              }}
              onClick={handleAccountClick}
            >
              <AccountCircleIcon sx={{ color: '#fff' }} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {!isLoggedIn ? (
                <>
                  <MenuItem
                    onClick={handleSignInClick}
                    sx={{
                      color: '#333',
                      minWidth: '150px',
                      gap: 1.5,
                    }}
                  >
                    <LoginIcon fontSize="small" sx={{ color: '#333' }} />
                    Sign In
                  </MenuItem>
                  <MenuItem
                    onClick={handleSignUpClick}
                    sx={{
                      color: '#333',
                      minWidth: '150px',
                      gap: 1.5,
                    }}
                  >
                    <PersonAddIcon fontSize="small" sx={{ color: '#333' }} />
                    Sign Up
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      navigate('/profile');
                    }}
                    sx={{
                      color: '#333',
                      minWidth: '150px',
                      gap: 1.5,
                    }}
                  >
                    <AccountCircleIcon fontSize="small" sx={{ color: '#333' }} />
                    Profile
                  </MenuItem>
                  <MenuItem
                    onClick={handleLogout}
                    sx={{
                      color: '#e74c3c',
                      minWidth: '150px',
                      gap: 1.5,
                    }}
                  >
                    <LogoutIcon fontSize="small" sx={{ color: '#e74c3c' }} />
                    Logout
                  </MenuItem>
                </>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Only render SignIn and SignUp dialogs if user is not logged in */}
      {!isLoggedIn && (
        <>
          <SignIn
            open={showSignIn}
            onClose={() => setShowSignIn(false)}
            onSwitchToSignUp={handleSwitchToSignUp}
            onSuccess={handleSignInSuccess}
          />
          <SignUp
            open={showSignUp}
            onClose={() => setShowSignUp(false)}
            onSwitchToSignIn={handleSwitchToSignIn}
            onSuccess={handleSignUpSuccess}
          />
        </>
      )}

      {/* Post Car Dialog can be shown regardless of login state */}
      <PostCarDialog
        open={showPostCar}
        onClose={() => setShowPostCar(false)}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={snackbar.anchorOrigin || { vertical: 'top', horizontal: 'center' }}
        sx={snackbar.sx || {}}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled" 
          sx={{
            width: '100%',
            bgcolor: snackbar.severity === 'success' ? '#475569' : 
                    snackbar.severity === 'info' ? '#64748b' : 
                    snackbar.severity === 'warning' ? '#475569' : '#475569',
            color: '#fff',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.2)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '& .MuiAlert-icon': {
              color: '#fff',
              opacity: 0.9,
              fontSize: '1.5rem'
            },
            '& .MuiAlert-message': {
              fontSize: '1.1rem',
              fontWeight: 500,
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            },
            '& .MuiAlert-action': {
              color: '#fff',
              opacity: 0.8,
              '&:hover': {
                opacity: 1
              }
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Animated Dark Blue-Grey Sidebar */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 340,
            background: '#0f172a',
            border: 'none',
            boxShadow: '16px 0 50px rgba(2, 6, 23, 0.3)',
            '& .MuiListItemButton-root': {
              borderRadius: '0 32px 32px 0',
              mx: 1.5,
              px: 3,
              py: 1.75,
              my: 0.5,
              transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transformStyle: 'preserve-3d',
              '&:hover': {
                backgroundColor: 'rgba(51, 65, 85, 0.25)',
                transform: 'translateX(12px) rotateY(10deg)',
                boxShadow: '8px 0 20px rgba(2, 6, 23, 0.4)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, rgba(100, 116, 139, 0.15), transparent)',
                  borderRadius: '0 32px 32px 0',
                  animation: 'pulseGradient 1.5s infinite alternate',
                },
                '& .MuiListItemIcon-root': {
                  color: '#e2e8f0',
                  transform: 'scale(1.25) translateZ(20px)',
                  filter: 'drop-shadow(0 3px 8px rgba(226, 232, 240, 0.3))',
                  '& .icon-gradient': {
                    opacity: 1,
                    transform: 'scale(1.1)',
                    animation: 'gradientPulse 2s infinite',
                  }
                },
                '& .MuiListItemText-primary': {
                  color: '#f8fafc',
                  fontWeight: 500,
                  letterSpacing: '0.8px',
                  transform: 'translateZ(10px)',
                  '&::after': {
                    transform: 'scaleX(1)',
                    opacity: 1,
                    background: 'linear-gradient(to right, #94a3b8, #e2e8f0)',
                  }
                },
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(51, 65, 85, 0.35)',
                '& .MuiListItemIcon-root': {
                  color: '#f8fafc',
                  filter: 'drop-shadow(0 3px 10px rgba(226, 232, 240, 0.4))',
                  '& .icon-gradient': {
                    opacity: 1,
                    transform: 'scale(1.15)',
                  }
                },
                '& .MuiListItemText-primary': {
                  color: '#f8fafc',
                  fontWeight: 500,
                  '&::after': {
                    transform: 'scaleX(1)',
                    opacity: 1,
                    background: 'linear-gradient(to right, #94a3b8, #e2e8f0)',
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 5,
                  height: '70%',
                  background: 'linear-gradient(to bottom, #94a3b8, #e2e8f0)',
                  borderRadius: '0 6px 6px 0',
                  boxShadow: '2px 0 12px rgba(148, 163, 184, 0.4)',
                  animation: 'gradientFlow 3s infinite alternate',
                }
              },
            },
            '& .MuiListItemIcon-root': {
              minWidth: 44,
              transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              color: '#94a3b8',
              position: 'relative',
              transformStyle: 'preserve-3d',
              '& .icon-gradient': {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(148, 163, 184, 0.15) 0%, transparent 100%)',
                opacity: 0,
                transform: 'scale(0.8)',
                transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                mask: 'url(#icon-mask)',
                maskSize: 'cover',
                WebkitMask: 'url(#icon-mask)',
                WebkitMaskSize: 'cover',
              }
            },
            '& .MuiListItemText-primary': {
              position: 'relative',
              color: '#e2e8f0',
              transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transformStyle: 'preserve-3d',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -4,
                left: 0,
                width: '100%',
                height: 2,
                background: 'linear-gradient(to right, #94a3b8, #e2e8f0)',
                transform: 'scaleX(0)',
                transformOrigin: 'left center',
                opacity: 0,
                transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease'
              }
            },
          },
        }}
      >
        <style>{
          `
          @keyframes pulseGradient {
            0% { opacity: 0.3; }
            100% { opacity: 0.7; }
          }
          @keyframes gradientPulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
          }
          @keyframes gradientFlow {
            0% { background: linear-gradient(to bottom, #94a3b8, #e2e8f0); }
            100% { background: linear-gradient(to bottom, #e2e8f0, #94a3b8); }
          }
          `
        }</style>
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: '#0f172a',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              opacity: 0.4,
              pointerEvents: 'none',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '40%',
              background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.8), transparent)',
              zIndex: 1,
            }
          }}
          role="presentation"
          onClick={() => setDrawerOpen(false)}
          onKeyDown={() => setDrawerOpen(false)}
        >
          {/* Dark Blue-Grey Header */}
          <Box sx={{ 
            background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
            color: '#e2e8f0', 
            p: 4.5,
            pb: 3.5,
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'flex-start',
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '100%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(71, 85, 105, 0.2) 0%, rgba(15, 23, 42, 0) 70%)',
              transform: 'rotate(30deg)',
              animation: 'rotateGradient 25s linear infinite',
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              bottom: -20,
              left: 0,
              right: 0,
              height: 20,
              background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.3))',
              zIndex: 1,
            }
          }}>
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '22px',
              bgcolor: 'rgba(30, 41, 59, 0.3)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(71, 85, 105, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3.5,
              boxShadow: '0 16px 50px rgba(2, 6, 23, 0.4)',
              position: 'relative',
              overflow: 'hidden',
              transform: 'translateZ(0)',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                right: '-50%',
                bottom: '-50%',
                background: 'linear-gradient(45deg, transparent, rgba(100, 116, 139, 0.3), transparent)',
                transform: 'rotate(45deg)',
                animation: 'shimmer 3s infinite',
              }
            }}>
              <Box sx={{
                width: 70,
                height: 70,
                borderRadius: '18px',
                bgcolor: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 1,
                boxShadow: '0 8px 30px rgba(2, 6, 23, 0.7)',
                transform: 'translateZ(0)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, rgba(148, 163, 184, 0.15) 0%, transparent 100%)',
                }
              }}>
                <DirectionsCarIcon sx={{ 
                  fontSize: 36, 
                  color: '#e2e8f0',
                  filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))'
                }} />
              </Box>
            </Box>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700, 
                mb: 1.25, 
                fontSize: '1.7rem',
                letterSpacing: '-0.8px',
                position: 'relative',
                zIndex: 1,
                textShadow: '0 3px 8px rgba(0,0,0,0.5)',
                color: '#e2e8f0',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -4,
                  left: 0,
                  width: '40%',
                  height: 2,
                  background: 'linear-gradient(to right, #94a3b8, transparent)',
                  transition: 'width 0.6s ease'
                },
                '&:hover::after': {
                  width: '100%'
                }
              }}
            >
              ConnectDZ
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                opacity: 0.8, 
                letterSpacing: '0.5px',
                position: 'relative',
                zIndex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                color: '#94a3b8',
                fontStyle: 'italic',
                '&::before': {
                  content: '""',
                  display: 'inline-block',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: '#64748b',
                  mr: 1.25,
                  animation: 'pulse 2.5s infinite',
                }
              }}
            >
              Premium car rental in Algeria
            </Typography>
          </Box>
          
          {/* Menu Items */}
          <Box sx={{ pt: 2, pb: 1, position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <List sx={{ flex: 1, px: 1 }}>
              <ListItem 
                button 
                onClick={() => navigate('/')}
                selected={location.pathname === '/'}
                sx={{
                  borderRadius: '12px',
                  mb: 0.5,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(51, 65, 85, 0.2)',
                    transform: 'translateX(6px)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(51, 65, 85, 0.3)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: -8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 4,
                      height: '60%',
                      backgroundColor: '#94a3b8',
                      borderRadius: '0 4px 4px 0',
                    }
                  }
                }}
              >
                <ListItemIcon>
                  <HomeIcon sx={{ 
                    color: '#94a3b8',
                    transition: 'all 0.3s ease',
                    '.Mui-selected &': { color: '#e2e8f0' },
                    'ListItem:hover &': { color: '#e2e8f0', transform: 'scale(1.1)' }
                  }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Home" 
                  primaryTypographyProps={{
                    variant: 'body1',
                    color: '#e2e8f0',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    letterSpacing: '0.2px'
                  }}
                />
              </ListItem>
              
              <ListItem 
                button 
                onClick={() => navigate('/offers')}
                selected={location.pathname.startsWith('/offers')}
                sx={{
                  borderRadius: '12px',
                  mb: 0.5,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(51, 65, 85, 0.2)',
                    transform: 'translateX(6px)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(51, 65, 85, 0.3)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: -8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 4,
                      height: '60%',
                      backgroundColor: '#94a3b8',
                      borderRadius: '0 4px 4px 0',
                    }
                  }
                }}
              >
                <ListItemIcon>
                  <DirectionsCarIcon sx={{ 
                    color: '#94a3b8',
                    transition: 'all 0.3s ease',
                    '.Mui-selected &': { color: '#e2e8f0' },
                    'ListItem:hover &': { color: '#e2e8f0', transform: 'scale(1.1)' }
                  }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Browse Cars" 
                  primaryTypographyProps={{
                    variant: 'body1',
                    color: '#e2e8f0',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    letterSpacing: '0.2px'
                  }}
                />
              </ListItem>
              
              <ListItem 
                button 
                onClick={() => navigate('/map')}
                selected={location.pathname.startsWith('/map')}
                sx={{
                  borderRadius: '12px',
                  mb: 0.5,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(51, 65, 85, 0.2)',
                    transform: 'translateX(6px)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(51, 65, 85, 0.3)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: -8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 4,
                      height: '60%',
                      backgroundColor: '#94a3b8',
                      borderRadius: '0 4px 4px 0',
                    }
                  }
                }}
              >
                <ListItemIcon>
                  <MapIcon sx={{ 
                    color: '#94a3b8',
                    transition: 'all 0.3s ease',
                    '.Mui-selected &': { color: '#e2e8f0' },
                    'ListItem:hover &': { color: '#e2e8f0', transform: 'scale(1.1)' }
                  }} />
                </ListItemIcon>
                <ListItemText 
                  primary="View on Map" 
                  primaryTypographyProps={{
                    variant: 'body1',
                    color: '#e2e8f0',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    letterSpacing: '0.2px'
                  }}
                />
              </ListItem>
              
              <ListItem 
                button 
                onClick={() => navigate('/deals')}
                selected={location.pathname.startsWith('/deals')}
                sx={{
                  borderRadius: '12px',
                  mb: 0.5,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(51, 65, 85, 0.2)',
                    transform: 'translateX(6px)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(51, 65, 85, 0.3)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: -8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 4,
                      height: '60%',
                      backgroundColor: '#94a3b8',
                      borderRadius: '0 4px 4px 0',
                    }
                  }
                }}
              >
                <ListItemIcon>
                  <LocalOfferIcon sx={{ 
                    color: '#94a3b8',
                    transition: 'all 0.3s ease',
                    '.Mui-selected &': { color: '#e2e8f0' },
                    'ListItem:hover &': { color: '#e2e8f0', transform: 'scale(1.1)' }
                  }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Special Offers" 
                  primaryTypographyProps={{
                    variant: 'body1',
                    color: '#e2e8f0',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    letterSpacing: '0.2px'
                  }}
                />
              </ListItem>

              {/* Post Your Car menu item removed */}
            </List>

            <Divider sx={{ my: 2, backgroundColor: 'rgba(148, 163, 184, 0.15)' }} />
            
            <List sx={{ px: 1 }}>
              <ListItem 
                button 
                onClick={() => navigate('/faq')}
                selected={location.pathname === '/faq'}
                sx={{
                  borderRadius: '12px',
                  mb: 0.5,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(51, 65, 85, 0.2)',
                    transform: 'translateX(6px)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(51, 65, 85, 0.3)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: -8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 4,
                      height: '60%',
                      backgroundColor: '#94a3b8',
                      borderRadius: '0 4px 4px 0',
                    }
                  }
                }}
              >
                <ListItemIcon>
                  <HelpIcon sx={{ 
                    color: '#94a3b8',
                    transition: 'all 0.3s ease',
                    '.Mui-selected &': { color: '#e2e8f0' },
                    'ListItem:hover &': { color: '#e2e8f0', transform: 'scale(1.1)' }
                  }} />
                </ListItemIcon>
                <ListItemText 
                  primary="FAQ" 
                  primaryTypographyProps={{
                    variant: 'body1',
                    color: '#e2e8f0',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    letterSpacing: '0.2px'
                  }}
                />
              </ListItem>
              
              <ListItem 
                button 
                onClick={() => navigate('/contact')}
                selected={location.pathname === '/contact'}
                sx={{
                  borderRadius: '12px',
                  mb: 0.5,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(51, 65, 85, 0.2)',
                    transform: 'translateX(6px)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(51, 65, 85, 0.3)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: -8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 4,
                      height: '60%',
                      backgroundColor: '#94a3b8',
                      borderRadius: '0 4px 4px 0',
                    }
                  }
                }}
              >
                <ListItemIcon>
                  <ContactSupportIcon sx={{ 
                    color: '#94a3b8',
                    transition: 'all 0.3s ease',
                    '.Mui-selected &': { color: '#e2e8f0' },
                    'ListItem:hover &': { color: '#e2e8f0', transform: 'scale(1.1)' }
                  }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Contact Us" 
                  primaryTypographyProps={{
                    variant: 'body1',
                    color: '#e2e8f0',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    letterSpacing: '0.2px'
                  }}
                />
              </ListItem>
            </List>
            
            {/* Footer */}
            <Box sx={{ 
              mt: 'auto', 
              pt: 2, 
              pb: 2,
              borderTop: '1px solid rgba(148, 163, 184, 0.15)',
              textAlign: 'center',
              opacity: 0.7,
              '&:hover': {
                opacity: 1
              },
              transition: 'opacity 0.3s ease'
            }}>
              <Typography variant="caption" sx={{ 
                fontSize: '0.7rem',
                color: '#94a3b8',
                display: 'block',
                mb: 0.5
              }}>
                ConnectDZ v1.0.0
              </Typography>
              <Typography variant="caption" sx={{ 
                fontSize: '0.65rem',
                color: '#64748b',
                display: 'block'
              }}>
                &copy; {new Date().getFullYear()} All rights reserved
              </Typography>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Custom Snackbar for welcome message */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.autoHideDuration || 5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={snackbar.anchorOrigin || { vertical: 'bottom', horizontal: 'left' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            minWidth: '300px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            borderRadius: '12px',
            padding: '10px 20px',
            backgroundColor: snackbar.severity === 'success' ? '#4caf50' : 
                          snackbar.severity === 'error' ? '#f44336' :
                          snackbar.severity === 'warning' ? '#ff9800' : '#2196f3',
          },
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity || 'info'}
          variant="filled"
          sx={{
            width: '100%',
            '& .MuiAlert-message': {
              fontSize: '1.1rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            },
            '& .MuiAlert-icon': {
              fontSize: '1.8rem',
              color: '#fff',
            },
          }}
          iconMapping={{
            success: <CheckCircleIcon fontSize="inherit" />,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Navbar;
