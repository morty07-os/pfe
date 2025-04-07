import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
    {
        make: {
            type: String,
            required: true,
        },
        model: {
            type: String,
            required: true,
        },
        year: {
            type: Number,
            required: true,
        },
        pricePerDay: {
            type: Number,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        availability: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const Car = mongoose.model("Car", carSchema);
export default Car;
