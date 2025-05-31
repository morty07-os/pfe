import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Button, List, ListItem, ListItemText, Divider, CircularProgress } from '@mui/material';

const AdminWelcomePage = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        // Rely on the browser sending the HTTP-only cookie
        const response = await fetch(`${apiUrl}/api/auth/admin/pending-users`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch pending users');
        }

        const data = await response.json();
        setPendingUsers(data);
      } catch (err) {
        console.error("Error fetching pending users:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingUsers();
  }, [apiUrl]);

  const handleApprove = async (userId) => {
    try {
      // Rely on the browser sending the HTTP-only cookie
      const response = await fetch(`${apiUrl}/api/auth/admin/users/${userId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve user');
      }

      // Remove approved user from the list
      setPendingUsers(pendingUsers.filter(user => user._id !== userId));
    } catch (err) {
      console.error("Error approving user:", err);
      setError(err.message);
    }
  };

  const handleRefuse = async (userId) => {
    try {
      // Rely on the browser sending the HTTP-only cookie
      const response = await fetch(`${apiUrl}/api/auth/admin/users/${userId}/refuse`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to refuse user');
      }

      // Remove refused user from the list
      setPendingUsers(pendingUsers.filter(user => user._id !== userId));
    } catch (err) {
      console.error("Error refusing user:", err);
      setError(err.message);
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

      <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
        <Typography variant="h6" component="h2" gutterBottom sx={{ textAlign: 'center' }}>
          Approve New Users
        </Typography>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
            Error: {error}
          </Typography>
        )}
        {!loading && !error && (
          <List>
            {pendingUsers.length === 0 ? (
              <Typography variant="body2" sx={{ textAlign: 'center', color: '#666' }}>
                No users pending approval.
              </Typography>
            ) : (
              pendingUsers.map((user, index) => (
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
                          onClick={() => handleRefuse(user._id)}
                        >
                          Refuse
                        </Button>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={`${user.firstName} ${user.lastName} (${user.email})`}
                      secondary={`Phone: ${user.phone}, Residence: ${user.residence}`}
                    />
                  </ListItem>
                  {index < pendingUsers.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))
            )}
          </List>
        )}
      </Box>
    </Container>
  );
};

export default AdminWelcomePage;
