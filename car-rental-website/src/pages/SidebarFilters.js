import React, { useState } from 'react';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import {
  Box,
  Typography,
  TextField,
  Slider,
  Button,
  Autocomplete,
  Divider,
  Paper,
  Chip,
  Collapse,
  IconButton,
  Fade,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// Helper function to check if two date ranges overlap
// Range 1: [start1, end1], Range 2: [start2, end2]
// Overlap occurs if (start1 <= end2) AND (end1 >= start2)
export const isAvailabilityOverlap = (carAvailableFrom, carAvailableTo, filterFrom, filterTo) => {
  // If either filter date is not set, consider it a match for that boundary
  const filterFromDate = filterFrom ? dayjs(filterFrom) : null;
  const filterToDate = filterTo ? dayjs(filterTo) : null;

  // If car availability dates are not set, it cannot overlap with a specific filter range
  if (!carAvailableFrom || !carAvailableTo) {
    return false;
  }

  const carFromDate = dayjs(carAvailableFrom);
  const carToDate = dayjs(carAvailableTo);

  // Check for overlap: car starts before or on filter end AND car ends after or on filter start
  const startsBeforeFilterEnds = filterToDate ? carFromDate.isSameOrBefore(filterToDate, 'day') : true;
  const endsAfterFilterStarts = filterFromDate ? carToDate.isSameOrAfter(filterFromDate, 'day') : true;

  return startsBeforeFilterEnds && endsAfterFilterStarts;
};


const brands = [
  'Toyota', 'Renault', 'Peugeot', 'Hyundai', 'Volkswagen', 'Kia', 'Dacia', 'Citroën', 'Fiat', 'Seat',
  'BMW', 'Mercedes-Benz', 'Audi', 'Ford', 'Chevrolet', 'Nissan', 'Honda', 'Mazda', 'Jeep', 'Land Rover',
  'Opel', 'Skoda', 'Suzuki', 'Mitsubishi', 'Subaru', 'Porsche', 'Lexus', 'Jaguar', 'Mini', 'Volvo',
  'Tesla', 'Alfa Romeo', 'Infiniti', 'Acura', 'Chery', 'Geely', 'BYD', 'Great Wall', 'Dongfeng',
  'Changan', 'SsangYong', 'Isuzu', 'Daewoo', 'Other'
];
const energies = ['Essence', 'Diesel', 'Hybrid', 'Electric'];
const transmissions = ['Manual', 'Automatic'];
const carTypes = ['SUV', 'VAN', 'STATIONWAGON', 'CITADINE', 'SEDAN']; // Added carTypes
const wilayas = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Algiers", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Menia"
];

// Collapsible section component
const FilterSection = ({ title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Box sx={{
      mb: 1.5,
      bgcolor: open ? 'rgba(241, 245, 249, 0.5)' : 'transparent',
      borderRadius: 2,
      transition: 'all 0.2s ease'
    }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          py: 1,
          px: 1.5,
          borderRadius: 2,
          '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' }
        }}
        onClick={() => setOpen(!open)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {icon}
          <Typography sx={{ fontWeight: 700, color: '#455a64', ml: 1, fontSize: '0.9rem' }}>
            {title}
          </Typography>
        </Box>
        <IconButton size="small" sx={{ color: '#455a64', p: 0.5 }}>
          {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Box>
      <Collapse in={open} timeout="auto">
        <Box sx={{ mt: 0.5, mb: 1, px: 1.5, py: 1 }}>
          {children}
        </Box>
      </Collapse>
    </Box>
  );
};

export default function SidebarFilters({ filters, onFilterChange, stylish, onClose, isMobile }) {
  const [pendingFilters, setPendingFilters] = useState(filters || {});
  const [showApplyEffect, setShowApplyEffect] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPendingFilters({ ...pendingFilters, [name]: value });
  };

  const handleSliderChange = (name) => (_, newValue) => {
    setPendingFilters({ ...pendingFilters, [name]: newValue });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setPendingFilters({ ...pendingFilters, [name]: value });
  };

  const handleApply = () => {
    onFilterChange({ ...pendingFilters });
    setShowApplyEffect(true);
    setTimeout(() => setShowApplyEffect(false), 1500);
  };

  const handleReset = () => {
    setPendingFilters({});
    onFilterChange({});
  };

  // Remove a specific filter
  const handleRemoveFilter = (filterName) => {
    const newFilters = { ...pendingFilters };
    delete newFilters[filterName];
    setPendingFilters(newFilters);
    onFilterChange(newFilters);
    setShowApplyEffect(true);
    setTimeout(() => setShowApplyEffect(false), 1500);
  };

  // Reset a specific filter to its default value
  const handleResetFilter = (filterName) => {
    let newFilters = { ...pendingFilters };

    switch(filterName) {
      case 'priceRange':
        newFilters.priceRange = [0, 100000];
        break;
      case 'seatsRange':
        newFilters.seatsRange = [2, 9];
        break;
      case 'doorsRange':
        newFilters.doorsRange = [2, 5];
        break;
      case 'carType': // Added carType reset
        newFilters.carType = '';
        break;
      default:
        delete newFilters[filterName];
    }

    setPendingFilters(newFilters);
  };

  // Count active filters
  const getActiveFilterCount = () => {
    return Object.keys(pendingFilters).filter(key => {
      if (key === 'priceRange') {
        return pendingFilters[key] &&
               (pendingFilters[key][0] > 0 || pendingFilters[key][1] < 100000);
      }
      if (key === 'seatsRange') {
        return pendingFilters[key] &&
               (pendingFilters[key][0] !== 2 || pendingFilters[key][1] !== 9);
      }
      if (key === 'doorsRange') {
        return pendingFilters[key] &&
               (pendingFilters[key][0] !== 2 || pendingFilters[key][1] !== 5);
      }
      if (key === 'carType') { // Added carType filter count
        return pendingFilters[key] && pendingFilters[key] !== '';
      }
      // For availableFrom/availableTo, count as active if either is set
      if (key === 'availableFrom' || key === 'availableTo') {
          return pendingFilters.availableFrom || pendingFilters.availableTo;
      }
      return pendingFilters[key] && pendingFilters[key] !== '';
    }).length;
  };

  // Format filter value for display
  const getFilterDisplayValue = (key, value) => {
    if (key === 'priceRange') {
      return `DZD ${value[0]} - DZD ${value[1]}`;
    } else if (key === 'seatsRange') {
      return `${value[0]} - ${value[1]} seats`;
    } else if (key === 'doorsRange') {
      return `${value[0]} - ${value[1]} doors`;
    } else if (key === 'availableFrom' || key === 'availableTo') {
      // Only format if the value is a valid date string
      try {
          return dayjs(value).isValid() ? dayjs(value).format('YYYY-MM-DD') : value;
      } catch (e) {
          return value; // Return raw value if dayjs parsing fails
      }
    } else if (key === 'carType') { // Added carType display value
      return value;
    }
    return value;
  };

  // Get filter label
  const getFilterLabel = (key) => {
    const labels = {
      brand: 'Brand',
      energy: 'Energy',
      transmission: 'Transmission',
      wilaya: 'Location',
      carType: 'Car Type', // Added carType label
      seatsRange: 'Seats',
      doorsRange: 'Doors',
      priceRange: 'Price',
      availableFrom: 'From',
      availableTo: 'To'
    };
    return labels[key] || key;
  };

  // Get filter icon
  const getFilterIcon = (key) => {
    switch(key) {
      case 'brand':
        return <BrandingWatermarkIcon fontSize="small" />;
      case 'energy':
        return <LocalGasStationIcon fontSize="small" />;
      case 'transmission':
        return <SettingsIcon fontSize="small" />;
      case 'wilaya':
        return <LocationOnIcon fontSize="small" />;
      case 'seatsRange':
        return <AirlineSeatReclineNormalIcon fontSize="small" />;
      case 'doorsRange':
        return <MeetingRoomIcon fontSize="small" />;
      case 'priceRange':
        return <AttachMoneyIcon fontSize="small" />;
      case 'availableFrom':
      case 'availableTo':
        return <CalendarMonthIcon fontSize="small" />;
      case 'carType': // Added carType icon
        return <DirectionsCarIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const activeFilterCount = getActiveFilterCount();
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <Paper
      elevation={isMobile ? 4 : 0}
      sx={{
        borderRadius: 2,
        border: '1px solid #e2e8f0',
        bgcolor: '#fff',
        boxShadow: isMobile ? '0 10px 30px rgba(0,0,0,0.15)' : '0 10px 30px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.3s ease',
        maxHeight: { xs: isMobile ? 'calc(100vh - 120px)' : 'auto', md: 'calc(100vh - 100px)' },
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: isMobile ? '0 15px 35px rgba(0,0,0,0.2)' : '0 15px 35px rgba(0,0,0,0.12)',
        },
        ...(!isMobile && {
          maxWidth: 300,
          minWidth: 280,
          margin: '0 auto',
        })
      }}
    >
      {/* Header with gradient background */}
      <Box sx={{
        p: 1.5,
        background: 'linear-gradient(135deg, #455a64 0%, #37474f 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ position: 'absolute', top: -15, right: -15, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', zIndex: 0 }} />
        <Box sx={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center' }}>
          <FilterAltIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
            Filters
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {activeFilterCount > 0 && (
            <Chip
              label={activeFilterCount}
              size="small"
              sx={{
                fontWeight: 700,
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                height: 24,
                minWidth: 24,
                '& .MuiChip-label': {
                  px: 1
                }
              }}
            />
          )}

          {isMobile && (
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                ml: 1,
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Active Filters Section */}
      {hasActiveFilters && (
        <Box sx={{
          px: 2,
          py: 1.5,
          borderBottom: '1px solid #e2e8f0',
          bgcolor: 'rgba(241, 245, 249, 0.5)',
          flexShrink: 0
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#455a64', mb: 1, display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>
            <FilterAltIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Active Filters
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {Object.entries(pendingFilters).map(([key, value]) => {
              // Skip empty values or default ranges
              if (!value ||
                  (key === 'priceRange' && value[0] === 0 && value[1] === 100000) ||
                  (key === 'seatsRange' && value[0] === 2 && value[1] === 9) ||
                  (key === 'doorsRange' && value[0] === 2 && value[1] === 5)) {
                return null;
              }

              // Special handling for availability dates to show both if one is set
              if (key === 'availableFrom' && !pendingFilters.availableTo) {
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
                              fontSize: '0.75rem',
                              height: 24,
                              '& .MuiChip-deleteIcon': {
                                  color: '#94a3b8',
                                  fontSize: '0.9rem',
                                  '&:hover': {
                                      color: '#f43f5e'
                                  }
                              },
                              '& .MuiChip-icon': {
                                  color: '#455a64',
                                  fontSize: '0.9rem',
                                  marginLeft: '4px'
                              }
                          }}
                      />
                  );
              }
              if (key === 'availableTo' && !pendingFilters.availableFrom) {
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
                              fontSize: '0.75rem',
                              height: 24,
                              '& .MuiChip-deleteIcon': {
                                  color: '#94a3b8',
                                  fontSize: '0.9rem',
                                  '&:hover': {
                                      color: '#f43f5e'
                                  }
                              },
                              '& .MuiChip-icon': {
                                  color: '#455a64',
                                  fontSize: '0.9rem',
                                  marginLeft: '4px'
                              }
                          }}
                      />
                  );
              }
              // If both are set, show a single chip for the range
              if (key === 'availableFrom' && pendingFilters.availableTo) {
                  return (
                      <Chip
                          key="availabilityRange"
                          icon={getFilterIcon(key)}
                          label={`Available: ${getFilterDisplayValue('availableFrom', pendingFilters.availableFrom)} to ${getFilterDisplayValue('availableTo', pendingFilters.availableTo)}`}
                          onDelete={() => {
                              handleRemoveFilter('availableFrom');
                              handleRemoveFilter('availableTo');
                          }}
                          size="small"
                          sx={{
                              bgcolor: '#fff',
                              border: '1px solid #cbd5e1',
                              color: '#455a64',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              height: 24,
                              '& .MuiChip-deleteIcon': {
                                  color: '#94a3b8',
                                  fontSize: '0.9rem',
                                  '&:hover': {
                                      color: '#f43f5e'
                                  }
                              },
                              '& .MuiChip-icon': {
                                  color: '#455a64',
                                  fontSize: '0.9rem',
                                  marginLeft: '4px'
                              }
                          }}
                      />
                  );
              }
              // Skip availableTo if availableFrom is already handled
              if (key === 'availableTo' && pendingFilters.availableFrom) {
                  return null;
              }


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
                    fontSize: '0.75rem',
                    height: 24,
                    '& .MuiChip-deleteIcon': {
                      color: '#94a3b8',
                      fontSize: '0.9rem',
                      '&:hover': {
                        color: '#f43f5e'
                      }
                    },
                    '& .MuiChip-icon': {
                      color: '#455a64',
                      fontSize: '0.9rem',
                      marginLeft: '4px'
                    }
                  }}
                />
              );
            })}
          </Box>

          {hasActiveFilters && (
            <Button
              size="small"
              startIcon={<RestartAltIcon fontSize="small" />}
              onClick={handleReset}
              sx={{
                mt: 1,
                color: '#64748b',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.75rem',
                padding: '2px 8px',
                minHeight: 0,
                '&:hover': {
                  bgcolor: 'rgba(203, 213, 225, 0.2)',
                }
              }}
            >
              Clear All Filters
            </Button>
          )}
        </Box>
      )}

      {/* Filter content - Scrollable */}
      <Box sx={{
        p: 1.5,
        overflowY: 'auto',
        flex: 1,
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f5f9',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#cbd5e1',
          borderRadius: '4px',
          '&:hover': {
            background: '#94a3b8',
          }
        }
      }}>
        {/* Brand Section */}
        <FilterSection
          title="Brand"
          icon={<BrandingWatermarkIcon sx={{ color: '#455a64', fontSize: '1.1rem' }} />}
        >
          <Box sx={{ position: 'relative' }}>
            <Autocomplete
              size="small"
              options={brands}
              value={pendingFilters.brand || null}
              onChange={(e, value) => handleChange({ target: { name: 'brand', value } })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Brand"
                  variant="outlined"
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      height: 40,
                      '&.Mui-focused fieldset': {
                        borderColor: '#455a64',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#455a64',
                    }
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} style={{ fontSize: '0.85rem', padding: '6px 16px' }}>
                  {option}
                </li>
              )}
            />

            {pendingFilters.brand && (
              <Fade in={true}>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveFilter('brand')}
                  sx={{
                    position: 'absolute',
                    right: -8,
                    top: -8,
                    bgcolor: '#f1f5f9',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    color: '#64748b',
                    p: 0.5,
                    '&:hover': {
                      bgcolor: '#fee2e2',
                      color: '#ef4444'
                    }
                  }}
                >
                  <RestartAltIcon fontSize="small" />
                </IconButton>
              </Fade>
            )}
          </Box>
        </FilterSection>

        {/* Energy Type Section */}
        <FilterSection
          title="Energy Type"
          icon={<LocalGasStationIcon sx={{ color: '#455a64', fontSize: '1.1rem' }} />}
        >
          <Box sx={{ position: 'relative' }}>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 1
            }}>
              <ToggleButton
                value="Gasoline"
                selected={pendingFilters.energy === 'Gasoline'}
                onChange={() => handleChange({ target: { name: 'energy', value: 'Gasoline' } })}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  py: 0.75,
                  '&.Mui-selected': {
                    bgcolor: '#455a64',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#37474f',
                    }
                  },
                  '&:hover': {
                    bgcolor: 'rgba(203, 213, 225, 0.2)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LocalGasStationIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                  Gasoline
                </Box>
              </ToggleButton>

              <ToggleButton
                value="Diesel"
                selected={pendingFilters.energy === 'Diesel'}
                onChange={() => handleChange({ target: { name: 'energy', value: 'Diesel' } })}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  py: 0.75,
                  '&.Mui-selected': {
                    bgcolor: '#455a64',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#37474f',
                    }
                  },
                  '&:hover': {
                    bgcolor: 'rgba(203, 213, 225, 0.2)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LocalGasStationIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                  Diesel
                </Box>
              </ToggleButton>

              <ToggleButton
                value="Hybrid"
                selected={pendingFilters.energy === 'Hybrid'}
                onChange={() => handleChange({ target: { name: 'energy', value: 'Hybrid' } })}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  py: 0.75,
                  '&.Mui-selected': {
                    bgcolor: '#455a64',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#37474f',
                    }
                  },
                  '&:hover': {
                    bgcolor: 'rgba(203, 213, 225, 0.2)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LocalGasStationIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                  Hybrid
                </Box>
              </ToggleButton>

              <ToggleButton
                value="Electric"
                selected={pendingFilters.energy === 'Electric'}
                onChange={() => handleChange({ target: { name: 'energy', value: 'Electric' } })}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  py: 0.75,
                  '&.Mui-selected': {
                    bgcolor: '#455a64',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#37474f',
                    }
                  },
                  '&:hover': {
                    bgcolor: 'rgba(203, 213, 225, 0.2)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ElectricCarIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                  Electric
                </Box>
              </ToggleButton>
            </Box>

            {pendingFilters.energy && (
              <Fade in={true}>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveFilter('energy')}
                  sx={{
                    position: 'absolute',
                    right: -8,
                    top: -8,
                    bgcolor: '#f1f5f9',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    color: '#64748b',
                    p: 0.5,
                    '&:hover': {
                      bgcolor: '#fee2e2',
                      color: '#ef4444'
                    }
                  }}
                >
                  <RestartAltIcon fontSize="small" />
                </IconButton>
              </Fade>
            )}
          </Box>
        </FilterSection>

        {/* Transmission Section */}
        <FilterSection
          title="Transmission"
          icon={<SettingsIcon sx={{ color: '#455a64', fontSize: '1.1rem' }} />}
        >
          <Box sx={{ position: 'relative' }}>
            <ToggleButtonGroup
              value={pendingFilters.transmission || ''}
              exclusive
              onChange={(e, value) => handleChange({ target: { name: 'transmission', value } })}
              aria-label="transmission"
              size="small"
              fullWidth
              sx={{
                display: 'flex',
                '& .MuiToggleButtonGroup-grouped': {
                  flex: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  py: 0.75,
                  '&.Mui-selected': {
                    bgcolor: '#455a64',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#37474f',
                    }
                  },
                  '&:hover': {
                    bgcolor: 'rgba(203, 213, 225, 0.2)',
                  }
                }
              }}
            >
              <ToggleButton value="Manual">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SettingsIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                  Manual
                </Box>
              </ToggleButton>
              <ToggleButton value="Automatic">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SettingsIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                  Auto
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>

            {pendingFilters.transmission && (
              <Fade in={true}>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveFilter('transmission')}
                  sx={{
                    position: 'absolute',
                    right: -8,
                    top: -8,
                    bgcolor: '#f1f5f9',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    color: '#64748b',
                    p: 0.5,
                    '&:hover': {
                      bgcolor: '#fee2e2',
                      color: '#ef4444'
                    }
                  }}
                >
                  <RestartAltIcon fontSize="small" />
                </IconButton>
              </Fade>
            )}
          </Box>
        </FilterSection>

        {/* Location Section */}
        <FilterSection
          title="Location"
          icon={<LocationOnIcon sx={{ color: '#455a64', fontSize: '1.1rem' }} />}
        >
          <Box sx={{ position: 'relative' }}>
            <Autocomplete
              size="small"
              options={wilayas}
              value={pendingFilters.wilaya || null}
              onChange={(e, value) => handleChange({ target: { name: 'wilaya', value } })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Wilaya"
                  variant="outlined"
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      height: 40,
                      '&.Mui-focused fieldset': {
                        borderColor: '#455a64',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#455a64',
                    }
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} style={{ fontSize: '0.85rem', padding: '6px 16px' }}>
                  {option}
                </li>
              )}
            />

            {pendingFilters.wilaya && (
              <Fade in={true}>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveFilter('wilaya')}
                  sx={{
                    position: 'absolute',
                    right: -8,
                    top: -8,
                    bgcolor: '#f1f5f9',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    color: '#64748b',
                    p: 0.5,
                    '&:hover': {
                      bgcolor: '#fee2e2',
                      color: '#ef4444'
                    }
                  }}
                >
                  <RestartAltIcon fontSize="small" />
                </IconButton>
              </Fade>
            )}
          </Box>
        </FilterSection>

        {/* Car Type Section */}
        <FilterSection
          title="Car Type"
          icon={<DirectionsCarIcon sx={{ color: '#455a64', fontSize: '1.1rem' }} />}
        >
          <Box sx={{ position: 'relative' }}>
            <ToggleButtonGroup
              value={pendingFilters.carType || ''}
              exclusive
              onChange={(e, value) => handleChange({ target: { name: 'carType', value } })}
              aria-label="car type"
              size="small"
              fullWidth
              sx={{
                display: 'flex', // Changed to flex
                flexWrap: 'wrap', // Added flexWrap
                gap: 1,
                '& .MuiToggleButtonGroup-grouped': {
                  flexGrow: 1, // Allow items to grow
                  flexBasis: '48%', // Approximate half width for two columns, adjust as needed
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  py: 0.75,
                  '&.Mui-selected': {
                    bgcolor: '#455a64',
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#37474f',
                    }
                  },
                  '&:hover': {
                    bgcolor: 'rgba(203, 213, 225, 0.2)',
                  }
                }
              }}
            >
              {carTypes.map((type) => (
                <ToggleButton key={type} value={type}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DirectionsCarIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                    {type}
                  </Box>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            {pendingFilters.carType && (
              <Fade in={true}>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveFilter('carType')}
                  sx={{
                    position: 'absolute',
                    right: -8,
                    top: -8,
                    bgcolor: '#f1f5f9',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    color: '#64748b',
                    p: 0.5,
                    '&:hover': {
                      bgcolor: '#fee2e2',
                      color: '#ef4444'
                    }
                  }}
                >
                  <RestartAltIcon fontSize="small" />
                </IconButton>
              </Fade>
            )}
          </Box>
        </FilterSection>

        {/* Seats Section */}
        <FilterSection
          title="Seats Range"
          icon={<AirlineSeatReclineNormalIcon sx={{ color: '#455a64', fontSize: '1.1rem' }} />}
        >
          <Box sx={{ px: 1, mt: 1, position: 'relative' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.75rem' }}>
                Min: {pendingFilters.seatsRange?.[0] || 2}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.75rem' }}>
                Max: {pendingFilters.seatsRange?.[1] || 9}
              </Typography>
            </Box>

            <Slider
              value={pendingFilters.seatsRange || [2, 9]}
              onChange={handleSliderChange('seatsRange')}
              valueLabelDisplay="auto"
              min={2}
              max={9}
              step={1}
              sx={{
                color: '#455a64',
                '& .MuiSlider-thumb': {
                  height: 16,
                  width: 16,
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0 0 0 8px rgba(69, 90, 100, 0.16)',
                  },
                },
                '& .MuiSlider-valueLabel': {
                  backgroundColor: '#455a64',
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }
              }}
            />

            {pendingFilters.seatsRange &&
             (pendingFilters.seatsRange[0] !== 2 || pendingFilters.seatsRange[1] !== 9) && (
              <Fade in={true}>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveFilter('seatsRange')}
                  sx={{
                    position: 'absolute',
                    right: -8,
                    top: -8,
                    bgcolor: '#f1f5f9',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    color: '#64748b',
                    p: 0.5,
                    '&:hover': {
                      bgcolor: '#fee2e2',
                      color: '#ef4444'
                    }
                  }}
                >
                  <RestartAltIcon fontSize="small" />
                </IconButton>
              </Fade>
            )}
          </Box>
        </FilterSection>

        {/* Doors Section */}
        <FilterSection
          title="Doors Range"
          icon={<MeetingRoomIcon sx={{ color: '#455a64', fontSize: '1.1rem' }} />}
        >
          <Box sx={{ px: 1, mt: 1, position: 'relative' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.75rem' }}>
                Min: {pendingFilters.doorsRange?.[0] || 2}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.75rem' }}>
                Max: {pendingFilters.doorsRange?.[1] || 5}
              </Typography>
            </Box>

            <Slider
              value={pendingFilters.doorsRange || [2, 5]}
              onChange={handleSliderChange('doorsRange')}
              valueLabelDisplay="auto"
              min={2}
              max={5}
              step={1}
              sx={{
                color: '#455a64',
                '& .MuiSlider-thumb': {
                  height: 16,
                  width: 16,
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0 0 0 8px rgba(69, 90, 100, 0.16)',
                  },
                },
                '& .MuiSlider-valueLabel': {
                  backgroundColor: '#455a64',
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }
              }}
            />

            {pendingFilters.doorsRange &&
             (pendingFilters.doorsRange[0] !== 2 || pendingFilters.doorsRange[1] !== 5) && (
              <Fade in={true}>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveFilter('doorsRange')}
                  sx={{
                    position: 'absolute',
                    right: -8,
                    top: -8,
                    bgcolor: '#f1f5f9',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    color: '#64748b',
                    p: 0.5,
                    '&:hover': {
                      bgcolor: '#fee2e2',
                      color: '#ef4444'
                    }
                  }}
                >
                  <RestartAltIcon fontSize="small" />
                </IconButton>
              </Fade>
            )}
          </Box>
        </FilterSection>

        {/* Price Range Section */}
        <FilterSection
          title="Price Range"
          icon={<AttachMoneyIcon sx={{ fontSize: '1.1rem', color: '#607d8b' }} />}
          defaultOpen={true}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ fontSize: '0.8rem', color: '#546e7a' }}>
              DZD {pendingFilters.priceRange ? pendingFilters.priceRange[0] : 0}
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#546e7a' }}>
              DZD {pendingFilters.priceRange ? pendingFilters.priceRange[1] : 100000}
            </Typography>
          </Box>
          <Slider
            name="priceRange"
            value={pendingFilters.priceRange || [0, 100000]}
            onChange={handleSliderChange('priceRange')}
            valueLabelDisplay="auto"
            min={0}
            max={100000}
            step={1000}
            sx={{
              color: '#607d8b',
              '& .MuiSlider-thumb': {
                backgroundColor: '#455a64',
                boxShadow: '0px 0px 5px rgba(0,0,0,0.2)'
              },
              '& .MuiSlider-track': {
                backgroundColor: '#78909c'
              },
              '& .MuiSlider-rail': {
                backgroundColor: '#cfd8dc'
              }
            }}
          />

        </FilterSection>

        {/* Availability Section */}
        <FilterSection
          title="Availability"
          icon={<CalendarMonthIcon sx={{ color: '#455a64', fontSize: '1.1rem' }} />}
          defaultOpen={false}
        >
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              label="Available From"
              name="availableFrom"
              type="date"
              size="small"
              value={pendingFilters.availableFrom || ''}
              onChange={handleDateChange}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  height: 40,
                  '&.Mui-focused fieldset': {
                    borderColor: '#455a64',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#455a64',
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.85rem',
                }
              }}
              InputLabelProps={{ shrink: true }}
            />

            {pendingFilters.availableFrom && (
              <Fade in={true}>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveFilter('availableFrom')}
                  sx={{
                    position: 'absolute',
                    right: -8,
                    top: -8,
                    bgcolor: '#f1f5f9',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    color: '#64748b',
                    p: 0.5,
                    '&:hover': {
                      bgcolor: '#fee2e2',
                      color: '#ef4444'
                    }
                  }}
                >
                  <RestartAltIcon fontSize="small" />
                </IconButton>
              </Fade>
            )}
          </Box>

          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              label="Available To"
              name="availableTo"
              type="date"
              size="small"
              value={pendingFilters.availableTo || ''}
              onChange={handleDateChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  height: 40,
                  '&.Mui-focused fieldset': {
                    borderColor: '#455a64',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#455a64',
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.85rem',
                }
              }}
              InputLabelProps={{ shrink: true }}
            />

            {pendingFilters.availableTo && (
              <Fade in={true}>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveFilter('availableTo')}
                  sx={{
                    position: 'absolute',
                    right: -8,
                    top: -8,
                    bgcolor: '#f1f5f9',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    color: '#64748b',
                    p: 0.5,
                    '&:hover': {
                      bgcolor: '#fee2e2',
                      color: '#ef4444'
                    }
                  }}
                >
                  <RestartAltIcon fontSize="small" />
                </IconButton>
              </Fade>
            )}
          </Box>
        </FilterSection>

        {/* Add some bottom padding to ensure content doesn't get hidden behind fixed buttons */}
        <Box sx={{ height: 80 }} />
      </Box>

      {/* Fixed Action Buttons */}
      <Box
        sx={{
          p: 1.5,
          borderTop: '1px solid #e2e8f0',
          bgcolor: '#fff',
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          boxShadow: '0 -4px 10px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleApply}
            startIcon={<FilterAltIcon />}
            sx={{
              bgcolor: '#455a64',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              py: 1,
              boxShadow: '0 4px 10px rgba(69, 90, 100, 0.2)',
              '&:hover': {
                boxShadow: '0 6px 15px rgba(69, 90, 100, 0.3)',
                bgcolor: '#37474f'
              }
            }}
          >
            Apply Filters
            {activeFilterCount > 0 && (
              <Chip
                label={activeFilterCount}
                size="small"
                sx={{
                  ml: 1,
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                }}
              />
            )}
          </Button>

          {showApplyEffect && (
            <Fade in={showApplyEffect} timeout={300} onExited={() => setShowApplyEffect(false)}>
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255,255,255,0.9)',
                borderRadius: 2,
                zIndex: 10
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: '#10b981' }}>
                  <CheckCircleOutlineIcon sx={{ mr: 1 }} />
                  <Typography sx={{ fontWeight: 600 }}>Filters Applied</Typography>
                </Box>
              </Box>
            </Fade>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleReset}
            startIcon={<RestartAltIcon />}
            sx={{
              borderColor: '#cbd5e1',
              color: '#64748b',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              py: 1,
              '&:hover': {
                borderColor: '#94a3b8',
                bgcolor: 'rgba(203, 213, 225, 0.1)',
              }
            }}
          >
            Reset
          </Button>

          {isMobile && (
            <Button
              variant="outlined"
              fullWidth
              onClick={onClose}
              sx={{
                borderColor: '#cbd5e1',
                color: '#64748b',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                py: 1,
                '&:hover': {
                  borderColor: '#94a3b8',
                  bgcolor: 'rgba(203, 213, 225, 0.1)',
                }
              }}
            >
              Close
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
