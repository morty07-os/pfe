import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PendingBookingsList = () => {
    const [pendingBookings, setPendingBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPendingBookings = async () => {
            try {
                const response = await axios.get('/api/admin/bookings/pending'); // Assuming your backend is on the same origin or you have a proxy
                setPendingBookings(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPendingBookings();
    }, []);

    const handleApproveBooking = async (bookingId) => {
        try {
            await axios.put(`/api/admin/bookings/${bookingId}/approve`);
            setPendingBookings(pendingBookings.filter(booking => booking._id !== bookingId));
        } catch (err) {
            console.error("Error approving booking:", err);
            // Handle error
        }
    };

    const handleRejectBooking = async (bookingId) => {
        try {
            await axios.put(`/api/admin/bookings/${bookingId}/reject`);
            setPendingBookings(pendingBookings.filter(booking => booking._id !== bookingId));
        } catch (err) {
            console.error("Error rejecting booking:", err);
            // Handle error
        }
    };

    if (loading) return <div>Loading pending bookings...</div>;
    if (error) return <div>Error loading pending bookings: {error.message}</div>;

    return (
        <div>
            <h2>Pending Bookings</h2>
            {pendingBookings.length === 0 ? (
                <p>No pending bookings.</p>
            ) : (
                <ul>
                    {pendingBookings.map(booking => (
                        <li key={booking._id}>
                            Car: {booking.car.brand} {booking.car.carName}, Renter: {booking.renter.firstName} {booking.renter.lastName}, Owner: {booking.owner.firstName} {booking.owner.lastName}
                            <button onClick={() => handleApproveBooking(booking._id)}>Approve</button>
                            <button onClick={() => handleRejectBooking(booking._id)}>Reject</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PendingBookingsList;
