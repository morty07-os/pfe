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
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', severity: 'info' });
  const [step, setStep] = useState('request_email'); // 'request_email', 'verify_code', 'reset_password'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage({ text: 'Please enter your email address', severity: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', severity: 'info' });

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          text: data.message || 'Password reset code sent to your email.',
          severity: 'success',
        });
        setStep('verify_code');
      } else {
        setMessage({
          text: data.error || 'Failed to send reset code. Please try again.',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setMessage({
        text: 'An error occurred. Please try again later.',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!resetCode) {
      setMessage({ text: 'Please enter the verification code', severity: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', severity: 'info' });

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/verify-password-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase(), resetCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          text: data.message || 'Code verified successfully. You can now set a new password.',
          severity: 'success',
        });
        setStep('reset_password');
      } else {
        setMessage({
          text: data.error || 'Invalid or expired code. Please try again.',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error verifying reset code:', error);
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
    if (!newPassword || !confirmPassword) {
      setMessage({ text: 'Please enter and confirm your new password', severity: 'error' });
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase(), resetCode, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          text: data.message || 'Password reset successfully. You can now sign in.',
          severity: 'success',
        });
        // Optionally close dialog or switch to sign in after a delay
        setTimeout(() => {
          handleCloseDialog();
          if (onSwitchToSignIn) {
             onSwitchToSignIn();
          }
        }, 2000);
      } else {
        setMessage({
          text: data.error || 'Failed to reset password. Please try again.',
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
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage({ text: '', severity: 'info' });
    setStep('request_email');
    setIsLoading(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const renderContent = () => {
    switch (step) {
      case 'request_email':
        return (
          <>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Enter your email address to receive a password reset code.
            </Typography>
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
                  <InputAdornment position="start">
                    <EmailIcon
                      sx={{
                        color: theme.palette.text.secondary,
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
          </>
        );
      case 'verify_code':
        return (
          <>
             <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              A 6-digit verification code has been sent to <br />
              <Typography component="span" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>{email}</Typography>.
              Please enter it below.
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              id="resetCode"
              label="Verification Code"
              type="text"
              fullWidth
              variant="outlined"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              inputProps={{ maxLength: 6 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: theme.palette.primary.main },
                  '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                },
              }}
            />
             {/* Optional: Add a resend code button here if needed */}
          </>
        );
      case 'reset_password':
        return (
          <>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Enter your new password.
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              id="newPassword"
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              variant="outlined"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon
                      sx={{
                        color: theme.palette.text.secondary,
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
                      size="small"
                    >
                      {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
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
               InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon
                      sx={{
                        color: theme.palette.text.secondary,
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
                      size="small"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
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
          </>
        );
      default:
        return null;
    }
  };

  const renderActions = () => {
    switch (step) {
      case 'request_email':
        return (
          <>
            <Button
              onClick={handleCloseDialog}
              color="inherit"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading || !email}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
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
          </>
        );
      case 'verify_code':
        return (
          <>
             <Button
              onClick={handleCloseDialog}
              color="inherit"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading || !resetCode}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1,
              }}
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>
          </>
        );
      case 'reset_password':
        return (
          <>
             <Button
              onClick={handleCloseDialog}
              color="inherit"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
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
          </>
        );
      default:
        return null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 'request_email') {
      handleRequestReset(e);
    } else if (step === 'verify_code') {
      handleVerifyCode(e);
    } else if (step === 'reset_password') {
      handleResetPassword(e);
    }
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
          {step === 'request_email' && 'Enter your email to receive a password reset code.'}
          {step === 'verify_code' && 'Enter the verification code sent to your email.'}
          {step === 'reset_password' && 'Enter your new password.'}
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

          {renderContent()}

        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0, justifyContent: step === 'request_email' ? 'flex-end' : 'space-between' }}>
           {step !== 'request_email' && (
             <Button
                onClick={onSwitchToSignIn}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                    color: theme.palette.primary.main
                  },
                  transition: 'all 0.2s ease',
                  padding: '6px 8px',
                  fontSize: '0.9375rem'
                }}
              >
                Remember your password? <Box component="span" sx={{ color: theme.palette.primary.main, fontWeight: 600, ml: 0.5 }}>Sign In</Box>
              </Button>
           )}
          {renderActions()}
        </DialogActions>
      </form>

      {step === 'request_email' && (
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
