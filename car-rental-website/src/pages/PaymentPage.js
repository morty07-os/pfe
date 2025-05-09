import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Container,
  CircularProgress,
  Alert,
  Grid,
  TextField,
  CardMedia
} from '@mui/material';
import Navbar from '../components/Navbar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import dayjs from 'dayjs';

export default function PaymentPage() {
  const { carId } = useParams(); // Or bookingId
  const location = useLocation();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed
  const [loadingDetails, setLoadingDetails] = useState(true);

  useEffect(() => {
    if (location.state) {
      setCar(location.state.car);
      setBookingDetails(location.state.bookingDetails);
      setLoadingDetails(false);
    } else {
      // Fetch details if not in state (e.g. page refresh)
      // This is a placeholder, in a real app you'd fetch by an ID
      console.warn("Payment details not found in location state.");
      setLoadingDetails(false); 
      // Potentially redirect or show error
    }
  }, [location.state]);

  const handlePaymentSubmit = async () => {
    setPaymentStatus('processing');
    // Simulate API call for payment
    // And then call backend to confirm booking
    try {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Simulate booking confirmation API call
        // const response = await fetch(`http://localhost:5001/api/bookings/confirm`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json', /* Authorization headers */ },
        //   body: JSON.stringify({ 
        //       carId: car._id, 
        //       startDate: bookingDetails.startDate, // Ensure these are in correct format for backend
        //       endDate: bookingDetails.endDate, 
        //       totalCost: bookingDetails.totalCost 
        //   }),
        // });

        // if (!response.ok) {
        //   throw new Error('Failed to confirm booking with backend.');
        // }
        // const confirmationData = await response.json();
        // console.log("Booking confirmed:", confirmationData);

        setPaymentStatus('success');

    } catch (error) {
        console.error("Payment or booking confirmation failed:", error);
        setPaymentStatus('failed');
    }
  };

  const handleGoBack = () => {
    // Navigate back to chat or booking page, depending on flow
    navigate(`/chat/${carId}`, { state: { car, ...bookingDetails } });
  };
  
  if (loadingDetails) {
    return (
      <>
        <Navbar />
        <Container sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading payment details...</Typography>
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
            Payment details are missing.
          </Typography>
          <Typography color="text.secondary">
            Unable to proceed with payment. Please try the booking process again.
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 2 }}>
            Return to Homepage
          </Button>
        </Container>
      </>
    );
  }


  return (
    <>
      <Navbar />
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="sm">
          <Button 
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
            sx={{ 
              mb: 2, 
              color: '#475569',
              fontWeight: 500,
              '&:hover': { 
                bgcolor: 'rgba(71, 85, 105, 0.08)',
              },
            }}
            disabled={paymentStatus === 'processing'}
          >
            Back to Chat
          </Button>

          <Paper elevation={3} sx={{ p: {xs: 2, sm:3}, borderRadius: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1e293b', textAlign: 'center', mb: 3 }}>
              Secure Payment
            </Typography>

            {paymentStatus === 'pending' && (
              <>
                <Box sx={{ mb: 3, p:2, background: '#eef2ff', borderRadius: 2, border: '1px solid #c7d2fe' }}>
                    <Typography variant="h6" sx={{fontWeight: 600, color: '#3730a3'}}>{car.carName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {bookingDetails.startDate} to {bookingDetails.endDate} ({bookingDetails.numDays} days)
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#4338ca', mt:1 }}>
                        Total: €{bookingDetails.totalCost.toFixed(2)}
                    </Typography>
                </Box>
              
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
                  Enter Payment Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Cardholder Name" variant="outlined" />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Card Number" variant="outlined" placeholder="0000 0000 0000 0000"/>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Expiry Date" variant="outlined" placeholder="MM/YY"/>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="CVV" variant="outlined" placeholder="123"/>
                  </Grid>
                </Grid>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<LockIcon />}
                  onClick={handlePaymentSubmit}
                  sx={{ 
                    mt: 3, 
                    py: 1.5, 
                    fontWeight: 600,
                    background: 'linear-gradient(90deg, #16a34a 0%, #22c55e 100%)',
                    '&:hover': {
                        background: 'linear-gradient(90deg, #15803d 0%, #16a34a 100%)',
                    }
                  }}
                >
                  Pay €{bookingDetails.totalCost.toFixed(2)} Securely
                </Button>
              </>
            )}

            {paymentStatus === 'processing' && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2, color: '#475569' }}>
                  Processing your payment...
                </Typography>
                <Typography sx={{ color: '#64748b' }}>Please do not refresh or close the page.</Typography>
              </Box>
            )}

            {paymentStatus === 'success' && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 70, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.dark', mb:1 }}>
                  Payment Successful!
                </Typography>
                <Typography sx={{ color: '#334155', mb:3 }}>
                  Your booking for the {car.carName} is confirmed. You will receive an email shortly.
                </Typography>
                <Button 
                    variant="contained" 
                    onClick={() => navigate('/profile')} // Navigate to user's bookings or profile
                    sx={{
                        background: 'linear-gradient(90deg, #1e293b 0%, #475569 100%)',
                        '&:hover': {
                            background: 'linear-gradient(90deg, #0f172a 0%, #334155 100%)',
                        }
                    }}
                >
                  View My Bookings
                </Button>
              </Box>
            )}

            {paymentStatus === 'failed' && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Alert severity="error" sx={{ mb: 3, justifyContent: 'center' }}>
                  Payment Failed. Please check your card details or try a different payment method.
                </Alert>
                <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={() => setPaymentStatus('pending')}
                    sx={{ mr: 1 }}
                >
                  Try Again
                </Button>
                <Button 
                    variant="text" 
                    onClick={handleGoBack}
                >
                  Back to Chat
                </Button>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    </>
  );
}
