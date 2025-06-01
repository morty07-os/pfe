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
  
  // Limited list of available wilayas
  const wilayas = [
    'Annaba', 'Alger', 'Oran', 'Setif', 'Constantine', 'Bejaia'
  ].sort();
  
  // Steps for the stepper
  const steps = [
    {
      label: 'Select Your City',
      description: 'Choose from our available cities: Annaba, Alger, Oran, Setif, Constantine, and Bejaia.',
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
  
  // Navigate to map page with selected wilaya
  const handleShowMap = () => {
    if (!selectedCity) return;
    
    // Navigate to map page with the selected wilaya as a parameter
    navigate(`/map?wilaya=${selectedCity}`);
  };

  // This would be replaced with actual map integration
  const mapImageUrl = "https://images.unsplash.com/photo-1569336415962-a4bd9f69c907?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
  


  return (
    <Box sx={{ 
      pt: 0,
      pb: 6, 
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
        <Box sx={{ textAlign: 'center', mb: 2, position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              fontWeight: 800, 
              color: '#1e293b',
              mb: 1.5,
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

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, position: 'relative', zIndex: 1, mt: -1 }}>
          {/* Left side - Map */}
          <Box sx={{ flex: '0 0 20%', minWidth: 0 }}>
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
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 700, letterSpacing: '0.5px', fontSize: '0.95rem', py: 0.5 }}>
                  <LocationOnIcon sx={{ fontSize: '1rem' }} /> 
                  {selectedCity ? `${selectedCity}` : 'Map'}
                </Typography>
              </Box>
              
              {/* City Selection */}
              <Box sx={{ position: 'relative', flexGrow: 1 }}>
                <Box sx={{ 
                  px: { xs: 1, sm: 1.5 },
                  pb: { xs: 1, sm: 1.5 },
                  pt: 10,
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%', 
                  justifyContent: 'flex-start', 
                  alignItems: 'center', 
                  backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(203, 213, 225, 0.15) 0%, transparent 70%)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, transparent, rgba(71, 85, 105, 0.1), transparent)'
                  }
                }}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 700, fontSize: '0.9rem', color: '#334155', textAlign: 'center', letterSpacing: '0.5px', mt: 0, position: 'relative', display: 'inline-block',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: '25px',
                      height: '2px',
                      backgroundColor: '#475569',
                      bottom: '-3px',
                      left: 'calc(50% - 12.5px)'
                    } }}>
                    Select a Wilaya
                  </Typography>
                    
                  <FormControl fullWidth sx={{ mb: 1, mt: 0, maxWidth: '150px' }}>
                    <InputLabel id="city-select-label">Wilaya</InputLabel>
                    <Select
                      labelId="city-select-label"
                      id="city-select"
                      value={selectedCity}
                      label="Wilaya"
                      onChange={(e) => setSelectedCity(e.target.value)}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, maxWidth: '110px', overflow: 'hidden' }}>
                          <LocationOnIcon sx={{ color: '#475569', fontSize: 20, flexShrink: 0 }} />
                          <Typography noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{selected}</Typography>
                        </Box>
                      )}
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
                        },
                        width: '150px !important',
                        minWidth: '150px !important',
                        maxWidth: '150px !important',
                        '& .MuiSelect-select': {
                          width: '100%',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        },
                        '& .MuiSelect-root': {
                          width: '150px !important',
                          maxWidth: '150px !important'
                        }
                      }}
                    >
                      {wilayas.map((city) => (
                        <MenuItem key={city} value={city}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, maxWidth: '110px', overflow: 'hidden' }}>
                            <LocationOnIcon sx={{ color: '#475569', fontSize: 20, flexShrink: 0 }} />
                            <Typography noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{city}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.5, width: '100%', position: 'relative' }}>
                    <Button
                      variant="contained"
                      disabled={!selectedCity}
                      onClick={handleShowMap}
                      size="small"
                      startIcon={<SearchIcon />}
                      sx={{
                        bgcolor: '#475569',
                        '&:hover': {
                          bgcolor: '#334155',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          transform: 'translateY(-2px)'
                        },
                        '&.Mui-disabled': {
                          bgcolor: '#94a3b8',
                          color: 'white'
                        },
                        position: 'relative',
                        borderRadius: '8px',
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                        letterSpacing: '0.5px',
                        boxShadow: '0 3px 6px rgba(0, 0, 0, 0.08)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      View Map
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Right side - How It Works */}
          <Box sx={{ flex: '0 0 80%', minWidth: 0, pr: { md: 4 } }}>
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
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
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
                p: { xs: 2, sm: 3 },
                flexGrow: 1
              }}>
                <Box sx={{ maxWidth: 400, width: '100%', mb: { xs: 2, sm: 4 } }}>
                  <Card 
                    elevation={0} 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      mb: { xs: 2, sm: 4 },
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
                      width: { xs: 60, sm: 80 },
                      height: { xs: 60, sm: 80 },
                      borderRadius: '50%',
                      backgroundColor: 'rgba(71, 85, 105, 0.1)',
                      mb: { xs: 1, sm: 2 }
                    }}>
                      {steps[activeStep].icon}
                    </Box>
                    <CardContent sx={{ textAlign: 'center', p: { xs: 1, sm: 2 } }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#1e293b', fontSize: { xs: '1.1rem', sm: '1.3rem' } }}>
                        {steps[activeStep].label}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
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
                
                <Box sx={{ mt: { xs: 1, sm: 2 }, width: '100%' }}>
                  <Divider sx={{ mb: { xs: 2, sm: 4 }, borderColor: 'rgba(203, 213, 225, 0.5)' }} />
                  
                  <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 }, fontWeight: 700, textAlign: 'center', color: '#1e293b', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    Why Choose Our Service
                  </Typography>
                  
                  <Grid container spacing={1} justifyContent="center">
                    {[
                      { title: 'Select Cities Coverage', desc: 'Service in 6 major cities' },
                      { title: 'Flexible Pickup', desc: 'Multiple locations in each city' },
                      { title: '24/7 Availability', desc: 'Book anytime, anywhere' },
                      { title: 'Secure Parking', desc: 'All locations monitored' }
                    ].map((item, index) => (
                      <Grid item xs={6} md={3} key={index}>
                        <Box sx={{ 
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          p: { xs: 0.5, sm: 1 },
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
                            width: { xs: 24, sm: 32 },
                            height: { xs: 24, sm: 32 },
                            borderRadius: '50%',
                            backgroundColor: 'rgba(71, 85, 105, 0.1)',
                            mb: { xs: 0.5, sm: 1 }
                          }}>
                            <CheckCircleOutlineIcon sx={{ fontSize: { xs: 16, sm: 20 }, color: '#475569' }} />
                          </Box>
                          <Typography variant="body1" sx={{ mb: 2, color: '#64748b', fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                            {item.desc}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
        

      </Container>
    </Box>
  );
};

export default MapSection;
