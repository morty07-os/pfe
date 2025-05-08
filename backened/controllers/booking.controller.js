import Booking from '../models/booking.models.js';
import Car from '../models/car.models.js';
import User from '../models/user.models.js'; // Assuming user model exists
import mongoose from 'mongoose';

// Helper function to check for overlapping bookings
async function isCarAvailable(carId, startDate, endDate, excludeBookingId = null) {
  const existingBookingsQuery = {
    car: carId,
    status: { $in: ['pending', 'confirmed'] }, // Only consider active bookings
    $or: [
      { startDate: { $lt: endDate }, endDate: { $gt: startDate } }, // Overlaps
    ],
  };
  if (excludeBookingId) {
    existingBookingsQuery._id = { $ne: excludeBookingId };
  }
  const overlappingBooking = await Booking.findOne(existingBookingsQuery);
  return !overlappingBooking;
}

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.body;
    const userId = req.user.id; // Assuming req.user is populated by auth middleware

    if (!mongoose.Types.ObjectId.isValid(carId)) {
        return res.status(400).json({ message: 'Invalid Car ID format.' });
    }

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found.' });
    }
    if (car.isDeleted) {
        return res.status(400).json({ message: 'Cannot book a deleted car.' });
    }

    const ownerId = car.owner;

    // Validate dates
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    if (sDate >= eDate) {
      return res.status(400).json({ message: 'End date must be after start date.' });
    }
    if (sDate < new Date(new Date().setHours(0,0,0,0))) { // Today
        return res.status(400).json({ message: 'Start date cannot be in the past.' });
    }
    // Check against car's general availability
    if (sDate < new Date(car.availabilityStart) || eDate > new Date(car.availabilityEnd)) {
        return res.status(400).json({ message: 'Booking dates are outside the car\'s general availability period.' });
    }


    // Check car availability for the specific dates
    const available = await isCarAvailable(carId, sDate, eDate);
    if (!available) {
      return res.status(400).json({ message: 'Car is not available for the selected dates.' });
    }

    // Calculate total price (example: price per day)
    const durationInMilliseconds = eDate - sDate;
    const durationInDays = Math.ceil(durationInMilliseconds / (1000 * 60 * 60 * 24));
    const totalPrice = durationInDays * car.price;

    const newBooking = new Booking({
      car: carId,
      user: userId,
      owner: ownerId,
      startDate: sDate,
      endDate: eDate,
      totalPrice,
      // status defaults to 'pending'
    });

    await newBooking.save();
    
    // Populate car and user details for the response
    const populatedBooking = await Booking.findById(newBooking._id)
        .populate('car', 'carName brand images price')
        .populate('user', 'firstName lastName email')
        .populate('owner', 'firstName lastName email');

    res.status(201).json({ message: 'Booking created successfully. Awaiting confirmation.', booking: populatedBooking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Failed to create booking.', error: error.message });
  }
};

// Confirm a booking (Admin action)
export const confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    // TODO: Add role check to ensure only admin can confirm
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ message: 'Unauthorized to confirm bookings.' });
    // }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(400).json({ message: 'Invalid Booking ID format.' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: `Booking is already ${booking.status}.` });
    }

    // Check car availability again before confirming, in case of race conditions
    const available = await isCarAvailable(booking.car, booking.startDate, booking.endDate, booking._id);
    if (!available) {
      // Potentially set to cancelled or handle differently
      booking.status = 'cancelled'; 
      await booking.save();
      return res.status(409).json({ message: 'Car became unavailable. Booking cancelled.' });
    }

    booking.status = 'confirmed';
    await booking.save();
    
    const populatedBooking = await Booking.findById(booking._id)
        .populate('car', 'carName brand images price')
        .populate('user', 'firstName lastName email')
        .populate('owner', 'firstName lastName email');

    res.status(200).json({ message: 'Booking confirmed.', booking: populatedBooking });
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({ message: 'Failed to confirm booking.', error: error.message });
  }
};

// Cancel a booking (User or Owner action)
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id; // Assuming req.user is populated

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(400).json({ message: 'Invalid Booking ID format.' });
    }

    const booking = await Booking.findById(bookingId).populate('car', 'owner');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Check if the user is the booker or the car owner
    const isBooker = booking.user.toString() === userId;
    const isOwner = booking.car.owner.toString() === userId;

    if (!isBooker && !isOwner) {
      return res.status(403).json({ message: 'Unauthorized to cancel this booking.' });
    }

    // Cancellation policy
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: `Cannot cancel a booking with status: ${booking.status}.` });
    }

    const now = new Date();
    if (now >= new Date(booking.startDate) && booking.status === 'confirmed' && isBooker) {
      // If user is cancelling a confirmed booking on or after start date
      return res.status(400).json({ message: 'Cannot cancel a confirmed booking on or after the start date.' });
    }
     // Owner can cancel anytime if pending or confirmed (e.g. car issue)
     // User can cancel before start date if pending or confirmed

    booking.status = 'cancelled';
    await booking.save();
    
    // Note: No direct modification to car.bookedDates as it's not in the Car model.
    // Availability is checked by querying Booking collection.

    const populatedBooking = await Booking.findById(booking._id)
        .populate('car', 'carName brand images price')
        .populate('user', 'firstName lastName email')
        .populate('owner', 'firstName lastName email');

    res.status(200).json({ message: 'Booking cancelled successfully.', booking: populatedBooking });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Failed to cancel booking.', error: error.message });
  }
};

// Get a single booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(400).json({ message: 'Invalid Booking ID format.' });
    }
    const booking = await Booking.findById(bookingId)
      .populate('car', 'carName brand images price wilaya ownerName')
      .populate('user', 'firstName lastName email')
      .populate('owner', 'firstName lastName email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    // Add authorization check if needed (e.g., only booker, owner, or admin can view)
    res.status(200).json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Failed to fetch booking.', error: error.message });
  }
};

// Get all bookings for the authenticated user (as booker)
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ user: userId })
      .populate('car', 'carName brand images price wilaya ownerName')
      .populate('owner', 'firstName lastName email') // Populate car owner details
      .sort({ startDate: -1 }); // Sort by most recent start date
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Failed to fetch user bookings.', error: error.message });
  }
};

// Get all bookings for cars owned by the authenticated user
export const getOwnerBookings = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const bookings = await Booking.find({ owner: ownerId })
      .populate('car', 'carName brand images price wilaya')
      .populate('user', 'firstName lastName email') // Populate booker details
      .sort({ startDate: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    res.status(500).json({ message: 'Failed to fetch owner bookings.', error: error.message });
  }
};

// TODO: Implement a cron job or scheduled task for automatically updating bookings to 'completed'
// This typically runs on the server periodically.
// Example (conceptual - actual implementation depends on server setup):
// const cron = require('node-cron');
// cron.schedule('0 0 * * *', async () => { // Runs daily at midnight
//   console.log('Running daily check for completed bookings...');
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   try {
//     const result = await Booking.updateMany(
//       { status: 'confirmed', endDate: { $lt: today } },
//       { $set: { status: 'completed' } }
//     );
//     console.log(`Updated ${result.nModified} bookings to completed.`);
//   } catch (error) {
//     console.error('Error auto-completing bookings:', error);
//   }
// });
