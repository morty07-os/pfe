import User from '../models/user.models.js';
import sendEmail from '../utils/email.utils.js'; // Import sendEmail utility

// Get all users with status 'pending'
export const getPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await User.find({ status: 'pending' }).select('-password -verificationToken -resetPasswordToken -refreshToken');
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

        // Send an email to the user informing them of approval
        try {
            await sendEmail(user.email, 'Account Approved', `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #475569;">Account Approved</h2>
                    <p>Good news! Your account on the Car Rental Website has been approved by the administrator.</p>
                    <p>You can now log in to your account and start using all the features.</p>
                    <p>Click here to log in: [Link to your login page]</p>
                    <p>Best regards,<br>The Car Rental Team</p>
                </div>
            `);
            console.log(`Approval email sent to: ${user.email}`);
        } catch (emailError) {
            console.error(`Error sending approval email to ${user.email}:`, emailError);
            // Log the error but don't fail the approval process
        }

        res.status(200).json({ message: "User approved successfully", userId: user._id });
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
        // await sendEmail(user.email, 'Account Rejected', 'Your account has been rejected...');

        res.status(200).json({ message: "User rejected successfully", userId: user._id });
    } catch (error) {
        console.error("Error in rejectUser controller:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};
