import React from 'react';
import Slider from 'react-slick';
import { Box, Card, CardContent, Typography, useTheme, useMediaQuery, IconButton } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './CarTypesCarousel.css';

// Modern car illustrations with distinct characteristics for each type
const CarIllustrations = {
  // Compact city car with rounded design
  Citadine: () => (
    <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main body - rounded and compact */}
      <path d="M60 80h120v-35c0-8-4-15-10-18l-15-12H85l-15 12c-6 3-10 10-10 18v35z" fill="#546E7A"/>
      
      {/* Hood and front details */}
      <path d="M85 27l-15 12c-6 3-10 10-10 18v23h120v-23c0-8-4-15-10-18l-15-12H85z" fill="#455A64"/>
      
      {/* Wheels with detailed rims */}
      <circle cx="85" cy="80" r="18" fill="#37474F"/>
      <circle cx="85" cy="80" r="12" fill="#455A64"/>
      <circle cx="85" cy="80" r="8" fill="#90A4AE"/>
      <circle cx="155" cy="80" r="18" fill="#37474F"/>
      <circle cx="155" cy="80" r="12" fill="#455A64"/>
      <circle cx="155" cy="80" r="8" fill="#90A4AE"/>
      
      {/* Windows with modern design */}
      <path d="M90 35h60c4 0 8 3 10 6l8 12v17h-96V53l8-12c2-3 6-6 10-6z" fill="#ECEFF1"/>
      <path d="M90 35h60" stroke="#CFD8DC" strokeWidth="1"/>
      
      {/* Headlights and grille */}
      <path d="M70 55h20m60 0h20" stroke="#ECEFF1" strokeWidth="2"/>
      <path d="M75 60h10m70 0h10" stroke="#90A4AE" strokeWidth="4" strokeLinecap="round"/>
      
      {/* Additional details */}
      <path d="M85 45c5-3 15-5 35-5s30 2 35 5" stroke="#37474F" strokeWidth="1"/>
      <path d="M60 65h10m100 0h10" stroke="#37474F" strokeWidth="2"/>
    </svg>
  ),
  // Elegant sedan with sleek profile
  Sedan: () => (
    <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main body - long and elegant */}
      <path d="M40 80h160v-30l-25-25c-5-5-12-8-20-8H85c-8 0-15 3-20 8l-25 25v30z" fill="#546E7A"/>
      
      {/* Hood and trunk details */}
      <path d="M85 25c-8 0-15 3-20 8l-25 25v22h160V58l-25-25c-5-5-12-8-20-8H85z" fill="#455A64"/>
      
      {/* Wheels with luxury rims */}
      <circle cx="75" cy="80" r="18" fill="#37474F"/>
      <circle cx="75" cy="80" r="12" fill="#455A64"/>
      <circle cx="75" cy="80" r="8" fill="#90A4AE"/>
      <circle cx="165" cy="80" r="18" fill="#37474F"/>
      <circle cx="165" cy="80" r="12" fill="#455A64"/>
      <circle cx="165" cy="80" r="8" fill="#90A4AE"/>
      
      {/* Windows with premium look */}
      <path d="M85 35h70c6 0 12 2 15 5l20 15v15H50V55l20-15c3-3 9-5 15-5z" fill="#ECEFF1"/>
      <line x1="85" y1="35" x2="155" y2="35" stroke="#CFD8DC" strokeWidth="1"/>
      
      {/* Chrome details and grille */}
      <path d="M45 60h25m100 0h25" stroke="#ECEFF1" strokeWidth="3"/>
      <path d="M50 65h15m110 0h15" stroke="#90A4AE" strokeWidth="4" strokeLinecap="round"/>
      
      {/* Body lines and trim */}
      <path d="M40 55h160" stroke="#37474F" strokeWidth="0.5"/>
      <path d="M85 30c10-2 30-2 70 0" stroke="#37474F" strokeWidth="1"/>
    </svg>
  ),
  // Robust SUV with high stance
  SUV: () => (
    <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main body - tall and muscular */}
      <path d="M45 80h150v-45l-20-20H65l-20 20v45z" fill="#546E7A"/>
      
      {/* Hood and roof details */}
      <path d="M65 15l-20 20v45h150V35l-20-20H65z" fill="#455A64"/>
      
      {/* Large wheels for off-road */}
      <circle cx="85" cy="80" r="20" fill="#37474F"/>
      <circle cx="85" cy="80" r="14" fill="#455A64"/>
      <circle cx="85" cy="80" r="8" fill="#90A4AE"/>
      <circle cx="155" cy="80" r="20" fill="#37474F"/>
      <circle cx="155" cy="80" r="14" fill="#455A64"/>
      <circle cx="155" cy="80" r="8" fill="#90A4AE"/>
      
      {/* Large windows */}
      <path d="M70 25h100v35H70z" fill="#ECEFF1"/>
      <path d="M70 42h100" stroke="#CFD8DC" strokeWidth="1"/>
      
      {/* Rugged details */}
      <path d="M45 55h30m90 0h30" stroke="#ECEFF1" strokeWidth="4"/>
      <path d="M50 60h20m100 0h20" stroke="#90A4AE" strokeWidth="6" strokeLinecap="round"/>
      
      {/* Roof rails and body cladding */}
      <path d="M75 20h90" stroke="#37474F" strokeWidth="3"/>
      <path d="M45 70h150" stroke="#37474F" strokeWidth="1"/>
      <path d="M70 25v-5m100 0v5" stroke="#37474F" strokeWidth="2"/>
    </svg>
  ),
  // Spacious van with modern front
  Van: () => (
    <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main body - tall and long */}
      <path d="M35 80h170V25H35v55z" fill="#546E7A"/>
      
      {/* Front cabin and cargo area */}
      <path d="M35 25h170v55h-15V35H50v45H35V25z" fill="#455A64"/>
      
      {/* Heavy-duty wheels */}
      <circle cx="65" cy="80" r="18" fill="#37474F"/>
      <circle cx="65" cy="80" r="12" fill="#455A64"/>
      <circle cx="65" cy="80" r="8" fill="#90A4AE"/>
      <circle cx="175" cy="80" r="18" fill="#37474F"/>
      <circle cx="175" cy="80" r="12" fill="#455A64"/>
      <circle cx="175" cy="80" r="8" fill="#90A4AE"/>
      
      {/* Windows and sliding door */}
      <path d="M45 35h50v25H45z" fill="#ECEFF1"/>
      <path d="M105 40h40v20h-40z" fill="#ECEFF1"/>
      <path d="M155 40h40v20h-40z" fill="#ECEFF1"/>
      <path d="M95 50h10" stroke="#90A4AE" strokeWidth="2"/>
      
      {/* Modern front design */}
      <path d="M35 55h30m110 0h30" stroke="#ECEFF1" strokeWidth="3"/>
      <path d="M40 60h20m120 0h20" stroke="#90A4AE" strokeWidth="4" strokeLinecap="round"/>
      
      {/* Body lines and details */}
      <path d="M35 45h170" stroke="#37474F" strokeWidth="0.5"/>
      <path d="M105 40v20m50-20v20" stroke="#37474F" strokeWidth="0.5"/>
    </svg>
  ),
  // Practical station wagon with extended roof
  StationWagon: () => (
    <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main body - long roof line */}
      <path d="M45 80h150v-35l-15-25H65l-20 25v35z" fill="#546E7A"/>
      
      {/* Extended roof and rear */}
      <path d="M65 20l-20 25v35h150V45l-15-25H65z" fill="#455A64"/>
      
      {/* Wheels with practical design */}
      <circle cx="85" cy="80" r="18" fill="#37474F"/>
      <circle cx="85" cy="80" r="12" fill="#455A64"/>
      <circle cx="85" cy="80" r="8" fill="#90A4AE"/>
      <circle cx="155" cy="80" r="18" fill="#37474F"/>
      <circle cx="155" cy="80" r="12" fill="#455A64"/>
      <circle cx="155" cy="80" r="8" fill="#90A4AE"/>
      
      {/* Extended windows */}
      <path d="M70 30h100v25H70z" fill="#ECEFF1"/>
      <path d="M70 42h100" stroke="#CFD8DC" strokeWidth="1"/>
      
      {/* Front design */}
      <path d="M45 55h30m90 0h30" stroke="#ECEFF1" strokeWidth="3"/>
      <path d="M50 60h20m100 0h20" stroke="#90A4AE" strokeWidth="4" strokeLinecap="round"/>
      
      {/* Roof rails and body lines */}
      <path d="M75 25h90" stroke="#37474F" strokeWidth="2"/>
      <path d="M45 70h150" stroke="#37474F" strokeWidth="1"/>
      <path d="M170 30l15 15" stroke="#37474F" strokeWidth="1"/>
      <path d="M70 30v-5h100v5" stroke="#37474F" strokeWidth="1"/>
    </svg>
  )
};

const carTypes = [
  {
    type: "Citadine",
    advantage: "Perfect for city driving",
    price: "DZD 3,500-4,500/day",
    specs: "3-5 seats • 2 small bags",
  },
  {
    type: "Sedan",
    advantage: "Comfortable for long trips",
    price: "DZD 5,000-6,500/day",
    specs: "5 seats • 2 large bags",
  },
  {
    type: "SUV",
    advantage: "Versatile for families and adventure",
    price: "DZD 7,000-9,000/day",
    specs: "5-7 seats • 3 large bags",
  },
  {
    type: "Van",
    advantage: "Ideal for large groups and cargo",
    price: "DZD 8,000-10,000/day",
    specs: "8-12 seats • 6 large bags",
  },
  {
    type: "StationWagon",
    advantage: "Great balance of space and comfort",
    price: "DZD 6,000-7,500/day",
    specs: "5 seats • 4 large bags",
  },
];

const NextArrow = ({ onClick }) => (
  <IconButton
    onClick={onClick}
    sx={{
      position: 'absolute',
      right: -20,
      top: '50%',
      transform: 'translateY(-50%)',
      bgcolor: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      '&:hover': {
        bgcolor: 'white',
      }
    }}
  >
    <ArrowForwardIosIcon />
  </IconButton>
);

const PrevArrow = ({ onClick }) => (
  <IconButton
    onClick={onClick}
    sx={{
      position: 'absolute',
      left: -20,
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 1,
      bgcolor: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      '&:hover': {
        bgcolor: 'white',
      }
    }}
  >
    <ArrowBackIosNewIcon />
  </IconButton>
);

function CarTypesCarousel({ onFilterChange }) {  // Add onFilterChange prop
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: isMobile ? 1 : 3,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  return (
    <Box
      sx={{
        py: 4,
        px: { xs: 2, md: 6 },
        backgroundColor: 'transparent'
      }}
    >
      <Box sx={{ maxWidth: '1200px', mx: 'auto', position: 'relative' }}>
        <Box sx={{ '.slick-track': { display: 'flex', '& .slick-slide': { height: 'auto', '& > div': { height: '100%' } } } }}>
        <Slider {...settings}>
          {carTypes.map((car, index) => (
            <Box key={car.type} sx={{ p: 2, height: '100%' }}>
              <Card
                elevation={2}
                onClick={() => onFilterChange({ carType: car.type.toUpperCase() })}  // Changed this line
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: (theme) => theme.shadows[8],
                    '& .car-illustration': {
                      transform: 'scale(1.05)'
                    }
                  },
                  backgroundColor: '#ffffff',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    bgcolor: '#f8fafc',
                    pt: 3,
                    pb: 2,
                    px: 3,
                    height: '180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid #e2e8f0'
                  }}
                >
                  <Box
                    className="car-illustration"
                    sx={{
                      transition: 'transform 0.3s ease',
                      transform: 'scale(1)',
                      '& svg': {
                        width: '100%',
                        height: '120px',
                        maxWidth: '220px'
                      }
                    }}
                  >
                    {CarIllustrations[car.type]()}
                  </Box>
                </Box>

                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2.5,
                    height: '220px',
                    gap: 1.5
                  }}
                >
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        color: '#1a202c',
                        mb: 0.75,
                        fontSize: '1.25rem',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {car.type}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#4a5568',
                        mb: 1.5,
                        fontStyle: 'italic',
                        height: '48px',
                        lineHeight: 1.5,
                        fontSize: '0.95rem'
                      }}
                    >
                      {car.advantage}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: '#718096',
                        mb: 1
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <Typography variant="body2">{car.specs}</Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      mt: 'auto',
                      pt: 2,
                      borderTop: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#2d3748'
                      }}
                    >
                      {car.price}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#718096'
                      }}
                    >
                      per day
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Slider>
        </Box>
      </Box>
    </Box>
  );
}

export default CarTypesCarousel;
