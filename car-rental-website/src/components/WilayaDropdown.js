import React from 'react';
import { Autocomplete, TextField, InputAdornment } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Limited list of Algerian wilayas
const wilayas = [
  "Annaba", "Alger", "Oran", "Setif", "Constantine", "Bejaia"
];

export default function WilayaDropdown({ value, onChange, sx }) {
  return (
    <Autocomplete
      fullWidth
      options={wilayas}
      value={value}
      onChange={(event, newValue) => onChange(newValue || 'Algiers')}
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
      sx={sx}
    />
  );
}
