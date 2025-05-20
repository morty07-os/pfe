import React from 'react';
import Navbar from '../components/Navbar';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Divider,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import CarRentalIcon from '@mui/icons-material/CarRental';
import PeopleIcon from '@mui/icons-material/People';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import BusinessIcon from '@mui/icons-material/Business';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import EmojiTransportationIcon from '@mui/icons-material/EmojiTransportation';
import PhoneIcon from '@mui/icons-material/Phone';
import StarIcon from '@mui/icons-material/Star';
import HandshakeIcon from '@mui/icons-material/Handshake';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const AboutPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <>
      <Navbar />
      <Box 
        sx={{ 
          minHeight: 'calc(100vh - 64px)',
          background: 'linear-gradient(135deg, rgba(241, 245, 249, 0.97) 0%, rgba(226, 232, 240, 0.97) 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          py: { xs: 4, md: 6 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative Elements */}
        <Box 
          sx={{
            position: 'absolute',
            top: '5%',
            right: '5%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(84, 110, 122, 0.1) 0%, rgba(84, 110, 122, 0.05) 100%)',
            zIndex: 0
          }}
        />
        <Box 
          sx={{
            position: 'absolute',
            bottom: '10%',
            left: '5%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(84, 110, 122, 0.1) 0%, rgba(84, 110, 122, 0.05) 100%)',
            zIndex: 0
          }}
        />
        {/* Hero Section */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Paper 
            elevation={3} 
            sx={{
              p: 0, 
              backgroundColor: '#ffffff', 
              borderRadius: '16px', 
              overflow: 'hidden',
              mb: 5
            }}
          >
            <Box sx={{ 
              background: 'linear-gradient(135deg, #546e7a 0%, #37474f 100%)',
              p: { xs: 4, md: 6 },
              color: 'white',
              textAlign: 'center',
              position: 'relative',
              borderRadius: '16px 16px 0 0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <Box 
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'url("https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.2,
                  zIndex: 0
                }}
              />
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                  <Avatar 
                    sx={{ 
                      width: { xs: 90, md: 120 }, 
                      height: { xs: 90, md: 120 }, 
                      backgroundColor: 'rgba(255,255,255,0.15)', 
                      margin: '0 auto',
                      border: '4px solid rgba(255,255,255,0.2)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                    }}
                  >
                    <BusinessIcon sx={{ fontSize: { xs: 45, md: 60 }, color: 'white' }} />
                  </Avatar>
                  <Box sx={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    width: { xs: 40, md: 50 },
                    height: { xs: 40, md: 50 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    border: '2px solid white'
                  }}>
                    <StarIcon sx={{ fontSize: { xs: 24, md: 30 }, color: 'white' }} />
                  </Box>
                </Box>
                <Typography 
                  variant="h2" 
                  component="h1" 
                  sx={{ 
                    fontWeight: '700', 
                    fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.5rem' },
                    mb: 2,
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    letterSpacing: '0.5px'
                  }}
                >
                  About <span style={{ color: '#81c784' }}>Connect</span>DZ
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    maxWidth: '700px', 
                    margin: '0 auto',
                    opacity: 0.9,
                    fontSize: { xs: '1.1rem', md: '1.3rem' },
                    fontWeight: 400,
                    mb: 3
                  }}
                >
                  Revolutionizing Car Sharing in Algeria
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<DirectionsCarIcon sx={{ color: 'white !important' }} />} 
                    label="Peer-to-Peer Sharing" 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.15)', 
                      color: 'white',
                      fontWeight: 500,
                      '& .MuiChip-icon': { color: 'white' }
                    }} 
                  />
                  <Chip 
                    icon={<HandshakeIcon sx={{ color: 'white !important' }} />} 
                    label="Community Driven" 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.15)', 
                      color: 'white',
                      fontWeight: 500,
                      '& .MuiChip-icon': { color: 'white' }
                    }} 
                  />
                  <Chip 
                    icon={<LocalAtmIcon sx={{ color: 'white !important' }} />} 
                    label="Affordable Rates" 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.15)', 
                      color: 'white',
                      fontWeight: 500,
                      '& .MuiChip-icon': { color: 'white' }
                    }} 
                  />
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ p: { xs: 3, md: 5 } }}>
              {/* Mission & Vision */}
              <Grid container spacing={4} sx={{ mb: 5, mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Card elevation={0} sx={{ 
                    height: '100%', 
                    border: '1px solid #e2e8f0',
                    borderLeft: '4px solid #546e7a',
                    borderRadius: '8px',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ 
                          bgcolor: 'rgba(84, 110, 122, 0.1)', 
                          mr: 2,
                          color: '#546e7a',
                          width: 45,
                          height: 45
                        }}>
                          <StarIcon />
                        </Avatar>
                        <Typography variant="h5" sx={{ color: '#334155', fontWeight: 600 }}>
                          Our Mission
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.8 }}>
                        To transform transportation in Algeria through innovative peer-to-peer car sharing, connecting car owners with trusted renters in a way that's simple, secure, and mutually beneficial.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card elevation={0} sx={{ 
                    height: '100%', 
                    border: '1px solid #e2e8f0',
                    borderLeft: '4px solid #546e7a',
                    borderRadius: '8px',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ 
                          bgcolor: 'rgba(84, 110, 122, 0.1)', 
                          mr: 2,
                          color: '#546e7a',
                          width: 45,
                          height: 45
                        }}>
                          <EmojiTransportationIcon />
                        </Avatar>
                        <Typography variant="h5" sx={{ color: '#334155', fontWeight: 600 }}>
                          Our Vision
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.8 }}>
                        To create a more connected, sustainable future for mobility in Algeria, where every journey is an opportunity to connect and make better use of resources.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Main Content */}
              <Typography variant="body1" paragraph sx={{ color: '#475569', lineHeight: 1.8, fontSize: '1.1rem', mb: 3 }}>
                Welcome to <strong>ConnectDZ</strong>, an ambitious new startup on a mission to transform transportation in Algeria through innovative peer-to-peer car sharing. As a fresh face in the market, we're building a platform that connects car owners with trusted renters in a way that's simple, secure, and mutually beneficial.
              </Typography>
              
              <Typography variant="body1" paragraph sx={{ color: '#475569', lineHeight: 1.8, fontSize: '1.1rem', mb: 4 }}>
                As a new player in Algeria's sharing economy, we're excited to bring fresh ideas and innovative solutions to the car rental market. Our platform is designed with both car owners and renters in mind - helping owners generate income from their idle vehicles while giving renters access to a diverse range of cars at affordable rates.
              </Typography>

              {/* Features Section */}
              <Box sx={{ my: 6, textAlign: 'center' }}>
                <Typography 
                  variant="h4" 
                  component="h2" 
                  sx={{ 
                    color: '#334155', 
                    fontWeight: '600', 
                    textAlign: 'center', 
                    mb: 4,
                    fontSize: { xs: '1.8rem', sm: '2.2rem' },
                    position: 'relative',
                    display: 'inline-block',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-10px',
                      left: '0',
                      width: '100%',
                      height: '3px',
                      background: 'linear-gradient(90deg, transparent 0%, #546e7a 50%, transparent 100%)',
                      borderRadius: '2px'
                    }
                  }}
                >
                  Why Choose ConnectDZ?
                </Typography>
                
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  {[
                    {
                      icon: <CarRentalIcon sx={{ fontSize: 40, color: '#546e7a' }} />,
                      title: 'Innovative Platform',
                      text: 'Our modern, user-friendly platform makes car sharing simple and accessible for everyone in Algeria.'
                    },
                    {
                      icon: <SecurityIcon sx={{ fontSize: 40, color: '#546e7a' }} />,
                      title: 'Secure & Trusted',
                      text: 'Verified profiles, secure payments, and comprehensive insurance options for peace of mind.'
                    },
                    {
                      icon: <SpeedIcon sx={{ fontSize: 40, color: '#546e7a' }} />,
                      title: 'Fast & Efficient',
                      text: 'Quick booking process and streamlined pickup/return procedures save you time and hassle.'
                    },
                    {
                      icon: <PeopleIcon sx={{ fontSize: 40, color: '#546e7a' }} />,
                      title: 'Growing Community',
                      text: 'Join a thriving network of car sharing enthusiasts building a more connected Algeria.'
                    },
                    {
                      icon: <EmojiTransportationIcon sx={{ fontSize: 40, color: '#546e7a' }} />,
                      title: 'Diverse Vehicle Options',
                      text: 'From economy cars to luxury vehicles, find the perfect ride for any occasion or budget.'
                    },
                    {
                      icon: <SupportAgentIcon sx={{ fontSize: 40, color: '#546e7a' }} />,
                      title: '24/7 Support',
                      text: 'Our dedicated team is always available to assist you with any questions or concerns.'
                    }
                  ].map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card elevation={0} sx={{
                        height: '100%',
                        p: 3,
                        borderRadius: '12px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          borderColor: '#546e7a',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                          transform: 'translateY(-5px)',
                          '& .feature-icon-bg': {
                            transform: 'scale(1.1)'
                          }
                        }
                      }}>
                        <Box sx={{ position: 'relative', mb: 2 }}>
                          <Box className="feature-icon-bg" sx={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            width: '100%', 
                            height: '100%',
                            background: 'radial-gradient(circle, rgba(84, 110, 122, 0.1) 0%, rgba(255,255,255,0) 70%)',
                            transition: 'transform 0.3s ease',
                            transform: 'scale(1)',
                            transformOrigin: 'center'
                          }} />
                          <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                            <Avatar sx={{ 
                              bgcolor: 'rgba(84, 110, 122, 0.15)', 
                              mr: 2,
                              boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
                            }}>
                              {item.icon}
                            </Avatar>
                            <Typography variant="h6" sx={{ color: '#334155', fontWeight: '600', fontSize: '1.1rem' }}>
                              {item.title}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6 }}>
                          {item.text}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Company History */}
              <Box sx={{ 
                background: 'linear-gradient(135deg, rgba(84, 110, 122, 0.08) 0%, rgba(84, 110, 122, 0.03) 100%)', 
                p: 4, 
                borderRadius: '16px', 
                mt: 6, 
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4), 0 4px 10px rgba(0,0,0,0.03)',
                border: '1px solid rgba(84, 110, 122, 0.1)'
              }}>
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: { xs: '100px', md: '150px' },
                    height: { xs: '100px', md: '150px' },
                    background: 'linear-gradient(135deg, #546e7a 0%, transparent 70%)',
                    opacity: 0.1,
                    borderRadius: '0 0 0 100%'
                  }}
                />
                <Typography variant="h5" sx={{ color: '#334155', fontWeight: 600, mb: 3 }}>
                  Our Story
                </Typography>
                <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.8, fontSize: '1.05rem', mb: 3 }}>
                  Founded in <strong>2025</strong>, ConnectDZ is a bold new venture in Algeria's evolving transportation landscape. While we may be new, we're driven by a clear vision: to create a more connected, sustainable future for mobility in Algeria.
                </Typography>
                <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.8, fontSize: '1.05rem' }}>
                  We're starting small but dreaming big, with plans to expand our community and services across the country. As we grow, we're committed to listening to our users and continuously improving our platform. Join us on this exciting journey as we build something truly special together - one shared ride at a time.
                </Typography>
              </Box>
              
              {/* Call to Action */}
              <Box sx={{ 
                textAlign: 'center', 
                mt: 6, 
                p: 5, 
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #546e7a 0%, #455a64 100%)',
                color: 'white',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'url("https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.1,
                  zIndex: 0
                }} />
                
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                    Ready to Join the <span style={{ color: '#81c784' }}>Connect</span>DZ Community?
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 4, maxWidth: '700px', mx: 'auto' }}>
                    Whether you want to rent a car or share your own vehicle, we're here to make the process simple and rewarding.
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="large"
                    startIcon={<PhoneIcon />}
                    sx={{ 
                      backgroundColor: 'white', 
                      color: '#546e7a',
                      '&:hover': { 
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      },
                      px: 4,
                      py: 1.5,
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}
                    onClick={() => window.location.href = '/contact'}
                  >
                    Contact Us Today
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default AboutPage;
