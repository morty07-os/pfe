import React from 'react';
import Navbar from '../components/Navbar';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Divider
} from '@mui/material';
import CarRentalIcon from '@mui/icons-material/CarRental';
import PeopleIcon from '@mui/icons-material/People';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import BusinessIcon from '@mui/icons-material/Business'; // For company history

const AboutPage = () => {
  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: '#f1f5f9', minHeight: 'calc(100vh - 64px)' }}> {/* Assuming 64px navbar height */}
        <Container sx={{ py: { xs: 3, md: 5 } }}>
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
              <BusinessIcon sx={{ fontSize: {xs: 48, md: 64}, color: '#334155', mb: 1 }} />
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
                About ConnectDZ
              </Typography>
              <Typography variant="h6" sx={{ color: '#64748b', maxWidth: '700px', margin: '0 auto' }}>
                Peer-to-Peer Car Sharing in Algeria
              </Typography>
            </Box>
            
            <Divider sx={{ my: 4, borderColor: '#cbd5e1' }} />

            <Typography variant="body1" paragraph sx={{ color: '#475569', lineHeight: 1.8, fontSize: '1.1rem', textAlign: 'justify', mb: 3 }}>
              Welcome to <strong>ConnectDZ</strong>, an ambitious new startup on a mission to transform transportation in Algeria through innovative peer-to-peer car sharing. As a fresh face in the market, we're building a platform that connects car owners with trusted renters in a way that's simple, secure, and mutually beneficial. Our vision is to create a community where every journey is an opportunity to connect and make better use of resources.
            </Typography>
            <Typography variant="body1" paragraph sx={{ color: '#475569', lineHeight: 1.8, fontSize: '1.1rem', textAlign: 'justify', mb: 4 }}>
              As a new player in Algeria's sharing economy, we're excited to bring fresh ideas and innovative solutions to the car rental market. Our platform is designed with both car owners and renters in mind - helping owners generate income from their idle vehicles while giving renters access to a diverse range of cars at affordable rates. We're building our service on modern technology and a commitment to exceptional user experience, with features like secure payments, verified profiles, and 24/7 support to ensure peace of mind for all our users.
            </Typography>

            <Box sx={{ backgroundColor: '#f8fafc', p: {xs: 2, md:4}, borderRadius: '12px', my: {xs:3, md:5}, border: '1px solid #e2e8f0' }}>
              <Typography 
                variant="h4" 
                component="h2" 
                gutterBottom 
                sx={{ 
                  color: '#334155', 
                  fontWeight: '600', 
                  textAlign: 'center', 
                  mb: {xs: 3, md: 4},
                  fontSize: { xs: '1.8rem', sm: '2.2rem' }
                }}
              >
                Why Choose Us?
              </Typography>
              <Grid container spacing={{xs: 3, md: 4}} justifyContent="center">
                {[{
                  icon: <CarRentalIcon sx={{ fontSize: {xs:40, md:50}, color: '#334155' }} />,
                  title: 'Innovative Platform',
                  text: 'Our modern, user-friendly platform makes car sharing simple and accessible for everyone in Algeria.'
                }, {
                  icon: <PeopleIcon sx={{ fontSize: {xs:40, md:50}, color: '#334155' }} />,
                  title: 'Growing Community',
                  text: 'Be part of a new wave of car sharing enthusiasts building a more connected Algeria.'
                }, {
                  icon: <SupportAgentIcon sx={{ fontSize: {xs:40, md:50}, color: '#334155' }} />,
                  title: 'Dedicated Team',
                  text: 'Our passionate team is committed to making ConnectDZ the go-to car sharing platform in Algeria.'
                }].map((item, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index} sx={{ textAlign: 'center' }}>
                    <Paper elevation={2} sx={{p:3, borderRadius:'12px', height: '100%', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', '&:hover': {borderColor: '#64748b', boxShadow: '0 6px 12px rgba(71, 85, 105, 0.1)'}}}>
                      <Box sx={{mb: 1.5}}>{item.icon}</Box>
                      <Typography variant="h6" sx={{ color: '#334155', fontWeight: '600', mb: 1, fontSize: '1.25rem' }}>{item.title}</Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', lineHeight: 1.6, fontSize: '0.95rem' }}>{item.text}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Typography variant="body1" paragraph sx={{ color: '#475569', lineHeight: 1.8, fontSize: '1.1rem', textAlign: 'justify', mt: 4 }}>
              Founded in <strong>2025</strong>, ConnectDZ is a bold new venture in Algeria's evolving transportation landscape. While we may be new, we're driven by a clear vision: to create a more connected, sustainable future for mobility in Algeria. We're starting small but dreaming big, with plans to expand our community and services across the country. As we grow, we're committed to listening to our users and continuously improving our platform. Join us on this exciting journey as we build something truly special together - one shared ride at a time.
            </Typography>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default AboutPage;
