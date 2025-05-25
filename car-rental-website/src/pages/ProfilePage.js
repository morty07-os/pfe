import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Avatar, CircularProgress, IconButton,
  Tooltip, Button, Chip, Container, Grid, Divider, Card, CardContent,
  Tab, Tabs, Badge, LinearProgress, Rating, Link, TextField
} from '@mui/material';
import {
  Edit as EditIcon, Logout as LogoutIcon,
  LocationOn as LocationOnIcon, Phone as PhoneIcon,
  Email as EmailIcon, Person as PersonIcon, CalendarToday as CalendarIcon,
  DirectionsCar as DirectionsCarIcon, History as HistoryIcon, 
  AddCircle as AddCircleIcon, Verified as VerifiedIcon, 
  Settings as SettingsIcon,
  Notifications as NotificationsIcon, Star as StarIcon,
  Dashboard as DashboardIcon,
  Favorite as FavoriteIcon, EventAvailable as EventAvailableIcon,
  Chat as ChatIcon, Send as SendIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 10px 30px rgba(51, 65, 85, 0.08)',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  backgroundColor: '#ffffff',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 35px rgba(51, 65, 85, 0.15)',
  },
}));

const CardHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5, 3),
  background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
  color: 'white',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid rgba(226, 232, 240, 0.1)',
  boxShadow: '0 4px 12px rgba(71, 85, 105, 0.15)'
}));

const GlassCard = styled(Box)(({ theme }) => ({
  backdropFilter: 'blur(10px)',
  backgroundColor: alpha('#f8fafc', 0.8),
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
    color: '#334155',
    backgroundColor: 'rgba(203, 213, 225, 0.4)',
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
          bgcolor: '#f1f5f9'
        }}>
          <CircularProgress sx={{ color: '#334155' }} />
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
                  bgcolor: '#334155',
                  '&:hover': { bgcolor: '#1e293b' },
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
        background: 'linear-gradient(135deg, #334155 0%, #64748b 100%)',
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
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
          backgroundSize: '24px 24px',
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
                    color: '#334155',
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
                      <VerifiedIcon sx={{ color: '#475569', fontSize: 28, bgcolor: 'white', borderRadius: '50%', padding: '2px' }} />
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
                    icon={<EventAvailableIcon sx={{ color: '#0f172a' }} />}
                    label={`Member since ${new Date(profile.createdAt).getFullYear() || new Date().getFullYear()}`}
                    sx={{
                      bgcolor: '#e2e8f0',
                      color: '#0f172a',
                      fontWeight: 600,
                      borderColor: '#cbd5e1',
                      border: '1px solid',
                      py: 0.5,
                      '& .MuiChip-label': {
                        px: 1
                      }
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
                    bgcolor: 'rgba(226, 232, 240, 0.1)',
                    color: 'white',
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { bgcolor: 'rgba(226, 232, 240, 0.2)' },
                    backdropFilter: 'blur(5px)'
                  }}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="contained"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{
                    bgcolor: '#475569',
                    color: 'white',
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    border: '2px solid #e2e8f0',
                    boxShadow: '0 4px 6px rgba(15, 23, 42, 0.1)',
                    '&:hover': {
                      bgcolor: '#334155',
                      borderColor: '#cbd5e1'
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
        bgcolor: '#f1f5f9', 
        minHeight: '60vh', 
        py: 4,
        backgroundImage: 'linear-gradient(rgba(226, 232, 240, 0.9) 0%, rgba(226, 232, 240, 0.9) 100%), url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23cbd5e1\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        backgroundSize: '60px 60px'
      }}>
        <Container maxWidth="lg">
          {/* Navigation tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4, backgroundColor: '#f8fafc', borderRadius: '12px 12px 0 0', boxShadow: '0 4px 6px -1px rgba(51, 65, 85, 0.05)', p: 1 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: '#475569',
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                },
              }}
            >
              <StyledTab icon={<DashboardIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Dashboard" />
              <StyledTab icon={<DirectionsCarIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="My Vehicles" />
              <StyledTab icon={<ChatIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Chats" />
              <StyledTab icon={<FavoriteIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Favorites" />
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
                  color: '#334155',
                  mb: 3,
                  position: 'relative',
                  display: 'inline-block',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: 0,
                    width: '60px',
                    height: '4px',
                    backgroundColor: '#475569',
                    borderRadius: '2px'
                  }
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
                      <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center', mb: 3 }}>
                        {profile.firstName} {profile.lastName}
                      </Typography>
                      
                      <Divider sx={{ mb: 2 }} />
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <EmailIcon sx={{ color: '#64748b' }} />
                          <Box>
                            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                              Email Address
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#475569' }}>
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
                            <Typography variant="body1" sx={{ color: '#475569' }}>
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
                            <Typography variant="body1" sx={{ color: '#475569' }}>
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
                    <CardHeader sx={{ 
                      background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DirectionsCarIcon /> My Vehicles
                      </Typography>
                      <Button 
                        variant="contained" 
                        size="small"
                        startIcon={<AddCircleIcon />}
                        onClick={() => navigate('/add-car')}
                        sx={{ 
                          bgcolor: 'rgba(226, 232, 240, 0.15)', 
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(226, 232, 240, 0.25)' },
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
                              bgcolor: '#334155',
                              '&:hover': { bgcolor: '#1e293b' },
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
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#334155' }}>
                                  {car.carName}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                                  <Chip
                                    label={car.brand}
                                    size="small"
                                    sx={{
                                      bgcolor: '#e2e8f0',
                                      color: '#475569',
                                      fontWeight: 500,
                                      fontSize: '0.7rem'
                                    }}
                                  />
                                  <Chip
                                    label={`€${car.price}/day`}
                                    size="small"
                                    sx={{
                                      bgcolor: '#f1f5f9',
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
                    <CardHeader sx={{ 
                      background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ChatIcon /> Chats
                      </Typography>
                      <Button 
                        variant="contained" 
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(226, 232, 240, 0.15)', 
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(226, 232, 240, 0.25)' },
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
                          No Active Conversations
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                          Your conversations with car owners and renters will appear here
                        </Typography>
                        <Button
                          variant="outlined"
                          onClick={() => navigate('/offers')}
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
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: '#334155', mb: 3, position: 'relative', display: 'inline-block', '&:after': { content: '""', position: 'absolute', bottom: -8, left: 0, width: '60px', height: '4px', backgroundColor: '#475569', borderRadius: '2px' } }}>
                Chats
              </Typography>
              
              {/* Chat Interface */}
              <Grid container spacing={3}>
                {/* Chat List */}
                <Grid item xs={12} md={4}>
                  <Paper elevation={2} sx={{ height: '100%', borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ p: 2, bgcolor: '#1e293b', color: 'white' }}>
                      <Typography variant="h6">Recent Conversations</Typography>
                    </Box>
                    <Box sx={{ height: '500px', overflowY: 'auto' }}>
                      {/* Sample conversation items */}
                      <Box 
                        sx={{ 
                          p: 2, 
                          borderBottom: '1px solid #e2e8f0', 
                          cursor: 'pointer',
                          bgcolor: '#f8fafc',
                          '&:hover': { bgcolor: '#f1f5f9' }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#475569' }}>JD</Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>John Doe</Typography>
                              <Typography variant="caption" sx={{ color: '#64748b' }}>2h ago</Typography>
                            </Box>
                            <Typography variant="body2" noWrap sx={{ color: '#475569' }}>
                              BMW X5 • Booking Confirmed
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Box 
                        sx={{ 
                          p: 2, 
                          borderBottom: '1px solid #e2e8f0', 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: '#f1f5f9' }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#64748b' }}>AS</Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Alice Smith</Typography>
                              <Typography variant="caption" sx={{ color: '#64748b' }}>Yesterday</Typography>
                            </Box>
                            <Typography variant="body2" noWrap sx={{ color: '#475569' }}>
                              Mercedes C-Class • Pending
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Box 
                        sx={{ 
                          p: 2, 
                          borderBottom: '1px solid #e2e8f0', 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: '#f1f5f9' }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#94a3b8' }}>RJ</Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Robert Johnson</Typography>
                              <Typography variant="caption" sx={{ color: '#64748b' }}>3 days ago</Typography>
                            </Box>
                            <Typography variant="body2" noWrap sx={{ color: '#475569' }}>
                              Audi A4 • Completed
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                
                {/* Chat Messages */}
                <Grid item xs={12} md={8}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      height: '500px',
                      borderRadius: 2,
                      overflow: 'hidden',
                      background: '#fff'
                    }}
                  >
                    {/* Selected Chat Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2, borderBottom: '1px solid #e2e8f0' }}>
                      <Avatar sx={{ bgcolor: '#475569' }}>JD</Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>John Doe</Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>BMW X5 • Booking Confirmed</Typography>
                      </Box>
                    </Box>
                    
                    {/* Messages Container */}
                    <Box sx={{ flexGrow: 1, overflowY: 'auto', my: 2, px: 1 }}>
                      {/* Sample messages */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-start',
                          mb: 1.5,
                        }}
                      >
                        <Paper
                          elevation={1}
                          sx={{
                            p: 1.5,
                            borderRadius: '12px 12px 12px 0',
                            bgcolor: '#e2e8f0',
                            color: '#1e293b',
                            maxWidth: '70%',
                            wordBreak: 'break-word'
                          }}
                        >
                          <Typography variant="body2">Hello! I see you are interested in booking my BMW X5.</Typography>
                          <Typography 
                              variant="caption" 
                              display="block" 
                              sx={{ 
                                  mt: 0.5, 
                                  textAlign: 'right', 
                                  fontSize: '0.65rem',
                                  color: '#64748b'
                              }}
                          >
                              10:30 AM
                          </Typography>
                        </Paper>
                      </Box>
                      
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          mb: 1.5,
                        }}
                      >
                        <Paper
                          elevation={1}
                          sx={{
                            p: 1.5,
                            borderRadius: '12px 12px 0 12px',
                            bgcolor: '#1e293b',
                            color: 'white',
                            maxWidth: '70%',
                            wordBreak: 'break-word'
                          }}
                        >
                          <Typography variant="body2">Yes, I would like to confirm the dates from July 15 to July 20.</Typography>
                          <Typography 
                              variant="caption" 
                              display="block" 
                              sx={{ 
                                  mt: 0.5, 
                                  textAlign: 'right', 
                                  fontSize: '0.65rem',
                                  color: '#cbd5e1'
                              }}
                          >
                              10:32 AM
                          </Typography>
                        </Paper>
                      </Box>
                      
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-start',
                          mb: 1.5,
                        }}
                      >
                        <Paper
                          elevation={1}
                          sx={{
                            p: 1.5,
                            borderRadius: '12px 12px 12px 0',
                            bgcolor: '#e2e8f0',
                            color: '#1e293b',
                            maxWidth: '70%',
                            wordBreak: 'break-word'
                          }}
                        >
                          <Typography variant="body2">Perfect! Those dates are available. The total cost will be $750 for 5 days. Would you like to proceed with the booking?</Typography>
                          <Typography 
                              variant="caption" 
                              display="block" 
                              sx={{ 
                                  mt: 0.5, 
                                  textAlign: 'right', 
                                  fontSize: '0.65rem',
                                  color: '#64748b'
                              }}
                          >
                              10:35 AM
                          </Typography>
                        </Paper>
                      </Box>
                    </Box>
                    
                    {/* Message Input */}
                    <Box sx={{ display: 'flex', alignItems: 'center', borderTop: '1px solid #e2e8f0', pt: 2 }}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Type your message..."
                        size="small"
                        sx={{ 
                            mr: 1,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '20px',
                                backgroundColor: '#f1f5f9',
                                '& fieldset': {
                                    borderColor: 'transparent',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#cbd5e1',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#475569',
                                },
                            },
                        }}
                      />
                      <IconButton 
                        sx={{ 
                            bgcolor: '#1e293b', 
                            color: 'white',
                            '&:hover': { bgcolor: '#334155' },
                        }}
                      >
                        <SendIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
};

export default ProfilePage;
