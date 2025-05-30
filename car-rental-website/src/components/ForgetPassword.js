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
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com'; // Assuming a similar API URL structure

const ForgetPassword = ({ open, onClose }) => {
  const theme = useTheme();
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter Code, 3: Enter New Password, 4: Success/Error
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' }); // Use object for message
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // Add resend cooldown state

  // Effect for resend cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);


  const handleSendCode = async () => {
    setMessage({ text: '', type: '' });
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          text: data.message || 'Password reset code sent to your email.',
          type: 'success',
        });
        setStep(2); // Move to the next step
      } else {
        setMessage({
          text: data.error || 'Failed to send reset code. Please try again.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error sending reset code:', error);
      setMessage({
        text: 'An error occurred. Please try again later.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setMessage({ text: '', type: '' });
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/auth/verify-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          text: data.message || 'Code verified. Please enter your new password.',
          type: 'success',
        });
        setStep(3); // Move to the next step
      } else {
        setMessage({
          text: data.error || 'Invalid or expired code. Please try again.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setMessage({
        text: 'An error occurred. Please try again later.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }
    setMessage({ text: '', type: '' });
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          text: data.message || 'Password reset successfully.',
          type: 'success',
        });
        setStep(4); // Move to the success step
      } else {
        setMessage({
          text: data.error || 'Failed to reset password. Please try again.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage({
        text: 'An error occurred. Please try again later.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <IconButton position="start" edge="start" disabled>
                    <EmailIcon />
                  </IconButton>
                ),
              }}
            />
            {message.text && <Alert severity={message.type}>{message.text}</Alert>}
          </Box>
        );
      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="body1">Enter the verification code sent to {email}.</Typography>
            <TextField
              required
              fullWidth
              label="Verification Code"
              name="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              variant="outlined"
            />
            {message.text && <Alert severity={message.type}>{message.text}</Alert>}
          </Box>
        );
      case 3:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="body1">Enter your new password.</Typography>
            <TextField
              required
              fullWidth
              label="New Password"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <IconButton position="start" edge="start" disabled>
                    <LockIcon />
                  </IconButton>
                ),
              }}
            />
             <TextField
              required
              fullWidth
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <IconButton position="start" edge="start" disabled>
                    <LockIcon />
                  </IconButton>
                ),
              }}
            />
            {message.text && <Alert severity={message.type}>{message.text}</Alert>}
          </Box>
        );
      case 4:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="body1">{message.text}</Typography>
             {message.text && <Alert severity={message.type}>{message.text}</Alert>}
          </Box>
        );
      default:
        return null;
    }
  };

  const renderDialogActions = () => {
    switch (step) {
      case 1:
        return (
          <Button onClick={handleSendCode} color="primary" disabled={!email || loading}>
            {loading ? 'Sending...' : 'Send Code'}
          </Button>
        );
      case 2:
        return (
          <>
            <Button
              onClick={handleResendCode}
              color="secondary"
              disabled={loading || resendCooldown > 0}
            >
              {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
            </Button>
            <Button onClick={handleVerifyCode} color="primary" disabled={!code || loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Code'}
            </Button>
          </>
        );
      case 3:
        return (
          <Button onClick={handleResetPassword} color="primary" disabled={!newPassword || !confirmPassword || loading}>
             {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
          </Button>
        );
      case 4:
        return (
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        );
      default:
        return null;
    }
  };

  const handleResendCode = async () => {
    setMessage({ text: '', type: '' });
    setLoading(true);
    setResendCooldown(60); // Start cooldown

    try {
      const response = await fetch(`${apiUrl}/api/auth/forgot-password`, { // Use forgot-password endpoint to resend
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          text: data.message || 'New password reset code sent to your email.',
          type: 'success',
        });
      } else {
        setMessage({
          text: data.error || 'Failed to resend code. Please try again.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error resending code:', error);
      setMessage({
        text: 'An error occurred. Please try again later.',
        type: 'error',
      });
    } finally {
      setLoading(false);
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
          Forgot Password
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

      <DialogContent sx={{
        p: 4,
        backgroundColor: '#f8fafc'
      }}>
        {renderStepContent()}
      </DialogContent>

      <DialogActions sx={{
        justifyContent: 'flex-end',
        p: 3,
        pt: 2,
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc'
      }}>
        {renderDialogActions()}
      </DialogActions>
    </Dialog>
  );
};

export default ForgetPassword;
