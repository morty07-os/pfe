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

const ForgetPassword = ({ open, onClose }) => {
  const theme = useTheme();
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter Code, 3: Enter New Password, 4: Success/Error
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    setMessage('');
    setLoading(true);
    // Placeholder for sending verification code API call
    console.log(`Sending code to ${email}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay
    setLoading(false);
    // Assume success for now
    setStep(2);
    setMessage('Verification code sent to your email.');
  };

  const handleVerifyCode = async () => {
    setMessage('');
    setLoading(true);
    // Placeholder for verifying verification code API call
    console.log(`Verifying code ${code} for ${email}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay
    setLoading(false);
    // Assume success for now
    setStep(3);
    setMessage('Code verified. Please enter your new password.');
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    setMessage('');
    setLoading(true);
    // Placeholder for resetting password API call
    console.log(`Resetting password for ${email} with new password`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay
    setLoading(false);
    // Assume success for now
    setStep(4);
    setMessage('Your password has been reset successfully.');
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
            {message && <Typography variant="body2" color="error">{message}</Typography>}
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
            {message && <Typography variant="body2" color="error">{message}</Typography>}
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
            {message && <Typography variant="body2" color="error">{message}</Typography>}
          </Box>
        );
      case 4:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="body1">{message}</Typography>
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
          <Button onClick={handleVerifyCode} color="primary" disabled={!code || loading}>
             {loading ? 'Verifying...' : 'Verify Code'}
          </Button>
        );
      case 3:
        return (
          <Button onClick={handleResetPassword} color="primary" disabled={!newPassword || !confirmPassword || loading}>
             {loading ? 'Resetting...' : 'Reset Password'}
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
