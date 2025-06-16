import User from '../models/user.models.js';
import Receipt from '../models/receipt.model.js';
import sendEmail from '../utils/email.utils.js';
import { uploadImageToCloudinary } from '../utils/cloudinary.js';
import fs from 'fs';

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

export const sendReceipt = async (req, res) => {
    try {
        const { carId, userId, ownerId, carName, conversationId } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'Receipt image is required.' });
        }

        const imagePath = req.file.path;
        const uploadResult = await uploadImageToCloudinary(imagePath);

        if (!uploadResult || !uploadResult.secure_url) {
            return res.status(500).json({ error: 'Failed to upload receipt image to Cloudinary.' });
        }

        const newReceipt = new Receipt({
            carId,
            userId,
            ownerId,
            conversationId,
            carName,
            receiptImageUrl: uploadResult.secure_url,
            status: 'pending', // Default status
        });

        await newReceipt.save();

        res.status(200).json({ success: true, message: 'Receipt sent to admin successfully!', receipt: newReceipt });

    } catch (error) {
        console.error('Error sending receipt:', error);
        res.status(500).json({ error: 'Failed to send receipt.', details: error.message });
    }
};

export const getPendingReceipts = async (req, res) => {
  try {
    const pendingReceipts = await Receipt.find({ status: 'pending' })
      .populate('carId', 'carName brand model year')
      .populate('userId', 'firstName lastName email')
      .populate('ownerId', 'firstName lastName email')
      .sort('-sentAt');

    res.status(200).json({ receipts: pendingReceipts });
  } catch (error) {
    console.error('Error fetching pending receipts:', error);
    res.status(500).json({ error: 'Failed to fetch pending receipts.', details: error.message });
  }
};

export const approveReceipt = async (req, res) => {
  try {
    const { receiptId } = req.params;
    const receipt = await Receipt.findByIdAndUpdate(receiptId, { status: 'approved' }, { new: true });

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    // Optionally send an email notification to the user who sent the receipt

    res.status(200).json({ message: 'Receipt approved', receipt });
  } catch (error) {
    console.error('Error approving receipt:', error);
    res.status(500).json({ message: 'Failed to approve receipt' });
  }
};

export const rejectReceipt = async (req, res) => {
  try {
    const { receiptId } = req.params;
    const { reason } = req.body;

    const receipt = await Receipt.findByIdAndUpdate(receiptId, { status: 'rejected', rejectionReason: reason }, { new: true });

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    // Optionally send an email notification to the user who sent the receipt with the rejection reason

    res.status(200).json({ message: 'Receipt rejected', receipt });
  } catch (error) {
    console.error('Error rejecting receipt:', error);
    res.status(500).json({ message: 'Failed to reject receipt' });
  }
};
