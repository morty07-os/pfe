import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Typography,
    Grid,
    CardMedia,
    Button,
    Container,
    Paper,
    TextField,
    CircularProgress,
    Alert,
    IconButton,
    Chip,
    Divider,
    Stack
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Navbar from '../components/Navbar'; // Assuming Navbar is in components
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SettingsIcon from '@mui/icons-material/Settings';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import dayjs from 'dayjs';

const BookingPage = () => {
    const { carId } = useParams();
    const navigate = useNavigate();
    const [carDetails, setCarDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [startDate, setStartDate] = useState(null); // Changed to null for DatePicker
    const [endDate, setEndDate] = useState(null); // Changed to null for DatePicker
    const [totalCost, setTotalCost] = useState(0);
    const [bookingError, setBookingError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState('');

    useEffect(() => {
        const fetchCarDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5001/api/cars/details/${carId}`);
                setCarDetails(response.data);
                setError('');
            } catch (err) {
                console.error("Error fetching car details:", err);
                setError('Failed to load car details. Please try again later or check if the car ID is correct.');
                setCarDetails(null);
            } finally {
                setLoading(false);
            }
        };

        if (carId) {
            fetchCarDetails();
        }
    }, [carId]);

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setBookingError('');
        setBookingSuccess('');

        if (!startDate || !endDate) {
            setBookingError('Please select both start and end dates.');
            return;
        }
        // Ensure dayjs objects for comparison
        const start = dayjs(startDate);
        const end = dayjs(endDate);

        if (start.isSame(end) || start.isAfter(end)) {
            setBookingError('End date must be after start date.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setBookingError('You must be logged in to make a booking.');
                return;
            }

            const response = await axios.post('http://localhost:5001/api/bookings', {
                car: carId,
                startDate: startDate.toISOString(), // Send ISO string to backend
                endDate: endDate.toISOString(),   // Send ISO string to backend
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 201) {
                setBookingSuccess('Booking successful! Your booking is pending approval.');
                // navigate('/my-bookings'); // Optional: redirect
            } else {
                setBookingError(response.data.message || 'Failed to create booking. Please try again.');
            }
        } catch (err) {
            console.error("Error creating booking:", err);
            setBookingError(err.response?.data?.message || 'An error occurred while creating the booking.');
        }
    };
    
    // Helper to get the primary image URL
    const getImageUrl = (car) => {
        if (!car) return '';
        const imagePath = car.images?.[0] || car.image; // Prefer images array, fallback to single image
        if (!imagePath) return 'https://via.placeholder.com/600x400?text=No+Image'; // Placeholder
        return imagePath.startsWith('http') ? imagePath : `http://localhost:5001/${imagePath.replace(/\\/g, '/')}`;
    };

    const calculateTotalCost = () => {
        if (startDate && endDate && carDetails?.pricePerDay) {
            const start = dayjs(startDate);
            const end = dayjs(endDate);
            if (end.isAfter(start)) {
                const numberOfDays = end.diff(start, 'day');
                if (numberOfDays > 0) {
                    setTotalCost(numberOfDays * carDetails.pricePerDay);
                } else {
                    setTotalCost(0); // Reset if dates are invalid or same day
                }
            } else {
                setTotalCost(0); // Reset if end date is not after start date
            }
        } else {
            setTotalCost(0);
        }
    };

    useEffect(() => {
        calculateTotalCost();
    }, [startDate, endDate, carDetails]);


    const shouldDisableDate = (date) => {
        const today = dayjs().startOf('day');
        if (date.isBefore(today)) {
            return true; // Disable past dates
        }

        if (carDetails?.availabilityStart && date.isBefore(dayjs(carDetails.availabilityStart).startOf('day'))) {
            return true; // Disable dates before car's general availability start
        }
        if (carDetails?.availabilityEnd && date.isAfter(dayjs(carDetails.availabilityEnd).startOf('day'))) {
            return true; // Disable dates after car's general availability end
        }

        if (carDetails?.bookedDates && carDetails.bookedDates.length > 0) {
            for (const booking of carDetails.bookedDates) {
                const bookedStart = dayjs(booking.startDate).startOf('day');
                const bookedEnd = dayjs(booking.endDate).startOf('day');
                if (date.isSame(bookedStart) || date.isSame(bookedEnd) || (date.isAfter(bookedStart) && date.isBefore(bookedEnd))) {
                    return true; // Disable dates within a booked range
                }
            }
        }
        return false;
    };


    if (loading) {
        return (
            <>
                <Navbar sx={{ backgroundColor: '#111', color: '#fff' }} iconColor="#fff" />
                <Container sx={{ py: 5, textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography>Loading car details...</Typography>
                </Container>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar sx={{ backgroundColor: '#111', color: '#fff' }} iconColor="#fff" />
                <Container sx={{ py: 5 }}>
                    <Alert severity="error">{error}</Alert>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                        Go Back
                    </Button>
                </Container>
            </>
        );
    }

    if (!carDetails) {
        return (
            <>
                <Navbar sx={{ backgroundColor: '#111', color: '#fff' }} iconColor="#fff" />
                <Container sx={{ py: 5 }}>
                    <Alert severity="warning">No car details found.</Alert>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                        Go Back
                    </Button>
                </Container>
            </>
        );
    }
    
    const carName = carDetails.carName || `${carDetails.brand} ${carDetails.model}`;

    return (
        <>
            <Navbar sx={{ backgroundColor: '#111', color: '#fff' }} iconColor="#fff" />
            <Box sx={{ bgcolor: '#f8fafc', minHeight: 'calc(100vh - 64px)', py: 4 }}>
                <Container maxWidth="lg">
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(-1)}
                        sx={{ mb: 3, color: '#475569', '&:hover': { bgcolor: 'rgba(71, 85, 105, 0.08)' } }}
                    >
                        Back to Details
                    </Button>

                    <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 24px rgba(71, 85, 105, 0.12)' }}>
                        <Box sx={{ background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)', p: { xs: 2.5, sm: 3 }, color: 'white' }}>
                            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                                Book: {carName}
                            </Typography>
                            <Chip label={carDetails.brand} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, mt: 1 }} />
                        </Box>

                        <Grid container spacing={{ xs: 2, md: 4 }} sx={{ p: { xs: 2, sm: 3 } }}>
                            <Grid item xs={12} md={7}>
                                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
                                    Car Information
                                </Typography>
                                <CardMedia
                                    component="img"
                                    image={getImageUrl(carDetails)}
                                    alt={carName}
                                    sx={{ borderRadius: 2, height: { xs: 250, sm: 350, md: 400 }, objectFit: 'cover', mb: 3, border: '1px solid #e2e8f0' }}
                                />
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}><InfoItem icon={<InfoIcon />} label="Model" value={`${carDetails.brand} ${carDetails.model} (${carDetails.year})`} /></Grid>
                                    <Grid item xs={12} sm={6}><InfoItem icon={<AttachMoneyIcon />} label="Price per day" value={`$${carDetails.pricePerDay}`} /></Grid>
                                    <Grid item xs={12} sm={6}><InfoItem icon={<EventSeatIcon />} label="Seats" value={carDetails.seats} /></Grid>
                                    <Grid item xs={12} sm={6}><InfoItem icon={<DoorFrontIcon />} label="Doors" value={carDetails.doors} /></Grid>
                                    <Grid item xs={12} sm={6}><InfoItem icon={<LocalGasStationIcon />} label="Fuel Type" value={carDetails.energy || carDetails.fuelType} /></Grid>
                                    <Grid item xs={12} sm={6}><InfoItem icon={<SettingsIcon />} label="Transmission" value={carDetails.transmission} /></Grid>
                                    <Grid item xs={12}><InfoItem icon={<LocationOnIcon />} label="Location" value={`${carDetails.address || ''}, ${carDetails.wilaya || ''}`} /></Grid>
                                </Grid>
                                
                                {carDetails.description && (
                                    <>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#334155', mt:2 }}>Description</Typography>
                                        <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.7 }}>{carDetails.description}</Typography>
                                    </>
                                )}

                                {carDetails.features && carDetails.features.length > 0 && (
                                    <>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#334155', mt:2 }}>Features</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {carDetails.features.map((feature, index) => (
                                                <Chip key={index} icon={<CheckCircleIcon />} label={feature} variant="outlined" size="small" />
                                            ))}
                                        </Box>
                                    </>
                                )}
                            </Grid>

                            <Grid item xs={12} md={5}>
                                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
                                    Booking Details
                                </Typography>
                                {!carDetails.isAvailable && (
                                    <Alert severity="warning" sx={{ mb: 2 }}>This car is currently not available for booking.</Alert>
                                )}
                                {carDetails.isAvailable && (
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <Box component="form" onSubmit={handleBookingSubmit}>
                                            <Stack spacing={2} sx={{mt: 1}}>
                                                <DatePicker
                                                    label="Start Date"
                                                    value={startDate}
                                                    onChange={(newValue) => {
                                                        setStartDate(newValue);
                                                        if (endDate && newValue && dayjs(newValue).isAfter(dayjs(endDate))) {
                                                            setEndDate(null); // Reset end date if start date is after it
                                                            setTotalCost(0);
                                                        }
                                                    }}
                                                    shouldDisableDate={shouldDisableDate}
                                                    minDate={dayjs()}
                                                    renderInput={(params) => <TextField {...params} fullWidth required margin="normal" />}
                                                />
                                                <DatePicker
                                                    label="End Date"
                                                    value={endDate}
                                                    onChange={(newValue) => setEndDate(newValue)}
                                                    shouldDisableDate={shouldDisableDate}
                                                    minDate={startDate ? dayjs(startDate).add(1, 'day') : dayjs().add(1, 'day')}
                                                    disabled={!startDate}
                                                    renderInput={(params) => <TextField {...params} fullWidth required margin="normal" />}
                                                />
                                            </Stack>

                                            {totalCost > 0 && (
                                                <Box sx={{ my: 2, p: 2, backgroundColor: '#eef2f9', borderRadius: 1 }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                        Booking Summary
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ color: '#334155' }}>
                                                        Rental Duration: {dayjs(endDate).diff(dayjs(startDate), 'day')} days
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ color: '#334155' }}>
                                                        Price per day: ${carDetails.pricePerDay}
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981', mt: 1 }}>
                                                        Total Cost: ${totalCost}
                                                    </Typography>
                                                </Box>
                                            )}

                                            {bookingError && <Alert severity="error" sx={{ mt: 2 }}>{bookingError}</Alert>}
                                            {bookingSuccess && <Alert severity="success" sx={{ mt: 2 }}>{bookingSuccess}</Alert>}
                                            <Button
                                            type="submit"
                                            variant="contained"
                                            fullWidth
                                            disabled={!!bookingSuccess || !carDetails.isAvailable}
                                            sx={{ 
                                                mt: 2, py: 1.5, fontWeight: 600,
                                                background: 'linear-gradient(90deg, #1e293b 0%, #475569 100%)',
                                                '&:hover': { background: 'linear-gradient(90deg, #0f172a 0%, #334155 100%)' }
                                            }}
                                        >
                                            {bookingSuccess ? 'Booked!' : 'Submit Booking'}
                                        </Button>
                                    </Box>
                                </LocalizationProvider> 
                                )}
                                 <Typography variant="body2" sx={{ mt: 2, color: '#64748b' }}>
                                    Owner: {carDetails.ownerName?.firstName || carDetails.owner?.firstName || 'N/A'} {carDetails.ownerName?.lastName || carDetails.owner?.lastName || ''}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b' }}>
                                    Available from: {carDetails.availabilityStart ? dayjs(carDetails.availabilityStart).format('DD MMM YYYY') : 'N/A'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b' }}>
                                    Available until: {carDetails.availabilityEnd ? dayjs(carDetails.availabilityEnd).format('DD MMM YYYY') : 'N/A'}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
            </Box>
        </>
    );
};

// Helper component for displaying info items
const InfoItem = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, p:1.5, borderRadius: 2, bgcolor: '#f1f5f9' }}>
        {React.cloneElement(icon, { sx: { color: '#475569', mr: 1.5 } })}
        <Box>
            <Typography variant="caption" display="block" sx={{ color: '#64748b', fontWeight:500 }}>{label}</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>{value || 'N/A'}</Typography>
        </Box>
    </Box>
);

export default BookingPage;
