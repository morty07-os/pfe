import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const AdminWelcomePage = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome Admin!
        </Typography>
        <Typography variant="body1">
          This is a placeholder page for the admin dashboard.
        </Typography>
      </Box>
      <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc', textAlign: 'center' }}>
        <Typography variant="h6" component="h2">
          Approve New User
        </Typography>
      </Box>
    </Container>
  );
};

export default AdminWelcomePage;
