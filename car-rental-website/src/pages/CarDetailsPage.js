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
} from '@mui/material';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SettingsIcon from '@mui/icons-material/Settings';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import dayjs from 'dayjs';
import Navbar from '../components/Navbar';

export default function CarDetailsPage() {
  const { carId } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

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

  if (loading) {
    return (
      <>
        <Navbar sx={{ backgroundColor: '#111', color: '#fff' }} iconColor="#fff" />
        <Box sx={{ p: 4, textAlign: 'center', mt: 8 }}>Loading car details...</Box>
      </>
    );
  }
  
  if (!car) {
    return (
      <>
        <Navbar sx={{ backgroundColor: '#111', color: '#fff' }} iconColor="#fff" />
        <Box sx={{ p: 4, textAlign: 'center', mt: 8 }}>No car details found or an error occurred.</Box>
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
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: 'white',
                }}
              >
                {car.carName}
              </Typography>
              <Chip 
                label={car.brand} 
                size="small" 
                sx={{ 
                  mt: 1, 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 600,
                  '& .MuiChip-label': { px: 1 }
                }} 
              />
            </Box>

            <Box sx={{ p: 3 }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <CardMedia
                    component="img"
                    image={`http://localhost:5001/${car.images?.[0]}`}
                    alt={car.carName}
                    sx={{
                      borderRadius: 2,
                      boxShadow: '0 3px 18px rgba(71, 85, 105, 0.1)',
                      border: '1px solid #e3e8ee',
                      height: 300,
                      objectFit: 'cover',
                    }}
                  />
                  <Box sx={{ display: 'flex', gap: 2, mt: 2, overflowX: 'auto', pb: 1 }}>
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
                          boxShadow: '0 2px 8px rgba(71, 85, 105, 0.1)',
                          border: '1px solid #e3e8ee',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          }
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
                        color: '#1e293b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <DirectionsCarIcon /> Car Details
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <EventSeatIcon sx={{ color: '#475569' }} />
                            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>
                              {car.seats} Seats
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <DoorFrontIcon sx={{ color: '#475569' }} />
                            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>
                              {car.doors} Doors
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <LocalGasStationIcon sx={{ color: '#475569' }} />
                            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>
                              {car.energy}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <SettingsIcon sx={{ color: '#475569' }} />
                            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>
                              {car.transmission}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>
                    
                    <Paper sx={{ p: 2, borderRadius: 2, mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <LocationOnIcon sx={{ color: '#475569' }} />
                        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>
                          Location: {car.wilaya || 'Unknown Wilaya'}
                        </Typography>
                      </Box>
                    </Paper>

                    <Paper sx={{ p: 2, borderRadius: 2, mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <CalendarMonthIcon sx={{ color: '#475569' }} />
                        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>
                          Availability
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ color: '#64748b', fontSize: 14, ml: 4 }}
                      >
                        From: {car.availabilityStart ? dayjs(car.availabilityStart).format('DD-MM-YYYY') : 'Not Available'}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: '#64748b', fontSize: 14, ml: 4 }}
                      >
                        To: {car.availabilityEnd ? dayjs(car.availabilityEnd).format('DD-MM-YYYY') : 'Not Available'}
                      </Typography>
                    </Paper>
                    
                    <Paper sx={{ p: 2, borderRadius: 2, mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <PersonIcon sx={{ color: '#475569' }} />
                        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>
                          Car Owner
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', ml: 4, mt: 1 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: '#e2e8f0', 
                            color: '#475569',
                            width: 36,
                            height: 36,
                            mr: 1.5
                          }}
                        >
                          {car.ownerName?.firstName?.charAt(0) || car.owner?.firstName?.charAt(0) || 'U'}
                        </Avatar>
                        <Typography
                          variant="body2"
                          sx={{ color: '#475569', fontSize: 14, fontWeight: 600 }}
                        >
                          {car.ownerName?.firstName} {car.ownerName?.lastName || 
                           car.owner?.firstName} {car.owner?.lastName || 'Unknown Owner'}
                        </Typography>
                      </Box>
                    </Paper>
                  </CardContent>
                </Grid>
              </Grid>

              <Paper sx={{ p: 3, borderRadius: 2, mt: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    color: '#1e293b',
                  }}
                >
                  Description
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#475569',
                    fontSize: 16,
                    lineHeight: 1.6,
                  }}
                >
                  {car.description || 'No description available.'}
                </Typography>
              </Paper>

              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mt: 3,
                p: 3,
                borderRadius: 2,
                background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%)',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoneyIcon sx={{ color: '#1e293b', fontSize: 28 }} />
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      color: '#1e293b',
                    }}
                  >
                    €{car.price}/day
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  onClick={() => navigate(`/book/${car._id}`)}
                  sx={{
                    borderRadius: 99,
                    background: 'linear-gradient(90deg, #1e293b 0%, #475569 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    py: 1.15,
                    px: 3,
                    fontSize: 15,
                    boxShadow: '0 4px 14px rgba(71, 85, 105, 0.25)',
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #0f172a 0%, #334155 100%)',
                      boxShadow: '0 6px 20px rgba(71, 85, 105, 0.35)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Book Now
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
}