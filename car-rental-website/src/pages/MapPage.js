import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  IconButton, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  Chip, 
  Snackbar, 
  Alert, 
  useTheme, 
  useMediaQuery 
} from '@mui/material';
import { 
  ZoomIn as ZoomInIcon, 
  ZoomOut as ZoomOutIcon, 
  MyLocation as MyLocationIcon, 
  LocationOn as LocationOnIcon, 
  DirectionsCar as DirectionsCarIcon, 
  Search as SearchIcon 
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import Navbar from '../components/Navbar';
import QuickSearch from '../components/QuickSearch';

// Mock data for wilayas and pickup locations
const wilayasConfig = [
  { code: 16, name: 'Algiers', lat: 36.7538, lng: 3.0588 },
  { code: 31, name: 'Oran', lat: 35.6969, lng: -0.6331 },
  { code: 19, name: 'Setif', lat: 36.1898, lng: 5.4108 },
  { code: 9, name: 'Blida', lat: 36.4702, lng: 2.8299 },
  { code: 15, name: 'Tizi Ouzou', lat: 36.7169, lng: 4.0476 }
];

const pickupLocationsConfig = {
  16: [
    { id: 'alg1', name: 'Algiers Airport', lat: 36.6942, lng: 3.2153 },
    { id: 'alg2', name: 'Algiers Center', lat: 36.7538, lng: 3.0588 },
    { id: 'alg3', name: 'Bab Ezzouar', lat: 36.7658, lng: 3.0478 }
  ],
  31: [
    { id: 'oran1', name: 'Oran Airport', lat: 35.6239, lng: -0.6211 },
    { id: 'oran2', name: 'Oran Center', lat: 35.6969, lng: -0.6331 }
  ],
  19: [
    { id: 'setif1', name: 'Setif Center', lat: 36.1898, lng: 5.4108 }
  ],
  9: [
    { id: 'blida1', name: 'Blida Center', lat: 36.4702, lng: 2.8299 }
  ],
  15: [
    { id: 'tizi1', name: 'Tizi Ouzou Center', lat: 36.7169, lng: 4.0476 }
  ]
];

// Helper function to find nearest wilaya to a location
const findNearestWilaya = (location) => {
  if (!location || !location.lat || !location.lng) return null;
  
  let nearestWilaya = null;
  let minDistance = Infinity;
  
  wilayasConfig.forEach(wilaya => {
    const distance = Math.sqrt(
      Math.pow(wilaya.lat - location.lat, 2) + 
      Math.pow(wilaya.lng - location.lng, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestWilaya = wilaya;
    }
  });
  
  return nearestWilaya;
};

// Main MapPage component
const MapPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for map and UI
  const [mapCenter, setMapCenter] = useState([36.7538, 3.0588]); // Default to Algiers
  const [mapZoom, setMapZoom] = useState(6);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedWilaya, setSelectedWilaya] = useState(null);
  const [pickupLocations, setPickupLocations] = useState([]);
  const [carData, setCarData] = useState([]);
  const [showWilayaSelector, setShowWilayaSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationStatus, setLocationStatus] = useState(null); // 'loading', 'success', 'error', 'not-found', 'not-available'
  const [locationError, setLocationError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  
  // Refs
  const mapRef = useRef(null);
  
  // Create custom icons
  const userLocationIcon = useMemo(() => {
    return L.divIcon({
      html: `<div class="user-location-marker"><span></span></div>`,
      className: 'custom-div-icon',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
  }, []);
  
  const pickupLocationIcon = useMemo(() => {
    return L.divIcon({
      html: `<div class="pickup-location-marker"><span><i class="fas fa-car"></i></span></div>`,
      className: 'custom-div-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });
  }, []);
  
  const carIcon = useMemo(() => {
    return L.divIcon({
      html: `<div class="car-marker"><span><i class="fas fa-car"></i></span></div>`,
      className: 'custom-div-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });
  }, []);
  
  const highlightedCarIcon = useMemo(() => {
    return L.divIcon({
      html: `<div class="car-marker highlighted"><span><i class="fas fa-car"></i></span></div>`,
      className: 'custom-div-icon',
      iconSize: [38, 38],
      iconAnchor: [19, 38]
    });
  }, []);
  
  // Handle user location detection
  const getUserLocation = () => {
    setLocationStatus('loading');
    
    if (!navigator.geolocation) {
      setLocationStatus('not-available');
      setLocationError('Geolocation is not supported by your browser');
      showSnackbar('Geolocation is not supported by your browser', 'error');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userLoc = { lat: latitude, lng: longitude };
        setUserLocation(userLoc);
        setMapCenter([latitude, longitude]);
        setMapZoom(13);
        setLocationStatus('success');
        
        // Find nearest wilaya
        const nearestWilaya = findNearestWilaya(userLoc);
        if (nearestWilaya) {
          setSelectedWilaya(nearestWilaya);
          loadPickupLocations(nearestWilaya.code);
        }
      },
      (error) => {
        setLocationStatus('error');
        setLocationError(error.message);
        showSnackbar(`Error getting location: ${error.message}`, 'error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
  };
  
  // Load pickup locations for a wilaya
  const loadPickupLocations = (wilayaCode) => {
    const locations = pickupLocationsConfig[wilayaCode] || [];
    setPickupLocations(locations);
  };
  
  // Handle wilaya selection
  const handleWilayaChange = (wilayaCode) => {
    const wilaya = wilayasConfig.find(w => w.code === wilayaCode);
    if (wilaya) {
      setSelectedWilaya(wilaya);
      setMapCenter([wilaya.lat, wilaya.lng]);
      setMapZoom(10);
      loadPickupLocations(wilaya.code);
    }
  };
  
  // Show snackbar message
  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  // Set up global variables for map components
  useEffect(() => {
    // Make these variables available to MapComponentsRenderer
    window.userLocationForMap = userLocation;
    window.selectedWilayaForMap = selectedWilaya;
    window.pickupLocationsForMap = pickupLocations;
    window.carDataForMap = carData;
    window.mapCenterForMap = mapCenter;
    window.mapZoomForMap = mapZoom;
    window.userLocationIconForMap = userLocationIcon;
    window.pickupLocationIconForMap = pickupLocationIcon;
    window.carIconForMap = carIcon;
    window.highlightedCarIconForMap = highlightedCarIcon;
  }, [userLocation, selectedWilaya, pickupLocations, carData, mapCenter, mapZoom, 
      userLocationIcon, pickupLocationIcon, carIcon, highlightedCarIcon]);
  
  // Load initial data
  useEffect(() => {
    // Check URL params for wilaya or location
    const params = new URLSearchParams(location.search);
    const wilayaParam = params.get('wilaya');
    
    if (wilayaParam) {
      handleWilayaChange(parseInt(wilayaParam, 10));
    } else {
      // Default to Algiers if no params
      const defaultWilaya = wilayasConfig.find(w => w.code === 16); // Algiers
      if (defaultWilaya) {
        setSelectedWilaya(defaultWilaya);
        loadPickupLocations(defaultWilaya.code);
      }
    }
    
    // Load mock car data (in a real app, this would come from an API)
    const mockCarData = [
      {
        _id: 'car1',
        brand: 'Toyota',
        carName: 'Corolla',
        model: '2020',
        price: 5000,
        location: { lat: 36.7538, lng: 3.0588, name: 'Algiers Center' },
        isHighlighted: false
      },
      {
        _id: 'car2',
        brand: 'Honda',
        carName: 'Civic',
        model: '2021',
        price: 6000,
        location: { lat: 36.7658, lng: 3.0478, name: 'Bab Ezzouar' },
        isHighlighted: true
      },
      {
        _id: 'car3',
        brand: 'Hyundai',
        carName: 'Tucson',
        model: '2019',
        price: 5500,
        location: { lat: 36.7438, lng: 3.0688, name: 'Hussein Dey' },
        isHighlighted: false
      }
    ];
    setCarData(mockCarData);
  }, [location.search]);
  
  return (
    <>
      <Navbar />
      <Box sx={{ position: 'relative', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
        {/* Map Container */}
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Render all Leaflet components safely inside MapContainer */}
          <MapComponentsRenderer />
        </MapContainer>
        
        {/* Map Controls */}
        <Box sx={{ 
          position: 'absolute', 
          top: 16, 
          right: 16, 
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}>
          <Paper elevation={3} sx={{ 
            borderRadius: 2, 
            overflow: 'hidden',
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
          }}>
            <IconButton 
              onClick={() => setMapZoom(prev => prev + 1)}
              sx={{ color: '#475569' }}
            >
              <ZoomInIcon />
            </IconButton>
          </Paper>
          
          <Paper elevation={3} sx={{ 
            borderRadius: 2, 
            overflow: 'hidden',
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
          }}>
            <IconButton 
              onClick={() => setMapZoom(prev => prev - 1)}
              sx={{ color: '#475569' }}
            >
              <ZoomOutIcon />
            </IconButton>
          </Paper>
          
          <Paper elevation={3} sx={{ 
            borderRadius: 2, 
            overflow: 'hidden',
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
          }}>
            <IconButton 
              onClick={getUserLocation}
              sx={{ 
                color: locationStatus === 'loading' ? '#94a3b8' : '#475569',
                animation: locationStatus === 'loading' ? 'pulse 1.5s infinite' : 'none'
              }}
              disabled={locationStatus === 'loading'}
            >
              <MyLocationIcon />
            </IconButton>
          </Paper>
        </Box>
        
        {/* Wilaya Selector */}
        <Box sx={{ 
          position: 'absolute', 
          top: 16, 
          left: 16, 
          zIndex: 1000,
          width: isMobile ? 'calc(100% - 32px)' : 300
        }}>
          <Paper elevation={3} sx={{ 
            p: 2, 
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
          }}>
            <FormControl fullWidth size="small">
              <InputLabel id="wilaya-select-label" sx={{ color: '#475569' }}>
                Select Wilaya
              </InputLabel>
              <Select
                labelId="wilaya-select-label"
                id="wilaya-select"
                value={selectedWilaya ? selectedWilaya.code : ''}
                label="Select Wilaya"
                onChange={(e) => handleWilayaChange(e.target.value)}
                sx={{ 
                  '.MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#475569' },
                  color: '#334155'
                }}
              >
                {wilayasConfig.map((wilaya) => (
                  <MenuItem key={wilaya.code} value={wilaya.code}>
                    {wilaya.code} - {wilaya.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </Box>
        
        {/* Quick Search Component */}
        <Box sx={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1100 
        }}>
          <QuickSearch />
        </Box>
      </Box>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ width: '100%', boxShadow: 3 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MapPage;
              filter: drop-shadow(0 3px 5px rgba(30, 64, 175, 0.5));
              transform: scale(1.1);
            }
          `}</style>
          
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <DirectionsCarIcon sx={{ fontSize: 16, color: '#64748b', mr: 0.5 }} />
                                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                                    {car.transmission || 'Manual'}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
                                  {car.price} DA/day
                                </Typography>
                              </Box>
                              <Button
                                size="small"
                                variant="outlined"
                                fullWidth
                                sx={{ 
                                  background: car.isHighlighted 
                                    ? 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)'
                                    : 'linear-gradient(135deg, #475569 0%, #334155 100%)',
                                  color: 'white',
                                  fontWeight: 600,
                                  borderRadius: '8px',
                                  border: 'none',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    background: car.isHighlighted
                                      ? 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)'
                                      : 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
                                    boxShadow: '0 4px 12px rgba(51, 65, 85, 0.25)',
                                    transform: 'translateY(-2px)'
                                  }
                                }}
                                onClick={() => window.location.href = `/offer/${car._id}`}
                              >
                                View Details
                              </Button>
                            </Box>
                          </Popup>
                        </Marker>
                      ))}
                    </MarkerClusterGroup>
                  )}

                  {/* Display city center marker for non-available wilayas */}
                  {selectedWilaya && !selectedWilaya.available && cityCentersConfig[selectedWilaya.name] && 
                    cityCentersConfig[selectedWilaya.name].map((location) => (
                      <Marker 
                        key={location.id} 
                        position={location.position}
                        icon={carRentalIcon}
                      >
                        <Popup>
                          <Box sx={{ p: 1.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#334155' }}>
                              {location.name}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2, color: '#64748b' }}>
                              {location.address}
                            </Typography>
                            <Box sx={{ bgcolor: '#f1f5f9', p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                              <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic', textAlign: 'center' }}>
                                Car rental service coming soon to this location
                              </Typography>
                            </Box>
                          </Box>
                        </Popup>
                      </Marker>
                    ))
                  }
                  
                  {/* Update map view when center changes */}
                  <ChangeMapView center={mapCenter} zoom={mapZoom} />
                </MapContainer>
                
                {/* Custom map controls */}
                <MapControls 
                  onZoomIn={handleZoomIn}
                  onZoomOut={handleZoomOut}
                  onMyLocation={handleMyLocation}
                />
                
                {/* Overlay for when no wilaya is selected */}
                {!selectedWilaya && (
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(241, 245, 249, 0.9) 0%, rgba(226, 232, 240, 0.9) 100%)',
                      backdropFilter: 'blur(8px)',
                      zIndex: 1000
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: 4, 
                        bgcolor: 'white', 
                        borderRadius: 4,
                        maxWidth: 400,
                        textAlign: 'center',
                        boxShadow: '0 15px 35px rgba(71, 85, 105, 0.15)',
                        border: '1px solid #e2e8f0',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: 80, 
                          height: 80, 
                          borderRadius: '50%', 
                          bgcolor: '#f1f5f9', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 3,
                          border: '4px solid #e2e8f0'
                        }}
                      >
                        <LocationOnIcon sx={{ fontSize: 40, color: '#475569' }} />
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#334155' }}>
                        Explore Available Locations
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 3, color: '#64748b' }}>
                        Select a wilaya from the dropdown below to view available car rental pickup points on the map
                      </Typography>
                      <FormControl fullWidth>
                        <InputLabel id="city-select-overlay-label">Wilaya</InputLabel>
                        <Select
                          labelId="city-select-overlay-label"
                          id="city-select-overlay"
                          value={selectedWilaya ? selectedWilaya.id : ''}
                          label="Wilaya"
                          onChange={(e) => {
                            const selected = wilayasConfig.find(w => w.id === e.target.value);
                            if (selected && selected.available) {
                              setSelectedWilaya(selected);
                            }
                          }}
                          sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#cbd5e1',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#475569',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#94a3b8',
                            },
                            '& .MuiSvgIcon-root': {
                              color: '#475569',
                            }
                          }}
                        >
                          {wilayasConfig.filter(wilaya => wilaya.available).map((wilaya) => (
                            <MenuItem key={wilaya.id} value={wilaya.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationOnIcon sx={{ color: '#475569', fontSize: 20 }} />
                                <Typography>{wilaya.name}</Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
      

      
      {/* Car loading snackbar */}
      <Snackbar 
        open={isLoadingCars} 
        autoHideDuration={null} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity="info"
          variant="filled"
          sx={{ 
            width: '100%', 
            bgcolor: '#64748b',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            },
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          <Typography variant="body2">
            Loading available cars...
          </Typography>
        </Alert>
      </Snackbar>
      
      {/* Location status snackbars */}
      <Snackbar 
        open={locationStatus === 'loading'} 
        autoHideDuration={null} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="info"
          variant="filled"
          sx={{ 
            width: '100%', 
            bgcolor: '#64748b',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            },
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          <Typography variant="body2">
            Getting your location...
          </Typography>
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={locationStatus === 'success'} 
        autoHideDuration={6000} 
        onClose={() => setLocationStatus(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setLocationStatus(null)} 
          severity="success"
          variant="filled"
          sx={{ 
            width: '100%', 
            bgcolor: '#475569',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            },
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          <Typography variant="body2">
            {selectedWilaya ? `Location found: ${selectedWilaya.name}` : 'Location found!'}
          </Typography>
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={locationStatus === 'not-found'} 
        autoHideDuration={6000} 
        onClose={() => setLocationStatus(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setLocationStatus(null)} 
          severity="warning"
          variant="filled"
          sx={{ 
            width: '100%', 
            bgcolor: '#475569',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            },
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          <Typography variant="body2">
            No service areas found near your location.
          </Typography>
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={locationStatus === 'not-available'} 
        autoHideDuration={6000} 
        onClose={() => setLocationStatus(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setLocationStatus(null)} 
          severity="info"
          variant="filled"
          sx={{ 
            width: '100%', 
            bgcolor: '#64748b',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            },
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          <Typography variant="body2">
            {selectedWilaya ? `${selectedWilaya.name} found, but car rental service is not yet available in this area.` : 'Location found, but service is not available in this area.'}
          </Typography>
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={locationStatus === 'error'} 
        autoHideDuration={6000} 
        onClose={() => setLocationStatus(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setLocationStatus(null)} 
          severity="error"
          variant="filled"
          sx={{ 
            width: '100%', 
            bgcolor: '#475569',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            },
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          <Typography variant="body2">
            {locationError || 'Error accessing your location. Please try again.'}
          </Typography>
        </Alert>
      </Snackbar>
    </>
  );
};

export default MapPage;
