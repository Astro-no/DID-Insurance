const express = require('express');
const User = require('../models/User'); // Import User model

const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
  const { 
    firstName,
    secondName,
    email,
    idNumber,
    password,
    did,
    role,
    status
  } = req.body;

  try {
    // Ensure role and status have default values if not provided
    const userRole = role || "pending";
    const userStatus = status || "pending";

    // Create new user instance
    const user = new User({ firstName, secondName, email, idNumber, password, did, role: userRole, status: userStatus });

    // Save user to database
    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(400).json({ error: error.message });
  }
});

// Get all users (for testing)
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

module.exports = router;
