import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send'; // For submit button
import ContactMailIcon from '@mui/icons-material/ContactMail'; // Main page icon

const ContactPage = () => {
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formValues.name || !formValues.email || !formValues.subject || !formValues.message) {
      setError('All fields are required.');
      setSubmitted(false);
      return;
    }
    // Basic email validation
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(formValues.email)) {
      setError('Please enter a valid email address.');
      setSubmitted(false);
      return;
    }
    
    setError('');
    setSubmitted(true);
    console.log('Form Submitted:', formValues);
    // Here you would typically send the form data to a backend server
    // For now, we'll just show an alert and reset the form after a delay
    setTimeout(() => {
        setSubmitted(false); // Hide alert
        setFormValues({ name: '', email: '', subject: '', message: ''}); // Reset form
    }, 5000);
  };

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: '#f1f5f9', minHeight: 'calc(100vh - 64px)', py: { xs: 3, md: 5 } }}>
        <Container>
          <Paper 
            elevation={4} 
            sx={{
              p: { xs: 2, sm: 3, md: 4 }, 
              backgroundColor: '#ffffff', 
              borderRadius: '16px', 
              border: '1px solid #e2e8f0'
            }}
          >
            <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 5 } }}>
              <ContactMailIcon sx={{ fontSize: {xs: 48, md: 64}, color: '#334155', mb: 1 }} />
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  color: '#334155', 
                  fontWeight: '700', 
                  fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.2rem' }
                }}
              >
                Get In Touch
              </Typography>
              <Typography variant="h6" sx={{ color: '#64748b', maxWidth: '750px', margin: '0 auto', lineHeight: 1.6 }}>
                We're here to help! Whether you have a question about our services, need assistance, or want to provide feedback, please don't hesitate to reach out.
              </Typography>
            </Box>
            
            <Divider sx={{ my: {xs:3, md:4}, borderColor: '#cbd5e1' }} />

            <Grid container spacing={{xs: 3, md: 5}}>
              <Grid item xs={12} md={5}>
                <Typography variant="h4" sx={{ color: '#334155', fontWeight: '600', mb: 2.5, fontSize: {xs: '1.6rem', md: '1.8rem'} }}>
                  Contact Information
                </Typography>
                <List sx={{ '& .MuiListItemIcon-root': { minWidth: '40px', color: '#475569' } }}>
                  <ListItem disablePadding sx={{mb: 1.5}}>
                    <ListItemIcon>
                      <LocationOnIcon />
                    </ListItemIcon>
                    <ListItemText 
                        primary="Our Office" 
                        secondary="123 CarRental St, Algiers, Algeria"
                        primaryTypographyProps={{ fontWeight: '500', color: '#334155' }}
                        secondaryTypographyProps={{ color: '#64748b' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{mb: 1.5}}>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText 
                        primary="Email Us" 
                        secondary="contact@yourcompany.dz"
                        primaryTypographyProps={{ fontWeight: '500', color: '#334155' }}
                        secondaryTypographyProps={{ color: '#64748b' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{mb: 1.5}}>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText 
                        primary="Call Us" 
                        secondary="+213 (0) 555 123 456"
                        primaryTypographyProps={{ fontWeight: '500', color: '#334155' }}
                        secondaryTypographyProps={{ color: '#64748b' }}
                    />
                  </ListItem>
                  <ListItem disablePadding sx={{mb: 1.5}}>
                    <ListItemIcon>
                      <AccessTimeIcon />
                    </ListItemIcon>
                    <ListItemText 
                        primary="Business Hours" 
                        secondary="Mon - Fri: 9:00 AM - 6:00 PM | Sat: 10:00 AM - 4:00 PM"
                        primaryTypographyProps={{ fontWeight: '500', color: '#334155' }}
                        secondaryTypographyProps={{ color: '#64748b' }}
                    />
                  </ListItem>
                </List>
                <Divider sx={{ my: {xs:2.5, md:3}, borderColor: '#e2e8f0' }} />
                 <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                    For urgent inquiries outside of business hours, please use our main support line which is available 24/7 for existing customers.
                </Typography>
              </Grid>

              <Grid item xs={12} md={7}>
                <Typography variant="h4" sx={{ color: '#334155', fontWeight: '600', mb: 2.5, fontSize: {xs: '1.6rem', md: '1.8rem'} }}>
                  Send Us a Message
                </Typography>
                <form onSubmit={handleSubmit} noValidate>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        label="Full Name"
                        name="name"
                        value={formValues.name}
                        onChange={handleChange}
                        variant="outlined"
                        sx={textFieldStyles}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formValues.email}
                        onChange={handleChange}
                        variant="outlined"
                        sx={textFieldStyles}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        required
                        label="Subject"
                        name="subject"
                        value={formValues.subject}
                        onChange={handleChange}
                        variant="outlined"
                        sx={textFieldStyles}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        required
                        label="Your Message"
                        name="message"
                        multiline
                        rows={5}
                        value={formValues.message}
                        onChange={handleChange}
                        variant="outlined"
                        sx={textFieldStyles}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}
                      {submitted && <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>Message sent successfully! We'll get back to you soon.</Alert>}
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        endIcon={<SendIcon />}
                        sx={{
                          py: 1.5,
                          backgroundColor: '#334155',
                          color: '#ffffff',
                          fontWeight: '600',
                          fontSize: '1rem',
                          borderRadius: '8px',
                          '&:hover': { backgroundColor: '#475569' },
                          textTransform: 'none'
                        }}
                      >
                        Send Message
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

const textFieldStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#cbd5e1',
    },
    '&:hover fieldset': {
      borderColor: '#94a3b8',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#334155',
      borderWidth: '1px'
    },
  },
  '& .MuiInputLabel-outlined': {
    color: '#64748b',
    '&.Mui-focused': {
        color: '#334155',
    }
  },
  '.MuiInputBase-input': {
    color: '#334155',
  }
};

export default ContactPage;
