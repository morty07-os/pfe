import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

const PendingApprovalPage = () => {
    const navigate = useNavigate();

    const handleGoToLogin = () => {
        navigate('/login'); // Assuming '/login' is your login route
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8, p: 3, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper', textAlign: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <HourglassEmptyIcon sx={{ fontSize: 60, color: '#475569' }} />
                <Typography variant="h5" component="h1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    Account Awaiting Approval
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Thank you for verifying your email. Your account is currently in a pending state and requires administrator approval before you can access all features.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    We will notify you via email once your account has been reviewed.
                </Typography>
                <Button
                    variant="contained"
                    sx={{
                        mt: 3,
                        bgcolor: '#475569',
                        color: 'white',
                        py: 1.5,
                        fontSize: '1rem',
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#334155' },
                    }}
                    onClick={handleGoToLogin}
                >
                    Go to Login Page
                </Button>
            </Box>
        </Container>
    );
};

export default PendingApprovalPage;
