import Booking from '../models/booking.models.js';
import Car from '../models/car.models.js';
import User from '../models/user.models.js'; // To get owner details
import Message from '../models/message.models.js'; // Import Message model
import mongoose from 'mongoose';

// Helper function to check for overlapping bookings
const checkOverlappingBookings = async (carId, startDate, endDate, excludeBookingId = null) => {
    const query = {
        car: carId,
        status: { $in: ['pending', 'confirmed'] }, // Check against active bookings
        $or: [
            { startDate: { $lt: endDate }, endDate: { $gt: startDate } }, // Overlaps
        ],
    };
    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }
    return Booking.find(query);
};

// 1. Create a new booking request (initiates chat and saves initial booking info)
export const createBookingRequest = async (req, res, next) => {
    try {
        const { carId, startDate, endDate, mileage } = req.body; // Removed totalCost from body
        const renterId = req.user.userId;

        if (!carId || !startDate || !endDate || !mileage) {
            return res.status(400).json({ message: 'Car ID, start date, end date, and mileage are required.' });
        }

        const car = await Car.findById(carId).populate('owner', 'id');
        if (!car) {
            return res.status(404).json({ message: 'Car not found.' });
        }

        if (car.owner.id.toString() === renterId) {
            return res.status(400).json({ message: 'You cannot book your own car.' });
        }

        const sDate = new Date(startDate);
        const eDate = new Date(endDate);
        if (sDate >= eDate) {
            return res.status(400).json({ message: 'End date must be after start date.' });
        }
        if (sDate < new Date(car.availabilityStart) || eDate > new Date(car.availabilityEnd)) {
            return res.status(400).json({ message: "Selected dates are outside the car's availability range." });
        }

        const overlapping = await checkOverlappingBookings(carId, sDate, eDate);
        if (overlapping.length > 0) {
            return res.status(409).json({ message: 'Car is not available for the selected dates (already booked).' });
        }

        // Securely calculate totalCost on the backend
        const diffTime = eDate.getTime() - sDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
        
        let mileageMultiplier = 1;
        if (mileage === 200) mileageMultiplier = 1.5;
        else if (mileage === 300) mileageMultiplier = 2.0;
        else if (mileage === 400) mileageMultiplier = 2.5;
        else if (mileage === 500) mileageMultiplier = 3.0;

        const calculatedTotalCost = diffDays * car.price * mileageMultiplier;

        const newBooking = new Booking({
            car: carId,
            renter: renterId,
            owner: car.owner.id,
            startDate: sDate,
            endDate: eDate,
            mileage,
            totalCost: calculatedTotalCost, // Use backend-calculated cost
            status: 'pending',
        });

        await newBooking.save();
        
        // Populate necessary fields for the response
        const populatedBooking = await Booking.findById(newBooking._id)
            .populate('car', 'carName brand images price owner')
            .populate('renter', 'firstName lastName avatar')
            .populate('owner', 'firstName lastName avatar');

        res.status(201).json({ message: 'Booking request created successfully. Please proceed to chat.', booking: populatedBooking });

    } catch (error) {
        console.error("Error in createBookingRequest:", error);
        next(error);
    }
};

// 2. Get details of a specific booking
export const getBookingDetails = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID format.' });
        }

        const booking = await Booking.findById(bookingId)
            .populate('car', 'carName brand year images price energy transmission seats doors wilaya address owner')
            .populate('renter', 'firstName lastName avatar email phone')
            .populate('owner', 'firstName lastName avatar email phone');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        // Ensure the user is either the renter or the owner of the car associated with the booking
        if (booking.renter._id.toString() !== userId && booking.owner._id.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to view this booking.' });
        }
        
        res.status(200).json(booking);
    } catch (error) {
        console.error("Error in getBookingDetails:", error);
        next(error);
    }
};

// 3. Update booking status (e.g., confirm, cancel)
export const updateBookingStatus = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const { status, paymentId } = req.body; // paymentId is optional
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID format.' });
        }

        const validStatuses = ['confirmed', 'cancelled_by_renter', 'cancelled_by_owner', 'completed', 'payment_failed'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid or missing status.' });
        }

        const booking = await Booking.findById(bookingId).populate('owner').populate('renter');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        // Authorization: Only owner or renter can update status, with specific rules
        const isOwner = booking.owner._id.toString() === userId;
        const isRenter = booking.renter._id.toString() === userId;

        if (!isOwner && !isRenter) {
            return res.status(403).json({ message: 'You are not authorized to update this booking.' });
        }

        if (status === 'confirmed') {
            // Typically, confirmation happens after payment or agreement in chat.
            // For now, let's assume only owner can mark as confirmed after agreement (or system after payment)
            if (!isOwner && booking.status !== 'pending') { // Allow renter to confirm if it's still pending (e.g. after owner agrees)
                 // Or if a system role confirms after payment
            }
             // Check for overlaps again if confirming, in case availability changed
            const overlapping = await checkOverlappingBookings(booking.car, booking.startDate, booking.endDate, booking._id);
            if (overlapping.length > 0) {
                return res.status(409).json({ message: 'Cannot confirm booking. Car is no longer available for these dates.' });
            }
            booking.paymentId = paymentId || booking.paymentId; // Update paymentId if provided

            // --- Send system message from admin to renter and owner ---
            try {
                const adminUser = await User.findOne({ role: 'admin' });
                if (adminUser) {
                    const carId = booking.car;
                    const renterId = booking.renter._id ? booking.renter._id : booking.renter;
                    const ownerId = booking.owner._id ? booking.owner._id : booking.owner;
                    const conversationIdRenter = `${carId}-${[adminUser._id, renterId].sort().join('-')}`;
                    const conversationIdOwner = `${carId}-${[adminUser._id, ownerId].sort().join('-')}`;
                    const confirmationText = `Your booking has been confirmed! Thank you for using our service. If you have any questions, please contact support.`;
                    // Message to renter
                    await new Message({
                        carId,
                        sender: adminUser._id,
                        receiver: renterId,
                        conversationId: conversationIdRenter,
                        text: confirmationText,
                        isSystemMessage: true
                    }).save().catch(() => {});
                    // Message to owner
                    await new Message({
                        carId,
                        sender: adminUser._id,
                        receiver: ownerId,
                        conversationId: conversationIdOwner,
                        text: confirmationText,
                        isSystemMessage: true
                    }).save().catch(() => {});
                }
            } catch (msgErr) {
                // Log but do not block booking confirmation
                console.error('Failed to send system message after booking confirmation:', msgErr);
            }
        } else if (status === 'cancelled_by_renter' && !isRenter) {
            return res.status(403).json({ message: 'Only the renter can cancel with this status.' });
        } else if (status === 'cancelled_by_owner' && !isOwner) {
            return res.status(403).json({ message: 'Only the owner can cancel with this status.' });
        }
        // Add more logic for 'completed', 'payment_failed' as needed

        booking.status = status;
        await booking.save();
        
        const populatedBooking = await Booking.findById(booking._id)
            .populate('car', 'carName brand images price owner')
            .populate('renter', 'firstName lastName avatar')
            .populate('owner', 'firstName lastName avatar');

        res.status(200).json({ message: `Booking status updated to ${status}.`, booking: populatedBooking });
    } catch (error) {
        console.error("Error in updateBookingStatus:", error);
        next(error);
    }
};

// 4. Get car availability (check against existing bookings)
export const getCarAvailability = async (req, res, next) => {
    try {
        const { carId } = req.params;
        const { startDate, endDate } = req.query; // Dates to check for

        if (!mongoose.Types.ObjectId.isValid(carId)) {
            return res.status(400).json({ message: 'Invalid car ID format.' });
        }
        
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ message: 'Car not found.' });
        }

        let query = {
            car: carId,
            status: { $in: ['pending', 'confirmed'] }, // Consider pending and confirmed bookings as unavailable slots
        };

        // If specific dates are provided for checking a range
        if (startDate && endDate) {
            const sDate = new Date(startDate);
            const eDate = new Date(endDate);
            if (sDate >= eDate) {
                return res.status(400).json({ message: 'End date must be after start date.' });
            }
            query.$or = [
                { startDate: { $lt: eDate }, endDate: { $gt: sDate } },
            ];
        }
        
        const bookings = await Booking.find(query).select('startDate endDate status');
        
        // Also return the car's general availability window
        const carGeneralAvailability = {
            availabilityStart: car.availabilityStart,
            availabilityEnd: car.availabilityEnd,
        };

        res.status(200).json({ 
            carGeneralAvailability,
            bookedPeriods: bookings 
        });

    } catch (error) {
        console.error("Error in getCarAvailability:", error);
        next(error);
    }
};

// 5. Add a message to the booking's chat
export const addChatMessage = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const { message } = req.body;
        const senderId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID format.' });
        }
        if (!message || typeof message !== 'string' || message.trim() === '') {
            return res.status(400).json({ message: 'Message content is required and must be a non-empty string.' });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        // Ensure the sender is part of the booking (renter or owner)
        if (booking.renter.toString() !== senderId && booking.owner.toString() !== senderId) {
            return res.status(403).json({ message: 'You are not authorized to send messages for this booking.' });
        }

        const chatMessage = {
            sender: senderId,
            message: message.trim(),
            timestamp: new Date(),
        };

        booking.chatHistory.push(chatMessage);
        await booking.save();
        
        // Populate sender info for the new message before sending back
        const newMessagePopulated = booking.chatHistory[booking.chatHistory.length -1];
        await Booking.populate(newMessagePopulated, {path: "sender", select: "firstName lastName avatar"});


        // TODO: Emit message via Socket.IO to other participant if implementing real-time
        // req.io.to(bookingId).emit('newMessage', newMessagePopulated);


        res.status(201).json({ message: 'Message added successfully.', chatMessage: newMessagePopulated });
    } catch (error) {
        console.error("Error in addChatMessage:", error);
        next(error);
    }
};


// 6. Get all bookings for the logged-in renter
export const getUserBookings = async (req, res, next) => {
    try {
        const renterId = req.user.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const bookings = await Booking.find({ renter: renterId })
            .populate('car', 'carName brand year images price wilaya address')
            .populate('owner', 'firstName lastName avatar')
            .sort({ createdAt: -1 }) // Sort by most recent
            .skip(skip)
            .limit(limit);

        const totalBookings = await Booking.countDocuments({ renter: renterId });

        res.status(200).json({
            bookings,
            totalBookings,
            page,
            totalPages: Math.ceil(totalBookings / limit)
        });
    } catch (error) {
        console.error("Error in getUserBookings:", error);
        next(error);
    }
};

// 7. Get all bookings for cars owned by the logged-in user
export const getOwnerBookings = async (req, res, next) => {
    try {
        const ownerId = req.user.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const bookings = await Booking.find({ owner: ownerId })
            .populate('car', 'carName brand year images price wilaya address')
            .populate('renter', 'firstName lastName avatar email')
            .sort({ createdAt: -1 }) // Sort by most recent
            .skip(skip)
            .limit(limit);

        const totalBookings = await Booking.countDocuments({ owner: ownerId });

        res.status(200).json({
            bookings,
            totalBookings,
            page,
            totalPages: Math.ceil(totalBookings / limit)
        });
    } catch (error) {
        console.error("Error in getOwnerBookings:", error);
        next(error);
    }
};
