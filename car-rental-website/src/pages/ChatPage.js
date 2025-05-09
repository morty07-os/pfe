import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Container,
  Grid,
  CardMedia,
  Avatar,
  IconButton,
  Divider,
  Skeleton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Navbar from '../components/Navbar';
import dayjs from 'dayjs';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SettingsIcon from '@mui/icons-material/Settings';
// import io from 'socket.io-client'; // Will be used for real-time chat

// const SOCKET_SERVER_URL = 'http://localhost:5001'; // Backend chat server

export default function ChatPage() {
  const { carId } = useParams(); // Or bookingId, depending on routing
  const location = useLocation();
  const navigate = useNavigate();
  
  const [bookingDetails, setBookingDetails] = useState(null);
  const [car, setCar] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showConfirmButton, setShowConfirmButton] = useState(false); // To be controlled by chat logic

  // const socketRef = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (location.state) {
      const { car: carData, startDate, endDate, totalCost } = location.state;
      setCar(carData);
      setBookingDetails({
        startDate: dayjs(startDate).format('DD MMM YYYY'),
        endDate: dayjs(endDate).format('DD MMM YYYY'),
        totalCost,
        numDays: dayjs(endDate).diff(dayjs(startDate), 'day') + 1
      });
      setLoading(false);
    } else {
      // Fallback if state is not passed (e.g., direct navigation or refresh)
      // Potentially fetch booking details if an ID is available
      // For now, show an error or redirect
      console.warn("Booking details not found in location state.");
      // navigate('/'); // Or to an error page
      setLoading(false); // Stop loading, will show 'no details' message
    }

    // Placeholder messages
    setMessages([
      { id: 1, sender: car?.ownerName?.firstName || 'Owner', text: 'Hello! I see you are interested in booking my car.', timestamp: new Date() },
      { id: 2, sender: 'You', text: 'Yes, I would like to confirm the dates.', timestamp: new Date() },
    ]);
    
    // Simulate agreement for confirm button
    setTimeout(() => {
        setShowConfirmButton(true);
    }, 5000); // Show confirm button after 5 seconds for demo

    // Socket.IO connection (to be implemented)
    // socketRef.current = io(SOCKET_SERVER_URL, {
    //   query: { bookingId: carId }, // Or a proper booking ID
    // });

    // socketRef.current.on('connect', () => {
    //   console.log('Connected to chat server');
    // });

    // socketRef.current.on('previousMessages', (loadedMessages) => {
    //   setMessages(loadedMessages);
    // });

    // socketRef.current.on('newMessage', (message) => {
    //   setMessages((prevMessages) => [...prevMessages, message]);
    // });

    // return () => {
    //   socketRef.current.disconnect();
    // };
  }, [location.state, carId, navigate, car?.ownerName?.firstName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const messageToSend = {
        id: messages.length + 1, // Temporary ID
        sender: 'You', // Assuming the current user is 'You'
        text: newMessage,
        timestamp: new Date(),
      };
      // socketRef.current.emit('sendMessage', messageToSend);
      setMessages(prevMessages => [...prevMessages, messageToSend]); // Optimistic update
      setNewMessage('');
    }
  };

  const handleConfirmBooking = () => {
    // Navigate to a secure payment page
    // Pass necessary booking information
    navigate(`/payment/${carId}`, { 
        state: { 
            car, 
            bookingDetails 
        } 
    });
  };
  
  const handleGoBack = () => {
    navigate(-1); 
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container sx={{ py: 4 }}>
          <Skeleton variant="rectangular" height={150} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={300} />
        </Container>
      </>
    );
  }

  if (!car || !bookingDetails) {
    return (
      <>
        <Navbar />
        <Container sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Booking information is not available.
          </Typography>
          <Typography color="text.secondary">
            Please start the booking process from the car details page.
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 2 }}>
            Go to Homepage
          </Button>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ bgcolor: '#f4f6f8', minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
        <Container maxWidth="lg" sx={{ py: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Button 
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
            sx={{ 
              mb: 2, 
              alignSelf: 'flex-start',
              color: '#475569',
              fontWeight: 500,
              '&:hover': { 
                bgcolor: 'rgba(71, 85, 105, 0.08)',
              },
            }}
          >
            Back to Booking
          </Button>

          {/* Car Info Header */}
          <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: 2, background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3} md={2}>
                <CardMedia
                  component="img"
                  image={`http://localhost:5001/${car.images?.[0]}`}
                  alt={car.carName}
                  sx={{ borderRadius: 1.5, height: 100, objectFit: 'cover', width: '100%' }}
                />
              </Grid>
              <Grid item xs={12} sm={9} md={10}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>{car.carName}</Typography>
                <Typography variant="body2" sx={{ color: '#475569' }}>
                  {car.brand} &bull; {car.year}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, color: '#475569', flexWrap: 'wrap' }}>
                    <EventSeatIcon fontSize="inherit" /> <Typography variant="caption">{car.seats} Seats</Typography> &bull;
                    <LocalGasStationIcon fontSize="inherit" /> <Typography variant="caption">{car.energy}</Typography> &bull;
                    <SettingsIcon fontSize="inherit" /> <Typography variant="caption">{car.transmission}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#334155' }}>
                  Booking for: {bookingDetails.startDate} to {bookingDetails.endDate} ({bookingDetails.numDays} days)
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e3a8a' }}>
                  Total: <AttachMoneyIcon sx={{ verticalAlign: 'middle', fontSize: '1.2rem' }} />{bookingDetails.totalCost.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Chat Interface */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: {xs: 1.5, sm: 2}, 
              flexGrow: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              borderRadius: 2,
              overflow: 'hidden',
              background: '#fff'
            }}
          >
            <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, p: {xs: 0.5, sm:1} }}>
              {messages.map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.sender === 'You' ? 'flex-end' : 'flex-start',
                    mb: 1.5,
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      borderRadius: msg.sender === 'You' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                      bgcolor: msg.sender === 'You' ? '#1e293b' : '#e2e8f0',
                      color: msg.sender === 'You' ? 'white' : '#1e293b',
                      maxWidth: '70%',
                      wordBreak: 'break-word'
                    }}
                  >
                    <Typography variant="body2">{msg.text}</Typography>
                    <Typography 
                        variant="caption" 
                        display="block" 
                        sx={{ 
                            mt: 0.5, 
                            textAlign: 'right', 
                            fontSize: '0.65rem',
                            color: msg.sender === 'You' ? '#cbd5e1' : '#64748b'
                        }}
                    >
                        {dayjs(msg.timestamp).format('h:mm A')}
                    </Typography>
                  </Paper>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <Box sx={{ display: 'flex', alignItems: 'center', borderTop: '1px solid #e2e8f0', pt: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                size="small"
                sx={{ 
                    mr: 1,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '20px',
                        backgroundColor: '#f1f5f9',
                        '& fieldset': {
                            borderColor: 'transparent',
                        },
                        '&:hover fieldset': {
                            borderColor: '#cbd5e1',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#475569',
                        },
                    },
                }}
              />
              <IconButton 
                color="primary" 
                onClick={handleSendMessage} 
                disabled={!newMessage.trim()}
                sx={{ 
                    bgcolor: '#1e293b', 
                    color: 'white',
                    '&:hover': { bgcolor: '#334155' },
                    '&.Mui-disabled': { bgcolor: '#94a3b8' }
                }}
            >
                <SendIcon />
              </IconButton>
            </Box>
            
            {/* Confirm Button */}
            {showConfirmButton && (
              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={handleConfirmBooking}
                sx={{ 
                    mt: 2, 
                    py: 1.2, 
                    fontWeight: 600,
                    bgcolor: '#10b981',
                    '&:hover': { bgcolor: '#059669' }
                }}
              >
                Confirm Booking & Proceed to Payment
              </Button>
            )}
          </Paper>
        </Container>
      </Box>
    </>
  );
}
