import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: function(participants) {
        return participants.length === 2;
      },
      message: 'A conversation must have exactly 2 participants.'
    }
  }],
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    lastRead: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Ensure there's only one conversation between two users for a specific car
conversationSchema.index({ participants: 1, car: 1 }, { unique: true });

// Add a method to get the other participant
conversationSchema.methods.getOtherParticipant = function(userId) {
  return this.participants.find(participant => !participant.equals(userId));
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
