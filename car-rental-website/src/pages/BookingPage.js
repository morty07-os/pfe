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
    Stack,
    Stepper,
    Step,
    StepLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Tooltip
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
import PaymentIcon from '@mui/icons-material/Payment';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
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
    
    // Payment and booking status states
    const [activeStep, setActiveStep] = useState(0);
    const [bookingId, setBookingId] = useState(null);
    const [bookingStatus, setBookingStatus] = useState('pending');
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [showCancellationDialog, setShowCancellationDialog] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);
    const [processingCancellation, setProcessingCancellation] = useState(false);
    
    // Booking workflow steps
    const steps = ['Select Dates', 'Review Details', 'Payment', 'Confirmation'];

    // State to track if current user is the owner
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        const fetchCarDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5001/api/cars/details/${carId}`);
                setCarDetails(response.data);
                
                // Check if the current user is the owner of this car
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        // Decode the token to get user ID (assuming JWT)
                        const tokenParts = token.split('.');
                        if (tokenParts.length === 3) {
                            const payload = JSON.parse(atob(tokenParts[1]));
                            const currentUserId = payload.id;
                            
                            // Check if current user is the car owner
                            if (response.data.owner && response.data.owner._id === currentUserId) {
                                setIsOwner(true);
                                setError('You cannot book your own car.');
                            } else {
                                setIsOwner(false);
                                setError('');
                            }
                        }
                    } catch (tokenErr) {
                        console.error("Error processing token:", tokenErr);
                    }
                }
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

    // Handle moving to the next step in the booking process
    const handleNextStep = () => {
        if (activeStep === 0) {
            // Validate dates before proceeding
            if (!startDate || !endDate) {
                setBookingError('Please select both start and end dates.');
                return;
            }
            
            const start = dayjs(startDate);
            const end = dayjs(endDate);
            
            if (start.isSame(end) || start.isAfter(end)) {
                setBookingError('End date must be after start date.');
                return;
            }
            
            setBookingError('');
            setActiveStep(1); // Move to review details
        } else if (activeStep === 1) {
            // Move to payment step
            setActiveStep(2);
        }
    };
    
    // Handle going back to the previous step
    const handleBackStep = () => {
        setActiveStep((prevStep) => Math.max(0, prevStep - 1));
    };
    
    // Open payment dialog
    const handleOpenPaymentDialog = () => {
        setShowPaymentDialog(true);
    };
    
    // Close payment dialog
    const handleClosePaymentDialog = () => {
        setShowPaymentDialog(false);
    };
    
    // Process payment and create booking
    const handleProcessPayment = async () => {
        setProcessingPayment(true);
        setBookingError('');
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setBookingError('You must be logged in to make a booking.');
                setProcessingPayment(false);
                return;
            }
            
            // Check if user is trying to book their own car
            if (isOwner) {
                setBookingError('You cannot book your own car.');
                setProcessingPayment(false);
                return;
            }
            
            // First create the booking
            const bookingResponse = await axios.post('http://localhost:5001/api/bookings', {
                car: carId,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (bookingResponse.status === 201) {
                // Mock payment processing (in a real app, this would integrate with Stripe, PayPal, etc.)
                // Simulate a payment delay
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Store the booking ID for future reference
                const newBookingId = bookingResponse.data.booking._id;
                setBookingId(newBookingId);
                
                // Update UI state
                setPaymentCompleted(true);
                setBookingStatus('pending');
                setBookingSuccess('Booking successful! Your booking is pending approval.');
                setActiveStep(3); // Move to confirmation step
                setShowPaymentDialog(false);
            } else {
                setBookingError(bookingResponse.data.message || 'Failed to create booking. Please try again.');
            }
        } catch (err) {
            console.error("Error processing payment:", err);
            setBookingError(err.response?.data?.message || 'An error occurred while processing your payment.');
        } finally {
            setProcessingPayment(false);
        }
    };
    
    // Handle booking cancellation
    const handleCancelBooking = async () => {
        if (!bookingId) return;
        
        setProcessingCancellation(true);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setBookingError('You must be logged in to cancel a booking.');
                setProcessingCancellation(false);
                return;
            }
            
            const response = await axios.patch(`http://localhost:5001/api/bookings/${bookingId}/cancel`, {
                reason: cancellationReason
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.status === 200) {
                setBookingStatus('cancelled');
                setBookingSuccess('Booking cancelled successfully.');
                setShowCancellationDialog(false);
            } else {
                setBookingError(response.data.message || 'Failed to cancel booking. Please try again.');
            }
        } catch (err) {
            console.error("Error cancelling booking:", err);
            setBookingError(err.response?.data?.message || 'An error occurred while cancelling your booking.');
        } finally {
            setProcessingCancellation(false);
        }
    };
    
    // Legacy booking submit function (now replaced by the multi-step process)
    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        handleNextStep();
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate(-1)}
                            sx={{ color: '#475569', '&:hover': { bgcolor: 'rgba(71, 85, 105, 0.08)' } }}
                        >
                            Back to Details
                        </Button>
                        
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/my-bookings')}
                            sx={{ 
                                color: '#1e293b', 
                                borderColor: '#1e293b',
                                '&:hover': { 
                                    bgcolor: 'rgba(30, 41, 59, 0.08)',
                                    borderColor: '#0f172a'
                                } 
                            }}
                        >
                            View My Bookings
                        </Button>
                    </Box>

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
                                {carDetails.isOwner && (
                                    <Alert 
                                        severity="info" 
                                        sx={{ 
                                            mb: 2, 
                                            border: '1px solid #ef4444', 
                                            bgcolor: 'rgba(239, 68, 68, 0.08)',
                                            '& .MuiAlert-icon': { color: '#ef4444' }
                                        }}
                                    >
                                        This is your car. You cannot book your own vehicle.
                                    </Alert>
                                )}
                                {carDetails.isAvailable && !carDetails.isOwner && (
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <Box component="form" onSubmit={handleBookingSubmit}>
                                            {/* Booking Process Stepper */}
                                            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                                                {steps.map((label) => (
                                                    <Step key={label}>
                                                        <StepLabel>{label}</StepLabel>
                                                    </Step>
                                                ))}
                                            </Stepper>
                                            
                                            {/* Step 1: Date Selection */}
                                            {activeStep === 0 && (
                                                <Stack spacing={2} sx={{mt: 1}}>
                                                    {isOwner && (
                                                        <Alert severity="error" sx={{ mb: 2 }}>
                                                            You cannot book your own car. This is your car listing.
                                                        </Alert>
                                                    )}
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
                                                        disabled={isOwner}
                                                    />
                                                    <DatePicker
                                                        label="End Date"
                                                        value={endDate}
                                                        onChange={(newValue) => setEndDate(newValue)}
                                                        shouldDisableDate={shouldDisableDate}
                                                        minDate={startDate ? dayjs(startDate).add(1, 'day') : dayjs().add(1, 'day')}
                                                        disabled={!startDate || isOwner}
                                                    />
                                                    
                                                    {/* Cancellation Policy Information */}
                                                    <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
                                                        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', color: '#475569', fontWeight: 600, mb: 1 }}>
                                                            <HelpOutlineIcon sx={{ mr: 1, fontSize: 20 }} />
                                                            Cancellation Policy
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                                                            • Free cancellation up to 48 hours before pickup
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                                                            • 50% refund for cancellations between 24-48 hours before pickup
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                            • No refund for cancellations less than 24 hours before pickup
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            )}
                                            
                                            {/* Step 2: Review Details */}
                                            {activeStep === 1 && (
                                                <Box>
                                                    <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
                                                            Booking Summary
                                                        </Typography>
                                                        
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={6}>
                                                                <Typography variant="body2" sx={{ color: '#64748b' }}>Start Date:</Typography>
                                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155' }}>
                                                                    {dayjs(startDate).format('MMM D, YYYY')}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <Typography variant="body2" sx={{ color: '#64748b' }}>End Date:</Typography>
                                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155' }}>
                                                                    {dayjs(endDate).format('MMM D, YYYY')}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <Typography variant="body2" sx={{ color: '#64748b' }}>Duration:</Typography>
                                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155' }}>
                                                                    {dayjs(endDate).diff(dayjs(startDate), 'day')} days
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <Typography variant="body2" sx={{ color: '#64748b' }}>Price per day:</Typography>
                                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155' }}>
                                                                    ${carDetails.pricePerDay}
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>
                                                        
                                                        <Divider sx={{ my: 2 }} />
                                                        
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                                                Total Cost:
                                                            </Typography>
                                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981' }}>
                                                                ${totalCost}
                                                            </Typography>
                                                        </Box>
                                                    </Paper>
                                                </Box>
                                            )}
                                            
                                            {/* Step 3: Payment */}
                                            {activeStep === 2 && (
                                                <Box>
                                                    <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2, display: 'flex', alignItems: 'center' }}>
                                                            <PaymentIcon sx={{ mr: 1 }} />
                                                            Payment Method
                                                        </Typography>
                                                        
                                                        <FormControl component="fieldset">
                                                            <RadioGroup
                                                                name="payment-method"
                                                                value={paymentMethod}
                                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                            >
                                                                <FormControlLabel 
                                                                    value="credit_card" 
                                                                    control={<Radio />} 
                                                                    label={
                                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                            <CreditCardIcon sx={{ mr: 1, color: '#475569' }} />
                                                                            <Typography>Credit/Debit Card</Typography>
                                                                        </Box>
                                                                    } 
                                                                />
                                                                <FormControlLabel 
                                                                    value="paypal" 
                                                                    control={<Radio />} 
                                                                    label={
                                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                            <img 
                                                                                src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" 
                                                                                alt="PayPal" 
                                                                                style={{ width: 40, marginRight: 8 }} 
                                                                            />
                                                                            <Typography>PayPal</Typography>
                                                                        </Box>
                                                                    } 
                                                                />
                                                            </RadioGroup>
                                                        </FormControl>
                                                        
                                                        <Button
                                                            variant="contained"
                                                            fullWidth
                                                            onClick={handleOpenPaymentDialog}
                                                            sx={{ 
                                                                mt: 3, py: 1.5, fontWeight: 600,
                                                                background: 'linear-gradient(90deg, #1e293b 0%, #475569 100%)',
                                                                '&:hover': { background: 'linear-gradient(90deg, #0f172a 0%, #334155 100%)' }
                                                            }}
                                                            startIcon={<PaymentIcon />}
                                                        >
                                                            Proceed to Payment
                                                        </Button>
                                                    </Paper>
                                                </Box>
                                            )}
                                            
                                            {/* Step 4: Confirmation */}
                                            {activeStep === 3 && (
                                                <Box>
                                                    <Paper elevation={1} sx={{ p: 3, mb: 2, borderRadius: 2, textAlign: 'center' }}>
                                                        <CheckCircleIcon sx={{ fontSize: 60, color: '#10b981', mb: 2 }} />
                                                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                                                            Booking Confirmed!
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ color: '#475569', mb: 3 }}>
                                                            Your booking is now {bookingStatus}. You will receive a confirmation email shortly.
                                                        </Typography>
                                                        
                                                        <Box sx={{ bgcolor: '#f1f5f9', p: 2, borderRadius: 2, mb: 3 }}>
                                                            <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>Booking ID:</Typography>
                                                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155', mb: 2 }}>
                                                                {bookingId || 'BOOKING-12345'}
                                                            </Typography>
                                                            
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={6}>
                                                                    <Typography variant="body2" sx={{ color: '#64748b' }}>Start Date:</Typography>
                                                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155' }}>
                                                                        {dayjs(startDate).format('MMM D, YYYY')}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Typography variant="body2" sx={{ color: '#64748b' }}>End Date:</Typography>
                                                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155' }}>
                                                                        {dayjs(endDate).format('MMM D, YYYY')}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={12}>
                                                                    <Typography variant="body2" sx={{ color: '#64748b' }}>Total Amount Paid:</Typography>
                                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981' }}>
                                                                        ${totalCost}
                                                                    </Typography>
                                                                </Grid>
                                                            </Grid>
                                                        </Box>
                                                        
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            onClick={() => setShowCancellationDialog(true)}
                                                            startIcon={<CancelIcon />}
                                                            sx={{ mr: 2 }}
                                                        >
                                                            Cancel Booking
                                                        </Button>
                                                        
                                                        <Button
                                                            variant="contained"
                                                            onClick={() => navigate('/my-bookings')}
                                                            sx={{ 
                                                                fontWeight: 600,
                                                                background: 'linear-gradient(90deg, #1e293b 0%, #475569 100%)',
                                                                '&:hover': { background: 'linear-gradient(90deg, #0f172a 0%, #334155 100%)' }
                                                            }}
                                                        >
                                                            View All Bookings
                                                        </Button>
                                                    </Paper>
                                                </Box>
                                            )}

                                            {bookingError && <Alert severity="error" sx={{ mt: 2 }}>{bookingError}</Alert>}
                                            
                                            {/* Navigation buttons for multi-step form */}
                                            {activeStep < 3 && (
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                                                    <Button
                                                        disabled={activeStep === 0}
                                                        onClick={handleBackStep}
                                                        startIcon={<ArrowBackIcon />}
                                                    >
                                                        Back
                                                    </Button>
                                                    
                                                    {activeStep < 2 && (
                                                        <Button
                                                            variant="contained"
                                                            onClick={handleNextStep}
                                                            disabled={!startDate || !endDate || (activeStep === 0 && totalCost === 0)}
                                                            sx={{ 
                                                                fontWeight: 600,
                                                                background: 'linear-gradient(90deg, #1e293b 0%, #475569 100%)',
                                                                '&:hover': { background: 'linear-gradient(90deg, #0f172a 0%, #334155 100%)' }
                                                            }}
                                                        >
                                                            {activeStep === 0 ? 'Continue' : 'Proceed to Payment'}
                                                        </Button>
                                                    )}
                                                </Box>
                                            )}
                                        </Box>
                                        
                                        {/* Payment Dialog */}
                                        <Dialog open={showPaymentDialog} onClose={handleClosePaymentDialog} maxWidth="sm" fullWidth>
                                            <DialogTitle sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>
                                                Complete Your Payment
                                            </DialogTitle>
                                            <DialogContent>
                                                <DialogContentText sx={{ mb: 3 }}>
                                                    Please enter your payment details to complete the booking.
                                                </DialogContentText>
                                                
                                                {paymentMethod === 'credit_card' && (
                                                    <Box component="form" sx={{ mt: 1 }}>
                                                        <TextField
                                                            margin="normal"
                                                            required
                                                            fullWidth
                                                            label="Card Number"
                                                            placeholder="1234 5678 9012 3456"
                                                            InputLabelProps={{ shrink: true }}
                                                        />
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={6}>
                                                                <TextField
                                                                    margin="normal"
                                                                    required
                                                                    fullWidth
                                                                    label="Expiry Date"
                                                                    placeholder="MM/YY"
                                                                    InputLabelProps={{ shrink: true }}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <TextField
                                                                    margin="normal"
                                                                    required
                                                                    fullWidth
                                                                    label="CVC"
                                                                    placeholder="123"
                                                                    InputLabelProps={{ shrink: true }}
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                        <TextField
                                                            margin="normal"
                                                            required
                                                            fullWidth
                                                            label="Cardholder Name"
                                                            placeholder="John Doe"
                                                            InputLabelProps={{ shrink: true }}
                                                        />
                                                    </Box>
                                                )}
                                                
                                                {paymentMethod === 'paypal' && (
                                                    <Box sx={{ textAlign: 'center', py: 3 }}>
                                                        <img 
                                                            src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg" 
                                                            alt="PayPal" 
                                                            style={{ width: 150, marginBottom: 16 }} 
                                                        />
                                                        <Typography variant="body1" sx={{ mb: 2 }}>
                                                            You will be redirected to PayPal to complete your payment.
                                                        </Typography>
                                                    </Box>
                                                )}
                                                
                                                <Box sx={{ bgcolor: '#f1f5f9', p: 2, borderRadius: 2, mt: 2 }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#475569', mb: 1 }}>
                                                        Payment Summary
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                            Rental ({dayjs(endDate).diff(dayjs(startDate), 'day')} days × ${carDetails.pricePerDay})
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            ${totalCost}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                            Service Fee
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            $0.00
                                                        </Typography>
                                                    </Box>
                                                    <Divider sx={{ my: 1 }} />
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                                            Total
                                                        </Typography>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#10b981' }}>
                                                            ${totalCost}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </DialogContent>
                                            <DialogActions sx={{ px: 3, pb: 3 }}>
                                                <Button onClick={handleClosePaymentDialog} disabled={processingPayment}>
                                                    Cancel
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    onClick={handleProcessPayment}
                                                    disabled={processingPayment}
                                                    sx={{ 
                                                        fontWeight: 600,
                                                        background: 'linear-gradient(90deg, #1e293b 0%, #475569 100%)',
                                                        '&:hover': { background: 'linear-gradient(90deg, #0f172a 0%, #334155 100%)' }
                                                    }}
                                                >
                                                    {processingPayment ? (
                                                        <>
                                                            <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        `Pay $${totalCost}`
                                                    )}
                                                </Button>
                                            </DialogActions>
                                        </Dialog>
                                        
                                        {/* Cancellation Dialog */}
                                        <Dialog open={showCancellationDialog} onClose={() => setShowCancellationDialog(false)} maxWidth="sm" fullWidth>
                                            <DialogTitle sx={{ fontWeight: 700, bgcolor: '#f8fafc', color: '#ef4444' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <CancelIcon sx={{ mr: 1 }} />
                                                    Cancel Booking
                                                </Box>
                                            </DialogTitle>
                                            <DialogContent>
                                                <DialogContentText sx={{ mb: 3 }}>
                                                    Are you sure you want to cancel your booking? Please review our cancellation policy:
                                                </DialogContentText>
                                                
                                                <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#475569', mb: 1 }}>
                                                        Cancellation Policy
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                                                        • Free cancellation up to 48 hours before pickup
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                                                        • 50% refund for cancellations between 24-48 hours before pickup
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                        • No refund for cancellations less than 24 hours before pickup
                                                    </Typography>
                                                </Box>
                                                
                                                <TextField
                                                    label="Reason for Cancellation (Optional)"
                                                    multiline
                                                    rows={3}
                                                    fullWidth
                                                    value={cancellationReason}
                                                    onChange={(e) => setCancellationReason(e.target.value)}
                                                    variant="outlined"
                                                />
                                            </DialogContent>
                                            <DialogActions sx={{ px: 3, pb: 3 }}>
                                                <Button onClick={() => setShowCancellationDialog(false)} disabled={processingCancellation}>
                                                    Keep Booking
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    onClick={handleCancelBooking}
                                                    disabled={processingCancellation}
                                                >
                                                    {processingCancellation ? (
                                                        <>
                                                            <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        'Confirm Cancellation'
                                                    )}
                                                </Button>
                                            </DialogActions>
                                        </Dialog>
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
