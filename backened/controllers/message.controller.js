import Message from '../models/message.models.js';
import Conversation from '../models/conversation.models.js';
import { validationResult } from 'express-validator';

export const getOrCreateConversation = async (req, res) => {
  try {
    const { participant1, participant2, carId } = req.body;
    
    console.log('Creating/fetching conversation with:', { participant1, participant2, carId });

    // Validate input
    if (!participant1 || !participant2 || !carId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [participant1, participant2] },
      car: carId
    })
    .populate('participants', 'firstName lastName avatar')
    .populate('car', 'title images');

    // If not, create a new one
    if (!conversation) {
      console.log('Creating new conversation');
      conversation = new Conversation({
        participants: [participant1, participant2],
        car: carId,
        lastMessage: null
      });
      await conversation.save();
      
      // Populate the participants and car after saving
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'firstName lastName avatar')
        .populate('car', 'title images');
    }

    console.log('Returning conversation:', conversation);
    res.status(200).json(conversation);
  } catch (error) {
    console.error('Error in getOrCreateConversation:', error);
    res.status(500).json({ message: 'Failed to get or create conversation' });
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    console.log('Fetching messages for conversation:', conversationId);

    if (!conversationId) {
      return res.status(400).json({ message: 'Conversation ID is required' });
    }

    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 }) // Sort by oldest first for proper display
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('sender', 'firstName lastName avatar')
      .lean();

    console.log(`Found ${messages.length} messages`);

    // Mark messages as read if current user is not the sender
    if (req.user && req.user._id) {
      await Message.updateMany(
        { 
          conversationId, 
          sender: { $ne: req.user._id },
          read: false 
        },
        { $set: { read: true } }
      );
    }

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    res.status(500).json({ 
      message: 'Failed to get messages',
      error: error.message 
    });
  }
};

export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'firstName lastName avatar')
    .populate('car', 'title images')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    console.error('Error getting user conversations:', error);
    res.status(500).json({ message: 'Failed to get conversations' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    await Message.findByIdAndUpdate(messageId, { read: true });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Failed to mark message as read' });
  }
};
