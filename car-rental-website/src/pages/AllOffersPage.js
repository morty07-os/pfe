import React, { useEffect, useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
// Assuming you have an AuthContext or similar to get user info
// import { AuthContext } from '../context/AuthContext'; // Example
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
  Avatar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SettingsIcon from '@mui/icons-material/Settings';
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
  'Adrar': { lat: 27.8742, lng: -0.2939 },
  'Chlef': { lat: 36.1691, lng: 1.3387 },
  'Laghouat': { lat: 33.8085, lng: 2.8822 },
  'Oum El Bouaghi': { lat: 35.8775, lng: 7.1136 },
  'Batna': { lat: 35.5552, lng: 6.1742 },
  'Béjaïa': { lat: 36.7515, lng: 5.0557 },
  'Biskra': { lat: 34.8512, lng: 5.7282 },
  'Béchar': { lat: 31.6182, lng: -2.2186 },
  'Blida': { lat: 36.4703, lng: 2.8281 },
  'Bouira': { lat: 36.3754, lng: 3.9002 },
  'Tamanrasset': { lat: 22.7903, lng: 5.5229 },
  'Tébessa': { lat: 35.4049, lng: 8.1204 },
  'Tlemcen': { lat: 34.8884, lng: -1.3143 },
  'Tiaret': { lat: 35.3707, lng: 1.3166 },
  'Tizi Ouzou': { lat: 36.7002, lng: 4.0566 },
  'Alger': { lat: 36.7538, lng: 3.0588 },
  'Djelfa': { lat: 34.6703, lng: 3.2505 },
  'Jijel': { lat: 36.8207, lng: 5.7698 },
  'Sétif': { lat: 36.1898, lng: 5.4108 },
  'Saïda': { lat: 34.8414, lng: 0.1515 },
  'Skikda': { lat: 36.8715, lng: 6.9075 },
  'Sidi Bel Abbès': { lat: 35.1891, lng: -0.6331 },
  'Annaba': { lat: 36.9142, lng: 7.7427 },
  'Guelma': { lat: 36.4627, lng: 7.4306 },
  'Constantine': { lat: 36.3650, lng: 6.6147 },
  'Médéa': { lat: 36.2675, lng: 2.7634 },
  'Mostaganem': { lat: 35.9312, lng: 0.0892 },
  'M\'Sila': { lat: 35.7058, lng: 4.5419 },
  'Mascara': { lat: 35.3979, lng: 0.1400 },
  'Ouargla': { lat: 31.9527, lng: 5.3335 },
  'Oran': { lat: 35.6969, lng: -0.6331 },
  'El Bayadh': { lat: 33.6868, lng: 1.0169 },
  'Illizi': { lat: 26.5088, lng: 8.4698 },
  'Bordj Bou Arréridj': { lat: 36.0730, lng: 4.7635 },
  'Boumerdès': { lat: 36.7663, lng: 3.4783 },
  'El Tarf': { lat: 36.7669, lng: 8.3136 },
  'Tindouf': { lat: 27.6711, lng: -8.1289 },
  'Tissemsilt': { lat: 35.6072, lng: 1.8106 },
  'El Oued': { lat: 33.3683, lng: 6.8517 },
  'Khenchela': { lat: 35.4359, lng: 7.1457 },
  'Souk Ahras': { lat: 36.2863, lng: 7.9511 },
  'Tipaza': { lat: 36.5892, lng: 2.4130 },
  'Mila': { lat: 36.4503, lng: 6.2648 },
  'Aïn Defla': { lat: 36.2641, lng: 1.9685 },
  'Naâma': { lat: 33.2669, lng: -0.3115 },
  'Aïn Témouchent': { lat: 35.2997, lng: -1.1400 },
  'Ghardaïa': { lat: 32.4902, lng: 3.6738 },
  'Relizane': { lat: 35.7378, lng: 0.5556 },
  'Timimoun': { lat: 29.2639, lng: 0.2306 },
  'Bordj Badji Mokhtar': { lat: 21.3283, lng: 0.9545 },
  'Ouled Djellal': { lat: 34.4204, lng: 5.0658 },
  'Béni Abbès': { lat: 30.1329, lng: -2.1675 },
  'In Salah': { lat: 27.1974, lng: 2.4903 },
  'In Guezzam': { lat: 19.5719, lng: 5.7704 },
  'Touggourt': { lat: 33.1058, lng: 6.0566 },
  'Djanet': { lat: 24.5521, lng: 9.4820 },
  'El M\'Ghair': { lat: 33.9553, lng: 5.9226 },
  'El Meniaa': { lat: 30.5789, lng: 2.8793 }
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
  const [showMobileSidebar, setShowMobileSidebar] = React.useState(false);
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

      const response = await fetch('http://localhost:5001/api/cars/user-cars', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) setUserCars(data);
      else console.error(data.error || 'Failed to fetch user cars');
    } catch (error) {
      console.error('Error fetching user cars:', error.message);
    }
  };

  // Extract category from query parameters
  const queryParams = React.useMemo(() => new URLSearchParams(locationObj.search), [locationObj.search]);
  const categoryFilter = queryParams.get('category');

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const queryParams = new URLSearchParams({
          brand: sidebarFilters.brand || '',
          energy: sidebarFilters.energy || '',
          transmission: sidebarFilters.transmission || '',
          wilaya: sidebarFilters.wilaya || '',
          seats: sidebarFilters.seats || '',
          doors: sidebarFilters.doors || '',
          priceMin: sidebarFilters.priceRange ? sidebarFilters.priceRange[0] : '',
          priceMax: sidebarFilters.priceRange ? sidebarFilters.priceRange[1] : '',
          availableFrom: sidebarFilters.availableFrom || '',
          availableTo: sidebarFilters.availableTo || '',
        }).toString();
        const response = await fetch(`http://localhost:5001/api/cars/getcars?${queryParams}`);
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
            // Assuming car data has a 'category' field, if not, this needs to be derived
            // category: car.category || 'Unknown' // Example, adjust as per your data structure
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
  }, [sidebarFilters]);

  const filteredOffers = React.useMemo(() => {
    let tempOffers = [...offers];

    // Apply category filter from URL query param first
    if (categoryFilter) {
      tempOffers = tempOffers.filter(offer =>
        offer.category && offer.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Apply search term filter
    if (search) {
      tempOffers = tempOffers.filter(offer =>
        offer.brand?.toLowerCase().includes(search.toLowerCase()) ||
        offer.model?.toLowerCase().includes(search.toLowerCase()) ||
        offer.description?.toLowerCase().includes(search.toLowerCase()) ||
        offer.wilaya?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply sidebar filters
    tempOffers = tempOffers.filter(offer =>
      (!sidebarFilters.brand || offer.brand === sidebarFilters.brand) &&
      (!sidebarFilters.energy || offer.energy === sidebarFilters.energy) &&
      (!sidebarFilters.transmission || offer.transmission === sidebarFilters.transmission) &&
      (!sidebarFilters.wilaya || offer.wilaya === sidebarFilters.wilaya) &&
      (!sidebarFilters.seatsRange || (Number(offer.seats) >= sidebarFilters.seatsRange[0] && Number(offer.seats) <= sidebarFilters.seatsRange[1])) &&
      (!sidebarFilters.doorsRange || (Number(offer.doors) >= sidebarFilters.doorsRange[0] && Number(offer.doors) <= sidebarFilters.doorsRange[1])) &&
      (!sidebarFilters.priceRange || (offer.price >= sidebarFilters.priceRange[0] && offer.price <= sidebarFilters.priceRange[1])) &&
      (!sidebarFilters.availableFrom || dayjs(offer.availableFrom).isSameOrAfter(dayjs(sidebarFilters.availableFrom), 'day')) &&
      (!sidebarFilters.availableTo || dayjs(offer.availableTo).isSameOrBefore(dayjs(sidebarFilters.availableTo), 'day'))
    );

    return tempOffers;
  }, [offers, search, sidebarFilters, categoryFilter]); // Added categoryFilter to dependency array

  function isDateRangeOverlap(offerFrom, offerTo, selectedFrom, selectedTo) {
    if (!selectedFrom || !selectedTo) return true;
    const offerStart = dayjs(offerFrom);
    const offerEnd = dayjs(offerTo);
    const selStart = dayjs(selectedFrom);
    const selEnd = dayjs(selectedTo);
    return offerEnd.isAfter(selStart) && offerStart.isBefore(selEnd);
  }

  const getFilterLabel = (key) => {
    const labels = {
      brand: 'Brand',
      energy: 'Energy',
      transmission: 'Transmission',
      wilaya: 'Location',
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
          <QuickSearch noBackground sx={{ 
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
          <Box sx={{ flex: 1 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: filteredOffers.length === 0 ? 'center' : 'space-between',
              mb: 3,
              flexDirection: filteredOffers.length === 0 ? 'column' : 'row',
              gap: filteredOffers.length === 0 ? 2 : 0
            }}>
              {filteredOffers.length > 0 && (
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#334155' }}>
                  {filteredOffers.length} {filteredOffers.length === 1 ? 'Car' : 'Cars'} Available
                </Typography>
              )}
              <Box
                sx={{
                  position: 'relative',
                  width: filteredOffers.length === 0 ? '100%' : 'auto',
                  maxWidth: 420,
                  mx: filteredOffers.length === 0 ? 'auto' : 0,
                  mb: filteredOffers.length === 0 ? 4 : 0,
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
                filteredOffers.map((offer) => {
                  // Check if the current offer belongs to the logged-in user
                  const isOwnOffer = currentUser && offer.owner && (
                    console.log('Owner ID:', offer.owner),
                    console.log('Current User ID:', currentUser._id),
                    offer.owner.toString() === currentUser._id.toString()
                  );

                  // Add a console log to debug the car data
                  if (isOwnOffer) {
                    console.log('Found user car:', offer);
                  }

                  return (
                    <Grid item xs={12} key={offer._id || offer.id} sx={{ width: '100%' }}>
                      <Card sx={{
                        borderRadius: 2,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                        border: isOwnOffer ? '2px solid #ef4444' : '1px solid #e2e8f0',
                        backgroundColor: isOwnOffer ? '#fff5f5' : 'inherit',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                          transform: 'translateY(-4px)',
                        },
                        mb: 3,
                        overflow: 'visible',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          height: '100%',
                          width: 5,
                          bgcolor: isOwnOffer ? '#ef4444' : '#64748b',
                          borderRadius: '4px 0 0 4px',
                        }
                      }}>
                        {isOwnOffer && (
                          <Box sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8, 
                            zIndex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <Chip
                              icon={<CheckCircleIcon sx={{ color: 'white !important' }} />}
                              label="Your Car"
                              sx={{
                                bgcolor: '#ef4444',
                                color: 'white',
                                fontWeight: 600,
                                '& .MuiChip-label': { px: 1 }
                              }}
                            />
                          </Box>
                        )}
                        <Box sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', md: 'row' },
                          gap: 2,
                          p: 2
                        }}>
                          <Box sx={{
                            flexShrink: 0,
                            width: { xs: '100%', md: 120 },
                            height: { xs: 200, md: 120 },
                            position: 'relative'
                          }}>
                            <CardMedia
                              component="img"
                              image={offer.images?.[0] ? `http://localhost:5001/${offer.images[0]}` : '/placeholder.jpg'}
                              alt={offer.title || 'Car image'}
                              sx={{
                                objectFit: 'cover',
                                borderRadius: 1,
                                width: '100%',
                                height: '100%',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                              }}
                            />
                          </Box>
                          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {isOwnOffer && (
                                  <Chip
                                    label="Your Car"
                                    color="error"
                                    size="small"
                                    sx={{
                                      bgcolor: '#ef4444',
                                      color: 'white',
                                      fontWeight: 600,
                                      '& .MuiChip-label': { px: 1 }
                                    }}
                                  />
                                )}
                                <Typography variant="h6" sx={{
                                  fontWeight: 700,
                                  color: '#1e293b',
                                  fontSize: '1.25rem'
                                }}>
                                  {offer.title || offer.carName || 'Car Listing'}
                                </Typography>
                              </Box>
                              <Box sx={{
                                bgcolor: '#e6f0fa',
                                color: '#64748b',
                                fontWeight: 700,
                                borderRadius: 1,
                                px: 1.5,
                                py: 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}>
                                <AttachMoneyIcon sx={{ fontSize: 16, color: '#64748b' }} />
                                <span>DZD {offer.price}</span>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}> /day</span>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                <LocationOnIcon sx={{ color: '#64748b', mr: 0.5 }} />
                                <Typography variant="body2" sx={{
                                  color: '#64748b',
                                  fontWeight: 600
                                }}>
                                  {offer.wilaya || 'Unknown Location'}
                                </Typography>
                              </Box>

                              <Box 
                                component="button"
                                onClick={() => {
                                  // Open Google Maps with the car's location
                                  const wilaya = offer.wilaya || 'Alger';
                                  let lat, lng;
                                  
                                  // Get coordinates from the car's location or from the wilaya coordinates
                                  if (offer.location && offer.location.coordinates) {
                                    lat = offer.location.coordinates.lat;
                                    lng = offer.location.coordinates.lng;
                                  } else if (algeriaWilayaCoordinates[wilaya]) {
                                    lat = algeriaWilayaCoordinates[wilaya].lat;
                                    lng = algeriaWilayaCoordinates[wilaya].lng;
                                  } else {
                                    // Default to Algeria center if no coordinates are found
                                    lat = 36.7372;
                                    lng = 3.0865;
                                  }
                                  
                                  // Open Google Maps in a new tab
                                  window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                                }}
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '4px 8px',
                                  borderRadius: 1,
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    bgcolor: '#e2e8f0'
                                  }
                                }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L16 5m0 12V5m0 0L9 7" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <Typography variant="body2" sx={{
                                  color: '#64748b',
                                  fontWeight: 600,
                                  ml: 0.5,
                                  fontSize: '0.8rem',
                                  textDecoration: 'underline',
                                  textUnderlineOffset: '2px'
                                }}>
                                  View on map
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                              <Chip
                                icon={<AirlineSeatReclineNormalIcon sx={{ color: '#64748b' }} />}
                                label={`${offer.seats} Seats`}
                                size="small"
                                sx={{
                                  bgcolor: '#f8fafc',
                                  color: '#475569',
                                  fontWeight: 500,
                                  borderRadius: 1
                                }}
                              />
                              <Chip
                                icon={<MeetingRoomIcon sx={{ color: '#64748b' }} />}
                                label={`${offer.doors} Doors`}
                                size="small"
                                sx={{
                                  bgcolor: '#f8fafc',
                                  color: '#475569',
                                  fontWeight: 500,
                                  borderRadius: 1
                                }}
                              />
                              {offer.location && (
                                <Chip
                                  icon={<LocationOnIcon sx={{ color: '#64748b' }} />}
                                  label={offer.location.name || offer.location.address || 'Pickup Location'}
                                  size="small"
                                  sx={{
                                    bgcolor: '#f1f5f9',
                                    color: '#475569',
                                    fontWeight: 500,
                                    borderRadius: 1,
                                    maxWidth: 200,
                                    '& .MuiChip-label': {
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }
                                  }}
                                  title={offer.location.name || offer.location.address}
                                />
                              )}
                              <Chip
                                icon={<LocalGasStationIcon sx={{ color: '#64748b' }} />}
                                label={offer.energy || 'N/A'}
                                size="small"
                                sx={{
                                  bgcolor: '#f8fafc',
                                  color: '#475569',
                                  fontWeight: 500,
                                  borderRadius: 1
                                }}
                              />
                              <Chip
                                icon={<SettingsIcon sx={{ color: '#64748b' }} />}
                                label={offer.transmission || 'N/A'}
                                size="small"
                                sx={{
                                  bgcolor: '#f8fafc',
                                  color: '#475569',
                                  fontWeight: 500,
                                  borderRadius: 1
                                }}
                              />
                            </Box>

                            <Box sx={{ 
                              display: 'flex',
                              flexDirection: { xs: 'column', sm: 'row' },
                              gap: 1,
                              mb: 2,
                              flexWrap: 'wrap'
                            }}>
                              <Chip
                                icon={<CalendarMonthIcon sx={{ color: '#64748b' }} />}
                                label={`From: ${formatDateDMY(offer.availabilityStart)}`}
                                size="small"
                                sx={{
                                  bgcolor: '#e6f0fa',
                                  color: '#64748b',
                                  fontWeight: 600,
                                  borderRadius: 1,
                                  borderColor: '#94a3b8'
                                }}
                              />
                              <Chip
                                icon={<CalendarMonthIcon sx={{ color: '#64748b' }} />}
                                label={`To: ${formatDateDMY(offer.availabilityEnd)}`}
                                size="small"
                                sx={{
                                  bgcolor: '#e6f0fa',
                                  color: '#64748b',
                                  fontWeight: 600,
                                  borderRadius: 1,
                                  borderColor: '#94a3b8'
                                }}
                              />
                            </Box>

                            {/* Car Features */}
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
                                  {Object.entries(offer.features)
                                    .filter(([key, value]) => value === true)
                                    .map(([featureId]) => {
                                      // Find the feature in carFeatures array
                                      const feature = carFeatures.find(f => f.id === featureId);
                                      if (!feature) return null;

                                      return (
                                        <Chip
                                          key={featureId}
                                          size="small"
                                          sx={{
                                            height: 24,
                                            bgcolor: '#e2e8f0',
                                            color: '#334155',
                                            fontWeight: 500,
                                            fontSize: '0.75rem',
                                            borderRadius: 1,
                                            '& .MuiChip-label': { px: 1 }
                                          }}
                                          label={feature.label}
                                        />
                                      );
                                    })}
                                </Box>
                              </Box>
                            )}

                            <Button
                              component={isOwnOffer ? undefined : Link}
                              to={isOwnOffer ? undefined : `/car-details/${offer._id}`}
                              variant="contained"
                              disabled={isOwnOffer}
                              sx={{
                                alignSelf: 'flex-start',
                                bgcolor: isOwnOffer ? '#e0e0e0' : '#64748b',
                                color: isOwnOffer ? '#a0a0a0' : 'white',
                                borderRadius: 1,
                                px: 3,
                                py: 1,
                                fontWeight: 600,
                                textTransform: 'none',
                                '&:hover': {
                                  bgcolor: isOwnOffer ? '#e0e0e0' : '#475569',
                                },
                                cursor: isOwnOffer ? 'not-allowed' : 'pointer',
                              }}
                            >
                              <DirectionsCarIcon sx={{ mr: 1 }} /> 
                              {isOwnOffer ? "Your Listing" : "View Details"}
                            </Button>
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  );
                }))}
            </Grid>
          </Box>
        </Box>
      </Box>
    </React.Fragment>
  );
}
