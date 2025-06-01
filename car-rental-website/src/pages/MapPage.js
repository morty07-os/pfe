import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  IconButton, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Button,
  TextField,
  Autocomplete,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme
} from '@mui/material';
import Navbar from '../components/Navbar';
import QuickSearch from '../components/QuickSearch';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LayersIcon from '@mui/icons-material/Layers';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

// Import wilaya configuration
import { wilayasConfig, pickupLocationsConfig, cityCentersConfig } from '../data/wilayasConfig';
import { findNearestWilaya, findNearbyPickupLocations, calculateDistance } from '../utils/locationUtils';

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Marker Cluster imports
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Import custom map styles
import '../styles/MapStyles.css';

// Create a custom MarkerClusterGroup component
const MarkerClusterGroup = ({ children, ...props }) => {
  const map = useMap();
  const clusterGroupRef = useRef(null);
  const markersRef = useRef([]);
  
  // Initialize cluster group on mount
  useEffect(() => {
    console.log('Initializing MarkerClusterGroup');
    if (!clusterGroupRef.current) {
      clusterGroupRef.current = L.markerClusterGroup(props);
      map.addLayer(clusterGroupRef.current);
      console.log('MarkerClusterGroup added to map');
    }
    
    return () => {
      console.log('Cleaning up MarkerClusterGroup');
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
    };
  }, [map]);
  
  // Update markers when children change
  useEffect(() => {
    if (!clusterGroupRef.current) {
      console.error('Cluster group ref is null, cannot update markers');
      return;
    }
    
    const childCount = React.Children.count(children);
    console.log('Updating markers in cluster group, children count:', childCount);
    
    // Clear previous markers
    if (markersRef.current.length > 0) {
      console.log('Clearing previous markers:', markersRef.current.length);
      markersRef.current.forEach(marker => {
        if (marker && clusterGroupRef.current) {
          clusterGroupRef.current.removeLayer(marker);
        }
      });
      markersRef.current = [];
    }
    
    // Add new markers
    const markers = [];
    React.Children.forEach(children, (child, index) => {
      if (!child) return;
      
      const { position, icon, zIndexOffset } = child.props;
      console.log(`Creating marker ${index} at position:`, position);
      
      try {
        const marker = L.marker(position, { icon, zIndexOffset });
        
        // Handle popup content if present
        const popupContent = child.props.children;
        if (popupContent) {
          const container = document.createElement('div');
          const root = createRoot(container);
          root.render(popupContent);
          marker.bindPopup(container);
        }
        
        markers.push(marker);
        clusterGroupRef.current.addLayer(marker);
        console.log(`Added marker ${index} to cluster group`);
      } catch (error) {
        console.error(`Error creating marker ${index}:`, error);
      }
    });
    
    markersRef.current = markers;
    console.log('Added new markers to cluster:', markers.length);
    
    // Force cluster update
    if (clusterGroupRef.current) {
      clusterGroupRef.current.refreshClusters();
      console.log('Refreshed clusters');
    } else {
      console.warn('No markers to add to cluster group');
    }
    
    // Force map update
    setTimeout(() => {
      if (map) {
        console.log('Forcing map update after adding markers');
        map.invalidateSize();
      }
    }, 100);
  }, [children, map]); // Depend on both children and map
  
  return null;
};

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom marker icon for car rental locations
const carRentalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Create car icon using divIcon with inline SVG for better reliability
const carIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="#475569">
    <path d="M5 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm14 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM6 17h12a1 1 0 0 1 0 2H6a1 1 0 0 1 0-2zM5.5 4h13a3 3 0 0 1 2.995 2.824L22 7.5V16h-1.501a2.5 2.5 0 0 1-4.998 0h-7.002a2.5 2.5 0 0 1-4.998 0H2V7.5A3 3 0 0 1 5.5 4zm13 2h-13a1 1 0 0 0-.993.883L4.5 7v6h.461a3.39 3.39 0 0 1 2.039 0h10a3.39 3.39 0 0 1 2.039 0H19.5V7a1 1 0 0 0-.883-.993L18.5 6zM16 5l4 2v2h-4V5z"/>
  </svg>`,
  className: 'car-marker-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

// Custom marker icon for highlighted cars
const highlightedCarIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="#1e40af">
    <path d="M5 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm14 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM6 17h12a1 1 0 0 1 0 2H6a1 1 0 0 1 0-2zM5.5 4h13a3 3 0 0 1 2.995 2.824L22 7.5V16h-1.501a2.5 2.5 0 0 1-4.998 0h-7.002a2.5 2.5 0 0 1-4.998 0H2V7.5A3 3 0 0 1 5.5 4zm13 2h-13a1 1 0 0 0-.993.883L4.5 7v6h.461a3.39 3.39 0 0 1 2.039 0h10a3.39 3.39 0 0 1 2.039 0H19.5V7a1 1 0 0 0-.883-.993L18.5 6zM16 5l4 2v2h-4V5z"/>
  </svg>`,
  className: 'car-marker-icon highlighted-car-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

// No need for filter with custom map style

// Helper component to recenter map when city changes
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

// Helper component to handle map controls
function MapControls({ onZoomIn, onZoomOut, onMyLocation }) {
  return (
    <Box 
      sx={{ 
        position: 'absolute', 
        bottom: 16, 
        left: 16, 
        display: 'flex', 
        flexDirection: 'column',
        gap: 1,
        zIndex: 1000
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 1, 
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        <IconButton 
          size="small" 
          sx={{ color: '#475569' }}
          onClick={onZoomIn}
        >
          <ZoomInIcon />
        </IconButton>
        <IconButton 
          size="small" 
          sx={{ color: '#475569' }}
          onClick={onZoomOut}
        >
          <ZoomOutIcon />
        </IconButton>
      </Paper>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 1, 
          borderRadius: 2
        }}
      >
        <IconButton 
          size="small" 
          sx={{ color: '#475569' }}
          onClick={onMyLocation}
        >
          <MyLocationIcon />
        </IconButton>
      </Paper>
    </Box>
  );
}

const MapPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedWilaya, setSelectedWilaya] = useState(null);
  const [mapCenter, setMapCenter] = useState([36.7538, 3.0588]); // Default center (Algiers)
  const [mapZoom, setMapZoom] = useState(6); // Start with a wider view of Algeria
  const mapRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWilayas, setFilteredWilayas] = useState([]);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null); // 'loading', 'success', 'error', 'not-found'
  const [locationError, setLocationError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [carData, setCarData] = useState([]);
  const [isLoadingCars, setIsLoadingCars] = useState(false);
  const [highlightedCar, setHighlightedCar] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Get available wilayas from config
  const availableWilayas = wilayasConfig.filter(wilaya => wilaya.available);
  
  // Get pickup locations from config
  const pickupLocations = pickupLocationsConfig;
  
  // Filter wilayas based on search query and availability
  useEffect(() => {
    if (searchQuery) {
      const filtered = wilayasConfig.filter(wilaya => 
        wilaya.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredWilayas(filtered);
    } else {
      setFilteredWilayas(wilayasConfig);
    }
  }, [searchQuery]);
  
  // Parse URL parameters on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const carId = searchParams.get('carId');
    const carLat = searchParams.get('lat');
    const carLng = searchParams.get('lng');
    const wilayaName = searchParams.get('wilaya');
    
    // If we have car coordinates in the URL, center the map there
    if (carLat && carLng) {
      const coords = [parseFloat(carLat), parseFloat(carLng)];
      setMapCenter(coords);
      setMapZoom(16); // Zoom in to see the specific car
      
      // Set highlighted car if we have a car ID
      if (carId) {
        setHighlightedCar(carId);
      }
      
      // If we have a wilaya name, select it and fetch cars
      if (wilayaName) {
        const wilaya = wilayasConfig.find(w => w.name === wilayaName);
        if (wilaya) {
          setSelectedWilaya(wilaya);
        }
      }
    }
    // If we only have a wilaya name without coordinates, center the map on that wilaya
    else if (wilayaName) {
      const wilaya = wilayasConfig.find(w => w.name === wilayaName);
      if (wilaya) {
        setSelectedWilaya(wilaya);
        setMapCenter(wilaya.coordinates);
        setMapZoom(12); // Zoom in when a wilaya is selected
        
        // Fetch car data for the selected wilaya
        if (wilaya.available) {
          fetchCarData(wilayaName);
        }
      }
    }
  }, [location.search]);

  // Update map center when wilaya changes
  useEffect(() => {
    // Skip this effect if we're handling URL parameters with lat/lng
    const searchParams = new URLSearchParams(location.search);
    const hasLatLng = searchParams.get('lat') && searchParams.get('lng');
    if (hasLatLng) return;
    
    if (selectedWilaya) {
      setMapCenter(selectedWilaya.coordinates);
      setMapZoom(12); // Zoom in when a wilaya is selected
      
      // Fetch car data for the selected wilaya
      if (selectedWilaya.available) {
        fetchCarData(selectedWilaya.name);
      } else {
        setCarData([]);
      }
    } else {
      // Default view of Algeria when no wilaya is selected
      setMapCenter([28.0339, 1.6596]); // Center of Algeria
      setMapZoom(6);
      setCarData([]);
    }
  }, [selectedWilaya, location.search]);
  
  // Function to get the map instance from the ref
  const getMap = () => {
    return mapRef.current ? mapRef.current : null;
  };
  
  // Function to get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      setSnackbar({
        open: true,
        message: 'Getting your location...',
        severity: 'info'
      });
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userCoords = [latitude, longitude];
          
          console.log('User location obtained:', userCoords);
          setUserLocation(userCoords);
          setMapCenter(userCoords);
          setMapZoom(15);
          
          // Find nearest wilaya to user location
          const nearestWilaya = findNearestWilaya(userCoords, wilayasConfig);
          if (nearestWilaya && nearestWilaya.name !== selectedWilaya?.name) {
            console.log('Setting nearest wilaya:', nearestWilaya.name);
            setSelectedWilaya(nearestWilaya);
          }
          
          setSnackbar({
            open: true,
            message: 'Location found!',
            severity: 'success'
          });
        },
        (error) => {
          console.error('Error getting user location:', error);
          let errorMessage = 'Unable to get your location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location services.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
            case error.UNKNOWN_ERROR:
              errorMessage = 'An unknown error occurred while getting your location.';
              break;
          }
          
          setSnackbar({
            open: true,
            message: errorMessage,
            severity: 'error'
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setSnackbar({
        open: true,
        message: 'Geolocation is not supported by your browser',
        severity: 'error'
      });
    }
  };
  
  // Initialize map when component mounts or when mapCenter or mapZoom changes
  useEffect(() => {
    const map = getMap();
    if (map && mapCenter) {
      console.log('Updating map view to:', mapCenter, 'with zoom:', mapZoom);
      
      // Use flyTo for smooth animation when changing map center
      map.flyTo(mapCenter, mapZoom, {
        animate: true,
        duration: 1.5 // seconds
      });
      
      // Force a re-render of markers if they're not showing up
      setTimeout(() => {
        const currentMap = getMap();
        if (currentMap) {
          console.log('Invalidating map size to force re-render');
          currentMap.invalidateSize();
        }
      }, 500);
      
      // Additional timeout to ensure markers are rendered
      setTimeout(() => {
        console.log('Second map refresh to ensure markers are visible');
        const currentMap = getMap();
        if (currentMap) {
          currentMap.invalidateSize();
          // Force redraw of all layers
          Object.values(currentMap._layers || {}).forEach(layer => {
            if (layer && layer._icon) {
              // Force redraw of marker icons
              const icon = layer._icon;
              const wasVisible = icon.style.display !== 'none';
              icon.style.display = 'none';
              // Trigger reflow
              void icon.offsetHeight;
              icon.style.display = wasVisible ? '' : 'none';
            }
          });
        }
      }, 1500);
    }
  }, [mapCenter, mapZoom]);
  
  // Function to fetch car data for the selected wilaya
  const fetchCarData = async (wilayaName) => {
    setIsLoadingCars(true);
    try {
      // Get URL parameters to check for a specific car to highlight
      const searchParams = new URLSearchParams(location.search);
      const highlightCarId = searchParams.get('carId');
      const highlightLat = searchParams.get('lat');
      const highlightLng = searchParams.get('lng');
      
      // Log URL parameters for debugging
      console.log('URL Parameters:', { highlightCarId, highlightLat, highlightLng, wilayaName });
      
      // Prepare API request
      const queryParams = new URLSearchParams({
        wilaya: wilayaName,
      }).toString();
      
      const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';
      console.log('Fetching cars from:', `${apiUrl}/api/cars/getcars?${queryParams}`);
      
      const response = await fetch(`${apiUrl}/api/cars/getcars?${queryParams}`);
      
      if (!response.ok) {
        console.error('Failed to fetch car data, status:', response.status);
        throw new Error(`Failed to fetch car data: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched car data count:', data.length);
      console.log('First car example:', data[0]);
      
      // Create some test car data with hardcoded locations for testing
      const testCarData = data.slice(0, 5).map((car, index) => {
        // Use the selected wilaya's coordinates with small offsets
        const wilayaCoords = selectedWilaya ? selectedWilaya.coordinates : [28.0339, 1.6596];
        return {
          ...car,
          location: {
            name: `Test Location ${index + 1}`,
            address: `${wilayaName}, Algeria`,
            lat: wilayaCoords[0] + (index * 0.01),
            lng: wilayaCoords[1] + (index * 0.01)
          },
          isHighlighted: car._id === highlightCarId
        };
      });
      
      console.log('Created test car data with hardcoded locations:', testCarData);
      
      // Use test car data for debugging
      if (testCarData.length > 0) {
        console.log('Using test car data for map display');
        setCarData(testCarData);
        setIsLoadingCars(false);
        return;
      }
      
      // Process car data to include location information
      const processedData = data.map(car => {
        // Check if this is the car we want to highlight from URL params
        const isHighlightedCar = car._id === highlightCarId;
        let locationData = null;
        
        // Debug log for each car
        console.log('Processing car:', car._id, 'isHighlighted:', isHighlightedCar);
        
        // Check all possible location data structures in the car object
        if (car.location) {
          console.log('Car has location property:', car.location);
          
          // Case 1: Direct lat/lng properties
          if (car.location.lat && car.location.lng) {
            locationData = {
              name: car.location.name || car.locationName || `${car.wilaya} Location`,
              address: car.location.address || car.locationAddress || `${car.wilaya}, Algeria`,
              lat: parseFloat(car.location.lat),
              lng: parseFloat(car.location.lng)
            };
            console.log('Using direct lat/lng:', locationData);
          }
          // Case 2: Nested coordinates object
          else if (car.location.coordinates && car.location.coordinates.lat && car.location.coordinates.lng) {
            locationData = {
              name: car.location.name || car.locationName || `${car.wilaya} Location`,
              address: car.location.address || car.locationAddress || `${car.wilaya}, Algeria`,
              lat: parseFloat(car.location.coordinates.lat),
              lng: parseFloat(car.location.coordinates.lng)
            };
            console.log('Using nested coordinates:', locationData);
          }
          // Case 3: GeoJSON format [lng, lat]
          else if (Array.isArray(car.location.coordinates) && car.location.coordinates.length >= 2) {
            locationData = {
              name: car.location.name || car.locationName || `${car.wilaya} Location`,
              address: car.location.address || car.locationAddress || `${car.wilaya}, Algeria`,
              lat: parseFloat(car.location.coordinates[1]), // GeoJSON is [lng, lat]
              lng: parseFloat(car.location.coordinates[0])
            };
            console.log('Using GeoJSON coordinates:', locationData);
          }
        }
        
        // Additional check for locationCoordinates property
        if (!locationData && car.locationCoordinates) {
          try {
            // Try to parse locationCoordinates if it's a string
            const coords = typeof car.locationCoordinates === 'string' 
              ? JSON.parse(car.locationCoordinates) 
              : car.locationCoordinates;
              
            if (coords.lat && coords.lng) {
              locationData = {
                name: car.locationName || `${car.wilaya} Location`,
                address: car.locationAddress || `${car.wilaya}, Algeria`,
                lat: parseFloat(coords.lat),
                lng: parseFloat(coords.lng)
              };
              console.log('Using locationCoordinates property:', locationData);
            } else if (Array.isArray(coords) && coords.length >= 2) {
              locationData = {
                name: car.locationName || `${car.wilaya} Location`,
                address: car.locationAddress || `${car.wilaya}, Algeria`,
                lat: parseFloat(coords[1]), // Assuming GeoJSON format [lng, lat]
                lng: parseFloat(coords[0])
              };
              console.log('Using locationCoordinates array:', locationData);
            }
          } catch (e) {
            console.error('Error parsing locationCoordinates:', e);
          }
        }
        
        // If this is the highlighted car from URL and we have coordinates, use those
        if (isHighlightedCar && highlightLat && highlightLng) {
          locationData = {
            name: car.locationName || car.location?.name || `${car.wilaya || wilayaName} Location`,
            address: car.locationAddress || car.location?.address || `${car.wilaya || wilayaName}, Algeria`,
            lat: parseFloat(highlightLat),
            lng: parseFloat(highlightLng)
          };
          console.log('Using URL coordinates for highlighted car:', locationData);
        }
        
        // If we still don't have location data, assign a location based on pickup locations
        if (!locationData) {
          const wilaya = car.wilaya || wilayaName;
          console.log('No location data found, using pickup locations for wilaya:', wilaya);
          
          // Try to extract coordinates from address using geocoding service (if available)
          if (car.address || car.locationAddress) {
            const address = car.address || car.locationAddress;
            console.log('Attempting to use address for location:', address);
            
            // For now, we'll still use fallback mechanisms
            // In a production app, you might want to integrate a geocoding service here
          }
          
          // Try to use one of the pickup locations for this wilaya
          if (pickupLocations[wilaya] && pickupLocations[wilaya].length > 0) {
            // Distribute cars evenly across pickup locations instead of random selection
            // Use car._id to deterministically select a pickup location
            const carIdSum = car._id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
            const pickupIndex = carIdSum % pickupLocations[wilaya].length;
            const pickupLocation = pickupLocations[wilaya][pickupIndex];
            
            // Add small random offset to avoid all cars at the exact same spot
            // Use car._id to generate a consistent offset for the same car
            const seedValue = carIdSum / 1000;
            const latOffset = (((seedValue * 9301 + 49297) % 233280) / 233280 - 0.5) * 0.005;
            const lngOffset = (((seedValue * 9301 + 49297) % 233280) / 233280 - 0.5) * 0.005;
            
            locationData = {
              name: pickupLocation.name,
              address: pickupLocation.address,
              lat: pickupLocation.position[0] + latOffset,
              lng: pickupLocation.position[1] + lngOffset
            };
            console.log('Using pickup location with deterministic offset:', locationData);
          } else {
            // Fallback to wilaya coordinates with deterministic offset
            const wilayaConfig = wilayasConfig.find(w => w.name === wilaya || w.name.toLowerCase() === wilaya.toLowerCase());
            if (wilayaConfig) {
              // Generate deterministic offset based on car._id
              const carIdSum = car._id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
              const seedValue = carIdSum / 1000;
              const latOffset = (((seedValue * 9301 + 49297) % 233280) / 233280 - 0.5) * 0.01;
              const lngOffset = (((seedValue * 9301 + 49297) % 233280) / 233280 - 0.5) * 0.01;
              
              locationData = {
                name: `${wilaya} Center`,
                address: `${wilaya}, Algeria`,
                lat: wilayaConfig.coordinates[0] + latOffset,
                lng: wilayaConfig.coordinates[1] + lngOffset
              };
              console.log('Using wilaya coordinates with deterministic offset:', locationData);
            } else {
              // Last resort: use the selected wilaya's coordinates
              if (selectedWilaya && selectedWilaya.coordinates) {
                const carIdSum = car._id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
                const seedValue = carIdSum / 1000;
                const latOffset = (((seedValue * 9301 + 49297) % 233280) / 233280 - 0.5) * 0.01;
                const lngOffset = (((seedValue * 9301 + 49297) % 233280) / 233280 - 0.5) * 0.01;
                
                locationData = {
                  name: `${wilayaName} Area`,
                  address: `${wilayaName}, Algeria`,
                  lat: selectedWilaya.coordinates[0] + latOffset,
                  lng: selectedWilaya.coordinates[1] + lngOffset
                };
                console.log('Using selected wilaya coordinates with offset:', locationData);
              }
            }
          }
        }
        
        // Return the processed car data with location information
        return {
          ...car,
          location: locationData,
          isHighlighted: isHighlightedCar
        };
      }).filter(car => car.location); // Filter out cars without location data
      
      // Add a placeholder for the highlighted car if it's not in the fetched data
      if (highlightCarId && !processedData.some(car => car._id === highlightCarId) && highlightLat && highlightLng) {
        console.log('Adding placeholder for highlighted car not in fetched data');
        
        // Fetch the specific car data if possible
        try {
          const carResponse = await fetch(`${apiUrl}/api/cars/${highlightCarId}`);
          if (carResponse.ok) {
            const carData = await carResponse.json();
            console.log('Fetched highlighted car data:', carData);
            
            processedData.push({
              ...carData,
              location: {
                name: carData.locationName || `${carData.wilaya || wilayaName} Location`,
                address: carData.locationAddress || `${carData.wilaya || wilayaName}, Algeria`,
                lat: parseFloat(highlightLat),
                lng: parseFloat(highlightLng)
              },
              isHighlighted: true
            });
          } else {
            // If we can't fetch the specific car, create a placeholder
            console.log('Could not fetch highlighted car, creating placeholder');
            processedData.push({
              _id: highlightCarId,
              carName: 'Selected Car',
              brand: 'Car',
              price: 0,
              location: {
                name: `${wilayaName} Location`,
                address: `${wilayaName}, Algeria`,
                lat: parseFloat(highlightLat),
                lng: parseFloat(highlightLng)
              },
              isHighlighted: true
            });
          }
        } catch (error) {
          console.error('Error fetching highlighted car:', error);
          // Create a placeholder anyway
          processedData.push({
            _id: highlightCarId,
            carName: 'Selected Car',
            brand: 'Car',
            price: 0,
            location: {
              name: `${wilayaName} Location`,
              address: `${wilayaName}, Algeria`,
              lat: parseFloat(highlightLat),
              lng: parseFloat(highlightLng)
            },
            isHighlighted: true
          });
        }
      }
      
      console.log('Final processed car data:', processedData);
      setCarData(processedData);
    } catch (error) {
      console.error('Error fetching car data:', error);
    } finally {
      setIsLoadingCars(false);
    }
  };
  
  // Handle wilaya selection
  const handleWilayaChange = (event, newValue) => {
    setSelectedWilaya(newValue);
  };
  
  const handleZoomIn = () => {
    if (mapRef.current && mapZoom < 18) {
      const newZoom = mapZoom + 1;
      setMapZoom(newZoom);
    }
  };
  
  const handleZoomOut = () => {
    if (mapRef.current && mapZoom > 3) {
      const newZoom = mapZoom - 1;
      setMapZoom(newZoom);
    }
  };
  
  const handleMyLocation = () => {
    // Show loading status
    setLocationStatus('loading');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userCoords = [latitude, longitude];
          
          // Set the user location and immediately center the map there with high zoom
          setUserLocation(userCoords);
          setMapCenter(userCoords);
          setMapZoom(16); // Higher zoom level to see details
          
          // Find the nearest wilaya to the user's location
          const nearestWilaya = findNearestWilaya(userCoords, wilayasConfig, 50);
          
          if (nearestWilaya) {
            // Select the nearest wilaya and find nearby pickup locations
            setSelectedWilaya(nearestWilaya);
            
            if (nearestWilaya.available) {
              const nearby = findNearbyPickupLocations(userCoords, pickupLocationsConfig, nearestWilaya, 20);
              setNearbyLocations(nearby);
              
              // Show success status with the found wilaya
              setLocationStatus('success');
            } else {
              // Wilaya found but not available for rentals
              setLocationStatus('not-available');
            }
          } else {
            // No wilaya found near the user's location
            setLocationStatus('not-found');
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError(error.message || 'Failed to get your location');
          setLocationStatus('error');
          
          // Show error notification
          setIsLocationDialogOpen(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000, // Increased timeout for better reliability
          maximumAge: 0
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
      setLocationStatus('error');
      setIsLocationDialogOpen(true);
    }
  };
  
  // Function to select wilaya when user is on the map
  const handleSelectWilayaFromMap = (wilaya) => {
    setSelectedWilaya(wilaya);
    
    // Find nearby pickup locations if the wilaya is available
    if (wilaya.available && userLocation) {
      const nearby = findNearbyPickupLocations(userLocation, pickupLocationsConfig, wilaya, 20);
      setNearbyLocations(nearby);
    } else {
      setNearbyLocations([]);
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ 
        position: 'relative',
        marginTop: '-40px',
        transform: 'translateY(-20px)',
        zIndex: 1100
      }}>
        <QuickSearch noBackground={true} />
      </Box>
      <Box sx={{
        width: '100%',
        pt: 2,
        pb: 8,
        backgroundColor: '#f8fafc'
      }}>
        <Container maxWidth={false} disableGutters sx={{ 
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column'
        }}>

          
          {/* Wilaya Selector */}
          <Box sx={{ width: '95%', mx: 'auto', mb: 4, maxWidth: '1200px' }}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                backgroundColor: 'white',
                boxShadow: '0 4px 20px rgba(71, 85, 105, 0.1)',
                borderTop: '4px solid #475569'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      background: 'linear-gradient(135deg, #475569 0%, #334155 100%)', 
                      borderRadius: '8px', 
                      p: 1.2, 
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(51, 65, 85, 0.15)'
                    }}
                  >
                    <FilterAltIcon sx={{ color: 'white', fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155', lineHeight: 1.2 }}>
                      Select a Wilaya
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      Choose from available locations or search by name
                    </Typography>
                  </Box>
                </Box>
                
                <Button
                  variant="outlined"
                  startIcon={<MyLocationIcon />}
                  onClick={handleMyLocation}
                  sx={{
                    color: '#475569',
                    borderColor: '#cbd5e1',
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                      borderColor: '#94a3b8'
                    },
                    fontSize: '0.875rem',
                    py: 0.75,
                    px: 2
                  }}
                >
                  Use My Location
                </Button>
              </Box>
              
              <Autocomplete
                id="wilaya-selector"
                options={wilayasConfig}
                getOptionLabel={(option) => option.name}
                getOptionDisabled={(option) => !option.available}
                value={selectedWilaya}
                onChange={handleWilayaChange}
                disableClearable={false}
                openOnFocus
                blurOnSelect
                renderOption={(props, option) => (
                  <MenuItem 
                    {...props} 
                    disabled={!option.available}
                    sx={{
                      opacity: option.available ? 1 : 0.5,
                      py: 1.2,
                      '&.Mui-disabled': {
                        opacity: 0.5
                      },
                      '&.Mui-selected': {
                        backgroundColor: '#f1f5f9'
                      },
                      '&:hover': {
                        backgroundColor: '#f8fafc'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                      <Typography>{option.name}</Typography>
                      {option.available ? (
                        <Chip 
                          size="small" 
                          label="Available" 
                          sx={{ 
                            background: 'linear-gradient(135deg, #475569 0%, #334155 100%)', 
                            color: 'white',
                            fontSize: '0.7rem',
                            height: 22,
                            fontWeight: 500,
                            px: 0.5
                          }} 
                        />
                      ) : (
                        <Chip 
                          size="small" 
                          label="Coming Soon" 
                          sx={{ 
                            bgcolor: '#e2e8f0', 
                            color: '#64748b',
                            fontSize: '0.7rem',
                            height: 22,
                            fontWeight: 500
                          }} 
                        />
                      )}
                    </Box>
                  </MenuItem>
                )}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Search for a wilaya" 
                    placeholder="Type to search or select from the list"
                    variant="outlined"
                    size="medium"
                    fullWidth
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <SearchIcon sx={{ color: '#475569', mr: 1 }} />
                          {params.InputProps.startAdornment}
                        </>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#cbd5e1',
                        },
                        '&:hover fieldset': {
                          borderColor: '#94a3b8',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#475569',
                        },
                      },
                    }}
                  />
                )}
              />
              
              {selectedWilaya && (
                <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e2e8f0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        sx={{ 
                          background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
                          borderRadius: '6px',
                          p: 0.8,
                          mr: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <LocationOnIcon sx={{ color: 'white', fontSize: 18 }} />
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#334155' }}>
                        {selectedWilaya.available ? 'Available Pickup Locations' : 'City Center'} in {selectedWilaya.name}
                      </Typography>
                    </Box>
                    
                    {userLocation && locationStatus === 'success' && nearbyLocations.length > 0 && (
                      <Chip 
                        label={`${nearbyLocations.length} location${nearbyLocations.length > 1 ? 's' : ''} nearby`}
                        size="small"
                        sx={{ 
                          bgcolor: '#f1f5f9',
                          color: '#475569',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                          height: 24
                        }}
                      />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1.5 }}>
                    {selectedWilaya.available && (userLocation && locationStatus === 'success' && nearbyLocations.length > 0 ? 
                      // Show nearby locations first if user location is available
                      nearbyLocations.map((location) => (
                        <Chip 
                          key={location.id}
                          label={`${location.name} (${location.distance} km)`}
                          icon={<LocationOnIcon />}
                          clickable
                          sx={{ 
                            bgcolor: '#e2e8f0', 
                            color: '#334155',
                            borderRadius: '8px',
                            py: 0.7,
                            fontWeight: 500,
                            border: '1px solid #cbd5e1',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: '#475569',
                              color: 'white',
                              boxShadow: '0 3px 8px rgba(71, 85, 105, 0.2)',
                              transform: 'translateY(-2px)'
                            },
                            '& .MuiChip-icon': {
                              color: '#475569',
                              transition: 'all 0.2s ease'
                            },
                            '&:hover .MuiChip-icon': {
                              color: 'white'
                            }
                          }}
                          onClick={() => {
                            setMapCenter(location.position);
                            setMapZoom(15);
                          }}
                        />
                      )) : 
                      // Otherwise show all pickup locations
                      pickupLocations[selectedWilaya.name]?.map((location) => (
                        <Chip 
                          key={location.id}
                          label={location.name}
                          icon={<LocationOnIcon />}
                          clickable
                          sx={{ 
                            bgcolor: '#f1f5f9', 
                            color: '#334155',
                            borderRadius: '8px',
                            py: 0.7,
                            fontWeight: 500,
                            border: '1px solid #e2e8f0',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: '#475569',
                              color: 'white',
                              boxShadow: '0 3px 8px rgba(71, 85, 105, 0.2)',
                              transform: 'translateY(-2px)'
                            },
                            '& .MuiChip-icon': {
                              color: '#475569',
                              transition: 'all 0.2s ease'
                            },
                            '&:hover .MuiChip-icon': {
                              color: 'white'
                            }
                          }}
                          onClick={() => {
                            setMapCenter(location.position);
                            setMapZoom(15);
                          }}
                        />
                      ))
                    )}
                    {!selectedWilaya.available && cityCentersConfig[selectedWilaya.name]?.map((location) => (
                      <Chip 
                        key={location.id}
                        label={location.name}
                        icon={<LocationOnIcon />}
                        clickable
                        sx={{ 
                          bgcolor: '#f1f5f9', 
                          color: '#334155',
                          borderRadius: '8px',
                          py: 0.7,
                          fontWeight: 500,
                          border: '1px solid #e2e8f0',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: '#475569',
                            color: 'white',
                            boxShadow: '0 3px 8px rgba(71, 85, 105, 0.2)',
                            transform: 'translateY(-2px)'
                          },
                          '& .MuiChip-icon': {
                            color: '#475569',
                            transition: 'all 0.2s ease'
                          },
                          '&:hover .MuiChip-icon': {
                            color: 'white'
                          }
                        }}
                        onClick={() => {
                          setMapCenter(location.position);
                          setMapZoom(15);
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Box>
          
          <Box sx={{ width: '95%', height: '100%', mx: 'auto', maxWidth: '1200px' }}>
            <Box
              sx={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(71, 85, 105, 0.1)',
                borderTop: '4px solid #475569'
              }}
            >
              
              {/* Leaflet Map */}
              {/* Custom map controls */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    bgcolor: 'white',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <IconButton
                    onClick={() => {
                      const map = getMap();
                      if (map) map.zoomIn();
                    }}
                    sx={{
                      color: '#475569',
                      borderRadius: '8px 8px 0 0',
                      p: 1,
                      '&:hover': {
                        bgcolor: '#f1f5f9'
                      }
                    }}
                  >
                    <ZoomInIcon />
                  </IconButton>
                  <Box sx={{ height: '1px', bgcolor: '#e2e8f0' }} />
                  <IconButton
                    onClick={() => {
                      const map = getMap();
                      if (map) map.zoomOut();
                    }}
                    sx={{
                      color: '#475569',
                      borderRadius: '0 0 8px 8px',
                      p: 1,
                      '&:hover': {
                        bgcolor: '#f1f5f9'
                      }
                    }}
                  >
                    <ZoomOutIcon />
                  </IconButton>
                </Paper>
                <Paper
                  elevation={3}
                  sx={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    bgcolor: 'white',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <IconButton
                    onClick={getUserLocation}
                    sx={{
                      color: '#475569',
                      borderRadius: '8px',
                      p: 1,
                      '&:hover': {
                        bgcolor: '#f1f5f9'
                      }
                    }}
                  >
                    <MyLocationIcon />
                  </IconButton>
                </Paper>
              </Box>
              
              <Box 
                sx={{ 
                  flexGrow: 1, 
                  position: 'relative',
                  width: '100%',
                  '& .leaflet-container': {
                    height: '600px',
                    width: '100%',
                    zIndex: 1,
                    borderRadius: '0 0 8px 8px',
                    boxShadow: 'inset 0 0 20px rgba(71, 85, 105, 0.15)'
                  },
                  '& .leaflet-control-zoom': {
                    border: 'none',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                  },
                  '& .leaflet-control-zoom a': {
                    color: '#475569',
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    width: '36px',
                    height: '36px',
                    lineHeight: '36px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    '&:hover': {
                      color: '#334155',
                      backgroundColor: '#f1f5f9'
                    }
                  },
                  '& .leaflet-control-attribution': {
                    backgroundColor: 'rgba(241, 245, 249, 0.7)',
                    color: '#64748b',
                    fontSize: '10px'
                  },
                  '& .leaflet-popup-content-wrapper': {
                    borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    overflow: 'hidden'
                  },
                  '& .leaflet-popup-content': {
                    margin: '8px 12px',
                    minWidth: isMobile ? '180px' : '220px'
                  },
                  '& .leaflet-popup-tip': {
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <MapContainer 
                  center={mapCenter} 
                  zoom={mapZoom} 
                  style={{ height: '600px', width: '100%' }}
                  zoomControl={true}
                  ref={mapRef}
                >
                  {/* Blue-grey styled map from Carto */}
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  />
                  
                  {/* Add zoom control */}
                  <ZoomControl position="topright" />
                  
                  {/* Apply blue-grey overlay */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(71, 85, 105, 0.15)',
                    mixBlendMode: 'color',
                    pointerEvents: 'none',
                    zIndex: 400
                  }} />
                  
                  {/* Custom CSS for marker clusters */}
                  <style jsx="true">{`
                    .marker-cluster {
                      background-color: rgba(71, 85, 105, 0.6);
                      border: 2px solid rgba(255, 255, 255, 0.8);
                      border-radius: 50%;
                      color: white;
                      font-weight: bold;
                      text-align: center;
                      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    }
                    
                    .marker-cluster div {
                      width: 80%;
                      height: 80%;
                      border-radius: 50%;
                      background-color: rgba(51, 65, 85, 0.9);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    }
                    
                    .marker-cluster-small {
                      background-color: rgba(71, 85, 105, 0.7);
                    }
                    
                    .marker-cluster-medium {
                      background-color: rgba(51, 65, 85, 0.8);
                    }
                    
                    .marker-cluster-large {
                      background-color: rgba(30, 41, 59, 0.85);
                    }
                    
                    .car-marker-icon {
                      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
                      transition: all 0.2s ease;
                    }
                    
                    .car-marker-icon:hover {
                      transform: scale(1.1);
                      filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.4));
                    }
                    
                    .highlighted-car-marker {
                      filter: drop-shadow(0 0 8px rgba(30, 64, 175, 0.8)) brightness(1.1);
                      animation: pulse 1.5s infinite;
                    }
                    
                    .highlighted-car-marker:hover {
                      transform: scale(1.15);
                      filter: drop-shadow(0 0 10px rgba(30, 64, 175, 0.9)) brightness(1.2);
                    }
                    
                    @keyframes pulse {
                      0% {
                        transform: scale(1);
                        filter: drop-shadow(0 0 5px rgba(30, 64, 175, 0.6)) brightness(1.1);
                      }
                      50% {
                        transform: scale(1.1);
                        filter: drop-shadow(0 0 12px rgba(30, 64, 175, 0.8)) brightness(1.2);
                      }
                      100% {
                        transform: scale(1);
                        filter: drop-shadow(0 0 5px rgba(30, 64, 175, 0.6)) brightness(1.1);
                      }
                    }
                  `}</style>
                  
                  {/* User location marker */}
                  {userLocation && (
                    <Marker
                      position={userLocation}
                      icon={new L.Icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                      })}
                    >
                      <Popup>
                        <Box sx={{ p: 1.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#334155' }}>
                            Your Current Location
                          </Typography>
                        </Box>
                      </Popup>
                    </Marker>
                  )}
                  
                  {/* Display markers for the selected wilaya */}
                  {selectedWilaya && selectedWilaya.available && pickupLocations[selectedWilaya.name] && 
                    pickupLocations[selectedWilaya.name].map((location) => (
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
                            <Button
                              size="small"
                              variant="outlined"
                              fullWidth
                              startIcon={<DirectionsCarIcon />}
                              sx={{ 
                                background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
                                color: 'white',
                                fontWeight: 600,
                                borderRadius: '8px',
                                border: 'none',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
                                  boxShadow: '0 4px 12px rgba(51, 65, 85, 0.25)',
                                  transform: 'translateY(-2px)'
                                },
                                '& .MuiButton-startIcon': {
                                  color: 'white'
                                }
                              }}
                              onClick={() => window.location.href = `/offers?wilaya=${encodeURIComponent(selectedWilaya.name)}`}
                            >
                              Find Cars
                            </Button>
                          </Box>
                        </Popup>
                      </Marker>
                    ))
                  }
                  
                  {/* Car markers with clustering */}
                  {/* Debug information */}
                  {console.log('Rendering car markers, count:', carData.length)}
                  {console.log('Car data sample:', carData.slice(0, 3))}
                  
                  {/* Direct markers without clustering first for testing */}
                  {carData.map((car) => {
                    console.log(`Rendering car marker for ${car._id} at position:`, [car.location.lat, car.location.lng]);
                    return (
                      <Marker
                        key={`direct-${car._id}`}
                        position={[car.location.lat, car.location.lng]}
                        icon={car.isHighlighted ? highlightedCarIcon : carIcon}
                      >
                        <Popup>
                          <Box sx={{ p: 1.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#334155' }}>
                              {car.brand} {car.carName}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                              {car.location.name || 'Car Location'}
                            </Typography>
                            <Button
                              size="small"
                              variant="contained"
                              fullWidth
                              sx={{ 
                                background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
                                color: 'white',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)'
                                }
                              }}
                              onClick={() => window.location.href = `/car/${car._id}`}
                            >
                              View Details
                            </Button>
                          </Box>
                        </Popup>
                      </Marker>
                    );
                  })}
                  
                  {/* Car markers with clustering */}
                  {selectedWilaya && selectedWilaya.available && carData.length > 0 && (
                    <MarkerClusterGroup
                      chunkedLoading
                      iconCreateFunction={(cluster) => {
                        const count = cluster.getChildCount();
                        let size;
                        let className;
                        
                        // Scale the cluster size based on the number of markers
                        if (count < 10) {
                          size = 30;
                          className = 'marker-cluster-small';
                        } else if (count < 30) {
                          size = 40;
                          className = 'marker-cluster-medium';
                        } else {
                          size = 50;
                          className = 'marker-cluster-large';
                        }
                        
                        // Create a custom cluster icon with blue-grey styling
                        return L.divIcon({
                          html: `<div><span>${count}</span></div>`,
                          className: `marker-cluster ${className}`,
                          iconSize: L.point(size, size),
                          iconAnchor: L.point(size/2, size/2)
                        });
                      }}
                      spiderfyOnMaxZoom={true}
                      showCoverageOnHover={false}
                      maxClusterRadius={60}
                      disableClusteringAtZoom={16}
                      animate={true}
                    >
                      {carData.map((car) => (
                        <Marker
                          key={car._id}
                          position={[car.location.lat, car.location.lng]}
                          icon={car.isHighlighted ? highlightedCarIcon : carIcon}
                          zIndexOffset={car.isHighlighted ? 1000 : 0} // Make highlighted car appear on top
                        >
                          <Popup>
                            <Box sx={{ p: 1.5 }}>
                              <Typography variant="subtitle2" sx={{ 
                                fontWeight: 700, 
                                mb: 1, 
                                color: car.isHighlighted ? '#1e40af' : '#334155',
                                fontSize: car.isHighlighted ? '1rem' : 'inherit'
                              }}>
                                {car.brand} {car.carName}
                                {car.isHighlighted && (
                                  <Chip 
                                    size="small" 
                                    label="Selected Car" 
                                    sx={{ 
                                      ml: 1,
                                      background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)', 
                                      color: 'white',
                                      fontSize: '0.65rem',
                                      height: 20,
                                      fontWeight: 500
                                    }} 
                                  />
                                )}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <LocationOnIcon sx={{ fontSize: 16, color: '#64748b', mr: 0.5 }} />
                                <Typography variant="body2" sx={{ color: '#64748b' }}>
                                  {car.location.name}
                                </Typography>
                              </Box>
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
