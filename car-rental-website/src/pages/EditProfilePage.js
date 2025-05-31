import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, TextField, Button, Paper, CircularProgress, Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { fetchOptions } from '../utils/apiConfig'; // Assuming apiConfig is available

const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 10px 30px rgba(51, 65, 85, 0.08)',
  padding: theme.spacing(4),
  backgroundColor: '#ffffff',
}));

const EditProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    phone: '',
    licenceFront: null, // State for licence front file
    licenceBack: null,  // State for licence back file
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data);
      setFormData({
        phone: data.phone || '',
        licenceFront: null, // Files are not fetched, only paths are stored
        licenceBack: null,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error.message);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      setIsSubmitting(false);
      return;
    }

    const updateFormData = new FormData();
    updateFormData.append('phone', formData.phone);
    if (formData.licenceFront) {
        updateFormData.append('licenceFront', formData.licenceFront);
    }
    if (formData.licenceBack) {
        updateFormData.append('licenceBack', formData.licenceBack);
    }
    if (formData.newPassword) {
        updateFormData.append('currentPassword', formData.currentPassword);
        updateFormData.append('newPassword', formData.newPassword);
    }


    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch(`${apiUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data' is NOT needed for FormData
        },
        body: updateFormData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: result.message || 'Profile updated successfully!' });
        // Optionally refetch profile data or navigate back
        // fetchProfile();
        // navigate('/profile');
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile.' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'An error occurred while updating the profile.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar sx={{ backgroundColor: '#111', color: '#fff' }} iconColor="#fff" />
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '70vh',
          bgcolor: '#f1f5f9'
        }}>
          <CircularProgress sx={{ color: '#334155' }} />
        </Box>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar sx={{ backgroundColor: '#111', color: '#fff' }} iconColor="#fff" />
        <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
          <StyledPaper>
            <Typography variant="h5" color="error" sx={{ mb: 2 }}>
              Error Loading Profile
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: '#64748b' }}>
              Could not load profile information. Please try again later.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/profile')}
              sx={{
                bgcolor: '#334155',
                '&:hover': { bgcolor: '#1e293b' },
                borderRadius: 2,
                px: 3,
                py: 1
              }}
            >
              Go Back to Profile
            </Button>
          </StyledPaper>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar sx={{ backgroundColor: '#111', color: '#fff' }} iconColor="#fff" />
      <Box sx={{
        bgcolor: '#f1f5f9',
        minHeight: 'calc(100vh - 64px)', // Adjust for Navbar height
        py: 6,
        backgroundImage: 'linear-gradient(rgba(226, 232, 240, 0.9) 0%, rgba(226, 232, 240, 0.9) 100%), url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23cbd5e1\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        backgroundSize: '60px 60px'
      }}>
        <Container maxWidth="sm">
          <StyledPaper component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#334155', mb: 3, textAlign: 'center' }}>
              Edit Profile
            </Typography>

            <TextField
              margin="normal"
              fullWidth
              id="phone"
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />

            <Typography variant="h6" sx={{ fontWeight: 600, color: '#475569', mb: 2, borderBottom: '1px solid #e2e8f0', pb: 1 }}>
              Update Driving License
            </Typography>

            <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Front of License:
                </Typography>
                <input
                    type="file"
                    accept="image/*"
                    name="licenceFront"
                    onChange={handleChange}
                />
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Back of License:
                </Typography>
                <input
                    type="file"
                    accept="image/*"
                    name="licenceBack"
                    onChange={handleChange}
                />
            </Box>


            <Typography variant="h6" sx={{ fontWeight: 600, color: '#475569', mb: 2, borderBottom: '1px solid #e2e8f0', pb: 1 }}>
              Change Password
            </Typography>

            <TextField
              margin="normal"
              fullWidth
              id="currentPassword"
              label="Current Password"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              fullWidth
              id="newPassword"
              label="New Password"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              fullWidth
              id="confirmNewPassword"
              label="Confirm New Password"
              name="confirmNewPassword"
              type="password"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />

            {message.text && (
              <Alert severity={message.type} sx={{ width: '100%', mt: 2, mb: 3 }}>
                {message.text}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                bgcolor: '#475569',
                color: 'white',
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': { bgcolor: '#334155' },
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              sx={{
                mt: 1,
                color: '#475569',
                borderColor: '#475569',
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: 'rgba(71, 85, 105, 0.04)',
                  borderColor: '#334155',
                },
              }}
              onClick={() => navigate('/profile')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </StyledPaper>
        </Container>
      </Box>
    </>
  );
};

export default EditProfilePage;
