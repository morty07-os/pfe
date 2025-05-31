import React from 'react';
import { Box, Typography, Container, CircularProgress } from '@mui/material';

const PendingApprovalPage = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
      <Box>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Account Pending Approval
        </Typography>
        <Typography variant="body1">
          Your account is currently pending administrator approval.
        </Typography>
        <Typography variant="body1">
          You will be notified once your account has been reviewed.
        </Typography>
      </Box>
    </Container>
  );
};

export default PendingApprovalPage;
