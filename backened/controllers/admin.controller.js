import User from '../models/user.models.js';
import sendEmail from '../utils/email.utils.js';

export const getPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await User.find({ 
            isVerified: true, // User has verified their email
            status: { $in: [null, 'pending'] } // Include both new users (null status) and pending users
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
                approvedAt: new Date() 
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

        res.status(200).json({ message: "User approved successfully", user });
    } catch (error) {
        res.status(500).json({ error: "Error approving user" });
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
