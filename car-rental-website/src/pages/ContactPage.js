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
  Divider,
  Alert,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

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
      borderColor: '#546e7a',
      borderWidth: '1px'
    },
  },
  '& .MuiInputLabel-outlined': {
    color: '#64748b',
    '&.Mui-focused': {
        color: '#546e7a',
    }
  },
  '.MuiInputBase-input': {
    color: '#334155',
  }
};

const ContactPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formValues.name || !formValues.email || !formValues.subject || !formValues.message) {
      setError('All fields are required except phone number.');
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
    
    // Phone validation (if provided)
    if (formValues.phone && !/^[\d\+\-\s\(\)]{7,15}$/.test(formValues.phone)) {
      setError('Please enter a valid phone number.');
      setSubmitted(false);
      return;
    }
    
    setError('');
    setLoading(true);
    
    // Prepare email content
    const emailBody = `Name: ${formValues.name}\nEmail: ${formValues.email}\nPhone: ${formValues.phone || 'Not provided'}\n\n${formValues.message}`;
    
    // Create email service selection popup
    const emailPopup = document.createElement('div');
    emailPopup.style.position = 'fixed';
    emailPopup.style.top = '50%';
    emailPopup.style.left = '50%';
    emailPopup.style.transform = 'translate(-50%, -50%)';
    emailPopup.style.backgroundColor = 'white';
    emailPopup.style.padding = '30px';
    emailPopup.style.borderRadius = '12px';
    emailPopup.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
    emailPopup.style.zIndex = '9999';
    emailPopup.style.width = '90%';
    emailPopup.style.maxWidth = '450px';
    
    // Create the service selection interface
    emailPopup.innerHTML = `
      <div style="text-align: center; margin-bottom: 25px;">
        <div style="background: linear-gradient(135deg, #546e7a 0%, #37474f 100%); margin: -30px -30px 20px; padding: 25px 20px; border-radius: 12px 12px 0 0;">
          <h3 style="margin: 0; color: white; font-weight: 600; font-size: 22px;">Send Your Message</h3>
        </div>
        <p style="color: #64748b; margin: 0 0 10px; font-size: 15px;">Select your preferred email service to send your message to:</p>
        <p style="color: #334155; font-weight: 600; font-size: 16px;">CarConnectDz@gmail.com</p>
        <div style="margin: 20px 0; padding: 12px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <p style="margin: 0; color: #334155; font-size: 14px; text-align: left;"><strong>Note:</strong> You'll need to complete sending the email in the service that opens. The message won't be sent automatically.</p>
        </div>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <button id="gmail-btn" class="email-btn" style="display: flex; align-items: center; padding: 14px 18px; background-color: white; border: 1px solid #e2e8f0; border-radius: 10px; cursor: pointer; transition: all 0.2s;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/2560px-Gmail_icon_%282020%29.svg.png" style="width: 28px; height: 28px; margin-right: 15px;">
          <span style="font-weight: 500; color: #334155; font-size: 16px;">Gmail</span>
          <span style="margin-left: auto; color: #94a3b8; font-size: 20px;">›</span>
        </button>
        
        <button id="outlook-btn" class="email-btn" style="display: flex; align-items: center; padding: 14px 18px; background-color: white; border: 1px solid #e2e8f0; border-radius: 10px; cursor: pointer; transition: all 0.2s;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg/1200px-Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg.png" style="width: 28px; height: 28px; margin-right: 15px;">
          <span style="font-weight: 500; color: #334155; font-size: 16px;">Outlook</span>
          <span style="margin-left: auto; color: #94a3b8; font-size: 20px;">›</span>
        </button>
        
        <button id="yahoo-btn" class="email-btn" style="display: flex; align-items: center; padding: 14px 18px; background-color: white; border: 1px solid #e2e8f0; border-radius: 10px; cursor: pointer; transition: all 0.2s;">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Yahoo%21_Mail_logo.svg/2560px-Yahoo%21_Mail_logo.svg.png" style="width: 28px; height: 28px; margin-right: 15px;">
          <span style="font-weight: 500; color: #334155; font-size: 16px;">Yahoo Mail</span>
          <span style="margin-left: auto; color: #94a3b8; font-size: 20px;">›</span>
        </button>
        
        <button id="default-btn" class="email-btn" style="display: flex; align-items: center; padding: 14px 18px; background-color: white; border: 1px solid #e2e8f0; border-radius: 10px; cursor: pointer; transition: all 0.2s;">
          <img src="https://cdn-icons-png.flaticon.com/512/3178/3178158.png" style="width: 28px; height: 28px; margin-right: 15px;">
          <span style="font-weight: 500; color: #334155; font-size: 16px;">Default Email Client</span>
          <span style="margin-left: auto; color: #94a3b8; font-size: 20px;">›</span>
        </button>
      </div>
      
      <div style="margin-top: 20px; text-align: center;">
        <button id="cancel-btn" style="padding: 12px 20px; background-color: #e2e8f0; color: #334155; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.2s;">Cancel</button>
      </div>
    `;
    
    // Add hover effect to email buttons
    const style = document.createElement('style');
    style.textContent = `
      .email-btn:hover {
        background-color: #f8fafc !important;
        border-color: #94a3b8 !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      }
    `;
    document.head.appendChild(style);
    
    // Add overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '9998';
    
    // Show loading and success messages
    setLoading(false);
    setSubmitted(true);
    
    // Add to document
    document.body.appendChild(overlay);
    document.body.appendChild(emailPopup);
    
    // Define email service URLs
    const openGmail = () => {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=CarConnectDz@gmail.com&su=${encodeURIComponent(formValues.subject)}&body=${encodeURIComponent(emailBody)}`;
      window.open(gmailUrl, '_blank');
    };
    
    const openOutlook = () => {
      const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=CarConnectDz@gmail.com&subject=${encodeURIComponent(formValues.subject)}&body=${encodeURIComponent(emailBody)}`;
      window.open(outlookUrl, '_blank');
    };
    
    const openYahoo = () => {
      const yahooUrl = `https://compose.mail.yahoo.com/?to=CarConnectDz@gmail.com&subject=${encodeURIComponent(formValues.subject)}&body=${encodeURIComponent(emailBody)}`;
      window.open(yahooUrl, '_blank');
    };
    
    const openDefaultClient = () => {
      const mailtoLink = `mailto:CarConnectDz@gmail.com?subject=${encodeURIComponent(formValues.subject)}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoLink;
    };
    
    // Add event listeners
    document.getElementById('gmail-btn').addEventListener('click', () => {
      openGmail();
      closeEmailPopup();
    });
    
    document.getElementById('outlook-btn').addEventListener('click', () => {
      openOutlook();
      closeEmailPopup();
    });
    
    document.getElementById('yahoo-btn').addEventListener('click', () => {
      openYahoo();
      closeEmailPopup();
    });
    
    document.getElementById('default-btn').addEventListener('click', () => {
      openDefaultClient();
      closeEmailPopup();
    });
    
    document.getElementById('cancel-btn').addEventListener('click', closeEmailPopup);
    
    function closeEmailPopup() {
      document.body.removeChild(emailPopup);
      document.body.removeChild(overlay);
      document.head.removeChild(style);
      
      // Reset form after popup is closed
      setTimeout(() => {
        setSubmitted(false);
        setFormValues({ name: '', email: '', phone: '', subject: '', message: ''});
      }, 1000);
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ 
        backgroundColor: '#f1f5f9', 
        minHeight: 'calc(100vh - 64px)', 
        py: { xs: 4, md: 6 },
        backgroundImage: 'linear-gradient(to bottom, rgba(241, 245, 249, 0.92), rgba(241, 245, 249, 0.98)), url("https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <Container>
          <Paper 
            elevation={6} 
            sx={{
              p: { xs: 3, sm: 4, md: 5 }, 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              borderRadius: '20px', 
              border: '1px solid #e2e8f0',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
              <Box sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                p: 2,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #546e7a 0%, #37474f 100%)',
                boxShadow: '0 8px 16px rgba(55, 71, 79, 0.2)',
                mb: 3
              }}>
                <ContactMailIcon sx={{ fontSize: {xs: 40, md: 56}, color: '#fff' }} />
              </Box>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  color: '#1e293b', 
                  fontWeight: '800', 
                  fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.4rem' },
                  background: 'linear-gradient(90deg, #546e7a, #37474f)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2
                }}
              >
                Get In Touch With ConnectDZ
              </Typography>
              <Typography variant="h6" sx={{ 
                color: '#64748b', 
                maxWidth: '800px', 
                margin: '0 auto', 
                lineHeight: 1.7,
                fontSize: { xs: '1rem', md: '1.2rem' },
                fontWeight: 500
              }}>
                Have questions about our car sharing platform? Need assistance with a booking? Our team is ready to help you with any inquiries or feedback.
              </Typography>
            </Box>
            
            <Divider sx={{ 
              my: 5, 
              borderColor: 'rgba(203, 213, 225, 0.7)', 
              borderWidth: '1px',
              width: '70%',
              margin: '2rem auto 3rem'
            }} />

            {/* Main Content */}
            <Grid container spacing={{xs: 4, md: 6}}>
              {/* Contact Information */}
              <Grid item xs={12} md={5}>
                <Typography variant="h4" sx={{ 
                  color: '#334155', 
                  fontWeight: '600', 
                  mb: 3.5, 
                  fontSize: {xs: '1.6rem', md: '1.8rem'},
                  borderBottom: '2px solid #546e7a',
                  paddingBottom: '0.5rem',
                  display: 'inline-block'
                }}>
                  Contact Information
                </Typography>
                
                <Grid container spacing={2.5} sx={{ mb: 4 }}>

                  
                  <Grid item xs={12} sm={6}>
                    <Card elevation={2} sx={{ 
                      borderRadius: '12px', 
                      height: '100%',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                      }
                    }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ 
                            backgroundColor: 'rgba(84, 110, 122, 0.1)', 
                            borderRadius: '50%',
                            width: 50,
                            height: 50,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2
                          }}>
                            <EmailIcon sx={{ color: '#546e7a', fontSize: '1.8rem' }} />
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: '600', color: '#334155', fontSize: '1.1rem' }}>
                              Email Us
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                              CarConnectDz@gmail.com
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Card elevation={2} sx={{ 
                      borderRadius: '12px', 
                      height: '100%',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                      }
                    }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ 
                            backgroundColor: 'rgba(84, 110, 122, 0.1)', 
                            borderRadius: '50%',
                            width: 50,
                            height: 50,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2
                          }}>
                            <PhoneIcon sx={{ color: '#546e7a', fontSize: '1.8rem' }} />
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: '600', color: '#334155', fontSize: '1.1rem' }}>
                              Call Us
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                              +213 553 953 240
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Card elevation={2} sx={{ 
                      borderRadius: '12px', 
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                      }
                    }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ 
                            backgroundColor: 'rgba(84, 110, 122, 0.1)', 
                            borderRadius: '50%',
                            width: 50,
                            height: 50,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2
                          }}>
                            <AccessTimeIcon sx={{ color: '#546e7a', fontSize: '1.8rem' }} />
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: '600', color: '#334155', fontSize: '1.1rem' }}>
                              Working Hours
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                              All week long: 24/7
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                <Box sx={{ 
                  mt: 2, 
                  p: 3.5, 
                  bgcolor: 'rgba(84, 110, 122, 0.05)', 
                  borderRadius: '16px', 
                  border: '1px dashed rgba(84, 110, 122, 0.3)' 
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SupportAgentIcon sx={{ color: '#546e7a', fontSize: '2rem', mr: 1.5 }} />
                    <Typography variant="h6" sx={{ color: '#334155', fontWeight: '600' }}>
                      Need Immediate Assistance?
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 3, lineHeight: 1.7 }}>
                    Our customer support team is available during business hours to assist you with any urgent inquiries about our car sharing platform.
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<PhoneIcon />}
                    sx={{
                      py: 1.5,
                      backgroundColor: '#546e7a',
                      color: '#ffffff',
                      '&:hover': { backgroundColor: '#455a64' },
                      textTransform: 'none',
                      fontWeight: '600',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(55, 71, 79, 0.2)'
                    }}
                  >
                    Call Support Center
                  </Button>
                </Box>
              </Grid>

              {/* Contact Form */}
              <Grid item xs={12} md={7}>
                <Typography variant="h4" sx={{ 
                  color: '#334155', 
                  fontWeight: '600', 
                  mb: 3.5, 
                  fontSize: {xs: '1.6rem', md: '1.8rem'},
                  borderBottom: '2px solid #546e7a',
                  paddingBottom: '0.5rem',
                  display: 'inline-block'
                }}>
                  Send Us a Message
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: '#64748b' }}>
                  Fill out the form below and click submit. You'll be able to choose between Gmail, Outlook, or your default email client to send your message.
                </Typography>
                
                <Card elevation={3} sx={{ 
                  borderRadius: '16px', 
                  p: { xs: 2, md: 3 },
                  boxShadow: '0 8px 16px rgba(0,0,0,0.05)'
                }}>
                  <CardContent>
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
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Phone Number (Optional)"
                            name="phone"
                            value={formValues.phone}
                            onChange={handleChange}
                            variant="outlined"
                            sx={textFieldStyles}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
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
                            rows={6}
                            value={formValues.message}
                            onChange={handleChange}
                            variant="outlined"
                            sx={textFieldStyles}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          {error && (
                            <Alert 
                              severity="error" 
                              sx={{ 
                                mb: 2, 
                                borderRadius: '8px',
                                '& .MuiAlert-icon': { color: '#ef4444' }
                              }}
                            >
                              {error}
                            </Alert>
                          )}
                          
                          {submitted && (
                            <Alert 
                              severity="success" 
                              sx={{ 
                                mb: 2, 
                                borderRadius: '8px',
                                '& .MuiAlert-icon': { color: '#10b981' }
                              }}
                            >
                              Form submitted successfully! Complete sending your message in the email window.
                            </Alert>
                          )}
                          
                          <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                            endIcon={loading ? null : <SendIcon />}
                            sx={{
                              py: 1.8,
                              backgroundColor: '#546e7a',
                              color: '#ffffff',
                              fontWeight: '600',
                              fontSize: '1rem',
                              borderRadius: '8px',
                              '&:hover': { backgroundColor: '#455a64' },
                              textTransform: 'none',
                              position: 'relative'
                            }}
                          >
                            {loading ? (
                              <CircularProgress 
                                size={24} 
                                sx={{ 
                                  color: '#fff',
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  marginTop: '-12px',
                                  marginLeft: '-12px'
                                }} 
                              />
                            ) : 'Send Message'}
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default ContactPage;
