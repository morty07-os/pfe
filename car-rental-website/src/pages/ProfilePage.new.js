import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Avatar, CircularProgress, IconButton,
  Tooltip, Button, Chip, Container, Grid, Divider, Card, CardContent,
  Tab, Tabs, Badge, LinearProgress, Rating, Link
} from '@mui/material';
import {
  Edit as EditIcon, Logout as LogoutIcon,
  LocationOn as LocationOnIcon, Phone as PhoneIcon,
  Email as EmailIcon, Person as PersonIcon, CalendarToday as CalendarIcon,
  DirectionsCar as DirectionsCarIcon, History as HistoryIcon, 
  AddCircle as AddCircleIcon, Verified as VerifiedIcon, 
  CreditCard as CreditCardIcon, Settings as SettingsIcon,
  Notifications as NotificationsIcon, Star as StarIcon,
  Security as SecurityIcon, Dashboard as DashboardIcon,
  Favorite as FavoriteIcon, EventAvailable as EventAvailableIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  backgroundColor: '#ffffff',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
  },
}));

const CardHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5, 3),
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  color: 'white',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid rgba(226, 232, 240, 0.1)'
}));

const GlassCard = styled(Box)(({ theme }) => ({
  backdropFilter: 'blur(10px)',
  backgroundColor: alpha('#ffffff', 0.8),
  borderRadius: theme.spacing(2),
  border: '1px solid rgba(255, 255, 255, 0.18)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(3),
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
  }
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  minWidth: 'auto',
  padding: theme.spacing(1.5, 2.5),
  color: '#64748b',
  '&.Mui-selected': {
    color: '#0f172a',
  },
  '&:hover': {
    color: '#1e293b',
    backgroundColor: 'rgba(226, 232, 240, 0.4)',
  },
}));

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userCars, setUserCars] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("No token found. Please log in.");

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
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

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cars/user-cars`, {
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
      await fetch(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      navigate('/');
    } catch (err) {
      console.error("Logout error:", err.message);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
      
      {/* Hero section with profile summary */}
      <Box sx={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
        pt: 6,
        pb: 6,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 20%), radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.05) 0%, transparent 20%)',
          zIndex: 1,
        }
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{
                    width: { xs: 100, md: 120 },
                    height: { xs: 100, md: 120 },
                    bgcolor: '#e2e8f0',
                    color: '#0f172a',
                    fontSize: { xs: '2.5rem', md: '3rem' },
                    fontWeight: 'bold',
                    border: '4px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  {profile.firstName?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Tooltip title="Verified User">
                      <VerifiedIcon sx={{ color: '#3b82f6', fontSize: 28, bgcolor: 'white', borderRadius: '50%', padding: '2px' }} />
                    </Tooltip>
                  }
                  sx={{ position: 'absolute', bottom: 5, right: 5 }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                  {profile.firstName} {profile.lastName}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  <Chip
                    icon={<StarIcon sx={{ color: '#f59e0b !important' }} />}
                    label="Premium Member"
                    sx={{
                      bgcolor: 'rgba(245, 158, 11, 0.15)',
                      color: '#f59e0b',
                      fontWeight: 600,
                      '& .MuiChip-icon': { color: '#f59e0b' }
                    }}
                  />
                  <Chip
                    icon={<EventAvailableIcon />}
                    label="Member since 2023"
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      color: '#e2e8f0',
                      fontWeight: 500
                    }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 1, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon sx={{ fontSize: 18, opacity: 0.8 }} />
                    <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                      {profile.email}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon sx={{ fontSize: 18, opacity: 0.8 }} />
                    <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                      {profile.phone}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon sx={{ fontSize: 18, opacity: 0.8 }} />
                    <Typography variant="body2" sx={{ color: '#e2e8f0' }}>
                      {profile.residence}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, mt: { xs: 2, md: 0 } }}>
              <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'row', md: 'column' } }}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                    backdropFilter: 'blur(5px)'
                  }}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{
                    borderColor: 'rgba(239, 68, 68, 0.5)',
                    color: '#ef4444',
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#ef4444',
                      bgcolor: 'rgba(239, 68, 68, 0.08)'
                    }
                  }}
                >
                  Logout
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Main content area */}
      <Box sx={{ 
        bgcolor: '#f8fafc', 
        minHeight: '60vh', 
        py: 4
      }}>
        <Container maxWidth="lg">
          {/* Navigation tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: '#0f172a',
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                },
              }}
            >
              <StyledTab icon={<DashboardIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Dashboard" />
              <StyledTab icon={<DirectionsCarIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="My Vehicles" />
              <StyledTab icon={<HistoryIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Rental History" />
              <StyledTab icon={<FavoriteIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Favorites" />
              <StyledTab icon={<CreditCardIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Payments" />
              <StyledTab icon={<SecurityIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Security" />
              <StyledTab icon={<SettingsIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Settings" />
            </Tabs>
          </Box>
          
          {/* Dashboard content */}
          {activeTab === 0 && (
            <Box>
              <Typography 
                variant="h5" 
                component="h2" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#0f172a',
                  mb: 3
                }}
              >
                Dashboard Overview
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
                                  src={car.images?.[0] ? `${process.env.REACT_APP_API_URL}/${car.images[0]}` : '/placeholder.jpg'}
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
            </Box>
          )}
          
          {/* Other tab content would go here */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: '#0f172a', mb: 3 }}>
                My Vehicles
              </Typography>
              {/* Vehicles content */}
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: '#0f172a', mb: 3 }}>
                Rental History
              </Typography>
              {/* History content */}
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
};

export default ProfilePage;
