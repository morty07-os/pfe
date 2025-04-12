import Booking from '../models/booking.models.js';
import Car from '../models/car.models.js';

// Function to create a new booking
export const createBooking = async (req, res) => {
    try {
        // Extract booking details from the request body
        const { userId, carId, startDate, endDate } = req.body;

        // Validate required fields
        if (!userId || !carId || !startDate || !endDate) {
            return res.status(400).send("Missing required fields: userId, carId, startDate, endDate");
        }

        // Check if the car exists
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).send("Car not found");
        }

        // Check if the car is available for the selected dates
        const isAvailable = car.bookedDates.every(
            (date) =>
                new Date(endDate) < new Date(date.startDate) ||
                new Date(startDate) > new Date(date.endDate)
        );

        if (!isAvailable) {
            return res.status(400).send("Car is not available for the selected dates");
        }

        // Create and save the new booking
        const newBooking = new Booking({ userId, carId, startDate, endDate });
        await newBooking.save();

        // Update the car's booked dates
        car.bookedDates.push({ startDate, endDate });
        await car.save();

        // Respond with the created booking
        res.status(201).json(newBooking);
    } catch (error) {
        console.error("Error creating booking:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Function to fetch all bookings
export const getBookings = async (req, res) => {
    try {
        // Retrieve all bookings from the database
        const bookings = await Booking.find();
        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Function to update an existing booking
export const updateBooking = async (req, res) => {
    try {
        // Extract booking ID from request parameters
        const { id } = req.params;
        const { userId, carId, startDate, endDate } = req.body;

        // Update the booking with the provided data
        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            { userId, carId, startDate, endDate },
            { new: true } // Return the updated document
        );

        if (!updatedBooking) {
            return res.status(404).send("Booking not found");
        }

        res.status(200).json(updatedBooking);
    } catch (error) {
        console.error("Error updating booking:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Function to delete a booking
export const deleteBooking = async (req, res) => {
    try {
        // Extract booking ID from request parameters
        const { id } = req.params;

        // Delete the booking from the database
        const deletedBooking = await Booking.findByIdAndDelete(id);

        if (!deletedBooking) {
            return res.status(404).send("Booking not found");
        }

        res.status(200).send("Booking deleted successfully");
    } catch (error) {
        console.error("Error deleting booking:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};
