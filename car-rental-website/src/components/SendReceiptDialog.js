import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';

const SendReceiptDialog = ({ open, onClose, carId, userId, ownerId, carName, conversationId }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      setError('Please select a receipt image');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('receipt', selectedImage);
      formData.append('carId', carId);
      formData.append('userId', userId);
      formData.append('ownerId', ownerId);
      formData.append('carName', carName);
      formData.append('conversationId', conversationId);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiUrl}/api/admin/send-receipt`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        onClose(true); // Pass true to indicate successful submission
      }
    } catch (error) {
      console.error('Error sending receipt:', error);
      setError(error.response?.data?.message || 'Failed to send receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => onClose(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1,
        borderBottom: '1px solid #e2e8f0'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
          Send Receipt to Admin
        </Typography>
        <IconButton 
          onClick={() => onClose(false)}
          size="small"
          sx={{ 
            color: '#64748b',
            '&:hover': { 
              bgcolor: 'rgba(0,0,0,0.04)',
              color: '#475569'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: 2
        }}>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageSelect}
            ref={fileInputRef}
            id="receipt-upload"
          />
          
          <Button
            variant="outlined"
            component="label"
            startIcon={<PhotoCameraIcon />}
            onClick={() => fileInputRef.current.click()}
            sx={{
              width: '100%',
              py: 1.5,
              borderColor: '#cbd5e1',
              color: '#475569',
              '&:hover': {
                borderColor: '#475569',
                bgcolor: 'rgba(71, 85, 105, 0.04)'
              }
            }}
          >
            {selectedImage ? 'Change Receipt Image' : 'Upload Receipt Image'}
          </Button>

          {imagePreview && (
            <Box sx={{ 
              position: 'relative',
              width: '100%',
              maxWidth: 300,
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid #e2e8f0'
            }}>
              <img 
                src={imagePreview} 
                alt="Receipt preview" 
                style={{ 
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }} 
              />
              <IconButton 
                size="small"
                onClick={handleRemoveImage}
                sx={{ 
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.7)'
                  }
                }}
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            Please upload a clear image of your rental receipt
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e2e8f0' }}>
        <Button 
          onClick={() => onClose(false)}
          sx={{ 
            color: '#64748b',
            '&:hover': { 
              bgcolor: 'rgba(0,0,0,0.04)',
              color: '#475569'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!selectedImage || loading}
          sx={{
            bgcolor: '#475569',
            color: 'white',
            '&:hover': {
              bgcolor: '#334155'
            },
            '&.Mui-disabled': {
              bgcolor: '#cbd5e1',
              color: '#94a3b8'
            }
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Send Receipt'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendReceiptDialog; 