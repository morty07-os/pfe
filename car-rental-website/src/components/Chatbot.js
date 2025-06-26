import React, { useState, useEffect, useRef } from 'react';
import { IconButton, Drawer, Box, TextField, Button, Typography } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatboxRef = useRef(null);

  // Simple chatbot responses dictionary
  const responses = {
    "what cars do you have": "We offer sedans, SUVs, vans, and more. You can browse all available vehicles under the 'All Offers' section. Would you like me to guide you there?",
    "how much is a rental": "Rental prices start at 3000 DZD/day for sedans and vary based on car type, duration, and location. Check the 'All Offers' page for detailed pricing or search by your dates and location in Algeria.",
    "how do i book a car": "To book a car, search for available vehicles on the homepage or 'All Offers' page, select your preferred car, choose your rental dates, and confirm the booking. You’ll need an account to complete the reservation.",
    "do you offer insurance": "Yes, we provide optional insurance starting at 1000 DZD/day. You can add it during the booking process for extra protection.",
    "hi": "Hello! How can I help you with your car rental needs in Algeria today? I can assist with booking, account questions, or anything related to our website.",
    "hello": "Hi there! How can I assist you with renting a car or navigating our Algerian car rental website?",
    "bye": "Goodbye! Feel free to return if you have more questions about car rentals or our services in Algeria.",
    "thank you": "You're welcome! Let me know if you have any other questions about our website or services in Algeria.",
    "how to create account": "To create an account, click on 'Sign Up' in the top right corner of our website. Fill in your details like name, email, and password, then verify your email to complete registration.",
    "how to login": "To log in, click on 'Sign In' in the top right corner, enter your email and password, then click submit. If you’ve forgotten your password, use the 'Forgot Password' option to reset it.",
    "forgot password": "If you’ve forgotten your password, click 'Sign In' then 'Forgot Password'. Enter your email, and we’ll send you a link to reset your password.",
    "how to list car": "To list your car for rent, log in to your account, go to 'Add Car' from your profile menu, fill in the car details, upload photos, set availability and pricing, then submit for approval.",
    "car approval process": "After listing your car, it goes through an admin approval process to ensure it meets our standards. This usually takes 24-48 hours. You’ll be notified once it’s approved or if any changes are needed.",
    "how to edit profile": "To edit your profile, log in, click on your profile icon, select 'Edit Profile', update your information like name, phone, or photo, then save changes.",
    "payment methods": "We accept various payment methods including credit cards, debit cards, and local payment options in Algeria. Payment is processed securely during booking confirmation.",
    "refund policy": "Refunds depend on the cancellation policy of your booking. Generally, full refunds are available if cancelled 48 hours before pickup. Check your booking details or contact support for specific cases.",
    "how to contact support": "For support, you can use the 'Contact Us' page on our website to send a message, or check the FAQ section for common queries. We’re available to assist with any issues in Algeria.",
    "pickup locations": "We have multiple pickup locations across Algerian cities like Algiers, Oran, Constantine, and more. During booking, you can select the nearest location or search by area on the map.",
    "how to cancel booking": "To cancel a booking, go to your profile, find the booking under 'My Rentals', and click 'Cancel'. Note that cancellation policies and potential fees may apply based on timing.",
    "rental duration": "Rental durations can range from a minimum of 1 day to several weeks. You can set your preferred dates during the booking process. For long-term rentals, contact support for special rates.",
    "car features": "Our cars come with various features like GPS, air conditioning, child seats, and more. Specific features are listed on each car’s detail page. You can filter for desired features on the 'All Offers' page.",
    "account verification": "After signing up, you’ll need to verify your email. For full account approval, admin verification may be required, especially for car owners. This ensures security for all users.",
    "ratings reviews": "You can rate and review cars or renters after a rental is complete. Go to your profile, find the completed booking, and submit your feedback to help others in our community.",
    "special deals": "Check out our 'Deals' page for current promotions and special offers on car rentals in Algeria. Discounts may apply based on rental duration, location, or seasonal offers.",
    "map search": "Use the 'Map' feature on our website to visually search for cars near your location in Algeria. Click on map markers to see car details and availability.",
    "filter cars": "On the 'All Offers' page, use the sidebar filters to narrow down cars by price, type, features, location in Algeria, and more. Apply filters to see the most relevant options."
  };

  const defaultResponse = "I'm sorry, I didn't understand that. Could you please rephrase or ask something else about car rentals?";

  // Scroll to the bottom of chat on new messages
  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() === '') return;

    // Add user message
    setMessages([...messages, { sender: 'You', text: input }]);

    // Get bot response
    let response = defaultResponse;
    const inputLower = input.toLowerCase().trim();
    for (let key in responses) {
      if (inputLower.includes(key)) {
        response = responses[key];
        break;
      }
    }

    // Add bot response
    setMessages(prevMessages => [...prevMessages, { sender: 'Bot', text: response }]);
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <>
      <IconButton 
        onClick={() => setIsOpen(true)} 
        sx={{ 
          position: 'fixed', 
          bottom: 20, 
          right: 20, 
          bgcolor: '#546e7a', 
          color: 'white',
          '&:hover': { bgcolor: '#455a64' }, 
          width: 70,
          height: 70,
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(84, 110, 122, 0.3)', 
          zIndex: 1000,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
          '&:hover': { 
            transform: 'scale(1.15) rotate(5deg)', 
            boxShadow: '0 12px 20px rgba(0, 0, 0, 0.4), 0 0 0 4px rgba(84, 110, 122, 0.5)' 
          },
          animation: 'pulse 3s infinite ease-in-out', 
          '@keyframes pulse': {
            '0%': { boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(84, 110, 122, 0.3)' },
            '50%': { boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3), 0 0 0 6px rgba(84, 110, 122, 0.1)' },
            '100%': { boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(84, 110, 122, 0.3)' }
          }
        }}
      >
        <ChatIcon fontSize="large" sx={{ animation: 'wiggle 0.5s ease-in-out infinite alternate', '@keyframes wiggle': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(10deg)' } } }} />
      </IconButton>

      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 360, 
            height: '92vh',
            top: '4vh',
            borderTopLeftRadius: 24,
            borderBottomLeftRadius: 24,
            background: 'linear-gradient(145deg, #f9f9f9 0%, #f0f0f0 100%)', 
            color: '#263238',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.25), -2px 0 10px rgba(0, 0, 0, 0.1)', 
            p: 3.5, 
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
            borderLeft: '1px solid rgba(84, 110, 122, 0.2)' 
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, borderBottom: '1px solid rgba(224, 224, 224, 0.5)', pb: 1.5, background: 'linear-gradient(to right, transparent, rgba(84, 110, 122, 0.05), transparent)', borderRadius: 1 }}>
          <Typography variant="h6" sx={{ color: '#546e7a', fontWeight: 'bold', fontSize: '1.4rem', letterSpacing: '1px', textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>Car Rental Assistant</Typography>
          <IconButton onClick={() => setIsOpen(false)} sx={{ color: '#78909c', transition: 'all 0.3s ease', '&:hover': { color: '#455a64', transform: 'rotate(90deg)' } }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box 
          ref={chatboxRef} 
          sx={{ 
            flex: 1, 
            overflowY: 'auto', 
            border: 'none',
            borderRadius: 4,
            background: 'linear-gradient(to bottom, #ffffff 0%, #f9f9f9 100%)', 
            p: 3.5,
            mb: 2.5,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'inset 0 3px 6px rgba(0, 0, 0, 0.05), inset 0 -3px 6px rgba(0, 0, 0, 0.05)',
            '&::-webkit-scrollbar': { width: '8px', backgroundColor: 'rgba(0, 0, 0, 0.05)', borderRadius: '10px' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: '#b0bec5', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            transition: 'background 0.3s ease'
          }}
        >
          {messages.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 8, fontStyle: 'italic', color: '#78909c', animation: 'fadeInSlow 1s ease-out', '@keyframes fadeInSlow': { '0%': { opacity: 0 }, '100%': { opacity: 1 } } }}>
              Start a conversation by typing a message.
            </Typography>
          ) : (
            messages.map((msg, index) => (
              <Box 
                key={index} 
                sx={{ 
                  mb: 2.5,
                  alignSelf: msg.sender === 'You' ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  bgcolor: msg.sender === 'You' ? 'linear-gradient(135deg, #546e7a 0%, #455a64 100%)' : 'linear-gradient(135deg, #eceff1 0%, #e0e0e0 100%)', 
                  color: msg.sender === 'You' ? 'white' : '#263238',
                  borderRadius: msg.sender === 'You' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                  p: 2.5,
                  boxShadow: msg.sender === 'You' ? '0 3px 8px rgba(69, 90, 100, 0.3)' : '0 3px 8px rgba(0, 0, 0, 0.15)', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: 0,
                  transform: msg.sender === 'You' ? 'translateX(20px)' : 'translateX(-20px)', 
                  animation: 'slideIn 0.3s forwards', 
                  '@keyframes slideIn': { '0%': { opacity: 0 }, '100%': { opacity: 1, transform: 'translateX(0)' } },
                  animationDelay: `${index * 0.05}s`, 
                  position: 'relative', 
                  '&:before': { 
                    content: '""',
                    position: 'absolute',
                    width: 0,
                    height: 0,
                    borderStyle: 'solid',
                    ...(msg.sender === 'You' ? {
                      right: '-10px',
                      top: 0,
                      borderWidth: '10px 0 0 10px',
                      borderColor: 'transparent transparent transparent #546e7a'
                    } : {
                      left: '-10px',
                      top: 0,
                      borderWidth: '10px 10px 0 0',
                      borderColor: 'transparent #eceff1 transparent transparent'
                    })
                  },
                  '&:hover': {
                    transform: 'translateY(-2px)', 
                    boxShadow: msg.sender === 'You' ? '0 5px 12px rgba(69, 90, 100, 0.4)' : '0 5px 12px rgba(0, 0, 0, 0.25)'
                  }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.8, fontSize: '0.9rem', color: msg.sender === 'You' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(38, 50, 56, 0.9)' }}>{msg.sender}:</Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.5, fontSize: '0.95rem' }}>{msg.text}</Typography>
              </Box>
            ))
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, backgroundColor: 'white', p: 2.5, borderRadius: 4, boxShadow: '0 -3px 12px rgba(0, 0, 0, 0.08)', transition: 'box-shadow 0.3s ease', '&:hover': { boxShadow: '0 -5px 16px rgba(0, 0, 0, 0.1)' } }}>
          <TextField 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question..."
            variant="outlined"
            size="small"
            sx={{ 
              flex: 1,
              transition: 'all 0.3s ease',
              '& .MuiOutlinedInput-root': {
                borderRadius: 4,
                backgroundColor: '#f5f5f5',
                transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: '#546e7a',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#546e7a',
                  borderWidth: '2px',
                  boxShadow: '0 0 0 3px rgba(84, 110, 122, 0.2)' 
                },
                '& input': {
                  padding: '12px 16px',
                  fontSize: '0.95rem',
                  transition: 'color 0.3s ease',
                  '&:focus': { color: '#546e7a', fontWeight: '500' }
                },
                '&:hover': {
                  backgroundColor: '#f0f0f0'
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(84, 110, 122, 0.15)'
                }
              }
            }}
          />
          <Button 
            onClick={sendMessage} 
            variant="contained" 
            size="small"
            sx={{ 
              backgroundColor: '#546e7a',
              '&:hover': { backgroundColor: '#3d4f58', transform: 'translateY(-1px)', boxShadow: '0 4px 10px rgba(69, 90, 100, 0.4)' },
              borderRadius: 4,
              padding: '0 24px',
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: '0 3px 8px rgba(69, 90, 100, 0.3)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              fontSize: '0.95rem',
              position: 'relative',
              overflow: 'hidden',
              '&:after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                transition: '0.5s'
              },
              '&:hover:after': {
                left: '100%'
              }
            }}
          >
            Send
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default Chatbot;
