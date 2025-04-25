import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Avatar, CircularProgress } from '@mui/material';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error("No token found. Please log in.");
        }

        const response = await fetch('http://localhost:5001/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setProfile(data);
        } else {
          console.error(data.error || 'Failed to fetch profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">
          Failed to load profile information.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', my: 4, p: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: '#607d8b' }}>
            {profile.firstName[0]}
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
            {profile.firstName} {profile.lastName}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Email:</strong> {profile.email}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Phone:</strong> {profile.phone}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Residence:</strong> {profile.residence}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ProfilePage;
