import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Button,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MapIcon from '@mui/icons-material/Map';
import Navbar from '../components/Navbar';
import QuickSearch from '../components/QuickSearch';
import WilayaDropdown from '../components/WilayaDropdown';
import { useNavigate, useParams } from 'react-router-dom';

// Mapping wilaya names to coordinates and zoom
const wilayaCoordinates = {
  "Adrar": { lat: 27.8743, lon: -0.2939, zoom: 11 },
  "Chlef": { lat: 36.1667, lon: 1.3333, zoom: 12 },
  "Laghouat": { lat: 33.8, lon: 2.8651, zoom: 12 },
  "Oum El Bouaghi": { lat: 35.8762, lon: 7.1135, zoom: 12 },
  "Batna": { lat: 35.5556, lon: 6.1744, zoom: 12 },
  "Béjaïa": { lat: 36.7519, lon: 5.055, zoom: 12 },
  "Biskra": { lat: 34.8504, lon: 5.7281, zoom: 12 },
  "Béchar": { lat: 31.6167, lon: -2.2167, zoom: 11 },
  "Blida": { lat: 36.4700, lon: 2.8277, zoom: 13 },
  "Bouira": { lat: 36.3749, lon: 3.9014, zoom: 12 },
  "Tamanrasset": { lat: 22.785, lon: 5.5228, zoom: 11 },
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
  "Annaba": { lat: 36.9142, lon: 7.7427, zoom: 13 },
  "Guelma": { lat: 36.4627, lon: 7.4330, zoom: 12 },
  "Constantine": { lat: 36.3650, lon: 6.6147, zoom: 13 },
  "Médéa": { lat: 36.2675, lon: 2.7500, zoom: 12 },
  "Mostaganem": { lat: 35.9311, lon: 0.0898, zoom: 12 },
  "M'Sila": { lat: 35.7058, lon: 4.5419, zoom: 12 },
  "Mascara": { lat: 35.3971, lon: 0.1400, zoom: 12 },
  "Ouargla": { lat: 31.9527, lon: 5.3223, zoom: 12 },
  "Oran": { lat: 35.6969, lon: -0.6331, zoom: 13 },
  "El Bayadh": { lat: 33.6833, lon: 1.0167, zoom: 12 },
  "Illizi": { lat: 26.5000, lon: 8.4833, zoom: 11 },
  "Bordj Bou Arréridj": { lat: 36.0730, lon: 4.7635, zoom: 12 },
  "Boumerdès": { lat: 36.7664, lon: 3.4783, zoom: 12 },
  "El Tarf": { lat: 36.7666, lon: 8.3166, zoom: 12 },
  "Tindouf": { lat: 27.6711, lon: -8.1478, zoom: 11 },
  "Tissemsilt": { lat: 35.6072, lon: 1.8106, zoom: 12 },
  "El Oued": { lat: 33.3680, lon: 6.8516, zoom: 12 },
  "Khenchela": { lat: 35.4300, lon: 7.1400, zoom: 12 },
  "Souk Ahras": { lat: 36.2863, lon: 7.9511, zoom: 12 },
  "Tipaza": { lat: 36.5892, lon: 2.4181, zoom: 12 },
  "Mila": { lat: 36.4500, lon: 6.2500, zoom: 12 },
  "Aïn Defla": { lat: 36.2500, lon: 1.9500, zoom: 12 },
  "Naâma": { lat: 33.2667, lon: -0.3167, zoom: 11 },
  "Aïn Témouchent": { lat: 35.3000, lon: -1.1400, zoom: 12 },
  "Ghardaïa": { lat: 32.4902, lon: 3.6445, zoom: 12 },
  "Relizane": { lat: 35.7373, lon: 0.5560, zoom: 12 }
};

const MapPage = () => {
  const navigate = useNavigate();
  const { wilayaName } = useParams();
  const [wilaya, setWilaya] = useState(wilayaName || 'Algiers');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // When wilaya changes
  const handleWilayaChange = (newWilaya) => {
    setWilaya(newWilaya);
    setMapLoaded(false);
    setMapError(false);
    setRetryCount(0);
  };

  // Handle going back to city selection
  const handleGoBack = () => {
    navigate('/');
  };

  // Generate map URL with the correct coordinates and zoom
  const cityCoords = wilayaCoordinates[wilaya] || { lat: 28.0339, lon: 1.6596, zoom: 7 }; // fallback: Algeria center
  
  // Use the specific zoom level for each wilaya
  const zoomLevel = cityCoords.zoom || 12;
  
  // Use Google Maps for better reliability
  const mapUrl = `https://maps.google.com/maps?q=${cityCoords.lat},${cityCoords.lon}&z=${zoomLevel}&output=embed`;

  // Handle map load event
  const handleMapLoad = () => {
    setMapLoaded(true);
    setMapError(false);
    
    // Show success message
    setSnackbarMessage(`Map for ${wilaya} loaded successfully`);
    setSnackbarOpen(true);
    
    // Auto-hide the message after 2 seconds
    setTimeout(() => {
      setSnackbarOpen(false);
    }, 2000);
  };

  // Handle map load error
  const handleMapError = () => {
    setMapError(true);
    
    // If we haven't exceeded retry attempts, try again
    if (retryCount < 2) {
      setRetryCount(prev => prev + 1);
      
      // Show retry message
      setSnackbarMessage(`Retrying map load for ${wilaya}...`);
      setSnackbarOpen(true);
      
      // Try again after a short delay
      setTimeout(() => {
        setMapLoaded(false);
        setMapError(false);
      }, 1500);
    } else {
      // Show error message
      setSnackbarMessage(`Could not load map for ${wilaya}. Please try another wilaya.`);
      setSnackbarOpen(true);
    }
  };

  // Close snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Preload maps for better responsiveness
  useEffect(() => {
    // Preload the current map
    const img = new Image();
    img.src = `https://maps.googleapis.com/maps/api/staticmap?center=${cityCoords.lat},${cityCoords.lon}&zoom=${zoomLevel}&size=400x400&key=`;
  }, [wilaya, cityCoords.lat, cityCoords.lon, zoomLevel]);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f8fafc' // Light background for the entire page
    }}>
      <Navbar sx={{ backgroundColor: '#111', color: '#fff' }} iconColor="#fff" />
      <QuickSearch noBackground={true} sx={{ mt: 0, mb: 0, pt: 0, pb: 0 }} />
      
      {/* Page header with subtle gradient */}
      <Box sx={{
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
        py: 3,
        borderBottom: '1px solid #e2e8f0',
        mb: 3,
        width: '100%'
      }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleGoBack}
              sx={{
                borderColor: '#cbd5e1',
                color: '#475569',
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#94a3b8',
                  backgroundColor: 'rgba(203, 213, 225, 0.1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Back to City Selection
            </Button>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#1e293b', letterSpacing: '-0.5px' }}>
              {wilaya} Rental Locations
            </Typography>
          </Box>
        </Container>
      </Box>

      <Box sx={{
        flexGrow: 1,
        position: 'relative',
        width: '100%'
      }}>
        {/* Full width container with minimal padding */}
        <Box sx={{ width: '100%', px: 0 }}>
          
          {/* Wilaya Dropdown - Centered above the map with blue-grey color scheme */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center', 
            width: '100%', 
            mb: 3,
            mt: 0,
            position: 'relative',
            mx: 'auto',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-15px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80px',
              height: '4px',
              borderRadius: '4px',
              background: 'linear-gradient(to right, #546E7A, #37474F)',
              opacity: 0.8
            }
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
                textAlign: 'center', 
                color: '#334155', 
                fontWeight: 600,
                letterSpacing: '0.5px',
                px: 2
              }}
            >
              Select a Wilaya to view the map
            </Typography>
            <Box sx={{ 
              width: { xs: '90%', sm: '60%', md: '40%' }, 
              maxWidth: '400px',
              position: 'relative',
              mb: 2,
              '&:hover': {
                transform: 'translateY(-2px)',
                transition: 'transform 0.3s ease'
              }
            }}>
              <WilayaDropdown
                value={wilaya}
                onChange={handleWilayaChange}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#fff',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      borderColor: '#cbd5e1'
                    },
                  },
                  '& .MuiSelect-select': {
                    py: 1.5,
                    fontSize: '1.1rem'
                  }
                }}
              />
            </Box>
          </Box>
          
          {/* Map section - Full width with minimal margins */}
          <Box sx={{ 
            width: '100%', 
            px: { xs: 1, sm: 2, md: 3 },
            mb: 4
          }}>
            {/* Card-style map container */}
            <Paper 
              elevation={0} 
              sx={{ 
                height: '100%', 
                minHeight: { xs: '500px', sm: '650px', md: '750px', lg: '850px' },
                width: '100%',
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 15px 30px rgba(0, 0, 0, 0.08)'
                }
              }}
            >
              {/* Modern header with blue-grey color */}
              <Box sx={{ 
                background: 'linear-gradient(135deg, #546E7A 0%, #37474F 100%)', 
                color: 'white',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <MapIcon sx={{ fontSize: '1.5rem' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                    Map View - {wilaya}
                  </Typography>
                </Box>
                
                {/* Tooltip for coordinates */}
                <Tooltip 
                  title={`${cityCoords.lat.toFixed(4)}, ${cityCoords.lon.toFixed(4)}`}
                  arrow
                  placement="bottom"
                >
                  <LocationOnIcon sx={{ fontSize: '1.2rem', opacity: 0.8, cursor: 'help' }} />
                </Tooltip>
              </Box>
              
              {/* Map container with loading indicator */}
              <Box sx={{ 
                flexGrow: 1, 
                position: 'relative', 
                width: '100%', 
                height: '100%',
                bgcolor: '#f8f9fa',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(to bottom, rgba(55, 71, 79, 0.05), transparent)',
                  zIndex: 10
                }
              }}>
                {!mapLoaded && !mapError && (
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 5,
                    textAlign: 'center'
                  }}>
                    <CircularProgress size={40} sx={{ mb: 2, color: '#546E7A' }} />
                    <Typography variant="body1" sx={{ color: '#546E7A' }}>
                      Loading map for {wilaya}...
                    </Typography>
                  </Box>
                )}
                
                {mapError && retryCount >= 2 && (
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 5,
                    textAlign: 'center',
                    p: 3,
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                  }}>
                    <Typography variant="h6" sx={{ color: '#B71C1C', mb: 2 }}>
                      Map could not be loaded
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#546E7A', mb: 2 }}>
                      Please try selecting a different wilaya or check your internet connection.
                    </Typography>
                    <Button 
                      variant="contained" 
                      sx={{ 
                        bgcolor: '#546E7A',
                        '&:hover': {
                          bgcolor: '#455A64'
                        }
                      }}
                      onClick={() => {
                        setMapError(false);
                        setRetryCount(0);
                        setMapLoaded(false);
                      }}
                    >
                      Try Again
                    </Button>
                  </Box>
                )}
                
                <iframe 
                  title="Location Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src={mapUrl}
                  onLoad={handleMapLoad}
                  onError={handleMapError}
                  style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%',
                    border: 'none',
                    opacity: mapLoaded ? 1 : 0.4,
                    transition: 'opacity 0.3s ease'
                  }}
                />
              </Box>
              
              {/* Footer with coordinates */}
              <Box sx={{
                padding: '8px 12px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#ECEFF1', // Light blue-grey background
                gap: 1
              }}>
                <Typography variant="caption" sx={{ color: '#546E7A', fontStyle: 'italic' }}>
                  Coordinates: {cityCoords.lat.toFixed(4)}, {cityCoords.lon.toFixed(4)}
                </Typography>
                <Typography variant="caption" sx={{ color: '#546E7A' }}>
                  Zoom Level: {zoomLevel}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={mapError ? "error" : "success"} 
          sx={{ 
            width: '100%',
            ...(mapError ? {} : { bgcolor: '#455A64', color: 'white' })
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MapPage;
