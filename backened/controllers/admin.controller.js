import User from '../models/user.models.js';

// Get all pending users
export const getPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await User.find({ status: 'pending' }).select('-password');
        res.status(200).json(pendingUsers);
    } catch (error) {
        console.error("Error fetching pending users:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Approve a user
export const approveUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.status === 'approved') {
            return res.status(400).json({ error: "User is already approved" });
        }

        user.status = 'approved';
        user.isVerified = true; // Ensure isVerified is true upon approval
        await user.save();

        res.status(200).json({ message: "User approved successfully", user });
    } catch (error) {
        console.error("Error approving user:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Reject a user
export const rejectUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.status === 'rejected') {
            return res.status(400).json({ error: "User is already rejected" });
        }

        user.status = 'rejected';
        // Optionally, you might want to set isVerified to false or handle this based on your flow
        // user.isVerified = false;
        await user.save();

        res.status(200).json({ message: "User rejected successfully", user });
    } catch (error) {
        console.error("Error rejecting user:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};
