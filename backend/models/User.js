const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'policyholder', 'hospital'],
    //required: true
    default: "policyholder"
  },
  did: {
    type: String,
    unique: true, // Ensures one DID per user
    sparse: true // Allows users without a DID
  },
  accountAddress: {
    type: String,
    unique: true, // Ensures each user has a single blockchain account
    sparse: true
  },
  policy: {
    policyId: {
      type: Number,
      unique: true, // Ensures one policy per user
      sparse: true
    },
    insuranceCompany: String,
    policyAmount: Number,
    premium: Number,
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Claimed'],
      default: 'Inactive'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
