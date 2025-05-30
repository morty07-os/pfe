import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { endpoints } from '../utils/apiConfig';

const ForgotPassword = ({ open, onClose }) => {
  const theme = useTheme();
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter Code, 3: Enter New Password
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // Reset form when dialog is opened/closed
  useEffect(() => {
    if (open) {
      setStep(1);
      setEmail('');
      setVerificationCode('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: '', text: '' });
      setResendCooldown(0);
      setShowPassword(false);
    }
  }, [open]);

  // Handle resend cooldown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSendCode = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(endpoints.forgotPassword, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Verification code sent to your email.' });
        setStep(2);
        setResendCooldown(60);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send verification code' });
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(endpoints.verifyResetCode, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.toLowerCase(), 
          code: verificationCode 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Code verified. Please set your new password.' });
        setStep(3);
      } else {
        setMessage({ type: 'error', text: data.error || 'Invalid or expired verification code' });
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(endpoints.resetPassword, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.toLowerCase(),
          code: verificationCode,
          newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: data.message || 'Password reset successfully. You can now log in with your new password.' 
        });
        // Auto-close after success
        setTimeout(() => onClose(), 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to reset password' });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    await handleSendCode();
  };

  const renderStepContent = () => {
    switch (step) {
      case 1: // Enter Email
        return (
          <Box component="form" onSubmit={handleSendCode} sx={{ width: '100%', mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#475569' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#94a3b8' },
                  '&.Mui-focused fieldset': { borderColor: '#475569' },
                },
              }}
            />
          </Box>
        );
      case 2: // Enter Verification Code
        return (
          <Box component="form" onSubmit={handleVerifyCode} sx={{ width: '100%', mt: 2 }}>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
              A 6-digit verification code has been sent to <br />
              <Typography component="span" sx={{ fontWeight: 'bold', color: '#475569' }}>
                {email}
              </Typography>
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              id="verificationCode"
              label="Verification Code"
              name="verificationCode"
              autoComplete="off"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              inputProps={{ maxLength: 6 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#94a3b8' },
                  '&.Mui-focused fieldset': { borderColor: '#475569' },
                },
              }}
            />
          </Box>
        );
      case 3: // Enter New Password
        return (
          <Box component="form" onSubmit={handleResetPassword} sx={{ width: '100%', mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              id="newPassword"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#475569' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#94a3b8' },
                  '&.Mui-focused fieldset': { borderColor: '#475569' },
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#94a3b8' },
                  '&.Mui-focused fieldset': { borderColor: '#475569' },
                },
              }}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  const renderDialogActions = () => {
    switch (step) {
      case 1: // Send Code
        return (
          <>
            <Button onClick={onClose} color="inherit">
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              onClick={handleSendCode}
              disabled={loading || !email}
              sx={{
                bgcolor: '#475569',
                '&:hover': { bgcolor: '#334155' },
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Send Code'}
            </Button>
          </>
        );
      case 2: // Verify Code
        return (
          <>
            <Button onClick={onClose} color="inherit">
              Cancel
            </Button>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={handleResendCode}
                disabled={loading || resendCooldown > 0}
                sx={{
                  color: '#475569',
                  borderColor: '#475569',
                  '&:hover': {
                    borderColor: '#334155',
                    bgcolor: 'rgba(71, 85, 105, 0.04)',
                  },
                }}
              >
                {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                onClick={handleVerifyCode}
                disabled={loading || verificationCode.length !== 6}
                sx={{
                  bgcolor: '#475569',
                  '&:hover': { bgcolor: '#334155' },
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Verify'}
              </Button>
            </Box>
          </>
        );
      case 3: // Reset Password
        return (
          <>
            <Button onClick={() => setStep(2)} color="inherit">
              Back
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              onClick={handleResetPassword}
              disabled={loading || !newPassword || !confirmPassword}
              sx={{
                bgcolor: '#475569',
                '&:hover': { bgcolor: '#334155' },
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  const getDialogTitle = () => {
    switch (step) {
      case 1: return 'Reset Your Password';
      case 2: return 'Enter Verification Code';
      case 3: return 'Create New Password';
      default: return 'Reset Password';
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
          {getDialogTitle()}
        </Typography>
        <Typography variant="body2" sx={{ 
          opacity: 0.9, 
          fontSize: '0.95rem',
          color: '#e2e8f0'
        }}>
          {step === 1 ? 'Enter your email to receive a verification code' : 
           step === 2 ? 'Enter the 6-digit code sent to your email' :
           'Create a new password for your account'}
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

      <DialogContent sx={{ p: 4, backgroundColor: '#f8fafc' }}>
        {message.text && (
          <Alert 
            severity={message.type} 
            sx={{ 
              mb: 3,
              '& .MuiAlert-message': { width: '100%' },
              '& .MuiAlert-icon': { alignItems: 'center' }
            }}
          >
            {message.text}
          </Alert>
        )}
        {renderStepContent()}
      </DialogContent>

      <DialogActions sx={{ 
        p: 2, 
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#f1f5f9',
        justifyContent: 'space-between'
      }}>
        {renderDialogActions()}
      </DialogActions>
    </Dialog>
  );
};

export default ForgotPassword;
