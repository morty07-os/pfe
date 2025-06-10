import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Card, CardContent,
  Button, Stack, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, Alert, Tabs, Tab
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';

// Image Viewer Dialog for gallery
const ImageViewerDialog = ({ open, images, initialIndex = 0, onClose }) => {
  const [current, setCurrent] = useState(initialIndex); 
  useEffect(() => { setCurrent(initialIndex); }, [initialIndex, open]);
  if (!images || images.length === 0) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#f8fafc', p: 2 }}>
        <img
          src={images[current]}
          alt={`Gallery ${current + 1}`}
          style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 12, boxShadow: '0 4px 24px rgba(30,41,59,0.13)' }}
        />
        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          {images.map((img, idx) => (
            <Box
              key={idx}
              sx={{
                border: idx === current ? '2px solid #475569' : '2px solid #e2e8f0',
                borderRadius: 2,
                overflow: 'hidden',
                cursor: 'pointer',
                width: 64,
                height: 48,
                boxShadow: idx === current ? '0 2px 8px #47556933' : 'none',
                transition: 'border 0.2s',
              }}
              onClick={() => setCurrent(idx)}
            >
              <img src={img} alt={`thumb-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
          ))}
        </Box>
      </Box>
    </Dialog>
  );
};

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
  const [imageViewer, setImageViewer] = useState({ open: false, images: [], initial: 0 });

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
    <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
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
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#334155', mb: 3 }}>Pending User Approvals</Typography>
            {loading ? (
              <CircularProgress />
            ) : pendingUsers.length === 0 ? (
              <Typography>No pending users to review.</Typography>
            ) : (
              <Stack spacing={3}>
                {pendingUsers.map((user) => (
                  <Card key={user._id} elevation={3} sx={{
                    borderRadius: 4,
                    border: '1px solid #e2e8f0',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    boxShadow: '0 4px 24px rgba(30,41,59,0.07)',
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: '0 8px 32px rgba(30,41,59,0.13)' },
                  }}>
                    <CardContent>
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 700 }}>{user.firstName} {user.lastName}</Typography>
                          <Typography sx={{ color: '#64748b', mb: 1 }}>{user.email}</Typography>
                          <Typography variant="body2" sx={{ color: '#334155' }}>Phone: <b>{user.phone}</b></Typography>
                          <Typography variant="body2" sx={{ color: '#334155' }}>Residence: <b>{user.residence}</b></Typography>
                          <Typography variant="body2" sx={{ color: '#334155' }}>Role: <b>{user.role}</b></Typography>
                          <Typography variant="body2" sx={{ color: '#334155' }}>Created: <b>{new Date(user.createdAt).toLocaleDateString()}</b></Typography>
                        </Box>
                        <Box sx={{ minWidth: 180 }}>
                          <Typography variant="subtitle2" sx={{ color: '#475569', mb: 1 }}>License Images:</Typography>
                          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                            {user.licenceFront && (
                              <Box sx={{ position: 'relative', cursor: 'pointer' }} onClick={() => setImageViewer({ open: true, images: [user.licenceFront, user.licenceBack].filter(Boolean), initial: 0 })}>
                                <img src={user.licenceFront} alt="License Front" style={{ width: 100, height: 70, borderRadius: 6, border: '1.5px solid #cbd5e1', objectFit: 'cover', boxShadow: '0 2px 8px #47556922' }} />
                                <ZoomInIcon sx={{ position: 'absolute', bottom: 6, right: 6, color: '#475569', bgcolor: '#f8fafc', borderRadius: '50%', p: 0.3, fontSize: 22, opacity: 0.85 }} />
                              </Box>
                            )}
                            {user.licenceBack && (
                              <Box sx={{ position: 'relative', cursor: 'pointer' }} onClick={() => setImageViewer({ open: true, images: [user.licenceFront, user.licenceBack].filter(Boolean), initial: 1 })}>
                                <img src={user.licenceBack} alt="License Back" style={{ width: 100, height: 70, borderRadius: 6, border: '1.5px solid #cbd5e1', objectFit: 'cover', boxShadow: '0 2px 8px #47556922' }} />
                                <ZoomInIcon sx={{ position: 'absolute', bottom: 6, right: 6, color: '#475569', bgcolor: '#f8fafc', borderRadius: '50%', p: 0.3, fontSize: 22, opacity: 0.85 }} />
                              </Box>
                            )}
                          </Stack>
                        </Box>
                        <Stack direction="column" spacing={2} sx={{ minWidth: 160, mt: { xs: 2, md: 0 } }}>
                          <Button variant="contained" color="success" sx={{ borderRadius: 2, fontWeight: 600 }} onClick={() => handleApprove(user._id)}>Approve</Button>
                          <Button variant="contained" color="error" sx={{ borderRadius: 2, fontWeight: 600 }} onClick={() => setRejectDialog({ open: true, userId: user._id })}>Reject</Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
        )}
      </Box>

      {/* Tab Panel for Car Posting Approvals */}
      <Box role="tabpanel" hidden={activeTab !== 1} id="tabpanel-1" aria-labelledby="tab-1">
        {activeTab === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#334155', mb: 3 }}>Pending Car Posting Approvals</Typography>
            {pendingCars.length === 0 ? (
              <Typography>No pending car postings to review.</Typography>
            ) : (
              <Stack spacing={3}>
                {pendingCars.map((car) => (
                  <Card key={car._id} elevation={3} sx={{
                    borderRadius: 4,
                    border: '1px solid #e2e8f0',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    boxShadow: '0 4px 24px rgba(30,41,59,0.07)',
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: '0 8px 32px rgba(30,41,59,0.13)' },
                  }}>
                    <CardContent>
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 700 }}>{car.carName}</Typography>
                          <Typography sx={{ color: '#64748b', mb: 1 }}>Owner: {car.owner?.firstName} {car.owner?.lastName}</Typography>
                          <Typography variant="body2" sx={{ color: '#334155' }}>Brand: <b>{car.brand}</b></Typography>
                          <Typography variant="body2" sx={{ color: '#334155' }}>Wilaya: <b>{car.wilaya}</b></Typography>
                          <Typography variant="body2" sx={{ color: '#334155' }}>Price: <b>{car.price} DZD/day</b></Typography>
                          <Typography variant="body2" sx={{ color: '#334155' }}>Description: <b>{car.description}</b></Typography>
                          <Typography variant="body2" sx={{ color: '#334155' }}>Energy: <b>{car.energy}</b></Typography>
                          <Typography variant="body2" sx={{ color: '#334155' }}>Seats: <b>{car.seats}</b></Typography>
                          <Typography variant="body2" sx={{ color: '#334155' }}>Doors: <b>{car.doors}</b></Typography>
                          <Typography variant="body2" sx={{ color: '#334155' }}>Transmission: <b>{car.transmission}</b></Typography>
                          <Typography variant="body2" sx={{ color: '#334155' }}>Mileage: <b>{car.mileage}</b></Typography>
                          <Typography variant="body2" sx={{ color: '#334155' }}>Engine: <b>{car.engine}</b></Typography>
                          <Typography variant="body2" sx={{ color: '#334155' }}>Available: <b>{car.availabilityStart} to {car.availabilityEnd}</b></Typography>
                          <Typography variant="body2" sx={{ color: '#334155' }}>Car Type: <b>{car.carType}</b></Typography>
                        </Box>
                        <Box sx={{ minWidth: 180 }}>
                          <Typography variant="subtitle2" sx={{ color: '#475569', mb: 1 }}>Car Images:</Typography>
                          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                            {(car.images || []).map((img, idx) => (
                              <Box key={idx} sx={{ position: 'relative', cursor: 'pointer' }} onClick={() => setImageViewer({ open: true, images: car.images, initial: idx })}>
                                <img src={img} alt={`Car ${idx + 1}`} style={{ width: 100, height: 70, borderRadius: 6, border: '1.5px solid #cbd5e1', objectFit: 'cover', boxShadow: '0 2px 8px #47556922' }} />
                                <ZoomInIcon sx={{ position: 'absolute', bottom: 6, right: 6, color: '#475569', bgcolor: '#f8fafc', borderRadius: '50%', p: 0.3, fontSize: 22, opacity: 0.85 }} />
                              </Box>
                            ))}
                          </Stack>
                          {car.documentationImages && car.documentationImages.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" sx={{ color: '#475569', mb: 1 }}>Documentation Images:</Typography>
                              <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                                {car.documentationImages.map((img, idx) => (
                                  <Box key={idx} sx={{ position: 'relative', cursor: 'pointer' }} onClick={() => setImageViewer({ open: true, images: car.documentationImages, initial: idx })}>
                                    <img src={img} alt={`Doc ${idx + 1}`} style={{ width: 80, height: 60, borderRadius: 6, border: '1.5px solid #cbd5e1', objectFit: 'cover', boxShadow: '0 2px 8px #47556922' }} />
                                    <ZoomInIcon sx={{ position: 'absolute', bottom: 4, right: 4, color: '#475569', bgcolor: '#f8fafc', borderRadius: '50%', p: 0.2, fontSize: 18, opacity: 0.85 }} />
                                  </Box>
                                ))}
                              </Stack>
                            </Box>
                          )}
                        </Box>
                        <Stack direction="column" spacing={2} sx={{ minWidth: 160, mt: { xs: 2, md: 0 } }}>
                          <Button variant="contained" color="success" sx={{ borderRadius: 2, fontWeight: 600 }} onClick={() => handleApproveCar(car._id)}>Approve</Button>
                          <Button variant="contained" color="error" sx={{ borderRadius: 2, fontWeight: 600 }} onClick={() => setCarRejectDialog({ open: true, carId: car._id })}>Reject</Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
        )}
      </Box>

      {/* Tab Panel for Booking Approvals */}
      <Box role="tabpanel" hidden={activeTab !== 2} id="tabpanel-2" aria-labelledby="tab-2">
        {activeTab === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#334155', mb: 3 }}>Pending Booking Approvals</Typography>
            {/* Placeholder: Add logic and UI for booking approvals here */}
            <Typography>Booking approval functionality will be implemented here.</Typography>
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

      {/* Image Viewer Dialog */}
      <ImageViewerDialog
        open={imageViewer.open}
        images={imageViewer.images}
        initialIndex={imageViewer.initial}
        onClose={() => setImageViewer({ open: false, images: [], initial: 0 })}
      />
    </Container>
  );
};

export default AdminWelcomePage;
