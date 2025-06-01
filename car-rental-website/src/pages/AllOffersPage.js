import React, { useEffect, useState, useContext, useRef } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import QuickSearch from '../components/QuickSearch';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Paper,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Avatar,
  Pagination,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SettingsIcon from '@mui/icons-material/Settings';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import TuneIcon from '@mui/icons-material/Tune';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PersonIcon from '@mui/icons-material/Person';
import { useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import SidebarFilters from './SidebarFilters';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Algeria wilaya coordinates for map display
const algeriaWilayaCoordinates = {
  'Annaba': { lat: 36.9142, lng: 7.7427 },
  'Alger': { lat: 36.7538, lng: 3.0588 },
  'Oran': { lat: 35.6969, lng: -0.6331 },
  'Setif': { lat: 36.1898, lng: 5.4108 },
  'Constantine': { lat: 36.3650, lng: 6.6147 },
  'Bejaia': { lat: 36.7515, lng: 5.0557 }
};

// Popular locations within wilayas
const popularLocations = {
  'Alger': [
    { name: 'Bab Ezzouar', address: 'Bab Ezzouar, Alger', lat: 36.7236, lng: 3.1813 },
    { name: 'Hydra', address: 'Hydra, Alger', lat: 36.7473, lng: 3.0461 },
    { name: 'Bab El Oued', address: 'Bab El Oued, Alger', lat: 36.7953, lng: 3.0562 },
    { name: 'Kouba', address: 'Kouba, Alger', lat: 36.7236, lng: 3.0897 },
    { name: 'Hussein Dey', address: 'Hussein Dey, Alger', lat: 36.7432, lng: 3.1092 }
  ],
  'Oran': [
    { name: 'Bir El Djir', address: 'Bir El Djir, Oran', lat: 35.7153, lng: -0.5716 },
    { name: 'Es Senia', address: 'Es Senia, Oran', lat: 35.6500, lng: -0.6167 },
    { name: 'Arzew', address: 'Arzew, Oran', lat: 35.8561, lng: -0.3150 },
    { name: 'Aïn El Turk', address: 'Aïn El Turk, Oran', lat: 35.7439, lng: -0.7683 },
    { name: 'Mers El Kébir', address: 'Mers El Kébir, Oran', lat: 35.7333, lng: -0.7083 }
  ],
  'Constantine': [
    { name: 'El Khroub', address: 'El Khroub, Constantine', lat: 36.2639, lng: 6.6936 },
    { name: 'Hamma Bouziane', address: 'Hamma Bouziane, Constantine', lat: 36.4125, lng: 6.5992 },
    { name: 'Didouche Mourad', address: 'Didouche Mourad, Constantine', lat: 36.4522, lng: 6.6367 },
    { name: 'Zighoud Youcef', address: 'Zighoud Youcef, Constantine', lat: 36.5333, lng: 6.7167 },
    { name: 'Ibn Ziad', address: 'Ibn Ziad, Constantine', lat: 36.3667, lng: 6.4333 }
  ],
  'Annaba': [
    { name: 'El Bouni', address: 'El Bouni, Annaba', lat: 36.8667, lng: 7.7333 },
    { name: 'Sidi Amar', address: 'Sidi Amar, Annaba', lat: 36.8000, lng: 7.7167 },
    { name: 'El Hadjar', address: 'El Hadjar, Annaba', lat: 36.8000, lng: 7.7333 },
    { name: 'Berrahal', address: 'Berrahal, Annaba', lat: 36.8333, lng: 7.4500 },
    { name: 'Seraïdi', address: 'Seraïdi, Annaba', lat: 36.9167, lng: 7.6667 }
  ],
  'Setif': [
    { name: 'Ain El Kebira', address: 'Ain El Kebira, Setif', lat: 36.3689, lng: 5.5042 },
    { name: 'El Eulma', address: 'El Eulma, Setif', lat: 36.1528, lng: 5.6911 },
    { name: 'Ain Arnat', address: 'Ain Arnat, Setif', lat: 36.1917, lng: 5.3083 },
    { name: 'Ain Oulmene', address: 'Ain Oulmene, Setif', lat: 35.9214, lng: 5.2939 },
    { name: 'Bougaa', address: 'Bougaa, Setif', lat: 36.3328, lng: 5.0886 }
  ],
  'Bejaia': [
    { name: 'Akbou', address: 'Akbou, Bejaia', lat: 36.4575, lng: 4.5403 },
    { name: 'Souk El Tenine', address: 'Souk El Tenine, Bejaia', lat: 36.6167, lng: 5.3500 },
    { name: 'Tazmalt', address: 'Tazmalt, Bejaia', lat: 36.3833, lng: 4.4000 },
    { name: 'Amizour', address: 'Amizour, Bejaia', lat: 36.6400, lng: 4.9000 },
    { name: 'Sidi Aich', address: 'Sidi Aich, Bejaia', lat: 36.6131, lng: 4.6925 }
  ]
};

// Car features for displaying in offer cards
const carFeatures = [
  { id: 'airConditioning', label: 'Air Conditioning' },
  { id: 'bluetooth', label: 'Bluetooth' },
  { id: 'cruiseControl', label: 'Cruise Control' },
  { id: 'parkingSensors', label: 'Parking Sensors' },
  { id: 'reverseCam', label: 'Reverse Camera' },
  { id: 'usb', label: 'USB Port' },
  { id: 'auxInput', label: 'AUX Input' },
  { id: 'leatherSeats', label: 'Leather Seats' },
  { id: 'heatedSeats', label: 'Heated Seats' },
  { id: 'sunroof', label: 'Sunroof' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'keylessEntry', label: 'Keyless Entry' },
  { id: 'alloyWheels', label: 'Alloy Wheels' },
  { id: 'childSeat', label: 'Child Seat' },
  { id: 'airbags', label: 'Airbags' }
];

function formatDateDMY(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
}

export default function AllOffersPage() {
  const [search, setSearch] = React.useState('');
  const [sidebarFilters, setSidebarFilters] = React.useState({});
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Reference for scrolling to top of offers
  const offersTopRef = useRef(null);
  const [offers, setOffers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // Added for current user
  const [userCars, setUserCars] = useState([]); // Added to store user's cars
  const locationObj = useLocation();

  useEffect(() => {
    // Attempt to get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Ensure user ID is stored as a string
        if (user._id) {
          user._id = user._id.toString();
        }
        setCurrentUser(user);
        fetchUserCars(); // Fetch user's cars when user is loaded
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        setCurrentUser(null);
      }
    }
  }, []);

  const fetchUserCars = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';
      const response = await fetch(`${apiUrl}/api/cars/user-cars`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) setUserCars(data);
      else console.error(data.error || 'Failed to fetch user cars');
    } catch (error) {
      console.error('Error fetching user cars:', error.message);
    }
  };

  // Extract parameters from query parameters
  const queryParams = React.useMemo(() => new URLSearchParams(locationObj.search), [locationObj.search]);
  const categoryFilter = queryParams.get('category');
  const startDate = queryParams.get('startDate');
  const endDate = queryParams.get('endDate');
  const wilayaParam = queryParams.get('wilaya');

  // Initialize filters from URL parameters
  useEffect(() => {
    const newFilters = { ...sidebarFilters };
    
    // Set availability dates if they exist in URL
    if (startDate) {
      newFilters.availableFrom = startDate;
    }
    
    if (endDate) {
      newFilters.availableTo = endDate;
    }
    
    // Set wilaya if it exists in URL
    if (wilayaParam) {
      newFilters.wilaya = wilayaParam;
    }
    
    // Only update if we have new filters to add
    if (startDate || endDate || wilayaParam) {
      setSidebarFilters(newFilters);
    }
  }, [locationObj.search]); // Only run when URL changes

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const queryParams = new URLSearchParams({
          brand: sidebarFilters.brand || '',
          energy: sidebarFilters.energy || '',
          transmission: sidebarFilters.transmission || '',
          wilaya: sidebarFilters.wilaya || '',
          carType: sidebarFilters.carType || '',
          seats: sidebarFilters.seats || '',
          doors: sidebarFilters.doors || '',
          priceMin: sidebarFilters.priceRange ? sidebarFilters.priceRange[0] : '',
          priceMax: sidebarFilters.priceRange ? sidebarFilters.priceRange[1] : '',
          availableFrom: sidebarFilters.availableFrom || '',
          availableTo: sidebarFilters.availableTo || '',
          search: search || '',
        }).toString();
        const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';
        const response = await fetch(`${apiUrl}/api/cars/getcars?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch offers');
        const data = await response.json();
        console.log('Fetched car data:', data);

        const enhancedData = data.map(car => {
          const wilaya = car.wilaya || 'Alger'; // Default to Alger if no wilaya specified

          // Get coordinates for the wilaya
          const wilayaCoords = algeriaWilayaCoordinates[wilaya] || algeriaWilayaCoordinates['Alger'];

          // Check if we have popular locations for this wilaya
          let locationData;
          if (popularLocations[wilaya]) {
            // Pick a random popular location from this wilaya
            const randomIndex = Math.floor(Math.random() * popularLocations[wilaya].length);
            locationData = popularLocations[wilaya][randomIndex];
          } else {
            // Create a generic location based on wilaya coordinates
            // Add small random offset to avoid all cars in same wilaya having identical coordinates
            const latOffset = (Math.random() - 0.5) * 0.05;
            const lngOffset = (Math.random() - 0.5) * 0.05;
            locationData = {
              name: `${wilaya} Center`,
              address: `${wilaya}, Algeria`,
              lat: wilayaCoords.lat + latOffset,
              lng: wilayaCoords.lng + lngOffset
            };
          }

          // Add random features if not present
          const features = car.features || {
            airConditioning: Math.random() > 0.4,
            bluetooth: Math.random() > 0.5,
            cruiseControl: Math.random() > 0.6,
            parkingSensors: Math.random() > 0.5,
            reverseCam: Math.random() > 0.6,
            usb: Math.random() > 0.3,
            navigation: Math.random() > 0.7,
            sunroof: Math.random() > 0.8,
            leatherSeats: Math.random() > 0.6,
            heatedSeats: Math.random() > 0.7,
            keylessEntry: Math.random() > 0.6,
            alloyWheels: Math.random() > 0.5
          };

          return {
            ...car,
            features,
            location: car.location || locationData,
          };
        });

        setOffers(enhancedData);
        console.log('Enhanced car data with features and locations:', enhancedData);
      } catch (error) {
        console.error('Error fetching offers:', error.message);
      }
    };
    fetchOffers();

    // Add event listener for car removal
    const handleCarRemoved = (event) => {
      console.log('Car removed event received:', event.detail.carId);
      fetchOffers(); // Re-fetch offers when a car is removed
    };

    window.addEventListener('carRemoved', handleCarRemoved);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('carRemoved', handleCarRemoved);
    };
  }, [sidebarFilters, search]);

  const filteredOffers = React.useMemo(() => {
    let tempOffers = [...offers];

    // Filter out cars without an owner
    tempOffers = tempOffers.filter(offer => offer.owner);

    // Apply category filter from URL query param first
    if (categoryFilter) {
      tempOffers = tempOffers.filter(offer =>
        offer.category && offer.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Apply search term filter (now handled by backend, but keep as fallback)
    if (search) {
      tempOffers = tempOffers.filter(offer =>
        offer.brand?.toLowerCase().includes(search.toLowerCase()) ||
        offer.carName?.toLowerCase().includes(search.toLowerCase()) ||
        offer.description?.toLowerCase().includes(search.toLowerCase()) ||
        offer.wilaya?.toLowerCase().includes(search.toLowerCase()) ||
        offer.carType?.toLowerCase().includes(search.toLowerCase()) ||
        offer.engine?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply sidebar filters
    tempOffers = tempOffers.filter(offer => {
      // Basic filters
      const basicFiltersMatch = 
        (!sidebarFilters.brand || offer.brand === sidebarFilters.brand) &&
        (!sidebarFilters.energy || offer.energy === sidebarFilters.energy) &&
        (!sidebarFilters.transmission || offer.transmission === sidebarFilters.transmission) &&
        (!sidebarFilters.wilaya || (offer.wilaya && offer.wilaya.toLowerCase() === sidebarFilters.wilaya.toLowerCase())) &&
        (!sidebarFilters.carType || offer.carType === sidebarFilters.carType) &&
        (!sidebarFilters.seatsRange || (Number(offer.seats) >= sidebarFilters.seatsRange[0] && Number(offer.seats) <= sidebarFilters.seatsRange[1])) &&
        (!sidebarFilters.doorsRange || (Number(offer.doors) >= sidebarFilters.doorsRange[0] && Number(offer.doors) <= sidebarFilters.doorsRange[1])) &&
        (!sidebarFilters.priceRange || (offer.price >= sidebarFilters.priceRange[0] && offer.price <= sidebarFilters.priceRange[1]));
      
      // Availability filter
      let availabilityMatch = true;
      if (sidebarFilters.availableFrom || sidebarFilters.availableTo) {
        // Get car availability dates
        const carFrom = offer.availabilityStart || offer.availableFrom;
        const carTo = offer.availabilityEnd || offer.availableTo;
        
        // Check if car is available during the selected period
        availabilityMatch = isDateRangeOverlap(
          carFrom, 
          carTo, 
          sidebarFilters.availableFrom, 
          sidebarFilters.availableTo
        );
      }
      
      return basicFiltersMatch && availabilityMatch;
    });

    return tempOffers;
  }, [offers, search, sidebarFilters, categoryFilter]);

  function isDateRangeOverlap(offerFrom, offerTo, selectedFrom, selectedTo) {
    // If car doesn't have availability dates, it can't match
    if (!offerFrom || !offerTo) return false;
    
    // If no filter dates are provided, consider it a match
    if (!selectedFrom && !selectedTo) return true;
    
    const offerStart = dayjs(offerFrom);
    const offerEnd = dayjs(offerTo);
    
    // Handle cases where only one date is provided
    if (selectedFrom && !selectedTo) {
      // Car must be available on or after the selected start date
      return offerEnd.isAfter(dayjs(selectedFrom)) || offerEnd.isSame(dayjs(selectedFrom), 'day');
    }
    
    if (!selectedFrom && selectedTo) {
      // Car must be available on or before the selected end date
      return offerStart.isBefore(dayjs(selectedTo)) || offerStart.isSame(dayjs(selectedTo), 'day');
    }
    
    // Both dates provided - check for overlap
    const selStart = dayjs(selectedFrom);
    const selEnd = dayjs(selectedTo);
    
    // Check if the ranges overlap:
    // Car starts before or on filter end AND car ends after or on filter start
    return (offerStart.isBefore(selEnd) || offerStart.isSame(selEnd, 'day')) && 
           (offerEnd.isAfter(selStart) || offerEnd.isSame(selStart, 'day'));
  }

  const getFilterLabel = (key) => {
    const labels = {
      brand: 'Brand',
      energy: 'Energy',
      transmission: 'Transmission',
      wilaya: 'Location',
      carType: 'Car Type',
      seats: 'Seats',
      doors: 'Doors',
      priceRange: 'Price',
      availableFrom: 'From',
      availableTo: 'To'
    };
    return labels[key] || key;
  };

  const getFilterDisplayValue = (key, value) => {
    if (key === 'priceRange') {
      return `€${value[0]} - €${value[1]}`;
    } else if (key === 'availableFrom' || key === 'availableTo') {
      return dayjs(value).format('DD/MM/YYYY');
    }
    return value;
  };

  const getFilterIcon = (key) => {
    switch (key) {
      case 'brand':
        return <BrandingWatermarkIcon fontSize="small" />;
      case 'energy':
        return <LocalGasStationIcon fontSize="small" />;
      case 'transmission':
        return <SettingsIcon fontSize="small" />;
      case 'wilaya':
        return <LocationOnIcon fontSize="small" />;
      case 'carType':
        return <DirectionsCarIcon fontSize="small" />;
      case 'seats':
        return <AirlineSeatReclineNormalIcon fontSize="small" />;
      case 'doors':
        return <MeetingRoomIcon fontSize="small" />;
      case 'priceRange':
        return <AttachMoneyIcon fontSize="small" />;
      case 'availableFrom':
      case 'availableTo':
        return <CalendarMonthIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const handleRemoveFilter = (filterName) => {
    const newFilters = { ...sidebarFilters };
    delete newFilters[filterName];
    setSidebarFilters(newFilters);
  };

  const handleClearAllFilters = () => {
    setSidebarFilters({});
  };

  const getActiveFilterCount = () => {
    return Object.keys(sidebarFilters).filter((key) => {
      if (key === 'priceRange') {
        return sidebarFilters[key] && (sidebarFilters[key][0] > 0 || sidebarFilters[key][1] < 200);
      }
      return sidebarFilters[key] && sidebarFilters[key] !== '';
    }).length;
  };

  const activeFilterCount = getActiveFilterCount();
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <React.Fragment>
      <Navbar sx={{ backgroundColor: '#111', color: '#fff' }} iconColor="#fff" />
      <Box sx={{
        position: 'relative',
        p: 0,
        pt: 0,
        mx: 0,
        px: 0,
        width: '100%',
        boxSizing: 'border-box',
        bgcolor: '#f8fafc',
        minHeight: '100vh'
      }}>
        <Box sx={{ 
          position: 'relative', 
          top: -20, 
          zIndex: 1100,
          width: '100%',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <QuickSearch 
            noBackground 
            onFilterChange={(newFilters) => {
              // Merge with existing filters
              setSidebarFilters(prevFilters => ({
                ...prevFilters,
                ...newFilters
              }));
            }}
            sx={{ 
              mt: 0, 
              mb: 2,
              bgcolor: 'none', 
              background: 'none',
              maxWidth: '1200px',
              width: '100%',
              mx: 'auto',
              transform: 'translateY(-15px)',
              position: 'relative',
              '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '16px',
              boxShadow: [
                '0 10px 15px -3px rgba(15, 23, 42, 0.08)',
                '0 4px 6px -2px rgba(15, 23, 42, 0.05)',
                '0 25px 50px -12px rgba(15, 23, 42, 0.25)'
              ].join(', '),
              zIndex: -1
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 6,
              left: '5%',
              right: '5%',
              bottom: 0,
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.18)',
              filter: 'blur(10px)',
              zIndex: -2
            }
          }} />
        </Box>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 3, md: 3 },
          px: { xs: 2, md: 4 },
          pt: 2,
          pb: 6
        }}>
          <Box sx={{
            display: { xs: 'flex', md: 'none' },
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000
          }}>
            <Button
              variant="contained"
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              startIcon={<SettingsIcon />}
              sx={{
                bgcolor: '#455a64',
                borderRadius: '50px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                px: 2,
                py: 1.2,
                '&:hover': {
                  bgcolor: '#37474f'
                }
              }}
            >
              Filters
              {Object.keys(sidebarFilters).filter(
                (key) =>
                  sidebarFilters[key] &&
                  !(key === 'priceRange' && sidebarFilters[key][0] === 0 && sidebarFilters[key][1] === 200)
              ).length > 0 && (
                <Box sx={{
                  ml: 1,
                  bgcolor: 'white',
                  color: '#455a64',
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 700
                }}>
                  {Object.keys(sidebarFilters).filter(
                    (key) =>
                      sidebarFilters[key] &&
                      !(key === 'priceRange' && sidebarFilters[key][0] === 0 && sidebarFilters[key][1] === 200)
                  ).length}
                </Box>
              )}
            </Button>
          </Box>
          <Box sx={{
            width: { xs: '100%', md: 280 },
            flexShrink: 0,
            position: { md: 'sticky' },
            top: 20,
            alignSelf: 'flex-start',
            height: 'fit-content',
            mb: { xs: 3, md: 0 },
            zIndex: 10,
            display: { xs: showMobileSidebar ? 'block' : 'none', md: 'block' }
          }}>
            <SidebarFilters
              onFilterChange={setSidebarFilters}
              filters={sidebarFilters}
              stylish
              onClose={() => setShowMobileSidebar(false)}
              isMobile={showMobileSidebar}
            />
          </Box>
          <Box sx={{ flex: 1 }} ref={offersTopRef}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              flexDirection: 'column',
              gap: 2
            }}>
              {filteredOffers.length > 0 && (
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#334155', mb: 1 }}>
                  {filteredOffers.length} {filteredOffers.length === 1 ? 'Car' : 'Cars'} Available
                </Typography>
              )}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: 420,
                  mx: 'auto',
                  mb: filteredOffers.length === 0 ? 4 : 2,
                  zIndex: 5
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: 5,
                    top: 8,
                    left: 0,
                    background: 'linear-gradient(135deg, #475569, #1e293b)',
                    opacity: 0.5,
                    filter: 'blur(20px)',
                    transform: 'translateZ(0)', // Force GPU acceleration
                    zIndex: -1
                  }}
                />
                <Paper
                  component="form"
                  elevation={0}
                  sx={{
                    p: '8px 12px',
                    display: { xs: 'none', sm: 'flex' },
                    alignItems: 'center',
                    width: '100%',
                    borderRadius: 5,
                    border: '2px solid rgba(203, 213, 225, 0.8)',
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    '&:hover': {
                      boxShadow: '0 15px 35px rgba(15, 23, 42, 0.15)',
                      borderColor: '#94a3b8',
                      transform: 'translateY(-3px) scale(1.01)'
                    },
                    '&:focus-within': {
                      boxShadow: '0 15px 35px rgba(15, 23, 42, 0.18)',
                      borderColor: '#475569',
                      borderWidth: '2px',
                      transform: 'translateY(-3px) scale(1.01)'
                    },
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(12px)',
                    overflow: 'hidden',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '4px',
                      background: 'linear-gradient(90deg, #475569, #64748b)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    },
                    '&:focus-within::before': {
                      opacity: 1
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '10%',
                      width: '80%',
                      height: '1px',
                      background: 'linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.2), transparent)',
                      opacity: 0.5
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 45,
                      height: 45,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(71, 85, 105, 0.08), rgba(51, 65, 85, 0.04))',
                      mr: 1.5,
                      ml: 0.5,
                      transition: 'all 0.3s ease',
                      '.MuiPaper-root:focus-within &': {
                        background: 'linear-gradient(135deg, rgba(71, 85, 105, 0.12), rgba(51, 65, 85, 0.08))',
                      }
                    }}
                  >
                    <SearchIcon sx={{ 
                      color: '#475569',
                      fontSize: '1.5rem',
                      transition: 'all 0.3s ease',
                      '.MuiPaper-root:focus-within &': {
                        color: '#334155',
                        transform: 'scale(1.1)'
                      }
                    }} />
                  </Box>
                  <input
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      padding: '16px 12px',
                      fontSize: '1.05rem',
                      fontFamily: 'inherit',
                      backgroundColor: 'transparent',
                      color: '#334155',
                      fontWeight: 500,
                      letterSpacing: '0.3px'
                    }}
                    placeholder="Search cars by brand, model or location..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <IconButton 
                      size="small" 
                      onClick={() => setSearch('')}
                      sx={{
                        color: '#94a3b8',
                        width: 36,
                        height: 36,
                        mr: 0.5,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          color: '#64748b',
                          backgroundColor: 'rgba(203, 213, 225, 0.2)',
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      <RestartAltIcon fontSize="small" />
                    </IconButton>
                  )}
                </Paper>
                {filteredOffers.length === 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -30,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      width: '100%'
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      sx={{
                        color: '#64748b',
                        fontStyle: 'italic',
                        opacity: 0.9,
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        letterSpacing: '0.2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      <InfoIcon sx={{ fontSize: '0.9rem', opacity: 0.7 }} />
                      Try searching by brand, model or location
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
            {hasActiveFilters && (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                mb: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(241, 245, 249, 0.7)',
                border: '1px solid #e2e8f0'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center' }}>
                    <SettingsIcon sx={{ fontSize: 18, mr: 0.5 }} /> Active Filters ({activeFilterCount})
                  </Typography>
                  {hasActiveFilters && (
                    <Tooltip title="Clear all filters">
                      <IconButton size="small" onClick={handleClearAllFilters}>
                        <RestartAltIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(sidebarFilters).map(([key, value]) => {
                    if (!value || (key === 'priceRange' && value[0] === 0 && value[1] === 200)) return null;
                    return (
                      <Chip
                        key={key}
                        icon={getFilterIcon(key)}
                        label={`${getFilterLabel(key)}: ${getFilterDisplayValue(key, value)}`}
                        onDelete={() => handleRemoveFilter(key)}
                        size="small"
                        sx={{
                          bgcolor: '#fff',
                          border: '1px solid #cbd5e1',
                          color: '#455a64',
                          fontWeight: 600,
                          '& .MuiChip-deleteIcon': {
                            color: '#94a3b8',
                            '&:hover': { color: '#64748b' }
                          },
                          '& .MuiChip-icon': { color: '#455a64' }
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            )}
            <Grid container spacing={3} sx={{ width: '100%' }}>
              {filteredOffers.length === 0 ? (
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <Box sx={{ 
                    position: 'relative', 
                    width: '100%', 
                    maxWidth: '500px',
                    mt: 3,
                    mb: 4
                  }}>
                    {/* Shadow effect */}
                    <Box sx={{
                      position: 'absolute',
                      width: '90%',
                      height: '90%',
                      top: '15%',
                      left: '5%',
                      borderRadius: 6,
                      background: 'linear-gradient(135deg, #334155, #1e293b)',
                      opacity: 0.4,
                      filter: 'blur(25px)',
                      transform: 'translateZ(0)', // Force GPU acceleration
                      zIndex: 0
                    }} />
                    
                    <Paper elevation={0} sx={{
                      p: 4,
                      borderRadius: 4,
                      textAlign: 'center',
                      border: '1px solid rgba(203, 213, 225, 0.8)',
                      bgcolor: 'rgba(248, 250, 252, 0.95)',
                      backdropFilter: 'blur(12px)',
                      width: '100%',
                      mx: 'auto',
                      boxShadow: '0 15px 30px rgba(15, 23, 42, 0.1)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      zIndex: 1,
                      '&:hover': {
                        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
                        transform: 'translateY(-5px)'
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '5px',
                        background: 'linear-gradient(90deg, #475569, #64748b)',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '15%',
                        width: '70%',
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.3), transparent)',
                      }
                    }}>
                      {/* Decorative elements */}
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 20, 
                        right: 20, 
                        width: 60, 
                        height: 60,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(148, 163, 184, 0.1) 0%, rgba(148, 163, 184, 0) 70%)',
                      }} />
                      <Box sx={{ 
                        position: 'absolute', 
                        bottom: 30, 
                        left: 30, 
                        width: 80, 
                        height: 80,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(148, 163, 184, 0.1) 0%, rgba(148, 163, 184, 0) 70%)',
                      }} />
                      
                      {/* Icon container with gradient background */}
                      <Box sx={{ 
                        mb: 3,
                        position: 'relative',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Box sx={{
                          width: 70,
                          height: 70,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, rgba(71, 85, 105, 0.1), rgba(51, 65, 85, 0.05))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 6px 15px rgba(15, 23, 42, 0.08)',
                          border: '1px solid rgba(203, 213, 225, 0.5)',
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: -3,
                            left: -3,
                            right: -3,
                            bottom: -3,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(203, 213, 225, 0.5), rgba(148, 163, 184, 0.2))',
                            zIndex: -1,
                            opacity: 0.5
                          }
                        }}>
                          <DirectionsCarIcon sx={{ 
                            fontSize: '2.5rem', 
                            color: '#475569',
                            filter: 'drop-shadow(0 3px 5px rgba(15, 23, 42, 0.1))'
                          }} />
                        </Box>
                      </Box>
                      
                      {/* Main heading with gradient */}
                      <Typography variant="h4" sx={{ 
                        fontWeight: 800, 
                        mb: 1.5,
                        background: 'linear-gradient(135deg, #334155, #64748b)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 2px 10px rgba(15, 23, 42, 0.1)',
                        letterSpacing: '-0.5px'
                      }}>
                        0 Cars Available
                      </Typography>
                      
                      {/* Subheading */}
                      <Typography variant="h6" sx={{ 
                        color: '#475569', 
                        fontWeight: 600, 
                        mb: 2,
                        letterSpacing: '0.3px',
                        position: 'relative',
                        display: 'inline-block',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: -8,
                          left: '30%',
                          width: '40%',
                          height: 2,
                          background: 'linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.5), transparent)',
                          borderRadius: 2
                        }
                      }}>
                        No cars match your filters
                      </Typography>
                      
                      {/* Description text */}
                      <Typography variant="body2" sx={{ 
                        color: '#64748b',
                        maxWidth: '80%',
                        mx: 'auto',
                        mb: 3,
                        lineHeight: 1.6,
                        letterSpacing: '0.2px'
                      }}>
                        Try adjusting your filters or search criteria to find available cars.
                      </Typography>
                      
                      {/* Action button */}
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<RestartAltIcon />}
                          onClick={handleClearAllFilters}
                          sx={{
                            bgcolor: '#475569',
                            color: 'white',
                            borderRadius: '8px',
                            px: 3,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: '0 6px 15px rgba(15, 23, 42, 0.15)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: '#334155',
                              boxShadow: '0 8px 20px rgba(15, 23, 42, 0.2)',
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          Reset All Filters
                        </Button>
                      </Box>
                    </Paper>
                  </Box>
                </Grid>
              ) : (
                filteredOffers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((offer) => {
                    const isOwnOffer = currentUser && offer.owner && (
                      console.log('Owner ID:', offer.owner),
                      console.log('Current User ID:', currentUser._id),
                      offer.owner.toString() === currentUser._id.toString()
                    );

                    if (isOwnOffer) {
                      console.log('Found user car:', offer);
                    }

                    return (
                      <Grid item xs={12} key={offer._id || offer.id} sx={{ width: '100%' }}>
                        <Card sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 2,
                          boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)',
                          border: isOwnOffer 
                            ? '1px solid rgba(239, 68, 68, 0.15)' 
                            : '1px solid rgba(148, 163, 184, 0.25)',
                          bgcolor: isOwnOffer ? 'rgba(254, 242, 242, 0.6)' : 'rgba(248, 250, 252, 0.6)',
                          backdropFilter: 'blur(8px)',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            boxShadow: '0 12px 24px rgba(15, 23, 42, 0.12)',
                            transform: 'translateY(-3px)',
                            border: isOwnOffer 
                              ? '1px solid rgba(239, 68, 68, 0.3)' 
                              : '1px solid rgba(71, 85, 105, 0.4)'
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 4,
                            background: isOwnOffer 
                              ? 'linear-gradient(to bottom, #ef4444, #f87171)' 
                              : 'linear-gradient(to bottom, #475569, #64748b)',
                            borderRadius: '2px 0 0 2px',
                            opacity: 0.9
                          },
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: '100%',
                            height: '30px',
                            background: isOwnOffer
                              ? 'linear-gradient(to bottom, rgba(254, 242, 242, 0.7), rgba(254, 242, 242, 0))'
                              : 'linear-gradient(to bottom, rgba(248, 250, 252, 0.7), rgba(248, 250, 252, 0))',
                            borderRadius: '2px 2px 0 0',
                            pointerEvents: 'none',
                            zIndex: 0
                          }
                        }}>
                        {isOwnOffer && (
                          <Box sx={{ 
                            position: 'absolute', 
                            top: 12, 
                            right: 12, 
                            zIndex: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <Chip
                              icon={<CheckCircleIcon sx={{ color: 'white !important', fontSize: '1rem' }} />}
                              label="Your Car"
                              sx={{
                                bgcolor: 'rgba(239, 68, 68, 0.9)',
                                backdropFilter: 'blur(4px)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                height: 28,
                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
                                '& .MuiChip-label': { px: 1 },
                                borderRadius: '14px'
                              }}
                            />
                          </Box>
                        )}
                        <Box sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', md: 'row' },
                          gap: 1.5,
                          p: { xs: 1.5, sm: 1.75 },
                          position: 'relative',
                          zIndex: 1
                        }}>
                          <Box sx={{
                            flexShrink: 0,
                            width: { xs: '100%', md: 130 },
                            height: { xs: 130, md: 130 },
                            position: 'relative',
                            borderRadius: 1.25,
                            overflow: 'hidden',
                            border: '1px solid rgba(148, 163, 184, 0.3)',
                            boxShadow: '0 4px 10px rgba(15, 23, 42, 0.06)',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              inset: -1,
                              background: 'linear-gradient(135deg, rgba(203, 213, 225, 0.3), rgba(148, 163, 184, 0.08))',
                              borderRadius: 'inherit',
                              zIndex: -1
                            },
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              inset: 0,
                              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.25), rgba(15, 23, 42, 0) 50%)',
                              zIndex: 1
                            }
                          }}>
                            <CardMedia
                              component="img"
                              image={offer.images?.[0] || '/placeholder.jpg'}
                              alt={offer.carName || offer.title || 'Car image'}
                              onError={(e) => {
                                e.target.src = '/placeholder.jpg';
                              }}
                              sx={{
                                objectFit: 'cover',
                                width: '100%',
                                height: '100%',
                                borderRadius: 1.25,
                                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                                transition: 'all 0.3s ease',
                                filter: 'contrast(1.02) saturate(1.03)',
                                '&:hover': {
                                  transform: 'scale(1.03)',
                                  filter: 'contrast(1.04) saturate(1.06)'
                                },
                                position: 'relative',
                                zIndex: 0
                              }}
                            />
                          </Box>
                          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              mb: 1.5,
                              flexWrap: { xs: 'wrap', sm: 'nowrap' },
                              gap: 0.75
                            }}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'flex-start', 
                                gap: 0.75,
                                flexDirection: 'column'
                              }}>
                                {isOwnOffer && (
                                  <Chip
                                    label="Your Car"
                                    color="error"
                                    size="small"
                                    sx={{
                                      display: { md: 'none' },
                                      bgcolor: '#ef4444',
                                      color: 'white',
                                      fontWeight: 600,
                                      fontSize: '0.7rem',
                                      height: 24,
                                      '& .MuiChip-label': { px: 1 }
                                    }}
                                  />
                                )}
                                <Typography 
                                  variant="subtitle1" 
                                  sx={{
                                    fontWeight: 700,
                                    color: '#1e293b',
                                    fontSize: { xs: '0.95rem', md: '1rem' },
                                    lineHeight: 1.2,
                                    letterSpacing: '-0.01em',
                                    position: 'relative',
                                    textShadow: '0 1px 1px rgba(15, 23, 42, 0.05)',
                                    '&::after': {
                                      content: '""',
                                      position: 'absolute',
                                      bottom: -2,
                                      left: 0,
                                      width: '30px',
                                      height: '2px',
                                      background: 'linear-gradient(90deg, #475569, rgba(71, 85, 105, 0.2))',
                                      borderRadius: '1px'
                                    }
                                  }}
                                >
                                  {offer.carName || offer.title || 'Car Listing'}
                                </Typography>
                              </Box>
                              <Box sx={{
                                background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.03), rgba(71, 85, 105, 0.08))',
                                color: '#334155',
                                fontWeight: 700,
                                borderRadius: 1.5,
                                px: 1.75,
                                py: 0.6,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                                border: '1px solid rgba(203, 213, 225, 0.3)',
                                height: 'fit-content',
                                minWidth: 100,
                                justifyContent: 'center',
                                backdropFilter: 'blur(4px)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                  boxShadow: '0 3px 8px rgba(15, 23, 42, 0.06)',
                                  background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.05), rgba(71, 85, 105, 0.1))'
                                },
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                                  transform: 'translateX(-100%)',
                                  transition: 'transform 0.6s',
                                  zIndex: 1
                                },
                                '&:hover::before': {
                                  transform: 'translateX(100%)'
                                }
                              }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                                    <Typography 
                                      component="span" 
                                      sx={{ 
                                        fontWeight: 700, 
                                        fontSize: '0.7rem',
                                        color: '#475569',
                                        letterSpacing: '0.02em',
                                        textTransform: 'uppercase'
                                      }}
                                    >
                                      DZD
                                    </Typography>
                                    <Typography 
                                      component="span" 
                                      sx={{ 
                                        fontWeight: 700, 
                                        fontSize: '1.1rem',
                                        color: '#334155',
                                        letterSpacing: '-0.01em'
                                      }}
                                    >
                                      {offer.price.toLocaleString()}
                                    </Typography>
                                  </Box>
                                  <Typography 
                                    component="span" 
                                    sx={{ 
                                      fontSize: '0.65rem', 
                                      color: '#64748b',
                                      fontWeight: 600,
                                      letterSpacing: '0.02em',
                                      opacity: 0.9,
                                      mt: -0.3
                                    }}
                                  >
                                    per day
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                            <Typography variant="subtitle2" sx={{ 
                              color: '#475569', 
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.4,
                              pl: 0.5,
                              mb: 0.75,
                              mt: 0.5,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              <LocationOnIcon sx={{ fontSize: '0.8rem', color: '#64748b' }} />
                              Location
                            </Typography>
                            
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              mb: 1.5, 
                              flexWrap: 'wrap',
                              gap: 1,
                              bgcolor: 'rgba(241, 245, 249, 0.5)',
                              borderRadius: 1.5,
                              p: 1,
                              border: '1px solid rgba(226, 232, 240, 0.4)',
                              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
                            }}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 0.75,
                                bgcolor: 'white',
                                borderRadius: 1.5,
                                py: 0.75,
                                px: 1.5,
                                boxShadow: '0 2px 4px rgba(15, 23, 42, 0.05)',
                                border: '1px solid rgba(226, 232, 240, 0.8)'
                              }}>
                                <LocationOnIcon sx={{ 
                                  color: '#475569', 
                                  fontSize: '1.1rem' 
                                }} />
                                <Typography variant="body2" sx={{
                                  color: '#334155',
                                  fontWeight: 600,
                                  fontSize: '0.85rem'
                                }}>
                                  {offer.wilaya || 'Unknown Location'}
                                </Typography>
                              </Box>

                              <Box 
                                component="button"
                                onClick={() => {
                                  // Navigate to internal MapPage with the car's location
                                  const wilaya = offer.wilaya || 'Alger';
                                  let lat, lng;
                                  
                                  // Get coordinates from the car's location data structure
                                  // Check all possible location data structures
                                  if (offer.location && offer.location.lat && offer.location.lng) {
                                    // Direct lat/lng properties
                                    lat = offer.location.lat;
                                    lng = offer.location.lng;
                                    console.log('Using direct location properties:', lat, lng);
                                  } else if (offer.location && offer.location.coordinates && offer.location.coordinates.lat && offer.location.coordinates.lng) {
                                    // Nested coordinates object
                                    lat = offer.location.coordinates.lat;
                                    lng = offer.location.coordinates.lng;
                                    console.log('Using nested coordinates:', lat, lng);
                                  } else if (offer.location && Array.isArray(offer.location.coordinates) && offer.location.coordinates.length >= 2) {
                                    // GeoJSON format [lng, lat]
                                    lng = offer.location.coordinates[0];
                                    lat = offer.location.coordinates[1];
                                    console.log('Using GeoJSON coordinates:', lat, lng);
                                  } else if (algeriaWilayaCoordinates[wilaya]) {
                                    // Fallback to wilaya coordinates
                                    lat = algeriaWilayaCoordinates[wilaya].lat;
                                    lng = algeriaWilayaCoordinates[wilaya].lng;
                                    console.log('Using wilaya coordinates:', wilaya, lat, lng);
                                  } else {
                                    lat = 36.7372;
                                    lng = 3.0865;
                                    console.log('Using default Algeria coordinates');
                                  }
                                  
                                  // Log the offer object to debug location data
                                  console.log('Car offer data:', offer);
                                  
                                  // Navigate to internal MapPage with URL parameters
                                  window.location.href = `/map?carId=${offer._id}&lat=${lat}&lng=${lng}&wilaya=${encodeURIComponent(wilaya)}`;
                                  
                                  // Alternative: Open in Google Maps (uncomment to use)
                                  // window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                                
                                }}
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  background: 'white',
                                  border: '1px solid rgba(226, 232, 240, 0.8)',
                                  cursor: 'pointer',
                                  py: 0.75,
                                  px: 1.5,
                                  borderRadius: 1.5,
                                  transition: 'all 0.2s',
                                  boxShadow: '0 2px 4px rgba(15, 23, 42, 0.05)',
                                  '&:hover': {
                                    bgcolor: '#f1f5f9',
                                    boxShadow: '0 4px 8px rgba(15, 23, 42, 0.08)',
                                    transform: 'translateY(-2px)'
                                  }
                                }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L16 5m0 12V5m0 0L9 7" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <Typography variant="body2" sx={{
                                  color: '#475569',
                                  fontWeight: 600,
                                  ml: 0.75,
                                  fontSize: '0.85rem'
                                }}>
                                  View on map
                                </Typography>
                              </Box>
                            </Box>
                            <Typography variant="subtitle2" sx={{ 
                              color: '#475569', 
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.4,
                              pl: 0.5,
                              mb: 0.75,
                              mt: 0.75,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              <DirectionsCarIcon sx={{ fontSize: '0.8rem', color: '#64748b' }} />
                              Specifications
                            </Typography>
                            
                            <Box sx={{ 
                              mb: 1.5,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 0.75
                            }}>
                              <Box sx={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: 0.75,
                                bgcolor: 'rgba(241, 245, 249, 0.5)',
                                borderRadius: 1.5,
                                p: 1,
                                border: '1px solid rgba(226, 232, 240, 0.4)',
                                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
                              }}>
                                <Chip
                                  icon={<AirlineSeatReclineNormalIcon sx={{ color: '#475569', fontSize: '0.8rem' }} />}
                                  label={`${offer.seats} Seats`}
                                  size="small"
                                  sx={{
                                    bgcolor: 'white',
                                    color: '#334155',
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                    borderRadius: 0.75,
                                    border: '1px solid rgba(203, 213, 225, 0.3)',
                                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.02)',
                                    height: 24,
                                    '& .MuiChip-label': { px: 0.6 },
                                    '& .MuiChip-icon': { ml: 0.4, fontSize: '0.8rem' },
                                    '&:hover': {
                                      boxShadow: '0 2px 4px rgba(15, 23, 42, 0.05)',
                                      bgcolor: '#f8fafc'
                                    }
                                  }}
                                />
                                <Chip
                                  icon={<MeetingRoomIcon sx={{ color: '#475569', fontSize: '0.8rem' }} />}
                                  label={`${offer.doors} Doors`}
                                  size="small"
                                  sx={{
                                    bgcolor: 'white',
                                    color: '#334155',
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                    borderRadius: 0.75,
                                    border: '1px solid rgba(203, 213, 225, 0.3)',
                                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.02)',
                                    height: 24,
                                    '& .MuiChip-label': { px: 0.6 },
                                    '& .MuiChip-icon': { ml: 0.4, fontSize: '0.8rem' },
                                    '&:hover': {
                                      boxShadow: '0 2px 4px rgba(15, 23, 42, 0.05)',
                                      bgcolor: '#f8fafc'
                                    }
                                  }}
                                />
                                {offer.location && (
                                  <Chip
                                    icon={<LocationOnIcon sx={{ color: '#475569', fontSize: '0.8rem' }} />}
                                    label={offer.location.name || offer.location.address || 'Pickup Location'}
                                    size="small"
                                    sx={{
                                      bgcolor: 'white',
                                      color: '#334155',
                                      fontWeight: 600,
                                      fontSize: '0.7rem',
                                      borderRadius: 0.75,
                                      border: '1px solid rgba(203, 213, 225, 0.3)',
                                      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.02)',
                                      height: 24,
                                      maxWidth: 160,
                                      '& .MuiChip-label': { 
                                        px: 0.6,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      },
                                      '& .MuiChip-icon': { ml: 0.4, fontSize: '0.8rem' },
                                      '&:hover': {
                                        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.05)',
                                        bgcolor: '#f8fafc'
                                      }
                                    }}
                                    title={offer.location.name || offer.location.address}
                                  />
                                )}
                                {offer.carType && (
                                  <Chip
                                    icon={<DirectionsCarIcon sx={{ color: '#475569', fontSize: '0.8rem' }} />}
                                    label={offer.carType}
                                    size="small"
                                    sx={{
                                      bgcolor: 'white',
                                      color: '#334155',
                                      fontWeight: 600,
                                      fontSize: '0.7rem',
                                      borderRadius: 0.75,
                                      border: '1px solid rgba(203, 213, 225, 0.3)',
                                      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.02)',
                                      height: 24,
                                      '& .MuiChip-label': { px: 0.6 },
                                      '& .MuiChip-icon': { ml: 0.4, fontSize: '0.8rem' },
                                      '&:hover': {
                                        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.05)',
                                        bgcolor: '#f8fafc'
                                      }
                                    }}
                                  />
                                )}
                                <Chip
                                  icon={<LocalGasStationIcon sx={{ color: '#475569', fontSize: '0.8rem' }} />}
                                  label={offer.energy || 'N/A'}
                                  size="small"
                                  sx={{
                                    bgcolor: 'white',
                                    color: '#334155',
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                    borderRadius: 0.75,
                                    border: '1px solid rgba(203, 213, 225, 0.3)',
                                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.02)',
                                    height: 24,
                                    '& .MuiChip-label': { px: 0.6 },
                                    '& .MuiChip-icon': { ml: 0.4, fontSize: '0.8rem' },
                                    '&:hover': {
                                      boxShadow: '0 2px 4px rgba(15, 23, 42, 0.05)',
                                      bgcolor: '#f8fafc'
                                    }
                                  }}
                                />
                                <Chip
                                  icon={
                                    offer.transmission && offer.transmission.toLowerCase() === 'manual' ? (
                                      <TuneIcon sx={{ color: '#475569', fontSize: '0.8rem', transform: 'rotate(90deg)' }} />
                                    ) : (
                                      <MiscellaneousServicesIcon sx={{ color: '#475569', fontSize: '0.8rem' }} />
                                    )
                                  }
                                  label={offer.transmission || 'N/A'}
                                  size="small"
                                  sx={{
                                    bgcolor: 'white',
                                    color: '#334155',
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                    borderRadius: 0.75,
                                    border: '1px solid rgba(203, 213, 225, 0.3)',
                                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.02)',
                                    height: 24,
                                    '& .MuiChip-label': { px: 0.6 },
                                    '& .MuiChip-icon': { ml: 0.4, fontSize: '0.8rem' },
                                    '&:hover': {
                                      boxShadow: '0 2px 4px rgba(15, 23, 42, 0.05)',
                                      bgcolor: '#f8fafc'
                                    }
                                  }}
                                />
                              </Box>
                            </Box>

                            <Typography variant="subtitle2" sx={{ 
                              color: '#475569', 
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.4,
                              pl: 0.5,
                              mb: 0.75,
                              mt: 0.75,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              <CalendarMonthIcon sx={{ fontSize: '0.8rem', color: '#64748b' }} />
                              Availability
                            </Typography>
                            
                            <Box sx={{ 
                              display: 'flex',
                              flexDirection: { xs: 'column', sm: 'row' },
                              gap: 0.75,
                              mb: 1.5,
                              flexWrap: 'wrap'
                            }}>
                              <Chip
                                icon={<CalendarMonthIcon sx={{ color: '#64748b', fontSize: '0.8rem' }} />}
                                label={`From: ${formatDateDMY(offer.availabilityStart || offer.availableFrom)}`}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(226, 232, 240, 0.5)',
                                  color: '#475569',
                                  fontWeight: 600,
                                  borderRadius: 0.75,
                                  border: '1px solid rgba(203, 213, 225, 0.3)',
                                  fontSize: '0.7rem',
                                  height: 24,
                                  '& .MuiChip-label': { px: 0.6 },
                                  '& .MuiChip-icon': { ml: 0.4, fontSize: '0.8rem' },
                                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.02)'
                                }}
                              />
                              <Chip
                                icon={<CalendarMonthIcon sx={{ color: '#64748b', fontSize: '0.8rem' }} />}
                                label={`To: ${formatDateDMY(offer.availabilityEnd || offer.availableTo)}`}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(226, 232, 240, 0.5)',
                                  color: '#475569',
                                  fontWeight: 600,
                                  borderRadius: 0.75,
                                  border: '1px solid rgba(203, 213, 225, 0.3)',
                                  fontSize: '0.7rem',
                                  height: 24,
                                  '& .MuiChip-label': { px: 0.6 },
                                  '& .MuiChip-icon': { ml: 0.4, fontSize: '0.8rem' },
                                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.02)'
                                }}
                              />
                            </Box>

                            {offer.features && Object.keys(offer.features).length > 0 && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ 
                                  color: '#475569', 
                                  fontWeight: 600, 
                                  mb: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5
                                }}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 10h12M6 6h12M6 14h12M6 18h12" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
                                  </svg>
                                  Features
                                </Typography>
                                <Box sx={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: 0.75,
                                  maxWidth: '100%'
                                }}>
                                  {/* Feature chips would go here */}
                                </Box>
                              </Box>
                            )}

                            <Button
                              component={isOwnOffer ? undefined : Link}
                              to={isOwnOffer ? undefined : `/car-details/${offer._id}`}
                              variant="contained"
                              size="small"
                              disabled={isOwnOffer}
                              sx={{
                                alignSelf: 'flex-start',
                                bgcolor: isOwnOffer ? '#e0e0e0' : '#475569',
                                color: isOwnOffer ? '#a0a0a0' : 'white',
                                borderRadius: 0.75,
                                px: 1.25,
                                py: 0.5,
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                textTransform: 'none',
                                boxShadow: isOwnOffer ? 'none' : '0 2px 4px rgba(15, 23, 42, 0.06)',
                                '&:hover': {
                                  bgcolor: isOwnOffer ? '#e0e0e0' : '#334155',
                                  boxShadow: isOwnOffer ? 'none' : '0 3px 6px rgba(15, 23, 42, 0.1)',
                                  transform: isOwnOffer ? 'none' : 'translateY(-1px)'
                                },
                                transition: 'all 0.2s ease',
                                cursor: isOwnOffer ? 'not-allowed' : 'pointer',
                                height: 28,
                                minWidth: 'auto',
                                letterSpacing: '0.2px',
                                mt: 0.5
                              }}
                            >
                              <DirectionsCarIcon sx={{ mr: 0.4, fontSize: '0.8rem' }} /> 
                              {isOwnOffer ? "Your Listing" : "View Details"}
                            </Button>
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  );
                }))}
            </Grid>
            
            {filteredOffers.length > 0 && (
              <Box sx={{ 
                mt: 5, 
                mb: 3,
                position: 'relative',
                overflow: 'visible'
              }}>
                <Box sx={{
                  position: 'absolute',
                  width: '90%',
                  height: '90%',
                  top: '15%',
                  left: '5%',
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #334155, #1e293b)',
                  opacity: 0.2,
                  filter: 'blur(20px)',
                  transform: 'translateZ(0)',
                  zIndex: 0
                }} />
                
                <Paper elevation={0} sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' }, 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2,
                  bgcolor: 'rgba(248, 250, 252, 0.95)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 3,
                  py: 2.5,
                  px: 3,
                  border: '1px solid rgba(203, 213, 225, 0.8)',
                  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                  position: 'relative',
                  zIndex: 1,
                  transition: 'all 0.3s ease',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: 'linear-gradient(90deg, #475569, #64748b)',
                    borderRadius: '3px 3px 0 0'
                  }
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    flexWrap: { xs: 'wrap', md: 'nowrap' },
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    width: { xs: '100%', md: 'auto' }
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      bgcolor: 'rgba(241, 245, 249, 0.7)',
                      py: 1,
                      px: 2,
                      borderRadius: 2,
                      border: '1px solid #e2e8f0'
                    }}>
                      <DirectionsCarIcon sx={{ color: '#475569', fontSize: '1.2rem' }} />
                      <Typography variant="body2" sx={{ 
                        color: '#475569', 
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        letterSpacing: '0.2px'
                      }}>
                        Showing <Box component="span" sx={{ fontWeight: 700, color: '#334155' }}>
                          {page * rowsPerPage + 1}-{Math.min(filteredOffers.length, (page + 1) * rowsPerPage)}
                        </Box> of <Box component="span" sx={{ fontWeight: 700, color: '#334155' }}>
                          {filteredOffers.length}
                        </Box> cars
                      </Typography>
                    </Box>
                    
                    <FormControl size="small" sx={{ 
                      minWidth: 130,
                      '& .MuiFormLabel-root': {
                        color: '#64748b',
                        fontWeight: 500
                      },
                      '& .MuiFormLabel-root.Mui-focused': {
                        color: '#475569'
                      }
                    }}>
                      <InputLabel id="rows-per-page-label">Cars per page</InputLabel>
                      <Select
                        labelId="rows-per-page-label"
                        id="rows-per-page"
                        value={rowsPerPage}
                        label="Cars per page"
                        onChange={(e) => {
                          setRowsPerPage(parseInt(e.target.value, 10));
                          setPage(0);
                          if (offersTopRef.current) {
                            offersTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                        sx={{ 
                          bgcolor: 'white',
                          boxShadow: '0 2px 5px rgba(15, 23, 42, 0.05)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#cbd5e1',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#94a3b8',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#475569',
                          },
                          '& .MuiSelect-select': {
                            color: '#334155',
                            fontWeight: 600
                          }
                        }}
                      >
                        <MenuItem value={3}>3 cars</MenuItem>
                        <MenuItem value={5}>5 cars</MenuItem>
                        <MenuItem value={10}>10 cars</MenuItem>
                        <MenuItem value={20}>20 cars</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  
                  <Pagination 
                    count={Math.ceil(filteredOffers.length / rowsPerPage)} 
                    page={page + 1}
                    onChange={(event, newPage) => {
                      setPage(newPage - 1);
                      if (offersTopRef.current) {
                        offersTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    color="primary"
                    variant="outlined"
                    shape="rounded"
                    showFirstButton
                    showLastButton
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: '#475569',
                        fontWeight: 600,
                        borderColor: '#cbd5e1',
                        mx: 0.2,
                        transition: 'all 0.2s ease',
                        '&.Mui-selected': {
                          bgcolor: '#475569',
                          color: 'white',
                          borderColor: '#475569',
                          boxShadow: '0 4px 8px rgba(15, 23, 42, 0.15)',
                          '&:hover': {
                            bgcolor: '#334155',
                            borderColor: '#334155',
                          }
                        },
                        '&:hover': {
                          bgcolor: 'rgba(71, 85, 105, 0.08)',
                          borderColor: '#94a3b8',
                        },
                        '&.MuiPaginationItem-ellipsis': {
                          border: 'none',
                          backgroundColor: 'transparent'
                        },
                        '&.MuiPaginationItem-firstLast, &.MuiPaginationItem-previousNext': {
                          bgcolor: 'white',
                          '&:hover': {
                            bgcolor: 'rgba(71, 85, 105, 0.08)',
                          }
                        }
                      }
                    }}
                  />
                </Paper>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </React.Fragment>
  );
}
