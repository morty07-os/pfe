import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PendingCarsList = () => {
    const [pendingCars, setPendingCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPendingCars = async () => {
            try {
                const response = await axios.get('/api/admin/cars/pending'); // Assuming your backend is on the same origin or you have a proxy
                setPendingCars(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPendingCars();
    }, []);

    const handleApproveCar = async (carId) => {
        try {
            await axios.put(`/api/admin/cars/${carId}/approve`);
            setPendingCars(pendingCars.filter(car => car._id !== carId));
        } catch (err) {
            console.error("Error approving car:", err);
            // Handle error
        }
    };

    const handleRejectCar = async (carId) => {
        try {
            await axios.put(`/api/admin/cars/${carId}/reject`);
            setPendingCars(pendingCars.filter(car => car._id !== carId));
        } catch (err) {
            console.error("Error rejecting car:", err);
            // Handle error
        }
    };

    if (loading) return <div>Loading pending cars...</div>;
    if (error) return <div>Error loading pending cars: {error.message}</div>;

    return (
        <div>
            <h2>Pending Cars</h2>
            {pendingCars.length === 0 ? (
                <p>No pending cars.</p>
            ) : (
                <ul>
                    {pendingCars.map(car => (
                        <li key={car._id}>
                            {car.brand} {car.carName} (Owner: {car.owner.firstName} {car.owner.lastName})
                            <button onClick={() => handleApproveCar(car._id)}>Approve</button>
                            <button onClick={() => handleRejectCar(car._id)}>Reject</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PendingCarsList;
