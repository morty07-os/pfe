import mongoose from 'mongoose';
const { Schema } = mongoose; // Destructure Schema

const bookingSchema = new Schema({
  car: {
    type: Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
  },
  user: { // The user who is booking the car
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  owner: { // The owner of the car
    type: Schema.Types.ObjectId,
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
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
    required: true,
  },
  // Optional: Add payment details or reference if needed
  // paymentId: { type: String },
  // paymentStatus: { type: String, enum: ['pending', 'succeeded', 'failed'], default: 'pending' },
}, { timestamps: true });

// Index to improve query performance for user's bookings or car's bookings
bookingSchema.index({ user: 1, startDate: -1 });
bookingSchema.index({ car: 1, startDate: -1 });
bookingSchema.index({ owner: 1, startDate: -1 });


// Pre-save hook to ensure endDate is after startDate (optional validation)
bookingSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date.'));
  } else {
    next();
  }
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
