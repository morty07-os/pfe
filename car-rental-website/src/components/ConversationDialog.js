import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  Button,
  userAvatar,
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
import EventNoteIcon from '@mui/icons-material/EventNote'; // Added for availability dates
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ImageIcon from '@mui/icons-material/Image';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import FeedbackDialog from './FeedbackDialog';

const ConversationDialog = ({ open, onClose, userId, carId, conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [carName, setCarName] = useState('');
  const [carAvailabilityStart, setCarAvailabilityStart] = useState(null); // Added for availability start date
  const [carAvailabilityEnd, setCarAvailabilityEnd] = useState(null); // Added for availability end date
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isCarOwner, setIsCarOwner] = useState(false); // To determine if current user is car owner
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false); // For confirmation dialog
  const [bookingConfirmed, setBookingConfirmed] = useState(false); // To track if booking is confirmed
  const [carOwnerId, setCarOwnerId] = useState(null); // To store car owner ID
  const [ownerConfirmed, setOwnerConfirmed] = useState(false); // To track if owner confirmed
  const [renterConfirmed, setRenterConfirmed] = useState(false); // To track if renter confirmed
  const [carAvailable, setCarAvailable] = useState(true); // To track if the car is still available
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false); // For feedback dialog
  const [hasFeedback, setHasFeedback] = useState(false); // To track if user has already given feedback
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false); // To track if feedback was just submitted
  const [ownerName, setOwnerName] = useState(''); // To store the car owner's name
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // currentUserId is now set in the fetchMessages function

  // Reset confirmation states when component opens with new props
  useEffect(() => {
    if (open) {
      // Reset all confirmation states when dialog opens
      setBookingConfirmed(false);
      setOwnerConfirmed(false);
      setRenterConfirmed(false);
      setCarOwnerId(null);
      setCarAvailable(true); // Reset car availability
      
      // Check if the car still exists and is available
      const checkCarAvailability = async () => {
        try {
          const token = localStorage.getItem('token');
          const carResponse = await axios.get(
            `http://localhost:5001/api/cars/details/${carId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          // If car is deleted or not available, disable the chat
          if (carResponse.data.isDeleted) {
            setBookingConfirmed(true);
            setCarAvailable(false);
            // Send a system message if there are no messages yet
            if (messages.length === 0) {
              handleSendMessage('This car is no longer available for booking. It may have been booked by another user or removed by the owner.');
            }
          }
        } catch (error) {
          // If car doesn't exist, disable the chat
          console.error('Error checking car availability:', error);
          setBookingConfirmed(true);
          setCarAvailable(false);
        }
      };
      
      if (carId) {
        checkCarAvailability();
      }
    }
  }, [open, carId, userId, conversationId, messages.length]);

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
        
        // Use the conversationId if provided to get only messages for this specific conversation
        const endpoint = conversationId 
          ? `http://localhost:5001/api/messages/${carId}?conversationId=${conversationId}` 
          : `http://localhost:5001/api/messages/user/${userId}`;
        
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
        
        // Check if there are any confirmation messages in the conversation
        // First, we need to determine the car owner ID from the messages or car data
        let ownerId = carOwnerId;
        
        // If we don't have the owner ID yet, try to find it from the car data in messages
        if (!ownerId && response.data.length > 0) {
          // Try to find car messages with carId
          const carMessages = response.data.filter(msg => msg.carId);
          if (carMessages.length > 0) {
            // If we have car messages, check if any has carOwner property
            if (carMessages[0].carOwner) {
              ownerId = carMessages[0].carOwner;
              setCarOwnerId(ownerId);
            }
            // If not, we need to fetch the car details to get the owner
            else if (carMessages[0].carId && typeof carMessages[0].carId === 'string') {
              try {
                const carDetailResponse = await axios.get(
                  `http://localhost:5001/api/cars/details/${carMessages[0].carId}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                  }
                );
                
                if (carDetailResponse.data && carDetailResponse.data.owner) {
                  // Check if car is marked as deleted
                  if (carDetailResponse.data.isDeleted) {
                    setBookingConfirmed(true); // Disable chat input
                    setCarAvailable(false); // Mark car as unavailable
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
        
        // Now check for confirmation messages specific to this car
        // Filter messages to only include those for the current car
        const currentCarMessages = response.data.filter(msg => {
          // Check if the message has a carId that matches the current carId
          if (msg.carId && typeof msg.carId === 'string') {
            return msg.carId === carId;
          } else if (msg.carId && typeof msg.carId === 'object' && msg.carId._id) {
            return msg.carId._id === carId;
          }
          // If no carId, check if the message is part of this conversation
          return msg.conversationId === conversationId;
        });
        
        // Owner confirmation message - from the car owner
        const ownerConfirmationMsg = currentCarMessages.find(msg => 
          msg.text && msg.text.includes("I've confirmed the booking") && 
          msg.sender && ownerId && msg.sender._id === ownerId
        );
        
        // Renter confirmation message - from anyone who is not the car owner
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
        
        // If both have confirmed, set bookingConfirmed to true
        if (ownerConfirmationMsg && renterConfirmationMsg) {
          setBookingConfirmed(true);
        }
        
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
                `http://localhost:5001/api/cars/details/${firstMessage.carId}`, // Updated endpoint
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
        
        // If carId is provided directly as a prop, fetch car details
        if (carId && !carName) { // Also update carName condition if needed, but availability is primary
          try {
            const carResponse = await axios.get(
              `http://localhost:5001/api/cars/details/${carId}`, // Updated endpoint
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
              
              // Check if current user is the car owner
              if (carResponse.data.owner) {
                const owner = carResponse.data.owner;
                const ownerId = typeof owner === 'object' 
                  ? owner._id 
                  : owner;
                
                setCarOwnerId(ownerId);
                setIsCarOwner(ownerId === currentId);
                
                // Set owner name if available
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
  
  // Check if user has already given feedback - only when both parties have confirmed the booking
  useEffect(() => {
    const checkFeedbackStatus = async () => {
      // Only check feedback status if both parties have confirmed the booking
      if (!carId || !currentUserId || !bookingConfirmed || !ownerConfirmed || !renterConfirmed) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5001/api/feedback/check?carId=${carId}&userId=${currentUserId}`,
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
  
  // Function to open the confirmation dialog
  const handleOpenConfirmDialog = () => {
    setConfirmDialogOpen(true);
  };
  
  // Function to close the confirmation dialog
  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };
  
  // Function to confirm booking and delete car from listings if both parties have confirmed
  const handleConfirmBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // First, check if the car still exists
      try {
        const carCheckResponse = await axios.get(
          `http://localhost:5001/api/cars/details/${carId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        // If car doesn't exist or is marked as deleted
        if (!carCheckResponse.data || carCheckResponse.data.isDeleted) {
          alert('This car is no longer available for booking. It may have been booked by another user or removed by the owner.');
          setConfirmDialogOpen(false);
          
          // Send a system message about the car being unavailable
          await handleSendMessage('This car is no longer available for booking. It may have been booked by another user or removed by the owner.');
          
          // Update UI to show car is no longer available
          setBookingConfirmed(true);
          return;
        }
      } catch (carCheckError) {
        // If we get a 404 or other error, the car doesn't exist
        alert('This car is no longer available for booking. It may have been booked by another user or removed by the owner.');
        setConfirmDialogOpen(false);
        
        // Send a system message about the car being unavailable
        await handleSendMessage('This car is no longer available for booking. It may have been booked by another user or removed by the owner.');
        
        // Update UI to show car is no longer available
        setBookingConfirmed(true);
        return;
      }
      
      // Car exists, proceed with confirmation
      // Send a confirmation message to the chat
      const confirmationMessage = isCarOwner 
        ? `I've confirmed the booking for ${carName}. Waiting for renter confirmation.` 
        : `My booking for ${carName} has been confirmed. Waiting for owner confirmation.`;
      
      await handleSendMessage(confirmationMessage);
      
      // Update state based on who confirmed
      if (isCarOwner) {
        setOwnerConfirmed(true);
      } else {
        setRenterConfirmed(true);
      }
      
      // Check if both parties have now confirmed for this specific car
      const bothConfirmed = (isCarOwner && renterConfirmed) || (!isCarOwner && ownerConfirmed);
      console.log(`Confirmation status for car ${carId} (${carName}):`, { 
        isCarOwner, 
        ownerConfirmed, 
        renterConfirmed, 
        bothConfirmed 
      });
      
      // If both have confirmed, delete the car and notify other users
      if (bothConfirmed) {
        try {
          // 1. Call API to delete car from listings
          const deleteResponse = await axios.delete(
            `http://localhost:5001/api/cars/delete/${carId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          // 2. Send a final confirmation message to this conversation
          const finalMessage = `Booking for ${carName} has been confirmed by both parties. The car has been removed from listings.`;
          await handleSendMessage(finalMessage);
          
          // 3. Notify all other conversations about this car that it's no longer available
          try {
            // Get all conversations for this car
            const conversationsResponse = await axios.get(
              `http://localhost:5001/api/messages/car-conversations/${carId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );
            
            // If the endpoint doesn't exist yet, we'll catch the error and continue
            if (conversationsResponse.data && conversationsResponse.data.length > 0) {
              // For each conversation that's not the current one, send a notification
              const otherConversations = conversationsResponse.data.filter(
                conv => conv.conversationId !== conversationId
              );
              
              // Send notifications to all other conversations
              for (const conv of otherConversations) {
                try {
                  await axios.post(
                    'http://localhost:5001/api/messages/save',
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
            // If the endpoint doesn't exist, just log it and continue
            console.log('Could not notify other conversations:', notifyError);
          }
          
          // 4. Update state to show booking is confirmed
          setBookingConfirmed(true);
          
          // 5. Notify the user of success
          alert('Booking confirmed by both parties! The car has been removed from listings.');
        } catch (error) {
          console.error('Error during car booking confirmation:', error);
          alert(`Error confirming booking: ${error.message}`);
        }
      } else {
        // Notify the user that they need to wait for the other party
        alert(isCarOwner 
          ? 'Your confirmation has been recorded. Waiting for renter to confirm.' 
          : 'Your confirmation has been recorded. Waiting for owner to confirm.');
      }
      
      setConfirmDialogOpen(false);
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert(`Error confirming booking: ${error.message}`);
      setConfirmDialogOpen(false);
    }
  };
  
  // Function to send a system message
  const handleSendMessage = async (text = null) => {
    const messageText = text || newMessage.trim();
    if (!messageText && !selectedImage) return;
    
    try {
      const token = localStorage.getItem('token');
      
      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append('receiver', userId);
      formData.append('text', messageText || 'Image sent');
      if (carId) {
        formData.append('carId', carId);
      }
      
      // Add conversationId if provided
      if (conversationId) {
        formData.append('conversationId', conversationId);
      }
      
      // Append image if selected
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      
      const response = await axios.post(
        'http://localhost:5001/api/messages/save',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      // Add message to the list with current timestamp and proper sender format
      const newMsg = {
        text: messageText || 'Image sent',
        createdAt: new Date().toISOString(),
        sender: { _id: currentUserId }
      };
      
      // If we have an image preview, add it to the local message
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
                // Check if it's a system message
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
                
                // Regular user message
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
                    {message.image && (
                      <Box sx={{ mt: 1, maxWidth: '100%' }}>
                        <img 
                          src={message.image.startsWith('data:') 
                            ? message.image 
                            : `http://localhost:5001/${message.image}`
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
          
          <Box sx={{ display: 'flex', gap: 1 }}>
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
                  sx={{
                    bgcolor: bookingConfirmed ? '#f8f9fa' : '#fff',
                    border: '1px solid #e2e8f0',
                    '&:hover': {
                      bgcolor: bookingConfirmed ? '#f8f9fa' : '#f1f5f9',
                    }
                  }}
                >
                  <PhotoCameraIcon color={bookingConfirmed ? "disabled" : "inherit"} />
                </IconButton>
              </span>
            </Tooltip>
            
            <TextField
              fullWidth
              size="small"
              placeholder={bookingConfirmed ? "This car has been booked and is no longer available" : "Type your message..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={bookingConfirmed}
              sx={{ 
                bgcolor: bookingConfirmed ? '#f8f9fa' : '#fff', 
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: bookingConfirmed ? '#ddd' : '#3498db',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: bookingConfirmed ? '#ddd' : '#000',
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
                bgcolor: bookingConfirmed ? '#cbd5e1' : '#000',
                '&:hover': {
                  bgcolor: bookingConfirmed ? '#cbd5e1' : '#333',
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
          
          {/* Warning message when car is no longer available */}
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
          
          {/* Confirm Booking Button - shown for both owner and renter if they haven't confirmed yet */}
          {carId && !bookingConfirmed && carAvailable && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: 1,
              mt: 2, 
              mb: 1,
              px: 2
            }}>
              {/* Status indicators for both parties */}
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
              
              {/* Confirm button - only show if the current user hasn't confirmed yet */}
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
          
          {/* Show final confirmation message if booking is confirmed by both parties */}
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
                {" This car has been removed from listings."}
              </Typography>
              
              {/* Rate and Feedback Button - Only show when both parties have confirmed the booking */}
              {(ownerConfirmed && renterConfirmed) && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
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
                        bgcolor: '#000',
                        '&:hover': {
                          bgcolor: '#333',
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
                </Box>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      
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
        // If current user is the car owner, rate the other user (renter)
        // If current user is the renter, rate the car owner
        userId={isCarOwner ? userId : carOwnerId}
        isCarOwner={isCarOwner}
        carName={carName}
        ownerName={ownerName}
      />
    </Dialog>
  );
};

export default ConversationDialog;
