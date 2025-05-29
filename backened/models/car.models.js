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
            required: true, // Ensure description is required
            maxlength: 500, // Limit the description length
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
        carType: {
            type: String,
            enum: ["SUV", "VAN", "STATIONWAGON", "CITADINE", "SEDAN"],
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
                    return images.length >= 1 && images.length <= 5 && images.every((img) => img.startsWith('https://res.cloudinary.com/'));
                },
                message: 'You must upload between 1 and 5 images, and all image paths must start with "https://res.cloudinary.com/".',
            },
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        ownerName: {
            firstName: {
                type: String,
                required: true
            },
            lastName: {
                type: String,
                required: true
            }
        }
    },
    { timestamps: true }
);

// Add indexes for frequently queried fields
carSchema.index({ wilaya: 1 });
carSchema.index({ price: 1 });
carSchema.index({ carType: 1 });
carSchema.index({ isDeleted: 1 });

const Car = mongoose.model("Car", carSchema);
export default Car;
