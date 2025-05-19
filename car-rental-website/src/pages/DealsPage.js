import React from 'react';
import Navbar from '../components/Navbar';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Divider
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import NewReleasesIcon from '@mui/icons-material/NewReleases'; // For the main page icon
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const deals = [
  {
    id: 'weekend-getaway',
    title: 'Weekend Getaway Special',
    description: 'Enjoy 20% off on all SUV and Crossover rentals for weekend trips (Friday to Sunday). Your adventure awaits!',
    validity: 'Offer valid until December 31, 2024',
    icon: <EventAvailableIcon sx={{ fontSize: 28, color: '#334155' }} />,
    tag: 'Weekend Deal',
    buttonText: 'Book Weekend Deal',
  },
  {
    id: 'extended-journey',
    title: 'Extended Journey Discount',
    description: 'Planning a longer trip? Rent any car for 7 days or more and receive a 15% discount on your total bill.',
    validity: 'No Expiry - Ongoing Offer',
    icon: <BeachAccessIcon sx={{ fontSize: 28, color: '#334155' }} />,
    tag: 'Long Rentals',
    buttonText: 'Explore Long Rentals',
  },
  {
    id: 'business-traveler',
    title: 'Business Traveler Package',
    description: 'Corporate clients receive 10% off plus a complimentary GPS unit on all mid-size and full-size sedans.',
    validity: 'Exclusive for corporate accounts',
    icon: <BusinessCenterIcon sx={{ fontSize: 28, color: '#334155' }} />,
    tag: 'Corporate Offer',
    buttonText: 'View Business Package',
  },
  {
    id: 'early-bird',
    title: 'Early Bird Savings',
    description: 'Book your vehicle at least 30 days in advance and secure a 10% discount. Plan ahead and save more!',
    validity: 'Requires 30+ days advance booking',
    icon: <LocalOfferIcon sx={{ fontSize: 28, color: '#334155' }} />,
    tag: 'Advance Booking',
    buttonText: 'Book Early & Save',
  },
];

const DealsPage = () => {
  const navigate = useNavigate(); // Initialize navigate

  const handleDealClick = (dealId) => {
    navigate(`/deals/${dealId}`);
    console.log(`Navigating to deal with ID: ${dealId}`);
  };

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: '#f1f5f9', minHeight: 'calc(100vh - 64px)' }}>
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
              <NewReleasesIcon sx={{ fontSize: {xs: 48, md: 64}, color: '#334155', mb: 1 }} />
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
                Exclusive Offers & Deals
              </Typography>
              <Typography variant="h6" sx={{ color: '#64748b', maxWidth: '750px', margin: '0 auto', lineHeight: 1.6 }}>
                Unlock significant savings on your next car rental with our specially curated deals. Drive more for less!
              </Typography>
            </Box>
            
            <Divider sx={{ my: 4, borderColor: '#cbd5e1' }} />

            <Grid container spacing={{xs: 2, sm: 3, md: 4}}>
              {deals.map((deal, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      borderRadius: '12px', 
                      boxShadow: '0 2px 8px rgba(71, 85, 105, 0.08)',
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out', 
                      border: '1px solid #e2e8f0',
                      '&:hover': { 
                        transform: 'translateY(-6px)', 
                        boxShadow: '0 8px 20px rgba(71, 85, 105, 0.12)',
                        borderColor: '#cbd5e1'
                      } 
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: {xs:2, md:3}, backgroundColor: '#ffffff' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {deal.icon}
                        <Typography variant="h5" component="h2" sx={{ color: '#334155', fontWeight: '600', ml: 1.5, fontSize: '1.3rem' }}>
                          {deal.title}
                        </Typography>
                      </Box>
                      <Chip 
                        label={deal.tag} 
                        size="small" 
                        sx={{ 
                          mb: 2, 
                          fontWeight: '500', 
                          backgroundColor: '#475569', 
                          color: '#ffffff', 
                          fontSize: '0.8rem',
                          padding: '0 6px'
                        }} 
                      />
                      <Typography variant="body1" paragraph sx={{ color: '#475569', lineHeight: 1.7, mb: 1.5 }}>
                        {deal.description}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.85rem' }}>
                        {deal.validity}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ p: {xs:1.5, md:2}, backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'flex-end' }}>
                      <Button 
                        size="medium" 
                        variant="contained" 
                        onClick={() => handleDealClick(deal.id)} 
                        sx={{ 
                          backgroundColor: '#475569', 
                          color: '#ffffff', 
                          fontWeight: '600',
                          '&:hover': { backgroundColor: '#334155' },
                          textTransform: 'none',
                          fontSize: '0.9rem',
                          padding: '8px 16px'
                        }}
                      >
                        {deal.buttonText || 'Learn More'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default DealsPage;
