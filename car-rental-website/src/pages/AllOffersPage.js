import React, { useEffect, useState } from 'react';
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
  Avatar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
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
        if (!response.ok) throw new Error('Failed to fetch offers');
        const data = await response.json();
        setOffers(data);
      } catch (error) {
        console.error('Error fetching offers:', error.message);
      }
    };
    fetchOffers();
  }, [sidebarFilters]);

  function isDateRangeOverlap(offerFrom, offerTo, selectedFrom, selectedTo) {
    if (!selectedFrom || !selectedTo) return true;
    const offerStart = dayjs(offerFrom);
    const offerEnd = dayjs(offerTo);
    const selStart = dayjs(selectedFrom);
    const selEnd = dayjs(selectedTo);
    return offerEnd.isAfter(selStart) && offerStart.isBefore(selEnd);
  }

  const filteredOffers = offers.filter(offer => {
    const matchesSearch =
      offer.carName.toLowerCase().includes(search.toLowerCase()) ||
      offer.brand.toLowerCase().includes(search.toLowerCase()) ||
      offer.wilaya.toLowerCase().includes(search.toLowerCase());
    const matchesWilaya = !query.wilaya || offer.wilaya === query.wilaya;
    const matchesDate =
      !query.startDate || !query.endDate ||
      isDateRangeOverlap(
        offer.availabilityStart,
        offer.availabilityEnd,
        query.startDate,
        query.endDate
      );
    const matchesSidebar = matchesSidebarFilters(offer);
    return matchesSearch && matchesWilaya && matchesDate && matchesSidebar;
  });

  function matchesSidebarFilters(offer) {
    const f = sidebarFilters;
    if (f.brand && offer.brand !== f.brand) return false;
    if (f.energy && offer.energy !== f.energy) return false;
    if (f.transmission && offer.transmission !== f.transmission) return false;
    if (f.wilaya && offer.wilaya !== f.wilaya) return false;
    if (f.seatsRange && (Number(offer.seats) < f.seatsRange[0] || Number(offer.seats) > f.seatsRange[1])) return false;
    if (f.doorsRange && (Number(offer.doors) < f.doorsRange[0] || Number(offer.doors) > f.doorsRange[1])) return false;
    if (f.priceRange && (offer.price < f.priceRange[0] || offer.price > f.priceRange[1])) return false;
    if (f.availableFrom && dayjs(offer.availableFrom).isBefore(dayjs(f.availableFrom))) return false;
    if (f.availableTo && dayjs(offer.availableTo).isAfter(dayjs(f.availableTo))) return false;
    return true;
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
        p: 0,
        pt: 0,
        mx: 0,
        px: 0,
        width: '100%',
        boxSizing: 'border-box',
        bgcolor: '#f8fafc',
        minHeight: '100vh'
      }}>
        <QuickSearch noBackground sx={{ mt: 0, mb: 3, bgcolor: 'none', background: 'none' }} />
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
              justifyContent: 'space-between',
              mb: 3,
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#334155' }}>
                {filteredOffers.length} {filteredOffers.length === 1 ? 'Car' : 'Cars'} Available
              </Typography>
              <Paper
                component="form"
                elevation={0}
                sx={{
                  p: '2px 4px',
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  width: 280,
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                <InputAdornment position="start" sx={{ pl: 1 }}>
                  <SearchIcon sx={{ color: '#64748b' }} />
                </InputAdornment>
                <input
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    padding: '10px 8px',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    backgroundColor: 'transparent'
                  }}
                  placeholder="Search cars..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Paper>
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
                <Paper elevation={0} sx={{
                  p: 4,
                  borderRadius: 3,
                  textAlign: 'center',
                  border: '1px dashed #cbd5e1',
                  bgcolor: 'rgba(241, 245, 249, 0.7)'
                }}>
                  <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 600, mb: 1 }}>
                    No cars match your filters
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Try adjusting your filters or search criteria
                  </Typography>
                </Paper>
              ) : (
                filteredOffers.map((offer) => (
                  <Grid item xs={12} key={offer.id} sx={{ width: '100%' }}>
                    <Card sx={{
                      borderRadius: 2,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                      border: '1px solid #e2e8f0',
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
                        bgcolor: '#64748b',
                        borderRadius: '4px 0 0 4px',
                      }
                    }}>
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
                            <Typography variant="h6" sx={{
                              fontWeight: 700,
                              color: '#1e293b',
                              fontSize: '1.25rem'
                            }}>
                              {offer.title || offer.carName || 'Car Listing'}
                            </Typography>
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
                              <span>€{offer.price}</span>
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}> /day</span>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationOnIcon sx={{ color: '#ef4444', mr: 0.5 }} />
                            <Typography variant="body2" sx={{
                              color: '#64748b',
                              fontWeight: 600
                            }}>
                              {offer.wilaya || 'Unknown Location'}
                            </Typography>
                            
                            {(offer.ownerName || offer.owner) && (
                              <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                                <PersonIcon sx={{ color: '#64748b', fontSize: 18, mr: 0.5 }} />
                                <Typography variant="body2" sx={{
                                  color: '#64748b',
                                  fontWeight: 600
                                }}>
                                  {offer.ownerName?.firstName} {offer.ownerName?.lastName || 
                                   offer.owner?.firstName} {offer.owner?.lastName}
                                </Typography>
                              </Box>
                            )}
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
                            {(offer.ownerName || offer.owner) && (
                              <Chip
                                avatar={
                                  <Avatar sx={{ bgcolor: '#e2e8f0', color: '#475569', width: 24, height: 24 }}>
                                    {offer.ownerName?.firstName?.charAt(0) || offer.owner?.firstName?.charAt(0) || 'U'}
                                  </Avatar>
                                }
                                label={`${offer.ownerName?.firstName || offer.owner?.firstName || ''} ${offer.ownerName?.lastName || offer.owner?.lastName || 'Owner'}`}
                                size="small"
                                sx={{
                                  bgcolor: '#f1f5f9',
                                  color: '#475569',
                                  fontWeight: 500,
                                  borderRadius: 1
                                }}
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
                          <Button
                            component={Link}
                            to={`/car-details/${offer._id}`}
                            variant="contained"
                            sx={{
                              alignSelf: 'flex-start',
                              bgcolor: '#64748b',
                              color: 'white',
                              borderRadius: 1,
                              px: 3,
                              py: 1,
                              fontWeight: 600,
                              textTransform: 'none',
                              '&:hover': {
                                bgcolor: '#475569',
                              }
                            }}
                          >
                            <DirectionsCarIcon sx={{ mr: 1 }} /> View Details
                          </Button>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </Box>
        </Box>
      </Box>
    </React.Fragment>
  );
}
