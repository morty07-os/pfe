import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Avatar, CircularProgress, IconButton,
  Tooltip, Button, Chip
} from '@mui/material';
import {
  Edit as EditIcon, Logout as LogoutIcon,
  LocationOn as LocationOnIcon, Phone as PhoneIcon,
  Email as EmailIcon, Person as PersonIcon, CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[4],
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.01)',
  },
}));

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("No token found. Please log in.");

      const response = await fetch('http://localhost:5001/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setProfile(data);
      else console.error(data.error || 'Failed to fetch profile');
    } catch (error) {
      console.error('Error fetching profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5001/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      console.error("Logout error:", err.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="error">
          Failed to load profile information. Please try again later.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4, px: 2, gap: 2 }}>
      <StyledPaper sx={{ width: '100%', maxWidth: 500 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 72, height: 72, bgcolor: '#3f51b5', fontSize: '2rem' }}>
              {profile.firstName[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>{profile.firstName} {profile.lastName}</Typography>
              <Chip label="User" size="small" color="primary" />
            </Box>
          </Box>
          <Box>
            <Tooltip title="Edit Profile">
              <IconButton>
                <EditIcon color="action" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Logout">
              <IconButton onClick={handleLogout}>
                <LogoutIcon color="error" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon color="primary" /><strong>Email:</strong> {profile.email}
          </Typography>
          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneIcon color="primary" /><strong>Phone:</strong> {profile.phone}
          </Typography>
          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnIcon color="primary" /><strong>Residence:</strong> {profile.residence}
          </Typography>
          {profile.birthDate && (
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon color="primary" /><strong>Birth Date:</strong> {new Date(profile.birthDate).toLocaleDateString()}
            </Typography>
          )}
          {profile.additionalInfo && Object.entries(profile.additionalInfo).map(([key, value]) => (
            <Typography key={key} variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" /><strong>{key}:</strong> {value}
            </Typography>
          ))}
        </Box>
      </StyledPaper>

      <Typography variant="caption" color="text.secondary">
        Last updated: {new Date().toLocaleString()}
      </Typography>
    </Box>
  );
};

export default ProfilePage;
