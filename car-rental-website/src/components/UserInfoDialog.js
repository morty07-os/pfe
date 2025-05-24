import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Rating,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const UserInfoDialog = ({ open, onClose, userId, userName }) => {
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !userId) {
      return;
    }

    const fetchUserRatings = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5001/api/ratings/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Filter out ratings where the user is the rater (only show ratings where user is the one being rated)
        const filteredRatings = response.data.filter(rating => 
          rating.ratedUserId && 
          (rating.ratedUserId._id === userId || rating.ratedUserId === userId)
        );
        
        setRatings(filteredRatings);
        if (filteredRatings.length > 0) {
          const totalRating = filteredRatings.reduce((sum, r) => sum + r.rating, 0);
          setAverageRating(totalRating / filteredRatings.length);
        } else {
          setAverageRating(0);
        }
      } catch (err) {
        console.error("Error fetching user ratings:", err);
        setError("Failed to load user ratings and feedback.");
        setRatings([]);
        setAverageRating(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRatings();
  }, [open, userId]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
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
          {userName}'s Profile
        </Typography>
        <Button 
          onClick={onClose} 
          sx={{ minWidth: 'auto', p: 0.5 }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }} color="text.secondary">
              Loading user information...
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mr: 1, fontWeight: 500 }}>
                Average Rating:
              </Typography>
              <Rating
                name="user-average-rating"
                value={averageRating}
                precision={0.5}
                readOnly
                emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
              />
              <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                ({ratings.length} reviews)
              </Typography>
            </Box>

            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Feedback:
            </Typography>
            {ratings.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No previous ratings or feedback for this user.
              </Typography>
            ) : (
              <List sx={{ maxHeight: 300, overflowY: 'auto' }}>
                {ratings.map((rating, index) => (
                  <React.Fragment key={rating._id || index}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Rating
                                name={`review-rating-${index}`}
                                value={rating.rating}
                                precision={1}
                                readOnly
                                size="small"
                                emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                              />
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                {new Date(rating.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              By: {rating.raterId && rating.raterId.firstName && rating.raterId.lastName
                                ? `${rating.raterId.firstName} ${rating.raterId.lastName}`
                                : rating.raterId && rating.raterId.username
                                  ? rating.raterId.username
                                  : 'Unknown User'}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography
                            sx={{ display: 'block' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {rating.review || 'No comment provided.'}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < ratings.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="contained"
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
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserInfoDialog;
