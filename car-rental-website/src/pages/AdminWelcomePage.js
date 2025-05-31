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
    </Container>
  );
};

export default AdminWelcomePage;
