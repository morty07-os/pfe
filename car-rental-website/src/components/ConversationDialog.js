import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, // Keep Dialog for internal confirmation dialog
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  Button,
  Box,
  CircularProgress,
  Typography,
  IconButton,
  Avatar,
  Divider,
  Paper,
  Badge,
  Tooltip
} from '@mui/material';
import axios from 'axios';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ImageIcon from '@mui/icons-material/Image';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FeedbackDialog from './FeedbackDialog';

const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';

const ConversationDialog = ({ userId, carId, conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [carName, setCarName] = useState('');
  const [carAvailabilityStart, setCarAvailabilityStart] = useState(null);
  const [carAvailabilityEnd, setCarAvailabilityEnd] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isCarOwner, setIsCarOwner] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [carOwnerId, setCarOwnerId] = useState(null);
  const [ownerConfirmed, setOwnerConfirmed] = useState(false);
  const [renterConfirmed, setRenterConfirmed] = useState(false);
  const [carAvailable, setCarAvailable] = useState(true);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [hasFeedback, setHasFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [ownerName, setOwnerName] = useState('');
  const [receiptSent, setReceiptSent] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setBookingConfirmed(false);
    setOwnerConfirmed(false);
    setRenterConfirmed(false);
    setCarOwnerId(null);
    setCarAvailable(true);
    
    const checkCarAvailability = async () => {
      try {
        const token = localStorage.getItem('token');
        const carResponse = await axios.get(
          `${apiUrl}/api/cars/details/${carId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application',
            },
          }
        );
        
        if (carResponse.data.isDeleted) {
          setBookingConfirmed(true);
          setCarAvailable(false);
          if (messages.length === 0) {
            handleSendMessage('This car is no longer available for booking. It may have been booked by another user or removed by the owner.');
          }
        }
      } catch (error) {
        console.error('Error checking car availability:', error);
        setBookingConfirmed(true);
        setCarAvailable(false);
      }
    };
    
    if (carId) {
      checkCarAvailability();
    }
  }, [carId, userId, conversationId, messages.length]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
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
        
        const endpoint = conversationId 
          ? `${apiUrl}/api/messages/${carId}?conversationId=${conversationId}` 
          : `${apiUrl}/api/messages/user/${userId}`;
        
        const response = await axios.get(
          endpoint,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        setMessages(response.data);
        
        let ownerId = carOwnerId;
        
        if (!ownerId && response.data.length > 0) {
          const carMessages = response.data.filter(msg => msg.carId);
          if (carMessages.length > 0) {
            if (carMessages[0].carOwner) {
              ownerId = carMessages[0].carOwner;
              setCarOwnerId(ownerId);
            }
            else if (carMessages[0].carId && typeof carMessages[0].carId === 'string') {
              try {
                const carDetailResponse = await axios.get(
                  `${apiUrl}/api/cars/details/${carMessages[0].carId}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                  }
                );
                
                if (carDetailResponse.data && carDetailResponse.data.owner) {
                  if (carDetailResponse.data.isDeleted) {
                    setBookingConfirmed(true);
                    setCarAvailable(false);
                    console.log('Car is marked as deleted');
                  }
                  
                  ownerId = typeof carDetailResponse.data.owner === 'object' 
                    ? carDetailResponse.data.owner._id 
                    : carDetailResponse.data.owner;
                  
                  setCarOwnerId(ownerId);
                  setIsCarOwner(ownerId === currentId);
                }
              } catch (error) {
                console.error('Error fetching car owner details:', error);
              }
            }
          }
        }
        
        const currentCarMessages = response.data.filter(msg => {
          if (msg.carId && typeof msg.carId === 'string') {
            return msg.carId === carId;
          } else if (msg.carId && typeof msg.carId === 'object' && msg.carId._id) {
            return msg.carId._id === carId;
          }
          return msg.conversationId === conversationId;
        });
        
        const ownerConfirmationMsg = currentCarMessages.find(msg => 
          msg.text && msg.text.includes("I've confirmed the booking") && 
          msg.sender && ownerId && msg.sender._id === ownerId
        );
        
        const renterConfirmationMsg = currentCarMessages.find(msg => 
          msg.text && msg.text.includes("My booking for") && 
          msg.sender && ownerId && msg.sender._id !== ownerId
        );
        
        console.log('Confirmation status for car', carId, ':', { 
          ownerId, 
          currentId, 
          isCarOwner: ownerId === currentId,
          ownerConfirmed: !!ownerConfirmationMsg,
          renterConfirmed: !!renterConfirmationMsg
        });
        
        if (ownerConfirmationMsg) {
          setOwnerConfirmed(true);
        }
        
        if (renterConfirmationMsg) {
          setRenterConfirmed(true);
        }
        
        if (ownerConfirmationMsg && renterConfirmationMsg) {
          setBookingConfirmed(true);
        }
        
        if (response.data.length > 0 && currentId) {
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
          
          if (firstMessage.carId && typeof firstMessage.carId === 'string') {
            try {
              const carResponse = await axios.get(
                `${apiUrl}/api/cars/details/${firstMessage.carId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );
              if (carResponse.data) {
                if (carResponse.data.carName) {
                  setCarName(carResponse.data.carName);
                }
                if (carResponse.data.availabilityStart) {
                  setCarAvailabilityStart(carResponse.data.availabilityStart);
                }
                if (carResponse.data.availabilityEnd) {
                  setCarAvailabilityEnd(carResponse.data.availabilityEnd);
                }
              }
            } catch (carError) {
              console.error('Error fetching car details:', carError);
            }
          }
        }
        
        if (carId && !carName) {
          try {
            const carResponse = await axios.get(
              `${apiUrl}/api/cars/details/${carId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );
            if (carResponse.data) {
              if (carResponse.data.carName) {
                setCarName(carResponse.data.carName);
              }
              if (carResponse.data.availabilityStart) {
                setCarAvailabilityStart(carResponse.data.availabilityStart);
              }
              if (carResponse.data.availabilityEnd) {
                setCarAvailabilityEnd(carResponse.data.availabilityEnd);
              }
              
              if (carResponse.data.owner) {
                const owner = carResponse.data.owner;
                const ownerId = typeof owner === 'object' 
                  ? owner._id 
                  : owner;
                
                setCarOwnerId(ownerId);
                setIsCarOwner(ownerId === currentId);
                
                if (typeof owner === 'object' && owner.firstName && owner.lastName) {
                  setOwnerName(`${owner.firstName} ${owner.lastName}`);
                }
                
                console.log('Car owner check:', { ownerId, currentId, isOwner: ownerId === currentId });
              }
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

    if (userId) {
      fetchMessages();
    }
  }, [userId, carId, carName, conversationId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  useEffect(() => {
    const checkFeedbackStatus = async () => {
      if (!carId || !currentUserId || !bookingConfirmed || !ownerConfirmed || !renterConfirmed) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${apiUrl}/api/feedback/check?carId=${carId}&userId=${currentUserId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (response.data && response.data.hasFeedback) {
          setHasFeedback(true);
        }
      } catch (error) {
        console.error('Error checking feedback status:', error);
      }
    };
    
    if (bookingConfirmed && ownerConfirmed && renterConfirmed && currentUserId && carId) {
      checkFeedbackStatus();
    }
  }, [bookingConfirmed, ownerConfirmed, renterConfirmed, currentUserId, carId, feedbackSubmitted]);
  
  const handleOpenFeedbackDialog = () => {
    setFeedbackDialogOpen(true);
  };
  
  const handleCloseFeedbackDialog = (submitted = false) => {
    setFeedbackDialogOpen(false);
    if (submitted) {
      setFeedbackSubmitted(true);
      setHasFeedback(true);
    }
  };

  const handleSendButtonClick = () => {
    handleSendMessage();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleOpenConfirmDialog = () => {
    setConfirmDialogOpen(true);
  };
  
  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };
  
  const handleConfirmBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      
      try {
        const carCheckResponse = await axios.get(
          `${apiUrl}/api/cars/details/${carId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (!carCheckResponse.data || carCheckResponse.data.isDeleted) {
          alert('This car is no longer available for booking. It may have been booked by another user or removed by the owner.');
          setConfirmDialogOpen(false);
          
          await handleSendMessage('This car is no longer available for booking. It may have been booked by another user or removed by the owner.');
          
          setBookingConfirmed(true);
          return;
        }
      } catch (carCheckError) {
        alert('This car is no longer available for booking. It may have been booked by another user or removed by the owner.');
        setConfirmDialogOpen(false);
        
        await handleSendMessage('This car is no longer available for booking. It may have been booked by another user or removed by the owner.');
        
        setBookingConfirmed(true);
        return;
      }
      
      const confirmationMessage = isCarOwner 
        ? `I've confirmed the booking for ${carName}. Waiting for renter confirmation.` 
        : `My booking for ${carName} has been confirmed. Waiting for owner confirmation.`;
      
      await handleSendMessage(confirmationMessage);
      
      if (isCarOwner) {
        setOwnerConfirmed(true);
      } else {
        setRenterConfirmed(true);
      }
      
      const bothConfirmed = (isCarOwner && renterConfirmed) || (!isCarOwner && ownerConfirmed);
      console.log(`Confirmation status for car ${carId} (${carName}):`, { 
        isCarOwner, 
        ownerConfirmed, 
        renterConfirmed, 
        bothConfirmed 
      });
      
      if (bothConfirmed) {
        try {
          // Update car booking status instead of deleting
          const updateResponse = await axios.put(
            `${apiUrl}/api/cars/booking-status/${carId}`,
            { bookingStatus: 'booked' },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          const finalMessage = `Booking for ${carName} has been confirmed by both parties. The car is now marked as booked.`;
          await handleSendMessage(finalMessage);
          
          try {
            const conversationsResponse = await axios.get(
              `${apiUrl}/api/messages/car-conversations/${carId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );
            
            if (conversationsResponse.data && conversationsResponse.data.length > 0) {
              const otherConversations = conversationsResponse.data.filter(
                conv => conv.conversationId !== conversationId
              );
              
              for (const conv of otherConversations) {
                try {
                  await axios.post(
                    `${apiUrl}/api/messages/save`,
                    {
                      carId: carId,
                      receiver: conv.otherUserId,
                      text: `This car (${carName}) has been confirmed for renting with another user and is no longer available.`,
                      conversationId: conv.conversationId,
                      isSystemMessage: true
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                    }
                  );
                } catch (notifyError) {
                  console.error(`Error notifying conversation ${conv.conversationId}:`, notifyError);
                }
              }
            }
          } catch (notifyError) {
            console.log('Could not notify other conversations:', notifyError);
          }
          
          setBookingConfirmed(true);
          
          alert('Booking confirmed by both parties! The car has been marked as booked.');
          
          window.dispatchEvent(new CustomEvent('carBooked', { detail: { carId } }));

        } catch (error) {
          console.error('Error during car booking confirmation:', error);
          alert(`Error confirming booking: ${error.message}`);
        }
      } else {
        alert(isCarOwner 
          ? 'Your confirmation has been recorded. Waiting for renter to confirm.' 
          : 'Your confirmation has been recorded. Waiting for owner to confirm.');
      }
    } catch (error) {
      console.error('Error in handleConfirmBooking:', error);
      alert('An error occurred while confirming the booking. Please try again.');
    }
  };
  
  const handleSendMessage = async (text = null) => {
    const messageText = text || newMessage.trim();
    if (!messageText && !selectedImage) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('receiver', userId);
      formData.append('text', messageText || 'Image sent');
      if (carId) {
        formData.append('carId', carId);
      }
      
      if (conversationId) {
        formData.append('conversationId', conversationId);
      }
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      
      const response = await axios.post(
        `${apiUrl}/api/messages/save`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      const newMsg = {
        text: messageText || 'Image sent',
        createdAt: new Date().toISOString(),
        sender: { _id: currentUserId }
      };
      
      if (imagePreview) {
        newMsg.image = imagePreview;
      }
      
      setMessages([...messages, newMsg]);
      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert(`Error sending message: ${error.message}`);
    }
  };

  const isCurrentUserMessage = (message) => {
    if (message.sender && message.sender._id) {
      return message.sender._id === currentUserId;
    }
    if (message.sender === 'me') {
      return true;
    }
    if (message.sender && typeof message.sender === 'string') {
      return message.sender === currentUserId;
    }
    return false;
  };

  const handleSendReceipt = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiUrl}/api/admin/send-receipt`,
        {
          carId,
          userId: isCarOwner ? userId : currentUserId,
          ownerId: isCarOwner ? currentUserId : carOwnerId,
          carName,
          conversationId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setReceiptSent(true);
        alert('Receipt has been sent to admin successfully!');
      }
    } catch (error) {
      console.error('Error sending receipt:', error);
      alert('Failed to send receipt. Please try again.');
    }
  };

  return (
    <> {/* Use React.Fragment as the root element */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 0,
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: { xs: '400px', sm: '500px' },
          height: '100%',
          flexGrow: 1,
          borderRadius: 2,
          overflow: 'hidden',
          background: '#fff',
          border: '1px solid #e2e8f0'
        }}
      >
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 0.5, sm: 1 },
          px: { xs: 1, sm: 1.5, md: 2 },
          py: { xs: 1, sm: 1.5 },
          bgcolor: '#1e293b',
          color: 'white',
          borderBottom: '1px solid #333',
        }}>
          <ChatBubbleOutlineIcon sx={{ fontSize: { xs: 18, sm: 20, md: 22 }, mr: { xs: 0.5, sm: 1 } }} />
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 600,
              fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {userName ? `Conversation with ${userName}` : `Conversation with User ${userId}`}
            </Typography>
            {carName && (
              <Typography variant="caption" sx={{ 
                display: 'block', 
                color: 'rgba(255,255,255,0.7)',
                mt: 0.5,
                fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <DirectionsCarIcon sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' } }} /> {carName}
                </Box>
              </Typography>
            )}
            {bookingConfirmed && (
              <Typography variant="caption" sx={{
                display: 'block',
                color: '#4ade80',
                mt: 0.5,
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: '0.9rem' }} />
                  Booking confirmed for {carName}
                </Box>
              </Typography>
            )}
            {carName && carAvailabilityStart && carAvailabilityEnd && (
              <Typography variant="caption" sx={{
                display: 'block',
                color: 'rgba(255,255,255,0.7)',
                mt: 0.5,
                fontSize: '0.75rem'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EventNoteIcon sx={{ fontSize: '0.9rem' }} />
                  Available: {new Date(carAvailabilityStart).toISOString().split('T')[0]} to {new Date(carAvailabilityEnd).toISOString().split('T')[0]}
                </Box>
              </Typography>
            )}
          </Box>
        </Box>
        
        <Box sx={{ 
          p: 0, 
          display: 'flex', 
          flexDirection: 'column',
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
              <CircularProgress sx={{ color: '#334155' }} />
              <Typography variant="body2" color="text.secondary">
                Loading conversation...
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                px: { xs: 1.5, sm: 2, md: 3 },
                py: { xs: 1.5, sm: 2 },
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: 1, sm: 1.5 },
                bgcolor: '#f8fafc',
                minHeight: { xs: 100, sm: 120 },
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
                  <ChatBubbleOutlineIcon sx={{ fontSize: 48, color: '#cbd5e1' }} />
                  <Typography variant="body1" sx={{ 
                    color: '#64748b',
                    textAlign: 'center',
                    maxWidth: '80%',
                    fontWeight: 500
                  }}>
                    No messages yet. Start the conversation!
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', mt: -1 }}>
                    Send a message to begin chatting
                  </Typography>
                </Box>
              ) : (
                messages.map((message, index) => {
                  if (message.isSystemMessage) {
                    return (
                      <Box
                        key={index}
                        sx={{
                          alignSelf: 'center',
                          bgcolor: '#fff3cd',
                          color: '#856404',
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          mb: 1,
                          maxWidth: '90%',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                          border: '1px solid #ffeeba',
                          textAlign: 'center',
                          fontSize: '0.9rem',
                        }}
                      >
                        <Typography variant="body2" sx={{ 
                          fontWeight: 500,
                          lineHeight: 1.5,
                          letterSpacing: '0.01em',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1
                        }}>
                          <CancelIcon sx={{ fontSize: '1rem' }} />
                          {message.text}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          display: 'block', 
                          textAlign: 'center',
                          mt: 0.5,
                          opacity: 0.7,
                          fontSize: '0.7rem'
                        }}>
                          {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </Typography>
                      </Box>
                    );
                  }
                  
                  const isUser = isCurrentUserMessage(message);
                  return (
                    <Box
                      key={index}
                      sx={{
                        alignSelf: isUser ? 'flex-end' : 'flex-start',
                        bgcolor: isUser ? '#475569' : '#fff',
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
                        border: isUser ? '1px solid #475569' : '1px solid #e2e8f0',
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
                      {message.image && (
                        <Box sx={{ mt: 1, maxWidth: '100%' }}>
                          <img 
                            src={message.image.startsWith('data:') 
                              ? message.image 
                              : `${apiUrl}/${message.image}`
                            } 
                            alt="Message attachment" 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '200px', 
                              borderRadius: '8px',
                              border: '1px solid rgba(0,0,0,0.1)'
                            }} 
                          />
                        </Box>
                      )}
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
              flexDirection: 'column',
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
            {imagePreview && (
              <Box sx={{ 
                position: 'relative', 
                display: 'inline-block', 
                maxWidth: '150px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0'
              }}>
                <img 
                  src={imagePreview} 
                  alt="Selected" 
                  style={{ 
                    width: '100%', 
                    maxHeight: '100px', 
                    objectFit: 'cover',
                    display: 'block'
                  }} 
                />
                <IconButton 
                  size="small" 
                  onClick={handleRemoveImage}
                  sx={{ 
                    position: 'absolute', 
                    top: 2, 
                    right: 2, 
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    padding: '4px',
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.7)',
                    }
                  }}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageSelect}
                ref={fileInputRef}
                id="image-upload"
              />
              <Tooltip title={bookingConfirmed ? "Car is no longer available" : "Add image"}>
                <span>
                  <IconButton 
                    onClick={() => fileInputRef.current.click()}
                    disabled={bookingConfirmed}
                    size="small"
                    sx={{
                      bgcolor: bookingConfirmed ? '#f8f9fa' : '#fff',
                      border: '1px solid #e2e8f0',
                      width: { xs: 32, sm: 36, md: 40 },
                      height: { xs: 32, sm: 36, md: 40 },
                      '&:hover': {
                        bgcolor: bookingConfirmed ? '#f8f9fa' : '#f1f5f9',
                      }
                    }}
                  >
                    <PhotoCameraIcon 
                      color={bookingConfirmed ? "disabled" : "inherit"} 
                      sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }}
                    />
                  </IconButton>
                </span>
              </Tooltip>
              
              <TextField
                fullWidth
                size="small"
                placeholder={bookingConfirmed ? "Car unavailable" : "Type your message..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={bookingConfirmed}
                sx={{ 
                  bgcolor: bookingConfirmed ? '#f8f9fa' : '#fff', 
                  borderRadius: 2,
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: bookingConfirmed ? '#ddd' : '#3498db',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: bookingConfirmed ? '#ddd' : '#475569',
                    },
                  }
                }}
                inputProps={{ maxLength: 300 }}
              />
              <Button
                variant="contained"
                onClick={handleSendButtonClick}
                disabled={bookingConfirmed || (!newMessage.trim() && !selectedImage)}
                sx={{
                  borderRadius: 2,
                  minWidth: 'unset',
                  bgcolor: bookingConfirmed ? '#cbd5e1' : '#475569',
                  '&:hover': {
                    bgcolor: bookingConfirmed ? '#cbd5e1' : '#334155',
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
            
            {carId && !carAvailable && !bookingConfirmed && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mt: 2, 
                mb: 1,
                px: 2,
                py: 1.5,
                bgcolor: '#fff3cd',
                color: '#856404',
                borderRadius: 2,
                border: '1px solid #ffeeba',
              }}>
                <CancelIcon sx={{ fontSize: '1.2rem' }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  This car is no longer available for booking. It may have been booked by another user or removed by the owner.
                </Typography>
              </Box>
            )}
            
            {carId && !bookingConfirmed && carAvailable && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 1,
                mt: 2, 
                mb: 1,
                px: 2
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                  p: 1,
                  bgcolor: 'rgba(0, 0, 0, 0.03)',
                  borderRadius: 2
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 0.5
                  }}>
                    {ownerConfirmed ? (
                      <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16 }} />
                    ) : (
                      <CancelIcon sx={{ color: 'text.disabled', fontSize: 16 }} />
                    )}
                    <Typography variant="caption" sx={{ 
                      fontWeight: 500,
                      color: ownerConfirmed ? 'success.main' : 'text.secondary'
                    }}>
                      {isCarOwner ? 'You (Owner)' : 'Owner'} confirmed
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 0.5
                  }}>
                    {renterConfirmed ? (
                      <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16 }} />
                    ) : (
                      <CancelIcon sx={{ color: 'text.disabled', fontSize: 16 }} />
                    )}
                    <Typography variant="caption" sx={{ 
                      fontWeight: 500,
                      color: renterConfirmed ? 'success.main' : 'text.secondary'
                    }}>
                      {!isCarOwner ? 'You (Renter)' : 'Renter'} confirmed
                    </Typography>
                  </Box>
                </Box>
                
                {(isCarOwner && !ownerConfirmed) || (!isCarOwner && !renterConfirmed) ? (
                  <Tooltip title={carAvailable ? "Confirm this booking" : "This car is no longer available"}>
                    <span>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={handleOpenConfirmDialog}
                        fullWidth
                        disabled={!carAvailable}
                        sx={{
                          borderRadius: 2,
                          py: 1,
                          fontWeight: 600,
                          textTransform: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          '&:hover': {
                            boxShadow: carAvailable ? '0 6px 16px rgba(0,0,0,0.15)' : 'none',
                            transform: carAvailable ? 'translateY(-1px)' : 'none'
                          },
                          opacity: carAvailable ? 1 : 0.7,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {isCarOwner 
                          ? 'Confirm Booking as Car Owner' 
                          : 'Confirm Booking as Renter'}
                      </Button>
                    </span>
                  </Tooltip>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    p: 1,
                    bgcolor: 'rgba(46, 204, 113, 0.1)',
                    borderRadius: 2,
                    border: '1px solid rgba(46, 204, 113, 0.3)'
                  }}>
                    <CheckCircleIcon sx={{ color: 'success.main', mr: 1, fontSize: 18 }} />
                    <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 500 }}>
                      {isCarOwner 
                        ? "You've confirmed this booking as the car owner. Waiting for renter to confirm." 
                        : "You've confirmed this booking as the renter. Waiting for car owner to confirm."}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
            
            {bookingConfirmed && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                mt: 2, 
                mb: 1,
                px: 2,
                py: 1,
                bgcolor: 'rgba(46, 204, 113, 0.1)',
                borderRadius: 2,
                border: '1px solid rgba(46, 204, 113, 0.3)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                  <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                    Booking Confirmed Successfully!
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'success.main', mt: 1 }}>
                  {isCarOwner 
                    ? `You (as the car owner) and the renter have both confirmed the booking for ${carName}.` 
                    : `You (as the renter) and the car owner have both confirmed the booking for ${carName}.`}
                  {" This car has been marked as booked."}
                </Typography>
                
                {(ownerConfirmed && renterConfirmed) && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: 2,
                    mt: 2,
                    mb: 0.5
                  }}>
                    {hasFeedback ? (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        bgcolor: 'rgba(0, 0, 0, 0.05)',
                        px: 2,
                        py: 1,
                        borderRadius: 2
                      }}>
                        <StarIcon sx={{ color: '#FFD700', mr: 1, fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Thank you for your feedback!
                        </Typography>
                      </Box>
                    ) : (
                      <Button
                        variant="contained"
                        startIcon={<StarIcon sx={{ color: '#FFD700' }} />}
                        onClick={handleOpenFeedbackDialog}
                        sx={{
                          borderRadius: 2,
                          py: 1.2,
                          px: 3,
                          textTransform: 'none',
                          fontWeight: 600,
                          bgcolor: '#475569',
                          '&:hover': {
                            bgcolor: '#334155',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                          },
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          animation: 'pulse 2s infinite',
                          '@keyframes pulse': {
                            '0%': {
                              boxShadow: '0 0 0 0 rgba(0, 0, 0, 0.3)',
                            },
                            '70%': {
                              boxShadow: '0 0 0 10px rgba(0, 0, 0, 0)',
                            },
                            '100%': {
                              boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)',
                            },
                          },
                        }}
                      >
                        {isCarOwner ? 'Rate the Renter' : 'Rate Car & Owner'}
                      </Button>
                    )}
                    
                    {receiptSent ? (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        bgcolor: 'rgba(0, 0, 0, 0.05)',
                        px: 2,
                        py: 1,
                        borderRadius: 2
                      }}>
                        <CheckCircleIcon sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Receipt sent to admin
                        </Typography>
                      </Box>
                    ) : (
                      <Button
                        variant="contained"
                        startIcon={<ReceiptIcon />}
                        onClick={handleSendReceipt}
                        sx={{
                          borderRadius: 2,
                          py: 1.2,
                          px: 3,
                          textTransform: 'none',
                          fontWeight: 600,
                          bgcolor: '#2ecc71',
                          '&:hover': {
                            bgcolor: '#27ae60',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                          },
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      >
                        Send Receipt to Admin
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            border: '1px solid #e2e8f0',
            p: 1
          }
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 600 }}>
          {isCarOwner 
            ? `Confirm Booking for ${carName} as Car Owner` 
            : `Confirm Booking for ${carName} as Renter`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to confirm this booking for {carName}? 
            {isCarOwner 
              ? " As the car owner, your confirmation is required along with the renter's confirmation." 
              : " As the renter, your confirmation is required along with the car owner's confirmation."}
            <br/><br/>
            {(isCarOwner && renterConfirmed) 
              ? "The renter has already confirmed this booking. Your confirmation will complete the process and remove the car from listings." 
              : (!isCarOwner && ownerConfirmed)
                ? "The car owner has already confirmed this booking. Your confirmation will complete the process and remove the car from listings."
                : isCarOwner
                  ? "After your confirmation, you'll need to wait for the renter to confirm as well."
                  : "After your confirmation, you'll need to wait for the car owner to confirm as well."
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleCloseConfirmDialog} 
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmBooking} 
            variant="contained" 
            color="success"
            autoFocus
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
              }
            }}
          >
            {(isCarOwner && renterConfirmed) || (!isCarOwner && ownerConfirmed) ? 
              "Yes, Complete Booking" : 
              isCarOwner ? "Yes, Confirm as Car Owner" : "Yes, Confirm as Renter"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Feedback Dialog */}
      <FeedbackDialog
        open={feedbackDialogOpen}
        onClose={handleCloseFeedbackDialog}
        carId={carId}
        userId={isCarOwner ? userId : carOwnerId}
        isCarOwner={isCarOwner}
        carName={carName}
        ownerName={ownerName}
      />
    </>
  );
};

export default ConversationDialog;
