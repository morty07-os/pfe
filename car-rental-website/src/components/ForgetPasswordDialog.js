import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate } from 'react-router-dom';

const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';

const ForgetPasswordDialog = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [step, setStep] = useState('request_code'); // 'request_code', 'verify_code', 'reset_password'

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
      const response = await fetch(`${apiUrl}/api/auth/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: lowerEmail }),
      });
      const result = await response.json();
      console.log('Request password reset code response:', result);
      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
        setStep('verify_code');
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to request reset code' });
      }
    } catch (error) {
      console.error('Error requesting password reset code:', error);
      setMessage({ type: 'error', text: 'An error occurred while requesting the code.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCodeAndResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      const lowerEmail = email.toLowerCase();
      console.log(`Attempting to reset password for: ${lowerEmail} with code: ${verificationCode}`);
      const response = await fetch(`${apiUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: lowerEmail, verificationCode, newPassword }),
      });
      const result = await response.json();
      console.log('Reset password response:', result);
      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
        setTimeout(() => {
          onClose(); // Close the dialog on success
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Password reset failed' });
      }
    } catch (error) {
      console.error('Error during password reset:', error);
      setMessage({ type: 'error', text: 'An error occurred during password reset.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    setResendCooldown(60);
    try {
      const lowerEmail = email.toLowerCase();
      console.log(`Attempting to resend password reset code to: ${lowerEmail}`);
      const response = await fetch(`${apiUrl}/api/auth/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: lowerEmail }),
      });
      const result = await response.json();
      console.log('Resend password reset code response:', result);
      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to resend code' });
      }
    } catch (error) {
      console.error('Error resending password reset code:', error);
      setMessage({ type: 'error', text: 'An error occurred while resending the code.' });
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
        <Typography variant="body2" sx={{
          opacity: 0.9,
          fontSize: '0.95rem',
          color: '#e2e8f0'
        }}>
          Reset your password
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
        {message.text && (
          <Alert severity={message.type} sx={{ width: '100%', mb: 2 }}>
            {message.text}
          </Alert>
        )}

        {step === 'request_code' && (
          <Box component="form" onSubmit={handleRequestCode} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
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
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#64748b' }} />
                  </InputAdornment>
                ),
              }}
            />
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
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Request Reset Code'}
            </Button>
          </Box>
        )}

        {step === 'verify_code' && (
          <Box component="form" onSubmit={handleVerifyCodeAndResetPassword} sx={{ width: '100%' }}>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
              A 6-digit verification code has been sent to <br />
              <Typography component="span" sx={{ fontWeight: 'bold', color: '#475569' }}>{email}</Typography>.
              Please enter it below to reset your password.
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
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#64748b' }} />
                  </InputAdornment>
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
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#64748b' }} />
                  </InputAdornment>
                ),
              }}
            />
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
              disabled={loading || !verificationCode || !newPassword || !confirmPassword}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
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
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgetPasswordDialog;
