import React from 'react';
import PendingUsersList from '../components/admin/PendingUsersList';
import PendingCarsList from '../components/admin/PendingCarsList';
import PendingBookingsList from '../components/admin/PendingBookingsList';

const AdminDashboardPage = () => {
    return (
        <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome to the admin dashboard. Here you can manage users, cars, and bookings.</p>
            <PendingUsersList />
            <PendingCarsList />
            <PendingBookingsList />
        </div>
    );
};

export default AdminDashboardPage;
