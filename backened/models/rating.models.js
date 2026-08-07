import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
    raterId: { // The user giving the rating
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    carId: { // The car being rated (optional, if rating a user)
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car",
        required: false,
    },
    ratedUserId: { // The user being rated (optional, if rating a car)
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    review: {
        type: String,
    },
}, { timestamps: true });

// Add indexes for frequently queried fields
ratingSchema.index({ carId: 1 });
ratingSchema.index({ ratedUserId: 1 });

const Rating = mongoose.model("Rating", ratingSchema);
export default Rating;
