const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const dotenv = require("dotenv");

dotenv.config();

// ✅ User Signup
router.post("/api/auth/signup", async (req, res) => {
  const { firstName, secondName, email, idNumber, password, did, role, status } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    const existingID = await User.findOne({ idNumber });
    if (existingID) return res.status(400).json({ message: "ID Number already registered" });

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
      did, // Store the DID
      role: role || "pending",
      status: status || "pending"
    });

    // Save to database
    await newUser.save();
    
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ✅ Email & Password Login
router.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // ✅ Allow both "approved" and "active" users
      if (user.status !== "approved" && user.status !== "active") {
          return res.status(403).json({ message: "Account pending approval by admin" });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid password" });
  
      const token = jwt.sign({ id: user._id, did: user.did }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      res.json({ token, user });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
});

// ✅ DID-Based Login
router.post("/api/auth/login-did", async (req, res) => {
    const { did } = req.body;
  
    try {
      const user = await User.findOne({ did });
      if (!user) return res.status(404).json({ message: "DID not found" });
  
      // ✅ Allow both "approved" and "active" users
      if (user.status !== "approved" && user.status !== "active") {
          return res.status(403).json({ message: "Account pending approval by admin" });
      }
  
      const token = jwt.sign({ id: user._id, did: user.did }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      res.json({ token, user });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;
