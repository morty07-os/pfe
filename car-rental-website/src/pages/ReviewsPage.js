import React from 'react';
import Navbar from '../components/Navbar';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Box,
  Rating,
  Divider
} from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ThumbsUpDownIcon from '@mui/icons-material/ThumbsUpDown'; // Main page icon

const reviews = [
  {
    name: 'Amina K.',
    location: 'Algiers, Algeria',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    rating: 5,
    review: '"Absolutely fantastic service! The car was clean, modern, and exactly as described. Pick-up and drop-off were incredibly smooth. Will definitely use them again for my next trip!"',
    date: 'October 26, 2023'
  },
  {
    name: 'Karim B.',
    location: 'Oran, Algeria',
    avatar: 'https://randomuser.me/api/portraits/men/43.jpg',
    rating: 4.5,
    review: '"Great selection of vehicles and competitive prices. The staff was helpful and professional. Only a slight delay during pick-up, but overall a very good experience."',
    date: 'November 12, 2023'
  },
  {
    name: 'Fatima Z.',
    location: 'Constantine, Algeria',
    avatar: 'https://randomuser.me/api/portraits/women/50.jpg',
    rating: 5,
    review: '"Seamless rental process from start to finish. The online booking was easy, and the customer support team answered all my questions promptly. Highly recommended!"',
    date: 'December 05, 2023'
  },
   {
    name: 'Youssef M.',
    location: 'Annaba, Algeria',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    rating: 4,
    review: '"Good value for money. The car was reliable and suited our family needs perfectly for a week-long trip. Would appreciate a bit more clarity on insurance options upfront."',
    date: 'January 15, 2024'
  },
];

const ReviewsPage = () => {
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
              <ThumbsUpDownIcon sx={{ fontSize: {xs: 48, md: 64}, color: '#334155', mb: 1 }} />
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
                Customer Experiences
              </Typography>
              <Typography variant="h6" sx={{ color: '#64748b', maxWidth: '750px', margin: '0 auto', lineHeight: 1.6 }}>
                Hear what our valued customers have to say about their rental experiences with us. Real stories, real satisfaction.
              </Typography>
            </Box>
            
            <Divider sx={{ my: {xs:3, md:4}, borderColor: '#cbd5e1' }} />

            <Grid container spacing={{xs: 3, md: 4}}>
              {reviews.map((review, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      borderRadius: '12px', 
                      boxShadow: '0 3px 10px rgba(71, 85, 105, 0.07)', 
                      border: '1px solid #e2e8f0',
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 6px 15px rgba(71, 85, 105, 0.1)',
                        borderColor: '#cbd5e1'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: {xs: 2, md:3}, backgroundColor: '#f8fafc' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar src={review.avatar} alt={review.name} sx={{ width: 56, height: 56, mr: 2, border: '2px solid #cbd5e1' }} />
                        <Box>
                          <Typography variant="h6" sx={{ color: '#334155', fontWeight: '600', fontSize: '1.15rem' }}>{review.name}</Typography>
                          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>{review.location}</Typography>
                           <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', mt: 0.2 }}>{review.date}</Typography>
                        </Box>
                      </Box>
                      <Rating 
                        name={`rating-${index}`} 
                        value={review.rating} 
                        precision={0.5} 
                        readOnly 
                        sx={{ mb: 1.5, color: '#2563eb' /* A blue from the palette */ }}
                        emptyIcon={<StarBorderIcon style={{ opacity: 0.7, color: '#94a3b8' }} fontSize="inherit" />}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <FormatQuoteIcon sx={{ color: '#94a3b8', transform: 'scaleX(-1)', mr: 0.5, mt: -0.5, fontSize: '1.8rem' }}/>
                        <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.7, fontStyle: 'italic', flexGrow: 1 }}>
                          {review.review.substring(1, review.review.length -1)} {/* Removing existing quotes */}
                        </Typography>
                        <FormatQuoteIcon sx={{ color: '#94a3b8', ml: 0.5, mt: 'auto', fontSize: '1.8rem' }}/>
                      </Box>
                    </CardContent>
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

export default ReviewsPage;
