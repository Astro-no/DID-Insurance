const jwt = require("jsonwebtoken");
const User = require("../models/User");
const dotenv = require("dotenv");

dotenv.config();

const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access Denied: No Token Provided" });

    const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = verified;

    // Check if user exists and is an admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access Denied: Admins Only" });
    }

    next(); // ✅ Proceed if admin
  } catch (error) {
    res.status(401).json({ message: "Invalid Token", error });
  }
};

module.exports = verifyAdmin;
