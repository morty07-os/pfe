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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Changed from object to string or null
  const [errorType, setErrorType] = useState('error'); // Added separate state for error type
  const [rejectDialog, setRejectDialog] = useState({ open: false, userId: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [pendingCars, setPendingCars] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token || userRole !== 'admin') {
      setError('Unauthorized access');
      navigate('/');
      return;
    }

    setLoading(true);
    setError(null);

    if (activeTab === 0) {
      fetchPendingUsers();
      setPendingCars([]); // Clear cars when switching to user tab
    } else if (activeTab === 1) {
      fetchPendingCarPostings();
      setPendingUsers([]); // Clear users when switching to car tab
    } else if (activeTab === 2) {
      // Placeholder for booking approvals
      setPendingUsers([]);
      setPendingCars([]);
      setLoading(false); // No data to load for this tab yet
      // fetchPendingBookings();
    }
  }, [navigate, activeTab]);

  // Add refresh interval
  useEffect(() => {
    let intervalId;
    if (activeTab === 0) {
      intervalId = setInterval(fetchPendingUsers, 30000); // Refresh users every 30s
    } else if (activeTab === 1) {
      intervalId = setInterval(fetchPendingCarPostings, 30000); // Refresh cars every 30s
    }
    // Add similar intervals for other tabs if needed

    return () => clearInterval(intervalId);
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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

  const fetchPendingCarPostings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/cars/admin/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch car postings');
      }

      const allCars = await response.json();
      // Ensure allCars is an array and then filter
      const carsToApprove = Array.isArray(allCars) ? allCars.filter(car => car.status === 'awaiting_posting_approval' && !car.isDeleted) : [];
      setPendingCars(carsToApprove);
      setError(''); // Clear any existing error
    } catch (err) {
      console.error('Error fetching pending car postings:', err);
      setError(err.message || 'Failed to fetch car postings');
      if (err.message.includes('401') || err.message.includes('403')) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCar = async (carId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/cars/admin/cars/${carId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'accepted' }),
      });

      if (response.ok) {
        setPendingCars(current => current.filter(car => car._id !== carId));
        setError('Car approved successfully');
        setErrorType('success');
        // Optionally re-fetch or rely on local state update
        // fetchPendingCarPostings(); 
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to approve car');
        setErrorType('error');
      }
    } catch (err) {
      console.error('Error approving car:', err);
      setError('An error occurred while approving the car.');
      setErrorType('error');
    }
  };

  const handleRejectCar = async (carId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/cars/admin/cars/${carId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' }),
      });

      if (response.ok) {
        setPendingCars(current => current.filter(car => car._id !== carId));
        setError('Car rejected successfully');
        setErrorType('success');
        // Optionally re-fetch or rely on local state update
        // fetchPendingCarPostings();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to reject car');
        setErrorType('error');
      }
    } catch (err) {
      console.error('Error rejecting car:', err);
      setError('An error occurred while rejecting the car.');
      setErrorType('error');
    }
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
            {/* Placeholder: Add logic and UI for car posting approvals here */}
            <Typography>Car posting approval functionality will be implemented here.</Typography>
            {/* Example: You might fetch pending car posts similar to pending users */}
            {/* <CircularProgress /> or <Typography>No pending car posts.</Typography> */}
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

      {/* Tab Panel for Car Posting Approvals */}
      <Box role="tabpanel" hidden={activeTab !== 1} id="tabpanel-1" aria-labelledby="tab-1">
        {activeTab === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>Pending Car Posting Approvals</Typography>
            {loading ? (
              <CircularProgress />
            ) : pendingCars.length === 0 ? (
              <Typography>No pending car postings to review.</Typography>
            ) : (
              pendingCars.map((car) => (
                <Card key={car._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{car.carName} - {car.brand}</Typography>
                    {car.ownerName && <Typography>Owner: {car.ownerName.firstName} {car.ownerName.lastName}</Typography>}
                    <Typography>Price: {car.price} / day</Typography>
                    <Typography>Location: {car.wilaya}</Typography>
                    <Typography>Type: {car.carType}</Typography>
                    {car.images && car.images.length > 0 && (
                      <Box sx={{ mt: 2, mb: 1 }}>
                        <img src={car.images[0]} alt={car.carName} style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: '4px' }} />
                      </Box>
                    )}
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
                        onClick={() => handleRejectCar(car._id)}
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
    </Container>
  );
};

export default AdminWelcomePage;
