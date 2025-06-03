import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Alert, CircularProgress } from '@mui/material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useNavigate } from 'react-router-dom';

const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';

const PendingPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/auth/check-status`, {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.status === 'approved') {
          setStatus('approved');
          setTimeout(() => navigate('/'), 2000);
        } else if (data.status === 'rejected') {
          setStatus('rejected');
          setMessage(data.reason || 'Your application was rejected. Please sign up again with correct information.');
          setTimeout(() => {
            localStorage.clear();
            navigate('/signup');
          }, 5000);
        }
      } catch (error) {
        console.error('Error checking status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  if (loading) {
    return (
      <Container sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8, p: 3, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <HourglassEmptyIcon sx={{ fontSize: 60, color: '#475569' }} />
        
        {status === 'pending' && (
          <>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600, color: '#1e293b', textAlign: 'center' }}>
              Account Under Review
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center">
              Thank you for verifying your email. Your account is currently under review by our team.
              We will notify you once your account has been approved.
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              This process usually takes 24-48 hours. Please check your email for updates.
            </Typography>
          </>
        )}

        {status === 'approved' && (
          <Alert severity="success" sx={{ width: '100%' }}>
            Your account has been approved! Redirecting to homepage...
          </Alert>
        )}

        {status === 'rejected' && (
          <Alert severity="error" sx={{ width: '100%' }}>
            {message}
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default PendingPage;
