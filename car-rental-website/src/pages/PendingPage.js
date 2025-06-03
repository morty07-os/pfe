import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

const PendingPage = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 8, p: 3, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <HourglassEmptyIcon sx={{ fontSize: 60, color: '#475569' }} />
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
      </Box>
    </Container>
  );
};

export default PendingPage;
