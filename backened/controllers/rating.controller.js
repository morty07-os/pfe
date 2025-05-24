import Rating from '../models/rating.models.js';
import mongoose from 'mongoose'; // Import mongoose

// Function to create a new rating
export const createRating = async (req, res) => {
    try {
        // Extract rating details from the request body
        const { raterId, carId, ratedUserId, rating, review } = req.body;

        // Validate required fields
        if (!raterId || !rating) {
            return res.status(400).send("Missing required fields: raterId, rating");
        }

       // Ensure either carId or ratedUserId is provided
        if (!carId && !ratedUserId) {
            return res.status(400).json({ message: "Either carId or ratedUserId must be provided" });
        }

        // Create and save the new rating
        const newRating = new Rating({ raterId, carId, ratedUserId, rating, review });
        await newRating.save();

        res.status(201).json(newRating);
    } catch (error) {
        console.error("Error creating rating:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Function to get ratings for a specific car
export const getRatingsByCarId = async (req, res) => {
    try {
        const { carId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(carId)) {
            return res.status(400).json({ message: "Invalid car ID format" });
        }
        const ratings = await Rating.find({ carId }).populate('raterId', 'username email firstName lastName profileImage').populate('carId', 'make model');
        // Return empty array if no ratings found, instead of 404
        res.status(200).json(ratings || []);
    } catch (error) {
        console.error("Error fetching ratings by car ID:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Function to update a rating
export const updateRating = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, review } = req.body;

        const updatedRating = await Rating.findByIdAndUpdate(
            id,
            { rating, review },
            { new: true, runValidators: true }
        );

        if (!updatedRating) {
            return res.status(404).json({ message: "Rating not found" });
        }

        res.status(200).json(updatedRating);
    } catch (error) {
        console.error("Error updating rating:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Function to delete a rating
export const deleteRating = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRating = await Rating.findByIdAndDelete(id);

        if (!deletedRating) {
            return res.status(404).json({ message: "Rating not found" });
        }

        res.status(200).json({ message: "Rating deleted successfully" });
    } catch (error) {
        console.error("Error deleting rating:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Function to get ratings for a specific user (ratedUserId)
export const getRatingsByRatedUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }
        
        // Find ratings where the user is the one being rated
        const ratings = await Rating.find({ 
            ratedUserId: userId 
        })
        .populate('raterId', 'username email firstName lastName profileImage')
        .sort({ createdAt: -1 }); // Sort by newest first
        
        // Filter out any potential null or undefined ratings just in case
        const validRatings = ratings.filter(rating => rating && rating.raterId);
        
        res.status(200).json(validRatings);
    } catch (error) {
        console.error("Error fetching ratings by rated user ID:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Function to calculate average rating for a specific car
export const getAverageRatingByCarId = async (req, res) => {
    try {
        const { carId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(carId)) {
            return res.status(400).json({ message: "Invalid car ID format" });
        }
        const result = await Rating.aggregate([
            { $match: { carId: new mongoose.Types.ObjectId(carId) } },
            {
                $group: {
                    _id: "$carId",
                    averageRating: { $avg: "$rating" },
                    totalRatings: { $sum: 1 }
                }
            }
        ]);

        // Return default values if no ratings found, instead of 404
        if (result.length === 0) {
            return res.status(200).json({ averageRating: 0, totalRatings: 0 });
        }

        res.status(200).json(result[0]);
    } catch (error) {
        console.error("Error calculating average rating:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Function to calculate average rating for a specific user (ratedUserId)
export const getAverageRatingByRatedUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const ratedUserId = userId; // Keep the same variable name for consistency
        if (!mongoose.Types.ObjectId.isValid(ratedUserId)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }
        const result = await Rating.aggregate([
            { $match: { ratedUserId: new mongoose.Types.ObjectId(ratedUserId) } },
            {
                $group: {
                    _id: "$ratedUserId",
                    averageRating: { $avg: "$rating" },
                    totalRatings: { $sum: 1 }
                }
            }
        ]);

        // Return default values if no ratings found, instead of 404
        if (result.length === 0) {
            return res.status(200).json({ averageRating: 0, totalRatings: 0 });
        }

        res.status(200).json(result[0]);
    } catch (error) {
        console.error("Error calculating average rating for rated user:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Function to fetch all ratings (original function, kept for completeness if needed elsewhere)
export const getRatings = async (req, res) => {
    try {
        // Retrieve all ratings and populate car details
        const ratings = await Rating.find()
            .populate('carId', 'make model')
            .populate('raterId', 'username email firstName lastName profileImage')
            .populate('ratedUserId', 'username email firstName lastName profileImage');
        res.status(200).json(ratings);
    } catch (error) {
        console.error("Error fetching ratings:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};
