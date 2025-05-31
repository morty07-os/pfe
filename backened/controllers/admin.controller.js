import User from '../models/user.models.js';

// Get all users with status 'pending'
export const getPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await User.find({ status: 'pending' }).select('-password -verificationToken -verificationTokenExpires -resetPasswordToken -resetPasswordExpire -refreshToken');
        res.status(200).json(pendingUsers);
    } catch (error) {
        console.error("Error in getPendingUsers controller:", error.message);
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
        await user.save();

        // Optionally send an email to the user informing them of approval
        // await sendEmail(user.email, 'Account Approved', 'Your account has been approved by the administrator.');

        res.status(200).json({ message: "User approved successfully", user });
    } catch (error) {
        console.error("Error in approveUser controller:", error.message);
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
        await user.save();

        // Optionally send an email to the user informing them of rejection
        // await sendEmail(user.email, 'Account Rejected', 'Your account has been rejected by the administrator.');

        res.status(200).json({ message: "User rejected successfully", user });
    } catch (error) {
        console.error("Error in rejectUser controller:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};
