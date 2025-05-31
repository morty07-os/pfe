import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
} from '@mui/material';

const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';

const AdminWelcomePage = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/api/auth/admin/pending-users`, {
        credentials: 'include', // Include cookies
      });
      if (!response.ok) {
        throw new Error('Failed to fetch pending users');
      }
      const data = await response.json();
      setPendingUsers(data);
    } catch (err) {
      console.error('Error fetching pending users:', err);
      setError('Failed to load pending users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId) => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ status: 'approve' }),
      });
      if (!response.ok) {
        throw new Error('Failed to approve user');
      }
      // Remove approved user from the list
      setPendingUsers(pendingUsers.filter(user => user._id !== userId));
    } catch (err) {
      console.error('Error approving user:', err);
      setError('Failed to approve user.');
    }
  };

  const handleReject = async (userId) => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ status: 'reject' }),
      });
      if (!response.ok) {
        throw new Error('Failed to reject user');
      }
      // Remove rejected user from the list
      setPendingUsers(pendingUsers.filter(user => user._id !== userId));
    } catch (err) {
      console.error('Error rejecting user:', err);
      setError('Failed to reject user.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome Admin!
        </Typography>
        <Typography variant="body1">
          This is the admin dashboard.
        </Typography>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Pending User Approvals
        </Typography>

        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && pendingUsers.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No users currently pending approval.
          </Typography>
        )}

        {!loading && !error && pendingUsers.length > 0 && (
          <List>
            {pendingUsers.map((user) => (
              <React.Fragment key={user._id}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => handleApprove(user._id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleReject(user._id)}
                      >
                        Reject
                      </Button>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={`${user.firstName} ${user.lastName}`}
                    secondary={`Email: ${user.email} | Phone: ${user.phone}`}
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Container>
  );
};

export default AdminWelcomePage;
