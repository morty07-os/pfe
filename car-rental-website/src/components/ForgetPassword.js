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
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

const ForgetPassword = ({ open, onClose }) => {
  const theme = useTheme();
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter Code, 3: Set New Password, 4: Success
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
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

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    // Placeholder for sending verification code
    console.log(`Sending verification code to: ${email}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    setLoading(false);
    setMessage({ type: 'success', text: 'Verification code sent. Check your email.' });
    setStep(2);
    setResendCooldown(60); // Start cooldown for resend
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    // Placeholder for verifying code
    console.log(`Verifying code: ${verificationCode} for email: ${email}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    setLoading(false);
    // Simulate successful verification
    if (verificationCode === '123456') { // Use a dummy code for testing
      setMessage({ type: 'success', text: 'Code verified. Set your new password.' });
      setStep(3);
    } else {
      setMessage({ type: 'error', text: 'Invalid verification code.' });
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      setLoading(false);
      return;
    }
    // Placeholder for sending new password to backend
    console.log(`Setting new password for ${email}: ${newPassword}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    setLoading(false);
    setMessage({ type: 'success', text: 'Password reset successfully.' });
    setStep(4);
    setTimeout(() => {
      onClose(); // Close modal after a delay
    }, 2000);
  };

  const handleResendCode = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    setResendCooldown(60);
    // Placeholder for resending verification code
    console.log(`Resending verification code to: ${email}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    setLoading(false);
    setMessage({ type: 'success', text: 'Verification code resent.' });
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <Box component="form" onSubmit={handleSendCode} sx={{ width: '100%', mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Enter your email"
              name="email"
              type="email"
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
                  <EmailIcon sx={{ color: '#64748b' }} />
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
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Verification Code'}
            </Button>
          </Box>
        );
      case 2:
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
                  <LockIcon sx={{ color: '#64748b' }} />
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
      case 3:
        return (
          <Box component="form" onSubmit={handleSetNewPassword} sx={{ width: '100%', mt: 1 }}>
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
                  <LockIcon sx={{ color: '#64748b' }} />
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
                  <LockIcon sx={{ color: '#64748b' }} />
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
              disabled={loading || !newPassword || !confirmPassword}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Set New Password'}
            </Button>
          </Box>
        );
      case 4:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 2 }}>
            <Typography variant="h6" color="success.main" align="center">
              Success!
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center">
              Your password has been reset. You can now sign in with your new password.
            </Typography>
          </Box>
        );
      default:
        return null;
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
          Reset your password in a few steps
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
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}>
         {message.text && (
          <Alert severity={message.type} sx={{ width: '100%' }}>
            {message.text}
          </Alert>
        )}
        {renderStepContent()}
      </DialogContent>

      {/* No DialogActions needed for this flow */}
    </Dialog>
  );
};

export default ForgetPassword;
