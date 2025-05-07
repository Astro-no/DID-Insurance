const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderName: { type: String, required: true },
    senderEmail: { type: String, required: true },
    content: { type: String, required: true },
    response: { type: String }, // Admin's reply
    respondedAt: { type: Date }, // Timestamp for the reply
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);