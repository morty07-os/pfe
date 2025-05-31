import User from '../models/user.models.js';
import Car from '../models/car.models.js';
import Booking from '../models/booking.models.js';

// @desc    Get all pending users
// @route   GET /api/admin/users/pending
// @access  Admin
const getPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await User.find({ isVerified: false, role: 'user' }).select('-password');
        res.status(200).json(pendingUsers);
    } catch (error) {
        console.error("Error fetching pending users:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Verify a user
// @route   PUT /api/admin/users/:id/verify
// @access  Admin
const verifyUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.isVerified = true;
            await user.save();
            res.status(200).json({ message: 'User verified successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Error verifying user:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reject a user
// @route   PUT /api/admin/users/:id/reject
// @access  Admin
const rejectUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (user) {
            res.status(200).json({ message: 'User rejected and removed successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Error rejecting user:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all pending cars
// @route   GET /api/admin/cars/pending
// @access  Admin
const getPendingCars = async (req, res) => {
    try {
        const pendingCars = await Car.find({ status: 'pending' }).populate('owner', 'firstName lastName');
        res.status(200).json(pendingCars);
    } catch (error) {
        console.error("Error fetching pending cars:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Approve a car
// @route   PUT /api/admin/cars/:id/approve
// @access  Admin
const approveCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);

        if (car) {
            car.status = 'approved';
            await car.save();
            res.status(200).json({ message: 'Car approved successfully' });
        } else {
            res.status(404).json({ message: 'Car not found' });
        }
    } catch (error) {
        console.error("Error approving car:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reject a car
// @route   PUT /api/admin/cars/:id/reject
// @access  Admin
const rejectCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);

        if (car) {
            car.status = 'rejected';
            await car.save();
            res.status(200).json({ message: 'Car rejected successfully' });
        } else {
            res.status(404).json({ message: 'Car not found' });
        }
    } catch (error) {
        console.error("Error rejecting car:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all pending bookings
// @route   GET /api/admin/bookings/pending
// @access  Admin
const getPendingBookings = async (req, res) => {
    try {
        const pendingBookings = await Booking.find({ status: 'pending' })
            .populate('car', 'carName brand')
            .populate('renter', 'firstName lastName')
            .populate('owner', 'firstName lastName');
        res.status(200).json(pendingBookings);
    } catch (error) {
        console.error("Error fetching pending bookings:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Approve a booking
// @route   PUT /api/admin/bookings/:id/approve
// @access  Admin
const approveBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (booking) {
            booking.status = 'confirmed';
            await booking.save();
            res.status(200).json({ message: 'Booking approved successfully' });
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        console.error("Error approving booking:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reject a booking
// @route   PUT /api/admin/bookings/:id/reject
// @access  Admin
const rejectBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (booking) {
            booking.status = 'cancelled_by_owner';
            await booking.save();
            res.status(200).json({ message: 'Booking rejected successfully' });
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        console.error("Error rejecting booking:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export {
    getPendingUsers,
    verifyUser,
    rejectUser,
    getPendingCars,
    approveCar,
    rejectCar,
    getPendingBookings,
    approveBooking,
    rejectBooking
};
