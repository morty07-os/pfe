import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const VerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
      if (location.state.message) {
        setMessage({ type: 'info', text: location.state.message });
      }
    } else {
      navigate('/signup');
    }
  }, [location.state, navigate]);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (verificationAttempts >= 3) {
      setMessage({ 
        type: 'error', 
        text: 'Too many failed attempts. Please request a new code.' 
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';
      const response = await fetch(`${apiUrl}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, verificationCode }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('token', result.token);
        setMessage({ type: 'success', text: result.message || 'Email verified successfully!' });
        window.dispatchEvent(new Event('loginStateChanged'));
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setVerificationAttempts(prev => prev + 1);
        setMessage({ 
          type: 'error', 
          text: result.error || 'Invalid verification code. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error during email verification:', error);
      setMessage({ 
        type: 'error', 
        text: 'An error occurred during verification. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    setMessage({ type: '', text: '' });
    setResendCooldown(60);
    setVerificationAttempts(0);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';
      const response = await fetch(`${apiUrl}/api/auth/resend-verification-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'A new verification code has been sent to your email.' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || 'Failed to resend verification code.' 
        });
      }
    } catch (error) {
      console.error('Error resending verification code:', error);
      setMessage({ 
        type: 'error', 
        text: 'An error occurred while resending the code.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8, p: 3 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 3, 
          bgcolor: 'background.paper',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/signup')}
            sx={{ 
              alignSelf: 'flex-start',
              color: '#64748b',
              '&:hover': { bgcolor: '#f1f5f9' }
            }}
          >
            Back to Sign Up
          </Button>

          <EmailIcon sx={{ fontSize: 60, color: '#475569' }} />
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600, color: '#1e293b' }}>
            Verify Your Email
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            A 6-digit verification code has been sent to <br />
            <Typography component="span" sx={{ fontWeight: 'bold', color: '#475569' }}>
              {email}
            </Typography>
          </Typography>

          {message.text && (
            <Alert 
              severity={message.type} 
              sx={{ 
                width: '100%',
                mt: 2,
                '& .MuiAlert-message': { width: '100%' }
              }}
            >
              {message.text}
            </Alert>
          )}

          <Box component="form" onSubmit={handleVerify} sx={{ width: '100%', mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="verificationCode"
              label="Verification Code"
              name="verificationCode"
              autoComplete="off"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputProps={{ 
                maxLength: 6,
                pattern: '[0-9]*',
                inputMode: 'numeric'
              }}
              error={verificationAttempts > 0}
              helperText={verificationAttempts > 0 ? `${3 - verificationAttempts} attempts remaining` : ''}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#94a3b8' },
                  '&.Mui-focused fieldset': { borderColor: '#475569' },
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || verificationCode.length !== 6 || verificationAttempts >= 3}
              sx={{
                mt: 3,
                mb: 2,
                bgcolor: '#475569',
                color: 'white',
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': { bgcolor: '#334155' },
                '&.Mui-disabled': { bgcolor: '#94a3b8' }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Account'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleResendCode}
              disabled={loading || resendCooldown > 0}
              sx={{
                color: '#475569',
                borderColor: '#475569',
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: 'rgba(71, 85, 105, 0.04)',
                  borderColor: '#334155',
                },
                '&.Mui-disabled': {
                  color: '#94a3b8',
                  borderColor: '#cbd5e1'
                }
              }}
            >
              {resendCooldown > 0 
                ? `Resend Code (${resendCooldown}s)` 
                : 'Resend Code'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default VerificationPage;
