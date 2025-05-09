import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
  },
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  totalCost: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled_by_renter', 'cancelled_by_owner', 'completed', 'payment_failed'],
    default: 'pending', // Initial status when chat is initiated
  },
  paymentId: { // Link to a payment record if applicable
    type: String, 
    // ref: 'Payment' // If you have a Payment model
  },
  chatHistory: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      message: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  // Timestamps for booking creation and updates
}, { timestamps: true });

// Index to efficiently query bookings by car and dates
bookingSchema.index({ car: 1, startDate: 1, endDate: 1 });
// Index for querying bookings by renter or owner
bookingSchema.index({ renter: 1 });
bookingSchema.index({ owner: 1 });


const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
