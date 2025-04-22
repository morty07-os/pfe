import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            unique: true,
            default: () => new mongoose.Types.ObjectId().toString(),
        },
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
                    return images.length >= 1 && images.length <= 5 && images.every((img) => img.startsWith('uploads/'));
                },
                message: 'You must upload between 1 and 5 images, and all image paths must start with "uploads/".',
            },
        },
    },
    { timestamps: true }
);

const Car = mongoose.model("Car", carSchema);
export default Car;
