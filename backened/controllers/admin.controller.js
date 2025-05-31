import User from '../models/user.models.js';
import sendEmail from '../utils/email.utils.js'; // Assuming email utility exists

// Get all users with status 'pending'
export const getPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await User.find({ status: 'pending' }).select('-password -verificationToken -resetPasswordToken -refreshToken');
        res.status(200).json(pendingUsers);
    } catch (error) {
        console.error("Error fetching pending users:", error.message);
        res.status(500).json({ error: "Server error fetching pending users" });
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

        // Send approval email notification (placeholder)
        try {
            await sendEmail(user.email, 'Account Approved', `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #475569;">Your Account Has Been Approved!</h2>
                    <p>Good news! Your account on the Car Rental Website has been approved by our administrators.</p>
                    <p>You can now log in and start using all the features.</p>
                    <p>Thank you for your patience.</p>
                    <p>Best regards,<br>The Car Rental Team</p>
                </div>
            `);
            console.log(`Approval email sent to: ${user.email}`);
        } catch (emailError) {
            console.error(`Error sending approval email: ${emailError.message}`);
            // Log the error but don't fail the request
        }

        res.status(200).json({ message: "User approved successfully", user });
    } catch (error) {
        console.error("Error approving user:", error.message);
        res.status(500).json({ error: "Server error approving user" });
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

        // Send rejection email notification (placeholder)
        try {
            await sendEmail(user.email, 'Account Rejected', `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #475569;">Account Update</h2>
                    <p>We regret to inform you that your account on the Car Rental Website could not be approved at this time.</p>
                    <p>Please review your application details or contact support for more information.</p>
                    <p>Best regards,<br>The Car Rental Team</p>
                </div>
            `);
            console.log(`Rejection email sent to: ${user.email}`);
        } catch (emailError) {
            console.error(`Error sending rejection email: ${emailError.message}`);
            // Log the error but don't fail the request
        }

        res.status(200).json({ message: "User rejected successfully", user });
    } catch (error) {
        console.error("Error rejecting user:", error.message);
        res.status(500).json({ error: "Server error rejecting user" });
    }
};
