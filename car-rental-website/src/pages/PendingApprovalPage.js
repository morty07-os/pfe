import React from 'react';
import { Box, Typography, Container, CircularProgress } from '@mui/material';

const PendingApprovalPage = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Account Pending Approval
        </Typography>
        <Typography variant="body1">
          Your account has been successfully verified and is now pending administrator approval.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          We will notify you once your account has been reviewed. Thank you for your patience.
        </Typography>
        <CircularProgress sx={{ mt: 4 }} />
      </Box>
    </Container>
  );
};

export default PendingApprovalPage;
