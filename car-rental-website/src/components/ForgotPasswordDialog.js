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
  CircularProgress,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import { useTheme } from '@mui/material/styles';

const ForgotPasswordDialog = ({ open, onClose, onSwitchToSignIn }) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', severity: 'info' });
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage({ text: 'Please enter your email address', severity: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', severity: 'info' });

    try {
      const response = await fetch('http://localhost:5001/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          text: 'Password reset instructions have been sent to your email.', 
          severity: 'success' 
        });
        setResetSent(true);
      } else {
        setMessage({ 
          text: data.error || 'Failed to send reset instructions. Please try again.', 
          severity: 'error' 
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ 
        text: 'An error occurred. Please try again later.', 
        severity: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setEmail('');
    setMessage({ text: '', severity: 'info' });
    setResetSent(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 12px 50px -12px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
          p: 3,
          color: 'white',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Reset Your Password
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {resetSent 
            ? 'Check your email for further instructions.' 
            : 'Enter your email to receive a password reset link.'}
        </Typography>
        <IconButton
          onClick={handleCloseDialog}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 4 }}>
          {message.text && (
            <Alert 
              severity={message.severity} 
              sx={{ mb: 3, borderRadius: 2 }}
            >
              {message.text}
            </Alert>
          )}
          
          {!resetSent ? (
            <TextField
              autoFocus
              margin="dense"
              id="email"
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <EmailIcon 
                    sx={{ 
                      color: theme.palette.text.secondary, 
                      mr: 1,
                      mt: '2px',
                    }} 
                  />
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                We've sent an email to <strong>{email}</strong> with instructions to reset your password.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Didn't receive the email? Check your spam folder or try again.
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={handleCloseDialog}
            color="inherit"
            disabled={isLoading}
          >
            Close
          </Button>
          {!resetSent && (
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading || !email}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1,
              }}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          )}
        </DialogActions>
      </form>
      
      {!resetSent && (
        <Box sx={{ 
          p: 2, 
          textAlign: 'center',
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.default,
        }}>
          <Typography variant="body2" color="text.secondary">
            Remember your password?{' '}
            <Button 
              color="primary" 
              size="small" 
              onClick={onSwitchToSignIn}
              sx={{ 
                textTransform: 'none',
                fontWeight: 600,
                p: 0,
                ml: 0.5,
                minWidth: 'auto',
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline',
                },
              }}
            >
              Sign In
            </Button>
          </Typography>
        </Box>
      )}
    </Dialog>
  );
};

export default ForgotPasswordDialog;
