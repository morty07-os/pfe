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
import MailIcon from '@mui/icons-material/Mail'; // Import the messages icon
import SignIn from './SignIn';
import SignUp from './SignUp';
import { PostCarDialog } from './PostCarDialog';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';

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
          >
            <MenuIcon sx={{ color: '#fff' }} />
          </IconButton>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Navigate to all offers page */}
            <IconButton 
              color="inherit" 
              sx={{ color: '#fff' }}
              onClick={() => navigate('/offers')}
            >
              <KeyIcon sx={{ color: '#fff' }} />
            </IconButton>
            {isLoggedIn && ( // Show messages icon only if user is logged in
              <Tooltip title="Messages" arrow placement="bottom">
                <IconButton 
                  color="inherit" 
                  sx={{ color: '#fff' }}
                  onClick={() => navigate('/messages')}
                >
                  <MailIcon sx={{ color: '#fff', fontSize: '1.5rem' }} />
                </IconButton>
              </Tooltip>
            )}
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
            <IconButton 
              color="inherit" 
              sx={{ 
                color: '#fff',
                '&:hover': {
                  color: '#3498db',
                  cursor: 'pointer',
                },
                transition: 'color 0.3s ease'
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
                      gap: 1.5
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
                      gap: 1.5
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
                      gap: 1.5
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
                      gap: 1.5
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
    </>
  );
};

export default Navbar;

