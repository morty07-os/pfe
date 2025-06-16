import express from "express";

import { ProtectedRoute } from "../midleware/ProtectedRoute.js";
import Receipt from "../models/receipt.model.js";
import Booking from "../models/booking.models.js";

const router = express.Router();



// Route to upload a receipt
router.post("/upload", ProtectedRoute(), async (req, res) => {
  try {
    const { bookingId, receiptImage } = req.body;
    const user = req.user.id;

    if (!receiptImage) {
      return res.status(400).json({ error: "No receipt image URL provided." });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const newReceipt = new Receipt({
      booking: bookingId,
      user,
      owner: booking.owner,
      receiptImage: receiptImage,
    });

    await newReceipt.save();

    res.status(201).json({ message: "Receipt uploaded successfully!", receipt: newReceipt });
  } catch (error) {
    console.error("Error uploading receipt:", error);
    res.status(500).json({ error: "Failed to upload receipt.", details: error.message });
  }
});

// Admin route to get all pending receipts
router.get("/admin/pending", ProtectedRoute(), async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Forbidden" });
    }

    try {
        const receipts = await Receipt.find({ status: 'pending' }).populate('user', 'firstName lastName').populate('owner', 'firstName lastName').populate('booking');
        res.status(200).json(receipts);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch pending receipts" });
    }
});

// Admin route to approve a receipt
router.put("/admin/approve/:id", ProtectedRoute(), async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Forbidden" });
    }

    try {
        const receipt = await Receipt.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
        if (!receipt) {
            return res.status(404).json({ error: "Receipt not found" });
        }
        res.status(200).json(receipt);
    } catch (error) {
        res.status(500).json({ error: "Failed to approve receipt" });
    }
});

// Admin route to reject a receipt
router.put("/admin/reject/:id", ProtectedRoute(), async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Forbidden" });
    }

    try {
        const receipt = await Receipt.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
        if (!receipt) {
            return res.status(404).json({ error: "Receipt not found" });
        }
        res.status(200).json(receipt);
    } catch (error) {
        res.status(500).json({ error: "Failed to reject receipt" });
    }
});

export default router;
