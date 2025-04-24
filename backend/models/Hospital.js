const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true
  },
  did: { 
    type: String, 
    required: true, 
    unique: true 
  },
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true // hashed password
  }
});

module.exports = mongoose.model('Hospital', hospitalSchema);
