import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Grid, CardMedia, CardContent, Button } from '@mui/material';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SettingsIcon from '@mui/icons-material/Settings';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function CarDetailsPage() {
  const { carId } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/cars/details/${carId}`); // Ensure the correct endpoint is used
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
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>{car.carName}</Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <CardMedia
            component="img"
            image={`http://localhost:5001/${car.images?.[0]}`} // Ensure the correct path
            alt={car.carName}
            sx={{ borderRadius: 2, boxShadow: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 2, overflowX: 'auto' }}>
            {car.images?.map((img, index) => (
              <CardMedia
                key={index}
                component="img"
                image={`http://localhost:5001/${img}`} // Ensure the correct path
                alt={`Car image ${index + 1}`}
                sx={{ width: 80, height: 80, borderRadius: 2, boxShadow: 1 }}
              />
            ))}
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Details</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <EventSeatIcon sx={{ color: '#607d8b' }} />
              <Typography>{car.seats} Seats</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <DoorFrontIcon sx={{ color: '#607d8b' }} />
              <Typography>{car.doors} Doors</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <LocalGasStationIcon sx={{ color: '#607d8b' }} />
              <Typography>{car.energy}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <SettingsIcon sx={{ color: '#607d8b' }} />
              <Typography>{car.transmission}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <LocationOnIcon sx={{ color: '#607d8b' }} />
              <Typography>{car.location}</Typography>
            </Box>
          </CardContent>
        </Grid>
      </Grid>
      <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
        {car.description || 'No description available.'} // Display the car description
      </Typography>
      <Typography variant="h6" sx={{ mt: 4 }}>Price: €{car.price}/day</Typography>
      <Button variant="contained" color="primary" sx={{ mt: 3 }}>Book Now</Button>
    </Box>
  );
}
