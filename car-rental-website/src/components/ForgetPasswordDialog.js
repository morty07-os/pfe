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
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { endpoints, fetchOptions } from '../utils/apiConfig'; // Assuming apiConfig is available

const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';

const ForgetPasswordDialog = ({ open, onClose }) => {
  const theme = useTheme();
  const [step, setStep] = useState('request_code'); // 'request_code', 'verify_code', 'reset_password', 'success'
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const lowerEmail = email.toLowerCase();
      console.log(`Attempting to request password reset code for: ${lowerEmail}`);
      const response = await fetch(`${apiUrl}/api/auth/forgot-password`, { // New backend endpoint
        method: 'POST',
        headers: fetchOptions.headers,
        body: JSON.stringify({ email: lowerEmail }),
      });
      const result = await response.json();
      console.log('Request code response:', result);

      if (response.ok) {
        setMessage({ type: 'success', text: result.message || 'Verification code sent to your email.' });
        setStep('verify_code');
        setResendCooldown(60); // Start cooldown for resend
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send verification code.' });
      }
    } catch (error) {
      console.error('Error requesting password reset code:', error);
      setMessage({ type: 'error', text: 'An error occurred while requesting the code.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const lowerEmail = email.toLowerCase();
      console.log(`Attempting to verify reset code for: ${lowerEmail} with code: ${verificationCode}`);
      const response = await fetch(`${apiUrl}/api/auth/verify-reset-code`, { // New backend endpoint
        method: 'POST',
        headers: fetchOptions.headers,
        body: JSON.stringify({ email: lowerEmail, verificationCode }),
      });
      const result = await response.json();
      console.log('Verify code response:', result);

      if (response.ok) {
        setMessage({ type: 'success', text: result.message || 'Code verified successfully. You can now reset your password.' });
        setStep('reset_password');
      } else {
        setMessage({ type: 'error', text: result.error || 'Verification failed. Please check the code.' });
      }
    } catch (error) {
      console.error('Error verifying reset code:', error);
      setMessage({ type: 'error', text: 'An error occurred during code verification.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      setLoading(false);
      return;
    }

    try {
      const lowerEmail = email.toLowerCase();
      console.log(`Attempting to reset password for: ${lowerEmail}`);
      const response = await fetch(`${apiUrl}/api/auth/reset-password`, { // New backend endpoint
        method: 'POST',
        headers: fetchOptions.headers,
        body: JSON.stringify({ email: lowerEmail, verificationCode, newPassword }), // Pass code again for security
      });
      const result = await response.json();
      console.log('Reset password response:', result);

      if (response.ok) {
        setMessage({ type: 'success', text: result.message || 'Password reset successfully. You can now sign in.' });
        setStep('success');
        // Optionally close dialog after a delay or show a "Go to Sign In" button
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to reset password.' });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage({ type: 'error', text: 'An error occurred while resetting the password.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    setResendCooldown(60); // Start cooldown immediately
    try {
      const lowerEmail = email.toLowerCase();
      console.log(`Attempting to resend password reset code to: ${lowerEmail}`);
      const response = await fetch(`${apiUrl}/api/auth/forgot-password`, { // Reuse forgot-password endpoint
        method: 'POST',
        headers: fetchOptions.headers,
        body: JSON.stringify({ email: lowerEmail }),
      });
      const result = await response.json();
      console.log('Resend code response:', result);
      if (response.ok) {
        setMessage({ type: 'success', text: result.message || 'Verification code re-sent to your email.' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to resend code.' });
      }
    } catch (error) {
      console.error('Error resending password reset code:', error);
      setMessage({ type: 'error', text: 'An error occurred while resending the code.' });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'request_code':
        return (
          <Box component="form" onSubmit={handleRequestCode} sx={{ width: '100%', mt: 1 }}>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
              Enter your email address to receive a password reset code.
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#94a3b8' },
                  '&.Mui-focused fieldset': { borderColor: '#475569' },
                },
              }}
              InputProps={{
                startAdornment: (
                  <EmailIcon sx={{ color: '#64748b', mr: 1 }} />
                ),
              }}
            />
            {message.text && (
              <Alert severity={message.type} sx={{ width: '100%', mt: 2 }}>
                {message.text}
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                bgcolor: '#475569',
                color: 'white',
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': { bgcolor: '#334155' },
              }}
              disabled={loading || !email}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Code'}
            </Button>
          </Box>
        );
      case 'verify_code':
        return (
          <Box component="form" onSubmit={handleVerifyCode} sx={{ width: '100%', mt: 1 }}>
             <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
              A 6-digit verification code has been sent to <br />
              <Typography component="span" sx={{ fontWeight: 'bold', color: '#475569' }}>{email}</Typography>.
              Please enter it below.
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
              InputProps={{
                startAdornment: (
                  <LockIcon sx={{ color: '#64748b', mr: 1 }} />
                ),
              }}
            />
             {message.text && (
              <Alert severity={message.type} sx={{ width: '100%', mt: 2 }}>
                {message.text}
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                bgcolor: '#475569',
                color: 'white',
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': { bgcolor: '#334155' },
              }}
              disabled={loading || !verificationCode}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Code'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              sx={{
                mt: 1,
                color: '#475569',
                borderColor: '#475569',
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: 'rgba(71, 85, 105, 0.04)',
                  borderColor: '#334155',
                },
              }}
              onClick={handleResendCode}
              disabled={loading || resendCooldown > 0}
            >
              {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
            </Button>
          </Box>
        );
      case 'reset_password':
        return (
          <Box component="form" onSubmit={handleResetPassword} sx={{ width: '100%', mt: 1 }}>
             <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
              Enter your new password.
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              id="newPassword"
              label="New Password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#94a3b8' },
                  '&.Mui-focused fieldset': { borderColor: '#475569' },
                },
              }}
              InputProps={{
                startAdornment: (
                  <LockIcon sx={{ color: '#64748b', mr: 1 }} />
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="confirmPassword"
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#94a3b8' },
                  '&.Mui-focused fieldset': { borderColor: '#475569' },
                },
              }}
              InputProps={{
                startAdornment: (
                  <LockIcon sx={{ color: '#64748b', mr: 1 }} />
                ),
              }}
            />
             {message.text && (
              <Alert severity={message.type} sx={{ width: '100%', mt: 2 }}>
                {message.text}
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                bgcolor: '#475569',
                color: 'white',
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': { bgcolor: '#334155' },
              }}
              disabled={loading || !newPassword || !confirmPassword}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
            </Button>
          </Box>
        );
        case 'success':
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}>
                    <Typography variant="h6" color="success.main" align="center">
                        Success!
                    </Typography>
                    <Typography variant="body1" color="text.secondary" align="center">
                        {message.text}
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{
                            mt: 2,
                            bgcolor: '#475569',
                            color: 'white',
                            py: 1.5,
                            fontSize: '1rem',
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#334155' },
                        }}
                        onClick={onClose} // Close the dialog
                    >
                        Close
                    </Button>
                </Box>
            );
      default:
        return null;
    }
  };

  const getDialogTitle = () => {
    switch (step) {
      case 'request_code':
        return 'Forgot Password';
      case 'verify_code':
        return 'Verify Code';
      case 'reset_password':
        return 'Reset Password';
      case 'success':
        return 'Password Reset Successful';
      default:
        return 'Forgot Password';
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

      {/* DialogActions can be added here if needed for consistent button placement */}
    </Dialog>
  );
};

export default ForgetPasswordDialog;
