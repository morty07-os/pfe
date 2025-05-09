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
    IconButton,
    Avatar
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
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import dayjs from 'dayjs';

const OwnerBookingsPage = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const [showCancellationDialog, setShowCancellationDialog] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [processingAction, setProcessingAction] = useState(false);
    const [actionSuccess, setActionSuccess] = useState('');
    const [actionError, setActionError] = useState('');
    const [showRenterDetailsDialog, setShowRenterDetailsDialog] = useState(false);

    // Fetch owner's bookings
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
                
                const response = await axios.get('http://localhost:5001/api/bookings/owner', {
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

    // Open confirmation dialog
    const handleOpenConfirmationDialog = (booking) => {
        setSelectedBooking(booking);
        setShowConfirmationDialog(true);
        setActionError('');
        setActionSuccess('');
    };

    // Close confirmation dialog
    const handleCloseConfirmationDialog = () => {
        setShowConfirmationDialog(false);
        setSelectedBooking(null);
    };

    // Open cancellation dialog
    const handleOpenCancellationDialog = (booking) => {
        setSelectedBooking(booking);
        setShowCancellationDialog(true);
        setCancellationReason('');
        setActionError('');
        setActionSuccess('');
    };

    // Close cancellation dialog
    const handleCloseCancellationDialog = () => {
        setShowCancellationDialog(false);
        setSelectedBooking(null);
    };

    // Open renter details dialog
    const handleOpenRenterDetailsDialog = (booking) => {
        setSelectedBooking(booking);
        setShowRenterDetailsDialog(true);
    };

    // Close renter details dialog
    const handleCloseRenterDetailsDialog = () => {
        setShowRenterDetailsDialog(false);
        setSelectedBooking(null);
    };

    // Handle booking confirmation
    const handleConfirmBooking = async () => {
        if (!selectedBooking) return;
        
        setProcessingAction(true);
        setActionError('');
        setActionSuccess('');
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setActionError('You must be logged in to confirm a booking.');
                setProcessingAction(false);
                return;
            }
            
            const response = await axios.patch(
                `http://localhost:5001/api/bookings/${selectedBooking._id}/confirm`,
                {},
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
                            ? { ...booking, status: 'confirmed' } 
                            : booking
                    )
                );
                
                setActionSuccess('Booking confirmed successfully.');
                setTimeout(() => {
                    handleCloseConfirmationDialog();
                }, 2000);
            } else {
                setActionError(response.data.message || 'Failed to confirm booking. Please try again.');
            }
        } catch (err) {
            console.error('Error confirming booking:', err);
            setActionError(err.response?.data?.message || 'An error occurred while confirming the booking.');
        } finally {
            setProcessingAction(false);
        }
    };

    // Handle booking cancellation
    const handleCancelBooking = async () => {
        if (!selectedBooking) return;
        
        setProcessingAction(true);
        setActionError('');
        setActionSuccess('');
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setActionError('You must be logged in to cancel a booking.');
                setProcessingAction(false);
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
                
                setActionSuccess('Booking cancelled successfully.');
                setTimeout(() => {
                    handleCloseCancellationDialog();
                }, 2000);
            } else {
                setActionError(response.data.message || 'Failed to cancel booking. Please try again.');
            }
        } catch (err) {
            console.error('Error cancelling booking:', err);
            setActionError(err.response?.data?.message || 'An error occurred while cancelling the booking.');
        } finally {
            setProcessingAction(false);
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
                    <Typography>Loading bookings for your cars...</Typography>
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
                        Manage Bookings for Your Cars
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
                                            ? "You don't have any bookings for your cars yet." 
                                            : `You don't have any ${['', 'pending', 'confirmed', 'completed', 'cancelled'][tabValue]} bookings.`}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        onClick={() => navigate('/profile')}
                                        sx={{ 
                                            fontWeight: 600,
                                            background: 'linear-gradient(90deg, #1e293b 0%, #475569 100%)',
                                            '&:hover': { background: 'linear-gradient(90deg, #0f172a 0%, #334155 100%)' }
                                        }}
                                    >
                                        Manage Your Cars
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
                                                    
                                                    <Box 
                                                        sx={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            mb: 2, 
                                                            p: 1.5, 
                                                            bgcolor: '#f1f5f9', 
                                                            borderRadius: 2,
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => handleOpenRenterDetailsDialog(booking)}
                                                    >
                                                        <Avatar sx={{ bgcolor: '#475569', width: 32, height: 32, mr: 1.5 }}>
                                                            <PersonIcon fontSize="small" />
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                                                                Rented by
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                                                                {booking.user?.firstName} {booking.user?.lastName}
                                                            </Typography>
                                                        </Box>
                                                        <InfoIcon sx={{ ml: 'auto', color: '#64748b', fontSize: 18 }} />
                                                    </Box>
                                                    
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
                                                    
                                                    {booking.status === 'pending' && (
                                                        <>
                                                            <Button 
                                                                size="small" 
                                                                color="primary"
                                                                variant="outlined"
                                                                onClick={() => handleOpenConfirmationDialog(booking)}
                                                                startIcon={<CheckCircleIcon />}
                                                                sx={{ ml: 1 }}
                                                            >
                                                                Confirm
                                                            </Button>
                                                            
                                                            <Button 
                                                                size="small" 
                                                                color="error"
                                                                onClick={() => handleOpenCancellationDialog(booking)}
                                                                startIcon={<CancelIcon />}
                                                                sx={{ ml: 1 }}
                                                            >
                                                                Decline
                                                            </Button>
                                                        </>
                                                    )}
                                                    
                                                    {booking.status === 'confirmed' && (
                                                        <Button 
                                                            size="small" 
                                                            color="error"
                                                            onClick={() => handleOpenCancellationDialog(booking)}
                                                            startIcon={<CancelIcon />}
                                                            sx={{ ml: 1 }}
                                                        >
                                                            Cancel
                                                        </Button>
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
            
            {/* Confirmation Dialog */}
            <Dialog open={showConfirmationDialog} onClose={handleCloseConfirmationDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, bgcolor: '#f8fafc', color: '#16a34a' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircleIcon sx={{ mr: 1 }} />
                        Confirm Booking
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 3 }}>
                        Are you sure you want to confirm this booking for{' '}
                        <strong>{selectedBooking?.car?.carName || `${selectedBooking?.car?.brand} ${selectedBooking?.car?.model}`}</strong>?
                    </DialogContentText>
                    
                    {selectedBooking && (
                        <Box sx={{ mb: 3, p: 2, bgcolor: '#f1f5f9', borderRadius: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#475569', mb: 2 }}>
                                Booking Details:
                            </Typography>
                            
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ color: '#64748b' }}>Renter:</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155' }}>
                                        {selectedBooking.user?.firstName} {selectedBooking.user?.lastName}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ color: '#64748b' }}>Duration:</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155' }}>
                                        {dayjs(selectedBooking.endDate).diff(dayjs(selectedBooking.startDate), 'day')} days
                                    </Typography>
                                </Grid>
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
                    
                    <Typography variant="body2" sx={{ color: '#475569', mb: 2 }}>
                        By confirming this booking, you agree to make your car available to the renter for the specified dates.
                    </Typography>
                    
                    {actionError && <Alert severity="error" sx={{ mt: 2 }}>{actionError}</Alert>}
                    {actionSuccess && <Alert severity="success" sx={{ mt: 2 }}>{actionSuccess}</Alert>}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleCloseConfirmationDialog} disabled={processingAction}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleConfirmBooking}
                        disabled={processingAction}
                    >
                        {processingAction ? (
                            <>
                                <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                                Processing...
                            </>
                        ) : (
                            'Confirm Booking'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Cancellation Dialog */}
            <Dialog open={showCancellationDialog} onClose={handleCloseCancellationDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, bgcolor: '#f8fafc', color: '#ef4444' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CancelIcon sx={{ mr: 1 }} />
                        {selectedBooking?.status === 'pending' ? 'Decline Booking' : 'Cancel Booking'}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 3 }}>
                        Are you sure you want to {selectedBooking?.status === 'pending' ? 'decline' : 'cancel'} this booking for{' '}
                        <strong>{selectedBooking?.car?.carName || `${selectedBooking?.car?.brand} ${selectedBooking?.car?.model}`}</strong>?
                    </DialogContentText>
                    
                    {selectedBooking && (
                        <Box sx={{ mb: 3, p: 2, bgcolor: '#f1f5f9', borderRadius: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#475569', mb: 2 }}>
                                Booking Details:
                            </Typography>
                            
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ color: '#64748b' }}>Renter:</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155' }}>
                                        {selectedBooking.user?.firstName} {selectedBooking.user?.lastName}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ color: '#64748b' }}>Status:</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155' }}>
                                        {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                                    </Typography>
                                </Grid>
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
                    
                    <TextField
                        label={`Reason for ${selectedBooking?.status === 'pending' ? 'Declining' : 'Cancelling'} (Required)`}
                        multiline
                        rows={3}
                        fullWidth
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        variant="outlined"
                        required
                    />
                    
                    {actionError && <Alert severity="error" sx={{ mt: 2 }}>{actionError}</Alert>}
                    {actionSuccess && <Alert severity="success" sx={{ mt: 2 }}>{actionSuccess}</Alert>}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleCloseCancellationDialog} disabled={processingAction}>
                        Keep Booking
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleCancelBooking}
                        disabled={processingAction || !cancellationReason.trim()}
                    >
                        {processingAction ? (
                            <>
                                <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                                Processing...
                            </>
                        ) : (
                            selectedBooking?.status === 'pending' ? 'Decline Booking' : 'Cancel Booking'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Renter Details Dialog */}
            <Dialog open={showRenterDetailsDialog} onClose={handleCloseRenterDetailsDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, bgcolor: '#f8fafc' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1 }} />
                        Renter Information
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedBooking?.user && (
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Avatar 
                                    sx={{ 
                                        width: 64, 
                                        height: 64, 
                                        bgcolor: '#1e293b',
                                        mr: 2
                                    }}
                                >
                                    {selectedBooking.user.firstName?.[0]}{selectedBooking.user.lastName?.[0]}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                        {selectedBooking.user.firstName} {selectedBooking.user.lastName}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                                        Joined {dayjs(selectedBooking.user.createdAt).format('MMMM YYYY')}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: 2, mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#475569', mb: 2 }}>
                                    Contact Information
                                </Typography>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <EmailIcon sx={{ color: '#64748b', mr: 2 }} />
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                                            Email
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                                            {selectedBooking.user.email}
                                        </Typography>
                                    </Box>
                                </Box>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <PhoneIcon sx={{ color: '#64748b', mr: 2 }} />
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                                            Phone
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                                            {selectedBooking.user.phone || 'Not provided'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                            
                            <Typography variant="body2" sx={{ color: '#475569', mb: 2 }}>
                                Please contact the renter directly if you need to discuss any details about the booking.
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleCloseRenterDetailsDialog}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default OwnerBookingsPage;