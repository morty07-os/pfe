import React from 'react';
import Navbar from '../components/Navbar';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import CategoryIcon from '@mui/icons-material/Category'; // General category icon

const carCategories = [
  {
    name: 'Economy Cars',
    description: 'Fuel-efficient and easy to park. Perfect for city trips and budget-conscious travelers seeking practicality.',
    icon: <DirectionsCarIcon sx={{ fontSize: 36, color: '#334155' }} />,
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    tags: ['Budget-Friendly', 'City Driving']
  },
  {
    name: 'SUVs & 4x4s',
    description: 'Spacious and powerful. Ideal for family adventures, group travel, or exploring rugged terrains with confidence.',
    icon: <AirportShuttleIcon sx={{ fontSize: 36, color: '#334155' }} />,
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    tags: ['Family Trips', 'Off-Road Capable']
  },
  {
    name: 'Luxury & Premium',
    description: 'Experience ultimate comfort and style. Our top-of-the-line vehicles are packed with advanced features.',
    icon: <ElectricCarIcon sx={{ fontSize: 36, color: '#334155' }} />,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    tags: ['Comfort', 'High-End']
  },
  {
    name: 'Vans & Minibuses',
    description: 'Comfortable and practical. Great for larger groups or when you need significant luggage space.',
    icon: <AirportShuttleIcon sx={{ fontSize: 36, color: '#334155', transform: 'scaleX(-1)' }} />,
    image: 'https://images.unsplash.com/photo-1605152276423-d069e49956d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Better van image
    tags: ['Group Travel', 'Spacious']
  },
  {
    name: 'Motorcycles & Scooters',
    description: 'Navigate the city with ease. A quick and agile option for solo travelers or couples.',
    icon: <TwoWheelerIcon sx={{ fontSize: 36, color: '#334155' }} />,
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    tags: ['Agile', 'Urban Mobility']
  },
  {
    name: 'Convertibles',
    description: 'Enjoy the open air and scenic drives. Perfect for sunny days and memorable road trips.',
    icon: <DirectionsCarIcon sx={{ fontSize: 36, color: '#334155' }} />, // Consider a more specific icon if available
    image: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    tags: ['Open-Air', 'Stylish']
  },
];

const CategoriesPage = () => {
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
              <CategoryIcon sx={{ fontSize: {xs: 48, md: 64}, color: '#334155', mb: 1 }} />
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
                Explore Our Car Categories
              </Typography>
              <Typography variant="h6" sx={{ color: '#64748b', maxWidth: '750px', margin: '0 auto', lineHeight: 1.6 }}>
                Discover the perfect vehicle tailored to your journey. From economical city cruisers to luxurious executive cars, our diverse range meets every need.
              </Typography>
            </Box>
            
            <Grid container spacing={{xs: 2, sm: 3, md: 4}}>
              {carCategories.map((category, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
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
                    <CardMedia
                      component="img"
                      height="220"
                      image={category.image}
                      alt={category.name}
                      sx={{ borderTopLeftRadius: '11px', borderTopRightRadius: '11px' }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: {xs: 2, md:2.5}, backgroundColor: '#f8fafc' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        {category.icon}
                        <Typography variant="h5" component="h2" sx={{ color: '#334155', fontWeight: '600', ml: 1.5, fontSize: '1.35rem' }}>
                          {category.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6, mb: 2, minHeight: '60px' /* Adjust as needed */ }}>
                        {category.description}
                      </Typography>
                       <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {category.tags.map((tag, i) => (
                          <Chip 
                            key={i} 
                            label={tag} 
                            size="small" 
                            sx={{ 
                              backgroundColor: '#e2e8f0', 
                              color: '#475569', 
                              fontWeight: '500',
                              fontSize: '0.75rem'
                            }} 
                          />
                        ))}
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

export default CategoriesPage;
