import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material'; // Import Paper for a card-like effect
import Navbar from '../components/Navbar'; // Import the Navbar component

const ConversationListPage = () => {
  // Assume no conversations for now as requested
  const hasConversations = false;


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}> {/* Use Box for full page layout */}
      <Navbar sx={{ backgroundColor: '#111', color: '#fff' }} iconColor="#fff" /> {/* Add the Navbar */}
      <Container maxWidth="md" sx={{ flexGrow: 1, py: 4 }}> {/* Use Container for content, flexGrow to push footer down */}
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}> {/* Use Paper for a card effect */}
          <Typography variant="h4" component="h1" gutterBottom>
            Messages
          </Typography>

          {!hasConversations ? (
            <Box sx={{ mt: 4 }}> {/* Add some space */}
              <Typography variant="h6" color="text.secondary">
                You have no conversations yet.
              </Typography>
              {/* Optional: Add an icon or illustration */}
              {/* <MailOutlineIcon sx={{ fontSize: 60, color: 'text.secondary', mt: 2 }} /> */}
            </Box>
          ) : (
            <Box sx={{ mt: 4 }}>
              {/* TODO: Implement actual conversation list */}
              <Typography variant="body1">
                Conversation list will be displayed here.
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
      {/* Optional: Add a footer here if needed */}
    </Box>
  );
};

export default ConversationListPage;