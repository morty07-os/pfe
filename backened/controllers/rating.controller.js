import Rating from '../models/rating.models.js';

// Function to create a new rating
export const createRating = async (req, res) => {
    try {
        // Extract rating details from the request body
        const { userId, carId, rating, review } = req.body;

        // Validate required fields
        if (!userId || !carId || !rating) {
            return res.status(400).send("Missing required fields: userId, carId, rating");
        }

        // Create and save the new rating
        const newRating = new Rating({ userId, carId, rating, review });
        await newRating.save();

        res.status(201).json(newRating);
    } catch (error) {
        console.error("Error creating rating:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Function to fetch all ratings
export const getRatings = async (req, res) => {
    try {
        // Retrieve all ratings and populate user and car details
        const ratings = await Rating.find().populate('userId', 'username').populate('carId', 'make model');
        res.status(200).json(ratings);
    } catch (error) {
        console.error("Error fetching ratings:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};
