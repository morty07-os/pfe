import Booking from '../models/booking.models.js';
import Car from '../models/car.models.js';

export const createBooking = async (req, res) => {
    try {
        const { userId, carId, startDate, endDate } = req.body;
        if (!userId || !carId || !startDate || !endDate) {
            return res.status(400).send("Missing required fields: userId, carId, startDate, endDate");
        }

        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).send("Car not found");
        }

        const isAvailable = car.bookedDates.every(
            (date) =>
                new Date(endDate) < new Date(date.startDate) ||
                new Date(startDate) > new Date(date.endDate)
        );

        if (!isAvailable) {
            return res.status(400).send("Car is not available for the selected dates");
        }

        const newBooking = new Booking({ userId, carId, startDate, endDate });
        await newBooking.save();

        car.bookedDates.push({ startDate, endDate });
        await car.save();

        res.status(201).json(newBooking);
    } catch (error) {
        console.error("Error creating booking:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

export const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

export const updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, carId, startDate, endDate } = req.body;
        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            { userId, carId, startDate, endDate },
            { new: true }
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

export const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
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
