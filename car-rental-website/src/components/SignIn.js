import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

const SignIn = ({ open, onClose, onSwitchToSignUp }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add authentication logic here
    console.log('Sign in data:', formData);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 12px 50px -12px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }
      }}
    >
      <Box sx={{
        position: 'relative',
        background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
        p: 3,
        color: 'white',
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Welcome Back
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Sign in to continue your journey
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused('')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon 
                      sx={{ 
                        color: focused === 'email' ? '#475569' : '#94a3b8',
                        transition: 'color 0.3s ease'
                      }} 
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#94a3b8',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3498db',
                  },
                },
              }}
            />
            <TextField
              required
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              variant="outlined"
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused('')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon 
                      sx={{ 
                        color: focused === 'password' ? '#475569' : '#94a3b8',
                        transition: 'color 0.3s ease'
                      }} 
                    />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: showPassword ? '#475569' : '#94a3b8' }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#94a3b8',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3498db',
                  },
                },
              }}
            />
            <Button
              variant="text"
              sx={{
                alignSelf: 'flex-end',
                color: '#64748b',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: '#475569',
                }
              }}
            >
              Forgot Password?
            </Button>
          </Box>
        </DialogContent>

        <DialogActions 
          sx={{ 
            p: 4, 
            pt: 0,
            flexDirection: 'column',
            gap: 2
          }}
        >
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              bgcolor: '#475569',
              color: 'white',
              py: 1.5,
              fontSize: '1rem',
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#334155',
              },
            }}
          >
            Sign In
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Don't have an account?
            </Typography>
            <Button
              onClick={() => onSwitchToSignUp()}
              sx={{
                color: '#3498db',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: '#334155',
                }
              }}
            >
              Sign Up
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SignIn;
