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
    const token = localStorage.getItem('token');
    return !!(token && token !== 'null' && typeof token === 'string' && token.trim() !== '');
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
    
    navigate('/', { state: { showWelcome: true, userName } });

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
    navigate('/', { state: { showWelcome: true, userName } });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Effect to show welcome message from location state
  useEffect(() => {
    if (location.state?.showWelcome && location.state?.userName) {
      setSnackbar({
        open: true,
        message: `Welcome, ${location.state.userName}!`, // Personalized welcome message
        severity: 'success'
      });
      // Clear the state to prevent message on refresh/re-navigate
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    handleClose();
    window.dispatchEvent(new Event('loginStateChanged'));
    // Redirect to home page or offers page after logout
    navigate('/offers');
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#000', ...sx }}>
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
              <KeyIcon sx={{ color: '#fff' }} />
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
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Sidebar Menu */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box
          sx={{ width: 280 }}
          role="presentation"
          onClick={() => setDrawerOpen(false)}
          onKeyDown={() => setDrawerOpen(false)}
        >
          <Box sx={{ 
            bgcolor: '#334155', 
            color: '#fff', 
            p: 2, 
            display: 'flex', 
            alignItems: 'center',
            gap: 1
          }}>
            <DirectionsCarIcon />
            <Typography variant="h6" component="div">
              Car Rental
            </Typography>
          </Box>
          <List>
            <ListItem button onClick={() => navigate('/')}>
              <ListItemIcon>
                <HomeIcon sx={{ color: '#475569' }} />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem button onClick={() => navigate('/offers')}>
              <ListItemIcon>
                <DirectionsCarIcon sx={{ color: '#475569' }} />
              </ListItemIcon>
              <ListItemText primary="Browse Cars" />
            </ListItem>
            <ListItem button onClick={() => navigate('/map')}>
              <ListItemIcon>
                <MapIcon sx={{ color: '#475569' }} />
              </ListItemIcon>
              <ListItemText primary="Find Cars on Map" />
            </ListItem>
            <ListItem button onClick={() => navigate('/deals')}>
              <ListItemIcon>
                <LocalOfferIcon sx={{ color: '#475569' }} />
              </ListItemIcon>
              <ListItemText primary="Special Offers" />
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem button onClick={() => navigate('/about')}>
              <ListItemIcon>
                <InfoIcon sx={{ color: '#475569' }} />
              </ListItemIcon>
              <ListItemText primary="About Us" />
            </ListItem>
            <ListItem button onClick={() => navigate('/faq')}>
              <ListItemIcon>
                <HelpIcon sx={{ color: '#475569' }} />
              </ListItemIcon>
              <ListItemText primary="FAQ" />
            </ListItem>
            <ListItem button onClick={() => navigate('/contact')}>
              <ListItemIcon>
                <ContactSupportIcon sx={{ color: '#475569' }} />
              </ListItemIcon>
              <ListItemText primary="Contact Us" />
            </ListItem>
            <ListItem button onClick={() => navigate('/reviews')}>
              <ListItemIcon>
                <StarIcon sx={{ color: '#475569' }} />
              </ListItemIcon>
              <ListItemText primary="Reviews" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
