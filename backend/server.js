const axios = require("axios");
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const mongoose = require("mongoose");
const userRoutes = require('./routes/userRoutes'); // Import user routes
const adminRoutes = require("./routes/admin");
const policyRoutes = require("./routes/policyRoutes"); // Import policy routes
const authRoutes = require("./routes/auth"); // Ensure this file exists
const verifyToken = require('./middleware/verifyToken'); // Import verifyToken middleware
const verifyAdmin = require('./middleware/verifyAdmin'); // Import verifyAdmin middleware
const profileRoutes = require("./routes/profile"); // Adjust path if needed
const hospitalAuthRoutes = require('./routes/hospitalAuth');

dotenv.config({ path: './backend/.env' });
console.log("MONGO_URI from .env:", process.env.MONGO_URI);

const app = express();

const connectDB = async () => {
  try {
    console.log("🔍 Mongo URI:", process.env.MONGO_URI);
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

// Middleware
app.use(express.json()); // Parse JSON
app.use(cors()); // Enable CORS

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use("/api/auth", authRoutes); // Register auth routes
app.use('/api/admin', adminRoutes);
app.use('/api/policies', policyRoutes); // Register policy routes
app.use("/api/profile", profileRoutes);
app.use('/api/verifyToken', verifyToken); // Protect routes with verifyToken middleware
app.use('/hospital', hospitalAuthRoutes);
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
