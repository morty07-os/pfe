import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, TextField, Button, CircularProgress, Alert, Divider
} from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { fetchOptions } from '../utils/apiConfig';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import BadgeIcon from '@mui/icons-material/Badge';
import { keyframes } from '@mui/system';

const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const GlassPaper = styled('div')(({ theme }) => ({
  borderRadius: '24px',
  backdropFilter: 'blur(16px)',
  backgroundColor: alpha('#ffffff', 0.96),
  border: '2px solid #94a3b8',
  boxShadow: '0 12px 24px rgba(15, 23, 42, 0.1)',
  padding: theme.spacing(4),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    borderColor: '#64748b',
    boxShadow: '0 16px 32px rgba(15, 23, 42, 0.15)'
  },
  animation: `${fadeIn} 0.6s ease-out forwards`,
}));

const GradientButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '14px 28px',
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  letterSpacing: '0.5px',
  background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
  color: 'white',
  boxShadow: '0 4px 6px rgba(15, 23, 42, 0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 12px rgba(15, 23, 42, 0.15)',
    animation: `${pulse} 1.5s infinite`,
  }
}));

const FileUploadCard = styled('div')(({ theme, active }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  borderRadius: '16px',
  border: `2px solid ${active ? '#334155' : '#cbd5e1'}`,
  backgroundColor: active ? 'rgba(51, 65, 85, 0.03)' : 'transparent',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  minHeight: '120px',
  '&:hover': {
    borderColor: '#475569',
    backgroundColor: 'rgba(71, 85, 105, 0.05)',
    transform: 'translateY(-2px)'
  },
  '& svg': {
    fontSize: '42px',
    color: active ? '#334155' : '#94a3b8',
    marginBottom: theme.spacing(1.5),
    transition: 'all 0.3s ease',
    '&:hover': {
      animation: `${pulse} 1s ease-in-out`
    }
  }
}));

const SectionHeader = ({ icon, title }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    mb: 3,
    '& svg': {
      color: '#475569',
      mr: 2
    }
  }}>
    {icon}
    <Typography variant="h5" sx={{ 
      fontWeight: 700, 
      color: '#1e293b',
      width: '100%'
    }}>
      {title}
    </Typography>
  </Box>
);

const ProfileBanner = styled('div')(({ theme }) => ({
  background: 
    'linear-gradient(135deg, rgba(71, 85, 105, 0.9) 0%, rgba(51, 65, 85, 0.95) 100%)',
  color: 'white',
  padding: theme.spacing(4),
  borderRadius: '20px 20px 0 0',
  marginBottom: theme.spacing(4),
  boxShadow: 
    '0 8px 32px rgba(15, 23, 42, 0.25), \
     inset 0 1px 1px rgba(255, 255, 255, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: 
      'linear-gradient(90deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    animation: `${shimmer} 3s infinite linear`
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '6px',
    left: 0,
    right: 0,
    height: '1px',
    background: 'rgba(255,255,255,0.1)'
  },
  '& h2': {
    margin: 0,
    fontSize: '2rem',
    fontWeight: 700,
    letterSpacing: '1px',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    position: 'relative',
    zIndex: 1
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '& fieldset': {
      borderColor: '#cbd5e1',
      borderWidth: '1.5px',
      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)'
    },
    '&:hover fieldset': {
      borderColor: '#94a3b8',
      boxShadow: '0 2px 4px rgba(15, 23, 42, 0.1)'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#334155',
      borderWidth: '2px',
      boxShadow: '0 0 0 4px rgba(51, 65, 85, 0.1)'
    },
    '&.Mui-error fieldset': {
      borderColor: theme.palette.error.main
    }
  },
  '& .MuiInputLabel-root': {
    color: '#64748b',
    '&.Mui-focused': {
      color: '#334155',
      fontWeight: 500
    }
  },
  '& .MuiFormHelperText-root': {
    marginLeft: '8px',
    fontSize: '0.8rem'
  }
}));

const EditProfilePage = () => {
  const theme = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    phone: '',
    licenceFront: null, 
    licenceBack: null,  
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
        licenceFront: null, 
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
        },
        body: updateFormData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: result.message || 'Profile updated successfully!' });
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
          <GlassPaper>
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
          </GlassPaper>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box 
        sx={{
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          py: 6,
          px: 2
        }}
      >
        <Container maxWidth="md">
          <GlassPaper component="form" onSubmit={handleSubmit}>
            <ProfileBanner>
              <h2>Edit Your Profile</h2>
            </ProfileBanner>
            <SectionHeader icon={<AccountCircleIcon fontSize="large" />} title="Personal Information" />
            
            <StyledTextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              sx={{ 
                mb: 3
              }}
            />

            <SectionHeader icon={<BadgeIcon fontSize="large" />} title="Driving License" />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 4 }}>
              <FileUploadCard active={!!formData.licenceFront}>
                <label htmlFor="licenceFront" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <CloudUploadIcon />
                  <Typography variant="body1" color={formData.licenceFront ? 'primary' : 'text.secondary'} sx={{ mb: 1, fontWeight: 600 }}>
                    {formData.licenceFront ? formData.licenceFront.name : 'Front of License'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formData.licenceFront ? 'Click to change' : 'PNG, JPG up to 5MB'}
                  </Typography>
                  <input
                    type="file"
                    id="licenceFront"
                    accept="image/*"
                    name="licenceFront"
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </FileUploadCard>

              <FileUploadCard active={!!formData.licenceBack}>
                <label htmlFor="licenceBack" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <CloudUploadIcon />
                  <Typography variant="body1" color={formData.licenceBack ? 'primary' : 'text.secondary'} sx={{ mb: 1, fontWeight: 600 }}>
                    {formData.licenceBack ? formData.licenceBack.name : 'Back of License'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formData.licenceBack ? 'Click to change' : 'PNG, JPG up to 5MB'}
                  </Typography>
                  <input
                    type="file"
                    id="licenceBack"
                    accept="image/*"
                    name="licenceBack"
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </FileUploadCard>
            </Box>

            <SectionHeader icon={<VpnKeyIcon fontSize="large" />} title="Change Password" />

            <StyledTextField
              fullWidth
              label="Current Password"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              sx={{ 
                mb: 2
              }}
            />
            <StyledTextField
              fullWidth
              label="New Password"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              sx={{ 
                mb: 2
              }}
            />
            <StyledTextField
              fullWidth
              label="Confirm New Password"
              name="confirmNewPassword"
              type="password"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              sx={{ 
                mb: 3
              }}
            />

            {message.text && (
              <Alert severity={message.type} sx={{ 
                borderRadius: '12px',
                mb: 3,
                border: '1px solid',
                borderColor: message.type === 'error' ? 'error.light' : 'success.light',
                backgroundColor: alpha(
                  message.type === 'error' ? theme.palette.error.light : theme.palette.success.light,
                  0.1
                )
              }}>
                {message.text}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <GradientButton
                type="submit"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
              </GradientButton>
              
              <Button
                fullWidth
                variant="outlined"
                sx={{
                  borderRadius: '12px',
                  py: '12px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  letterSpacing: '0.5px',
                  color: 'text.primary',
                  borderColor: 'grey.300',
                  '&:hover': {
                    borderColor: 'grey.400',
                    backgroundColor: 'action.hover',
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={() => navigate('/profile')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </Box>
          </GlassPaper>
        </Container>
      </Box>
    </>
  );
};

export default EditProfilePage;
