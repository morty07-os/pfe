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
  Alert
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import Navbar from '../components/Navbar';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function BookingPage() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5001/api/cars/details/${carId}`);
        if (!response.ok) throw new Error('Failed to fetch car details');
        const data = await response.json();
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
        setDateError('Selected dates are outside the car’s availability range.');
        setTotalCost(0);
        return;
      }
      
      // Check for booked dates (to be implemented with backend)
      // For now, we assume no other bookings conflict

      setDateError('');
      const diffDays = endDate.diff(startDate, 'day') + 1; // Include start and end day
      if (diffDays > 0) {
        setTotalCost(diffDays * car.price);
      } else {
        setTotalCost(0);
      }
    } else {
      setTotalCost(0);
      setDateError('');
    }
  }, [car, startDate, endDate]);

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page (CarDetailsPage)
  };
  
  const handleContinueToChat = () => {
    if (!startDate || !endDate || dateError) {
      setDateError('Please select valid dates before continuing.');
      return;
    }
    // Navigate to chat page, passing booking details
    navigate(`/chat/${carId}`, { 
      state: { 
        car, 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString(), 
        totalCost 
      } 
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container sx={{ py: 4 }}>
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="rectangular" height={300} sx={{ my: 2 }} />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="70%" />
        </Container>
      </>
    );
  }

  if (error || !car) {
    return (
      <>
        <Navbar />
        <Container sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            {error || 'Car details not found.'}
          </Typography>
          <Button variant="outlined" onClick={handleGoBack} sx={{ mt: 2 }}>
            Go Back
          </Button>
        </Container>
      </>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Navbar />
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          <Button 
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
            sx={{ 
              mb: 3, 
              color: '#475569',
              fontWeight: 500,
              '&:hover': { 
                bgcolor: 'rgba(71, 85, 105, 0.08)',
              },
            }}
          >
            Back to Car Details
          </Button>

          <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant={isMobile ? "h5" : "h4"} gutterBottom sx={{ fontWeight: 700, color: '#1e293b' }}>
                Confirm Your Booking
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <CardMedia
                    component="img"
                    image={`http://localhost:5001/${car.images?.[0]}`}
                    alt={car.carName}
                    sx={{
                      borderRadius: 2,
                      height: isMobile ? 200 : 280,
                      objectFit: 'cover',
                      mb: 2
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155' }}>{car.carName}</Typography>
                  <Typography variant="body1" color="text.secondary">{car.brand} {car.year}</Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, color: '#475569' }}>
                    <EventSeatIcon fontSize="small" /> <Typography variant="body2">{car.seats} Seats</Typography>
                    <LocalGasStationIcon fontSize="small" /> <Typography variant="body2">{car.energy}</Typography>
                    <SettingsIcon fontSize="small" /> <Typography variant="body2">{car.transmission}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
                    Select Rental Dates
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, mb: 2 }}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      minDate={dayjs(car.availabilityStart)}
                      maxDate={dayjs(car.availabilityEnd)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      minDate={startDate || dayjs(car.availabilityStart)}
                      maxDate={dayjs(car.availabilityEnd)}
                      disabled={!startDate}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Box>

                  {dateError && (
                    <Alert severity="error" sx={{ mb: 2 }}>{dateError}</Alert>
                  )}
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Available from: {dayjs(car.availabilityStart).format('DD MMM YYYY')} to {dayjs(car.availabilityEnd).format('DD MMM YYYY')}
                  </Typography>

                  <Box sx={{ 
                    p: 2, 
                    bgcolor: '#e0f2fe', 
                    borderRadius: 2, 
                    textAlign: 'center',
                    border: `1px solid #7dd3fc`
                  }}>
                    <Typography variant="body1" sx={{ color: '#0c4a6e', fontWeight: 500 }}>
                      Estimated Total Cost
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#0369a1', mt: 0.5 }}>
                      <AttachMoneyIcon sx={{ verticalAlign: 'middle', fontSize: '1.8rem' }} />
                      {totalCost.toFixed(2)}
                    </Typography>
                    {startDate && endDate && !dateError && (
                       <Typography variant="caption" sx={{ color: '#075985' }}>
                         ({endDate.diff(startDate, 'day') + 1} days at €{car.price}/day)
                       </Typography>
                    )}
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleContinueToChat}
                    disabled={!startDate || !endDate || !!dateError || totalCost === 0}
                    sx={{
                      mt: 3,
                      py: 1.5,
                      fontWeight: 600,
                      background: 'linear-gradient(90deg, #1e293b 0%, #475569 100%)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #0f172a 0%, #334155 100%)',
                      },
                    }}
                  >
                    Continue to Chat
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Container>
      </Box>
    </LocalizationProvider>
  );
}
