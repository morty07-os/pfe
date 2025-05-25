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
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pt: 4, pb: 8, display: 'flex', justifyContent: 'center' }}>
        <Container maxWidth="lg" sx={{ width: '100%', maxWidth: { xs: '95%', sm: '90%', md: '85%', lg: '80%' } }}>
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
                elevation={0}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(71, 85, 105, 0.08)',
                  bgcolor: '#fff',
                  mb: { xs: 3, md: 0 },
                  border: '1px solid rgba(203, 213, 225, 0.5)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #475569 0%, #64748b 100%)',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                  },
                  backdropFilter: 'blur(8px)',
                }}
              >

                <Box sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5, color: '#1e293b', position: 'relative', display: 'inline-block' }}>
                    {car?.carName}
                    <Box sx={{ position: 'absolute', bottom: -6, left: 0, width: '40%', height: '3px', background: 'linear-gradient(90deg, #475569 0%, rgba(100, 116, 139, 0.3) 100%)', borderRadius: '2px' }} />
                  </Typography>
                  <Box sx={{
                    background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.03), rgba(71, 85, 105, 0.08))',
                    color: '#334155',
                    fontWeight: 700,
                    borderRadius: 1.5,
                    px: 1.75,
                    py: 0.6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                    border: '1px solid rgba(203, 213, 225, 0.3)',
                    width: 'fit-content',
                    mb: 2,
                    backdropFilter: 'blur(4px)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      boxShadow: '0 3px 8px rgba(15, 23, 42, 0.06)',
                      background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.05), rgba(71, 85, 105, 0.1))'
                    },
                  }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                        <Typography 
                          component="span" 
                          sx={{ 
                            fontWeight: 700, 
                            fontSize: '0.7rem',
                            color: '#475569',
                            letterSpacing: '0.02em',
                            textTransform: 'uppercase'
                          }}
                        >
                          DZD
                        </Typography>
                        <Typography 
                          component="span" 
                          sx={{ 
                            fontWeight: 700, 
                            fontSize: '1.1rem',
                            color: '#334155',
                            letterSpacing: '-0.01em'
                          }}
                        >
                          {car?.price?.toLocaleString()}
                        </Typography>
                      </Box>
                      <Typography 
                        component="span" 
                        sx={{ 
                          fontSize: '0.65rem', 
                          color: '#64748b',
                          fontWeight: 600,
                          letterSpacing: '0.02em',
                          opacity: 0.9,
                          mt: -0.3
                        }}
                      >
                        per day
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="subtitle2" sx={{ 
                    color: '#475569', 
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.4,
                    pl: 0.5,
                    mb: 0.75,
                    mt: 0.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    <LocationOnIcon sx={{ fontSize: '0.8rem', color: '#64748b' }} />
                    Location
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2, 
                    flexWrap: 'wrap',
                    gap: 1,
                    bgcolor: 'rgba(241, 245, 249, 0.5)',
                    borderRadius: 1.5,
                    p: 1,
                    border: '1px solid rgba(226, 232, 240, 0.4)',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.75,
                      bgcolor: 'white',
                      borderRadius: 1.5,
                      py: 0.75,
                      px: 1.5,
                      boxShadow: '0 2px 4px rgba(15, 23, 42, 0.05)',
                      border: '1px solid rgba(226, 232, 240, 0.8)'
                    }}>
                      <LocationOnIcon sx={{ 
                        color: '#475569', 
                        fontSize: '1.1rem' 
                      }} />
                      <Typography variant="body2" sx={{
                        color: '#334155',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}>
                        {car?.wilaya || 'Unknown Location'}{car?.address ? `, ${car?.address}` : ''}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 3, opacity: 0.6 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2.5, color: '#1e293b', position: 'relative', display: 'inline-block' }}>
                    About the Owner
                    <Box sx={{ position: 'absolute', bottom: -4, left: 0, width: '60%', height: '2px', background: 'linear-gradient(90deg, #475569 0%, rgba(100, 116, 139, 0.3) 100%)', borderRadius: '2px' }} />
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                    <Avatar
                      sx={{
                        bgcolor: '#475569',
                        color: '#fff',
                        width: 56,
                        height: 56,
                        border: '2px solid #cbd5e1',
                        boxShadow: '0 4px 12px rgba(71, 85, 105, 0.15)',
                        fontSize: '1.2rem',
                        fontWeight: 600
                      }}
                    >
                      {owner?.firstName?.charAt(0) || 'O'}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '1.05rem', letterSpacing: '0.01em' }}>
                        {owner?.firstName} {owner?.lastName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#475569', marginRight: '4px' }}></span>
                        Car Owner
                      </Typography>
                    </Box>
                  </Box>
                      {owner?.email && (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1, 
                          p: 1.5, 
                          bgcolor: 'rgba(241, 245, 249, 0.7)', 
                          borderRadius: 1.5,
                          border: '1px solid rgba(203, 213, 225, 0.4)',
                          mb: 2
                        }}>
                          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                            Email:
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                            {owner.email}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1e293b', position: 'relative', display: 'inline-block' }}>
                          Availability
                          <Box sx={{ position: 'absolute', bottom: -4, left: 0, width: '40%', height: '2px', background: 'linear-gradient(90deg, #475569 0%, rgba(100, 116, 139, 0.3) 100%)', borderRadius: '2px' }} />
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: 1.5,
                          p: 2,
                          bgcolor: 'rgba(241, 245, 249, 0.7)', 
                          borderRadius: 2,
                          border: '1px solid rgba(203, 213, 225, 0.4)',
                          boxShadow: '0 2px 8px rgba(71, 85, 105, 0.06)'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ 
                              width: 40, 
                              height: 40, 
                              borderRadius: '50%', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              bgcolor: 'rgba(71, 85, 105, 0.1)'
                            }}>
                              <CalendarMonthIcon sx={{ color: '#475569', fontSize: '1.3rem' }} />
                            </Box>
                            <Box>
                              <Typography sx={{ fontSize: '0.85rem', color: '#64748b', mb: 0.5 }}>
                                Available From
                              </Typography>
                              <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
                                {car?.availabilityStart ? dayjs(car.availabilityStart).format('DD MMMM YYYY') : 'Not Available'}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ 
                              width: 40, 
                              height: 40, 
                              borderRadius: '50%', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              bgcolor: 'rgba(71, 85, 105, 0.1)'
                            }}>
                              <CalendarMonthIcon sx={{ color: '#475569', fontSize: '1.3rem' }} />
                            </Box>
                            <Box>
                              <Typography sx={{ fontSize: '0.85rem', color: '#64748b', mb: 0.5 }}>
                                Available Until
                              </Typography>
                              <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
                                {car?.availabilityEnd ? dayjs(car.availabilityEnd).format('DD MMMM YYYY') : 'Not Available'}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(71, 85, 105, 0.12)',
                  bgcolor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 420,
                  maxHeight: 540,
                  height: { md: 500, xs: 'auto' },
                  border: '1px solid rgba(203, 213, 225, 0.5)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #475569 0%, #64748b 100%)',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                  },
                }}
              >
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 3,
                  py: 2,
                  bgcolor: '#475569',
                  color: 'white',
                  borderBottom: '1px solid rgba(226, 232, 240, 0.2)',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '5%',
                    right: '5%',
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                  },
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
                    px: 3,
                    py: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    bgcolor: '#f8fafc',
                    minHeight: 120,
                    backgroundImage: 'radial-gradient(rgba(203, 213, 225, 0.1) 1px, transparent 0)',
                    backgroundSize: '20px 20px',
                  }}
                >
                  {chatMessages.length === 0 ? (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      mt: 8,
                      gap: 2,
                      opacity: 0.8
                    }}>
                      <ChatBubbleOutlineIcon sx={{ fontSize: 40, color: '#64748b' }} />
                      <Typography variant="body1" color="#475569" sx={{ textAlign: 'center', fontWeight: 500 }}>
                        No messages yet. Start the conversation!
                      </Typography>
                      <Typography variant="body2" color="#64748b" sx={{ textAlign: 'center', maxWidth: 300 }}>
                        Ask about availability, car details, or any other questions you may have.
                      </Typography>
                    </Box>
                  ) : (
                    chatMessages.map((msg, idx) => {
                      const userId = localStorage.getItem('token') ? JSON.parse(atob(localStorage.getItem('token').split('.')[1])).userId : null;
                      const isUser = msg.sender?._id?.toString() === userId;
                      return (
                        <Box
                          key={idx}
                          sx={{
                            alignSelf: isUser ? 'flex-end' : 'flex-start',
                            bgcolor: isUser ? '#475569' : '#fff',
                            color: isUser ? 'white' : '#1e293b',
                            px: 2.5,
                            py: 1.5,
                            borderRadius: 2,
                            mb: 1,
                            maxWidth: '80%',
                            boxShadow: isUser ? '0 4px 12px rgba(71, 85, 105, 0.15)' : '0 4px 12px rgba(71, 85, 105, 0.06)',
                            borderTopLeftRadius: isUser ? 16 : 4,
                            borderTopRightRadius: isUser ? 4 : 16,
                            fontSize: '1rem',
                            transition: 'all 0.2s',
                            border: isUser ? '1px solid #475569' : '1px solid #e2e8f0',
                            position: 'relative',
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: isUser ? '0 6px 16px rgba(71, 85, 105, 0.18)' : '0 6px 16px rgba(71, 85, 105, 0.08)',
                            },
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
                    gap: 1.5,
                    px: 3,
                    py: 2,
                    bgcolor: '#fff',
                    borderTop: '1px solid #e2e8f0',
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 1,
                    boxShadow: '0 -4px 12px rgba(71, 85, 105, 0.05)',
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type your message..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendChat())}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: '#f8fafc',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#64748b',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#475569',
                          borderWidth: '1px',
                        },
                      },
                    }}
                    inputProps={{ 
                      maxLength: 300,
                      style: { padding: '10px 14px' } 
                    }}
                    disabled={false}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleSendChat}
                    disabled={!chatInput.trim()}
                    sx={{
                      bgcolor: !chatInput.trim() ? '#e2e8f0' : '#475569',
                      color: !chatInput.trim() ? '#94a3b8' : 'white',
                      width: 42,
                      height: 42,
                      '&:hover': {
                        bgcolor: !chatInput.trim() ? '#e2e8f0' : '#64748b',
                        transform: chatInput.trim() ? 'scale(1.05)' : 'none',
                      },
                      transition: 'all 0.2s',
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(71, 85, 105, 0.15)',
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
