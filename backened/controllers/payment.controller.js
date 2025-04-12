import Payment from "../models/payment.models.js";

// Function to process a payment
export const processPayment = async (req, res) => {
    try {
        // Extract payment details from the request body
        const { userId, bookingId, amount } = req.body;

        // Validate required fields
        if (!userId || !bookingId || !amount) {
            return res.status(400).send("Missing required fields: userId, bookingId, amount");
        }

        // Create and save the payment record
        const newPayment = new Payment({ userId, bookingId, amount, status: "completed" });
        await newPayment.save();

        res.status(201).json(newPayment);
    } catch (error) {
        console.error("Error processing payment:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};
