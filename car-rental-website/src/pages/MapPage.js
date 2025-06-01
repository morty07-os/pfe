import React, { useState, useEffect, useRef } from 'react';
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
import { wilayasConfig, pickupLocationsConfig } from '../data/wilayasConfig';

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  const [selectedWilaya, setSelectedWilaya] = useState(null);
  const [mapCenter, setMapCenter] = useState([36.7538, 3.0588]); // Default center (Algiers)
  const [mapZoom, setMapZoom] = useState(6); // Start with a wider view of Algeria
  const mapRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWilayas, setFilteredWilayas] = useState([]);
  
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
  
  // Update map center when wilaya changes
  useEffect(() => {
    if (selectedWilaya) {
      setMapCenter(selectedWilaya.coordinates);
      setMapZoom(12); // Zoom in when a wilaya is selected
    } else {
      // Default view of Algeria when no wilaya is selected
      setMapCenter([28.0339, 1.6596]); // Center of Algeria
      setMapZoom(6);
    }
  }, [selectedWilaya]);
  
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          setMapZoom(15);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  return (
    <>
      <Navbar />
      <QuickSearch />
      <Box sx={{
        width: '100%',
        background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        pt: 4,
        pb: 8
      }}>
        <Container maxWidth={false} disableGutters sx={{ 
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Page Title */}
          <Box sx={{ width: '95%', mx: 'auto', mb: 4, maxWidth: '1200px', textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#334155', mb: 1 }}>
              Find Pickup Locations
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#64748b', mb: 3, maxWidth: '700px', mx: 'auto' }}>
              Select a wilaya to view available car rental pickup locations and find the perfect starting point for your journey
            </Typography>
          </Box>
          
          {/* Wilaya Selector */}
          <Box sx={{ width: '95%', mx: 'auto', mb: 4, maxWidth: '1200px' }}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                borderRadius: 3,
                backgroundColor: 'white',
                boxShadow: '0 10px 25px rgba(71, 85, 105, 0.08)',
                border: '1px solid #e2e8f0'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box 
                  sx={{ 
                    bgcolor: '#e2e8f0', 
                    borderRadius: '50%', 
                    p: 1, 
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FilterAltIcon sx={{ color: '#475569', fontSize: 24 }} />
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
                      '&.Mui-disabled': {
                        opacity: 0.5
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
                            bgcolor: '#475569', 
                            color: 'white',
                            fontSize: '0.7rem',
                            height: 20
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
                            height: 20
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
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOnIcon sx={{ color: '#475569', mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#334155' }}>
                      Available Pickup Locations in {selectedWilaya.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1.5 }}>
                    {pickupLocations[selectedWilaya.name]?.map((location) => (
                      <Chip 
                        key={location.id}
                        label={location.name}
                        icon={<LocationOnIcon />}
                        clickable
                        sx={{ 
                          bgcolor: '#f1f5f9', 
                          color: '#475569',
                          borderRadius: '8px',
                          py: 0.5,
                          border: '1px solid #e2e8f0',
                          '&:hover': {
                            bgcolor: '#e2e8f0',
                            boxShadow: '0 2px 5px rgba(71, 85, 105, 0.1)'
                          },
                          '& .MuiChip-icon': {
                            color: '#475569'
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
                borderRadius: 3,
                boxShadow: '0 10px 25px rgba(71, 85, 105, 0.08)',
                border: '1px solid #e2e8f0'
              }}
            >
              
              {/* Leaflet Map */}
              <Box 
                sx={{ 
                  flexGrow: 1, 
                  position: 'relative',
                  width: '100%',
                  '& .leaflet-container': {
                    height: '600px',
                    width: '100%',
                    zIndex: 1,
                    borderRadius: '0 0 12px 12px',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)'
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
                  zoomControl={false}
                  whenCreated={(map) => {
                    mapRef.current = map;
                  }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* Display markers for the selected wilaya */}
                  {selectedWilaya && pickupLocations[selectedWilaya.name] && 
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
                                color: '#475569',
                                borderColor: '#475569',
                                fontWeight: 600,
                                borderRadius: '8px',
                                '&:hover': {
                                  borderColor: '#334155',
                                  backgroundColor: 'rgba(71, 85, 105, 0.1)'
                                },
                                '& .MuiButton-startIcon': {
                                  color: '#475569'
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
                      backgroundColor: 'rgba(241, 245, 249, 0.85)',
                      backdropFilter: 'blur(4px)',
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
    </>
  );
};

export default MapPage;
