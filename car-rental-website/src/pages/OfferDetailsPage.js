import React from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableRow, Paper, Avatar } from '@mui/material';

import { useNavigate, useParams } from 'react-router-dom';

// Dummy data for demonstration. Replace with real data fetching logic.
const offers = [
  {
    id: 1,
    title: 'Toyota Yaris 2020',
    images: [
      'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg',
      'https://images.pexels.com/photos/170782/pexels-photo-170782.jpeg',
    ],
    brand: 'Toyota',
    price: 40,
    location: 'Algiers',
    seats: 5,
    doors: 4,
    energy: 'Essence',
    transmission: 'Automatic',
    poster: {
      name: 'Ali Benali',
      location: 'Algiers',
      phone: '+213 555 123 456',
      avatar: '',
    },
  },
  // ... more offers
];

export default function OfferDetailsPage() {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const offer = offers.find((o) => String(o.id) === String(offerId));

  if (!offer) return <Box sx={{ p: 4 }}>Offer not found.</Box>;

  const details = [
    ['Brand', offer.brand],
    ['Price (€)', offer.price],
    ['Location', offer.location],
    ['Seats', offer.seats],
    ['Doors', offer.doors],
    ['Energy', offer.energy],
    ['Transmission', offer.transmission],
  ];

  const posterDetails = [
    ['Name', offer.poster.name],
    ['Location', offer.poster.location],
    ['Phone', offer.poster.phone],
  ];

  const handleBookNow = () => {
    // Navigate to chat and send message automatically
    navigate(`/chat/${offer.poster.name}`, { state: { autoMessage: 'I want to book this car', offerId: offer.id } });
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', my: 4, p: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 2, color: '#607d8b' }}>{offer.title}</Typography>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ color: '#607d8b', fontWeight: 700, mb: 1 }}>Images</Typography>
        <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, pb: 1 }}>
          {offer.images.map((img, idx) => (
            <Box key={idx} sx={{ minWidth: 260, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#eceff1', borderRadius: 2, boxShadow: 1 }}>
              <img src={img} alt={offer.title} style={{ maxHeight: 160, maxWidth: 240, borderRadius: 12 }} />
            </Box>
          ))}
        </Box>
      </Box>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableBody>
            {details.map(([label, value]) => (
              <TableRow key={label}>
                <TableCell sx={{ fontWeight: 700, color: '#607d8b', width: 120 }}>{label}</TableCell>
                <TableCell>{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#607d8b', mb: 1 }}>Poster Info</Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell rowSpan={3} sx={{ width: 80 }}>
                <Avatar src={offer.poster.avatar} sx={{ width: 56, height: 56, bgcolor: '#607d8b' }}>{offer.poster.name[0]}</Avatar>
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell>{offer.poster.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
              <TableCell>{offer.poster.location}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
              <TableCell>{offer.poster.phone}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
