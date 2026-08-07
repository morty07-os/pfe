import mongoose from 'mongoose';

const receiptSchema = new mongoose.Schema({
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  conversationId: {
    type: String,
    required: true,
  },
  carName: {
    type: String,
    required: true,
  },
  receiptImageUrl: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

const Receipt = mongoose.model('Receipt', receiptSchema);

export default Receipt; 