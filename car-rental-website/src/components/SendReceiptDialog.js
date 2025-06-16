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
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef();

  const resetState = () => {
    setSelectedFile(null);
    setPreview(null);
    setLoading(false);
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
      setSuccess(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', selectedFile);
      cloudinaryFormData.append('upload_preset', 'unsigned_preset'); // Using the same preset as car images

      const cloudinaryRes = await axios.post(
        'https://api.cloudinary.com/v1_1/dtob4ibrg/image/upload',
        cloudinaryFormData
      );

      const receiptImageUrl = cloudinaryRes.data.secure_url;

      const token = localStorage.getItem('token');
      await axios.post(
        `${apiUrl}/api/receipts/upload`,
        {
          bookingId: bookingId,
          receiptImage: receiptImageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess('Receipt uploaded successfully!');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error('Error uploading receipt:', err);
      setError('Failed to upload receipt. Please try again.');
    } finally {
      setLoading(false);
    }
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
            <Typography color="error" mt={2}>{error}</Typography>
          )}
          {success && (
            <Typography color="success" mt={2}>{success}</Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleUpload} color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Send'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendReceiptDialog;
