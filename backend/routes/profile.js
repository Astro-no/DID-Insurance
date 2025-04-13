const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Update path if needed
const verifyToken = require("../middleware/verifyToken"); // Replace authMiddleware with verifyToken

// GET profile info
router.get("/", verifyToken, async (req, res) => {
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
