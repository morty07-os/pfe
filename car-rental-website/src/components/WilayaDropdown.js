import React from 'react';
import { Autocomplete, TextField, InputAdornment } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// List of all Algerian wilayas
const wilayas = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Algiers", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Menia"
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
