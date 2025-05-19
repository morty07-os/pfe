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
                About Our Company
              </Typography>
              <Typography variant="h6" sx={{ color: '#64748b', maxWidth: '700px', margin: '0 auto' }}>
                Your Premier Choice for Car Rentals in Algeria.
              </Typography>
            </Box>
            
            <Divider sx={{ my: 4, borderColor: '#cbd5e1' }} />

            <Typography variant="body1" paragraph sx={{ color: '#475569', lineHeight: 1.8, fontSize: '1.1rem', textAlign: 'justify', mb: 3 }}>
              Welcome to <strong>[Your Company Name]</strong>, where we are passionately dedicated to transforming your travel experiences in Algeria. We strive to provide not just a car, but a promise of a seamless, enjoyable, and memorable journey. Whether your travels are for business engagements or leisurely explorations of Algeria's vibrant cities and breathtaking landscapes, our extensive fleet is curated to cater to every conceivable need and preference.
            </Typography>
            <Typography variant="body1" paragraph sx={{ color: '#475569', lineHeight: 1.8, fontSize: '1.1rem', textAlign: 'justify', mb: 4 }}>
              Our core mission revolves around offering a superior selection of high-quality vehicles at transparent and competitive prices, all underpinned by an unwavering commitment to exceptional customer service. We champion values of transparency, steadfast reliability, and a customer-first approach in all our operations. From agile compact cars perfect for navigating bustling city streets to robust SUVs designed for family adventures into the scenic countryside, our diverse and modern fleet is meticulously maintained and regularly updated. This ensures your utmost safety, comfort, and peace of mind throughout your rental period.
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
                  title: 'Diverse Fleet',
                  text: 'A wide selection of modern, well-maintained vehicles to suit all your travel requirements.'
                }, {
                  icon: <PeopleIcon sx={{ fontSize: {xs:40, md:50}, color: '#334155' }} />,
                  title: 'Customer-Centric',
                  text: 'Dedicated to providing an unparalleled rental experience with personalized service.'
                }, {
                  icon: <SupportAgentIcon sx={{ fontSize: {xs:40, md:50}, color: '#334155' }} />,
                  title: 'Reliable Support',
                  text: 'Our team is always available to assist you, ensuring a smooth journey from start to finish.'
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
              Established in <strong>[Year]</strong>, [Your Company Name] has rapidly ascended to become a distinguished leader in the car rental industry within the region. Our enduring commitment to delivering unparalleled quality and achieving absolute customer satisfaction is the cornerstone of our philosophy and daily operations. We eagerly anticipate the opportunity to serve you, contributing to an unforgettable and enriching journey across Algeria.
            </Typography>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default AboutPage;
