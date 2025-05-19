import Message from '../models/message.models.js';
import mongoose from 'mongoose';

// Save a new message
export const saveMessage = async (req, res) => {
  try {
    const { carId, receiver, text, conversationId } = req.body;
    const sender = req.user.userId;

    let convoId = conversationId;
    if (!convoId) {
      const userIds = [sender, receiver].sort();
      convoId = `${carId ? carId + '-' : ''}${userIds[0]}-${userIds[1]}`;
    }

    const newMessage = new Message({
      sender: new mongoose.Types.ObjectId(sender),
      receiver: new mongoose.Types.ObjectId(receiver),
      conversationId: convoId,
      text
    });

    if (carId && mongoose.Types.ObjectId.isValid(carId)) {
      newMessage.carId = new mongoose.Types.ObjectId(carId);
    } else if (carId) {
      console.error("Invalid carId:", carId);
      return res.status(400).json({ error: 'Invalid carId provided.' });
    }

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

    // Validate carId
    if (!mongoose.Types.ObjectId.isValid(carId)) {
      return res.status(400).json({ error: 'Invalid carId.', details: 'carId must be a valid ObjectId.' });
    }

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

// Get all conversations for the current user
export const getConversations = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: "$conversationId",
          latestMessage: { $first: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "cars",
          localField: "latestMessage.carId",
          foreignField: "_id",
          as: "car"
        }
      },
      {
        $unwind: "$car"
      },
      {
        $lookup: {
          from: "users",
          let: { sender: "$latestMessage.sender", receiver: "$latestMessage.receiver" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$_id", userId] },
                    { $or: [{ $eq: ["$_id", "$$sender"] }, { $eq: ["$_id", "$$receiver"] }] }
                  ]
                }
              }
            }
          ],
          as: "otherUser"
        }
      },
      {
        $unwind: "$otherUser"
      },
      {
        $project: {
          conversationId: "$_id",
          car: {
            _id: "$car._id",
            carName: "$car.carName"
          },
          otherUser: {
            _id: "$otherUser._id",
            firstName: "$otherUser.firstName",
            lastName: "$otherUser.lastName"
          },
          latestMessage: {
            text: "$latestMessage.text",
            createdAt: "$latestMessage.createdAt"
          }
        }
      }
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error getting conversations:", error.message);
    res.status(500).json({ error: 'Failed to get conversations.', details: error.message });
  }
};

// Get messages for a specific user
export const getMessagesForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId.', details: 'userId must be a valid ObjectId.' });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'firstName lastName')
    .populate('receiver', 'firstName lastName')
    .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error getting messages for user:", error.message);
    res.status(500).json({ error: 'Failed to get messages for user.', details: error.message });
  }
};
