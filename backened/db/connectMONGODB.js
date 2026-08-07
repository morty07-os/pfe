import mongoose from "mongoose";
import Car from "../models/car.models.js";

// Function to connect to MongoDB
const connectMongoDB = async () => {
    try {
        // Connect to the database using the URI from environment variables
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB connected: ${conn.connection.host}`); // Log successful connection

        // Create 2dsphere index for location-based queries
        try {
            await Car.collection.createIndex({ location: '2dsphere' });
            console.log('2dsphere index created for Car location field');
        } catch (indexError) {
            if (indexError.codeName === 'IndexOptionsConflict') {
                console.log('2dsphere index already exists');
            } else {
                console.error('Error creating 2dsphere index:', indexError);
            }
        }
    } catch (error) {
        console.error(`Cannot connect to MongoDB: ${error.message}`); // Log connection error
        process.exit(1); // Exit the process on failure
    }
};

export default connectMongoDB;