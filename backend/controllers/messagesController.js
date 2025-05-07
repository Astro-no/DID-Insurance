const Message = require("../models/Message");

// Create a new message
const createMessage = async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Message content is required" });
  }

  try {
    console.log("req.user:", req.user); // Debugging: Log req.user
    const newMessage = new Message({
      senderName: req.user.name || "Anonymous", // Fallback to "Anonymous" if name is missing
      senderEmail: req.user.email || "policyholder@app.com", // Fallback to a default email
      content,
    });

    await newMessage.save();
    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Fetch all messages
const getAllMessages = async (req, res) => {
  try {
    console.log("req.user:", req.user); // Debugging: Log req.user

    // Check if the user is an admin
    if (req.user.role === "admin") {
      // Fetch all messages for admins
      const messages = await Message.find().sort({ createdAt: -1 });
      return res.status(200).json(messages);
    }

    // Fetch messages for the logged-in user
    const messages = await Message.find({ senderEmail: req.user.email }).sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages." });
  }
};

// Respond to a specific message
const respondToMessage = async (req, res) => {
  const { id } = req.params;
  const { response } = req.body;

  if (!response) {
    return res.status(400).json({ message: "Response text is required" });
  }

  try {
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    message.response = response;
    message.respondedAt = new Date();
    await message.save();

    res.status(200).json({ message: "Response sent successfully" });
  } catch (error) {
    console.error("Error responding to message:", error);
    res.status(500).json({ message: "Failed to send response" });
  }
};

module.exports = {
  createMessage,
  getAllMessages,
  respondToMessage,
};