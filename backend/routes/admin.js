const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");


dotenv.config();

const router = express.Router();

// Middleware to verify admin role
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await User.findById(decoded.id);

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// 🟢 Get admin details
router.get("/me", authenticateAdmin, async (req, res) => {
  //add a debug log line
  console.log("Admin", req.admin);
  try {
    res.json({ id: req.admin._id, role: req.admin.role, email: req.admin.email });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// 🟢 Get all users
router.get("/users", authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
