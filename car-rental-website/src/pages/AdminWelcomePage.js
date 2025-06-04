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
  const [activeTab, setActiveTab] = useState(0);

  // State for Car Posting Approvals
  const [pendingCarPostings, setPendingCarPostings] = useState([]);
  const [carLoading, setCarLoading] = useState(true);
  const [carError, setCarError] = useState(null);
  const [carErrorType, setCarErrorType] = useState('error');

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
      fetchPendingCarPostings();
    }
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
        fetchPendingCarPostings();
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
    setCarLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Assuming /api/admin/all fetches all cars for admin, as per memory
      const response = await fetch(`${apiUrl}/api/admin/all`, { 
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
        throw new Error(errorData.error || 'Failed to fetch cars for admin');
      }

      const data = await response.json();
      // Filter for cars awaiting posting approval
      const carsToApprove = (data.cars || []).filter(car => car.status === 'awaiting_posting_approval');
      setPendingCarPostings(carsToApprove);
      setCarError(null);
    } catch (error) {
      console.error('Error fetching pending car postings:', error);
      setCarError(error.message || 'Failed to fetch pending car postings');
      setCarErrorType('error');
      if (error.message.includes('401') || error.message.includes('403')) {
        navigate('/');
      }
    } finally {
      setCarLoading(false);
    }
  };

  const handleUpdateCarStatus = async (carId, newStatus, successMessage, errorMessagePrefix) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/admin/cars/${carId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setPendingCarPostings(current => current.filter(car => car._id !== carId));
        setCarError(successMessage);
        setCarErrorType('success');
        // Optionally re-fetch or just update UI
        fetchPendingCarPostings(); 
      } else {
        const data = await response.json();
        setCarError(data.message || `${errorMessagePrefix} car`);
        setCarErrorType('error');
      }
    } catch (error) {
      setCarError(`${errorMessagePrefix} car`);
      setCarErrorType('error');
    }
  };

  const handlePostCar = (carId) => {
    handleUpdateCarStatus(carId, 'pending', 'Car posted successfully. It is now pending general approval.', 'Failed to post');
  };

  const handleRejectCarPosting = (carId) => {
    handleUpdateCarStatus(carId, 'rejected', 'Car posting rejected successfully.', 'Failed to reject');
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

      {/* Tab Panel for Car Posting Approvals */}
      <Box role="tabpanel" hidden={activeTab !== 1} id="tabpanel-1" aria-labelledby="tab-1">
        {activeTab === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>Pending Car Posting Approvals</Typography>
            {carLoading ? (
              <CircularProgress />
            ) : carError && carErrorType === 'error' ? (
              <Alert severity="error" sx={{ mb: 2 }}>{carError}</Alert>
            ) : pendingCarPostings.length === 0 ? (
              <Typography>No car postings to review.</Typography>
            ) : (
              pendingCarPostings.map((car) => (
                <Card key={car._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{car.carName} - {car.brand}</Typography>
                    <Typography>Owner: {car.ownerName?.firstName} {car.ownerName?.lastName}</Typography>
                    <Typography>Price: ${car.price}/day</Typography>
                    <Typography>Wilaya: {car.wilaya}</Typography>
                    <Typography>Status: {car.status}</Typography>
                    {/* Display car images if available */}
                    {car.images && car.images.length > 0 && (
                      <Box sx={{ mt: 2, display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {car.images.map((imgUrl, index) => (
                          <img key={index} src={imgUrl} alt={`${car.carName} image ${index + 1}`} style={{ width: 100, height: 'auto', border: '1px solid #ddd', borderRadius: '4px' }} />
                        ))}
                      </Box>
                    )}
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary" // Or 'success'
                        onClick={() => handlePostCar(car._id)}
                      >
                        Post Car (to Pending)
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleRejectCarPosting(car._id)}
                      >
                        Reject Posting
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        )}
      </Box>

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
    </Container>
  );
};

export default AdminWelcomePage;
