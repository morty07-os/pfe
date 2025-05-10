import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Avatar, CircularProgress, IconButton,
  Tooltip, Button, Chip, Container, Grid, Divider, Card, CardContent
} from '@mui/material';
import {
  Edit as EditIcon, Logout as LogoutIcon,
  LocationOn as LocationOnIcon, Phone as PhoneIcon,
  Email as EmailIcon, Person as PersonIcon, CalendarToday as CalendarIcon,
  DirectionsCar as DirectionsCarIcon, History as HistoryIcon, 
  AddCircle as AddCircleIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Import Navbar component

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 24px rgba(71, 85, 105, 0.12)',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 30px rgba(71, 85, 105, 0.16)',
  },
}));

const CardHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  background: 'linear-gradient(90deg, #475569 0%, #334155 100%)',
  color: 'white',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}));

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userCars, setUserCars] = useState([]);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("No token found. Please log in.");

      const response = await fetch('http://localhost:5001/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setProfile(data);
      else console.error(data.error || 'Failed to fetch profile');
    } catch (error) {
      console.error('Error fetching profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCars = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5001/api/cars/user-cars', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setUserCars(data);
      else console.error(data.error || 'Failed to fetch user cars');
    } catch (error) {
      console.error('Error fetching user cars:', error.message);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchUserCars();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5001/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      localStorage.removeItem('token');
      navigate('/');
    } catch (err) {
      console.error("Logout error:", err.message);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar sx={{ backgroundColor: '#111', color: '#fff' }} iconColor="#fff" />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '70vh',
          bgcolor: '#f8fafc'
        }}>
          <CircularProgress sx={{ color: '#475569' }} />
        </Box>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar sx={{ backgroundColor: '#111', color: '#fff' }} iconColor="#fff" />
        <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
          <StyledCard>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" color="error" sx={{ mb: 2 }}>
                Not Signed In
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: '#64748b' }}>
                Please sign in to view your profile information.
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => navigate('/')}
                sx={{ 
                  bgcolor: '#475569',
                  '&:hover': { bgcolor: '#334155' },
                  borderRadius: 2,
                  px: 3,
                  py: 1
                }}
              >
                Go to Homepage
              </Button>
            </CardContent>
          </StyledCard>
        </Container>
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
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 800, 
              color: '#1e293b',
              mb: 4,
              position: 'relative',
              display: 'inline-block',
              '&::after': {
                content: '""',
                position: 'absolute',
                width: '40px',
                height: '4px',
                backgroundColor: '#475569',
                bottom: '-8px',
                left: '0',
                borderRadius: '2px'
              }
            }}
          >
            My Dashboard
          </Typography>

          <Grid container spacing={3}>
            {/* Profile Information Card */}
            <Grid item xs={12} md={4}>
              <StyledCard>
                <CardHeader sx={{ 
                  background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon /> Profile
                  </Typography>
                  <Tooltip title="Edit Profile">
                    <IconButton sx={{ color: 'white' }}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </CardHeader>
                
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      bgcolor: '#e2e8f0', 
                      color: '#475569',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    {profile.firstName?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                </Box>
                
                <CardContent sx={{ p: 3, pt: 1, flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center', mb: 2 }}>
                    {profile.firstName} {profile.lastName}
                  </Typography>
                  <Chip 
                    label="Premium Member" 
                    size="small" 
                    sx={{ 
                      bgcolor: 'rgba(71, 85, 105, 0.1)', 
                      color: '#475569',
                      fontWeight: 500,
                      display: 'flex',
                      mx: 'auto',
                      mb: 3
                    }} 
                  />
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <EmailIcon sx={{ color: '#64748b' }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                          Email Address
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#334155' }}>
                          {profile.email}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <PhoneIcon sx={{ color: '#64748b' }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                          Phone Number
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#334155' }}>
                          {profile.phone}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <LocationOnIcon sx={{ color: '#64748b' }} />
                      <Box>
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                          Location
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#334155' }}>
                          {profile.residence}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 'auto', pt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={handleLogout}
                      startIcon={<LogoutIcon />}
                      fullWidth
                      sx={{
                        borderColor: '#ef4444',
                        color: '#ef4444',
                        borderRadius: 2,
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: '#dc2626',
                          bgcolor: 'rgba(239, 68, 68, 0.04)'
                        }
                      }}
                    >
                      Logout
                    </Button>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
            
            {/* My Vehicles Card */}
            <Grid item xs={12} md={4}>
              <StyledCard>
                <CardHeader>
                  <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DirectionsCarIcon /> My Vehicles
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="small"
                    startIcon={<AddCircleIcon />}
                    onClick={() => navigate('/add-car')}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.15)', 
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Add Vehicle
                  </Button>
                </CardHeader>
                
                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  {userCars.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <DirectionsCarIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 600, mb: 1 }}>
                        No Vehicles Listed
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                        List your vehicle and start earning today!
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddCircleIcon />}
                        onClick={() => navigate('/add-car')}
                        sx={{
                          bgcolor: '#475569',
                          '&:hover': { bgcolor: '#334155' },
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        Add Your First Vehicle
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {userCars.map((car) => (
                        <Paper
                          key={car._id}
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            gap: 2,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                              transform: 'translateY(-2px)',
                            },
                            position: 'relative',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              height: '100%',
                              width: 4,
                              bgcolor: '#ef4444',
                              borderRadius: '4px 0 0 4px',
                            }
                          }}
                        >
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: 1,
                              overflow: 'hidden',
                              flexShrink: 0
                            }}
                          >
                            <img
                              src={car.images?.[0] ? `http://localhost:5001/${car.images[0]}` : '/placeholder.jpg'}
                              alt={car.carName}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                              {car.carName}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                              <Chip
                                label={car.brand}
                                size="small"
                                sx={{
                                  bgcolor: '#f1f5f9',
                                  color: '#475569',
                                  fontWeight: 500,
                                  fontSize: '0.7rem'
                                }}
                              />
                              <Chip
                                label={`€${car.price}/day`}
                                size="small"
                                sx={{
                                  bgcolor: '#e6f0fa',
                                  color: '#64748b',
                                  fontWeight: 500,
                                  fontSize: '0.7rem'
                                }}
                              />
                              <Chip
                                label="Your Car"
                                size="small"
                                sx={{
                                  bgcolor: '#fee2e2',
                                  color: '#ef4444',
                                  fontWeight: 600,
                                  fontSize: '0.7rem'
                                }}
                              />
                            </Box>
                          </Box>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate(`/car-details/${car._id}`)}
                            sx={{
                              alignSelf: 'center',
                              borderColor: '#64748b',
                              color: '#64748b',
                              borderRadius: 1,
                              textTransform: 'none',
                              fontWeight: 600,
                              '&:hover': {
                                borderColor: '#475569',
                                bgcolor: 'rgba(100, 116, 139, 0.04)'
                              }
                            }}
                          >
                            View
                          </Button>
                        </Paper>
                      ))}
                      <Button
                        variant="contained"
                        startIcon={<AddCircleIcon />}
                        onClick={() => navigate('/add-car')}
                        sx={{
                          alignSelf: 'flex-start',
                          mt: 2,
                          bgcolor: '#475569',
                          '&:hover': { bgcolor: '#334155' },
                          borderRadius: 2,
                          px: 2,
                          py: 0.75,
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        Add Another Vehicle
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </StyledCard>
            </Grid>
            
            {/* Rental History Card */}
            <Grid item xs={12} md={4}>
              <StyledCard>
                <CardHeader>
                  <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HistoryIcon /> Rental History
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.15)', 
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    View All
                  </Button>
                </CardHeader>
                
                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <HistoryIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 600, mb: 1 }}>
                      No Rental History
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                      Your past and upcoming rentals will appear here
                    </Typography>
                    <Button
                      variant="outlined"
                      sx={{
                        borderColor: '#475569',
                        color: '#475569',
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: '#334155',
                          bgcolor: 'rgba(71, 85, 105, 0.04)'
                        }
                      }}
                    >
                      Browse Vehicles
                    </Button>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default ProfilePage;