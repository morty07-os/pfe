import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  TextField,
  IconButton,
  Divider,
  Grid,
  Chip,
  useTheme,
  useMediaQuery,
  Fade,
  Button,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import Navbar from '../components/Navbar';

// Create a socket connection
const socket = io('http://localhost:5001', {
  withCredentials: true,
  extraHeaders: {
    'Access-Control-Allow-Origin': 'http://localhost:3000',
  },
});

const ConversationPage = () => {
  const { carId } = useParams();
  const [car, setCar] = useState(null);
  const [owner, setOwner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [typing, setTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchOrCreateConversation = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }
      
      console.log('Fetching car details for carId:', carId);
      // 1. Fetch car details which includes owner information
      const carResponse = await axios.get(`http://localhost:5001/api/cars/details/${carId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const carData = carResponse.data;
      console.log('Car data:', carData);
      setCar(carData);
      setOwner(carData.owner);
      
      // 2. Get or create conversation
      console.log('Creating/fetching conversation with:', {
        participant1: currentUser._id,
        participant2: carData.owner._id,
        carId: carId
      });
      
      const conversationResponse = await axios.post(
        'http://localhost:5001/api/messages/conversations',
        {
          participant1: currentUser._id,
          participant2: carData.owner._id,
          carId: carId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const conversationData = conversationResponse.data;
      console.log('Conversation data:', conversationData);
      setConversation(conversationData);
      
      // 3. Fetch messages for this conversation
      console.log('Fetching messages for conversation:', conversationData._id);
      const messagesResponse = await axios.get(
        `http://localhost:5001/api/messages/conversations/${conversationData._id}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Fetched messages:', messagesResponse.data);
      setMessages(messagesResponse.data || []);
      
      // 4. Join the conversation room
      console.log('Joining conversation room:', conversationData._id);
      socket.emit('join_conversation', conversationData._id);
      
    } catch (error) {
      console.error('Error initializing conversation:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [carId, currentUser._id]);
  
  useEffect(() => {
    // Set up socket event listeners
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      // Notify the server that the user is online
      socket.emit('user_online', currentUser._id);
    });
    
    // Listen for new messages
    socket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });
    
    // Listen for typing indicators
    socket.on('user_typing', ({ userId }) => {
      if (userId !== currentUser._id) {
        setTyping(true);
        
        // Clear the typing indicator after 2 seconds
        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => setTyping(false), 2000);
        setTypingTimeout(timeout);
      }
    });
    
    // Initialize the conversation
    fetchOrCreateConversation();
    
    // Clean up event listeners on unmount
    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [fetchOrCreateConversation, currentUser._id, typingTimeout]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation || sending) return;
    
    try {
      setSending(true);
      const token = localStorage.getItem('token');
      
      // Emit the message via socket
      socket.emit('send_message', {
        conversationId: conversation._id,
        senderId: currentUser._id,
        receiverId: owner._id,
        carId: car._id,
        text: newMessage.trim()
      });
      
      // Optimistically update the UI
      const tempMessage = {
        _id: Date.now().toString(),
        conversationId: conversation._id,
        sender: currentUser,
        text: newMessage.trim(),
        createdAt: new Date().toISOString(),
        read: false,
        isSending: true
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };
  
  const handleTyping = () => {
    if (!conversation) return;
    // Emit typing indicator
    socket.emit('typing', {
      conversationId: conversation._id,
      userId: currentUser._id
    });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <>
        <Navbar sx={{ backgroundColor: '#111', color: '#fff' }} iconColor="#fff" />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '80vh',
          bgcolor: '#f8fafc',
          flexDirection: 'column',
          gap: 2
        }}>
          <CircularProgress />
          <Typography variant="body1" color="textSecondary">
            Loading conversation...
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar sx={{ backgroundColor: '#111', color: '#fff' }} iconColor="#fff" />
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pt: 4, pb: 8 }}>
        <Container maxWidth="lg">
          <Button 
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
            sx={{ 
              mb: 3, 
              color: '#475569',
              fontWeight: 500,
              '&:hover': { 
                bgcolor: 'rgba(71, 85, 105, 0.08)',
                transform: 'translateX(-4px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Back to car details
          </Button>

          <Fade in={true} timeout={500}>
            <Grid container spacing={3}>
              {/* Left side - Chat interface */}
              <Grid item xs={12} md={8}>
                <Paper
                  elevation={2}
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(71, 85, 105, 0.12)',
                    height: 'calc(100vh - 200px)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Chat header */}
                  <Box sx={{ 
                    background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                    p: 2,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: '#e2e8f0', 
                        color: '#475569',
                        width: 40,
                        height: 40,
                        border: '2px solid #cbd5e1'
                      }}
                    >
                      {owner?.firstName?.charAt(0) || 'O'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {owner?.firstName} {owner?.lastName}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Car Owner
                      </Typography>
                    </Box>
                  </Box>

                  {/* Messages area */}
                  <Box sx={{ 
                    flex: 1, 
                    overflowY: 'auto',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    bgcolor: '#f8fafc',
                  }}>
                    {loading ? (
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '100%',
                        color: '#64748b'
                      }}>
                        <CircularProgress size={24} sx={{ mr: 2 }} />
                        <Typography>Loading messages...</Typography>
                      </Box>
                    ) : messages.length === 0 ? (
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '100%',
                        color: '#64748b',
                        flexDirection: 'column',
                        gap: 2,
                        textAlign: 'center',
                        px: 2
                      }}>
                        <Box sx={{ 
                          width: 120, 
                          height: 120, 
                          borderRadius: '50%', 
                          bgcolor: '#e2e8f0',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          mb: 2
                        }}>
                          <PersonIcon sx={{ fontSize: 60, color: '#94a3b8' }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 500, color: '#1e293b' }}>
                          {owner?.firstName} {owner?.lastName}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#64748b', maxWidth: '400px' }}>
                          This is the beginning of your conversation with {owner?.firstName} about {car?.title}.
                        </Typography>
                      </Box>
                    ) : (
                      messages.map((message) => {
                        const isCurrentUser = message.sender?._id === currentUser._id;
                        const senderName = isCurrentUser 
                          ? 'You' 
                          : `${message.sender?.firstName || 'User'}`;
                        
                        return (
                          <Box
                            key={message._id || message.id}
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
                              width: '100%',
                              mb: 2,
                            }}
                          >
                            <Box sx={{ 
                              display: 'flex',
                              alignItems: 'flex-end',
                              maxWidth: '80%',
                              flexDirection: isCurrentUser ? 'row-reverse' : 'row'
                            }}>
                              {!isCurrentUser && (
                                <Avatar 
                                  src={message.sender?.avatar} 
                                  sx={{ 
                                    width: 32, 
                                    height: 32, 
                                    mr: 1,
                                    bgcolor: 'primary.main',
                                    fontSize: '0.875rem',
                                    textTransform: 'uppercase'
                                  }}
                                >
                                  {message.sender?.firstName?.charAt(0)}{message.sender?.lastName?.charAt(0)}
                                </Avatar>
                              )}
                              <Box>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: isCurrentUser ? '#3b82f6' : '#f1f5f9',
                                    color: isCurrentUser ? 'white' : '#1e293b',
                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                                    maxWidth: '100%',
                                    wordBreak: 'break-word',
                                    position: 'relative',
                                    borderTopLeftRadius: isCurrentUser ? 16 : 4,
                                    borderTopRightRadius: isCurrentUser ? 4 : 16,
                                  }}
                                >
                                  <Typography variant="body2" sx={{ fontWeight: isCurrentUser ? 500 : 400 }}>
                                    {message.text}
                                  </Typography>
                                  <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                    mt: 0.5,
                                    gap: 0.5
                                  }}>
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        fontSize: '0.65rem',
                                        opacity: 0.8,
                                        color: isCurrentUser ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.5)'
                                      }}
                                    >
                                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                    {isCurrentUser && (
                                      <Box sx={{ display: 'flex', ml: 0.5 }}>
                                        {message.read ? (
                                          <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.65rem' }}>
                                            Read
                                          </Typography>
                                        ) : (
                                          <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.65rem' }}>
                                            Sent
                                          </Typography>
                                        )}
                                      </Box>
                                    )}
                                  </Box>
                                </Paper>
                              </Box>
                            </Box>
                          </Box>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </Box>

                  {/* Message input */}
                  <Box sx={{ 
                    p: 2, 
                    borderTop: '1px solid #e2e8f0',
                    bgcolor: 'white',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          handleTyping();
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                        multiline
                        maxRows={4}
                        size="small"
                        disabled={sending || loading}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '24px',
                            bgcolor: '#f8fafc',
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#cbd5e1',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#3b82f6',
                              borderWidth: '1px',
                            },
                            '& textarea': {
                              maxHeight: '120px',
                              overflowY: 'auto !important',
                              scrollbarWidth: 'thin',
                              scrollbarColor: '#cbd5e1 transparent',
                              '&::-webkit-scrollbar': {
                                width: '6px',
                              },
                              '&::-webkit-scrollbar-track': {
                                background: 'transparent',
                              },
                              '&::-webkit-scrollbar-thumb': {
                                backgroundColor: '#cbd5e1',
                                borderRadius: '3px',
                              },
                            },
                          },
                        }}
                      />
                      <IconButton
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending || loading}
                        sx={{
                          bgcolor: '#3b82f6',
                          color: 'white',
                          '&:hover': {
                            bgcolor: '#2563eb',
                          },
                          '&:disabled': {
                            bgcolor: '#e2e8f0',
                            color: '#94a3b8',
                          },
                          transition: 'all 0.2s ease',
                          transform: sending ? 'scale(0.9)' : 'scale(1)',
                        }}
                      >
                        {sending ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <SendIcon />
                        )}
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* Right side - Car and owner details */}
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={2}
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(71, 85, 105, 0.12)',
                  }}
                >
                  {/* Car image */}
                  <Box sx={{ position: 'relative', height: 200 }}>
                    <img
                      src={`http://localhost:5001/${car?.images?.[0]}`}
                      alt={car?.carName}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Box>

                  {/* Car details */}
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      {car?.carName}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <AttachMoneyIcon sx={{ color: '#475569' }} />
                      <Typography sx={{ color: '#475569', fontWeight: 600 }}>
                        €{car?.price}/day
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LocationOnIcon sx={{ color: '#475569' }} />
                      <Typography sx={{ color: '#475569' }}>
                        {car?.wilaya}, {car?.address}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Owner details */}
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      About the Owner
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: '#e2e8f0', 
                          color: '#475569',
                          width: 50,
                          height: 50,
                          border: '2px solid #cbd5e1'
                        }}
                      >
                        {owner?.firstName?.charAt(0) || 'O'}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#475569' }}>
                          {owner?.firstName} {owner?.lastName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          Car Owner
                        </Typography>
                      </Box>
                    </Box>

                    {owner?.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          Email:
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#475569' }}>
                          {owner.email}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Fade>
        </Container>
      </Box>
    </>
  );
};

// Add keyframes for typing animation
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 0.4; transform: translateY(0); }
    50% { opacity: 1; transform: translateY(-3px); }
  }
  .typing-dot {
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: currentColor;
    margin: 0 1px;
    animation: bounce 1.4s infinite ease-in-out both;
  }
  .typing-dot:nth-child(1) { animation-delay: -0.32s; }
  .typing-dot:nth-child(2) { animation-delay: -0.16s; }
`;
document.head.appendChild(style);

export default ConversationPage; 