const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  secondName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  idNumber: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  did: { type: String, required: true },
  role: { type: String, default: "pending" },
  status: { type: String, default: "pending" }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
