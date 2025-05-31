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
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';

const VerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    } else {
      // If no email is passed, redirect to signup or home
      navigate('/signup'); // Or to a general login/signup page
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
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const lowerEmail = email.toLowerCase();
      console.log(`Attempting to verify email: ${lowerEmail} with code: ${verificationCode}`);
      const response = await fetch(`${apiUrl}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: lowerEmail, verificationCode }),
      });
      const result = await response.json();
      console.log('Verification response:', result);
      if (response.ok) {
        // Email verified successfully, but user is now in pending state
        setMessage({ type: 'success', text: result.message });
        // Redirect to pending approval page
        setTimeout(() => {
          navigate('/pending-approval', { state: { email: email } }); // Pass email for potential display on pending page
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Verification failed' });
      }
    } catch (error) {
      console.error('Error during email verification:', error);
      setMessage({ type: 'error', text: 'An error occurred during verification.' });
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
      console.log(`Attempting to resend verification code to: ${lowerEmail}`);
      const response = await fetch(`${apiUrl}/api/auth/resend-verification-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: lowerEmail }),
      });
      const result = await response.json();
      console.log('Resend verification code response:', result);
      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to resend code' });
      }
    } catch (error) {
      console.error('Error resending verification code:', error);
      setMessage({ type: 'error', text: 'An error occurred while resending the code.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8, p: 3, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <EmailIcon sx={{ fontSize: 60, color: '#475569' }} />
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600, color: '#1e293b' }}>
          Verify Your Email
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          A 6-digit verification code has been sent to <br />
          <Typography component="span" sx={{ fontWeight: 'bold', color: '#475569' }}>{email}</Typography>.
          Please enter it below to verify your account.
        </Typography>

        {message.text && (
          <Alert severity={message.type} sx={{ width: '100%' }}>
            {message.text}
          </Alert>
        )}

        <Box component="form" onSubmit={handleVerify} sx={{ width: '100%', mt: 1 }}>
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
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Account'}
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
      </Box>
    </Container>
  );
};

export default VerificationPage;
