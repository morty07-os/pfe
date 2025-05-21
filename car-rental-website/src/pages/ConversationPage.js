import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Divider,
  Grid,
  Button,
  CircularProgress,
  TextField,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import dayjs from 'dayjs';
import Navbar from '../components/Navbar';

const ConversationPage = () => {
  const { carId } = useParams();
  const [car, setCar] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);
  const [conversationId, setConversationId] = useState('');

  const fetchMessages = React.useCallback(async (page = 1, limit = 10) => {
    if (!carId || !conversationId) {
      console.warn("Skipping fetchMessages: carId or conversationId is missing");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5001/api/messages/${carId}?conversationId=${conversationId}&page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setChatMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [carId, conversationId]);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
        const carResponse = await axios.get(`http://localhost:5001/api/cars/details/${carId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const carData = carResponse.data;
        setCar(carData);
        setOwner(carData.owner);
      } catch (error) {
        console.error("Error fetching car details:", error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    if (carId && /^[0-9a-fA-F]{24}$/.test(carId)) {
      fetchCarDetails();
    } else {
      console.error("Invalid carId:", carId);
      setLoading(false);
    }
  }, [carId]);

  useEffect(() => {
    if (owner) {
      const token = localStorage.getItem('token');
      const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;
      if (userId) {
        const userIds = [userId, owner._id].sort();
        setConversationId(`${carId}-${userIds[0]}-${userIds[1]}`);
      }
    }
  }, [owner, carId]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId, fetchMessages]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSendChat = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5001/api/messages/save', {
        carId: carId,
        receiver: owner._id,
        text: chatInput,
        conversationId: conversationId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setChatMessages(prev => [...prev, response.data]);
      setChatInput('');
      await fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
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
            Loading car details...
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
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={2}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(71, 85, 105, 0.12)',
                  bgcolor: '#fff',
                  mb: { xs: 3, md: 0 },
                }}
              >
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
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>
                    {car?.carName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <AttachMoneyIcon sx={{ color: '#3b82f6' }} />
                    <Typography sx={{ color: '#3b82f6', fontWeight: 600 }}>
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
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1e293b' }}>
                    About the Owner
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: '#e2e8f0',
                        color: '#3b82f6',
                        width: 50,
                        height: 50,
                        border: '2px solid #cbd5e1'
                      }}
                    >
                      {owner?.firstName?.charAt(0) || 'O'}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
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
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#1e293b' }}>
                          Availability
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarMonthIcon sx={{ color: '#475569' }} />
                          <Typography sx={{ color: '#475569' }}>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 0.5, sm: 2 } }}>
                              <span><span style={{ fontWeight: 500 }}>From:</span> {car?.availabilityStart ? dayjs(car.availabilityStart).format('DD-MM-YYYY') : 'Not Available'}</span>
                              <span><span style={{ fontWeight: 500 }}>To:</span> {car?.availabilityEnd ? dayjs(car.availabilityEnd).format('DD-MM-YYYY') : 'Not Available'}</span>
                            </Box>
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(59, 130, 246, 0.10)',
                  bgcolor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 420,
                  maxHeight: 540,
                  height: { md: 500, xs: 'auto' },
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
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  borderBottom: '1px solid #e2e8f0',
                }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ChatBubbleOutlineIcon sx={{ fontSize: 22, mr: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Chat with Owner
                      </Typography>
                    </Box>
                    {(car?.availabilityStart || car?.availabilityEnd) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, ml: 1 }}>
                        <CalendarMonthIcon sx={{ fontSize: '0.9rem' }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
                          <span style={{ fontWeight: 500 }}>From:</span> {car?.availabilityStart ? dayjs(car.availabilityStart).format('DD-MM-YYYY') : 'Not set'} 
                          <span style={{ margin: '0 4px' }}>|</span> 
                          <span style={{ fontWeight: 500 }}>To:</span> {car?.availabilityEnd ? dayjs(car.availabilityEnd).format('DD-MM-YYYY') : 'Not set'}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
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
                  {chatMessages.length === 0 ? (
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 4 }}>
                      No messages yet. Start the conversation!
                    </Typography>
                  ) : (
                    chatMessages.map((msg, idx) => {
                      const userId = localStorage.getItem('token') ? JSON.parse(atob(localStorage.getItem('token').split('.')[1])).userId : null;
                      const isUser = msg.sender._id.toString() === userId;
                      return (
                        <Box
                          key={idx}
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
                          <Typography variant="body2" sx={{ fontWeight: 400 }}>{msg.text}</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.7rem', display: 'block', mt: 0.5, textAlign: isUser ? 'right' : 'left' }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </Box>
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
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendChat())}
                    sx={{ bgcolor: '#f8fafc', borderRadius: 2 }}
                    inputProps={{ maxLength: 300 }}
                    disabled={false}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleSendChat}
                    disabled={!chatInput.trim()}
                    sx={{
                      bgcolor: !chatInput.trim() ? '#e2e8f0' : '#3b82f6',
                      color: !chatInput.trim() ? '#94a3b8' : 'white',
                      '&:hover': {
                        bgcolor: !chatInput.trim() ? '#e2e8f0' : '#2563eb',
                      },
                      transition: 'all 0.2s',
                      borderRadius: 2,
                      boxShadow: '0 1px 4px rgba(59,130,246,0.08)',
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default ConversationPage;
