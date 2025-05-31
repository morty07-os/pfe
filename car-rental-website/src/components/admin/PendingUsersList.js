import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PendingUsersList = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPendingUsers = async () => {
            try {
                const response = await axios.get('/api/admin/users/pending'); // Assuming your backend is on the same origin or you have a proxy
                setPendingUsers(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPendingUsers();
    }, []);

    const handleVerifyUser = async (userId) => {
        try {
            await axios.put(`/api/admin/users/${userId}/verify`);
            setPendingUsers(pendingUsers.filter(user => user._id !== userId));
        } catch (err) {
            console.error("Error verifying user:", err);
            // Handle error (e.g., show a message to the admin)
        }
    };

    const handleRejectUser = async (userId) => {
        try {
            await axios.put(`/api/admin/users/${userId}/reject`);
            setPendingUsers(pendingUsers.filter(user => user._id !== userId));
        } catch (err) {
            console.error("Error rejecting user:", err);
            // Handle error
        }
    };

    if (loading) return <div>Loading pending users...</div>;
    if (error) return <div>Error loading pending users: {error.message}</div>;

    return (
        <div>
            <h2>Pending Users</h2>
            {pendingUsers.length === 0 ? (
                <p>No pending users.</p>
            ) : (
                <ul>
                    {pendingUsers.map(user => (
                        <li key={user._id}>
                            {user.firstName} {user.lastName} ({user.email})
                            <button onClick={() => handleVerifyUser(user._id)}>Verify</button>
                            <button onClick={() => handleRejectUser(user._id)}>Reject</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PendingUsersList;
