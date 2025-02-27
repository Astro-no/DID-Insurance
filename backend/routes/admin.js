const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const verifyAdmin = require("../middleware/verifyAdmin"); // ✅ Import middleware
const verifyToken = require("../middleware/verifyToken"); // ✅ Create if missing

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
router.get("http://localhost:5000/me", authenticateAdmin, async (req, res) => {
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

router.get("http://localhost:5000/users", verifyAdmin, async (req, res) => {
  try {
    console.log("🔹 Admin request received! Fetching users...");
    const users = await User.find();
    console.log("🔹 Users found:", users); // ✅ Debug log
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
