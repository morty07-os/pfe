import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Box, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import KeyIcon from '@mui/icons-material/Key';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SignIn from './SignIn';
import SignUp from './SignUp';
import PostCarDialog from './PostCarDialog';

import { useNavigate } from 'react-router-dom';

const Navbar = ({ sx = {}, iconColor = '#333' }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showPostCar, setShowPostCar] = useState(false);

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
            <IconButton color="inherit" sx={{ color: '#333' }} onClick={() => setShowPostCar(true)}>
              <AddCircleIcon sx={{ color: iconColor }} />
            </IconButton>
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
      />

      <SignUp
        open={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitchToSignIn={handleSwitchToSignIn}
      />
      <PostCarDialog
        open={showPostCar}
        onClose={() => setShowPostCar(false)}
        isLoggedIn={true} // Add this prop to show the dialog for logged-in users
      />
    </>
  );
};

export default Navbar;
