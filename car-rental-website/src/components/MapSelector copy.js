import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Grid,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MapIcon from '@mui/icons-material/Map';
import InfoIcon from '@mui/icons-material/Info';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SearchIcon from '@mui/icons-material/Search';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// City selector component
const CitySelector = ({ onSelect }) => {
  const cities = [
    { name: 'Alger', position: [36.7538, 3.0588] },
    { name: 'Oran', position: [35.6969, -0.6331] },
    { name: 'Constantine', position: [36.3650, 6.6147] },
    { name: 'Annaba', position: [36.9264, 7.7522] },
    { name: 'Blida', position: [36.4702, 2.8299] },
    { name: 'Batna', position: [35.5552, 6.1742] },
    { name: 'Sétif', position: [36.1898, 5.4108] },
    { name: 'Béjaïa', position: [36.7515, 5.0557] },
    { name: 'Tlemcen', position: [34.8884, -1.3143] },
    { name: 'Tiaret', position: [35.3715, 1.3217] },
    { name: 'Biskra', position: [34.8513, 5.7335] },
    { name: 'Mostaganem', position: [35.9311, 0.0891] }
  ];
  
  return (
    <Grid container spacing={1} sx={{ mt: 1 }}>
      {cities.map(city => (
        <Grid item xs={4} sm={3} key={city.name}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onSelect(city)}
            sx={{
              textTransform: 'none',
              borderColor: '#cbd5e1',
              color: '#475569',
              fontSize: '0.8rem',
              width: '100%',
              justifyContent: 'flex-start',
              '&:hover': {
                borderColor: '#64748b',
                bgcolor: '#f1f5f9'
              }
            }}
          >
            {city.name}
          </Button>
        </Grid>
      ))}
    </Grid>
  );
};

// Map click handler component
const LocationMarker = ({ onLocationSelect }) => {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect({ lat, lng });
    },
  });
  
  return null;
};

const MapSelector = ({ selectedLocation, onChange, wilaya }) => {
  const [open, setOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState(selectedLocation);
  const [showCities, setShowCities] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [position, setPosition] = useState([28.0339, 1.6596]); // Center of Algeria
  const [markerPosition, setMarkerPosition] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationPermissionRequested, setLocationPermissionRequested] = useState(false);
  const [zoom, setZoom] = useState(5);

  const handleOpen = () => {
    setOpen(true);
    setTempLocation(selectedLocation);
    setShowCities(true);
    
    // If there's a previously selected location, try to parse it for coordinates
    if (selectedLocation) {
      const coordsMatch = selectedLocation.match(/\((-?\d+\.\d+),\s*(-?\d+\.\d+)\)/);
      if (coordsMatch) {
        const lat = parseFloat(coordsMatch[1]);
        const lng = parseFloat(coordsMatch[2]);
        if (!isNaN(lat) && !isNaN(lng)) {
          setMarkerPosition([lat, lng]);
          setPosition([lat, lng]);
          setZoom(13);
        }
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    setShowCities(false);
    setLocationPermissionRequested(false);
  };

  const toggleInfo = () => {
    setInfoOpen(!infoOpen);
  };

  const toggleCities = () => {
    setShowCities(!showCities);
  };

  const handleLocationSelect = (coords) => {
    const { lat, lng } = coords;
    setMarkerPosition([lat, lng]);
    
    // Generate a location name based on the coordinates and wilaya
    const locationName = wilaya 
      ? `Selected Location (${lat.toFixed(5)}, ${lng.toFixed(5)}), ${wilaya}` 
      : `Selected Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
    
    setTempLocation(locationName);
    
    // Show feedback to user
    setSnackbarMessage('Location selected. Click "Confirm Location" to save.');
    setSnackbarOpen(true);
  };

  const handleCitySelect = (city) => {
    const { name, position } = city;
    setMarkerPosition(position);
    setPosition(position);
    setZoom(13);
    
    // Set location name
    const locationName = wilaya 
      ? `${name} (${position[0].toFixed(5)}, ${position[1].toFixed(5)}), ${wilaya}` 
      : `${name} (${position[0].toFixed(5)}, ${position[1].toFixed(5)})`;
    
    setTempLocation(locationName);
    
    // Show feedback
    setSnackbarMessage(`${name} selected. Click "Confirm Location" to save.`);
    setSnackbarOpen(true);
  };

  const handleRequestLocation = () => {
    setLocationPermissionRequested(true);
    
    // Show permission request message
    setSnackbarMessage('Please allow access to your location when prompted.');
    setSnackbarOpen(true);
  };

  const handleUseCurrentLocation = () => {
    if (!locationPermissionRequested) {
      handleRequestLocation();
      return;
    }
    
    setIsLocating(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        // Success callback
        (position) => {
          const { latitude, longitude } = position.coords;
          
          setMarkerPosition([latitude, longitude]);
          setPosition([latitude, longitude]);
          setZoom(13);
          
          // Set location name
          const locationName = wilaya 
            ? `Your Location (${latitude.toFixed(5)}, ${longitude.toFixed(5)}), ${wilaya}` 
            : `Your Location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;
          
          setTempLocation(locationName);
          setIsLocating(false);
          
          // Show success message
          setSnackbarMessage('Your location found! Click "Confirm Location" to save.');
          setSnackbarOpen(true);
        },
        // Error callback
        (error) => {
          console.error("Error getting location:", error);
          setIsLocating(false);
          
          // Show error message
          setSnackbarMessage('Could not access your location. Please select manually or try again.');
          setSnackbarOpen(true);
        },
        // Options
        { 
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      setIsLocating(false);
      setSnackbarMessage('Location services not available in your browser. Please select manually.');
      setSnackbarOpen(true);
    }
  };

  const handleConfirmLocation = () => {
    if (tempLocation) {
      onChange(tempLocation);
      handleClose();
      
      // Show confirmation message
      setSnackbarMessage('Location saved successfully!');
      setSnackbarOpen(true);
    }
  };

  // Extract city name from location string if available
  const getCityName = () => {
    if (!tempLocation) return wilaya || 'Algeria';
    
    const parts = tempLocation.split(',');
    if (parts.length > 1) {
      return parts[1].trim();
    }
    return parts[0].trim();
  };

  return (
    <>
      <Button 
        variant="contained" 
        startIcon={<MapIcon sx={{ fontSize: 20 }} />}
        onClick={handleOpen}
        sx={{
          background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
          color: 'white',
          fontWeight: 600,
          textTransform: 'none',
          borderRadius: 2.5,
          padding: '8px 16px',
          boxShadow: '0 2px 10px rgba(51, 65, 85, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
            boxShadow: '0 4px 12px rgba(51, 65, 85, 0.25), 0 0 0 2px rgba(203, 213, 225, 0.3)',
            transform: 'translateY(-2px)'
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: '0 2px 5px rgba(51, 65, 85, 0.2)'
          }
        }}
      >
        Find on Map
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 12px 50px -12px rgba(30,41,59,0.25)',
          }
        }}
      >
        <DialogTitle sx={{ 
          m: 0, 
          p: 2.5, 
          background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MapIcon sx={{ mr: 1.5, fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
              {tempLocation ? `Location: ${getCityName()}` : 'Select Location on Map'}
            </Typography>
          </Box>
          
          <Box>
            <Tooltip title={locationPermissionRequested ? "Use my location" : "Request location access"}>
              <IconButton 
                size="small" 
                onClick={handleUseCurrentLocation}
                sx={{ color: 'white', mr: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}
              >
                <MyLocationIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="How to use the map">
              <IconButton 
                size="small" 
                onClick={toggleInfo}
                sx={{ color: 'white', mr: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}
              >
                <InfoIcon />
              </IconButton>
            </Tooltip>
            <IconButton
              onClick={handleClose}
              sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {/* Search and city selection */}
          <Box sx={{ 
            p: 2, 
            bgcolor: '#f8fafc', 
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant="text"
                onClick={toggleCities}
                sx={{ 
                  mr: 2, 
                  color: '#475569',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { bgcolor: 'rgba(71, 85, 105, 0.08)' }
                }}
              >
                {showCities ? 'Hide Cities' : 'Show Cities'}
              </Button>
              
              <Paper
                component="form"
                sx={{ 
                  p: '2px 4px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  width: '100%',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(30,41,59,0.07)'
                }}
              >
                <IconButton sx={{ p: '10px', color: '#64748b' }}>
                  <SearchIcon />
                </IconButton>
                <input
                  style={{ 
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    padding: '8px 0',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Search for a location..."
                />
              </Paper>
            </Box>
            
            {/* City selection */}
            {showCities && <CitySelector onSelect={handleCitySelect} />}
          </Box>

          {/* Map container */}
          <Box sx={{ height: 400, width: '100%', position: 'relative' }}>
            {/* Leaflet Map */}
            <MapContainer 
              center={position} 
              zoom={zoom} 
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker onLocationSelect={handleLocationSelect} />
              {markerPosition && (
                <Marker position={markerPosition} icon={customIcon}>
                  <Popup>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Selected Location
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      Lat: {markerPosition[0].toFixed(5)}, Lng: {markerPosition[1].toFixed(5)}
                    </Typography>
                  </Popup>
                </Marker>
              )}
            </MapContainer>

            {/* Loading indicator */}
            {isLocating && (
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 1000,
                p: 3,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
              }}>
                <CircularProgress sx={{ color: '#475569', mb: 2 }} />
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155' }}>
                  Finding your location...
                </Typography>
              </Box>
            )}

            {/* Location permission request */}
            {!locationPermissionRequested && (
              <Paper
                elevation={3}
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  maxWidth: '60%',
                  zIndex: 1000
                }}
              >
                <Typography variant="body2" sx={{ mb: 1, color: '#475569' }}>
                  Click the location icon <MyLocationIcon sx={{ fontSize: 16, verticalAlign: 'text-bottom' }} /> to use your current location.
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                  Your browser will ask for permission first.
                </Typography>
              </Paper>
            )}

            {/* Info overlay */}
            {infoOpen && (
              <Paper 
                elevation={3}
                sx={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  width: 300,
                  p: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(5px)',
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  zIndex: 1000
                }}
              >
                <Typography variant="h6" sx={{ mb: 1, color: '#475569', fontWeight: 600 }}>
                  How to Use the Map
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box component="span" sx={{ color: '#475569', display: 'inline-flex' }}>•</Box>
                  Click anywhere on the map to select a location
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box component="span" sx={{ color: '#475569', display: 'inline-flex' }}>•</Box>
                  Use the city buttons to quickly select major cities
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box component="span" sx={{ color: '#475569', display: 'inline-flex' }}>•</Box>
                  Click the location icon to use your current position (requires permission)
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box component="span" sx={{ color: '#475569', display: 'inline-flex' }}>•</Box>
                  Click "Confirm Location" when you're done
                </Typography>
              </Paper>
            )}
          </Box>

          {/* Selected location display */}
          {tempLocation && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                m: 2,
                borderRadius: 2,
                bgcolor: '#f1f5f9',
                border: '1px solid #e2e8f0'
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
                Selected Location:
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon sx={{ mr: 1, color: '#e11d48', fontSize: 20 }} />
                {tempLocation}
              </Typography>
            </Paper>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <Button 
            onClick={handleClose}
            sx={{ 
              color: '#475569',
              fontWeight: 600,
              '&:hover': { bgcolor: 'rgba(71, 85, 105, 0.08)' }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleConfirmLocation}
            disabled={!tempLocation || isLocating}
            sx={{ 
              background: 'linear-gradient(90deg, #475569 0%, #334155 100%)',
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(51, 65, 85, 0.15)',
              '&:hover': {
                background: 'linear-gradient(90deg, #334155 0%, #1e293b 100%)',
                boxShadow: '0 4px 12px rgba(51, 65, 85, 0.25)'
              },
              '&.Mui-disabled': {
                background: 'linear-gradient(90deg, #94a3b8 0%, #64748b 100%)',
                color: 'rgba(255, 255, 255, 0.7)'
              }
            }}
          >
            Confirm Location
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Snackbar */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          variant="filled"
          sx={{ 
            width: '100%',
            background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MapSelector;
