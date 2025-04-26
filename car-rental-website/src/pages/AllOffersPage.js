import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import QuickSearch from '../components/QuickSearch';
import { Box, Grid, Card, CardContent, CardMedia, Typography, TextField, InputAdornment, IconButton, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SettingsIcon from '@mui/icons-material/Settings';
import { useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import SidebarFilters from './SidebarFilters';

// Helper to format YYYY-MM-DD to DD-MM-YYYY
function formatDateDMY(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
}

export default function AllOffersPage() {
  const [search, setSearch] = React.useState('');
  const [sidebarFilters, setSidebarFilters] = React.useState({});
  const [offers, setOffers] = useState([]); // State to store fetched offers
  const locationObj = useLocation();
  const query = React.useMemo(() => {
    const params = new URLSearchParams(locationObj.search);
    return {
      wilaya: params.get('wilaya'),
      startDate: params.get('startDate'),
      endDate: params.get('endDate')
    };
  }, [locationObj.search]);

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
        if (!response.ok) {
          throw new Error('Failed to fetch offers');
        }
        const data = await response.json();
        setOffers(data);
      } catch (error) {
        console.error('Error fetching offers:', error.message);
      }
    };

    fetchOffers();
  }, [sidebarFilters]); // Refetch offers whenever sidebar filters change

  // Helper to check if two date ranges overlap
  function isDateRangeOverlap(offerFrom, offerTo, selectedFrom, selectedTo) {
    if (!offerFrom || !offerTo) return true;
    const offerStart = dayjs(offerFrom);
    const offerEnd = dayjs(offerTo);
    const selStart = dayjs(selectedFrom);
    const selEnd = dayjs(selectedTo);
    return offerEnd.isAfter(selStart) && offerStart.isBefore(selEnd);
  }

  // Filter offers by search query and query params
  const filteredOffers = offers.filter(offer => {
    // Text search
    const matchesSearch =
      offer.carName.toLowerCase().includes(search.toLowerCase()) ||
      offer.brand.toLowerCase().includes(search.toLowerCase()) ||
      offer.wilaya.toLowerCase().includes(search.toLowerCase());
    // Wilaya/location filter
    const matchesWilaya = !query.wilaya || offer.wilaya === query.wilaya;
    // Date filter
    const matchesDate =
      !query.startDate || !query.endDate ||
      isDateRangeOverlap(
        offer.availabilityStart,
        offer.availabilityEnd,
        query.startDate,
        query.endDate
      );
    return matchesSearch && matchesWilaya && matchesDate;
  });

  return (
    <React.Fragment>
      <Navbar sx={{ backgroundColor: '#111', color: '#fff' }} iconColor="#fff" />
      <Box sx={{ p: 0, pt: 0, mx: 0, px: 0, width: '100vw', maxWidth: '100vw', boxSizing: 'border-box', bgcolor: '#fff', background: '#fff' }}>
        {/* Homepage-style Search Bar */}
        <QuickSearch noBackground sx={{ mt: 0, mb: 3, bgcolor: 'none', background: 'none' }} />

        <Box sx={{ display: 'flex', flexDirection: 'row', mt: 5, width: '100vw' }}>
          {/* Sidebar Filters */}
          <Box sx={{
            minWidth: 240,
            maxWidth: 280,
            ml: 0,
            pl: 0,
            marginLeft: 0,
            paddingLeft: 0,
            pr: 0,
            position: 'relative',
            bgcolor: 'transparent',
            borderRadius: '0 1.25rem 1.25rem 0',
            boxShadow: '0 2px 12px 0 #607d8b11',
            p: 3.5,
            height: 'fit-content',
            display: { xs: 'none', md: 'block' },
            fontFamily: 'Segoe UI, Arial, sans-serif',
            position: 'sticky',
            left: 0,
            zIndex: 10,
            borderRight: '1px solid #e3e8ee',
            background: 'none',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            overflow: 'hidden',
            alignSelf: 'flex-start',
            transition: 'box-shadow 0.22s, border-color 0.22s',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
              <SettingsIcon sx={{ fontSize: 32, color: '#607d8b', mr: 1, opacity: 0.9 }} />
              <span style={{ fontWeight: 900, fontSize: 22, color: '#3f51b5', letterSpacing: 0.5, fontFamily: 'Segoe UI, Arial, sans-serif' }}>Filters</span>
            </Box>
            <SidebarFilters onFilterChange={setSidebarFilters} filters={sidebarFilters} stylish />
          </Box>
          <Box sx={{ width: { xs: 0, md: 280 }, display: { xs: 'none', md: 'block' } }} />

          {/* Offers Grid */}
          <Grid container spacing={4} direction="column" sx={{ mx: 'auto', width: '100%', maxWidth: 900, alignItems: 'flex-start', ml: 0, pl: 0, px: 0 }} >
            {filteredOffers.length === 0 && (
              <Box sx={{ mt: 8, color: '#607d8b', fontWeight: 600, fontSize: 22 }}>No offers match your filters.</Box>
            )}
            {filteredOffers.map(offer => (
              <Grid item xs={12} key={offer.id} sx={{ width: '100%', maxWidth: 400 }}>
                <Card sx={{
                  borderRadius: 5,
                  boxShadow: '0 4px 24px 0 #607d8b22',
                  border: '1.5px solid #e3e8ee',
                  background: '#fff',
                  position: 'relative',
                  overflow: 'visible',
                  p: 0,
                  transition: 'all 0.22s cubic-bezier(.4,2,.6,1)',
                  ':before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: 5,
                    height: '100%',
                    borderTopLeftRadius: 20,
                    borderBottomLeftRadius: 20,
                    background: '#607d8b',
                    zIndex: 2
                  },
                  ':hover': {
                    boxShadow: '0 10px 40px 0 #607d8b33',
                    transform: 'translateY(-4px) scale(1.025)',
                    borderColor: '#b0bec5',
                    background: '#f8fafc',
                  },
                  mb: 3
                }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', width: '100%' }}>
                    {/* Image */}
                    <Box sx={{ display: 'flex', alignItems: 'center', pl: 2, pr: 0, py: 2 }}>
                      <CardMedia
                        component="img"
                        image={offer.images?.[0] ? `http://localhost:5001/uploads/${offer.images[0]}` : '/placeholder.jpg'} // Use placeholder if no image exists
                        alt={offer.title || 'Car image'}
                        sx={{ objectFit: 'cover', borderRadius: 3, width: 100, height: 100, boxShadow: '0 3px 18px #607d8b22', border: '1px solid #e3e8ee', minWidth: 100 }}
                      />
                    </Box>
                    {/* Content */}
                    <CardContent sx={{ flex: 1, p: 2.1, pt: 1.2, pb: '16px !important', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Typography variant="h6" fontWeight={900} sx={{ color: '#263238', mb: 0.6, fontSize: 20, letterSpacing: 0.18, lineHeight: 1.18, fontFamily: 'Segoe UI, Arial, sans-serif' }}>
                        {offer.title || offer.carName || 'Car Listing'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <LocationOnIcon sx={{ fontSize: 18, color: '#607d8b', mr: 0.5 }} />
                        <Typography variant="body2" color="#607d8b" sx={{ fontWeight: 700, fontSize: 15, letterSpacing: 0.1, fontFamily: 'Segoe UI, Arial, sans-serif' }}>
                          {offer.wilaya || 'Unknown Wilaya'}
                        </Typography>
                      </Box>
                      <Box sx={{ width: '100%', height: 1, bgcolor: '#e3e8ee', my: 1, borderRadius: 2 }} />
                      <Box sx={{ display: 'flex', gap: 2, mb: 1, mt: 0.5, justifyContent: 'flex-start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EventSeatIcon sx={{ fontSize: 16, color: '#90a4ae' }} />
                          <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500, color: '#607d8b' }}>{offer.seats}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <DoorFrontIcon sx={{ fontSize: 16, color: '#90a4ae' }} />
                          <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500, color: '#607d8b' }}>{offer.doors}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocalGasStationIcon sx={{ fontSize: 16, color: '#90a4ae' }} />
                          <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500, color: '#607d8b' }}>{offer.energy}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <SettingsIcon sx={{ fontSize: 16, color: '#90a4ae' }} />
                          <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500, color: '#607d8b' }}>{offer.transmission}</Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1, color: '#607d8b', fontSize: 14 }}>
                        {offer.description || 'No description available.'} // Display the car description
                      </Typography>
                      <Button
                        component={Link}
                        to={`/car-details/${offer._id}`} // Ensure the correct property (_id) is used for the car ID
                        variant="contained"
                        sx={{
                          borderRadius: 99,
                          background: '#607d8b',
                          color: '#fff',
                          fontWeight: 700,
                          py: 1.15,
                          fontSize: 15,
                          mt: 1.2,
                          boxShadow: '0 2px 10px #607d8b33',
                          letterSpacing: 0.3,
                          textTransform: 'none',
                          fontFamily: 'Segoe UI, Arial, sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                          transition: 'all 0.18s',
                          ':hover': {
                            background: '#455a64',
                            color: '#fff',
                            boxShadow: '0 8px 28px #607d8b33',
                            transform: 'scale(1.035)'
                          }
                        }}
                      >
                        <DirectionsCarIcon sx={{ fontSize: 20, mr: 1, color: '#fff' }} />
                        View Details
                      </Button>
                    </CardContent>
                    {/* Price Badge on the right with vertical divider */}
                    <Box sx={{ display: 'flex', alignItems: 'center', pr: 3, pl: 2, minWidth: 100, height: '100%' }}>
                      <Box sx={{
                        width: 1,
                        height: 54,
                        bgcolor: '#e3e8ee',
                        borderRadius: 2,
                        mx: 2,
                      }} />
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                      }}>
                        <Box sx={{
                          bgcolor: '#f1f5f9',
                          color: '#607d8b',
                          borderRadius: 2,
                          fontWeight: 900,
                          fontSize: 20,
                          boxShadow: '0 2px 8px 0 #607d8b22',
                          border: '1.5px solid #b0bec5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          letterSpacing: 0.2,
                          minWidth: 90,
                          height: 54,
                          px: 3,
                          py: 0.5,
                          fontFamily: 'Segoe UI, Arial, sans-serif',
                          transition: 'box-shadow 0.18s',
                        }}>
                          €{offer.price}
                          <Box component="span" sx={{ fontSize: 13, fontWeight: 500, ml: 0.5, opacity: 0.85 }}>/day</Box>
                        </Box>
                        {/* Extra details under price */}
                        <Box sx={{ mt: 1.2, textAlign: 'center' }}>
                          <Box sx={{ fontSize: 13, color: '#607d8b', fontWeight: 600, mb: 0.3 }}>
                            {offer.year ? `Year: ${offer.year}` : 'Year: 2022'}
                          </Box>
                          <Box sx={{ fontSize: 13, color: '#90a4ae', fontWeight: 500, mb: 0.1 }}>
                            {offer.availableFrom ? `From: ${formatDateDMY(offer.availableFrom)}` : 'From: 01-05-2025'}
                          </Box>
                          <Box sx={{ fontSize: 13, color: '#90a4ae', fontWeight: 500 }}>
                            {offer.availableTo ? `To: ${formatDateDMY(offer.availableTo)}` : 'To: 10-05-2025'}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </React.Fragment>
  );
}
