import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  InputAdornment, 
  Typography, 
  Fade,
  Autocomplete
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import dayjs from 'dayjs';

// List of all Algerian wilayas (from MapPage.js)
const wilayas = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Algiers", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Menia"
];

const QuickSearch = ({ noBackground = false, isLoggedIn }) => {
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs().add(3, 'day'));
  const [location, setLocation] = useState(null);
  const [locationInput, setLocationInput] = useState('');
  const [isDateInvalid, setIsDateInvalid] = useState(false);

  useEffect(() => {
    if (startDate && endDate) {
      // Check if endDate is strictly before startDate (ignoring time for this specific validation if needed, or include time)
      // For DateTimePicker, comparing directly should work with time.
      if (dayjs(endDate).isBefore(dayjs(startDate))) {
        setIsDateInvalid(true);
      } else {
        setIsDateInvalid(false);
      }
    } else {
      // If either date is not set, consider it invalid for submission purposes
      setIsDateInvalid(true); 
    }
  }, [startDate, endDate]);

  return (
    <Box
      sx={{
        ...(noBackground
          ? {
              background: '#fff',
              padding: 0,
              minHeight: 0,
              justifyContent: 'flex-start',
              marginTop: 0,
            }
          : {
              background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%), url("https://images.unsplash.com/photo-1485291571150-772bcfc10da5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              padding: '2rem',
              minHeight: '600px',
              justifyContent: 'center',
            }
        ),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Fade in timeout={1000}>
        <Box sx={{ textAlign: 'center', mb: 0, mt: 0, color: 'white' }}>
          <Typography variant="h2" sx={{ fontWeight: 'bold', mb: noBackground ? 0 : 2 }}>
            Find Your Perfect Ride
          </Typography>
          <Typography variant="h5" sx={{ mb: noBackground ? 0 : 4 }}>
            Rent a car anywhere, anytime
          </Typography>
        </Box>
      </Fade>

      <Fade in timeout={1500}>
        <Paper
          elevation={6}
          sx={{
            p: noBackground ? 0 : 4,
            borderRadius: noBackground ? 0 : 3,
            width: '100%',
            maxWidth: 1000,
            borderRadius: 3,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            zIndex: 2
          }}
        >
          <Box sx={{ flex: 2 }}>
            <Autocomplete
              fullWidth
              options={wilayas}
              value={location}
              onChange={(event, newValue) => setLocation(newValue)}
              inputValue={locationInput}
              onInputChange={(event, newInputValue) => setLocationInput(newInputValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select Wilaya"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon sx={{ color: '#475569' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  borderRadius: 2,
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#475569',
                  },
                },
                '& .MuiAutocomplete-popupIndicator': {
                  color: '#475569',
                },
              }}
              filterOptions={(options, state) => {
                // If no wilaya selected or input, show all wilayas
                if (!state.inputValue) return options;
                // Otherwise, filter as usual
                return options.filter(option => option.toLowerCase().includes(state.inputValue.toLowerCase()));
              }}
            />
          </Box>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ flex: 1.5 }}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                minDate={dayjs()}
                sx={{ width: '100%' }}
              />
            </Box>

            <Box sx={{ flex: 1.5 }}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                minDate={startDate} // Keeps visual cue, but button logic is main guard
                sx={{ width: '100%' }}
              />
            </Box>
          </LocalizationProvider>

          <Button
            variant="contained"
            size="large"
            startIcon={<DirectionsCarIcon />}
            disabled={isDateInvalid} // Disable button if dates are invalid
            sx={{
              flex: 1,
              height: '56px',
              backgroundColor: '#475569',
              borderRadius: 2,
              fontSize: '1.1rem',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#334155',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(71,85,105,0.4)'
              },
              transition: 'all 0.3s ease'
            }}
            onClick={() => {
              if (!startDate || !endDate) return;
              const start = startDate.format('YYYY-MM-DD');
              const end = endDate.format('YYYY-MM-DD');
              let url = `/offers?startDate=${start}&endDate=${end}`;
              if (location) {
                url += `&wilaya=${encodeURIComponent(location)}`;
              }
              window.location.href = url;
            }}
          >
            Find Cars
          </Button>
        </Paper>
      </Fade>

      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,166,153,0.2) 0%, rgba(0,166,153,0) 70%)',
          zIndex: 1
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          zIndex: 1
        }}
      />
    </Box>
  );
};

export default QuickSearch;
