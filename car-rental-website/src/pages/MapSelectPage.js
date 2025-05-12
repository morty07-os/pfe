import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Navbar from '../components/Navbar';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Import Leaflet and fix icon issue
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';

// Fix for default marker icons in React-Leaflet
const DefaultIcon = L.icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Selected pickup location</Popup>
    </Marker>
  );
}

export default function MapSelectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [position, setPosition] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  
  // Get returnTo and currentLocation from state if available
  const returnTo = location.state?.returnTo || 'post-car';
  const initialPosition = location.state?.currentLocation || null;
  
  useEffect(() => {
    // Set initial position if provided
    if (initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);
  
  const handleConfirm = () => {
    // Store the selected position in localStorage
    if (position) {
      localStorage.setItem('selectedLocation', JSON.stringify(position));
      
      // Navigate back to the appropriate page
      if (returnTo === 'post-car') {
        navigate('/');
        // The PostCarDialog will need to be reopened by the parent component
        // and retrieve the location from localStorage
      } else {
        navigate('/');
      }
    }
  };
  
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPosition = { lat: latitude, lng: longitude };
          setPosition(newPosition);
          
          // Center map on current location
          if (mapRef) {
            mapRef.flyTo(newPosition, 15);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get your current location. Please try selecting manually on the map.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };
  
  return (
    <>
      <Navbar />
      <Box sx={{ 
        position: 'relative', 
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          bgcolor: '#f8fafc', 
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              onClick={() => navigate(-1)}
              sx={{ mr: 1, color: '#475569' }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#334155' }}>
              Select Pickup Location
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleGetCurrentLocation}
              startIcon={<MyLocationIcon />}
              sx={{
                borderRadius: 2,
                borderColor: '#cbd5e1',
                color: '#475569',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { borderColor: '#94a3b8', bgcolor: '#f1f5f9' }
              }}
            >
              Current Location
            </Button>
            
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={!position}
              startIcon={<CheckCircleIcon />}
              sx={{
                borderRadius: 2,
                bgcolor: '#334155',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { bgcolor: '#1e293b' },
                '&.Mui-disabled': { bgcolor: '#94a3b8', color: '#f1f5f9' }
              }}
            >
              Confirm Location
            </Button>
          </Box>
        </Box>
        
        {/* Map */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <MapContainer
            center={initialPosition || [36.7529, 3.0420]} // Default to Algiers if no position
            zoom={initialPosition ? 15 : 6}
            style={{ height: '100%', width: '100%' }}
            whenCreated={setMapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
          
          {/* Instructions overlay */}
          <Paper sx={{ 
            position: 'absolute', 
            top: 16, 
            left: 16, 
            zIndex: 1000, 
            p: 2, 
            maxWidth: 300, 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            bgcolor: 'rgba(255,255,255,0.95)'
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1 }}>
              How to select a location:
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
              • Click anywhere on the map to place a marker
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
              • Use the "Current Location" button to use your device's location
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              • Click "Confirm Location" when you're satisfied with your selection
            </Typography>
          </Paper>
        </Box>
        
        {/* Footer with coordinates if a position is selected */}
        {position && (
          <Box sx={{ 
            p: 2, 
            bgcolor: '#f8fafc', 
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
              Selected coordinates: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
}
