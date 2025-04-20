import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Card,
  CardContent
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Navbar from '../components/Navbar';
import QuickSearch from '../components/QuickSearch';
import { useNavigate, useParams } from 'react-router-dom';

const MapPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { wilaya } = useParams();
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // Sample locations for the selected wilaya
  const locations = [
    { 
      id: 1, 
      name: 'Downtown', 
      address: `Central ${wilaya}, Main Street`, 
      availableCars: 8,
      openHours: '24/7',
      hasParking: true
    },
    { 
      id: 2, 
      name: 'Airport', 
      address: `${wilaya} International Airport, Terminal 1`, 
      availableCars: 12,
      openHours: '24/7',
      hasParking: true
    },
    { 
      id: 3, 
      name: 'Shopping Mall', 
      address: `${wilaya} Mall, Commercial District`, 
      availableCars: 5,
      openHours: '9:00 AM - 10:00 PM',
      hasParking: true
    },
    { 
      id: 4, 
      name: 'Train Station', 
      address: `${wilaya} Central Station, Railway Avenue`, 
      availableCars: 7,
      openHours: '6:00 AM - 11:00 PM',
      hasParking: true
    }
  ];

  const handleGoBack = () => {
    navigate('/');
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Navbar />
      <QuickSearch />
      
      <Box sx={{ 
        flexGrow: 1,
        position: 'relative'
      }}>
        <Container maxWidth="xl" sx={{ pt: 2 }}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<ArrowBackIcon />}
              onClick={handleGoBack}
              sx={{
                borderColor: '#475569',
                color: '#475569',
                '&:hover': {
                  borderColor: '#334155',
                  bgcolor: 'rgba(71, 85, 105, 0.04)'
                }
              }}
            >
              Back to City Selection
            </Button>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600, color: '#1e293b' }}>
              {wilaya} Rental Locations
            </Typography>
          </Box>
          
          <Grid container spacing={4} direction={{ xs: 'column-reverse', md: 'row' }}>
            {/* Location list */}
            <Grid item xs={12} md={3}>
              <Paper 
                elevation={2} 
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  height: '100%',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Box sx={{ 
                  background: 'linear-gradient(90deg, #475569 0%, #334155 100%)', 
                  color: 'white',
                  p: 2
                }}>
                  <Typography variant="h6">
                    Available Pickup Locations
                  </Typography>
                </Box>
                
                <List sx={{ p: 0 }}>
                  {locations.map((location, index) => (
                    <React.Fragment key={location.id}>
                      {index > 0 && <Divider />}
                      <ListItem 
                        button
                        selected={selectedLocation?.id === location.id}
                        onClick={() => handleLocationSelect(location)}
                        sx={{
                          p: 2,
                          transition: 'all 0.2s ease',
                          '&.Mui-selected': {
                            bgcolor: 'rgba(71, 85, 105, 0.1)',
                            '&:hover': {
                              bgcolor: 'rgba(71, 85, 105, 0.15)',
                            }
                          },
                          '&:hover': {
                            bgcolor: 'rgba(71, 85, 105, 0.05)',
                          }
                        }}
                      >
                        <ListItemIcon>
                          <LocationOnIcon sx={{ 
                            color: selectedLocation?.id === location.id ? '#e11d48' : '#475569',
                            fontSize: 28
                          }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <Typography variant="subtitle1" sx={{ 
                              fontWeight: selectedLocation?.id === location.id ? 700 : 600,
                              color: '#1e293b'
                            }}>
                              {location.name}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                {location.address}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <DirectionsCarIcon sx={{ fontSize: 16, color: '#64748b' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {location.availableCars} cars
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <AccessTimeIcon sx={{ fontSize: 16, color: '#64748b' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {location.openHours}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
                
                {selectedLocation && (
                  <Box sx={{ p: 3, bgcolor: 'rgba(71, 85, 105, 0.05)' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>
                      Selected Location Details
                    </Typography>
                    
                    <Card elevation={0} sx={{ mb: 2, bgcolor: 'white', borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600, mb: 1 }}>
                          {selectedLocation.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                          {selectedLocation.address}
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <DirectionsCarIcon sx={{ color: '#475569' }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                                  Available Cars
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {selectedLocation.availableCars}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AccessTimeIcon sx={{ color: '#475569' }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                                  Open Hours
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {selectedLocation.openHours}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                    
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        bgcolor: '#475569',
                        color: 'white',
                        py: 1.2,
                        borderRadius: 2,
                        boxShadow: '0 4px 14px rgba(71, 85, 105, 0.4)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: '#334155',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(71, 85, 105, 0.5)'
                        }
                      }}
                    >
                      Select This Location
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
            
            {/* Map */}
            <Grid item xs={12} md={9}>
              <Paper 
                elevation={2} 
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  height: '100%',
                  minHeight: 800,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Box sx={{ 
                  position: 'relative',
                  height: '100%',
                  minHeight: 500
                }}>
                  {/* Map header */}
                  <Box sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    background: 'linear-gradient(90deg, #475569 0%, #334155 100%)', 
                    color: 'white',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <LocationOnIcon /> 
                    <Typography variant="h6">
                      {wilaya}, Algeria
                    </Typography>
                  </Box>
                  
                  {/* Map - Using OpenStreetMap which doesn't require API key */}
                  <Box sx={{ 
                    height: '100%',
                    background: '#e5e7eb',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <iframe 
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=0,30,10,40&layer=mapnik&marker=36.7,3.05`}
                      frameBorder="0"
                      style={{ 
                        border: 'none', 
                        width: '100%', 
                        height: '100%' 
                      }}
                      title="Map of Algeria"
                      allowFullScreen
                    />
                    {/* Map markers */}
                    {locations.map((location, index) => (
                      <Box 
                        key={location.id}
                        sx={{ 
                          position: 'absolute',
                          top: `${20 + (index * 15)}%`,
                          left: `${20 + (index * 15)}%`,
                          transform: 'translate(-50%, -100%)',
                          color: selectedLocation?.id === location.id ? '#e11d48' : '#475569',
                          animation: selectedLocation?.id === location.id ? 'pulse 1.5s infinite' : 'none',
                          cursor: 'pointer',
                          zIndex: selectedLocation?.id === location.id ? 2 : 1,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translate(-50%, -110%)',
                            color: '#e11d48'
                          }
                        }}
                        onClick={() => handleLocationSelect(location)}
                      >
                        <LocationOnIcon sx={{ 
                          fontSize: selectedLocation?.id === location.id ? 48 : 36,
                          filter: selectedLocation?.id === location.id ? 'drop-shadow(0 0 8px rgba(225, 29, 72, 0.5))' : 'none'
                        }} />
                        {selectedLocation?.id === location.id && (
                          <Paper 
                            elevation={3} 
                            sx={{ 
                              p: 1.5, 
                              borderRadius: 2, 
                              mt: -0.5,
                              minWidth: 150,
                              textAlign: 'center',
                              position: 'absolute',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              bgcolor: 'rgba(255, 255, 255, 0.95)'
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                              {location.name}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: '#64748b' }}>
                              {location.availableCars} cars available
                            </Typography>
                          </Paper>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default MapPage;
