import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  CircularProgress,
  Typography,
  IconButton,
  Avatar,
  Divider,
  Paper
} from '@mui/material';
import axios from 'axios';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const ConversationDialog = ({ open, onClose, userId, carId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const chatEndRef = useRef(null);

  // currentUserId is now set in the fetchMessages function

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Get current user ID from token
        let currentId = null;
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            currentId = payload.userId;
            setCurrentUserId(payload.userId);
          } catch (error) {
            console.error('Error parsing token:', error);
          }
        }
        
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
        
        // Fetch user name if available
        if (response.data.length > 0 && currentId) {
          // Determine if the first message's sender or receiver is the other user
          const firstMessage = response.data[0];
          let otherUserData;
          
          if (firstMessage.sender && firstMessage.sender._id !== currentId) {
            otherUserData = firstMessage.sender;
          } else if (firstMessage.receiver && firstMessage.receiver._id !== currentId) {
            otherUserData = firstMessage.receiver;
          }
          
          if (otherUserData && otherUserData.firstName && otherUserData.lastName) {
            setUserName(`${otherUserData.firstName} ${otherUserData.lastName}`);
          }
        }
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

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
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
      
      // Add message to the list with current timestamp and proper sender format
      // Store the message with the same format as the API returns
      const newMsg = {
        text: newMessage,
        createdAt: new Date().toISOString(),
        // Use the same sender format as the API would return
        sender: { _id: currentUserId }
      };
      
      setMessages([...messages, newMsg]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert(`Error sending message: ${error.message}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Function to determine if a message is from the current user
  const isCurrentUserMessage = (message) => {
    // Check if the message has a sender object with _id (from API)
    if (message.sender && message.sender._id) {
      return message.sender._id === currentUserId;
    }
    // Check if the message has a sender string (locally added)
    if (message.sender === 'me') {
      return true;
    }
    // For messages added locally with the current user's ID
    if (message.sender && typeof message.sender === 'string') {
      return message.sender === currentUserId;
    }
    return false;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)',
        }
      }}
    >
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1.5,
        bgcolor: '#3b82f6',
        color: 'white',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <ChatBubbleOutlineIcon sx={{ fontSize: 22, mr: 1 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
          {userName ? `Conversation with ${userName}` : `Conversation with User ${userId}`}
        </Typography>
        <IconButton 
          onClick={onClose} 
          sx={{ color: 'white' }}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </Box>
      
      <DialogContent sx={{ 
        p: 0, 
        display: 'flex', 
        flexDirection: 'column',
        height: '500px'
      }}>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            bgcolor: '#f8fafc'
          }}>
            <CircularProgress sx={{ color: '#3b82f6' }} />
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              px: 2,
              py: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              bgcolor: '#f8fafc',
              minHeight: 120,
            }}
          >
            {messages.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                gap: 2
              }}>
                <ChatBubbleOutlineIcon sx={{ fontSize: 48, color: '#cbd5e1' }} />
                <Typography variant="body1" sx={{ color: '#64748b' }}>
                  No messages yet. Start the conversation!
                </Typography>
              </Box>
            ) : (
              messages.map((message, index) => {
                const isUser = isCurrentUserMessage(message);
                return (
                  <Box
                    key={index}
                    sx={{
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                      bgcolor: isUser ? '#3b82f6' : '#fff',
                      color: isUser ? 'white' : '#1e293b',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      mb: 0.5,
                      maxWidth: '80%',
                      boxShadow: isUser ? '0 1px 4px rgba(59,130,246,0.10)' : '0 1px 4px rgba(71,85,105,0.06)',
                      borderTopLeftRadius: isUser ? 12 : 4,
                      borderTopRightRadius: isUser ? 4 : 12,
                      fontSize: '1rem',
                      transition: 'background 0.2s',
                      border: isUser ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 400 }}>
                      {message.text}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                      alignItems: 'center', 
                      mt: 0.5, 
                      gap: 0.5
                    }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          opacity: 0.7, 
                          fontSize: '0.7rem'
                        }}
                      >
                        {isUser ? 'You' : (userName || `User ${userId}`)}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          opacity: 0.7, 
                          fontSize: '0.7rem'
                        }}
                      >
                        {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            )}
            <div ref={chatEndRef} />
          </Box>
        )}
        
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            px: 2,
            py: 1.5,
            bgcolor: '#fff',
            borderTop: '1px solid #e2e8f0',
            position: 'sticky',
            bottom: 0,
            zIndex: 1,
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ 
              bgcolor: '#f8fafc', 
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#94a3b8',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6',
                },
              }
            }}
            inputProps={{ maxLength: 300 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            sx={{
              borderRadius: 2,
              minWidth: 'unset',
              bgcolor: '#3b82f6',
              '&:hover': {
                bgcolor: '#2563eb',
              },
              '&.Mui-disabled': {
                bgcolor: '#cbd5e1',
                color: '#94a3b8',
              },
            }}
          >
            <SendIcon />
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ConversationDialog;
