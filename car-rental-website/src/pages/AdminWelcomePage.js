import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardMedia,
  Grid
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';

const AdminWelcomePage = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const fetchPendingUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/api/admin/pending-users`, {
        headers: {
          // Assuming admin authentication uses a token stored in localStorage or cookies
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}` // Replace with actual token retrieval
        }
      });
      if (!response.ok) {
        throw new Error(`Error fetching pending users: ${response.statusText}`);
      }
      const data = await response.json();
      setPendingUsers(data);
    } catch (err) {
      console.error("Error fetching pending users:", err);
      setError("Failed to fetch pending users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleOpenDialog = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedUser(null);
    setOpenDialog(false);
  };

  const handleApprove = async (userId) => {
    console.log("Approving user:", userId);
    try {
      const response = await fetch(`${apiUrl}/api/admin/approve-user/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}` // Replace with actual token retrieval
        }
      });
      if (!response.ok) {
        throw new Error(`Error approving user: ${response.statusText}`);
      }
      console.log(`User ${userId} approved successfully.`);
      fetchPendingUsers(); // Refresh the list
    } catch (err) {
      console.error("Error approving user:", err);
      setError("Failed to approve user."); // Consider more user-friendly error display
    } finally {
      handleCloseDialog(); // Close dialog after action
    }
  };

  const handleReject = async (userId) => {
    console.log("Rejecting user:", userId);
    try {
      const response = await fetch(`${apiUrl}/api/admin/reject-user/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}` // Replace with actual token retrieval
        }
      });
      if (!response.ok) {
        throw new Error(`Error rejecting user: ${response.statusText}`);
      }
      console.log(`User ${userId} rejected successfully.`);
      fetchPendingUsers(); // Refresh the list
    } catch (err) {
      console.error("Error rejecting user:", err);
      setError("Failed to reject user."); // Consider more user-friendly error display
    } finally {
      handleCloseDialog(); // Close dialog after action
    }
  };


  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1">
          Manage pending user accounts.
        </Typography>
      </Box>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && pendingUsers.length === 0 && (
        <Typography variant="body1" align="center">
          No pending users found.
        </Typography>
      )}

      {!loading && !error && pendingUsers.length > 0 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Pending Users
          </Typography>
          <List>
            {pendingUsers.map((user) => (
              <ListItem key={user._id} divider>
                <ListItemText
                  primary={`${user.firstName} ${user.lastName}`}
                  secondary={`Email: ${user.email}, Phone: ${user.phone}`}
                />
                <ListItemSecondaryAction>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => handleOpenDialog(user)}
                    sx={{ mr: 1 }}
                  >
                    View Details
                  </Button>
                  <IconButton edge="end" aria-label="approve" onClick={() => handleApprove(user._id)}>
                    <CheckCircleIcon color="success" />
                  </IconButton>
                  <IconButton edge="end" aria-label="reject" onClick={() => handleReject(user._id)}>
                    <CancelIcon color="error" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* User Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Box>
              <Typography variant="h6" gutterBottom>{`${selectedUser.firstName} ${selectedUser.lastName}`}</Typography>
              <Typography variant="body1"><strong>Email:</strong> {selectedUser.email}</Typography>
              <Typography variant="body1"><strong>Phone:</strong> {selectedUser.phone}</Typography>
              <Typography variant="body1"><strong>Residence:</strong> {selectedUser.residence}</Typography>
              <Typography variant="body1" sx={{ mt: 2 }}><strong>Driving Licence:</strong></Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Card>
                    <CardMedia
                      component="img"
                      image={selectedUser.licenceFront}
                      alt="Licence Front"
                      sx={{ maxHeight: 200, objectFit: 'contain' }}
                    />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Front
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                   <Card>
                    <CardMedia
                      component="img"
                      image={selectedUser.licenceBack}
                      alt="Licence Back"
                       sx={{ maxHeight: 200, objectFit: 'contain' }}
                    />
                     <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Back
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          {selectedUser && (
            <>
              <Button onClick={() => handleApprove(selectedUser._id)} color="success">Approve</Button>
              <Button onClick={() => handleReject(selectedUser._id)} color="error">Reject</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminWelcomePage;
