const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded); // Debugging: Log the decoded token
    req.user = decoded; // Attach the decoded user information to the request
    next();
  } catch (error) {
    console.error("Invalid token:", error);
    res.status(403).json({ message: "Invalid token." });
  }
};

module.exports = verifyToken;
