const mongoose = require('mongoose');

const PolicyRegistrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  policy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Policy',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  // If using blockchain, you might want to store tx hash
  transactionHash: {
    type: String
  }
});

const PolicyRegistration = mongoose.model('PolicyRegistration', PolicyRegistrationSchema);

module.exports = PolicyRegistration;