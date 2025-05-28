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
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import axios from 'axios';

const UserRatingDialog = ({ open, onClose, userId, userName }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState({
    averageRating: 0,
    totalRatings: 0,
    feedbacks: []
  });

  useEffect(() => {
    const fetchUserRatings = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/feedback/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user ratings:', error);
        setError('Failed to load user ratings');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchUserRatings();
    }
  }, [userId, open]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          width: '100%',
          maxWidth: '600px'
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
          {userName}'s Ratings & Reviews
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
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : (
          <>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 3, 
                bgcolor: 'background.default',
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    bgcolor: 'primary.main',
                    fontSize: '1.5rem',
                    mr: 2
                  }}
                >
                  {userName?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {userName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Rating 
                      value={userData.averageRating} 
                      precision={0.5} 
                      readOnly 
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      ({userData.totalRatings} reviews)
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                Average Rating: {userData.averageRating.toFixed(1)}/5
              </Typography>
            </Paper>

            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Reviews
            </Typography>

            <List sx={{ width: '100%' }}>
              {userData.feedbacks.map((feedback, index) => (
                <React.Fragment key={feedback._id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Rating 
                            value={feedback.rating} 
                            readOnly 
                            size="small" 
                            sx={{ mr: 1 }}
                          />
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                          >
                            {formatDate(feedback.createdAt)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ mt: 1 }}
                        >
                          {feedback.comment}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < userData.feedbacks.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e2e8f0' }}>
        <Button 
          onClick={onClose}
          variant="contained"
          fullWidth
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserRatingDialog; 