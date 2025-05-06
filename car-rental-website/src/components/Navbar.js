import React, { useState } from 'react';
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
} from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SignIn from './SignIn';
import SignUp from './SignUp';
import { PostCarDialog } from './PostCarDialog';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ sx = {}, iconColor = '#333' }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showPostCar, setShowPostCar] = useState(false);
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

  const handleSignInSuccess = () => {
    setShowSignIn(false);
    setIsLoggedIn(true); // Update login state immediately
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('loginStateChanged'));
    
    // Open post car dialog if that's what the user was trying to do
    const token = localStorage.getItem('token');
    if (token && token !== 'null' && typeof token === 'string' && token.trim() !== '') {
      setShowPostCar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#fff', ...sx }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ color: iconColor }}
          >
            <MenuIcon sx={{ color: iconColor }} />
          </IconButton>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Navigate to all offers page */}
            <IconButton color="inherit" sx={{ color: '#333' }} onClick={() => navigate('/offers')}>
              <KeyIcon sx={{ color: iconColor }} />
            </IconButton>
            <Tooltip 
              title={isLoggedIn ? "Post a car" : "Sign in to post a car"} 
              arrow
              placement="bottom"
            >
              <IconButton 
                color="inherit" 
                sx={{ 
                  color: iconColor,
                  '&:hover': {
                    color: isLoggedIn ? '#3498db' : '#e74c3c',
                    cursor: 'pointer',
                  },
                  transition: 'color 0.3s ease',
                  opacity: isLoggedIn ? 1 : 0.5,
                }} 
                onClick={handlePostCarClick}
              >
                <AddCircleIcon sx={{ 
                  color: 'inherit',
                  fontSize: '1.5rem'
                }} />
              </IconButton>
            </Tooltip>
            <IconButton 
              color="inherit" 
              sx={{ color: iconColor }}
              onClick={handleAccountClick}
            >
              <AccountCircleIcon sx={{ color: iconColor }} />
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
              <MenuItem 
                onClick={handleSignInClick}
                sx={{ 
                  color: '#333',
                  minWidth: '150px',
                  gap: 1.5
                }}
              >
                <LoginIcon fontSize="small" sx={{ color: iconColor }} />
                Sign In
              </MenuItem>
              <MenuItem 
                onClick={handleSignUpClick}
                sx={{ 
                  color: '#333',
                  minWidth: '150px',
                  gap: 1.5
                }}
              >
                <PersonAddIcon fontSize="small" sx={{ color: iconColor }} />
                Sign Up
              </MenuItem>
              <MenuItem 
                onClick={() => {
                  handleClose();
                  navigate('/profile');
                }}
                sx={{ 
                  color: '#333',
                  minWidth: '150px',
                  gap: 1.5
                }}
              >
                <AccountCircleIcon fontSize="small" sx={{ color: iconColor }} />
                Profile
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

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
      />
      <PostCarDialog
        open={showPostCar}
        onClose={() => setShowPostCar(false)}
      />

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Navbar;

