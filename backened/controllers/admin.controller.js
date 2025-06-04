import User from '../models/user.models.js';
import Car from '../models/car.models.js';
import sendEmail from '../utils/email.utils.js';

export const getPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await User.find({ 
            isVerified: true, // User has verified their email
            status: 'pending' // Only fetch users explicitly marked as pending
        }).select('firstName lastName email phone residence licenceFront licenceBack createdAt status')
        .sort('-createdAt'); // Show newest users first
        
        res.status(200).json({ users: pendingUsers });
    } catch (error) {
        res.status(500).json({ error: "Error fetching pending users" });
    }
};

export const approveUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { 
                status: 'approved',
                approvedAt: new Date(),
                isVerified: true // Ensure user is marked as verified
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Send approval email
        await sendEmail(user.email, 'Account Approved', `
            <div style="font-family: Arial, sans-serif">
                <h2>Your Account Has Been Approved!</h2>
                <p>You can now log in and start using our services.</p>
            </div>
        `);

        res.status(200).json({ 
            message: "User approved successfully", 
            user: {
                _id: user._id,
                status: user.status,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Error approving user" });
    }
};

export const getAllCarsAdmin = async (req, res) => {
    try {
        const cars = await Car.find({}).populate('owner', 'firstName lastName email').sort('-createdAt'); // Populate owner details and sort
        res.status(200).json({ cars });
    } catch (error) {
        console.error('Error fetching all cars for admin:', error);
        res.status(500).json({ message: 'Error fetching all cars', error: error.message });
    }
};

export const rejectUser = async (req, res) => {
    try {
        const { reason } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { 
                status: 'rejected',
                rejectionReason: reason 
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Send rejection email
        await sendEmail(user.email, 'Account Status Update', `
            <div style="font-family: Arial, sans-serif">
                <h2>Account Application Update</h2>
                <p>Unfortunately, your account application has been rejected.</p>
                <p>Reason: ${reason}</p>
                <p>Please address the issues and try signing up again.</p>
            </div>
        `);

        res.status(200).json({ message: "User rejected successfully", user });
    } catch (error) {
        res.status(500).json({ error: "Error rejecting user" });
    }
};

export const updateCarStatusByAdmin = async (req, res) => {
    try {
        const { carId } = req.params;
        const { status } = req.body; // Expected new status: 'pending', 'accepted', 'rejected'

        const car = await Car.findById(carId);

        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        const currentStatus = car.status;
        let allowedTransitions = {};

        // Define allowed transitions based on current status
        if (currentStatus === 'awaiting_posting_approval') {
            allowedTransitions = { 'pending': true, 'rejected': true };
        } else if (currentStatus === 'pending') {
            allowedTransitions = { 'accepted': true, 'rejected': true };
        }
        // Add more transitions here if needed, e.g., from 'accepted' back to 'pending' or 'rejected'

        if (!allowedTransitions[status]) {
            return res.status(400).json({
                message: `Cannot change status from '${currentStatus}' to '${status}'. Allowed transitions: ${Object.keys(allowedTransitions).join(', ')}`
            });
        }

        car.status = status;
        // Optionally, add a field like 'statusUpdatedAt' or 'adminActionAt'
        // car.statusUpdatedAt = new Date();
        // car.adminApprover = req.user.userId; // Assuming admin user ID is in req.user

        const updatedCar = await car.save();

        res.status(200).json({ message: `Car status updated to '${status}' successfully.`, car: updatedCar });

    } catch (error) {
        console.error('Error updating car status by admin:', error);
        res.status(500).json({ message: 'Error updating car status', error: error.message });
    }
};
