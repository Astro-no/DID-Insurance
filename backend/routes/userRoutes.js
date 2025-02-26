const express = require('express');
const User = require('../models/User'); // Import the FIXED User model
const bcrypt = require('bcryptjs');

const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { firstName, secondName, email, idNumber, password, did, role, status } = req.body;

    // Ensure role and status have default values if not provided
    const userRole = role || "pending";
    const userStatus = status || "pending";

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user instance
    const newUser = new User({ 
      firstName, 
      secondName, 
      email, 
      idNumber, 
      password: hashedPassword, 
      did, 
      role: userRole, 
      status: userStatus 
    });

    // Save user to database
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: error.message });
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
