import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Rating,
  TextField,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';

const labels = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

const FeedbackDialog = ({ open, onClose, carId, userId, isCarOwner, carName, ownerName }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [carRating, setCarRating] = useState(0);
  const [carHover, setCarHover] = useState(-1);
  const [carFeedback, setCarFeedback] = useState('');
  
  const [userRating, setUserRating] = useState(0);
  const [userHover, setUserHover] = useState(-1);
  const [userFeedback, setUserFeedback] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSubmit = async () => {
    // For car owner, they only rate the renter
    if (isCarOwner) {
      if (userRating === 0) {
        setError('Please select a rating for the renter');
        return;
      }
    } 
    // For renter, they can rate both car and owner, but at least one is required
    else {
      if (activeTab === 0 && carRating === 0) {
        setError('Please select a rating for the car');
        return;
      }
      if (activeTab === 1 && userRating === 0) {
        setError('Please select a rating for the owner');
        return;
      }
    }

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      const raterId = localStorage.getItem('userId'); // Assuming rater's ID is stored in localStorage

      // If car owner is rating the renter
      if (isCarOwner) {
        await axios.post(
          'http://localhost:5001/api/ratings', // Corrected endpoint
          {
            raterId: raterId, // The owner giving the rating
            ratedUserId: userId, // The renter being rated
            rating: userRating,
            review: userFeedback, // Map comment to review
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }
      // If renter is rating
      else {
        // Submit car rating if provided
        if (carRating > 0) {
          await axios.post(
            'http://localhost:5001/api/ratings', // Corrected endpoint
            {
              raterId: raterId, // The renter giving the rating
              carId: carId, // The car being rated
              rating: carRating,
              review: carFeedback, // Map comment to review
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
        }

        // Submit owner rating if provided
        if (userRating > 0) {
          await axios.post(
            'http://localhost:5001/api/ratings', // Corrected endpoint
            {
              raterId: raterId, // The renter giving the rating
              ratedUserId: userId, // The owner being rated
              rating: userRating,
              review: userFeedback, // Map comment to review
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
        }
      }

      setSuccess(true);
      setTimeout(() => {
        onClose(true); // Pass true to indicate feedback was submitted
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError(error.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          width: '100%',
          maxWidth: '500px'
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
          {isCarOwner ? 'Rate the Renter' : 'Rate Your Experience'}
        </Typography>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          sx={{ minWidth: 'auto', p: 0.5 }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        {success ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Thank you for your feedback!
            </Alert>
            <Typography variant="body1">
              Your rating has been submitted successfully.
            </Typography>
          </Box>
        ) : (
          <>
            {/* For renters, show tabs to rate both car and owner */}
            {!isCarOwner && (
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                variant="fullWidth"
                sx={{ 
                  mb: 3,
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#000',
                  },
                  '& .MuiTab-root.Mui-selected': {
                    color: '#000',
                    fontWeight: 600
                  }
                }}
              >
                <Tab 
                  icon={<DirectionsCarIcon />} 
                  label="Rate Car" 
                  iconPosition="start"
                  sx={{ textTransform: 'none' }}
                />
                <Tab 
                  icon={<PersonIcon />} 
                  label="Rate Owner" 
                  iconPosition="start"
                  sx={{ textTransform: 'none' }}
                />
              </Tabs>
            )}

            {/* Car Rating Tab */}
            {(!isCarOwner && activeTab === 0) && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                mb: 3
              }}>
                <Typography component="legend" sx={{ mb: 1, fontWeight: 500 }}>
                  How would you rate {carName || 'this car'}?
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  flexDirection: 'column'
                }}>
                  <Rating
                    name="car-rating"
                    value={carRating}
                    precision={1}
                    size="large"
                    onChange={(event, newValue) => {
                      setCarRating(newValue);
                    }}
                    onChangeActive={(event, newHover) => {
                      setCarHover(newHover);
                    }}
                    emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                    sx={{ 
                      fontSize: '2.5rem',
                      mb: 1
                    }}
                  />
                  {carRating !== null && (
                    <Box sx={{ ml: 2, mt: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {labels[carHover !== -1 ? carHover : carRating]}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <TextField
                  label="Comments about the car (Optional)"
                  multiline
                  rows={4}
                  fullWidth
                  value={carFeedback}
                  onChange={(e) => setCarFeedback(e.target.value)}
                  variant="outlined"
                  placeholder="Share your experience with this car..."
                  sx={{ mt: 2, mb: 2 }}
                />
              </Box>
            )}

            {/* User Rating Tab (Owner rates renter or Renter rates owner) */}
            {(isCarOwner || (!isCarOwner && activeTab === 1)) && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                mb: 3
              }}>
                <Typography component="legend" sx={{ mb: 1, fontWeight: 500 }}>
                  {isCarOwner 
                    ? 'How would you rate this renter?' 
                    : `How would you rate ${ownerName || 'the car owner'}?`}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  flexDirection: 'column'
                }}>
                  <Rating
                    name="user-rating"
                    value={userRating}
                    precision={1}
                    size="large"
                    onChange={(event, newValue) => {
                      setUserRating(newValue);
                    }}
                    onChangeActive={(event, newHover) => {
                      setUserHover(newHover);
                    }}
                    emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                    sx={{ 
                      fontSize: '2.5rem',
                      mb: 1
                    }}
                  />
                  {userRating !== null && (
                    <Box sx={{ ml: 2, mt: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {labels[userHover !== -1 ? userHover : userRating]}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <TextField
                  label={isCarOwner ? "Comments about the renter (Optional)" : "Comments about the owner (Optional)"}
                  multiline
                  rows={4}
                  fullWidth
                  value={userFeedback}
                  onChange={(e) => setUserFeedback(e.target.value)}
                  variant="outlined"
                  placeholder={isCarOwner 
                    ? "Share your experience with this renter..." 
                    : "Share your experience with the car owner..."}
                  sx={{ mt: 2, mb: 2 }}
                />
              </Box>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </>
        )}
      </DialogContent>
      
      {!success && (
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button 
            onClick={handleClose} 
            variant="outlined"
            disabled={loading}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#000',
              '&:hover': {
                bgcolor: '#333',
              },
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default FeedbackDialog;
