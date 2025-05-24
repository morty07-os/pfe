import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  MobileStepper,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PlaceIcon from '@mui/icons-material/Place';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import Looks3Icon from '@mui/icons-material/Looks3';

const MapSection = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedCity, setSelectedCity] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  
  // All 58 wilayas of Algeria
  const wilayas = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra',
    'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret',
    'Tizi Ouzou', 'Algiers', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda',
    'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem',
    'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj',
    'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
    'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
    'Ghardaïa', 'Relizane', 'El M\'Ghair', 'El Meniaa', 'Ouled Djellal', 'Bordj Badji Mokhtar',
    'Béni Abbès', 'Timimoun', 'Touggourt', 'Djanet', 'In Salah', 'In Guezzam'
  ].sort();
  
  // Steps for the stepper
  const steps = [
    {
      label: 'Select Your City',
      description: 'Choose from any of Algeria\'s 58 wilayas to find available rental locations.',
      icon: <LooksOneIcon sx={{ fontSize: 40, color: '#475569' }} />
    },
    {
      label: 'Find Pickup Locations',
      description: 'Browse through available pickup points in your selected city.',
      icon: <LooksTwoIcon sx={{ fontSize: 40, color: '#475569' }} />
    },
    {
      label: 'Book Your Car',
      description: 'Select your preferred vehicle and complete your reservation.',
      icon: <Looks3Icon sx={{ fontSize: 40, color: '#475569' }} />
    }
  ];
  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Map functionality has been completely disabled as requested
  const handleShowMap = () => {
    // Function intentionally left empty - map functionality is disabled
    console.log('Map functionality is disabled');
    // No navigation occurs
  };

  // This would be replaced with actual map integration
  const mapImageUrl = "https://images.unsplash.com/photo-1569336415962-a4bd9f69c907?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
  


  return (
    <Box sx={{ 
      py: 10, 
      background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative elements */}
      <Box sx={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(71,85,105,0.1) 0%, rgba(71,85,105,0) 70%)',
        top: '-100px',
        right: '-100px',
        zIndex: 0
      }} />
      <Box sx={{
        position: 'absolute',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(71,85,105,0.1) 0%, rgba(71,85,105,0) 70%)',
        bottom: '-50px',
        left: '10%',
        zIndex: 0
      }} />
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8, position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              fontWeight: 800, 
              color: '#1e293b',
              mb: 3,
              position: 'relative',
              display: 'inline-block',
              '&::after': {
                content: '""',
                position: 'absolute',
                width: '60px',
                height: '4px',
                backgroundColor: '#475569',
                bottom: '-12px',
                left: 'calc(50% - 30px)',
                borderRadius: '2px'
              }
            }}
          >
            Find Cars Near You
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#64748b',
              maxWidth: '700px',
              mx: 'auto',
              mt: 4,
              fontWeight: 400,
              lineHeight: 1.6
            }}
          >
            Browse our network of car rental locations across Algeria and find the perfect vehicle for your needs
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
          {/* Left side - Map and City Selection */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={4} 
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)'
                },
                boxShadow: '0 10px 30px rgba(71, 85, 105, 0.1)'
              }}
            >
              {/* Map Header */}
              <Box sx={{ 
                background: 'linear-gradient(90deg, #475569 0%, #334155 100%)', 
                color: 'white',
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon /> 
                  {selectedCity ? `${selectedCity}, Algeria` : 'Select a City'}
                </Typography>
              </Box>
              
              {/* City Selection */}
              <Box sx={{ position: 'relative', flexGrow: 1 }}>
                
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Select a Wilaya
                  </Typography>
                    
                    <FormControl fullWidth sx={{ mb: 4 }}>
                      <InputLabel id="city-select-label">Wilaya</InputLabel>
                      <Select
                        labelId="city-select-label"
                        id="city-select"
                        value={selectedCity}
                        label="Wilaya"
                        onChange={(e) => setSelectedCity(e.target.value)}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              maxHeight: 300,
                              '&::-webkit-scrollbar': {
                                width: '8px'
                              },
                              '&::-webkit-scrollbar-thumb': {
                                backgroundColor: '#cbd5e1',
                                borderRadius: '4px'
                              }
                            }
                          }
                        }}
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#cbd5e1',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#475569',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#94a3b8',
                          },
                          '& .MuiSvgIcon-root': {
                            color: '#475569',
                          }
                        }}
                      >
                        {wilayas.map((city) => (
                          <MenuItem key={city} value={city}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationOnIcon sx={{ color: '#475569', fontSize: 20 }} />
                              <Typography>{city}</Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Button
                        variant="contained"
                        disabled={!selectedCity}
                        onClick={handleShowMap}
                        size="large"
                        startIcon={<SearchIcon />}
                        sx={{
                          bgcolor: '#475569',
                          '&:hover': {
                            bgcolor: '#334155',
                            '&::after': {
                              content: '"Unavailable"',
                              position: 'absolute',
                              top: '-40px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              color: 'white',
                              padding: '5px 10px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              whiteSpace: 'nowrap',
                              zIndex: 1000
                            }
                          },
                          '&.Mui-disabled': {
                            bgcolor: '#94a3b8',
                            color: 'white'
                          },
                          position: 'relative'
                        }}
                      >
                        Go to Map
                      </Button>
                    </Box>

                </Box>
              </Box>
            </Paper>
          </Grid>
          
          {/* Right side - Steps Slideshow */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={4} 
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)'
                },
                boxShadow: '0 10px 30px rgba(71, 85, 105, 0.1)'
              }}
            >
              <Box sx={{ 
                background: 'linear-gradient(90deg, #475569 0%, #334155 100%)', 
                color: 'white',
                p: 3
              }}>
                <Typography variant="h6">
                  How It Works
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
                flexGrow: 1
              }}>
                <Box sx={{ maxWidth: 400, width: '100%', mb: 4 }}>
                  <Card 
                    elevation={0} 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      mb: 4,
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -20,
                        left: -20,
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(71, 85, 105, 0.1)',
                        zIndex: -1
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -10,
                        right: -10,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(71, 85, 105, 0.1)',
                        zIndex: -1
                      }
                    }}>
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(71, 85, 105, 0.1)',
                      mb: 3
                    }}>
                      {steps[activeStep].icon}
                    </Box>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#1e293b' }}>
                        {steps[activeStep].label}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {steps[activeStep].description}
                      </Typography>
                    </CardContent>
                  </Card>
                  
                  <MobileStepper
                    variant="dots"
                    steps={steps.length}
                    position="static"
                    activeStep={activeStep}
                    sx={{ 
                      bgcolor: 'transparent',
                      '& .MuiMobileStepper-dot': {
                        bgcolor: '#cbd5e1',
                        width: 12,
                        height: 12,
                        mx: 0.5,
                        transition: 'all 0.3s ease'
                      },
                      '& .MuiMobileStepper-dotActive': {
                        bgcolor: '#475569',
                        width: 24
                      }
                    }}
                    nextButton={
                      <Button 
                        size="small" 
                        onClick={handleNext} 
                        disabled={activeStep === steps.length - 1}
                        sx={{ 
                          color: '#475569',
                          '&:hover': {
                            bgcolor: 'rgba(71, 85, 105, 0.1)'
                          }
                        }}
                      >
                        Next
                        <KeyboardArrowRight />
                      </Button>
                    }
                    backButton={
                      <Button 
                        size="small" 
                        onClick={handleBack} 
                        disabled={activeStep === 0}
                        sx={{ 
                          color: '#475569',
                          '&:hover': {
                            bgcolor: 'rgba(71, 85, 105, 0.1)'
                          }
                        }}
                      >
                        <KeyboardArrowLeft />
                        Back
                      </Button>
                    }
                  />
                </Box>
                
                <Box sx={{ mt: 2, width: '100%' }}>
                  <Divider sx={{ mb: 4, borderColor: 'rgba(203, 213, 225, 0.5)' }} />
                  
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, textAlign: 'center', color: '#1e293b' }}>
                    Why Choose Our Service
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {[
                      { title: 'Nationwide Coverage', desc: 'Locations in all 58 wilayas' },
                      { title: 'Flexible Pickup', desc: 'Multiple locations in each city' },
                      { title: '24/7 Availability', desc: 'Book anytime, anywhere' },
                      { title: 'Secure Parking', desc: 'All locations monitored' }
                    ].map((item, index) => (
                      <Grid item xs={6} key={index}>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          textAlign: 'center',
                          p: 2,
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: 'rgba(71, 85, 105, 0.05)',
                            transform: 'translateY(-2px)'
                          }
                        }}>
                          <Box sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(71, 85, 105, 0.1)',
                            mb: 2
                          }}>
                            <CheckCircleOutlineIcon sx={{ fontSize: 20, color: '#475569' }} />
                          </Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.desc}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        

      </Container>
    </Box>
  );
};

export default MapSection;
