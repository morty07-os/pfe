import mongoose from "mongoose";

// Function to connect to MongoDB
const connectMongoDB = async () => {
    try {
        // Connect to the database using the URI from environment variables
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB connected: ${conn.connection.host}`); // Log successful connection
    } catch (error) {
        console.error(`Cannot connect to MongoDB: ${error.message}`); // Log connection error
        process.exit(1); // Exit the process on failure
    }
};

export default connectMongoDB;