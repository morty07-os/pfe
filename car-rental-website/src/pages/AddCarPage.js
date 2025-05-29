import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Container, Paper, 
  Grid, CircularProgress, Select, MenuItem, FormControl, InputLabel, IconButton
} from '@mui/material';
import { AddPhotoAlternate as AddPhotoAlternateIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Assuming you have a Navbar

const carCategories = [
  'Citadine',
  'Sedan',
  'SUV',
  'Van',
  'StationWagon',
  'Convertible',
  'Coupe',
  'Minivan',
  'Pickup',
  'Other'
];

async function uploadToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/dtob4ibrg/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'unsigned_preset'); // You must create this preset in your Cloudinary dashboard
  const response = await fetch(url, { method: 'POST', body: formData });
  const data = await response.json();
  return data.secure_url;
}

const AddCarPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    pricePerDay: '',
    description: '',
    category: '', // Added category
    seats: '',
    doors: '',
    fuelType: '', // e.g., Petrol, Diesel, Electric
    transmission: '', // e.g., Automatic, Manual
    // Add other relevant fields like mileage, color, etc.
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      setError('You can upload a maximum of 5 images.');
      return;
    }
    setError('');
    setImages(prevImages => [...prevImages, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
    setImagePreviews(prevPreviews => {
      const newPreviews = prevPreviews.filter((_, i) => i !== index);
      newPreviews.forEach(preview => URL.revokeObjectURL(preview)); // Clean up old previews
      return newPreviews;
    });
  };

  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(file => URL.revokeObjectURL(file));
    };
  }, [imagePreviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    // Upload images to Cloudinary and collect URLs
    let imageUrls = [];
    if (images && images.length > 0) {
      for (const image of images) {
        const url = await uploadToCloudinary(image);
        imageUrls.push(url);
      }
    }
    // Remove the old images from FormData (if any)
    data.delete('images');
    imageUrls.forEach(url => data.append('images', url));

    // Add Wilaya and Commune from a location selector if you have one
    // data.append('wilaya', selectedWilaya);
    // data.append('commune', selectedCommune);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cars/addcar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data' is set automatically by browser for FormData
        },
        body: data,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to add car');
      }

      // const result = await response.json(); // Get the newly added car data if needed
      navigate('/profile'); // Or navigate to the new car's details page

    } catch (err) {
      setError(err.message);
      console.error('Error adding car:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar sx={{ backgroundColor: '#111', color: '#fff' }} iconColor="#fff" />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#334155', textAlign: 'center', mb: 3 }}>
            Post Your Car
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Brand (e.g., Toyota)" name="brand" value={formData.brand} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Model (e.g., Yaris)" name="model" value={formData.model} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Year (e.g., 2023)" name="year" type="number" value={formData.year} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    value={formData.category}
                    label="Category"
                    onChange={handleChange}
                  >
                    {carCategories.map((cat) => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Price per Day (DZD)" name="pricePerDay" type="number" value={formData.pricePerDay} onChange={handleChange} required />
              </Grid>
               <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Seats" name="seats" type="number" value={formData.seats} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Doors" name="doors" type="number" value={formData.doors} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Fuel Type (e.g., Petrol)" name="fuelType" value={formData.fuelType} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="transmission-label">Transmission</InputLabel>
                  <Select
                    labelId="transmission-label"
                    name="transmission"
                    value={formData.transmission}
                    label="Transmission"
                    onChange={handleChange}
                  >
                    <MenuItem value="Automatic">Automatic</MenuItem>
                    <MenuItem value="Manual">Manual</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: '#475569' }}>Upload Images (up to 5)</Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AddPhotoAlternateIcon />}
                  sx={{ mb: 1, color: '#475569', borderColor: '#cbd5e1', '&:hover': { borderColor: '#475569', backgroundColor: 'rgba(71, 85, 105, 0.04)' } }}
                >
                  Select Images
                  <input type="file" hidden multiple accept="image/*" onChange={handleImageChange} />
                </Button>
                {imagePreviews.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                    {imagePreviews.map((preview, index) => (
                      <Box key={index} sx={{ position: 'relative', border: '1px solid #e2e8f0', borderRadius: 1, overflow: 'hidden' }}>
                        <img src={preview} alt={`preview ${index}`} style={{ width: 100, height: 100, objectFit: 'cover' }} />
                        <IconButton 
                          size="small"
                          onClick={() => handleRemoveImage(index)} 
                          sx={{
                            position: 'absolute', 
                            top: 2, right: 2, 
                            backgroundColor: 'rgba(0,0,0,0.5)', 
                            color: 'white', 
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)'}
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Grid>

              {error && (
                <Grid item xs={12}>
                  <Typography color="error" sx={{ textAlign: 'center' }}>{error}</Typography>
                </Grid>
              )}

              <Grid item xs={12} sx={{ textAlign: 'center', mt: 2 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={loading} 
                  sx={{ 
                    bgcolor: '#475569', 
                    '&:hover': { bgcolor: '#334155' }, 
                    px: 5, py: 1.5, borderRadius: 2, fontWeight: 'bold'
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Post Car'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </>
  );
};

export default AddCarPage;
