import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Card, CardContent,
  Button, Stack, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, Alert
} from '@mui/material';

const apiUrl = process.env.REACT_APP_API_URL || 'https://pfe-uhbw.onrender.com';

const AdminWelcomePage = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectDialog, setRejectDialog] = useState({ open: false, userId: null });
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/pending-users`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setPendingUsers(data.users);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to fetch pending users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/approve-user/${userId}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        fetchPendingUsers();
      }
    } catch (error) {
      setError('Failed to approve user');
    }
  };

  const handleReject = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/reject-user/${rejectDialog.userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: rejectionReason })
      });
      if (response.ok) {
        setRejectDialog({ open: false, userId: null });
        setRejectionReason('');
        fetchPendingUsers();
      }
    } catch (error) {
      setError('Failed to reject user');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>Pending User Approvals</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <CircularProgress />
      ) : pendingUsers.length === 0 ? (
        <Typography>No pending users to review</Typography>
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
                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                  <img src={user.licenceFront} alt="License Front" style={{ width: 150 }} />
                  <img src={user.licenceBack} alt="License Back" style={{ width: 150 }} />
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
