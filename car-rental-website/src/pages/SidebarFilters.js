

import React, { useState } from 'react';
import { Box, Typography, TextField, MenuItem, Slider, Button, ToggleButton, ToggleButtonGroup, Autocomplete, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';

const brands = [
  'Toyota', 'Renault', 'Peugeot', 'Hyundai', 'Volkswagen', 'Kia', 'Dacia', 'Citroën', 'Fiat', 'Seat',
  'BMW', 'Mercedes-Benz', 'Audi', 'Ford', 'Chevrolet', 'Nissan', 'Honda', 'Mazda', 'Jeep', 'Land Rover',
  'Opel', 'Skoda', 'Suzuki', 'Mitsubishi', 'Subaru', 'Porsche', 'Lexus', 'Jaguar', 'Mini', 'Volvo',
  'Tesla', 'Alfa Romeo', 'Infiniti', 'Acura', 'Chery', 'Geely', 'BYD', 'Great Wall', 'Dongfeng',
  'Changan', 'SsangYong', 'Isuzu', 'Daewoo', 'Other'
];
const energies = ['Essence', 'Diesel', 'Hybrid', 'Electric'];
const transmissions = ['Manual', 'Automatic'];
const wilayas = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Algiers", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Menia"
];

export default function SidebarFilters({ filters, onFilterChange, stylish }) {
  const [pendingFilters, setPendingFilters] = useState(filters);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPendingFilters({ ...pendingFilters, [name]: value });
  };

  const handleSliderChange = (_, newValue) => {
    setPendingFilters({ ...pendingFilters, priceRange: newValue });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setPendingFilters({ ...pendingFilters, [name]: value });
  };

  const handleApply = () => {
    onFilterChange({ ...pendingFilters });
  };

  const handleReset = () => {
    setPendingFilters({});
    onFilterChange({});
  };

  // Minimal, blue-grey palette, no background/gradient
  const fieldSx = stylish ? {
    mb: 2.3,
    borderRadius: 2.5,
    background: 'none',
    boxShadow: 'none',
    '& label': { fontWeight: 700, color: '#607d8b', fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: 0.2 },
    '& .MuiInputBase-root': {
      fontWeight: 700,
      borderRadius: 2.5,
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
      background: 'none',
      transition: 'box-shadow .22s, border-color .22s',
      boxShadow: 'none',
      '&:hover': { boxShadow: '0 2px 10px #b0bec522', borderColor: '#607d8b' },
      '&.Mui-focused': { boxShadow: '0 4px 16px #607d8b44', borderColor: '#607d8b' },
    },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#b0bec5' },
    '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#607d8b' },
    '& .MuiSelect-select': { fontWeight: 700, color: '#263238' },
  } : { mb: 2 };

  const groupSx = stylish ? {
    p: 2.2, mb: 2.5, borderRadius: 3,
    background: 'none',
    boxShadow: 'none',
    border: '1.5px solid #b0bec5',
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none',
  } : {};

  const dividerSx = stylish ? { my: 2.5, bgcolor: '#b0bec5', height: 2, borderRadius: 2 } : { my: 2 };
  const priceLabelSx = stylish ? { mt: 2, mb: 1, fontWeight: 800, color: '#607d8b', letterSpacing: 0.3, fontSize: 16, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' } : { mt: 2, mb: 1, fontWeight: 500, color: '#334155' };
  const resetBtnSx = stylish ? {
    mt: 2.5, fontWeight: 900, borderRadius: 99,
    background: '#607d8b', color: '#fff',
    boxShadow: '0 2px 10px #b0bec522', letterSpacing: 0.7, fontSize: 16,
    fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
    py: 1.2,
    '&:hover': { background: '#455a64', color: '#fff', boxShadow: '0 6px 18px #b0bec544' },
    transition: 'box-shadow 0.18s, background 0.18s',
  } : { mt: 2 };

  const filterBtnSx = {
    mt: 2.5, fontWeight: 900, borderRadius: 99,
    background: '#607d8b', color: '#fff',
    boxShadow: '0 2px 10px #b0bec522', letterSpacing: 0.7, fontSize: 16,
    fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
    py: 1.2,
    '&:hover': { background: '#455a64', color: '#fff', boxShadow: '0 6px 18px #b0bec544' },
    transition: 'box-shadow 0.18s, background 0.18s',
  };

  return (
    <Box sx={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontWeight: 500, letterSpacing: 0.1 }}>
      <Typography sx={{ fontWeight: 900, fontSize: 21, color: '#607d8b', letterSpacing: 0.5, mb: 2, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
        Customize your search
      </Typography>
      <Box sx={groupSx}>
        <ToggleButtonGroup
          color="primary"
          value={filters.brand || ''}
          exclusive
          onChange={(e, value) => handleChange({ target: { name: 'brand', value } })}
          sx={{ mb: 2, flexWrap: 'wrap', borderRadius: 2, background: '#eceff1', p: 0.5 }}
        >
          <ToggleButton value="">Any</ToggleButton>
          {brands.slice(0, 5).map(b => (
            <ToggleButton key={b} value={b}>{b}</ToggleButton>
          ))}
        </ToggleButtonGroup>
        <ToggleButtonGroup
          color="primary"
          value={filters.energy || ''}
          exclusive
          onChange={(e, value) => handleChange({ target: { name: 'energy', value } })}
          sx={{ mb: 2, flexWrap: 'wrap', borderRadius: 2, background: '#eceff1', p: 0.5 }}
        >
          <ToggleButton value="">Any</ToggleButton>
          {energies.map(e => (
            <ToggleButton key={e} value={e} sx={{ display: 'flex', alignItems: 'center' }}>
              {e === 'Electric' ? <span style={{ color: '#00bcd4', marginRight: 4 }}>⚡</span> : null}
              {e}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <ToggleButtonGroup
          color="primary"
          value={filters.transmission || ''}
          exclusive
          onChange={(e, value) => handleChange({ target: { name: 'transmission', value } })}
          sx={{ mb: 2, flexWrap: 'wrap', borderRadius: 2, background: '#eceff1', p: 0.5 }}
        >
          <ToggleButton value="">Any</ToggleButton>
          {transmissions.map(t => (
            <ToggleButton key={t} value={t} sx={{ display: 'flex', alignItems: 'center' }}>
              {t === 'Automatic' ? <span style={{ color: '#607d8b', marginRight: 4 }}>⚙️</span> : null}
              {t}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Autocomplete
          options={wilayas}
          value={filters.wilaya || null}
          onChange={(e, value) => handleChange({ target: { name: 'wilaya', value } })}
          renderInput={(params) => <TextField {...params} label="Wilaya" sx={fieldSx} />}
          sx={{ mb: 2 }}
        />
      </Box>
      <Box sx={dividerSx} />
      <Box sx={groupSx}>
        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend" sx={{ color: '#607d8b', fontWeight: 700 }}>Seats</FormLabel>
          <RadioGroup
            row
            name="seats"
            value={filters.seats || ''}
            onChange={handleChange}
          >
            {[2, 4, 5, 7, 9].map((val) => (
              <FormControlLabel key={val} value={val.toString()} control={<Radio sx={{ color: '#607d8b' }} />} label={val} />
            ))}
          </RadioGroup>
        </FormControl>
        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend" sx={{ color: '#607d8b', fontWeight: 700 }}>Doors</FormLabel>
          <RadioGroup
            row
            name="doors"
            value={filters.doors || ''}
            onChange={handleChange}
          >
            {[2, 3, 4, 5, 6].map((val) => (
              <FormControlLabel key={val} value={val.toString()} control={<Radio sx={{ color: '#607d8b' }} />} label={val} />
            ))}
          </RadioGroup>
        </FormControl>
      </Box>
      <Box sx={dividerSx} />
      <Box sx={groupSx}>
        <Typography sx={priceLabelSx}>Price Range (€)</Typography>
        <Slider
          value={pendingFilters.priceRange || [0, 100]}
          onChange={handleSliderChange}
          valueLabelDisplay="auto"
          min={0}
          max={200}
          sx={{ mb: 2, color: '#1976d2', '& .MuiSlider-thumb': { bgcolor: '#607d8b' }, '& .MuiSlider-track': { bgcolor: '#1976d2' } }}
        />
      </Box>
      <Box sx={dividerSx} />
      <Box sx={groupSx}>
        <TextField
          fullWidth
          label="Available From"
          name="availableFrom"
          type="date"
          value={pendingFilters.availableFrom || ''}
          onChange={handleDateChange}
          sx={fieldSx}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          label="Available To"
          name="availableTo"
          type="date"
          value={pendingFilters.availableTo || ''}
          onChange={handleDateChange}
          sx={fieldSx}
          InputLabelProps={{ shrink: true }}
        />
      </Box>
      <Button variant={stylish ? 'contained' : 'outlined'} color="primary" fullWidth sx={filterBtnSx} onClick={handleApply}>
        Filter
      </Button>
      <Button variant={stylish ? 'contained' : 'outlined'} color="primary" fullWidth sx={resetBtnSx} onClick={handleReset}>
        Reset
      </Button>
    </Box>
  );
}
