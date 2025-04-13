const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  secondName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return v.endsWith("@gmail.com");
      },
      message: props => `${props.value} is not a valid @gmail.com email!`,
    },
  },
  idNumber: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^\d{8}$/.test(v);
      },
      message: props => `${props.value} is not a valid 8-digit ID number!`,
    },
  },  
  password: { type: String, required: true },
  did: { type: String, required: true, unique: true },
  role: { type: String, default: "pending" },
  status: { type: String, default: "pending" }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
