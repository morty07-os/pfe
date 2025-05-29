import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog, DialogContent, DialogActions, Button, TextField, Box, Typography, InputAdornment, MenuItem, IconButton, Snackbar, Alert,
  DialogTitle, Paper, CircularProgress
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Import Leaflet and fix icon issue
import L from 'leaflet';
import { createRoot } from 'react-dom/client';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';

// Import geosearch
import { OpenStreetMapProvider } from 'leaflet-geosearch';

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

// List of Algerian Wilayas
const wilayas = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira",
  "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Algiers", "Djelfa", "Jijel", "Sétif", "Saïda",
  "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla",
  "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela",
  "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar",
  "Ouled Djellal", "Béni Abbès", "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa"
];

// Create a custom search component that doesn't use useMap
function SearchControl({ onLocationFound, mapRef }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const provider = useRef(new OpenStreetMapProvider());
  const searchTimeout = useRef(null);
  
  // Function to fetch suggestions as user types, limited to Algeria
  const fetchSuggestions = async (query) => {
    if (!query.trim() || query.trim().length < 2) return;
    
    setIsSearching(true);
    try {
      // Add 'Algeria' to the search query to focus on Algerian locations
      const searchQuery = `${query}, Algeria`;
      const results = await provider.current.search({ query: searchQuery });
      
      // Filter results to ensure they're in Algeria
      const algerianResults = results.filter(result => {
        const label = result.label.toLowerCase();
        return label.includes('algeria') || label.includes('algérie') || label.includes('الجزائر');
      });
      
      setSearchResults(algerianResults.slice(0, 5)); // Limit to 5 results
      setShowResults(true);
    } catch (error) {
      console.error('Search suggestion error:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle input change with debounce
  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    // If query is empty, clear results
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    // Set new timeout for debounce (300ms)
    searchTimeout.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
  };
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);
  
  const handleResultClick = (result) => {
    const { y: lat, x: lng } = result;
    const location = { lat, lng };
    onLocationFound(location);
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], 15);
    }
    setShowResults(false);
    setSearchQuery(result.label.split(',')[0]); // Set search input to selected location name
  };
  
  return (
    <Paper sx={{
      position: 'absolute',
      top: 16,
      left: 16,
      right: 16,
      zIndex: 1000,
      borderRadius: 3,
      boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
      overflow: 'hidden',
      bgcolor: 'rgba(255,255,255,0.98)',
      maxWidth: 'calc(100% - 32px)',
      border: '1px solid rgba(203, 213, 225, 0.8)'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5 }}>
        <TextField
          fullWidth
          placeholder="Search for a location in Algeria..."
          value={searchQuery}
          onChange={handleInputChange}
          onKeyPress={(e) => e.key === 'Enter' && searchResults.length > 0 && handleResultClick(searchResults[0])}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#64748b' }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#cbd5e1',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#94a3b8',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#475569',
              },
            }
          }}
          variant="outlined"
          size="small"
        />
        {searchQuery && (
          <IconButton 
            onClick={() => {
              setSearchQuery('');
              setSearchResults([]);
              setShowResults(false);
            }} 
            sx={{ color: '#94a3b8', ml: 1 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Search results with suggestions */}
      {(showResults && searchResults.length > 0) && (
        <Box sx={{ 
          maxHeight: 300, 
          overflowY: 'auto',
          borderTop: '1px solid #e2e8f0',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f5f9',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#cbd5e1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#94a3b8',
          },
        }}>
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              p: 1, 
              bgcolor: '#f8fafc', 
              color: '#64748b',
              fontWeight: 500,
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Box 
              component="img" 
              src="https://flagcdn.com/w20/dz.png" 
              alt="Algeria flag" 
              sx={{ width: 16, height: 'auto', mr: 0.8 }} 
            />
            Algerian Locations
          </Typography>
          {searchResults.map((result, index) => (
            <Box 
              key={index}
              onClick={() => handleResultClick(result)}
              sx={{ 
                p: 1.5, 
                cursor: 'pointer', 
                '&:hover': { bgcolor: '#f8fafc' },
                borderBottom: index < searchResults.length - 1 ? '1px solid #f1f5f9' : 'none',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              <Box sx={{ 
                bgcolor: '#f1f5f9', 
                borderRadius: '50%', 
                width: 32, 
                height: 32, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mr: 1.5
              }}>
                <LocationOnIcon sx={{ color: '#475569', fontSize: 18 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                  {result.label.split(',')[0]}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                  {result.label.split(',').slice(1).join(',').trim()}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
      
      {/* No results message */}
      {showResults && searchResults.length === 0 && !isSearching && searchQuery.trim().length >= 2 && (
        <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SearchIcon fontSize="small" sx={{ color: '#94a3b8', mr: 0.5 }} />
              <Box 
                component="img" 
                src="https://flagcdn.com/w20/dz.png" 
                alt="Algeria flag" 
                sx={{ width: 16, height: 'auto', ml: 0.5 }} 
              />
            </Box>
            No locations found in Algeria. Try a different search term or be more specific.
          </Typography>
        </Box>
      )}
      
      {/* Loading indicator */}
      {isSearching && (
        <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={20} sx={{ color: '#475569', mr: 1.5 }} />
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Searching locations...
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

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
      <Popup>Your car will be located here</Popup>
    </Marker>
  );
}

const brands = [
  'Toyota', 'Renault', 'Peugeot', 'Hyundai', 'Volkswagen', 'Kia', 'Dacia', 'Citroën', 'Fiat', 'Seat',
  'BMW', 'Mercedes-Benz', 'Audi', 'Ford', 'Chevrolet', 'Nissan', 'Honda', 'Mazda', 'Jeep', 'Land Rover',
  'Opel', 'Skoda', 'Suzuki', 'Mitsubishi', 'Subaru', 'Porsche', 'Lexus', 'Jaguar', 'Mini', 'Volvo',
  'Tesla', 'Alfa Romeo', 'Infiniti', 'Acura', 'Chery', 'Geely', 'BYD', 'Great Wall', 'Dongfeng',
  'Changan', 'SsangYong', 'Isuzu', 'Daewoo', 'Other'
];
const energies = ['Essence', 'Diesel', 'Hybrid', 'Electric'];
  const transmissions = ['Manual', 'Automatic'];
const carTypes = ['SUV', 'VAN', 'STATIONWAGON', 'CITADINE', 'SEDAN'];

const carFeatures = [
  { 
    id: 'airConditioning', 
    label: 'Air Conditioning', 
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4V20M4 12H20M7 7L17 17M7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  },
  { 
    id: 'bluetooth', 
    label: 'Bluetooth', 
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 8L18 16L12 22V2L18 8L6 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  },
  { 
    id: 'cruiseControl', 
    label: 'Cruise Control', 
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4V8M12 12V16M4 12H8M16 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    </svg>
  },
  { 
    id: 'parkingSensors', 
    label: 'Parking Sensors', 
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 8V16M8 4H16M20 8V16M8 20H16M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  },
  { 
    id: 'reverseCam', 
    label: 'Reverse Camera', 
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" stroke="currentColor" strokeWidth="2" />
      <path d="M7 8L9 4H15L17 8" stroke="currentColor" strokeWidth="2" />
    </svg>
  },
  { 
    id: 'usb', 
    label: 'USB Port', 
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 10V2M12 22V16M8 6H16M8 18H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="8" y="10" width="8" height="6" stroke="currentColor" strokeWidth="2" />
    </svg>
  },
  { 
    id: 'auxInput', 
    label: 'AUX Input', 
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12H7M17 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
      <path d="M10 16L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  },
  { 
    id: 'leatherSeats', 
    label: 'Leather Seats', 
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12V19H19V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 8V5H19V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 8C5 10.2091 8.13401 12 12 12C15.866 12 19 10.2091 19 8" stroke="currentColor" strokeWidth="2" />
    </svg>
  },
  { 
    id: 'heatedSeats', 
    label: 'Heated Seats', 
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12V19H19V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 5V9M9 6L15 8M9 8L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  },
  { 
    id: 'sunroof', 
    label: 'Sunroof', 
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 8V6C8 4.89543 9.79086 4 12 4C14.2091 4 16 4.89543 16 6V8" stroke="currentColor" strokeWidth="2" />
    </svg>
  },
  { 
    id: 'navigation', 
    label: 'Navigation', 
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M12 4V12L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  },
  { 
    id: 'keylessEntry', 
    label: 'Keyless Entry', 
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="15" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M12 15H19V10L16 7H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  },
  { 
    id: 'alloyWheels', 
    label: 'Alloy Wheels', 
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M12 4V9M12 15V20M4 12H9M15 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  },
  { 
    id: 'childSeat', 
    label: 'Child Seat', 
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="7" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M8 14H16L17 20H7L8 14Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  },
  { 
    id: 'airbags', 
    label: 'Airbags', 
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  }
];

function PostCarDialog({ open, onClose }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const mapRef = useRef(null);

  // Move state declarations outside of conditional blocks
  const [formData, setFormData] = useState({
    carName: '',
    brand: '',
    wilaya: '', // Added wilaya field
    carType: '', // Added carType field
    description: '',
    price: '',
    energy: '',
    transmission: '',
    images: [], // Will store Cloudinary URLs
    imageFiles: [], // Will store file objects for upload
    location: null,
    features: {}
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Add authentication check when dialog opens and check for selected location
  useEffect(() => {
    if (!token && open) {
      console.log("No token found, redirecting to sign in");
      onClose(); // Close the dialog
      navigate('/sign-in'); // Redirect to sign-in page
    }
    
    // Check for selected location in localStorage when dialog opens
    if (open) {
      const savedLocation = localStorage.getItem('selectedLocation');
      if (savedLocation) {
        try {
          const locationData = JSON.parse(savedLocation);
          setFormData(prev => ({ ...prev, location: locationData }));
          // Clear the localStorage after retrieving the location
          localStorage.removeItem('selectedLocation');
        } catch (error) {
          console.error('Error parsing saved location:', error);
        }
      }
    }
  }, [open, onClose, navigate, token]);

  // If no token and dialog is open, don't render the component
  if (!token && open) {
    return null;
  }

  // Function to upload an image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'car_rental'); // Create an unsigned upload preset in your Cloudinary dashboard
      
      const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';
      const response = await fetch(`${apiUrl}/api/upload/cloudinary`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image to Cloudinary');
      }
      
      const data = await response.json();
      return data.secure_url; // Return the Cloudinary URL
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to upload image. Please try again.', 
        severity: 'error' 
      });
      return null;
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const newImageFiles = Array.from(files);
      // Store the file objects for later upload
      setFormData(prev => ({ ...prev, imageFiles: [...prev.imageFiles, ...newImageFiles] }));
      // Create previews from the files
      setImagePreviews(prev => [...prev, ...newImageFiles.map(file => URL.createObjectURL(file))]);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveImage = (index) => {
    // Remove from imageFiles array
    const newImageFiles = [...formData.imageFiles];
    newImageFiles.splice(index, 1);
    setFormData(prev => ({ ...prev, imageFiles: newImageFiles }));
    
    // Remove from images array if it exists
    if (formData.images.length > index) {
      const newImages = [...formData.images];
      newImages.splice(index, 1);
      setFormData(prev => ({ ...prev, images: newImages }));
    }
    
    // Remove preview
    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]); // Clean up memory
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const handleOpenMapDialog = () => {
    setMapDialogOpen(true);
    // If we already have a location, center the map on it
    if (formData.location && mapRef.current) {
      setTimeout(() => {
        mapRef.current.setView([formData.location.lat, formData.location.lng], 15);
      }, 300);
    }
  };
  
  const handleCloseMapDialog = () => {
    setMapDialogOpen(false);
  };
  
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Update the map center to show the current location
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 15);
          }
          
          // Set the location in form data
          setFormData(prev => ({
            ...prev,
            location: { lat: latitude, lng: longitude }
          }));
          
          setSnackbar({
            open: true,
            message: 'Current location detected and shown on map',
            severity: 'success'
          });
          
          // Don't close the dialog automatically
          // Let the user confirm the location by clicking the Confirm button
        },
        (error) => {
          console.error('Error getting location:', error);
          setSnackbar({
            open: true,
            message: 'Could not get your location. Please try again or select on map.',
            severity: 'error'
          });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if location is set
    if (!formData.location) {
      setSnackbar({
        open: true,
        message: 'Please set a pickup location before submitting',
        severity: 'error'
      });
      return;
    }
    
    // Check if images are selected
    if (formData.imageFiles.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please upload at least one image of your car',
        severity: 'error'
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      // First, upload all images to Cloudinary
      const cloudinaryUrls = [];
      
      // Use the Cloudinary API directly
      const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';
      
      // Upload each image to Cloudinary
      for (const imageFile of formData.imageFiles) {
        const uploadData = new FormData();
        uploadData.append('file', imageFile);
        
        const uploadResponse = await fetch(`${apiUrl}/api/upload/cloudinary`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: uploadData
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload images to Cloudinary');
        }
        
        const uploadResult = await uploadResponse.json();
        cloudinaryUrls.push(uploadResult.secure_url);
      }
      
      // Create a FormData object for the car data
      const formDataToSend = new FormData();
      
      // Append all form fields
      formDataToSend.append('carName', formData.carName);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('wilaya', formData.wilaya);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('energy', formData.energy);
      formDataToSend.append('seats', formData.seats);
      formDataToSend.append('doors', formData.doors);
      formDataToSend.append('transmission', formData.transmission);
      formDataToSend.append('mileage', formData.mileage);
      formDataToSend.append('engine', formData.engine);
      formDataToSend.append('availabilityStart', formData.availabilityStart);
      formDataToSend.append('availabilityEnd', formData.availabilityEnd);
      formDataToSend.append('price', formData.price);
      
      // Append location data
      formDataToSend.append('location[lat]', formData.location.lat);
      formDataToSend.append('location[lng]', formData.location.lng);

      // Check for token again before submitting
      if (!token) {
        console.error("No token found during submission");
        setSnackbar({ open: true, message: 'You must be logged in to post a car', severity: 'error' });
        onClose();
        navigate('/SignIn'); // Redirect to sign-in page
        return;
      }

      // Validate token format (basic check for JWT format)
      if (typeof token !== 'string' || token.split('.').length !== 3) {
        console.error("Invalid token format");
        localStorage.removeItem('token'); // Remove invalid token
        localStorage.removeItem('userId'); // Remove invalid userId
        setSnackbar({ open: true, message: 'Your session is invalid. Please sign in again.', severity: 'error' });
        onClose();
        return;
      }
      
      // Validate availability dates
      if (formData.availabilityStart && formData.availabilityEnd) {
        const startDate = new Date(formData.availabilityStart);
        const endDate = new Date(formData.availabilityEnd);
        
        if (startDate >= endDate) {
          setSnackbar({ 
            open: true, 
            message: 'End date must be after start date.', 
            severity: 'error' 
          });
          return;
        }
      }

      // Append Cloudinary image URLs
      cloudinaryUrls.forEach(url => formDataToSend.append('images', url));

      // Use environment variable for API URL
      const response = await fetch(`${apiUrl}/api/cars/addcars`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post the car');
      }

      setSnackbar({ open: true, message: 'Car posted successfully!', severity: 'success' });
      onClose();
    } catch (error) {
      console.error("Error posting car:", error.message);
      setSnackbar({ open: true, message: error.message || 'Failed to post the car. Please try again.', severity: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 12px 50px -12px rgba(30,41,59,0.25)',
          bgcolor: '#f8fafc',
        }
      }}>
        <Box sx={{ position: 'relative', background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)', p: 4, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: 'white', letterSpacing: 0.5 }}>
            Post Your Car for Rent
          </Typography>
          <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.85)', mb: 0 }}>
            Share your car and earn income easily
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', right: 16, top: 16, color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 4, maxHeight: '70vh', overflowY: 'auto', bgcolor: '#f8fafc' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Image Upload */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#334155', fontWeight: 600 }}>
                  Car Images
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AddPhotoAlternateIcon />}
                  fullWidth
                  sx={{ mb: 1.5, textTransform: 'none', justifyContent: 'flex-start', borderRadius: 2, borderColor: '#475569', color: '#475569', bgcolor: '#f1f5f9', '&:hover': { borderColor: '#334155', bgcolor: '#e2e8f0' } }}
                >
                  Upload Images (max 5)
                  <input
                    type="file"
                    accept="image/*"
                    name="images"
                    multiple
                    hidden
                    onChange={handleChange}
                    max={5}
                  />
                </Button>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    overflowX: 'auto',
                    mt: 1,
                    p: 1,
                    border: '1px solid #cbd5e1',
                    borderRadius: 2,
                    bgcolor: '#f8fafc',
                  }}
                >
                  {imagePreviews.map((src, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        position: 'relative',
                        width: 72,
                        height: 72,
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: '2px solid #cbd5e1',
                        bgcolor: '#fff',
                        boxShadow: '0 2px 8px rgba(30,41,59,0.07)',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={src}
                        alt="preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveImage(idx)}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          color: 'white',
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          },
                          p: 0.5,
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
              {/* First pickup location button removed as requested */}
              {/* Description */}
              <TextField
                required
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                minRows={2}
                maxRows={4}
                InputProps={{
                  sx: {
                    borderRadius: 2.5,
                    bgcolor: '#f1f5f9',
                    boxShadow: '0 1px 4px rgba(30,41,59,0.03)',
                    '&:hover': { bgcolor: '#e2e8f0' },
                    '&.Mui-focused': { boxShadow: '0 0 0 2px #64748b44', borderColor: '#475569' }
                  }
                }}
                InputLabelProps={{
                  sx: { fontWeight: 600, color: '#334155', letterSpacing: 0.3 }
                }}
              />
              {/* Car Name, Brand, Wilaya */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="Car Name"
                  name="carName"
                  value={formData.carName}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <svg width="20" height="20" fill="none" style={{marginRight: 4}}><rect width="20" height="20" rx="10" fill="#e2e8f0"/><path d="M6 15v-2a2 2 0 012-2h4a2 2 0 012 2v2" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round"/><rect x="4.5" y="10" width="11" height="2.5" rx="1.25" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.2"/></svg>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: '#f1f5f9',
                      boxShadow: '0 1px 4px rgba(30,41,59,0.03)',
                      '&:hover': { bgcolor: '#e2e8f0' },
                      '&.Mui-focused': { boxShadow: '0 0 0 2px #64748b44', borderColor: '#475569' }
                    }
                  }}
                  InputLabelProps={{ sx: { fontWeight: 600, color: '#334155', letterSpacing: 0.3 } }}
                />
                <TextField
                  required
                  select
                  fullWidth
                  label="Brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <svg width="20" height="20" fill="none" style={{marginRight: 4}}>
  <rect width="20" height="20" rx="10" fill="#e2e8f0"/>
  <circle cx="10" cy="10" r="6" stroke="#64748b" strokeWidth="1.5" fill="#fff"/>
  <path d="M10 4v12M4 10h12" stroke="#64748b" strokeWidth="1.2"/>
  <path d="M10 10l4.2-4.2" stroke="#64748b" strokeWidth="1.1"/>
  <circle cx="10" cy="10" r="2.2" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.1"/>
</svg>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: '#f1f5f9',
                      boxShadow: '0 1px 4px rgba(30,41,59,0.03)',
                      '&:hover': { bgcolor: '#e2e8f0' },
                      '&.Mui-focused': { boxShadow: '0 0 0 2px #64748b44', borderColor: '#475569' }
                    }
                  }}
                  InputLabelProps={{ sx: { fontWeight: 600, color: '#334155', letterSpacing: 0.3 } }}
                >
                  {brands.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                </TextField>
                <TextField
                  required
                  select
                  fullWidth
                  label="Wilaya"
                  name="wilaya"
                  value={formData.wilaya}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon sx={{ color: '#64748b' }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: '#f1f5f9',
                      boxShadow: '0 1px 4px rgba(30,41,59,0.03)',
                      '&:hover': { bgcolor: '#e2e8f0' },
                      '&.Mui-focused': { boxShadow: '0 0 0 2px #64748b44', borderColor: '#475569' }
                    }
                  }}
                  InputLabelProps={{ sx: { fontWeight: 600, color: '#334155', letterSpacing: 0.3 } }}
                >
                  {wilayas.map(w => <MenuItem key={w} value={w}>{w}</MenuItem>)}
                </TextField>
              </Box>
              {/* Car Type */}
              <TextField
                required
                select
                fullWidth
                label="Car Type"
                name="carType"
                value={formData.carType}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <svg width="20" height="20" fill="none" style={{marginRight: 4}}><rect width="20" height="20" rx="10" fill="#e2e8f0"/><path d="M6 15v-2a2 2 0 012-2h4a2 2 0 012 2v2" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round"/><rect x="4.5" y="10" width="11" height="2.5" rx="1.25" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.2"/></svg>
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 2.5,
                    bgcolor: '#f1f5f9',
                    boxShadow: '0 1px 4px rgba(30,41,59,0.03)',
                    '&:hover': { bgcolor: '#e2e8f0' },
                    '&.Mui-focused': { boxShadow: '0 0 0 2px #64748b44', borderColor: '#475569' }
                  }
                }}
                InputLabelProps={{ sx: { fontWeight: 600, color: '#334155', letterSpacing: 0.3 } }}
              >
                {carTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </TextField>
              {/* Pickup Location */}
              <TextField
                fullWidth
                onClick={handleOpenMapDialog}
                value={formData.location ? 'Pickup Location Set ✓' : 'Click to set pickup location'}
                sx={{ 
                  cursor: 'pointer',
                  '& .MuiInputBase-input': { 
                    color: formData.location ? '#334155' : '#64748b',
                    fontWeight: formData.location ? 500 : 400
                  }
                }}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon sx={{ color: formData.location ? '#475569' : '#64748b' }} />
                    </InputAdornment>
                  ),
                  endAdornment: formData.location ? (
                    <InputAdornment position="end">
                      <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500, mr: 1 }}>
                        Click to change
                      </Typography>
                    </InputAdornment>
                  ) : null,
                  sx: {
                    borderRadius: 2.5,
                    bgcolor: formData.location ? '#e2e8f0' : '#f1f5f9',
                    border: formData.location ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
                    boxShadow: formData.location ? '0 2px 6px rgba(30,41,59,0.08)' : '0 1px 4px rgba(30,41,59,0.03)',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#e2e8f0', borderColor: '#cbd5e1' },
                    '&.Mui-focused': { boxShadow: '0 0 0 2px #475569', borderColor: '#475569' },
                    height: 56,
                    pl: 2
                  }
                }}
              />
              
              {/* Energy, Engine, Transmission */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  required
                  select
                  fullWidth
                  label="Energy"
                  name="energy"
                  value={formData.energy}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <svg width="20" height="20" fill="none" style={{marginRight: 4}}><rect width="20" height="20" rx="10" fill="#e2e8f0"/><rect x="7" y="7" width="6" height="8" rx="1.2" stroke="#64748b" strokeWidth="1.5"/><rect x="10" y="6" width="2" height="2" rx="0.5" fill="#64748b"/><path d="M8.5 8.5l5 5" stroke="#64748b" strokeWidth="1.1" strokeLinecap="round"/><rect x="9" y="11" width="2" height="2.5" rx="0.7" stroke="#64748b" strokeWidth="1.1"/></svg>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: '#f1f5f9',
                      boxShadow: '0 1px 4px rgba(30,41,59,0.03)',
                      '&:hover': { bgcolor: '#e2e8f0' },
                      '&.Mui-focused': { boxShadow: '0 0 0 2px #64748b44', borderColor: '#475569' }
                    }
                  }}
                  InputLabelProps={{ sx: { fontWeight: 600, color: '#334155', letterSpacing: 0.3 } }}
                >
                  {energies.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
                </TextField>
                <TextField
                  required
                  fullWidth
                  label="Engine (e.g. 1.6L, 90ch)"
                  name="engine"
                  value={formData.engine}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <svg width="20" height="20" fill="none" style={{marginRight: 4}}><rect width="20" height="20" rx="10" fill="#e2e8f0"/><path d="M7 13l6-6M7 7h6v6" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round"/></svg>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: '#f1f5f9',
                      boxShadow: '0 1px 4px rgba(30,41,59,0.03)',
                      '&:hover': { bgcolor: '#e2e8f0' },
                      '&.Mui-focused': { boxShadow: '0 0 0 2px #64748b44', borderColor: '#475569' }
                    }
                  }}
                  InputLabelProps={{ sx: { fontWeight: 600, color: '#334155', letterSpacing: 0.3 } }}
                />
                <TextField
                  required
                  select
                  fullWidth
                  label="Transmission"
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <svg width="20" height="20" fill="none" style={{marginRight: 4}}><rect width="20" height="20" rx="10" fill="#e2e8f0"/><path d="M7 13V7M13 13V7M7 10h6M10 7v6" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/><circle cx="7" cy="7" r="1" fill="#64748b"/><circle cx="13" cy="7" r="1" fill="#64748b"/><circle cx="7" cy="13" r="1" fill="#64748b"/><circle cx="13" cy="13" r="1" fill="#64748b"/><circle cx="10" cy="10" r="1" fill="#64748b"/></svg>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: '#f1f5f9',
                      boxShadow: '0 1px 4px rgba(30,41,59,0.03)',
                      '&:hover': { bgcolor: '#e2e8f0' },
                      '&.Mui-focused': { boxShadow: '0 0 0 2px #64748b44', borderColor: '#475569' }
                    }
                  }}
                  InputLabelProps={{ sx: { fontWeight: 600, color: '#334155', letterSpacing: 0.3 } }}
                >
                  {transmissions.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              </Box>
              {/* Seats, Doors, Mileage */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="Seats"
                  name="seats"
                  type="number"
                  value={formData.seats}
                  onChange={handleChange}
                  inputProps={{ min: 1, max: 9 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <svg width="20" height="20" fill="none" style={{marginRight: 4}}>
  <rect width="20" height="20" rx="10" fill="#e2e8f0"/>
  <path d="M7.5 5c0-1 .8-1.5 1.7-1.2l.3.1c.4.2.7.6.7 1.1v3.5" stroke="#64748b" strokeWidth="1.4" strokeLinecap="round"/>
  <path d="M9.5 8.5c-.7 1.1-1.3 2.2-1.3 3.7V15c0 .6.4 1 1 1h5.2c.6 0 1-.4 1-1v-1.2c0-.6-.4-1.3-1-1.5l-2.2-.7c-.5-.1-.8-.6-.8-1.1V8.5" stroke="#64748b" strokeWidth="1.4" strokeLinejoin="round" fill="#fff"/>
  <circle cx="8.5" cy="12.2" r="0.7" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.1"/>
  <path d="M10.5 15h3" stroke="#64748b" strokeWidth="1.2" strokeLinecap="round"/>
</svg>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: '#f1f5f9',
                      boxShadow: '0 1px 4px rgba(30,41,59,0.03)',
                      '&:hover': { bgcolor: '#e2e8f0' },
                      '&.Mui-focused': { boxShadow: '0 0 0 2px #64748b44', borderColor: '#475569' }
                    }
                  }}
                  InputLabelProps={{ sx: { fontWeight: 600, color: '#334155', letterSpacing: 0.3 } }}
                />
                <TextField
                  required
                  fullWidth
                  label="Doors"
                  name="doors"
                  type="number"
                  value={formData.doors}
                  onChange={handleChange}
                  inputProps={{ min: 2, max: 6 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <svg width="20" height="20" fill="none" style={{marginRight: 4}}>
  <rect width="20" height="20" rx="10" fill="#e2e8f0"/>
  <path d="M6.5 15V7.5c0-.5.3-.9.7-1.1l5.1-1.7c.6-.2 1.2.2 1.2.8V15" stroke="#64748b" strokeWidth="1.4" fill="#fff"/>
  <path d="M7 8.2h7.2" stroke="#64748b" strokeWidth="1.1"/>
  <rect x="8.8" y="9.3" width="2.4" height="1.1" rx="0.5" fill="#e2e8f0" stroke="#64748b" strokeWidth="1"/>
  <rect x="8.2" y="11.8" width="4.2" height="0.5" rx="0.2" fill="#64748b"/>
  <ellipse cx="8.7" cy="10.6" rx="0.7" ry="0.3" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.9"/>
</svg>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: '#f1f5f9',
                      boxShadow: '0 1px 4px rgba(30,41,59,0.03)',
                      '&:hover': { bgcolor: '#e2e8f0' },
                      '&.Mui-focused': { boxShadow: '0 0 0 2px #64748b44', borderColor: '#475569' }
                    }
                  }}
                  InputLabelProps={{ sx: { fontWeight: 600, color: '#334155', letterSpacing: 0.3 } }}
                />
                <TextField
                  required
                  fullWidth
                  label="Mileage (km)"
                  name="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={handleChange}
                  inputProps={{ min: 0 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <svg width="20" height="20" fill="none" style={{marginRight: 4}}><rect width="20" height="20" rx="10" fill="#e2e8f0"/><circle cx="10" cy="10" r="5" stroke="#64748b" strokeWidth="1.6"/><path d="M10 10V7" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round"/><circle cx="10" cy="10" r="1.2" fill="#64748b"/></svg>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: '#f1f5f9',
                      boxShadow: '0 1px 4px rgba(30,41,59,0.03)',
                      '&:hover': { bgcolor: '#e2e8f0' },
                      '&.Mui-focused': { boxShadow: '0 0 0 2px #64748b44', borderColor: '#475569' }
                    }
                  }}
                  InputLabelProps={{ sx: { fontWeight: 600, color: '#334155', letterSpacing: 0.3 } }}
                />
              </Box>
              {/* Availability Dates */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="Available From"
                  name="availabilityStart"
                  type="date"
                  value={formData.availabilityStart}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true, sx: { fontWeight: 600, color: '#334155', letterSpacing: 0.3 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <svg width="20" height="20" fill="none" style={{marginRight: 4}}><rect width="20" height="20" rx="10" fill="#e2e8f0"/><rect x="6" y="8" width="8" height="6" rx="1.2" stroke="#64748b" strokeWidth="1.6"/><rect x="8" y="6" width="1.5" height="2" rx="0.5" fill="#64748b"/><rect x="10.5" y="6" width="1.5" height="2" rx="0.5" fill="#64748b"/></svg>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: '#f1f5f9',
                      boxShadow: '0 1px 4px rgba(30,41,59,0.03)',
                      '&:hover': { bgcolor: '#e2e8f0' },
                      '&.Mui-focused': { boxShadow: '0 0 0 2px #64748b44', borderColor: '#475569' }
                    }
                  }}
                />
                <TextField
                  required
                  fullWidth
                  label="Available Until"
                  name="availabilityEnd"
                  type="date"
                  value={formData.availabilityEnd}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true, sx: { fontWeight: 600, color: '#334155', letterSpacing: 0.3 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <svg width="20" height="20" fill="none" style={{marginRight: 4}}><rect width="20" height="20" rx="10" fill="#e2e8f0"/><rect x="6" y="8" width="8" height="6" rx="1.2" stroke="#64748b" strokeWidth="1.6"/><rect x="8" y="6" width="1.5" height="2" rx="0.5" fill="#64748b"/><rect x="10.5" y="6" width="1.5" height="2" rx="0.5" fill="#64748b"/></svg>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: '#f1f5f9',
                      boxShadow: '0 1px 4px rgba(30,41,59,0.03)',
                      '&:hover': { bgcolor: '#e2e8f0' },
                      '&.Mui-focused': { boxShadow: '0 0 0 2px #64748b44', borderColor: '#475569' }
                    }
                  }}
                />
                {/* Price Field */}
                <TextField
                  required
                  fullWidth
                  label="Price Per Day (€)"
                  name="price"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={formData.price}
                  onChange={handleChange}
                  InputLabelProps={{ sx: { fontWeight: 600, color: '#334155', letterSpacing: 0.3 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <svg width="20" height="20" fill="none" style={{marginRight: 4}}><rect width="20" height="20" rx="10" fill="#e2e8f0"/><text x="6" y="15" fontSize="11" fill="#64748b">€</text></svg>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: '#f1f5f9',
                      boxShadow: '0 1px 4px rgba(30,41,59,0.03)',
                      '&:hover': { bgcolor: '#e2e8f0' },
                      '&.Mui-focused': { boxShadow: '0 0 0 2px #64748b44', borderColor: '#475569' }
                    }
                  }}
                />
              </Box>
              
              {/* Car Features */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    <svg width="20" height="20" fill="none">
                      <rect width="20" height="20" rx="10" fill="#e2e8f0"/>
                      <path d="M6 10h8M6 7h8M6 13h8" stroke="#475569" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </Box>
                  Car Features
                </Typography>
                
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr', md: 'repeat(5, 1fr)' },
                  gap: 1.5,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  boxShadow: 'inset 0 1px 5px rgba(100,116,139,0.05)'
                }}>
                  {carFeatures.map((feature) => (
                    <Box 
                      key={feature.id}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          features: {
                            ...prev.features,
                            [feature.id]: !prev.features[feature.id]
                          }
                        }));
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1.5,
                        borderRadius: 2,
                        cursor: 'pointer',
                        bgcolor: formData.features[feature.id] ? '#e2e8f0' : 'transparent',
                        border: formData.features[feature.id] ? '1px solid #cbd5e1' : '1px solid transparent',
                        boxShadow: formData.features[feature.id] ? '0 2px 4px rgba(15,23,42,0.06)' : 'none',
                        '&:hover': {
                          bgcolor: formData.features[feature.id] ? '#e2e8f0' : '#f1f5f9',
                          borderColor: formData.features[feature.id] ? '#94a3b8' : '#cbd5e1'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Box sx={{ 
                        mr: 1.5, 
                        fontSize: '1.2rem',
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: formData.features[feature.id] ? '#475569' : '#f1f5f9',
                        color: formData.features[feature.id] ? 'white' : '#64748b',
                        borderRadius: '50%',
                        transition: 'all 0.2s ease'
                      }}>
                        {feature.icon}
                      </Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: formData.features[feature.id] ? '#334155' : '#64748b',
                          fontWeight: formData.features[feature.id] ? 600 : 400
                        }}
                      >
                        {feature.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
            <DialogActions sx={{ p: 0, pt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                startIcon={<svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="12" fill="#334155"/><path d="M7 17v-2.5a2 2 0 012-2h6a2 2 0 012 2V17" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/><rect x="5.5" y="12" width="13" height="3" rx="1.5" fill="#64748b"/><circle cx="8.5" cy="17.5" r="1.5" fill="#fff"/><circle cx="15.5" cy="17.5" r="1.5" fill="#fff"/></svg>}
                sx={{
                  background: 'linear-gradient(90deg, #334155 0%, #475569 100%)',
                  color: 'white',
                  py: 1.5,
                  fontSize: '1.13rem',
                  fontWeight: 700,
                  borderRadius: 3,
                  boxShadow: '0 2px 12px 0 rgba(71,85,105,0.13)',
                  textTransform: 'none',
                  letterSpacing: 0.7,
                  transition: 'all 0.22s cubic-bezier(.4,2,.6,1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(90deg, #475569 0%, #334155 100%)',
                    color: '#f1f5f9',
                    boxShadow: '0 6px 24px 0 rgba(30,41,59,0.18), 0 0 0 4px #cbd5e15a',
                    transform: 'scale(1.035) translateY(-2px)'
                  }
                }}
              >
                Post Car
              </Button>
            </DialogActions>
          </DialogContent>
        </form>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Map Dialog */}
      <Dialog 
        open={mapDialogOpen} 
        onClose={handleCloseMapDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 12px 50px -12px rgba(30,41,59,0.25)',
            height: '80vh',
            maxHeight: '700px'
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 0, 
          bgcolor: '#475569', 
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'white',
          height: 64
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
            <LocationOnIcon sx={{ mr: 1.5, fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: 0.3 }}>
              Select Pickup Location
            </Typography>
          </Box>
          <IconButton onClick={handleCloseMapDialog} sx={{ color: 'white', mr: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Map */}
          <Box sx={{ flex: 1, position: 'relative' }}>
            <MapContainer
              center={formData.location || [36.7529, 3.0420]} // Default to Algiers if no position
              zoom={formData.location ? 15 : 6}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
              zoomControl={true} // Use default zoom controls
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationMarker 
                position={formData.location} 
                setPosition={(pos) => setFormData(prev => ({ ...prev, location: pos }))} 
              />
            </MapContainer>
            
            {/* Search control rendered outside MapContainer */}
            <SearchControl 
              onLocationFound={(location) => setFormData(prev => ({ ...prev, location }))}
              mapRef={mapRef}
            />
            
            {/* Instructions panel removed as requested */}
            
            {/* Current location button - improved design */}
            <Box sx={{ 
              position: 'absolute', 
              bottom: 16, 
              right: 16, 
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Button
                variant="contained"
                onClick={handleUseCurrentLocation}
                startIcon={<MyLocationIcon />}
                sx={{
                  borderRadius: 3,
                  bgcolor: '#475569',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.2,
                  px: 2.5,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  '&:hover': { 
                    bgcolor: '#334155',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s ease',
                  mb: 1
                }}
              >
                Use My Location
              </Button>
              <Paper sx={{ 
                p: 1, 
                borderRadius: 2, 
                bgcolor: 'rgba(255,255,255,0.9)', 
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                display: formData.location ? 'block' : 'none'
              }}>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ fontSize: 14, mr: 0.5, color: '#64748b' }} />
                  {formData.location ? 'Location selected' : ''}
                </Typography>
              </Paper>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 2.5, 
          borderTop: '1px solid #e2e8f0',
          bgcolor: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <Box>
            {formData.location && (
              <Typography variant="body2" sx={{ 
                color: '#475569', 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 500
              }}>
                <LocationOnIcon sx={{ fontSize: 18, mr: 0.8, color: '#64748b' }} />
                Location selected
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button 
              onClick={handleCloseMapDialog}
              sx={{ 
                color: '#64748b', 
                textTransform: 'none',
                fontWeight: 600,
                px: 2.5,
                '&:hover': { bgcolor: '#f1f5f9' }
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleCloseMapDialog}
              disabled={!formData.location}
              sx={{
                bgcolor: '#475569',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                '&:hover': { 
                  bgcolor: '#334155',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.12)'
                },
                '&.Mui-disabled': { bgcolor: '#94a3b8', color: '#f1f5f9' }
              }}
            >
              Confirm Location
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
}

// Instead of export default PostCarDialog;
export { PostCarDialog };
