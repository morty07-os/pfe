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
  Notifications as NotificationsIcon, Star as StarIcon,
  Dashboard as DashboardIcon, EventAvailable as EventAvailableIcon,
  Chat as ChatIcon, Send as SendIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { PostCarDialog } from '../components/PostCarDialog';
import ConversationDialog from '../components/ConversationDialog';

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
  const [isPostCarDialogOpen, setIsPostCarDialogOpen] = useState(false); // New state for dialog
  const [conversations, setConversations] = useState([]); // New state for conversations
  const [selectedConversation, setSelectedConversation] = useState(null); // New state for selected conversation
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        navigate('/');
        return;
      }
      const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      if (!response.ok) {
        const errorData = await response.json();
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        navigate('/');
        throw new Error(errorData.error || 'Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data);
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

      const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';
      const response = await fetch(`${apiUrl}/api/cars/user-cars`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user cars');
      }

      const data = await response.json();
      setUserCars(data);
    } catch (error) {
      console.error('Error fetching user cars:', error.message);
    }
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';
      const response = await fetch(`${apiUrl}/api/messages/conversations`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch conversations');
      }

      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error.message);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchUserCars();
    fetchConversations(); // Fetch conversations on component mount
  }, []);

  const handleLogout = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';
      const response = await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Logout failed');
      }

      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
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
                  onClick={() => navigate('/edit-profile')}
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
                        onClick={() => setIsPostCarDialogOpen(true)} // Open dialog
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
                            onClick={() => setIsPostCarDialogOpen(true)} // Open dialog
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
                                  src={car.images?.[0] || '/placeholder.jpg'}
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
                                    label={`DZD${car.price}/day`}
                                    size="small"
                                    sx={{
                                      bgcolor: '#f1f5f9',
                                      color: '#64748b',
                                      fontWeight: 500,
                                      fontSize: '0.7rem'
                                    }}
                                  />
                                  {car.status && (
                                    <Chip
                                      label={car.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} // Format status string
                                      size="small"
                                      sx={{
                                        fontWeight: 500,
                                        fontSize: '0.7rem',
                                        color: 'white',
                                        bgcolor: car.status === 'accepted'
                                          ? '#22c55e' // green-500
                                          : car.status === 'pending'
                                          ? '#3b82f6' // blue-500
                                          : car.status === 'rejected'
                                          ? '#ef4444' // red-500
                                          : car.status === 'awaiting_posting_approval'
                                          ? '#f97316' // orange-500
                                          : '#64748b', // slate-500 (default)
                                      }}
                                    />
                                  )}
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
                            onClick={() => setIsPostCarDialogOpen(true)} // Open dialog
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
                My Vehicles
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
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
                        onClick={() => setIsPostCarDialogOpen(true)} // Open dialog
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
                            onClick={() => setIsPostCarDialogOpen(true)} // Open dialog
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
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 2,
                                mb: 2,
                                borderRadius: 2,
                                border: '1px solid #e2e8f0',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  borderColor: '#cbd5e1',
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
                                  src={car.images?.[0] || '/placeholder.jpg'}
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
                                    label={`DZD${car.price}/day`}
                                    size="small"
                                    sx={{
                                      bgcolor: '#f1f5f9',
                                      color: '#64748b',
                                      fontWeight: 500,
                                      fontSize: '0.7rem'
                                    }}
                                  />
                                  {car.status && (
                                    <Chip
                                      label={car.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} // Format status string
                                      size="small"
                                      sx={{
                                        fontWeight: 500,
                                        fontSize: '0.7rem',
                                        color: 'white',
                                        bgcolor: car.status === 'accepted'
                                          ? '#22c55e' // green-500
                                          : car.status === 'pending'
                                          ? '#3b82f6' // blue-500
                                          : car.status === 'rejected'
                                          ? '#ef4444' // red-500
                                          : car.status === 'awaiting_posting_approval'
                                          ? '#f97316' // orange-500
                                          : '#64748b', // slate-500 (default)
                                      }}
                                    />
                                  )}
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
                            onClick={() => setIsPostCarDialogOpen(true)} // Open dialog
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
              </Grid>
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: '#334155', mb: 3, position: 'relative', display: 'inline-block', '&:after': { content: '""', position: 'absolute', bottom: -8, left: 0, width: '60px', height: '4px', backgroundColor: '#475569', borderRadius: '2px' } }}>
                Chats
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'row', sm: 'row' }, 
                flexWrap: 'nowrap',
                gap: 3,
                height: '100%',
                overflow: 'hidden'
              }}>
                {/* Conversation List */}
                <Box sx={{ 
                  width: { xs: '40%', sm: '35%', md: '30%' },
                  minWidth: { xs: '150px', sm: '250px' },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <StyledCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardHeader sx={{ 
                      background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                    }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
                      }}>
                        <ChatIcon sx={{ fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' } }} /> 
                        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Recent Conversations</Box>
                        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Chats</Box>
                      </Typography>
                      <Button 
                        variant="contained" 
                        size="small"
                        onClick={() => navigate('/messages')}
                        sx={{ 
                          bgcolor: 'rgba(226, 232, 240, 0.15)', 
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(226, 232, 240, 0.25)' },
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: { xs: '0.7rem', sm: '0.8rem' },
                          px: { xs: 1, sm: 2 }
                        }}
                      >
                        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>View All</Box>
                        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>All</Box>
                      </Button>
                    </CardHeader>
                    
                    <CardContent sx={{ 
                      p: { xs: 1, sm: 2, md: 3 }, 
                      flexGrow: 1, 
                      display: 'flex', 
                      flexDirection: 'column',
                      overflow: 'auto'
                    }}>
                      {conversations.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <ChatIcon sx={{ fontSize: { xs: 32, sm: 48 }, color: '#cbd5e1', mb: 2 }} />
                          <Typography variant="h6" sx={{ 
                            color: '#64748b', 
                            fontWeight: 600, 
                            mb: 1,
                            fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' }
                          }}>
                            No Chats
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: '#94a3b8', 
                            mb: 3,
                            fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                            display: { xs: 'none', sm: 'block' }
                          }}>
                            Your conversations will appear here.
                          </Typography>
                          <Button
                            variant="outlined"
                            onClick={() => navigate('/offers')}
                            sx={{
                              borderColor: '#475569',
                              color: '#475569',
                              borderRadius: 2,
                              px: { xs: 1, sm: 2, md: 3 },
                              py: 1,
                              textTransform: 'none',
                              fontWeight: 600,
                              fontSize: { xs: '0.7rem', sm: '0.8rem' },
                              '&:hover': {
                                borderColor: '#334155',
                                bgcolor: 'rgba(71, 85, 105, 0.04)'
                              }
                            }}
                          >
                            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Browse Vehicles</Box>
                            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Browse</Box>
                          </Button>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto' }}>
                          {conversations.map((conv) => (
                            <Paper
                              key={conv._id}
                              elevation={0}
                              onClick={() => setSelectedConversation(conv)}
                              sx={{
                                p: { xs: 1, sm: 1.5, md: 2 },
                                borderRadius: 2,
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: { xs: 1, sm: 1.5, md: 2 },
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out',
                                backgroundColor: selectedConversation && selectedConversation._id === conv._id ? '#f1f5f9' : 'transparent',
                                '&:hover': {
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                  transform: 'translateY(-2px)',
                                  bgcolor: '#f8fafc'
                                }
                              }}
                            >
                              <Avatar sx={{ 
                                bgcolor: '#475569',
                                width: { xs: 30, sm: 35, md: 40 },
                                height: { xs: 30, sm: 35, md: 40 },
                                fontSize: { xs: '0.8rem', sm: '1rem', md: '1.2rem' }
                              }}>
                                {conv.otherUser?.firstName?.[0]?.toUpperCase() || 'U'}
                              </Avatar>
                              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                <Typography variant="subtitle1" sx={{ 
                                  fontWeight: 700, 
                                  color: '#334155',
                                  fontSize: { xs: '0.75rem', sm: '0.85rem', md: '1rem' },
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {conv.otherUser?.firstName} {conv.otherUser?.lastName}
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                  color: '#64748b',
                                  fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' },
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {conv.car?.carName || 'N/A'}
                                </Typography>
                                {conv.lastMessage && (
                                  <Typography variant="caption" noWrap sx={{ 
                                    color: '#94a3b8', 
                                    mt: 0.5,
                                    fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.75rem' },
                                    display: { xs: 'none', sm: 'block' }
                                  }}>
                                    {conv.lastMessage.text}
                                  </Typography>
                                )}
                              </Box>
                              <Typography variant="caption" sx={{ 
                                color: '#94a3b8', 
                                flexShrink: 0,
                                fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.75rem' },
                                display: { xs: 'none', sm: 'block' }
                              }}>
                                {conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt).toLocaleDateString() : ''}
                              </Typography>
                            </Paper>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </StyledCard>
                </Box>

                {/* Chat Window (conditionally rendered) */}
                <Box sx={{ 
                  flexGrow: 1,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {selectedConversation ? (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <ConversationDialog
                        userId={selectedConversation.otherUser._id}
                        carId={selectedConversation.car._id}
                        conversationId={selectedConversation._id}
                      />
                    </Box>
                  ) : (
                    <StyledCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ 
                        flexGrow: 1, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        py: 4 
                      }}>
                        <ChatIcon sx={{ fontSize: { xs: 32, sm: 48 }, color: '#cbd5e1', mb: 2 }} />
                        <Typography variant="h6" sx={{ 
                          color: '#64748b', 
                          fontWeight: 600, 
                          mb: 1,
                          fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' },
                          textAlign: 'center'
                        }}>
                          Select a Conversation
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#94a3b8', 
                          mb: 3, 
                          textAlign: 'center',
                          fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                          display: { xs: 'none', sm: 'block' }
                        }}>
                          Click on a conversation from the left panel to view messages.
                        </Typography>
                      </CardContent>
                    </StyledCard>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </Container>
      </Box>
      <PostCarDialog 
        open={isPostCarDialogOpen} 
        onClose={() => setIsPostCarDialogOpen(false)} 
      />
    </>
  );
};

export default ProfilePage;
