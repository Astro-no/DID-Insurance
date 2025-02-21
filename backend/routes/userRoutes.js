const express = require('express');
const User = require('../models/User'); // Import User model

const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
  const { username, password, role } = req.body;
  
  try {
    const user = new User({ username, password, role });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all users (for testing)
router.get('/', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

module.exports = router;
// defines the user routes