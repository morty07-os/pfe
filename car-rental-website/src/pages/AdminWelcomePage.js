import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Card, CardContent,
  Button, Stack, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, Alert, Tabs, Tab
} from '@mui/material';

const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';

const AdminWelcomePage = () => {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingCars, setPendingCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Changed from object to string or null
  const [errorType, setErrorType] = useState('error'); // Added separate state for error type
  const [rejectDialog, setRejectDialog] = useState({ open: false, userId: null });
  const [carRejectDialog, setCarRejectDialog] = useState({ open: false, carId: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || userRole !== 'admin') {
      setError('Unauthorized access');
      navigate('/');
      return;
    }

    if (activeTab === 0) { // Only fetch users if the User Approval tab is active
      fetchPendingUsers();
    } else if (activeTab === 1) {
      fetchPendingCars();
    }
    // Add logic here to fetch data for other tabs when they are active
    // e.g., if (activeTab === 2) { fetchPendingBookings(); }
  }, [navigate, activeTab]);

  // Add refresh interval
  useEffect(() => {
    let interval;
    if (activeTab === 0) {
      interval = setInterval(() => {
        fetchPendingUsers();
      }, 30000); // Refresh every 30 seconds for user approvals
    } else if (activeTab === 1) {
      interval = setInterval(() => {
        fetchPendingCars();
      }, 30000); // Refresh every 30 seconds for car posting approvals
    }
    // Add similar intervals for other tabs if needed

    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchPendingUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/admin/pending-users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch pending users');
      }

      const data = await response.json();
      setPendingUsers(data.users || []);
      setError(''); // Clear any existing error
    } catch (error) {
      console.error('Error fetching pending users:', error);
      setError(error.message || 'Failed to fetch pending users');
      if (error.message.includes('401') || error.message.includes('403')) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCars = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/cars/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending cars');
      }

      const data = await response.json();
      setPendingCars(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/admin/approve-user/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        setPendingUsers(current => current.filter(user => user._id !== userId));
        setError('User approved successfully');
        setErrorType('success');
        
        fetchPendingUsers();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to approve user');
        setErrorType('error');
      }
    } catch (error) {
      setError('Failed to approve user');
      setErrorType('error');
    }
  };

  const handleApproveCar = async (carId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/cars/approve/${carId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve car');
      }

      setPendingCars(current => current.filter(car => car._id !== carId));
      setError('Car approved successfully');
      setErrorType('success');
    } catch (error) {
      setError(error.message);
      setErrorType('error');
    }
  };

  const handleReject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/admin/reject-user/${rejectDialog.userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reason: rejectionReason })
      });
      if (response.ok) {
        // Remove the rejected user from the local state
        setPendingUsers(current => current.filter(user => user._id !== rejectDialog.userId));
        setRejectDialog({ open: false, userId: null });
        setRejectionReason('');
        // Show success message
        setError('User rejected successfully');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to reject user');
      }
    } catch (error) {
      setError('Failed to reject user');
    }
  };

  const handleRejectCar = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/cars/reject/${carRejectDialog.carId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      if (!response.ok) {
        throw new Error('Failed to reject car');
      }

      setPendingCars(current => current.filter(car => car._id !== carRejectDialog.carId));
      setCarRejectDialog({ open: false, carId: null });
      setRejectionReason('');
      setError('Car rejected successfully');
      setErrorType('success');
    } catch (error) {
      setError(error.message);
      setErrorType('error');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}> {/* Changed to lg for potentially wider content */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="admin approval tabs">
          <Tab label="User Approvals" id="tab-0" aria-controls="tabpanel-0" />
          <Tab label="Car Posting Approvals" id="tab-1" aria-controls="tabpanel-1" />
          <Tab label="Booking Approvals" id="tab-2" aria-controls="tabpanel-2" />
        </Tabs>
      </Box>

      {error && (
        <Alert severity={errorType} sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tab Panel for User Approvals */}
      <Box role="tabpanel" hidden={activeTab !== 0} id="tabpanel-0" aria-labelledby="tab-0">
        {activeTab === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom>Pending User Approvals</Typography>
            {loading ? (
              <CircularProgress />
            ) : pendingUsers.length === 0 ? (
              <Typography>No pending users to review.</Typography>
            ) : (
              pendingUsers.map((user) => (
                <Card key={user._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{user.firstName} {user.lastName}</Typography>
                    <Typography>Email: {user.email}</Typography>
                    <Typography>Phone: {user.phone}</Typography>
                    <Typography>Residence: {user.residence}</Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">License Images:</Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 1, flexWrap: 'wrap' }}>
                        {user.licenceFront && <img src={user.licenceFront} alt="License Front" style={{ width: 150, height: 'auto', border: '1px solid #ddd', borderRadius: '4px' }} />}
                        {user.licenceBack && <img src={user.licenceBack} alt="License Back" style={{ width: 150, height: 'auto', border: '1px solid #ddd', borderRadius: '4px' }} />}
                      </Stack>
                    </Box>
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleApprove(user._id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => setRejectDialog({ open: true, userId: user._id })}
                      >
                        Reject
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        )}
      </Box>

      {/* Tab Panel for Car Posting Approvals */}
      <Box role="tabpanel" hidden={activeTab !== 1} id="tabpanel-1" aria-labelledby="tab-1">
        {activeTab === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>Pending Car Posting Approvals</Typography>
            {pendingCars.length === 0 ? (
              <Typography>No pending car postings to review.</Typography>
            ) : (
              pendingCars.map((car) => (
                <Card key={car._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{car.carName}</Typography>
                    <Typography>Owner: {car.owner.firstName} {car.owner.lastName}</Typography>
                    <Typography>Brand: {car.brand}</Typography>
                    <Typography>Price: ${car.price}/day</Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">Car Images:</Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 1, flexWrap: 'wrap' }}>
                        {car.images.map((image, index) => (
                          <img key={index} src={image} alt={`Car ${index + 1}`} style={{ width: 150, height: 'auto' }} />
                        ))}
                      </Stack>
                    </Box>
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleApproveCar(car._id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => setCarRejectDialog({ open: true, carId: car._id })}
                      >
                        Reject
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        )}
      </Box>

      {/* Tab Panel for Booking Approvals */}
      <Box role="tabpanel" hidden={activeTab !== 2} id="tabpanel-2" aria-labelledby="tab-2">
        {activeTab === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom>Pending Booking Approvals</Typography>
            {/* Placeholder: Add logic and UI for booking approvals here */}
            <Typography>Booking approval functionality will be implemented here.</Typography>
            {/* Example: You might fetch pending bookings */}
          </Box>
        )}
      </Box>

      <Dialog open={rejectDialog.open} onClose={() => setRejectDialog({ open: false, userId: null })}>
        <DialogTitle>Reject User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for rejection"
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog({ open: false, userId: null })}>Cancel</Button>
          <Button onClick={handleReject} color="error">Reject</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={carRejectDialog.open} onClose={() => setCarRejectDialog({ open: false, carId: null })}>
        <DialogTitle>Reject Car Posting</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for rejection"
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCarRejectDialog({ open: false, carId: null })}>Cancel</Button>
          <Button onClick={handleRejectCar} color="error">Reject</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminWelcomePage;
