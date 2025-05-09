const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken'); // Middleware to verify JWT token


const router = express.Router();

// Signup Route with Default Admin Logic
router.post('/signup', async (req, res) => {
  try {
    const { firstName, secondName, email, idNumber, password, did, role, status } = req.body;

    // Check if an admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });

    // Determine user role: First user is admin, others are pending
    const userRole = existingAdmin ? role || 'pending' : 'admin';
    const userStatus = existingAdmin ? status || 'pending' : 'active';

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      firstName,
      secondName,
      email,
      idNumber,
      password: hashedPassword,
      did,
      role: userRole,
      status: userStatus,
    });

    // Save user to database
    await newUser.save();

    res.status(201).json({ message: `User registered successfully as ${userRole}` });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, did, password } = req.body;

    // Find user by email or DID
    const user = await User.findOne({ $or: [{ email }, { did }] });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Return success response
    res.status(200).json({ message: "Login successful", user });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/profile", verifyToken, async (req, res) => {
  console.log("Token verified, user ID:", req.user.id); // Check if user ID is valid

  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    console.log("Fetched user data:", user); // Debugging log

    const fullName = `${user.firstName || ''} ${user.secondName || ''}`.trim();

    res.json({
      firstName: user.firstName,
      secondName: user.secondName,
      name: fullName,
      email: user.email,
      role: user.role,
      did: user.did,
    });
  } catch (error) {
    console.error("Profile fetch error:", error); // Debugging log
    res.status(500).json({ message: "Server error", error });
  }
});


module.exports = router;
