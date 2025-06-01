import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableRow, Paper, Avatar, Snackbar, Alert, CircularProgress, Skeleton } from '@mui/material';

import { useNavigate, useParams } from 'react-router-dom';

// API URL
const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';

export default function OfferDetailsPage() {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Fetch offer data from API
  useEffect(() => {
    const fetchOfferDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiUrl}/api/cars/${offerId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch offer details');
        }
        
        const data = await response.json();
        setOffer(data);
      } catch (err) {
        console.error('Error fetching offer details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOfferDetails();
  }, [offerId]);

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', my: 4, p: 2 }}>
        <Skeleton variant="text" width="70%" height={60} sx={{ mb: 2 }} />
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width="30%" height={30} sx={{ mb: 1 }} />
          <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, pb: 1 }}>
            <Skeleton variant="rectangular" width={260} height={180} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" width={260} height={180} sx={{ borderRadius: 2 }} />
          </Box>
        </Box>
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 3, borderRadius: 1 }} />
        <Skeleton variant="rectangular" width="100%" height={150} sx={{ mb: 3, borderRadius: 1 }} />
        <Skeleton variant="rectangular" width="100%" height={50} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  // Show error state
  if (error || !offer) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', my: 4, p: 2, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2, bgcolor: '#475569', color: 'white', '& .MuiAlert-icon': { color: 'white' } }}>
          {error || 'Offer not found'}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/offers')}
          sx={{ 
            mt: 2, 
            bgcolor: '#475569',
            '&:hover': { bgcolor: '#334155' } 
          }}
        >
          Back to Offers
        </Button>
      </Box>
    );
  }

  // Format data for display
  const details = [
    ['Brand', offer.brand || 'N/A'],
    ['Price (DZD)', offer.price || 'N/A'],
    ['Location', offer.wilaya || offer.location || 'N/A'],
    ['Seats', offer.seats || 'N/A'],
    ['Doors', offer.doors || 'N/A'],
    ['Energy', offer.energy || 'N/A'],
    ['Transmission', offer.transmission || 'N/A'],
    ['Car Type', offer.carType || offer.category || 'N/A']
  ];

  // Get poster info - structure may vary based on your API
  const posterName = offer.owner?.name || offer.poster?.name || 'N/A';
  const posterLocation = offer.owner?.location || offer.poster?.location || offer.wilaya || 'N/A';
  const posterPhone = offer.owner?.phone || offer.poster?.phone || 'N/A';
  
  const posterDetails = [
    ['Name', posterName],
    ['Location', posterLocation],
    ['Phone', posterPhone],
  ];

  const isAuthenticated = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      // Verify token is a valid JWT format (basic check)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        return false;
      }
      
      // Check if token is expired
      try {
        const payload = JSON.parse(atob(tokenParts[1]));
        if (payload.exp && payload.exp < Date.now() / 1000) {
          return false;
        }
      } catch (e) {
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleBookNow = () => {
    if (!isAuthenticated()) {
      // Show login prompt
      setSnackbar({
        open: true,
        message: 'Please sign in to continue booking',
        severity: 'info'
      });
      // Redirect to home page after a short delay (where login is available)
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } else {
      // Get the poster/owner name from the available data
      const chatRecipient = offer.poster?.name || offer.owner?.name || 'owner';
      const carId = offer.id || offer._id;
      
      // Navigate to chat and send message automatically
      navigate(`/chat/${chatRecipient}`, { 
        state: { 
          autoMessage: 'I want to book this car', 
          offerId: carId 
        } 
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', my: 4, p: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, color: '#475569' }}>
        {offer.title || `${offer.brand || ''} ${offer.model || ''} ${offer.year || ''}`}
      </Typography>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ color: '#475569', fontWeight: 700, mb: 1 }}>Images</Typography>
        <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, pb: 1 }}>
          {/* Handle different image data structures */}
          {(offer.images || offer.photos || []).map((img, idx) => {
            // Handle both string images and object images with url property
            const imgSrc = typeof img === 'string' ? img : (img?.url || img?.src || '');
            return (
              <Box key={idx} sx={{ 
                minWidth: 260, 
                height: 180, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                bgcolor: '#eceff1', 
                borderRadius: 2, 
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)' 
              }}>
                <img 
                  src={imgSrc} 
                  alt={`${offer.brand || ''} ${offer.model || ''} ${idx + 1}`} 
                  style={{ 
                    maxHeight: 160, 
                    maxWidth: 240, 
                    borderRadius: 12,
                    objectFit: 'cover' 
                  }} 
                />
              </Box>
            );
          })}
          
          {/* Show placeholder if no images */}
          {(!offer.images && !offer.photos || (offer.images || offer.photos || []).length === 0) && (
            <Box sx={{ 
              minWidth: 260, 
              height: 180, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              bgcolor: '#eceff1', 
              borderRadius: 2, 
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)' 
            }}>
              <Typography sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                No images available
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableBody>
            {details.map(([label, value]) => (
              <TableRow key={label}>
                <TableCell sx={{ fontWeight: 700, color: '#475569', width: 120 }}>{label}</TableCell>
                <TableCell>{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#475569', mb: 1 }}>Poster Info</Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell rowSpan={3} sx={{ width: 80 }}>
                <Avatar 
                  src={offer.poster?.avatar || offer.owner?.avatar || ''} 
                  sx={{ width: 56, height: 56, bgcolor: '#475569' }}
                >
                  {(posterName && posterName[0]) || 'U'}
                </Avatar>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Name</TableCell>
              <TableCell>{posterName}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Location</TableCell>
              <TableCell>{posterLocation}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Phone</TableCell>
              <TableCell>{posterPhone}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Book Now Button */}
      <Button
        variant="contained"
        fullWidth
        onClick={handleBookNow}
        sx={{
          mt: 2,
          py: 1.5,
          bgcolor: '#475569',
          color: 'white',
          fontWeight: 700,
          borderRadius: 2,
          boxShadow: '0 4px 6px rgba(71, 85, 105, 0.1)',
          '&:hover': {
            bgcolor: '#334155',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 10px rgba(71, 85, 105, 0.2)',
          },
          transition: 'all 0.3s ease'
        }}
      >
        Book Now
      </Button>

      {/* Snackbar for login prompt */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            bgcolor: '#475569',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
