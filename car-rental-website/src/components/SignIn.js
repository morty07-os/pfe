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
import { useNavigate } from 'react-router-dom';
import ForgotPasswordDialog from './ForgotPasswordDialog';

const SignIn = ({ open, onClose, onSwitchToSignUp, onSuccess }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');
  const [message, setMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Sign in failed');
      }

      const result = await response.json();
      setMessage('Sign in successful');
      localStorage.setItem('token', result.token);
      localStorage.setItem('userId', result.user._id);
      onClose();
      
      const userName = result.user?.firstName || 'User';
      if (onSuccess) {
        onSuccess(userName);
      }
      
      window.dispatchEvent(new Event('loginStateChanged'));
    } catch (error) {
      setMessage(error.message || 'Sign in failed');
      console.error("Error during sign in:", error);
    }
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
          boxShadow: '0 12px 50px -12px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          background: '#f8fafc'
        }
      }}
    >
      <Box sx={{
        position: 'relative',
        background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
        p: 3,
        color: '#f8fafc',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 700, 
          mb: 1, 
          letterSpacing: '-0.5px',
          color: 'white'
        }}>
          Welcome Back
        </Typography>
        <Typography variant="body2" sx={{ 
          opacity: 0.9, 
          fontSize: '0.95rem',
          color: '#e2e8f0'
        }}>
          Sign in to continue your journey
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            color: '#e2e8f0',
            backgroundColor: 'rgba(241, 245, 249, 0.1)',
            '&:hover': { 
              backgroundColor: 'rgba(241, 245, 249, 0.2)',
              color: 'white'
            },
            transition: 'all 0.2s ease'
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ 
          p: 4,
          backgroundColor: '#f8fafc'
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 3,
          }}>
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#94a3b8',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1e40af',
                    borderWidth: '1px',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#64748b',
                  '&.Mui-focused': {
                    color: '#1e40af'
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon 
                      sx={{ 
                        color: focused === 'email' ? '#1e40af' : '#64748b',
                        transition: 'color 0.3s ease'
                      }} 
                    />
                  </InputAdornment>
                ),
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#94a3b8',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1e40af',
                    borderWidth: '1px',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#64748b',
                  '&.Mui-focused': {
                    color: '#1e40af'
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon 
                      sx={{ 
                        color: focused === 'password' ? '#1e40af' : '#64748b',
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
                      sx={{ 
                        color: showPassword ? '#1e40af' : '#64748b',
                        '&:hover': {
                          backgroundColor: 'rgba(30, 64, 175, 0.05)'
                        }
                      }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="text"
              onClick={() => setShowForgotPassword(true)}
              sx={{
                alignSelf: 'flex-end',
                color: '#64748b',
                fontSize: '0.875rem',
                textTransform: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(100, 116, 139, 0.08)',
                  color: '#1e40af',
                  textDecoration: 'none',
                },
                transition: 'all 0.2s ease',
                fontWeight: 500,
              }}
            >
              Forgot Password?
            </Button>
          </Box>
          {message && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: message === 'Sign in successful' ? '#16a34a' : '#dc2626', 
                mt: 2, 
                fontWeight: 500 
              }}
            >
              {message}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          justifyContent: 'space-between', 
          p: 3, 
          pt: 2,
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <Button
            onClick={onSwitchToSignUp}
            sx={{ 
              textTransform: 'none', 
              fontWeight: 500,
              color: '#475569',
              '&:hover': {
                backgroundColor: 'rgba(30, 64, 175, 0.04)',
                color: '#1e40af'
              },
              transition: 'all 0.2s ease',
              padding: '6px 8px',
              fontSize: '0.9375rem'
            }}
          >
            Don't have an account? <Box component="span" sx={{ color: '#1e40af', fontWeight: 600, ml: 0.5 }}>Sign Up</Box>
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!formData.email || !formData.password}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              py: 1.5,
              backgroundColor: '#334155',
              background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
              color: '#f8fafc',
              '&:hover': {
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -1px rgba(15, 23, 42, 0.06)'
              },
              '&.Mui-disabled': {
                background: '#e2e8f0',
                color: '#94a3b8',
                boxShadow: 'none'
              },
              transition: 'all 0.2s ease',
              fontSize: '0.9375rem',
              letterSpacing: '0.01em'
            }}
          >
            Sign In
          </Button>
        </DialogActions>
      </form>

      <ForgotPasswordDialog
        open={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSwitchToSignIn={() => {
          setShowForgotPassword(false);
          onClose();
        }}
      />
    </Dialog>
  );
};

export default SignIn;
