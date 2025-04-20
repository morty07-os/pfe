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
import WilayaDropdown from '../components/WilayaDropdown';
import { useNavigate, useParams } from 'react-router-dom';

// Mapping wilaya names to coordinates and zoom
const wilayaCoordinates = {
  "Adrar": { lat: 27.8743, lon: -0.2939, zoom: 12 },
  "Chlef": { lat: 36.1667, lon: 1.3333, zoom: 12 },
  "Laghouat": { lat: 33.8, lon: 2.8651, zoom: 12 },
  "Oum El Bouaghi": { lat: 35.8762, lon: 7.1135, zoom: 12 },
  "Batna": { lat: 35.5556, lon: 6.1744, zoom: 12 },
  "Béjaïa": { lat: 36.7519, lon: 5.055, zoom: 12 },
  "Biskra": { lat: 34.8504, lon: 5.7281, zoom: 12 },
  "Béchar": { lat: 31.6167, lon: -2.2167, zoom: 12 },
  "Blida": { lat: 36.4700, lon: 2.8277, zoom: 12 },
  "Bouira": { lat: 36.3749, lon: 3.9014, zoom: 12 },
  "Tamanrasset": { lat: 22.785, lon: 5.5228, zoom: 12 },
  "Tébessa": { lat: 35.4042, lon: 8.1242, zoom: 12 },
  "Tlemcen": { lat: 34.8828, lon: -1.3160, zoom: 12 },
  "Tiaret": { lat: 35.3713, lon: 1.3167, zoom: 12 },
  "Tizi Ouzou": { lat: 36.7167, lon: 4.05, zoom: 12 },
  "Algiers": { lat: 36.7538, lon: 3.0588, zoom: 12 },
  "Djelfa": { lat: 34.6666, lon: 3.25, zoom: 12 },
  "Jijel": { lat: 36.821, lon: 5.7667, zoom: 12 },
  "Sétif": { lat: 36.1911, lon: 5.4137, zoom: 12 },
  "Saïda": { lat: 34.8303, lon: 0.1517, zoom: 12 },
  "Skikda": { lat: 36.8663, lon: 6.9063, zoom: 12 },
  "Sidi Bel Abbès": { lat: 35.1899, lon: -0.6307, zoom: 12 },
  "Annaba": { lat: 36.904, lon: 7.7566, zoom: 12 },
  "Guelma": { lat: 36.4622, lon: 7.4261, zoom: 12 },
  "Constantine": { lat: 36.365, lon: 6.6147, zoom: 12 },
  "Médéa": { lat: 36.2645, lon: 2.7539, zoom: 12 },
  "Mostaganem": { lat: 35.9333, lon: 0.0833, zoom: 12 },
  "M'Sila": { lat: 35.7058, lon: 4.545, zoom: 12 },
  "Mascara": { lat: 35.3967, lon: 0.1403, zoom: 12 },
  "Ouargla": { lat: 31.95, lon: 5.3333, zoom: 12 },
  "Oran": { lat: 35.6971, lon: -0.6308, zoom: 12 },
  "El Bayadh": { lat: 33.6839, lon: 1.0191, zoom: 12 },
  "Illizi": { lat: 26.4833, lon: 8.4667, zoom: 12 },
  "Bordj Bou Arréridj": { lat: 36.0733, lon: 4.7617, zoom: 12 },
  "Boumerdès": { lat: 36.7664, lon: 3.4776, zoom: 12 },
  "El Tarf": { lat: 36.7675, lon: 8.3132, zoom: 12 },
  "Tindouf": { lat: 27.6742, lon: -8.1477, zoom: 12 },
  "Tissemsilt": { lat: 35.6072, lon: 1.8103, zoom: 12 },
  "El Oued": { lat: 33.3561, lon: 6.8632, zoom: 12 },
  "Khenchela": { lat: 35.4358, lon: 7.1433, zoom: 12 },
  "Souk Ahras": { lat: 36.2864, lon: 7.9511, zoom: 12 },
  "Tipaza": { lat: 36.6178, lon: 2.3912, zoom: 12 },
  "Mila": { lat: 36.4503, lon: 6.2644, zoom: 12 },
  "Aïn Defla": { lat: 36.2649, lon: 1.9679, zoom: 12 },
  "Naâma": { lat: 33.2667, lon: -0.3167, zoom: 12 },
  "Aïn Témouchent": { lat: 35.2975, lon: -1.1404, zoom: 12 },
  "Ghardaïa": { lat: 32.4894, lon: 3.6731, zoom: 12 },
  "Relizane": { lat: 35.7372, lon: 0.5559, zoom: 12 },
  "Timimoun": { lat: 29.2639, lon: 0.2306, zoom: 12 },
  "Bordj Badji Mokhtar": { lat: 21.3275, lon: -0.9264, zoom: 12 },
  "Ouled Djellal": { lat: 34.4167, lon: 4.9667, zoom: 12 },
  "Béni Abbès": { lat: 30.1336, lon: -2.1667, zoom: 12 },
  "In Salah": { lat: 27.2167, lon: 2.4667, zoom: 12 },
  "In Guezzam": { lat: 19.5667, lon: 5.7667, zoom: 12 },
  "Touggourt": { lat: 33.1044, lon: 6.0606, zoom: 12 },
  "Djanet": { lat: 24.5546, lon: 9.4846, zoom: 12 },
  "El M'Ghair": { lat: 33.9500, lon: 5.9200, zoom: 12 },
  "El Menia": { lat: 30.5833, lon: 2.8833, zoom: 12 },
};

const MapPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  // const { wilaya } = useParams();
  const [wilaya, setWilaya] = useState('Algiers');
  const [selectedLocation, setSelectedLocation] = useState(null);

  // When wilaya changes, reset selected location
  const handleWilayaChange = (newWilaya) => {
    setWilaya(newWilaya);
    setSelectedLocation(null);
  };

  // Determine city coordinates and zoom
  const cityCoords = wilayaCoordinates[wilaya] || { lat: 28.0339, lon: 1.6596, zoom: 7 }; // fallback: Algeria center
  // Calculate bbox for zoom (smaller bbox = more zoom)
  const delta = cityCoords.zoom >= 12 ? 0.08 : 1.5; // zoom in for city, out for fallback
  const bbox = [
    cityCoords.lon - delta,
    cityCoords.lat - delta,
    cityCoords.lon + delta,
    cityCoords.lat + delta
  ].join(",");
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${cityCoords.lat},${cityCoords.lon}`;
  
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
      <Navbar sx={{ backgroundColor: '#111', color: '#fff' }} iconColor="#fff" />
      <QuickSearch noBackground={true} sx={{ mt: 0, mb: 0, pt: 0, pb: 0 }} />
      <Box sx={{ mt: 2, mb: 2, maxWidth: 350 }}>
        <WilayaDropdown value={wilaya} onChange={handleWilayaChange} />
      </Box>
      <Box sx={{ 
        flexGrow: 1,
        position: 'relative',
        mt: 6 // 48px margin top to pull the map a little bit lower
      }}>
        <Container maxWidth="xl" sx={{ pt: 0, mt: 0 }}>
          <Box sx={{ mb: 1, mt: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
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
          
          <Grid container spacing={4} direction={{ xs: 'column-reverse', md: 'row' }} alignItems="stretch">
            {/* Pick up locations list */}
            <Grid item xs={12} md={4}>
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
            {/* Divider between locations and map */}
            <Grid item xs={12} md={0.1} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', alignItems: 'stretch', px: 0 }}>
              <Divider orientation="vertical" flexItem sx={{ height: '100%' }} />
            </Grid>
            <Grid item xs={12} md={7.9} sx={{ display: { md: 'flex' }, justifyContent: { md: 'flex-end' } }}>
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
                  position: 'relative',
                  height: '100%',
                  minHeight: '80vh', // Even larger min height for box
                  width: '100%'
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
                    background: '#fff',
                    position: 'relative',
                    overflow: 'hidden',
                    width: '100%'
                  }}>
                    <iframe 
                      src={mapUrl}
                      frameBorder="0"
                      style={{ 
                        border: 'none', 
                        width: '100%', 
                        height: '90vh', // Even larger height for the map
                        width: '100%'
                      }}
                      title={`Map of ${wilaya}`}
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
