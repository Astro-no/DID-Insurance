const mongoose = require('mongoose'); //  You must import mongoose

const claimSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userDID: { type: String, required: true }, // Ensure this field is required
  policy: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
  claimAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Claim', claimSchema); //  Correct export
