import mongoose from 'mongoose';

// Define the car schema
const carSchema = new mongoose.Schema({
  // Your schema definition here
  // ...
});

// Check if the model already exists before compiling it
const Car = mongoose.models.Car || mongoose.model('Car', carSchema);

export default Car;
