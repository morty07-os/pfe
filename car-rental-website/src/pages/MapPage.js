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
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import Navbar from '../components/Navbar';
import QuickSearch from '../components/QuickSearch';

// Mock data for wilayas and pickup locations
const wilayasConfig = [
  { code: 16, name: 'Algiers', lat: 36.7538, lng: 3.0588, available: true },
  { code: 31, name: 'Oran', lat: 35.6969, lng: -0.6331, available: true },
  { code: 19, name: 'Setif', lat: 36.1898, lng: 5.4108, available: true },
  { code: 9, name: 'Blida', lat: 36.4702, lng: 2.8299, available: true },
  { code: 15, name: 'Tizi Ouzou', lat: 36.7169, lng: 4.0476, available: true }
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
};

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

// Component to update map view
const ChangeMapView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Map Controls Component
const MapControls = ({ onZoomIn, onZoomOut, onMyLocation, locationStatus }) => (
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
      <IconButton onClick={onZoomIn} sx={{ color: '#475569' }}>
        <ZoomInIcon />
      </IconButton>
    </Paper>
    
    <Paper elevation={3} sx={{ 
      borderRadius: 2, 
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.9)'
    }}>
      <IconButton onClick={onZoomOut} sx={{ color: '#475569' }}>
        <ZoomOutIcon />
      </IconButton>
    </Paper>
    
    <Paper elevation={3} sx={{ 
      borderRadius: 2, 
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.9)'
    }}>
      <IconButton 
        onClick={onMyLocation}
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
);

// Map Content Renderer
const MapComponentsRenderer = ({ 
  userLocation, 
  selectedWilaya, 
  pickupLocations, 
  carData, 
  userLocationIcon,
  pickupLocationIcon,
  carIcon,
  highlightedCarIcon
}) => {
  return (
    <>
      {/* User Location Marker */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
          <Popup>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Your Location</Typography>
          </Popup>
        </Marker>
      )}

      {/* Pickup Locations */}
      {pickupLocations.map(location => (
        <Marker 
          key={location.id} 
          position={[location.lat, location.lng]} 
          icon={pickupLocationIcon}
        >
          <Popup>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{location.name}</Typography>
          </Popup>
        </Marker>
      ))}

      {/* Cars */}
      {carData.length > 0 && (
        <MarkerClusterGroup>
          {carData.map(car => (
            <Marker 
              key={car._id} 
              position={[car.location.lat, car.location.lng]} 
              icon={car.isHighlighted ? highlightedCarIcon : carIcon}
            >
              <Popup>
                <Box sx={{ minWidth: 250, p: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      {car.brand} {car.carName}
                    </Typography>
                    {car.isHighlighted && (
                      <Chip label="Popular" size="small" sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 600 }} />
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ mb: 1.5, color: '#64748b' }}>
                    {car.model} • Petrol • {car.seats || 5} seats
                  </Typography>
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
    </>
  );
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
  const [isLoadingCars, setIsLoadingCars] = useState(false);
  
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
  
  // Handle zoom controls
  const handleZoomIn = () => setMapZoom(prev => Math.min(prev + 1, 18));
  const handleZoomOut = () => setMapZoom(prev => Math.max(prev - 1, 6));
  
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
    
    // Load mock car data
    const mockCarData = [
      {
        _id: 'car1',
        brand: 'Toyota',
        carName: 'Corolla',
        model: '2020',
        price: 5000,
        location: { lat: 36.7538, lng: 3.0588, name: 'Algiers Center' },
        isHighlighted: false,
        seats: 5,
        transmission: 'Automatic'
      },
      {
        _id: 'car2',
        brand: 'Honda',
        carName: 'Civic',
        model: '2021',
        price: 6000,
        location: { lat: 36.7658, lng: 3.0478, name: 'Bab Ezzouar' },
        isHighlighted: true,
        seats: 5,
        transmission: 'Manual'
      },
      {
        _id: 'car3',
        brand: 'Hyundai',
        carName: 'Tucson',
        model: '2019',
        price: 5500,
        location: { lat: 36.7438, lng: 3.0688, name: 'Hussein Dey' },
        isHighlighted: false,
        seats: 7,
        transmission: 'Automatic'
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
          whenCreated={mapInstance => { mapRef.current = mapInstance }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Render all Leaflet components */}
          <MapComponentsRenderer 
            userLocation={userLocation}
            selectedWilaya={selectedWilaya}
            pickupLocations={pickupLocations}
            carData={carData}
            userLocationIcon={userLocationIcon}
            pickupLocationIcon={pickupLocationIcon}
            carIcon={carIcon}
            highlightedCarIcon={highlightedCarIcon}
          />
          
          {/* Update map view when center changes */}
          <ChangeMapView center={mapCenter} zoom={mapZoom} />
        </MapContainer>
        
        {/* Map Controls */}
        <MapControls 
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onMyLocation={getUserLocation}
          locationStatus={locationStatus}
        />
        
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
      
      <style jsx global>{`
        .user-location-marker {
          position: relative;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background-color: #3b82f6;
          border: 2px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .user-location-marker:after {
          content: "";
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: white;
        }
        
        .pickup-location-marker {
          position: relative;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #10b981;
          border: 2px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-size: 16px;
        }
        
        .car-marker {
          position: relative;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #ef4444;
          border: 2px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-size: 16px;
          transition: all 0.3s ease;
        }
        
        .car-marker.highlighted {
          background-color: #f59e0b;
          width: 38px;
          height: 38px;
          font-size: 18px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          z-index: 1000;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  );
};

export default MapPage;