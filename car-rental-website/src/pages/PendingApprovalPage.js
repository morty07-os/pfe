import React from 'react';
import { Box, Typography, Container, CircularProgress } from '@mui/material';

const PendingApprovalPage = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <CircularProgress size={60} />
        <Typography variant="h4" component="h1" gutterBottom>
          Account Pending Approval
        </Typography>
        <Typography variant="body1">
          Your account has been successfully verified and is now pending administrator approval.
        </Typography>
        <Typography variant="body1">
          You will be notified once your account has been reviewed. Thank you for your patience.
        </Typography>
      </Box>
    </Container>
  );
};

export default PendingApprovalPage;
