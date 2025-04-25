import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, Grid, Paper, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          navigate('/signin'); // Redirect to sign-in page if not authenticated
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        navigate('/signin'); // Redirect to sign-in page on error
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', my: 4, p: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, color: '#607d8b' }}>
        Profile
      </Typography>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar src={user.profileImg} sx={{ width: 80, height: 80, mr: 3 }}>
            {user.firstName[0]}
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#455a64' }}>
            {user.firstName} {user.lastName}
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ fontWeight: 700, color: '#607d8b' }}>
              Email:
            </Typography>
            <Typography variant="body2" sx={{ color: '#455a64' }}>
              {user.email}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ fontWeight: 700, color: '#607d8b' }}>
              Phone:
            </Typography>
            <Typography variant="body2" sx={{ color: '#455a64' }}>
              {user.phone}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ fontWeight: 700, color: '#607d8b' }}>
              Residence:
            </Typography>
            <Typography variant="body2" sx={{ color: '#455a64' }}>
              {user.residence}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ fontWeight: 700, color: '#607d8b' }}>
              Birth Date:
            </Typography>
            <Typography variant="body2" sx={{ color: '#455a64' }}>
              {new Date(user.birthDate).toLocaleDateString()}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
