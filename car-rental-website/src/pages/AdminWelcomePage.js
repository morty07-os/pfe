import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, Card, CardContent, CardHeader, Grid,
  Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert, Tabs, Tab, CardActions, IconButton, Avatar, Chip, Tooltip, Rating
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { styled } from '@mui/material/styles';
import Navbar from '../components/Navbar';

const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';

// Image Viewer Dialog for gallery
const ImageViewerDialog = ({ open, images, initialIndex = 0, onClose }) => {
  const [current, setCurrent] = useState(initialIndex); 
  useEffect(() => { setCurrent(initialIndex); }, [initialIndex, open]);
  if (!images || images.length === 0) return null;
  const total = images.length;
  const prev = () => setCurrent((current-1+total)%total);
  const next = () => setCurrent((current+1)%total);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box sx={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', bgcolor: '#f8fafc', p: 2 }}>
        {/* arrows */}
        <IconButton onClick={prev} sx={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', bgcolor:'#fff8', '&:hover':{bgcolor:'#ffffff'} }}>
          <ArrowBackIosNewIcon />
        </IconButton>
        <IconButton onClick={next} sx={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', bgcolor:'#fff8', '&:hover':{bgcolor:'#ffffff'} }}>
          <ArrowForwardIosIcon />
        </IconButton>
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

const ContainerStyled = styled(Container)({
  marginTop: 8,
  marginBottom: 8,
  background: 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)',
  borderRadius: 16,
  boxShadow: '0 10px 30px -15px rgba(71, 85, 105, 0.15), 0 5px 15px -5px rgba(71, 85, 105, 0.1)',
  padding: '40px !important',
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #475569, #64748b)',
  },
});

const CardStyled = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: 12,
  overflow: 'hidden',
  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
  boxShadow: '0 5px 15px -5px rgba(71, 85, 105, 0.1), 0 2px 6px -2px rgba(71, 85, 105, 0.05)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 25px -5px rgba(71, 85, 105, 0.15), 0 5px 10px -2px rgba(71, 85, 105, 0.1)',
  },
  '& .MuiCardHeader-root': {
    padding: theme.spacing(2, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '& .MuiCardHeader-title': {
    fontWeight: 600,
    color: '#334155',
  },
  '& .MuiCardHeader-subheader': {
    fontWeight: 500,
    color: '#64748b',
  },
  '& .MuiCardContent-root': {
    padding: theme.spacing(3),
  },
}));

const ActionButton = styled(Button)(({ theme, color = 'primary' }) => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1, 3),
  boxShadow: '0 2px 5px -1px rgba(71, 85, 105, 0.15)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  marginLeft: theme.spacing(1),
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 10px -2px rgba(71, 85, 105, 0.2)',
  },
  '&:active': {
    transform: 'translateY(1px)',
    boxShadow: '0 1px 3px -1px rgba(71, 85, 105, 0.1)',
  },
  ...(color === 'primary' && {
    backgroundColor: '#475569',
    color: '#ffffff',
    '&:hover': {
      backgroundColor: '#334155',
    },
  }),
  ...(color === 'secondary' && {
    backgroundColor: '#64748b',
    color: '#ffffff',
    '&:hover': {
      backgroundColor: '#475569',
    },
  }),
}));

const InfoRow = ({ label, value }) => (
  <Grid container sx={{ mb:1.2, borderRadius:3, overflow:'hidden', position:'relative', boxShadow:'inset 0 0 0 1px #cbd5e1, 0 1px 3px rgba(71,85,105,0.08)' }}>
    {/* left accent */}
    <Box sx={{ position:'absolute', left:0, top:0, bottom:0, width:4, background:`linear-gradient(180deg, #475569 0%, #64748b 100%)` }} />
    <Grid item xs={6} sx={{ backgroundColor:'#e7ecf3', px:1.4, py:0.9, pl:2.8, display:'flex', alignItems:'center' }}>
      <Typography variant="body2" sx={{ fontWeight:600, color:'#334155', fontSize:'0.8rem', textTransform:'capitalize', letterSpacing:0.2 }}>{label}</Typography>
    </Grid>
    <Grid item xs={6} sx={{ backgroundColor:'#f9fbfd', px:1.4, py:0.9, textAlign:'right', display:'flex', alignItems:'center', justifyContent:'flex-end' }}>
      <Typography variant="body2" sx={{ fontWeight:500, color:'#475569', fontSize:'0.8rem' }}>{value && value!=='N/A' && value!=='undefined' ? value : 'Not specified'}</Typography>
    </Grid>
  </Grid>
);

const AdminWelcomePage = () => {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingCars, setPendingCars] = useState([]);
  const [pendingReceipts, setPendingReceipts] = useState([]);
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
    } else if (activeTab === 2) { // Fetch receipts when Booking Approvals tab is active
      fetchPendingReceipts();
    }
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
    } else if (activeTab === 2) {
      interval = setInterval(() => {
        fetchPendingReceipts();
      }, 30000); // Refresh every 30 seconds for booking approvals
    }

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
      
      // Fetch owner ratings for each car
      const carsWithRatings = await Promise.all(data.map(async (car) => {
        let ownerId = null;
        if (car.owner) {
          ownerId = typeof car.owner === 'string' ? car.owner : car.owner._id;
        }

        if (ownerId) {
          try {
            const ownerRatingsResponse = await fetch(
              `${apiUrl}/api/ratings/average/user/${ownerId}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            if (ownerRatingsResponse.ok) {
              const ratingsData = await ownerRatingsResponse.json();
              return {
                ...car,
                ownerRating: ratingsData.averageRating || 0,
                ownerReviews: ratingsData.totalRatings || 0
              };
            }
          } catch (ratingsError) {
            console.error('Error fetching owner ratings:', ratingsError);
            // Continue without ratings if there's an error
            return {
              ...car,
              ownerRating: 0,
              ownerReviews: 0
            };
          }
        }
        return {
          ...car,
          ownerRating: 0,
          ownerReviews: 0
        };
      }));

      setPendingCars(carsWithRatings);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchPendingReceipts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/admin/pending-receipts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending receipts');
      }

      const data = await response.json();
      setPendingReceipts(data.receipts || []);
    } catch (error) {
      console.error('Error fetching pending receipts:', error);
      setError(error.message || 'Failed to fetch pending receipts');
      setErrorType('error');
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

  const handleApproveReceipt = async (receiptId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/admin/approve-receipt/${receiptId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve receipt');
      }

      setPendingReceipts(current => current.filter(receipt => receipt._id !== receiptId));
      setError('Receipt approved successfully');
      setErrorType('success');
    } catch (error) {
      console.error('Error approving receipt:', error);
      setError(error.message || 'Failed to approve receipt');
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

  const handleRejectReceipt = async (receiptId, reason) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/admin/reject-receipt/${receiptId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error('Failed to reject receipt');
      }

      setPendingReceipts(current => current.filter(receipt => receipt._id !== receiptId));
      setError('Receipt rejected successfully');
      setErrorType('success');
    } catch (error) {
      console.error('Error rejecting receipt:', error);
      setError(error.message || 'Failed to reject receipt');
      setErrorType('error');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const openImageViewer = (images, initialIndex) => {
    setImageViewer({ open: true, images, initial: initialIndex });
  };

  return (
    <>
      <Navbar />
      <ContainerStyled maxWidth="lg">
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 5 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="admin approval tabs" sx={{
            '& .MuiTab-root': {
              fontSize: '1.1rem',
              fontWeight: 600,
              padding: '16px 24px',
              color: '#64748b',
              '&.Mui-selected': {
                color: '#334155',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#475569',
              height: 4,
              borderRadius: '4px 4px 0 0',
            },
          }}>
            <Tab label="User Approvals" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="Car Posting Approvals" id="tab-1" aria-controls="tabpanel-1" />
            <Tab label="Booking Approvals" id="tab-2" aria-controls="tabpanel-2" />
          </Tabs>
        </Box>

        {error && (
          <Alert severity={errorType} variant="filled" sx={{ mb: 3, backgroundColor: errorType === 'success' ? '#475569' : '#64748b', color: '#fff', '& .MuiAlert-icon': { color: '#fff' }, borderRadius: 2, boxShadow: '0 2px 10px rgba(71, 85, 105, 0.2)' }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tab Panel for User Approvals */}
        <Box role="tabpanel" hidden={activeTab !== 0} id="tabpanel-0" aria-labelledby="tab-0">
          {activeTab === 0 && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#334155', mb: 3 }}>Pending User Approvals</Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" my={5}>
                  <CircularProgress sx={{ color: '#475569' }} />
                </Box>
              ) : pendingUsers.length === 0 ? (
                <Alert severity="info" variant="filled" sx={{ backgroundColor: '#64748b', color: '#fff', '& .MuiAlert-icon': { color: '#fff' }, borderRadius: 2, boxShadow: '0 2px 10px rgba(71, 85, 105, 0.2)', py: 3, px: 4, fontSize: '1rem' }}>
                  No pending user approvals.
                </Alert>
              ) : (
                pendingUsers.map(user => (
                  <CardStyled key={user._id}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 700 }}>{user.firstName} {user.lastName}</Typography>
                      <Typography sx={{ color: '#64748b', mb: 1 }}>{user.email}</Typography>
                      <Typography variant="body2" sx={{ color: '#334155' }}>Phone: <b>{user.phone}</b></Typography>
                      <Typography variant="body2" sx={{ color: '#334155' }}>Residence: <b>{user.residence}</b></Typography>
                      <Typography variant="body2" sx={{ color: '#334155' }}>Role: <b>{user.role}</b></Typography>
                      <Typography variant="body2" sx={{ color: '#334155' }}>Created: <b>{new Date(user.createdAt).toLocaleDateString()}</b></Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'center', gap:2, px: 3, py: 2, backgroundColor: '#f1f5f9' }}>
                      <ActionButton variant="contained" color="secondary" onClick={() => setRejectDialog({ open: true, userId: user._id })}>
                        Reject
                      </ActionButton>
                      <ActionButton variant="contained" color="primary" onClick={() => handleApprove(user._id)}>
                        Approve
                      </ActionButton>
                    </CardActions>
                  </CardStyled>
                ))
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
                <Alert severity="info" variant="filled" sx={{ backgroundColor: '#64748b', color: '#fff', '& .MuiAlert-icon': { color: '#fff' }, borderRadius: 2, boxShadow: '0 2px 10px rgba(71, 85, 105, 0.2)', py: 3, px: 4, fontSize: '1rem' }}>
                  No pending car postings to review.
                </Alert>
              ) : (
                <Stack spacing={3}>
                  {pendingCars.map((car) => (
                    <CardStyled key={car._id}>
                      <CardHeader
                        title={(() => {
                          const manufacturer = car.manufacturer || '';
                          const model = car.model || '';
                          const year = car.year ? `(${car.year})` : '';
                          if (manufacturer || model || year) {
                            return `${manufacturer} ${model} ${year}`.trim();
                          } else {
                            return 'Car Details';
                          }
                        })()}
                        subheader={`Owner: ${typeof car.ownerName==='object' ? `${car.ownerName.firstName} ${car.ownerName.lastName}` : car.ownerName} | Category: ${car.category}`}
                        sx={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}
                      />
                      <CardContent sx={{ padding: 0 }}>
                        {(()=>{ /* compute simple risk */ })()}
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={3} sx={{ order:{md:1}, p: 1, pr:1.5, borderRight: { md: '1px solid #e2e8f0' }, backgroundColor:'#ffffff', borderRadius:2, boxShadow:'0 2px 8px rgba(0,0,0,0.05)', maxWidth:220, maxHeight:420, overflowY:'auto', scrollbarWidth:'thin', scrollbarColor:'#94a3b8 #f1f5f9', '&::-webkit-scrollbar':{ width:'6px' }, '&::-webkit-scrollbar-track':{ background:'#f1f5f9', borderRadius:3 }, '&::-webkit-scrollbar-thumb':{ background:'#94a3b8', borderRadius:3 }, '&::-webkit-scrollbar-thumb:hover':{ background:'#64748b' } }}>
                            <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 700, mb: 1.2, letterSpacing:0.3, borderBottom: '2px solid #475569', pb: 0.4 }}>Car Details & Specs</Typography>
                            
                            <Typography variant="subtitle2" sx={{ color: '#475569', fontWeight: 700, mt: 1, mb: 0.3, fontSize:'0.7rem', letterSpacing:0.4 }}>REGISTRATION</Typography>
                            <InfoRow label="Location" value={car.location} />
                            <InfoRow label="Status" value={car.status} />

                            <Typography variant="subtitle2" sx={{ color: '#475569', fontWeight: 700, mt: 1, mb: 0.3, fontSize:'0.7rem', letterSpacing:0.4 }}>PRICING</Typography>
                            <InfoRow label="Price per Day" value={`${car.pricePerDay} DZD`} />

                            <Typography variant="subtitle2" sx={{ color: '#475569', fontWeight: 700, mt: 1, mb: 0.3, fontSize:'0.7rem', letterSpacing:0.4 }}>SPECIFICATIONS</Typography>
                            <InfoRow label="Category" value={car.category} />
                            <InfoRow label="Transmission" value={car.transmission} />
                            <InfoRow label="Energy" value={car.energy} />
                            <InfoRow label="Seats" value={car.seats} />
                            <InfoRow label="Doors" value={car.doors} />
                            
                            <Typography variant="subtitle2" sx={{ color: '#475569', fontWeight: 700, mt: 1, mb: 0.3, fontSize:'0.7rem', letterSpacing:0.4 }}>POSTING INFO</Typography>
                            <InfoRow label="Posted On" value={new Date(car.createdAt).toLocaleDateString()} />
                          </Grid>
                          {/* Owner Snapshot Column */}
                          <Grid item xs={12} md={4} sx={{ order:{md:2}, display:'flex', flexDirection:'column', alignItems:'center', gap:1.5, p:2, textAlign:'center', mx:{md:'auto'} }}>
                            {(()=>{const displayName=(car.ownerName&&typeof car.ownerName==='object')?`${car.ownerName.firstName} ${car.ownerName.lastName}`: (car.ownerName||''); const initial=displayName.charAt(0).toUpperCase(); return (
                              <Avatar src={car.ownerAvatar || undefined} sx={{ width:90, height:90, mb:1, boxShadow:'0 2px 6px rgba(30,41,59,0.15)', bgcolor:'#cbd5e1', color:'#334155', fontSize:36 }}>
                                {!car.ownerAvatar && initial}
                              </Avatar>
                            );})()}
                            <Typography variant="subtitle1" sx={{ fontWeight:700, color:'#334155', letterSpacing:0.3 }}>
                              {car.ownerName && typeof car.ownerName === 'object' ? `${car.ownerName.firstName} ${car.ownerName.lastName}` : car.ownerName}
                            </Typography>
                            {(()=>{const phone=car.ownerPhone || car.phone || (car.owner&&car.owner.phone) || car.ownerPhoneNumber; return phone ? (
                              <Typography variant="body2" sx={{ color:'#475569' }}>
                                📞 {phone}
                              </Typography>
                            ) : null;})()}
                            {car.ownerEmail && typeof car.ownerEmail === 'string' && (
                              <Typography variant="body2" sx={{ color:'#64748b' }}>{car.ownerEmail}</Typography>
                            )}
                            {/* Rating & stats */}
                            <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', gap:0.3, mt:0.5 }}>
                              {(()=>{const rating=car.ownerRating || 0; const reviews=car.ownerReviews || 0; return (
                                <Box sx={{ display:'flex', alignItems:'center', gap:0.5 }}>
                                  <Rating value={rating} precision={0.1} readOnly size="small" />
                                  <Typography variant="caption" sx={{ color:'#475569' }}>({reviews})</Typography>
                                </Box>
                              );})()}
                              <Typography variant="caption" sx={{ color:'#475569' }}>Avg Response: {car.ownerAvgResponseTime || '—'}</Typography>
                              <Typography variant="caption" sx={{ color:'#475569' }}>Cancellations: {car.ownerCancellationCount ?? 0}</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color:'#475569' }}>Total Rentals: {car.ownerTotalRentals || 0}</Typography>
                            {/* Risk Score */}
                            {(()=>{
                              const levels=['Low','Medium','High'];
                              let score='Low';
                              if(car.mileage>150000||car.year<2010){score='High';}
                              else if(car.mileage>100000||car.year<2015){score='Medium';}
                              return (
                                <Box sx={{ display:'flex', border:'1px solid rgba(71,85,105,0.4)', borderRadius:24, overflow:'hidden', width:'100%', maxWidth:240, backdropFilter:'blur(2px)', boxShadow:'inset 0 0 4px rgba(0,0,0,0.04)' }}>
                                  {levels.map((l,idx)=> (
                                    <Box key={l} sx={{
                                      flex:1,
                                      backgroundColor: l===score ? '#475569' : 'transparent',
                                      color: l===score ? '#ffffff' : '#475569',
                                      textAlign:'center',
                                      py:0.7,
                                      fontSize:'0.8rem',
                                      fontWeight:600,
                                      borderLeft: idx!==0 ? '1px solid rgba(71,85,105,0.15)' : 'none',
                                      transition:'background-color 0.25s ease',
                                      '&:hover':{ backgroundColor: l===score ? '#475569' : 'rgba(71,85,105,0.08)' }
                                    }}>
                                      {l}
                                    </Box>
                                  ))}
                                </Box>
                              );})()}
                            <Tooltip title="Low: mileage < 100k & year ≥ 2015 | Medium: 100k-150k or 2010-2014 | High: >150k or <2010" placement="top" arrow>
                              <Box sx={{ display:'flex', alignItems:'center', mt:0.5, cursor:'pointer', color:'#64748b', fontSize:'0.65rem' }}>
                                <InfoOutlinedIcon sx={{ fontSize:14, mr:0.4 }} />
                                <Typography variant="caption" sx={{ color:'inherit' }}>How we calculate risk</Typography>
                              </Box>
                            </Tooltip>
                          </Grid>
                          <Grid item xs={12} md={5} sx={{ order:{md:3}, p: 3, backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius:3, boxShadow:'0 3px 8px rgba(71,85,105,0.08)', display:'flex', flexDirection:'column', alignItems:'center', gap:3, maxWidth:{md:260}, ml:{md:'auto'} }}>
                            {car.images && car.images.length > 0 && (
                              <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 700, mb: 1.5, position:'relative', pl:1, letterSpacing:0.4 }}>
                                  <Box component="span" sx={{ position:'absolute', left:0, top:0, bottom:0, width:4, background:'#64748b', borderRadius:1, mr:1 }} />
                                  Car Images
                                </Typography>
                                <Box display="flex" flexWrap="wrap" gap={2} sx={{ justifyContent:'center' }}>
                                  {car.images.map((img, idx) => (
                                    <Box key={idx} sx={{ position: 'relative', cursor: 'pointer', overflow: 'hidden', borderRadius: 2, '&:hover img': { transform: 'scale(1.05)' }, '&:hover .zoom-icon': { opacity: 1 } }} onClick={() => openImageViewer(car.images, idx)}>
                                      <img 
                                        src={img} 
                                        alt={`Car image ${idx + 1}`} 
                                        style={{ width: 140, height: 90, borderRadius: 8, border: '1px solid #e9ecef', objectFit: 'cover', transition: 'transform 0.3s ease' }} 
                                      />
                                      <Box className="zoom-icon" sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.3s ease', pointerEvents: 'none' }}>
                                        <ZoomInIcon sx={{ color: '#fff', fontSize: 30 }} />
                                      </Box>
                                    </Box>
                                  ))}
                                </Box>
                              </Box>
                            )}
                            {car.documentationImages && car.documentationImages.length > 0 && (
                              <Box>
                                <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 700, mb: 1.5, position:'relative', pl:1, letterSpacing:0.4 }}>
                                  <Box component="span" sx={{ position:'absolute', left:0, top:0, bottom:0, width:4, background:'#64748b', borderRadius:1, mr:1 }} />
                                  Documentation
                                </Typography>
                                <Box display="flex" flexWrap="wrap" gap={2} sx={{ justifyContent:'center' }}>
                                  {car.documentationImages.map((doc, idx) => (
                                    <Box key={idx} sx={{ position: 'relative', cursor: 'pointer', overflow: 'hidden', borderRadius: 2, '&:hover img': { transform: 'scale(1.05)' }, '&:hover .zoom-icon': { opacity: 1 } }} onClick={() => openImageViewer(car.documentationImages, idx)}>
                                      <img 
                                        src={doc} 
                                        alt={`Documentation ${idx + 1}`} 
                                        style={{ width: 120, height: 80, borderRadius: 8, border: '1px solid #e9ecef', objectFit: 'cover', transition: 'transform 0.3s ease' }} 
                                      />
                                      <Box className="zoom-icon" sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.3s ease', pointerEvents: 'none' }}>
                                        <ZoomInIcon sx={{ color: '#fff', fontSize: 28 }} />
                                      </Box>
                                    </Box>
                                  ))}
                                </Box>
                              </Box>
                            )}
                          </Grid>
                        </Grid>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'center', gap:2, px: 3, py: 2, backgroundColor: '#f1f5f9', borderTop: '1px solid #e2e8f0' }}>
                        <ActionButton variant="contained" color="secondary" onClick={() => setCarRejectDialog({ open: true, carId: car._id })}>
                          Reject
                        </ActionButton>
                        <ActionButton variant="contained" color="primary" onClick={() => handleApproveCar(car._id)}>
                          Approve
                        </ActionButton>
                      </CardActions>
                    </CardStyled>
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
              {loading ? (
                <Box display="flex" justifyContent="center" my={5}>
                  <CircularProgress sx={{ color: '#475569' }} />
                </Box>
              ) : pendingReceipts.length === 0 ? (
                <Alert severity="info" variant="filled" sx={{ backgroundColor: '#64748b', color: '#fff', '& .MuiAlert-icon': { color: '#fff' }, borderRadius: 2, boxShadow: '0 2px 10px rgba(71, 85, 105, 0.2)', py: 3, px: 4, fontSize: '1rem' }}>
                  No pending booking receipts to review.
                </Alert>
              ) : (
                <Stack spacing={3}>
                  {pendingReceipts.map((receipt) => (
                    <CardStyled key={receipt._id}>
                      <CardHeader
                        title={`Receipt for ${receipt.carId?.carName || 'Unknown Car'}`}
                        subheader={`Sent by: ${receipt.userId?.firstName} ${receipt.userId?.lastName} | Owner: ${receipt.ownerId?.firstName} ${receipt.ownerId?.lastName}`}
                        sx={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}
                      />
                      <CardContent>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Receipt Image:</Typography>
                            <Box
                              sx={{
                                width: '100%',
                                height: 200,
                                bgcolor: '#e2e8f0',
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                position: 'relative',
                                '&:hover .zoom-icon': { opacity: 1 }
                              }}
                              onClick={() => openImageViewer([receipt.receiptImageUrl], 0)}
                            >
                              <img
                                src={receipt.receiptImageUrl}
                                alt="Receipt"
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                              />
                              <Box className="zoom-icon" sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.3s ease', pointerEvents: 'none' }}>
                                <ZoomInIcon sx={{ color: '#fff', fontSize: 30 }} />
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Receipt Details:</Typography>
                            <InfoRow label="Car Name" value={receipt.carId?.carName || 'N/A'} />
                            <InfoRow label="Car Brand" value={receipt.carId?.brand || 'N/A'} />
                            <InfoRow label="Conversation ID" value={receipt.conversationId} />
                            <InfoRow label="Sent At" value={new Date(receipt.sentAt).toLocaleDateString()} />
                            <InfoRow label="Renter Email" value={receipt.userId?.email || 'N/A'} />
                            <InfoRow label="Owner Email" value={receipt.ownerId?.email || 'N/A'} />
                          </Grid>
                        </Grid>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'center', gap: 2, px: 3, py: 2, backgroundColor: '#f1f5f9', borderTop: '1px solid #e2e8f0' }}>
                        <ActionButton variant="contained" color="secondary" onClick={() => handleRejectReceipt(receipt._id, 'Admin rejected the receipt.')}>
                          Reject
                        </ActionButton>
                        <ActionButton variant="contained" color="primary" onClick={() => handleApproveReceipt(receipt._id)}>
                          Approve
                        </ActionButton>
                      </CardActions>
                    </CardStyled>
                  ))}
                </Stack>
              )}
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
      </ContainerStyled>
    </>
  );
};

export default AdminWelcomePage;
