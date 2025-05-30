import React, { useState, useEffect } from 'react';
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
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useTheme } from '@mui/material/styles';

const ForgotPasswordDialog = ({ open, onClose, onSwitchToSignIn }) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', severity: 'info' });
  const [step, setStep] = useState('request_code'); // 'request_code', 'verify_code_reset_password'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focused, setFocused] = useState('');

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setEmail('');
      setVerificationCode('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ text: '', severity: 'info' });
      setStep('request_code');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setFocused('');
    }
  }, [open]);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage({ text: 'Please enter your email address', severity: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', severity: 'info' });

    try {
      // This endpoint will be modified in the backend to send a code
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          text: data.message || 'A verification code has been sent to your email.',
          severity: 'success',
        });
        setStep('verify_code_reset_password');
      } else {
        setMessage({
          text: data.error || 'Failed to send verification code. Please try again.',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error requesting password reset code:', error);
      setMessage({
        text: 'An error occurred. Please try again later.',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!verificationCode || !newPassword || !confirmPassword) {
      setMessage({ text: 'Please fill in all fields', severity: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', severity: 'error' });
      return;
    }

    if (newPassword.length < 6) {
        setMessage({ text: 'Password must be at least 6 characters long', severity: 'error' });
        return;
    }

    setIsLoading(true);
    setMessage({ text: '', severity: 'info' });

    try {
      // This is a new endpoint we will create in the backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          verificationCode,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          text: data.message || 'Your password has been reset successfully. You can now sign in.',
          severity: 'success',
        });
        // Optionally close dialog or switch to sign in after a delay
        setTimeout(() => {
            handleCloseDialog();
            onSwitchToSignIn(); // Assuming this switches to the sign-in dialog
        }, 3000); // Close after 3 seconds
      } else {
        setMessage({
          text: data.error || 'Failed to reset password. Please check the code and try again.',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage({
        text: 'An error occurred. Please try again later.',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setEmail('');
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage({ text: '', severity: 'info' });
    setStep('request_code');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFocused('');
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
          {step === 'request_code' ? 'Reset Your Password' : 'Verify Code & Set New Password'}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {step === 'request_code'
            ? 'Enter your email to receive a verification code.'
            : `A code has been sent to ${email}. Enter it below to set a new password.`}
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

      <form onSubmit={step === 'request_code' ? handleRequestCode : handleResetPassword}>
        <DialogContent sx={{ p: 4 }}>
          {message.text && (
            <Alert
              severity={message.severity}
              sx={{ mb: 3, borderRadius: 2 }}
            >
              {message.text}
            </Alert>
          )}

          {step === 'request_code' ? (
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
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused('')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon
                      sx={{
                        color: focused === 'email' ? theme.palette.primary.main : theme.palette.text.secondary,
                        mr: 1,
                        mt: '2px',
                      }}
                    />
                  </InputAdornment>
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                autoFocus
                margin="dense"
                id="verificationCode"
                label="Verification Code"
                type="text"
                fullWidth
                variant="outlined"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                inputProps={{ maxLength: 6 }}
                onFocus={() => setFocused('code')}
                onBlur={() => setFocused('')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon
                        sx={{
                          color: focused === 'code' ? theme.palette.primary.main : theme.palette.text.secondary,
                          mr: 1,
                          mt: '2px',
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: theme.palette.primary.main },
                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                  },
                }}
              />
              <TextField
                margin="dense"
                id="newPassword"
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                variant="outlined"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={() => setFocused('newPassword')}
                onBlur={() => setFocused('')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon
                        sx={{
                          color: focused === 'newPassword' ? theme.palette.primary.main : theme.palette.text.secondary,
                          mr: 1,
                          mt: '2px',
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
                          color: showPassword ? theme.palette.primary.main : theme.palette.text.secondary,
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: theme.palette.primary.main },
                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                  },
                }}
              />
              <TextField
                margin="dense"
                id="confirmPassword"
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                fullWidth
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocused('confirmPassword')}
                onBlur={() => setFocused('')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon
                        sx={{
                          color: focused === 'confirmPassword' ? theme.palette.primary.main : theme.palette.text.secondary,
                          mr: 1,
                          mt: '2px',
                        }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{
                          color: showConfirmPassword ? theme.palette.primary.main : theme.palette.text.secondary,
                          '&:hover': {
                            backgroundColor: 'rgba(30, 64, 175, 0.05)'
                          }
                        }}
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: theme.palette.primary.main },
                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                  },
                }}
              />
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
          {step === 'request_code' ? (
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
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </Button>
          ) : (
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading || !verificationCode || !newPassword || !confirmPassword}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1,
              }}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          )}
        </DialogActions>
      </form>

      {step === 'request_code' && (
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
