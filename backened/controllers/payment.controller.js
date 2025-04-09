import Payment from "../models/payment.models.js";

export const processPayment = async (req, res) => {
    try {
        const { userId, bookingId, amount } = req.body;
        if (!userId || !bookingId || !amount) {
            return res.status(400).send("Missing required fields: userId, bookingId, amount");
        }

        const newPayment = new Payment({ userId, bookingId, amount, status: "completed" });
        await newPayment.save();

        res.status(201).json(newPayment);
    } catch (error) {
        console.error("Error processing payment:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};
