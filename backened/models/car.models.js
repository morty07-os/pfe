import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
    {
        carName: {
            type: String,
            required: true,
        },
        brand: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        energy: {
            type: String,
            enum: ["Essence", "Diesel", "Hybrid", "Electric"],
            required: true,
        },
        seats: {
            type: Number,
            required: true,
        },
        doors: {
            type: Number,
            required: true,
        },
        transmission: {
            type: String,
            enum: ["Manual", "Automatic"],
            required: true,
        },
        mileage: {
            type: Number,
            required: true,
        },
        engine: {
            type: String,
            required: true,
        },
        wilaya: {
            type: String,
            required: true,
        },
        availabilityStart: {
            type: Date,
            required: true,
        },
        availabilityEnd: {
            type: Date,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        images: {
            type: [String], // Array of image paths
            required: true,
            validate: {
                validator: function (images) {
                    return images.every((img) => img.startsWith('uploads/'));
                },
                message: 'All image paths must start with "uploads/".',
            },
        },
    },
    { timestamps: true }
);

const Car = mongoose.model("Car", carSchema);
export default Car;
