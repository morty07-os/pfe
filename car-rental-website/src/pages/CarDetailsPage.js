import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  CardMedia,
  CardContent,
  Button,
  Container,
  Paper, 
  Chip,
  Avatar,
  Divider,
  Skeleton,
  useMediaQuery,
  useTheme,
  Fade,
  IconButton,
  Tooltip,
  Link,
  Alert, // Import Alert component
  Rating // Import Rating component
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; // ADDED IMPORT
import RnF_user from '../components/RnF_user';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import SettingsIcon from '@mui/icons-material/Settings';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import SpeedIcon from '@mui/icons-material/Speed';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import dayjs from 'dayjs';
import Navbar from '../components/Navbar';
import axios from 'axios'; // Import axios
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'; // Import FormatQuoteIcon

export default function CarDetailsPage() {
  const { carId } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwnCar, setIsOwnCar] = useState(false);
  const [userRatingDialogOpen, setUserRatingDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState('');

  // New state for owner's ratings and feedback
  const [ownerAverageRating, setOwnerAverageRating] = useState(0);
  const [ownerTotalReviews, setOwnerTotalReviews] = useState(0);
  const [ownerFeedbacks, setOwnerFeedbacks] = useState([]);
  const [ownerRatingsLoading, setOwnerRatingsLoading] = useState(false);
  const [ownerRatingsError, setOwnerRatingsError] = useState(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const navigate = useNavigate();

  // Get appropriate fuel icon based on energy type
  const getFuelIcon = (energyType) => {
    if (!energyType) return <LocalGasStationIcon />;
    
    const type = energyType.toLowerCase();
    if (type.includes('electric') || type.includes('hybrid')) {
      return <ElectricCarIcon sx={{ color: '#10b981' }} />;
    } else if (type.includes('diesel')) {
      return <LocalGasStationIcon sx={{ color: '#6366f1' }} />;
    } else {
      return <LocalGasStationIcon sx={{ color: '#f59e0b' }} />;
    }
  };
  
  // Handle image navigation
  const handleImageChange = (index) => {
    setSelectedImageIndex(index);
  };
  
  const handlePrevImage = () => {
    if (!car?.images?.length) return;
    setSelectedImageIndex((prev) => 
      prev === 0 ? car.images.length - 1 : prev - 1
    );
  };
  
  const handleNextImage = () => {
    if (!car?.images?.length) return;
    setSelectedImageIndex((prev) => 
      prev === car.images.length - 1 ? 0 : prev + 1
    );
  };

  // Fetch current user from localStorage
  useEffect(() => {
    const fetchCurrentUser = () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Fetch user data from API
        fetch('http://localhost:5001/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(response => response.json())
          .then(data => {
            if (data && data._id) {
              setCurrentUser(data);
            }
          })
          .catch(err => console.error('Error fetching current user:', err));
      } catch (error) {
        console.error('Error getting user from localStorage:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5001/api/cars/details/${carId}`);
        const data = response.data;
        setCar(data);
        
        // Check if the car belongs to the current user
        if (currentUser && data.owner) {
          // Compare owner ID with current user ID
          const ownerId = typeof data.owner === 'string' ? data.owner : data.owner._id;
          const isOwner = ownerId === currentUser._id;
          setIsOwnCar(isOwner);

          // Fetch owner's ratings and average rating
          setOwnerRatingsLoading(true);
          setOwnerRatingsError(null);
          try {
            const token = localStorage.getItem('token');
            const ownerRatingsResponse = await axios.get(
              `http://localhost:5001/api/ratings/user/${ownerId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setOwnerFeedbacks(ownerRatingsResponse.data || []);

            const ownerAverageRatingResponse = await axios.get(
              `http://localhost:5001/api/ratings/average/user/${ownerId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setOwnerAverageRating(ownerAverageRatingResponse.data.averageRating || 0);
            setOwnerTotalReviews(ownerAverageRatingResponse.data.totalRatings || 0);
          } catch (ratingsError) {
            console.error('Error fetching owner ratings:', ratingsError);
            setOwnerRatingsError('Failed to load owner ratings.');
          } finally {
            setOwnerRatingsLoading(false);
          }
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching car details:', error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [carId, currentUser]);

  // Go back to previous page
  const handleGoBack = () => {
    navigate(-1);
  };
  
  // Open user rating dialog
  const handleOpenUserRatingDialog = (userId, userName) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setUserRatingDialogOpen(true);
  };
  
  // Close user rating dialog
  const handleCloseUserRatingDialog = () => {
    setUserRatingDialogOpen(false);
  };

  if (loading) {
    return (
      <>
        <Navbar sx={{ backgroundColor: '#111', color: '#fff' }} iconColor="#fff" />
        <Box sx={{ 
          bgcolor: '#f8fafc', 
          minHeight: '100vh', 
          pt: 4, 
          pb: 8 
        }}>
          <Container maxWidth="lg">
            <Button 
              startIcon={<ArrowBackIcon />}
              onClick={handleGoBack}
              sx={{ 
                mb: 3, 
                color: '#475569',
                '&:hover': { bgcolor: 'rgba(71, 85, 105, 0.08)' }
              }}
            >
              Back to results
            </Button>
            
            <Paper
              elevation={2}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(71, 85, 105, 0.12)',
              }}
            >
              <Box sx={{ 
                background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                p: 3,
                color: 'white',
              }}>
                <Skeleton variant="text" width="60%" height={40} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                <Skeleton variant="text" width="20%" height={30} sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.1)' }} />
              </Box>
              
              <Box sx={{ p: 3 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
                    <Box sx={{ display: 'flex', gap: 2, mt: 2, overflowX: 'auto', pb: 1 }}>
                      {[1, 2, 3, 4].map((_, index) => (
                        <Skeleton key={index} variant="rectangular" width={80} height={80} sx={{ borderRadius: 2 }} />
                      ))}
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      {[1, 2, 3, 4].map((_, index) => (
                        <Grid item xs={6} key={index}>
                          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
                        </Grid>
                      ))}
                    </Grid>
                    
                    {[1, 2, 3].map((_, index) => (
                      <Skeleton 
                        key={index}
                        variant="rectangular" 
                        height={80} 
                        sx={{ borderRadius: 2, mt: 2 }} 
                      />
                    ))}
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Container>
        </Box>
      </>
    );
  }
  
  if (error || !car) {
    return (
      <>
        <Navbar sx={{ backgroundColor: '#111', color: '#fff' }} iconColor="#fff" />
        <Box sx={{ 
          bgcolor: '#f8fafc', 
          minHeight: '100vh', 
          pt: 4, 
          pb: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Paper
            elevation={2}
            sx={{
              p: 4,
              borderRadius: 3,
              textAlign: 'center',
              maxWidth: 500,
              mx: 'auto',
              mt: 4
            }}
          >
            <DirectionsCarIcon sx={{ fontSize: 60, color: '#94a3b8', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#1e293b' }}>
              Car Not Found
            </Typography>
            <Typography sx={{ color: '#64748b', mb: 3 }}>
              {error || "We couldn't find the car you're looking for. It may have been removed or the link is incorrect."}
            </Typography>
            <Button
              variant="contained"
              onClick={handleGoBack}
              sx={{
                borderRadius: 99,
                background: 'linear-gradient(90deg, #1e293b 0%, #475569 100%)',
                color: '#fff',
                fontWeight: 600,
                py: 1,
                px: 3,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(90deg, #0f172a 0%, #334155 100%)',
                },
              }}
            >
              Go Back
            </Button>
          </Paper>
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar sx={{ backgroundColor: '#111', color: '#fff' }} iconColor="#fff" />
      <Box sx={{ 
        bgcolor: '#f8fafc', 
        minHeight: '100vh', 
        pt: 4, 
        pb: 8 
      }}>
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
            Back to results
          </Button>
          
          <Fade in={true} timeout={500}>
            <Paper
              elevation={2}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(71, 85, 105, 0.12)',
              }}
            >
              <Box sx={{ 
                background: isOwnCar 
                  ? 'linear-gradient(135deg, #991b1b 0%, #b91c1c 100%)' 
                  : 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                p: { xs: 2.5, sm: 3 },
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '30%',
                  height: '100%',
                  background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 100%)',
                  transform: 'skewX(-15deg)',
                  display: { xs: 'none', md: 'block' }
                }
              }}>
                {isOwnCar && (
                  <Chip
                    icon={<CheckCircleIcon sx={{ color: 'white !important' }} />}
                    label="Your Car Listing"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600,
                      mb: 2,
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                )}
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: 'white',
                    fontSize: { xs: '1.75rem', sm: '2.125rem' },
                  }}
                >
                  {car.carName}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={car.brand} 
                    size="small" 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      fontWeight: 600,
                      '& .MuiChip-label': { px: 1 }
                    }} 
                  />
                  {car.year && (
                    <Chip 
                      label={car.year} 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.15)', 
                        color: 'white',
                        fontWeight: 600,
                        '& .MuiChip-label': { px: 1 }
                      }} 
                    />
                  )}
                  {car.transmission && (
                    <Chip 
                      icon={<SettingsIcon sx={{ color: 'white !important', fontSize: '0.85rem' }} />}
                      label={car.transmission} 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.15)', 
                        color: 'white',
                        fontWeight: 600,
                        '& .MuiChip-label': { px: 1 }
                      }} 
                    />
                  )}
                </Box>
              </Box>

              <Box sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#fff' }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: '#374151', mb: 1.5, display: 'flex', alignItems: 'center' }}>
                  <InfoOutlinedIcon sx={{ mr: 1, color: 'inherit', fontSize: '1.3rem' }} /> About this Car
                </Typography>
                <Paper elevation={0} sx={{
                  backgroundColor: 'rgba(243, 244, 246, 0.7)', 
                  p: { xs: 1.5, sm: 2 }, 
                  borderRadius: 2, 
                  border: '1px solid rgba(229, 231, 235, 0.9)' 
                }}>
                  <Typography variant="body1" sx={{ 
                    color: '#4b5563', 
                    whiteSpace: 'pre-wrap', 
                    lineHeight: 1.7,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                  }}>
                    {car.description || 'No description available for this vehicle.'}
                  </Typography>
                </Paper>
                <Divider sx={{ my: 3 }} />
              </Box>

              <Box sx={{ p: { xs: 2, sm: 3 }, pt: 0 }}> {/* Main content area for Grid */}
                <Grid container spacing={{ xs: 2, md: 4 }}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
                      <CardMedia
                        component="img"
                        image={`http://localhost:5001/${car.images?.[selectedImageIndex] || car.images?.[0]}`}
                        alt={car.carName}
                        sx={{
                          borderRadius: 2,
                          boxShadow: '0 3px 18px rgba(71, 85, 105, 0.1)',
                          border: '1px solid #e3e8ee',
                          height: { xs: 220, sm: 300, md: 340 },
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                        }}
                      />
                      
                      {car.images?.length > 1 && (
                        <>
                          <IconButton 
                            onClick={handlePrevImage}
                            sx={{
                              position: 'absolute',
                              left: 10,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              bgcolor: 'rgba(255, 255, 255, 0.8)',
                              '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.95)',
                              },
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                              zIndex: 2,
                            }}
                          >
                            <ArrowBackIcon />
                          </IconButton>
                          
                          <IconButton 
                            onClick={handleNextImage}
                            sx={{
                              position: 'absolute',
                              right: 10,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              bgcolor: 'rgba(255, 255, 255, 0.8)',
                              '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.95)',
                              },
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                              zIndex: 2,
                            }}
                          >
                            <ArrowForwardIosIcon />
                          </IconButton>
                        </>
                      )}
                    </Box>
                    
                    {car.images?.length > 1 && (
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1.5, 
                        mt: 2, 
                        overflowX: 'auto', 
                        pb: 1,
                        '&::-webkit-scrollbar': {
                          height: 6,
                        },
                        '&::-webkit-scrollbar-thumb': {
                          backgroundColor: 'rgba(71, 85, 105, 0.2)',
                          borderRadius: 3,
                        },
                      }}>
                        {car.images?.map((img, index) => (
                          <Box
                            key={index}
                            onClick={() => handleImageChange(index)}
                            sx={{
                              position: 'relative',
                              cursor: 'pointer',
                              borderRadius: 2,
                              overflow: 'hidden',
                              border: selectedImageIndex === index 
                                ? '2px solid #1e293b' 
                                : '2px solid transparent',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'scale(1.05)',
                              }
                            }}
                          >
                            <CardMedia
                              component="img"
                              image={`http://localhost:5001/${img}`}
                              alt={`Car image ${index + 1}`}
                              sx={{
                                width: 70,
                                height: 70,
                                objectFit: 'cover',
                                opacity: selectedImageIndex === index ? 1 : 0.7,
                                transition: 'opacity 0.2s ease',
                                '&:hover': {
                                  opacity: 1,
                                }
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    )}
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mt: 3,
                      p: { xs: 2, sm: 3 },
                      borderRadius: 2,
                      background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%)',
                      boxShadow: '0 2px 10px rgba(71, 85, 105, 0.08)',
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoneyIcon sx={{ color: '#1e293b', fontSize: { xs: 24, sm: 28 } }} />
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 800,
                            color: '#1e293b',
                            fontSize: { xs: '1.25rem', sm: '1.5rem' },
                          }}
                        >
                          €{car.price}/day
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Tooltip 
                          title={isOwnCar ? "You cannot book your own car" : ""}
                          placement="top"
                        >
                          <span> {/* Wrapper needed for disabled buttons with tooltip */}
                            <Button
                              variant="contained"
                              onClick={() => navigate(`/booking/${carId}`)}
                              disabled={isOwnCar}
                              sx={{
                                borderRadius: 99,
                                background: isOwnCar 
                                  ? '#e0e0e0' 
                                  : 'linear-gradient(90deg, #1e293b 0%, #475569 100%)',
                                color: isOwnCar ? '#a0a0a0' : '#fff',
                                fontWeight: 600,
                                py: { xs: 0.8, sm: 1 },
                                px: { xs: 2, sm: 3 },
                                textTransform: 'none',
                                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                whiteSpace: 'nowrap',
                                '&:hover': {
                                  background: isOwnCar 
                                    ? '#e0e0e0' 
                                    : 'linear-gradient(90deg, #0f172a 0%, #334155 100%)',
                                  boxShadow: isOwnCar ? 'none' : '0 4px 12px rgba(0,0,0,0.2)',
                                },
                                transition: 'all 0.2s ease-in-out',
                                cursor: isOwnCar ? 'not-allowed' : 'pointer',
                              }}
                            >
                              {isOwnCar ? "Your Own Car" : "Book Now"}
                            </Button>
                          </span>
                        </Tooltip>
                        <Button
                          variant="outlined"
                          onClick={() => navigate(`/conversation/${carId}/${car.owner?._id || car.owner}`)}
                          disabled={isOwnCar}
                          sx={{
                            borderRadius: 99,
                            borderColor: '#475569',
                            color: isOwnCar ? '#a0a0a0' : '#475569',
                            fontWeight: 600,
                            py: { xs: 0.8, sm: 1 },
                            px: { xs: 2, sm: 3 },
                            textTransform: 'none',
                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                            whiteSpace: 'nowrap',
                            '&:hover': {
                              background: isOwnCar ? 'none' : 'rgba(71, 85, 105, 0.1)',
                              borderColor: '#334155',
                            },
                            transition: 'all 0.2s ease-in-out',
                            cursor: isOwnCar ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Start Conversation
                        </Button>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <CardContent sx={{ p: 0 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2.5,
                          fontWeight: 700,
                          color: '#1e293b',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        }}
                      >
                        <DirectionsCarIcon sx={{ color: '#475569' }} /> 
                        Vehicle Specifications
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Paper 
                            elevation={0}
                            sx={{ 
                              p: 2, 
                              borderRadius: 2, 
                              height: '100%',
                              border: '1px solid #e2e8f0',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(71, 85, 105, 0.08)',
                                borderColor: '#cbd5e1',
                              }
                            }}
                          >
                            <Tooltip title="Passenger Capacity" arrow>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <EventSeatIcon sx={{ color: '#475569' }} />
                                <Box>
                                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>
                                    {car.seats} Seats
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                                    Passenger capacity
                                  </Typography>
                                </Box>
                              </Box>
                            </Tooltip>
                          </Paper>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Paper 
                            elevation={0}
                            sx={{ 
                              p: 2, 
                              borderRadius: 2, 
                              height: '100%',
                              border: '1px solid #e2e8f0',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(71, 85, 105, 0.08)',
                                borderColor: '#cbd5e1',
                              }
                            }}
                          >
                            <Tooltip title="Number of Doors" arrow>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <DoorFrontIcon sx={{ color: '#475569' }} />
                                <Box>
                                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>
                                    {car.doors} Doors
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                                    Vehicle access
                                  </Typography>
                                </Box>
                              </Box>
                            </Tooltip>
                          </Paper>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Paper 
                            elevation={0}
                            sx={{ 
                              p: 2, 
                              borderRadius: 2, 
                              height: '100%',
                              border: '1px solid #e2e8f0',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(71, 85, 105, 0.08)',
                                borderColor: '#cbd5e1',
                              }
                            }}
                          >
                            <Tooltip title="Fuel Type" arrow>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                {getFuelIcon(car.energy)}
                                <Box>
                                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>
                                    {car.energy || 'Gasoline'}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                                    Fuel type
                                  </Typography>
                                </Box>
                              </Box>
                            </Tooltip>
                          </Paper>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Paper 
                            elevation={0}
                            sx={{ 
                              p: 2, 
                              borderRadius: 2, 
                              height: '100%',
                              border: '1px solid #e2e8f0',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(71, 85, 105, 0.08)',
                                borderColor: '#cbd5e1',
                              }
                            }}
                          >
                            <Tooltip title="Transmission Type" arrow>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <SettingsIcon sx={{ color: '#475569' }} />
                                <Box>
                                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>
                                    {car.transmission || 'Automatic'}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                                    Transmission
                                  </Typography>
                                </Box>
                              </Box>
                            </Tooltip>
                          </Paper>
                        </Grid>
                      </Grid>
                      
                      <Divider sx={{ my: 3, borderColor: '#e2e8f0' }} />
                      
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          fontWeight: 700,
                          color: '#1e293b',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        }}
                      >
                        <LocationOnIcon sx={{ color: '#475569' }} /> 
                        Location & Availability
                      </Typography>
                      
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2.5, 
                          borderRadius: 2, 
                          mb: 2,
                          border: '1px solid #e2e8f0',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(71, 85, 105, 0.08)',
                            borderColor: '#cbd5e1',
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          <LocationOnIcon sx={{ color: '#475569', mt: 0.5 }} />
                          <Box>
                            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>
                              Pickup Location
                            </Typography>
                            <Typography sx={{ color: '#64748b', mt: 0.5 }}>
                              {car.wilaya || 'Unknown Wilaya'}
                              {car.address && `, ${car.address}`}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>

                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2.5, 
                          borderRadius: 2, 
                          mb: 2,
                          border: '1px solid #e2e8f0',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(71, 85, 105, 0.08)',
                            borderColor: '#cbd5e1',
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          <CalendarMonthIcon sx={{ color: '#475569', mt: 0.5 }} />
                          <Box>
                            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>
                              Available Dates
                            </Typography>
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: { xs: 'column', sm: 'row' }, 
                              gap: { xs: 0.5, sm: 2 }, 
                              mt: 0.5 
                            }}>
                              <Typography sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <span style={{ fontWeight: 500 }}>From:</span> {car.availabilityStart ? dayjs(car.availabilityStart).format('DD-MM-YYYY') : 'Not Available'}
                              </Typography>
                              <Typography sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <span style={{ fontWeight: 500 }}>To:</span> {car.availabilityEnd ? dayjs(car.availabilityEnd).format('DD-MM-YYYY') : 'Not Available'}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                      
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2.5, 
                          borderRadius: 2,
                          border: '1px solid #e2e8f0',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(71, 85, 105, 0.08)',
                            borderColor: '#cbd5e1',
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          <PersonIcon sx={{ color: '#475569', mt: 0.5 }} />
                          <Box>
                            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#475569', mb: 1 }}>
                              Car Owner
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mt: 2,
                                mb: 0,
                              }}
                              onClick={() => {
                                if (!car.owner) return; // Don't open dialog if owner is undefined
                                
                                const ownerId = typeof car.owner === 'string' ? car.owner : (car.owner._id || '');
                                const ownerName = typeof car.owner === 'string' ? 
                                  (car.ownerName || 'Unknown Owner') : 
                                  (car.owner ? `${car.owner.firstName || ''} ${car.owner.lastName || ''}` : (car.ownerName || 'Unknown Owner'));
                                
                                handleOpenUserRatingDialog(ownerId, ownerName);
                              }}
                            >
                              <Avatar
                                src={typeof car.owner === 'string' || !car.owner ? null : car.owner.avatar}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: 'primary.main',
                                  color: 'primary.contrastText',
                                  fontSize: '1rem'
                                }}
                              >
                                {typeof car.owner === 'string' ? car.ownerName?.[0] : 
                                 car.owner?.firstName?.[0] || (car.ownerName ? car.ownerName[0] : 'U')}
                              </Avatar>
                              <Typography
                                variant="subtitle1"
                                className="owner-name"
                                sx={{
                                  fontWeight: 500,
                                  transition: 'color 0.2s'
                                }}
                              >
                                {typeof car.owner === 'string' ? car.ownerName : 
                                 (car.owner ? `${car.owner.firstName || ''} ${car.owner.lastName || ''}` : car.ownerName || 'Unknown Owner')}
                              </Typography>
                            </Box>
                            {ownerRatingsLoading ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                    <Skeleton variant="text" width={100} height={20} />
                                    <Skeleton variant="text" width={50} height={20} sx={{ ml: 1 }} />
                                </Box>
                            ) : ownerRatingsError ? (
                                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                                    {ownerRatingsError}
                                </Typography>
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                    <Rating
                                        value={ownerAverageRating}
                                        precision={0.5}
                                        readOnly
                                        size="small"
                                        sx={{ mr: 0.5 }}
                                    />
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                                        {ownerAverageRating.toFixed(1)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>
                                        ({ownerTotalReviews} {ownerTotalReviews === 1 ? 'review' : 'reviews'})
                                    </Typography>
                                </Box>
                            )}
                          </Box>
                        </Box>
                      </Paper>
                    </CardContent>
                  </Grid>
                </Grid>

                {/* Owner Feedbacks Section */}
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2.5, sm: 3 },
                        borderRadius: 2,
                        mt: 3,
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            boxShadow: '0 4px 12px rgba(71, 85, 105, 0.08)',
                            borderColor: '#cbd5e1',
                        }
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            mb: 2,
                            fontWeight: 700,
                            color: '#1e293b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <PersonIcon sx={{ color: '#475569' }} /> Owner Feedback
                    </Typography>

                    {ownerRatingsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: 2 }} />
                        </Box>
                    ) : ownerRatingsError ? (
                        <Alert severity="error" sx={{ my: 2 }}>{ownerRatingsError}</Alert>
                    ) : ownerFeedbacks.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
                            <Typography variant="body1" color="text.secondary">
                                No feedback received for this owner yet.
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            {ownerFeedbacks
                              .slice() // copy array
                              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                              .map((feedback, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: 2,
                                            border: '1px solid #e2e8f0',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            minHeight: 180,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                bottom: 0,
                                                width: 4,
                                                bgcolor: feedback.rating >= 4 ? '#10b981' :
                                                    feedback.rating >= 3 ? '#f59e0b' : '#ef4444',
                                            }
                                        }}
                                    >
                                        <Box>
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                              <Rating value={feedback.rating} readOnly size="small" />
                                              <Typography variant="caption" color="text.secondary">
                                                  {dayjs(feedback.createdAt).format('DD-MM-YYYY')}
                                              </Typography>
                                          </Box>

                                          {feedback.review && (
                                              <Box sx={{ display: 'flex', mt: 1 }}>
                                                  <FormatQuoteIcon
                                                      sx={{
                                                          fontSize: 20,
                                                          color: 'text.secondary',
                                                          mr: 1,
                                                          transform: 'scaleX(-1)'
                                                      }}
                                                  />
                                                  <Typography variant="body2">
                                                      {feedback.review}
                                                  </Typography>
                                              </Box>
                                          )}
                                        </Box>

                                        {feedback.raterId && (
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                mt: 2,
                                                mb: 0,
                                            }}>
                                                <Avatar
                                                    src={feedback.raterId.profileImage || ''}
                                                    sx={{
                                                        width: 24,
                                                        height: 24,
                                                        mr: 1,
                                                        bgcolor: '#64748b'
                                                    }}
                                                >
                                                    {feedback.raterId.firstName?.[0] || feedback.raterId.username?.[0] || 'U'}
                                                </Avatar>
                                                <Typography variant="caption" color="text.secondary">
                                                    Feedback from {feedback.raterId.firstName && feedback.raterId.lastName
                                                        ? `${feedback.raterId.firstName} ${feedback.raterId.lastName}`
                                                        : feedback.raterId.username || 'Anonymous User'}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Paper>

                {/* Removed 'About This Vehicle' section */}
              </Box>
            </Paper>
          </Fade>
        </Container>
      </Box>
      
      {/* UserRatingDialog is no longer needed as we display ratings directly */}
      {/* <UserRatingDialog
        open={userRatingDialogOpen}
        onClose={handleCloseUserRatingDialog}
        userId={selectedUserId}
        userName={selectedUserName}
      /> */}
    </>
  );
}
