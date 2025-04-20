import React, { useState } from 'react';
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
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MapIcon from '@mui/icons-material/Map';
import InfoIcon from '@mui/icons-material/Info';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const MapSelector = ({ selectedLocation }) => {
  const [open, setOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const toggleInfo = () => {
    setInfoOpen(!infoOpen);
  };

  // Extract city name from location string if available
  const getCityName = () => {
    if (!selectedLocation) return 'Algeria';
    
    const parts = selectedLocation.split(',');
    if (parts.length > 1) {
      return parts[1].trim();
    }
    return parts[0].trim();
  };

  // This would be replaced with actual map integration
  const mapImageUrl = "https://maps.googleapis.com/maps/api/staticmap?center=" + 
    encodeURIComponent(getCityName()) + 
    ",Algeria&zoom=13&size=800x500&maptype=roadmap&markers=color:blue%7C" + 
    encodeURIComponent(selectedLocation || 'Algeria') + 
    "&key=YOUR_API_KEY";

  // Placeholder image for demo purposes
  const placeholderMapUrl = "https://images.unsplash.com/photo-1569336415962-a4bd9f69c907?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";

  return (
    <>
      <Button 
        variant="outlined" 
        startIcon={<MapIcon />}
        onClick={handleOpen}
        sx={{
          borderColor: '#475569',
          color: '#475569',
          '&:hover': {
            borderColor: '#334155',
            backgroundColor: 'rgba(71, 85, 105, 0.04)'
          }
        }}
      >
        View on Map
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          m: 0, 
          p: 2, 
          bgcolor: '#475569', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MapIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              {selectedLocation ? `Map View: ${selectedLocation}` : 'Select Location on Map'}
            </Typography>
          </Box>
          
          <Box>
            <Tooltip title="How to use the map">
              <IconButton 
                size="small" 
                onClick={toggleInfo}
                sx={{ color: 'white', mr: 1 }}
              >
                <InfoIcon />
              </IconButton>
            </Tooltip>
            <IconButton
              onClick={handleClose}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {/* Map container */}
          <Box 
            sx={{ 
              height: 500, 
              width: '100%', 
              position: 'relative',
              backgroundImage: `url(${placeholderMapUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              cursor: 'pointer'
            }}
          >
            {/* Marker for selected location */}
            {selectedLocation && (
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -100%)',
                  color: '#475569',
                  animation: 'pulse 1.5s infinite'
                }}
              >
                <LocationOnIcon sx={{ fontSize: 40 }} />
              </Box>
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
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" sx={{ mb: 1, color: '#475569' }}>
                  How to Use the Map
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  • Click anywhere on the map to select a pickup location
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  • Use the zoom controls to get a better view of specific areas
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  • Search for specific addresses using the search box
                </Typography>
                <Typography variant="body2">
                  • Drag the marker to fine-tune your pickup location
                </Typography>
              </Paper>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleClose}
            sx={{ color: '#475569' }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleClose}
            sx={{ 
              bgcolor: '#475569',
              '&:hover': {
                bgcolor: '#334155'
              }
            }}
          >
            Confirm Location
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MapSelector;
