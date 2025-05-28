import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  useTheme,
  FormHelperText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import WilayaDropdown from './WilayaDropdown';

const SignUp = ({ open, onClose, onSwitchToSignIn, onSuccess }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    phone: '',
    residence: '',
    licenceFront: null,
    licenceBack: null,
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateAlgerianPhone = (phoneNumber) => {
    const cleanedNumber = phoneNumber.replace(/\s+/g, '').replace(/[^\d]/g, '');
    const isValid = /^0[5-7]\d{8}$/.test(cleanedNumber);
    return isValid || cleanedNumber.length === 0 ? '' : 'Please enter a valid Algerian phone number (e.g., 05XXXXXXXX)';
  };

  const validateEmail = (email) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    return isValid || email.length === 0 ? '' : 'Please enter a valid email address.';
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (name === 'phone') setPhoneError(validateAlgerianPhone(value));
      if (name === 'email') setEmailError(validateEmail(value));
    }
  };

  const handleSubmitFinal = async () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => formDataToSend.append(key, formData[key]));

    try {
      const response = await fetch(`${apiUrl}/api/auth/signup`, {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        // If signup is successful, redirect to verification page
        onClose(); // Close signup dialog
        navigate('/verify-email', { state: { email: result.email } }); // Pass email as state
      } else {
        alert(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error("Error during registration:", error.message);
      alert('An error occurred during registration');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < 18) {
      alert("You must be at least 18 years old to register.");
      return;
    }

    const phoneValidationError = validateAlgerianPhone(formData.phone);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      alert("Please enter a valid Algerian phone number.");
      return;
    }

    const emailValidationError = validateEmail(formData.email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      alert("Please enter a valid email address.");
      return;
    }

    await handleSubmitFinal();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 12px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' } }}
    >
      <Box sx={{ position: 'relative', background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)', p: 3, color: 'white' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>Create Account</Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>Join us and start your journey</Typography>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 4, maxHeight: '70vh', overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField required fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} variant="outlined" onFocus={() => setFocused('firstName')} onBlur={() => setFocused('')} InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: focused === 'firstName' ? '#475569' : '#94a3b8', transition: 'color 0.3s ease' }} /></InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#94a3b8' }, '&.Mui-focused fieldset': { borderColor: '#475569' } } }} />
              <TextField required fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} variant="outlined" onFocus={() => setFocused('lastName')} onBlur={() => setFocused('')} InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: focused === 'lastName' ? '#475569' : '#94a3b8', transition: 'color 0.3s ease' }} /></InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#94a3b8' }, '&.Mui-focused fieldset': { borderColor: '#475569' } } }} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField required fullWidth label="Birth Date" name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} InputLabelProps={{ shrink: true }} variant="outlined" />
              <TextField required fullWidth label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} variant="outlined" placeholder="05XXXXXXXX" error={!!phoneError} helperText={phoneError || "Enter Algerian mobile number (05, 06, or 07)"} onFocus={() => setFocused('phone')} onBlur={() => setFocused('')} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: focused === 'phone' ? '#475569' : '#94a3b8', transition: 'color 0.3s ease' }} /></InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#94a3b8' }, '&.Mui-focused fieldset': { borderColor: '#475569' } } }} />
            </Box>
            <WilayaDropdown value={formData.residence} onChange={(value) => setFormData((prev) => ({ ...prev, residence: value }))} sx={{ mb: 0 }} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Driving Licence (Front)</Typography>
                <Button variant="outlined" component="label" fullWidth sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                  {formData.licenceFront ? formData.licenceFront.name : 'Upload Front Image'}
                  <input type="file" accept="image/*" name="licenceFront" hidden onChange={handleChange} />
                </Button>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Driving Licence (Back)</Typography>
                <Button variant="outlined" component="label" fullWidth sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                  {formData.licenceBack ? formData.licenceBack.name : 'Upload Back Image'}
                  <input type="file" accept="image/*" name="licenceBack" hidden onChange={handleChange} />
                </Button>
              </Box>
            </Box>
            <TextField required fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} variant="outlined" onFocus={() => setFocused('email')} onBlur={() => setFocused('')} InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: focused === 'email' ? '#475569' : '#94a3b8', transition: 'color 0.3s ease' }} /></InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#94a3b8' }, '&.Mui-focused fieldset': { borderColor: '#475569' } } }} />
            <TextField required fullWidth label="Password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} variant="outlined" onFocus={() => setFocused('password')} onBlur={() => setFocused('')} InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: focused === 'password' ? '#475569' : '#94a3b8', transition: 'color 0.3s ease' }} /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: showPassword ? '#475569' : '#94a3b8' }}>{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton></InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#94a3b8' }, '&.Mui-focused fieldset': { borderColor: '#475569' } } }} />
            <TextField required fullWidth label="Confirm Password" name="confirmPassword" type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} variant="outlined" onFocus={() => setFocused('confirmPassword')} onBlur={() => setFocused('')} InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: focused === 'confirmPassword' ? '#475569' : '#94a3b8', transition: 'color 0.3s ease' }} /></InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#94a3b8' }, '&.Mui-focused fieldset': { borderColor: '#475569' } } }} />
          </Box>
          <DialogActions sx={{ p: 0, pt: 2, flexDirection: 'column', gap: 2 }}>
            <Button type="submit" variant="contained" fullWidth sx={{ bgcolor: '#475569', color: 'white', py: 1.5, fontSize: '1rem', textTransform: 'none', '&:hover': { bgcolor: '#334155' } }}>
              Create Account
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>Already have an account?</Typography>
              <Button onClick={() => onSwitchToSignIn()} sx={{ color: '#475569', textTransform: 'none', '&:hover': { backgroundColor: 'transparent', color: '#334155' } }}>Sign In</Button>
            </Box>
          </DialogActions>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default SignUp;
