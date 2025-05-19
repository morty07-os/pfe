import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Box,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

const ConversationDialog = ({ open, onClose, userId, carId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5001/api/messages/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open && userId) {
      fetchMessages();
    }
  }, [open, userId]);

  const handleSendMessage = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5001/api/messages/save',
        {
          receiver: userId,
          text: newMessage,
          carId: carId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setMessages([...messages, { text: newMessage, sender: 'me' }]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert(`Error sending message: ${error.message}`);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Conversation with User {userId}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {messages.map((message, index) => (
              <ListItem key={index} alignItems="flex-start">
                <ListItemText
                  primary={message.text}
                  secondary={message.sender === 'me' ? 'You' : 'Other User'}
                />
              </ListItem>
            ))}
          </List>
        )}
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            label="New Message"
            variant="outlined"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleSendMessage}>
            Send
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ConversationDialog;
