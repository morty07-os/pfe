import Message from '../models/message.models.js';

// Save a new message
export const saveMessage = async (req, res) => {
  try {
    const { carId, receiver, text, conversationId } = req.body;
    const sender = req.user.userId;

    let convoId = conversationId;
    if (!convoId) {
      convoId = `${carId}-${sender}-${receiver}`;
    }

    const newMessage = new Message({
      carId,
      sender,
      receiver,
      conversationId: convoId,
      text
    });

    const savedMessage = await newMessage.save();

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Error saving message:", error.message);
    res.status(500).json({ error: 'Failed to save message.', details: error.message });
  }
};

// Get messages for a car
export const getMessages = async (req, res) => {
  try {
    const { carId } = req.params;
    const { conversationId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const messages = await Message.find({ carId, conversationId })
      .populate('sender', 'firstName lastName')
      .populate('receiver', 'firstName lastName')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error getting messages:", error.message);
    res.status(500).json({ error: 'Failed to get messages.', details: error.message });
  }
};
