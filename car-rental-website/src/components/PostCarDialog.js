import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog, DialogContent, DialogActions, Button, TextField, Box, Typography, InputAdornment, MenuItem, IconButton, Snackbar, Alert
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';
import WilayaDropdown from './WilayaDropdown';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Import Leaflet and fix icon issue
import L from 'leaflet';
import { createRoot } from 'react-dom/client';
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

function PostCarDialog({ open, onClose }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Move state declarations outside of conditional blocks
  const [formData, setFormData] = useState({
    images: [],
    carName: '',
    brand: '',
    description: '', 
    energy: '',
    seats: '',
    doors: '',
    transmission: '',
    mileage: '',
    engine: '',
    wilaya: '',
    availabilityStart: '',
    availabilityEnd: '',
    price: '',
    location: null, // For storing map coordinates
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Add authentication check when dialog opens
  useEffect(() => {
    if (!token && open) {
      console.log("No token found, redirecting to sign in");
      onClose(); // Close the dialog
      navigate('/sign-in'); // Redirect to sign-in page
    }
  }, [open, onClose, navigate, token]);

  // Add immediate check on render
  if (!token && open) {
    // If component renders with open=true but no token, close immediately
    setTimeout(() => onClose(), 0);
    navigate('/SignIn'); // Redirect to sign-in page
    return null; // Don't render anything
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const newImages = Array.from(files);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
      setImagePreviews(prev => [...prev, ...newImages.map(file => URL.createObjectURL(file))]);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData(prev => ({ ...prev, images: newImages }));
    
    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]); // Clean up memory
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const handleWilayaChange = (wilaya) => {
    setFormData(prev => ({ ...prev, wilaya }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
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
        setSnackbar({ open: true, message: 'Your session is invalid. Please sign in again.', severity: 'error' });
        onClose();
        return;
      }

      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'images') {
          formData[key].forEach((image) => formDataToSend.append('images', image));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch('http://localhost:5001/api/cars/addcars', {
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
                <WilayaDropdown
                  value={formData.wilaya}
                  onChange={handleWilayaChange}
                  sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: '#f1f5f9', boxShadow: '0 1px 4px rgba(30,41,59,0.03)', '&:hover': { bgcolor: '#e2e8f0' }, '&.Mui-focused': { boxShadow: '0 0 0 2px #64748b44', borderColor: '#475569' } }, '& .MuiInputLabel-root': { fontWeight: 600, color: '#334155', letterSpacing: 0.3 } }}
                />
              </Box>
              
              {/* Map Location Selection */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#334155', letterSpacing: 0.3 }}>
                  Select Car Location
                </Typography>
                <Box sx={{ height: 250, width: '100%', borderRadius: 2.5, overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                  <MapContainer
                    center={[36.7529, 3.0420]} // Default to Algiers coordinates
                    zoom={6}
                    style={{ height: '100%', width: '100%' }}
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
                </Box>
                {formData.location && (
                  <Typography variant="caption" sx={{ color: '#64748b', fontStyle: 'italic' }}>
                    Selected location: {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
                  </Typography>
                )}
              </Box>
              
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
                        <svg width="20" height="20" fill="none" style={{marginRight: 4}}><rect width="20" height="20" rx="10" fill="#e2e8f0"/><rect x="7" y="7" width="6" height="8" rx="1.2" stroke="#64748b" strokeWidth="1.5"/><rect x="10" y="6" width="2" height="2" rx="0.5" stroke="#64748b" strokeWidth="1.2"/><path d="M8.5 8.5l5 5" stroke="#64748b" strokeWidth="1.1" strokeLinecap="round"/><rect x="9" y="11" width="2" height="2.5" rx="0.7" stroke="#64748b" strokeWidth="1.1"/></svg>
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
    </>
  );
}

// Instead of export default PostCarDialog;
export { PostCarDialog };
