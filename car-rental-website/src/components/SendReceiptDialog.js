import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Typography,
  IconButton,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';

const SendReceiptDialog = ({ open, onClose, bookingId }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSend = async () => {
    if (!selectedFile) {
      setError('Please select an image to upload.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('receiptImage', selectedFile);
    formData.append('bookingId', bookingId);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${apiUrl}/api/receipts/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      onClose(true); // Pass true to indicate success
    } catch (err) {
      setError('Failed to upload receipt. Please try again.');
      console.error('Error uploading receipt:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Send Receipt</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <Button
            variant="outlined"
            startIcon={<PhotoCameraIcon />}
            onClick={() => fileInputRef.current.click()}
          >
            Select Receipt Image
          </Button>
          {preview && (
            <Box mt={2} position="relative">
              <img src={preview} alt="Receipt Preview" style={{ maxWidth: '100%', maxHeight: '300px' }} />
              <IconButton
                size="small"
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                }}
                style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'white' }}
              >
                <CancelIcon />
              </IconButton>
            </Box>
          )}
          {error && (
            <Typography color="error" mt={2}>{
              error
            }</Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSend} color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Send'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendReceiptDialog;
