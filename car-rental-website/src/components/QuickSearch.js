import React from 'react'; // Removed useState, useEffect
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  // Removed Typography, Fade, Autocomplete, Button
} from '@mui/material';
// Removed LocalizationProvider, DatePicker, AdapterDayjs
import SearchIcon from '@mui/icons-material/Search'; // Added SearchIcon
import RestartAltIcon from '@mui/icons-material/RestartAlt'; // Added RestartAltIcon
// Removed LocationOnIcon, DirectionsCarIcon
// Removed dayjs

// Removed wilayas constant

// Added search and onSearchChange props
const QuickSearch = ({ noBackground = false, search, onSearchChange }) => {
  // Removed state variables: startDate, endDate, location, locationInput, isDateInvalid
  // Removed useEffect hook

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
              // Kept background for potential other uses, though not used in AllOffersPage with noBackground=true
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
      {/* Removed Fade and Box with Typography for title and subtitle */}

      {/* Adjusted Paper styling */}
      <Paper
        elevation={6}
        sx={{
          p: noBackground ? '8px 12px' : 4, // Adjusted padding for noBackground
          borderRadius: noBackground ? 5 : 3, // Adjusted border radius for noBackground
          width: '100%',
          maxWidth: noBackground ? 420 : 1000, // Adjusted max width for noBackground
          display: 'flex', // Keep flex display for the input and icon
          alignItems: 'center', // Align items vertically
          gap: noBackground ? 1.5 : 3, // Adjusted gap for noBackground
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          zIndex: 2,
          // Added styles from AllOffersPage search input Paper
          border: noBackground ? '2px solid rgba(203, 213, 225, 0.8)' : 'none',
          boxShadow: noBackground ? '0 10px 30px rgba(15, 23, 42, 0.12)' : '0 10px 30px rgba(0,0,0,0.08)',
          transition: noBackground ? 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
          '&:hover': noBackground ? {
            boxShadow: '0 15px 35px rgba(15, 23, 42, 0.15)',
            borderColor: '#94a3b8',
            transform: 'translateY(-3px) scale(1.01)'
          } : {},
          '&:focus-within': noBackground ? {
            boxShadow: '0 15px 35px rgba(15, 23, 42, 0.18)',
            borderColor: '#475569',
            borderWidth: '2px',
            transform: 'translateY(-3px) scale(1.01)'
          } : {},
          overflow: 'hidden',
          '&::before': noBackground ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: 'linear-gradient(90deg, #475569, #64748b)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          } : {},
          '&:focus-within::before': noBackground ? {
            opacity: 1
          } : {},
          '&::after': noBackground ? {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '10%',
            width: '80%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.2), transparent)',
            opacity: 0.5
          } : {}
        }}
      >
        {/* Added Search Icon Box from AllOffersPage */}
        {noBackground && (
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
        )}

        {/* Removed Autocomplete for location */}
        {/* Removed LocalizationProvider and DatePickers */}
        {/* Removed Button */}

        {/* Kept and updated input field */}
        <input
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            padding: noBackground ? '16px 0' : '16px 12px', // Adjusted padding
            fontSize: '1.05rem',
            fontFamily: 'inherit',
            backgroundColor: 'transparent',
            color: '#334155',
            fontWeight: 500,
            letterSpacing: '0.3px'
          }}
          placeholder="Search cars by brand, model or location..."
          value={search} // Use search prop
          onChange={(e) => onSearchChange(e.target.value)} // Use onSearchChange prop
        />
         {search && ( // Added clear button logic from AllOffersPage
          <IconButton
            size="small"
            onClick={() => onSearchChange('')}
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

      {/* Removed decorative elements */}
    </Box>
  );
};

export default QuickSearch;
