import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  CardMedia,
  Button,
  Container,
  Paper,
  Chip,
  Skeleton,
  useTheme,
  useMediaQuery,
  TextField,
  Alert,
  CircularProgress,
  Avatar,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { blueGrey } from '@mui/material/colors';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import Navbar from '../components/Navbar';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import InfoIcon from '@mui/icons-material/Info';
import SpeedIcon from '@mui/icons-material/Speed';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import LuggageIcon from '@mui/icons-material/Luggage'; // Keep for potential future use or other pages
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import WifiIcon from '@mui/icons-material/Wifi';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SettingsInputSvideoIcon from '@mui/icons-material/SettingsInputSvideo';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios'; // Import axios

// Imports for react-slick carousel
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';

export default function BookingPage() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const [mileage, setMileage] = useState(100);
  const [dateError, setDateError] = useState('');

  const today = dayjs(new Date().setHours(0, 0, 0, 0));

  useEffect(() => {
    if (car) {
      console.log("Car object for carousel:", car);
    }
  }, [car]);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/api/cars/details/${carId}`);
        const data = response.data;
        
        let ownerId = null;
        if (data.owner) {
          ownerId = typeof data.owner === 'string' ? data.owner : data.owner._id;
        }

        if (ownerId) {
          try {
            const token = localStorage.getItem('token'); // Assuming token is needed for this endpoint
            const ownerRatingsResponse = await axios.get(
              `${apiUrl}/api/ratings/average/user/${ownerId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            data.ownerAverageRating = ownerRatingsResponse.data.averageRating || 0;
            data.ownerTotalReviews = ownerRatingsResponse.data.totalRatings || 0;
          } catch (ratingsError) {
            console.error('Error fetching owner ratings in BookingPage:', ratingsError);
            // Continue without ratings if there's an error
            data.ownerAverageRating = 0;
            data.ownerTotalReviews = 0;
          }
        } else {
          data.ownerAverageRating = 0;
          data.ownerTotalReviews = 0;
        }

        setCar(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching car details:', err.message);
        setError(err.message);
        setCar(null);
      } finally {
        setLoading(false);
      }
    };

    if (carId) {
      fetchCarDetails();
    }
  }, [carId]);

  useEffect(() => {
    if (car && startDate && endDate) {
      if (endDate.isBefore(startDate)) {
        setDateError('End date cannot be before start date.');
        setTotalCost(0);
        return;
      }

      const carAvailabilityStart = dayjs(car.availabilityStart);
      const carAvailabilityEnd = dayjs(car.availabilityEnd);

      if (startDate.isBefore(carAvailabilityStart) || endDate.isAfter(carAvailabilityEnd)) {
        setDateError("Selected dates are outside the car's availability range.");
        setTotalCost(0);
        return;
      }
      
      // Check for booked dates (to be implemented with backend)
      // For now, we assume no other bookings conflict

      setDateError('');
      const diffHours = endDate.diff(startDate, 'hour');
      const diffDays = Math.ceil(diffHours / 24); // Round up to the nearest full day
      if (diffDays > 0) {
        const basePrice = diffDays * car.price;
        let mileageMultiplier = 1;
        if (mileage === 200) {
          mileageMultiplier = 1.5;
        } else if (mileage === 300) {
          mileageMultiplier = 2.0;
        } else if (mileage === 400) {
          mileageMultiplier = 2.5;
        } else if (mileage === 500) {
          mileageMultiplier = 3.0;
        }
        setTotalCost(basePrice * mileageMultiplier);
      } else {
        setTotalCost(0);
      }
    } else {
      setTotalCost(0);
      setDateError('');
    }
  }, [car, startDate, endDate, mileage]);

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page (CarDetailsPage)
  };
  
  const handleContinueToChat = () => {
    if (!startDate || !endDate || dateError) {
      setDateError('Please select valid dates before continuing.');
      return;
    }
    // Navigate to chat page, passing booking details
    const formattedStartDate = startDate.format('YYYY-MM-DDTHH:mm');
    const formattedEndDate = endDate.format('YYYY-MM-DDTHH:mm');
    navigate(`/conversation/${carId}/${car.owner._id}`, {
      state: {
        car,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        totalCost,
        mileage
      }
    });
  };

  // Prepare images for the carousel
  let processedImages = [];
  if (car && car.images && Array.isArray(car.images) && car.images.length > 0) {
    processedImages = car.images;
  } else if (car && car.image_url) { // Fallback if car.images is not there or empty
    processedImages = [car.image_url];
  }
  if (processedImages.length === 0) {
    processedImages = ['/placeholder.jpg']; // Default placeholder
  }
  console.log("Processed images for carousel:", processedImages);

  const carouselSettings = {
    dots: true,
    infinite: processedImages.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    arrows: processedImages.length > 1,
    autoplay: processedImages.length > 1,
    autoplaySpeed: 3000,
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!car) {
    return <Typography>Car not found.</Typography>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: isMobile ? 3 : 5, mt: 4, mb: 4 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 0,
            borderRadius: 3, 
            bgcolor: 'rgba(248, 250, 252, 0.97)', 
            boxShadow: '0px 8px 16px rgba(15, 23, 42, 0.04), 0px 12px 32px rgba(15, 23, 42, 0.06)', 
            position: 'relative',
            overflow: 'hidden', 
            border: '1px solid rgba(226, 232, 240, 0.7)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(to right, #475569, #64748b)',
              zIndex: 1
            }
          }}
        >
          <Box sx={{ 
            background: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
            py: 3.5, 
            px: isMobile ? 3 : 4,
            borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative elements */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.05,
              backgroundImage: 'radial-gradient(circle at 20% 90%, rgba(255,255,255,0.8) 0%, transparent 20%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.8) 0%, transparent 20%)',
              zIndex: 0
            }} />
            
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={handleGoBack}
              sx={{
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 1.5,
                px: 2.5, 
                py: 0.75,
                bgcolor: 'rgba(255, 255, 255, 0.15)', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(4px)',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', 
                '&:hover': { 
                  bgcolor: 'rgba(255, 255, 255, 0.25)', 
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s ease-in-out',
                mb: 3.5,
                zIndex: 1
              }}
            >
              Back to Car Details
            </Button>

            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              sx={{
                fontWeight: 700, 
                color: 'white',
                letterSpacing: '0.5px', 
                position: 'relative',
                textAlign: 'center',
                pb: 1.5,
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                zIndex: 1,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '50%', 
                  transform: 'translateX(-50%)', 
                  width: '100px', 
                  height: '3px', 
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.2), rgba(255,255,255,0.8), rgba(255,255,255,0.2))', 
                  borderRadius: '3px'
                }
              }}
            >
              Confirm Your Booking
            </Typography>
          </Box>
          <Grid container spacing={3} sx={{ justifyContent: 'center', p: isMobile ? 3 : 4, pt: isMobile ? 3 : 4 }}>
            <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}> 
              
              {/* Car Name and Brand */}
              {car && (
                <Box sx={{ 
                  mb: 2.5, 
                  pb: 0, 
                  width: '100%', 
                  textAlign: 'center',
                  maxWidth: 400,
                  bgcolor: 'rgba(248, 250, 252, 0.75)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  p: 3.5,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 16px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)',
                  background: 'linear-gradient(145deg, rgba(248, 250, 252, 0.75), rgba(241, 245, 249, 0.7))',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 20px rgba(15, 23, 42, 0.1), 0 4px 8px rgba(15, 23, 42, 0.06)'
                  }
                }}>
                  <Typography 
                    variant="h6" 
                    component="div" 
                    sx={{ 
                      fontWeight: 700, 
                      color: '#1e293b', 
                      mb: 0.5 
                    }}
                  >
                    {car.carName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569', mb: 1.5 }}> 
                    {car.brand} • {car.year}
                  </Typography>
                </Box>
              )}

              {/* Car Owner Information */}
              {car && (
                <Box sx={{
                  width: '100%',
                  maxWidth: 400,
                  mb: 3,
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(15, 23, 42, 0.12)'
                  }
                }}>
                  {/* Header section with gradient background */}
                  <Box sx={{
                    bgcolor: '#475569',
                    background: 'linear-gradient(to right, #475569, #64748b)',
                    p: 2.5,
                    position: 'relative'
                  }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: 'white', 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      position: 'relative',
                      zIndex: 1
                    }}>
                      <PersonIcon sx={{ color: 'white' }} /> Car Owner
                    </Typography>
                    <Box sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '30%',
                      height: '100%',
                      background: 'radial-gradient(circle at bottom right, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                      zIndex: 0
                    }} />
                  </Box>
                  
                  {/* Owner profile section */}
                  <Box sx={{
                    p: 3,
                    bgcolor: 'white',
                  }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2.5
                    }}>
                      <Avatar
                        src={typeof car.owner === 'string' || !car.owner ? null : car.owner.avatar}
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: '#475569',
                          color: 'white',
                          fontSize: '1.4rem',
                          mr: 2.5,
                          border: '2px solid white',
                          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)'
                        }}
                      >
                        {typeof car.owner === 'string' ? car.ownerName?.[0] : 
                         car.owner?.firstName?.[0] || (car.ownerName ? car.ownerName[0] : 'U')}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ 
                          fontWeight: 600, 
                          color: '#334155',
                          fontSize: '1.1rem',
                          mb: 0.5
                        }}>
                          {typeof car.owner === 'string' ? car.ownerName : 
                           (car.owner ? `${car.owner.firstName || ''} ${car.owner.lastName || ''}` : car.ownerName || 'Unknown Owner')}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating
                            value={car.ownerAverageRating || 0}
                            precision={0.5}
                            readOnly
                            size="small"
                            sx={{ mr: 0.75 }}
                          />
                          <Typography variant="body2" sx={{ 
                            color: '#64748b',
                            fontWeight: 500
                          }}>
                            {car.ownerAverageRating ? `${car.ownerAverageRating.toFixed(1)} (${car.ownerTotalReviews || 0})` : 'No ratings yet'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ 
                      my: 2, 
                      borderColor: 'rgba(226, 232, 240, 0.9)',
                      '&::before, &::after': {
                        borderColor: 'rgba(226, 232, 240, 0.9)',
                      }
                    }} />
                    
                    {/* Owner details with icons */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CalendarTodayIcon sx={{ color: '#64748b', fontSize: '1.2rem' }} />
                        <Typography variant="body2" sx={{ color: '#475569' }}>
                          <span style={{ fontWeight: 600, marginRight: '4px' }}>Member since:</span>
                          {car.owner?.joinDate || car.owner?.createdAt ? dayjs(car.owner.joinDate || car.owner.createdAt).format('MMMM YYYY') : 'N/A'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <InfoIcon sx={{ color: '#64748b', fontSize: '1.2rem' }} />
                        <Typography variant="body2" sx={{ color: '#475569' }}>
                          <span style={{ fontWeight: 600, marginRight: '4px' }}>Response rate:</span>
                          {car.owner?.responseRate ? `${car.owner.responseRate}%` : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Car Specifications Container with premium styling */}
              {car && (
                <Box sx={{
                  width: '100%',
                  maxWidth: 400,
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(15, 23, 42, 0.12)'
                  }
                }}>
                  {/* Header section with gradient background */}
                  <Box sx={{
                    bgcolor: '#475569',
                    background: 'linear-gradient(to right, #475569, #64748b)',
                    p: 2.5,
                    position: 'relative'
                  }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: 'white', 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      position: 'relative',
                      zIndex: 1
                    }}>
                      <DirectionsCarIcon sx={{ color: 'white' }} /> Car Specifications
                    </Typography>
                    <Box sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '30%',
                      height: '100%',
                      background: 'radial-gradient(circle at bottom right, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                      zIndex: 0
                    }} />
                  </Box>
                  
                  {/* Specifications content */}
                  <Box sx={{
                    p: 3,
                    bgcolor: 'white',
                  }}>
                    <Grid container spacing={3}>
                      {/* Performance Specs */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ 
                          fontWeight: 600, 
                          color: '#334155',
                          mb: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.75,
                          fontSize: '0.95rem',
                          '&::after': {
                            content: '""',
                            display: 'block',
                            height: '1px',
                            flexGrow: 1,
                            bgcolor: 'rgba(226, 232, 240, 0.9)',
                            ml: 1
                          }
                        }}>
                          <SpeedIcon sx={{ color: '#475569', fontSize: '1rem' }} /> Performance
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1.5,
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: 'rgba(248, 250, 252, 0.8)',
                              border: '1px solid rgba(226, 232, 240, 0.8)',
                              height: '100%'
                            }}>
                              <LocalGasStationIcon sx={{ color: '#475569', fontSize: '1.2rem' }} />
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                                  Fuel Type
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                                  {car.energy || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1.5,
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: 'rgba(248, 250, 252, 0.8)',
                              border: '1px solid rgba(226, 232, 240, 0.8)',
                              height: '100%'
                            }}>
                              <SettingsInputSvideoIcon sx={{ color: '#475569', fontSize: '1.2rem' }} />
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                                  Transmission
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                                  {car.transmission || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </Grid>
                      
                      {/* Comfort & Utility Specs */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ 
                          fontWeight: 600, 
                          color: '#334155',
                          mb: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.75,
                          fontSize: '0.95rem',
                          '&::after': {
                            content: '""',
                            display: 'block',
                            height: '1px',
                            flexGrow: 1,
                            bgcolor: 'rgba(226, 232, 240, 0.9)',
                            ml: 1
                          }
                        }}>
                          <EventSeatIcon sx={{ color: '#475569', fontSize: '1rem' }} /> Comfort & Utility
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1.5,
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: 'rgba(248, 250, 252, 0.8)',
                              border: '1px solid rgba(226, 232, 240, 0.8)',
                              height: '100%'
                            }}>
                              <PeopleAltIcon sx={{ color: '#475569', fontSize: '1.2rem' }} />
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                                  Capacity
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                                  {car.seats ? `${car.seats} Seats` : 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1.5,
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: 'rgba(248, 250, 252, 0.8)',
                              border: '1px solid rgba(226, 232, 240, 0.8)',
                              height: '100%'
                            }}>
                              <MeetingRoomIcon sx={{ color: '#475569', fontSize: '1.2rem' }} />
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                                  Doors
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                                  {car.doors ? `${car.doors} Doors` : 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* Additional Features */}
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" sx={{ 
                        fontWeight: 600, 
                        color: '#334155',
                        mb: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        fontSize: '0.95rem',
                        '&::after': {
                          content: '""',
                          display: 'block',
                          height: '1px',
                          flexGrow: 1,
                          bgcolor: 'rgba(226, 232, 240, 0.9)',
                          ml: 1
                        }
                      }}>
                        <FeaturedPlayListIcon sx={{ color: '#475569', fontSize: '1rem' }} /> Additional Features
                      </Typography>
                      
                      <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1.5,
                        mt: 1.5
                      }}>
                        <Chip 
                          icon={<AcUnitIcon sx={{ fontSize: '1rem !important', color: '#475569 !important' }} />}
                          label={`A/C: ${car.hasAC === undefined ? 'N/A' : (car.hasAC ? 'Yes' : 'No')}`}
                          sx={{ 
                            bgcolor: 'rgba(248, 250, 252, 0.8)',
                            border: '1px solid rgba(226, 232, 240, 0.8)',
                            color: '#475569',
                            fontWeight: 500,
                            '& .MuiChip-icon': {
                              color: '#475569'
                            }
                          }}
                        />
                        
                        {car.mileage && (
                          <Chip 
                            icon={<SpeedIcon sx={{ fontSize: '1rem !important', color: '#475569 !important' }} />}
                            label={`${car.mileage} km`}
                            sx={{ 
                              bgcolor: 'rgba(248, 250, 252, 0.8)',
                              border: '1px solid rgba(226, 232, 240, 0.8)',
                              color: '#475569',
                              fontWeight: 500,
                              '& .MuiChip-icon': {
                                color: '#475569'
                              }
                            }}
                          />
                        )}
                        
                        {car.engine && (
                          <Chip 
                            icon={<SettingsIcon sx={{ fontSize: '1rem !important', color: '#475569 !important' }} />}
                            label={car.engine}
                            sx={{ 
                              bgcolor: 'rgba(248, 250, 252, 0.8)',
                              border: '1px solid rgba(226, 232, 240, 0.8)',
                              color: '#475569',
                              fontWeight: 500,
                              '& .MuiChip-icon': {
                                color: '#475569'
                              }
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}
            </Grid>

            {/* Right Column: Booking Form */}
            <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ 
                bgcolor: 'rgba(248, 250, 252, 0.75)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                p: 3.5,
                mb: 3,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 16px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)',
                background: 'linear-gradient(145deg, rgba(248, 250, 252, 0.75), rgba(241, 245, 249, 0.7))',
                width: '100%', 
                maxWidth: 420,
                position: 'relative', 
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 20px rgba(15, 23, 42, 0.1), 0 4px 8px rgba(15, 23, 42, 0.06)'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #64748b, #94a3b8)',
                  opacity: 0.7
                }
              }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#334155', 
                    mb: 2,
                    width: '100%', 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      bgcolor: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(203, 213, 225, 0.5)' 
                      },
                      '&:hover fieldset': {
                        borderColor: '#64748b' 
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#475569',
                        boxShadow: '0 0 0 2px rgba(71, 85, 105, 0.1)' 
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: '#64748b',
                      '&.Mui-focused': {
                        color: '#475569'
                      }
                    }
                  }}
                >
                  <CalendarMonthIcon sx={{ color: '#475569', fontSize: '1.1rem' }} />
                  Select Rental Dates
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row', 
                  alignItems: isMobile ? 'center' : 'stretch', 
                  justifyContent: !isMobile ? 'center' : 'flex-start', 
                  gap: 2, 
                  mb: 2,
                  width: '100%', 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    bgcolor: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(203, 213, 225, 0.5)' 
                    },
                    '&:hover fieldset': {
                      borderColor: '#64748b' 
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#475569',
                      boxShadow: '0 0 0 2px rgba(71, 85, 105, 0.1)' 
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#64748b',
                    '&.Mui-focused': {
                      color: '#475569'
                    }
                  }
                }}>
                  <DateTimePicker
                    label="Start Date & Time"
                    value={startDate}
                    onChange={(newValue) => {
                      setStartDate(newValue);
                      // If return date is before new start date, clear return date or adjust
                      if (newValue && endDate && newValue.isAfter(endDate)) {
                        setEndDate(null); 
                      }
                    }}
                    minDateTime={today} // Prevent selecting dates before today
                    slotProps={{ 
                      textField: { 
                        fullWidth: true,
                        size: "small"
                      } 
                    }}
                  />
                  <DateTimePicker
                    label="End Date & Time"
                    value={endDate}
                    onChange={setEndDate}
                    minDateTime={startDate || today} // Prevent selecting dates before start date or today
                    disabled={!startDate} // Disable if no start date is selected
                    slotProps={{ 
                      textField: { 
                        fullWidth: true,
                        size: "small"
                      } 
                    }}
                  />
                </Box>

                <Box sx={{ mt: 4, p: 2, bgcolor: blueGrey[50], borderRadius: 2, border: `1px solid ${blueGrey[200]}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SpeedIcon sx={{ color: blueGrey[600], mr: 1.5 }} />
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      Mileage Plan
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, pl: '36px' }}>
                    The standard plan includes 100 km/day. Higher mileage plans will affect the total price.
                  </Typography>
                  <FormControl fullWidth size="small">
                    <InputLabel id="mileage-select-label">Select Plan</InputLabel>
                    <Select
                      labelId="mileage-select-label"
                      id="mileage-select"
                      value={mileage}
                      label="Select Plan"
                      onChange={(e) => setMileage(e.target.value)}
                    >
                      <MenuItem value={100}>100 km/day (Standard)</MenuItem>
                      <MenuItem value={200}>200 km/day</MenuItem>
                      <MenuItem value={300}>300 km/day</MenuItem>
                      <MenuItem value={400}>400 km/day</MenuItem>
                      <MenuItem value={500}>500 km/day</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {dateError && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 2,
                      borderRadius: 1.5,
                      '& .MuiAlert-icon': {
                        color: '#ef4444'
                      }
                    }}
                  >
                    {dateError}
                  </Alert>
                )}
                
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#64748b', 
                    display: 'flex',
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: 0.5,
                    fontSize: '0.7rem',
                    fontStyle: 'italic',
                    width: '100%' 
                  }}
                >
                  <InfoIcon sx={{ fontSize: '0.8rem' }} />
                  Available from: {dayjs(car.availabilityStart).format('DD MMM YYYY')} to {dayjs(car.availabilityEnd).format('DD MMM YYYY')}
                </Typography>
              </Box>

              <Box sx={{ 
                bgcolor: 'rgba(248, 250, 252, 0.75)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                p: 3.5,
                mb: 3,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 16px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)',
                background: 'linear-gradient(145deg, rgba(248, 250, 252, 0.75), rgba(241, 245, 249, 0.7))',
                width: '100%', 
                maxWidth: 420,
                position: 'relative', 
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 20px rgba(15, 23, 42, 0.1), 0 4px 8px rgba(15, 23, 42, 0.06)'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #334155, #475569)', 
                  opacity: 1 
                }
              }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: '#334155', 
                    fontWeight: 700,
                    mb: 1.5,
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Estimated Total Cost
                </Typography>
                
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800, 
                    color: '#334155', 
                    mb: 0.5,
                    fontSize: { xs: '2rem', sm: '2.5rem' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5
                  }}
                >
                  <Box 
                    component="span" 
                    sx={{ 
                      fontSize: '1rem', 
                      fontWeight: 600,
                      color: '#475569', 
                      alignSelf: 'flex-start',
                      mt: {xs: 0.8, sm: 1},
                      mr: 0.25 
                    }}
                  >
                    DZD
                  </Box>
                  {totalCost.toLocaleString()}
                </Typography>
                
                {startDate && endDate && !dateError && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#475569', 
                      fontWeight: 500,
                      display: 'inline-block',
                      bgcolor: 'rgba(255, 255, 255, 0.8)', 
                      px: 1.5,
                      py: 0.75, 
                      borderRadius: 6, 
                      border: '1px solid rgba(203, 213, 225, 0.6)', 
                      boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)', 
                      fontSize: '0.8rem' 
                    }}
                  >
                    {endDate.diff(startDate, 'day') + 1} days at 
                    <Box component="span" sx={{ fontWeight: 700, color: '#475569' }}>
                      {' '}{car.price.toLocaleString()} DZD
                    </Box>
                    {' '}/ day
                  </Typography>
                )}
              </Box>

              <Button
                variant="contained"
                size="large"
                onClick={handleContinueToChat}
                disabled={!startDate || !endDate || !!dateError || totalCost === 0}
                sx={{
                  width: '100%', 
                  maxWidth: 420,
                  py: 2, 
                  fontWeight: 700,
                  fontSize: '1rem', 
                  borderRadius: 1.5,
                  textTransform: 'none',
                  boxShadow: '0 5px 15px rgba(15, 23, 42, 0.18)', 
                  background: 'linear-gradient(90deg, #334155 0%, #475569 100%)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #1e293b 0%, #334155 100%)',
                    boxShadow: '0 7px 20px rgba(15, 23, 42, 0.25)', 
                    transform: 'translateY(-2px)' 
                  },
                  '&:active': {
                    transform: 'translateY(0px)', 
                    boxShadow: '0 3px 10px rgba(15, 23, 42, 0.15)' 
                  },
                  transition: 'all 0.25s ease-out', 
                  '&.Mui-disabled': {
                    background: '#94a3b8',
                    color: 'rgba(255, 255, 255, 0.7)',
                    boxShadow: 'none',
                    transform: 'none'
                  }
                }}
              >
                Continue to Chat
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
}
