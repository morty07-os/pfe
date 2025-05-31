import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, TextField, Button, CircularProgress, Alert } from '@mui/material';
import Navbar from '../components/Navbar';
import ForgetPasswordDialog from '../components/ForgetPasswordDialog'; // Import the dialog
import { useNavigate } from 'react-router-dom';

const EditProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    phone: '',
    license: '', // Assuming a license field exists or will be added to the user model
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isForgetPasswordDialogOpen, setIsForgetPasswordDialogOpen] = useState(false); // State for dialog visibility
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      if (!response.ok) {
        const errorData = await response.json();
        navigate('/');
        throw new Error(errorData.error || 'Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data);
      setFormData({
        phone: data.phone || '',
        license: data.license || '', // Initialize license from fetched data
      });
    } catch (error) {
      console.error('Error fetching profile:', error.message);
      setMessage({ type: 'error', text: 'Failed to load profile data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';
      // Assuming a backend endpoint for updating user profile exists or will be created
      const response = await fetch(`${apiUrl}/api/users/profile`, { // Example endpoint
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: result.message || 'Profile updated successfully!' });
        // Optionally refetch profile or update state directly
        // fetchProfile();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile.' });
      }
    } catch (error) {
      console.error('Error saving profile:', error.message);
      setMessage({ type: 'error', text: 'An error occurred while saving profile.' });
    } finally {
      setIsSaving(false);
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
          <Paper sx={{ p: 4 }}>
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
                Back to Profile
              </Button>
          </Paper>
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
        py: 4,
        backgroundImage: 'linear-gradient(rgba(226, 232, 240, 0.9) 0%, rgba(226, 232, 240, 0.9) 100%), url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23cbd5e1\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        backgroundSize: '60px 60px'
      }}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 10px 30px rgba(51, 65, 85, 0.08)' }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: '#334155', mb: 3, textAlign: 'center' }}>
              Edit Profile
            </Typography>
            <Box component="form" onSubmit={handleSaveProfile} sx={{ mt: 2 }}>
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
              <TextField
                margin="normal"
                fullWidth
                id="license"
                label="Driver's License Number" // Assuming this is the field name
                name="license"
                value={formData.license}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />

              <Button
                variant="outlined"
                fullWidth
                sx={{
                  mt: 1,
                  mb: 3,
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
                onClick={() => setIsForgetPasswordDialogOpen(true)}
              >
                Change Password
              </Button>

              {message.text && (
                <Alert severity={message.type} sx={{ width: '100%', mt: 2, mb: 2 }}>
                  {message.text}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 2,
                  mb: 2,
                  bgcolor: '#475569',
                  color: 'white',
                  py: 1.5,
                  fontSize: '1rem',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#334155' },
                }}
                disabled={isSaving}
              >
                {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
              </Button>
               <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/profile')}
                sx={{
                  color: '#64748b',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { color: '#475569' },
                }}
              >
                Cancel
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>

      <ForgetPasswordDialog
        open={isForgetPasswordDialogOpen}
        onClose={() => setIsForgetPasswordDialogOpen(false)}
      />
    </>
  );
};

export default EditProfilePage;
