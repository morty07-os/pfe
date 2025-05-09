import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Typography,
    Container,
    Paper,
    Button,
    Grid,
    Chip,
    Divider,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    Tooltip,
    IconButton
} from '@mui/material';
import Navbar from '../components/Navbar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import dayjs from 'dayjs';

const MyBookingsPage = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showCancellationDialog, setShowCancellationDialog] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [processingCancellation, setProcessingCancellation] = useState(false);
    const [cancellationSuccess, setCancellationSuccess] = useState('');
    const [cancellationError, setCancellationError] = useState('');

    // Fetch user's bookings
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                
                if (!token) {
                    setError('You must be logged in to view your bookings.');
                    setLoading(false);
                    return;
                }
                
                const response = await axios.get('http://localhost:5001/api/bookings/mine', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                setBookings(response.data);
                setError('');
            } catch (err) {
                console.error('Error fetching bookings:', err);
                setError('Failed to load your bookings. Please try again later.');
                setBookings([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchBookings();
    }, []);

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Filter bookings based on status
    const getFilteredBookings = () => {
        if (tabValue === 0) return bookings; // All bookings
        
        const statusMap = {
            1: 'pending',
            2: 'confirmed',
            3: 'completed',
            4: 'cancelled'
        };
        
        return bookings.filter(booking => booking.status === statusMap[tabValue]);
    };

    // Open cancellation dialog
    const handleOpenCancellationDialog = (booking) => {
        setSelectedBooking(booking);
        setShowCancellationDialog(true);
        setCancellationReason('');
        setCancellationError('');
        setCancellationSuccess('');
    };

    // Close cancellation dialog
    const handleCloseCancellationDialog = () => {
        setShowCancellationDialog(false);
        setSelectedBooking(null);
    };

    // Handle booking cancellation
    const handleCancelBooking = async () => {
        if (!selectedBooking) return;
        
        setProcessingCancellation(true);
        setCancellationError('');
        setCancellationSuccess('');
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setCancellationError('You must be logged in to cancel a booking.');
                setProcessingCancellation(false);
                return;
            }
            
            const response = await axios.patch(
                `http://localhost:5001/api/bookings/${selectedBooking._id}/cancel`,
                { reason: cancellationReason },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (response.status === 200) {
                // Update the booking status in the local state
                setBookings(prevBookings => 
                    prevBookings.map(booking => 
                        booking._id === selectedBooking._id 
                            ? { ...booking, status: 'cancelled' } 
                            : booking
                    )
                );
                
                setCancellationSuccess('Booking cancelled successfully.');
                setTimeout(() => {
                    handleCloseCancellationDialog();
                }, 2000);
            } else {
                setCancellationError(response.data.message || 'Failed to cancel booking. Please try again.');
            }
        } catch (err) {
            console.error('Error cancelling booking:', err);
            setCancellationError(err.response?.data?.message || 'An error occurred while cancelling your booking.');
        } finally {
            setProcessingCancellation(false);
        }
    };

    // Get status chip based on booking status
    const getStatusChip = (status) => {
        switch (status) {
            case 'pending':
                return <Chip 
                    icon={<PendingIcon />} 
                    label="Pending" 
                    size="small" 
                    sx={{ bgcolor: '#fef3c7', color: '#d97706', fontWeight: 600 }} 
                />;
            case 'confirmed':
                return <Chip 
                    icon={<CheckCircleIcon />} 
                    label="Confirmed" 
                    size="small" 
                    sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 600 }} 
                />;
            case 'completed':
                return <Chip 
                    icon={<CheckCircleIcon />} 
                    label="Completed" 
                    size="small" 
                    sx={{ bgcolor: '#dbeafe', color: '#2563eb', fontWeight: 600 }} 
                />;
            case 'cancelled':
                return <Chip 
                    icon={<CancelIcon />} 
                    label="Cancelled" 
                    size="small" 
                    sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 600 }} 
                />;
            default:
                return <Chip 
                    icon={<InfoIcon />} 
                    label={status} 
                    size="small" 
                    sx={{ bgcolor: '#f3f4f6', color: '#6b7280', fontWeight: 600 }} 
                />;
        }
    };

    // Check if a booking can be cancelled
    const canCancelBooking = (booking) => {
        if (!booking) return false;
        
        // Can only cancel pending or confirmed bookings
        if (!['pending', 'confirmed'].includes(booking.status)) {
            return false;
        }
        
        // Check if start date is in the future (at least 24 hours)
        const startDate = dayjs(booking.startDate);
        const now = dayjs();
        const hoursUntilStart = startDate.diff(now, 'hour');
        
        return hoursUntilStart > 24;
    };

    // Helper to get the primary image URL
    const getImageUrl = (car) => {
        if (!car) return '';
        const imagePath = car.images?.[0] || car.image; // Prefer images array, fallback to single image
        if (!imagePath) return 'https://via.placeholder.com/600x400?text=No+Image'; // Placeholder
        return imagePath.startsWith('http') ? imagePath : `http://localhost:5001/${imagePath.replace(/\\/g, '/')}`;
    };

    if (loading) {
        return (
            <>
                <Navbar sx={{ backgroundColor: '#111', color: '#fff' }} iconColor="#fff" />
                <Container sx={{ py: 5, textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography>Loading your bookings...</Typography>
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
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mt: 2 }}>
                        Go to Home
                    </Button>
                </Container>
            </>
        );
    }

    const filteredBookings = getFilteredBookings();

    return (
        <>
            <Navbar sx={{ backgroundColor: '#111', color: '#fff' }} iconColor="#fff" />
            <Box sx={{ bgcolor: '#f8fafc', minHeight: 'calc(100vh - 64px)', py: 4 }}>
                <Container maxWidth="lg">
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/')}
                        sx={{ mb: 3, color: '#475569', '&:hover': { bgcolor: 'rgba(71, 85, 105, 0.08)' } }}
                    >
                        Back to Home
                    </Button>

                    <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#1e293b', mb: 3 }}>
                        My Bookings
                    </Typography>

                    <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                borderBottom: 1,
                                borderColor: 'divider',
                                bgcolor: '#f1f5f9',
                                '& .MuiTab-root': {
                                    fontWeight: 600,
                                    py: 2
                                }
                            }}
                        >
                            <Tab label="All Bookings" />
                            <Tab label="Pending" />
                            <Tab label="Confirmed" />
                            <Tab label="Completed" />
                            <Tab label="Cancelled" />
                        </Tabs>

                        <Box sx={{ p: 3 }}>
                            {filteredBookings.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <DirectionsCarIcon sx={{ fontSize: 60, color: '#94a3b8', mb: 2 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#475569', mb: 1 }}>
                                        No bookings found
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
                                        {tabValue === 0 
                                            ? "You haven't made any bookings yet." 
                                            : `You don't have any ${['', 'pending', 'confirmed', 'completed', 'cancelled'][tabValue]} bookings.`}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        onClick={() => navigate('/')}
                                        sx={{ 
                                            fontWeight: 600,
                                            background: 'linear-gradient(90deg, #1e293b 0%, #475569 100%)',
                                            '&:hover': { background: 'linear-gradient(90deg, #0f172a 0%, #334155 100%)' }
                                        }}
                                    >
                                        Browse Cars
                                    </Button>
                                </Box>
                            ) : (
                                <Grid container spacing={3}>
                                    {filteredBookings.map((booking) => (
                                        <Grid item xs={12} md={6} key={booking._id}>
                                            <Card 
                                                elevation={2} 
                                                sx={{ 
                                                    borderRadius: 2, 
                                                    overflow: 'hidden',
                                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                                    '&:hover': {
                                                        transform: 'translateY(-4px)',
                                                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
                                                    }
                                                }}
                                            >
                                                <Box sx={{ position: 'relative' }}>
                                                    <CardMedia
                                                        component="img"
                                                        height="180"
                                                        image={getImageUrl(booking.car)}
                                                        alt={booking.car?.carName || 'Car Image'}
                                                        sx={{ objectFit: 'cover' }}
                                                    />
                                                    <Box 
                                                        sx={{ 
                                                            position: 'absolute', 
                                                            top: 12, 
                                                            right: 12,
                                                            zIndex: 1
                                                        }}
                                                    >
                                                        {getStatusChip(booking.status)}
                                                    </Box>
                                                </Box>
                                                
                                                <CardContent>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                                                        {booking.car?.carName || `${booking.car?.brand} ${booking.car?.model}`}
                                                    </Typography>
                                                    
                                                    <Grid container spacing={2} sx={{ mb: 2 }}>
                                                        <Grid item xs={6}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <CalendarMonthIcon sx={{ color: '#64748b', mr: 1, fontSize: 20 }} />
                                                                <Box>
                                                                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                                                                        Start Date
                                                                    </Typography>
                                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                                                                        {dayjs(booking.startDate).format('MMM D, YYYY')}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <CalendarMonthIcon sx={{ color: '#64748b', mr: 1, fontSize: 20 }} />
                                                                <Box>
                                                                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                                                                        End Date
                                                                    </Typography>
                                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                                                                        {dayjs(booking.endDate).format('MMM D, YYYY')}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                    
                                                    <Divider sx={{ my: 1.5 }} />
                                                    
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <AttachMoneyIcon sx={{ color: '#10b981', mr: 0.5 }} />
                                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981' }}>
                                                                ${booking.totalPrice}
                                                            </Typography>
                                                        </Box>
                                                        
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <AccessTimeIcon sx={{ color: '#64748b', mr: 0.5, fontSize: 18 }} />
                                                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                                                                {dayjs(booking.endDate).diff(dayjs(booking.startDate), 'day')} days
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                                
                                                <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                                                    <Button 
                                                        size="small" 
                                                        onClick={() => navigate(`/cars/${booking.car?._id}`)}
                                                        sx={{ color: '#475569' }}
                                                    >
                                                        View Car
                                                    </Button>
                                                    
                                                    {canCancelBooking(booking) && (
                                                        <Button 
                                                            size="small" 
                                                            color="error"
                                                            onClick={() => handleOpenCancellationDialog(booking)}
                                                            startIcon={<CancelIcon />}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    )}
                                                    
                                                    {booking.status === 'confirmed' && (
                                                        <Tooltip title="This booking has been confirmed by the owner">
                                                            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                                                                <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 18, mr: 0.5 }} />
                                                                <Typography variant="body2" sx={{ color: '#16a34a', fontWeight: 600 }}>
                                                                    Confirmed
                                                                </Typography>
                                                            </Box>
                                                        </Tooltip>
                                                    )}
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Box>
                    </Paper>
                </Container>
            </Box>
            
            {/* Cancellation Dialog */}
            <Dialog open={showCancellationDialog} onClose={handleCloseCancellationDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, bgcolor: '#f8fafc', color: '#ef4444' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CancelIcon sx={{ mr: 1 }} />
                        Cancel Booking
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 3 }}>
                        Are you sure you want to cancel your booking for{' '}
                        <strong>{selectedBooking?.car?.carName || `${selectedBooking?.car?.brand} ${selectedBooking?.car?.model}`}</strong>?
                    </DialogContentText>
                    
                    {selectedBooking && (
                        <Box sx={{ mb: 3, p: 2, bgcolor: '#f1f5f9', borderRadius: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ color: '#64748b' }}>Start Date:</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155' }}>
                                        {dayjs(selectedBooking.startDate).format('MMM D, YYYY')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ color: '#64748b' }}>End Date:</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155' }}>
                                        {dayjs(selectedBooking.endDate).format('MMM D, YYYY')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" sx={{ color: '#64748b' }}>Total Amount:</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981' }}>
                                        ${selectedBooking.totalPrice}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                    
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
                    
                    {cancellationError && <Alert severity="error" sx={{ mt: 2 }}>{cancellationError}</Alert>}
                    {cancellationSuccess && <Alert severity="success" sx={{ mt: 2 }}>{cancellationSuccess}</Alert>}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleCloseCancellationDialog} disabled={processingCancellation}>
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
        </>
    );
};

export default MyBookingsPage;