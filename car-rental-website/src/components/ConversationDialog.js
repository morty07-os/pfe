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
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const ConversationDialog = ({ open, onClose, userId, carId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [carName, setCarName] = useState('');
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
          
          // If there's a carId in the message, fetch car details
          if (firstMessage.carId && typeof firstMessage.carId === 'string') {
            try {
              const carResponse = await axios.get(
                `http://localhost:5001/api/cars/${firstMessage.carId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );
              if (carResponse.data && carResponse.data.carName) {
                setCarName(carResponse.data.carName);
              }
            } catch (carError) {
              console.error('Error fetching car details:', carError);
            }
          }
        }
        
        // If carId is provided directly as a prop, fetch car details
        if (carId && !carName) {
          try {
            const carResponse = await axios.get(
              `http://localhost:5001/api/cars/${carId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );
            if (carResponse.data && carResponse.data.carName) {
              setCarName(carResponse.data.carName);
            }
          } catch (carError) {
            console.error('Error fetching car details:', carError);
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
  }, [open, userId, carId, carName]);

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
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          border: '1px solid #e2e8f0',
        }
      }}
    >
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1.5,
        bgcolor: '#000',
        color: 'white',
        borderBottom: '1px solid #333',
      }}>
        <ChatBubbleOutlineIcon sx={{ fontSize: 22, mr: 1 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {userName ? `Conversation with ${userName}` : `Conversation with User ${userId}`}
          </Typography>
          {carName && (
            <Typography variant="caption" sx={{ 
              display: 'block', 
              color: 'rgba(255,255,255,0.7)',
              mt: 0.5,
              fontSize: '0.75rem'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <DirectionsCarIcon sx={{ fontSize: '0.9rem' }} /> {carName}
              </Box>
            </Typography>
          )}
        </Box>
        <IconButton 
          onClick={onClose} 
          sx={{ 
            color: 'white',
            '&:hover': {
              color: '#3498db',
            },
            transition: 'color 0.3s ease',
          }}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </Box>
      
      <DialogContent sx={{ 
        p: 0, 
        display: 'flex', 
        flexDirection: 'column',
        height: '550px',
        bgcolor: '#f8fafc'
      }}>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            bgcolor: '#f8fafc',
            flexDirection: 'column',
            gap: 2
          }}>
            <CircularProgress sx={{ color: '#000' }} />
            <Typography variant="body2" color="text.secondary">
              Loading conversation...
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              px: 3,
              py: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              bgcolor: '#f8fafc',
              minHeight: 120,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: '3px',
              },
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
                <ChatBubbleOutlineIcon sx={{ fontSize: 48, color: '#333' }} />
                <Typography variant="body1" sx={{ 
                  color: '#333',
                  textAlign: 'center',
                  maxWidth: '80%',
                  fontWeight: 500
                }}>
                  No messages yet. Start the conversation!
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', mt: -1 }}>
                  Send a message to begin chatting
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
                      bgcolor: isUser ? '#000' : '#fff',
                      color: isUser ? 'white' : '#1e293b',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      mb: 0.5,
                      maxWidth: '80%',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      borderTopLeftRadius: isUser ? 12 : 4,
                      borderTopRightRadius: isUser ? 4 : 12,
                      fontSize: '1rem',
                      transition: 'all 0.2s ease',
                      border: isUser ? '1px solid #000' : '1px solid #e2e8f0',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{ 
                      fontWeight: isUser ? 400 : 500,
                      lineHeight: 1.5,
                      letterSpacing: '0.01em'
                    }}>
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
                          opacity: isUser ? 0.8 : 0.7, 
                          fontSize: '0.7rem',
                          fontWeight: 500,
                          color: isUser ? 'rgba(255,255,255,0.9)' : '#3498db'
                        }}
                      >
                        {isUser ? 'You' : (userName || `User ${userId}`)}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          opacity: isUser ? 0.6 : 0.5, 
                          fontSize: '0.7rem',
                          fontStyle: 'italic'
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
            bgcolor: '#f8fafc',
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
              bgcolor: '#fff', 
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3498db',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#000',
                },
              }
            }}
            inputProps={{ maxLength: 300 }}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            sx={{
              borderRadius: 2,
              minWidth: 'unset',
              bgcolor: '#000',
              '&:hover': {
                bgcolor: '#333',
              },
              '&.Mui-disabled': {
                bgcolor: '#cbd5e1',
                color: '#94a3b8',
              },
              transition: 'background-color 0.3s ease',
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
