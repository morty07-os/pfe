import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Added useNavigate
import {
  Box,
  Typography,
  Grid,
  CardMedia,
  CardContent,
  Button,
} from '@mui/material';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SettingsIcon from '@mui/icons-material/Settings';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import dayjs from 'dayjs';

export default function CarDetailsPage() {
  const { carId } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/cars/details/${carId}`);
        if (!response.ok) throw new Error('Failed to fetch car details');
        const data = await response.json();
        setCar(data);
      } catch (error) {
        console.error('Error fetching car details:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [carId]);

  if (loading) return <Box sx={{ p: 4 }}>Loading car details...</Box>;
  if (!car) return <Box sx={{ p: 4 }}>No car details found or an error occurred.</Box>;

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: 'auto',
        p: 4,
        bgcolor: '#f8fafc',
        borderRadius: 3,
        boxShadow: '0 4px 24px 0 #607d8b22',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 900,
          mb: 3,
          color: '#263238',
          fontFamily: 'Segoe UI, Arial, sans-serif',
        }}
      >
        {car.carName}
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <CardMedia
            component="img"
            image={`http://localhost:5001/${car.images?.[0]}`}
            alt={car.carName}
            sx={{
              borderRadius: 3,
              boxShadow: '0 3px 18px #607d8b22',
              border: '1px solid #e3e8ee',
            }}
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 2, overflowX: 'auto' }}>
            {car.images?.map((img, index) => (
              <CardMedia
                key={index}
                component="img"
                image={`http://localhost:5001/${img}`}
                alt={`Car image ${index + 1}`}
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px #607d8b22',
                  border: '1px solid #e3e8ee',
                }}
              />
            ))}
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <CardContent sx={{ p: 0 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 700,
                color: '#3f51b5',
                fontFamily: 'Segoe UI, Arial, sans-serif',
              }}
            >
              Details
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <EventSeatIcon sx={{ color: '#607d8b' }} />
              <Typography sx={{ fontSize: 15, fontWeight: 500, color: '#607d8b' }}>
                {car.seats} Seats
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <DoorFrontIcon sx={{ color: '#607d8b' }} />
              <Typography sx={{ fontSize: 15, fontWeight: 500, color: '#607d8b' }}>
                {car.doors} Doors
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <LocalGasStationIcon sx={{ color: '#607d8b' }} />
              <Typography sx={{ fontSize: 15, fontWeight: 500, color: '#607d8b' }}>
                {car.energy}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <SettingsIcon sx={{ color: '#607d8b' }} />
              <Typography sx={{ fontSize: 15, fontWeight: 500, color: '#607d8b' }}>
                {car.transmission}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <LocationOnIcon sx={{ color: '#607d8b' }} />
              <Typography sx={{ fontSize: 15, fontWeight: 500, color: '#607d8b' }}>
                {car.wilaya || 'Unknown Wilaya'}
              </Typography>
            </Box>
          </CardContent>

          <Typography
            variant="body2"
            sx={{ mt: 2, color: '#607d8b', fontSize: 14 }}
          >
            Available From:{' '}
            {car.availabilityStart ? dayjs(car.availabilityStart).format('DD-MM-YYYY') : 'Not Available'}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#607d8b', fontSize: 14, mb: 2 }}
          >
            Available To:{' '}
            {car.availabilityEnd ? dayjs(car.availabilityEnd).format('DD-MM-YYYY') : 'Not Available'}
          </Typography>
        </Grid>
      </Grid>

      <Typography
        variant="body1"
        sx={{
          mt: 3,
          mb: 3,
          color: '#455a64',
          fontSize: 16,
          lineHeight: 1.6,
        }}
      >
        {car.description || 'No description available.'}
      </Typography>

      <Typography
        variant="h6"
        sx={{
          mt: 4,
          color: '#3f51b5',
          fontWeight: 700,
        }}
      >
        Price: €{car.price}/day
      </Typography>

      {/* Navigate to /book/:carId when clicked */}
      <Button
        variant="contained"
        sx={{
          mt: 3,
          borderRadius: 99,
          background: '#607d8b',
          color: '#fff',
          fontWeight: 700,
          py: 1.15,
          fontSize: 15,
          boxShadow: '0 2px 10px #607d8b33',
          letterSpacing: 0.3,
          textTransform: 'none',
          fontFamily: 'Segoe UI, Arial, sans-serif',
          ':hover': {
            background: '#455a64',
            boxShadow: '0 8px 28px #607d8b33',
            transform: 'scale(1.035)',
          },
        }}
        onClick={() => navigate(`/book/${car._id}`)} // Navigates on click
      >
        Book Now
      </Button>
    </Box>
  );
}