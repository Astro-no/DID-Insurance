const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyToken = require("../middleware/verifyToken");
const authenticate = require("../middleware/verifyToken");
const Hospital = require("../models/Hospital"); // Assuming your Hospital model is in "../models/Hospital.js"

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name, // Include the user's name
      email: user.email, // Include the user's email
      did: user.did, // Include the DID if needed
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

dotenv.config();  

// ========== USER SIGNUP ==========
router.post("/signup", async (req, res) => {
  const { firstName, secondName, email, idNumber, password, did, role, status } = req.body;

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: "Email already registered" });

    const existingID = await User.findOne({ idNumber });
    if (existingID) return res.status(400).json({ message: "ID Number already registered" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      secondName,
      email,
      idNumber,
      password: hashedPassword,
      did,
      role: role || "pending",
      status: status || "pending",
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// ========== EMAIL/PASSWORD LOGIN ==========
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!["approved", "active"].includes(user.status)) {
      return res.status(403).json({ message: "Account pending approval by admin" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        name: `${user.firstName} ${user.secondName}`, // full name
        email: user.email,
        role: user.role,
        did: user.did,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// ========== DID LOGIN ==========
router.post("/login-did", async (req, res) => {
  const { did } = req.body;

  try {
    const user = await User.findOne({ did });
    if (!user) return res.status(404).json({ message: "DID not found" });

    if (!["approved", "active"].includes(user.status)) {
      return res.status(403).json({ message: "Account pending approval by admin" });
    }

    const token = generateToken(user);

    res.json({
      message: "DID login successful",
      token,
      user: {
        name: `${user.firstName} ${user.secondName}`,
        email: user.email,
        role: user.role,
        did: user.did,
      },
    });
  } catch (error) {
    console.error("DID login error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// ========== ADMIN APPROVE USER ==========
router.put("/approve-user/:id", verifyAdmin, async (req, res) => {
  const { role } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = "approved";
    user.role = role || "user";
    await user.save();

    res.json({ message: "User approved successfully", user });
  } catch (error) {
    console.error("Approve user error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// ========== GET CURRENT LOGGED-IN USER ==========
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      role: user.role, // Send the role along with the user data
      name: `${user.firstName} ${user.secondName}`,
      email: user.email,
      did: user.did,
    });;
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// ========== THE USER PROFILE ==========
router.get("/users/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Send full name
    res.json({
      name: `${user.firstName} ${user.secondName}`,
      email: user.email,
      role: user.role,
      did: user.did,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Update user role to policyholder
router.put("/updateRole", authenticate, async (req, res) => {
  const userId = req.user.id; // comes from the auth middleware
  const { role } = req.body;

  try {
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Role updated successfully", user });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ message: "Error updating role" });
  }
});


module.exports = router;
