import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Avatar,
  Rating,
  Divider,
  Paper,
  CircularProgress,
  Chip,
  Grid,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import axios from 'axios';

const RnF_user = ({ open, onClose, userId, userName }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId || !open) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        
        // Fetch user profile information
        const userResponse = await axios.get(
          `http://localhost:5001/api/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        setUserInfo(userResponse.data);
        // Fetch user ratings
        const ratingsResponse = await axios.get(
          `http://localhost:5001/api/ratings/user/${userId}`, // Corrected endpoint
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        // Fetch average rating for the user
        const averageRatingResponse = await axios.get(
            `http://localhost:5001/api/ratings/average/user/${userId}`, // Corrected endpoint
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        
        if (ratingsResponse.data) {
          setFeedbacks(ratingsResponse.data || []); // Assuming the response is an array of ratings
        }
        if (averageRatingResponse.data) {
            setAverageRating(averageRatingResponse.data.averageRating || 0);
            setTotalReviews(averageRatingResponse.data.totalRatings || 0);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user ratings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId, open]);

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e2e8f0',
        pb: 1
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          User Ratings & Feedback
        </Typography>
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3, pb: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        ) : (
          <>
            {/* User Profile Section */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'center', sm: 'flex-start' },
              gap: 3,
              mb: 4
            }}>
              <Avatar
                src={userInfo?.profileImage}
                sx={{ 
                  width: 100, 
                  height: 100,
                  bgcolor: '#1e293b',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                {!userInfo?.profileImage && <PersonIcon sx={{ fontSize: 60 }} />}
              </Avatar>
              
              <Box sx={{ 
                textAlign: { xs: 'center', sm: 'left' },
                flex: 1
              }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  {userInfo?.firstName} {userInfo?.lastName || ''}
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                  mb: 1
                }}>
                  <Rating 
                    value={averageRating} 
                    precision={0.5} 
                    readOnly 
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {averageRating.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', ml: 1 }}>
                    ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  gap: 1,
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                  mt: 2
                }}>
                  {userInfo?.memberSince && (
                    <Chip 
                      label={`Member since ${new Date(userInfo.memberSince).getFullYear()}`} 
                      size="small"
                      sx={{ bgcolor: '#f1f5f9' }}
                    />
                  )}
                  {userInfo?.isVerified && (
                    <Chip 
                      label="Verified User" 
                      size="small"
                      color="primary"
                      sx={{ bgcolor: '#1e293b' }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 4 }} />
            
            {/* Feedback Section */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              User Feedback
            </Typography>
            
            {feedbacks.length === 0 ? (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  bgcolor: '#f8fafc',
                  borderRadius: 2,
                  border: '1px dashed #cbd5e1'
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  No feedback received yet.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {feedbacks.map((feedback, index) => (
                  <Grid item xs={12} key={index}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 3, 
                        borderRadius: 2,
                        border: '1px solid #e2e8f0',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 4,
                          bgcolor: feedback.rating >= 4 ? '#10b981' : 
                                  feedback.rating >= 3 ? '#f59e0b' : '#ef4444',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Rating value={feedback.rating} readOnly size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(feedback.createdAt)}
                        </Typography>
                      </Box>
                      
                      {feedback.comment && (
                        <Box sx={{ display: 'flex', mt: 1 }}>
                          <FormatQuoteIcon 
                            sx={{ 
                              fontSize: 20, 
                              color: 'text.secondary',
                              mr: 1,
                              transform: 'scaleX(-1)'
                            }} 
                          />
                          <Typography variant="body2">
                            {feedback.comment}
                          </Typography>
                        </Box>
                      )}
                      
                      {feedback.fromUser && (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          mt: 2
                        }}>
                          <Avatar 
                            src={feedback.fromUser.profileImage} 
                            sx={{ 
                              width: 24, 
                              height: 24,
                              mr: 1,
                              bgcolor: '#64748b'
                            }}
                          >
                            <PersonIcon sx={{ fontSize: 16 }} />
                          </Avatar>
                          <Typography variant="caption" color="text.secondary">
                            Feedback from {feedback.fromUser.firstName} {feedback.fromUser.lastName}
                          </Typography>
                        </Box>
                      )}
                      
                      {feedback.feedbackType && (
                        <Chip 
                          label={feedback.feedbackType === 'owner' ? 'As Owner' : 
                                feedback.feedbackType === 'renter' ? 'As Renter' : 
                                'Car Feedback'}
                          size="small"
                          sx={{ 
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            bgcolor: '#f1f5f9',
                            fontSize: '0.7rem'
                          }}
                        />
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RnF_user;
