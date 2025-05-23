import Feedback from '../models/feedback.models.js';

// Function to create a new feedback
export const createFeedback = async (req, res) => {
    try {
        const { userId, subject, message } = req.body;

        if (!userId || !subject || !message) {
            return res.status(400).send("Missing required fields: userId, subject, message");
        }

        const newFeedback = new Feedback({ userId, subject, message });
        await newFeedback.save();

        res.status(201).json(newFeedback);
    } catch (error) {
        console.error("Error creating feedback:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Function to get all feedbacks
export const getFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find().populate('userId', 'username email');
        res.status(200).json(feedbacks);
    } catch (error) {
        console.error("Error fetching feedbacks:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Function to get a single feedback by ID
export const getFeedbackById = async (req, res) => {
    try {
        const { id } = req.params;
        const feedback = await Feedback.findById(id).populate('userId', 'username email');

        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found" });
        }

        res.status(200).json(feedback);
    } catch (error) {
        console.error("Error fetching feedback by ID:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Function to update a feedback
export const updateFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { subject, message } = req.body;

        const updatedFeedback = await Feedback.findByIdAndUpdate(
            id,
            { subject, message },
            { new: true, runValidators: true }
        );

        if (!updatedFeedback) {
            return res.status(404).json({ message: "Feedback not found" });
        }

        res.status(200).json(updatedFeedback);
    } catch (error) {
        console.error("Error updating feedback:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};

// Function to delete a feedback
export const deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedFeedback = await Feedback.findByIdAndDelete(id);

        if (!deletedFeedback) {
            return res.status(404).json({ message: "Feedback not found" });
        }

        res.status(200).json({ message: "Feedback deleted successfully" });
    } catch (error) {
        console.error("Error deleting feedback:", error.message);
        res.status(500).json({ error: "Server error" });
    }
};
