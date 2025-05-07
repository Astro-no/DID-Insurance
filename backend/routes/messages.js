const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const { createMessage, getAllMessages, respondToMessage } = require("../controllers/messagesController");
const Message = require("../models/Message");

// Create a new message
router.post("/", verifyToken, createMessage);

// Fetch all messages for the logged-in user
router.get("/", verifyToken, getAllMessages);

// Fetch all messages (Admin only)
router.get("/admin", verifyToken, verifyAdmin, async (req, res) => {
  try {
    console.log("Admin fetching all messages"); // Debugging log
    const messages = await Message.find().sort({ createdAt: -1 }); // Fetch all messages
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching all messages:", error);
    res.status(500).json({ message: "Failed to fetch messages." });
  }
});

// Respond to a specific message
router.post("/:id/respond", verifyToken, respondToMessage);

module.exports = router;