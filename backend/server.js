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
const reportsRoutes = require('./routes/reports'); // Import the reports routes
const VC = require("./models/VC");
dotenv.config({ path: './backend/.env' });
console.log("MONGO_URI from .env:", process.env.MONGO_URI);
const procedureRoutes = require('./routes/procedureRoutes');
const vcRoutes = require("./routes/vcRoutes"); // Import the vcRoutes router
const app = express();
const claimRoutes = require("./routes/claimRoutes");
const policyRegistrationRoutes = require("./routes/policyRegistrationsRoutes");
const messagesRoutes = require("./routes/messages"); // Import messages routes
//const claimRoutes = require("./routes/claims");
app.use(express.json());

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
app.use(cors({ origin: 'http://localhost:3000' })); // Replace with your frontend's URL

// Routes
app.use('/api/users', userRoutes);
app.use("/api/auth", authRoutes); // Register auth routes
app.use('/api/admin', adminRoutes);
app.use('/api/policies', policyRoutes); // Register policy routes
app.use("/api/profile", profileRoutes);
app.use('/api/verifyToken', verifyToken); // Protect routes with verifyToken middleware
app.use('/hospital', hospitalAuthRoutes);
app.use('/api/reports', reportsRoutes);
app.use("/api/claims", claimRoutes);  // Only one import is needed for reportsRoutes
app.use("/api/messages", messagesRoutes); // Register messages routes
app.post("/api/send-vc", (req, res) => {
  const { vc, policyholderAddress } = req.body;
  console.log("Received VC:", vc);
  console.log("For policyholder:", policyholderAddress);

  // Simulate saving or processing
  return res.status(200).json({ message: "VC sent to policyholder successfully" });
});
app.get("/api/vcs/:policyholderAddress", async (req, res) => {
  try {
    const policyholderAddress = req.params.policyholderAddress;

    // Find VC for the policyholder
    const vcs = await VC.find({ policyholderAddress });

    if (vcs.length === 0) {
      return res.status(404).json({ message: "No VCs found for this policyholder" });
    }

    return res.status(200).json({ vcs });
  } catch (error) {
    console.error("Error retrieving VCs:", error);
    return res.status(500).json({ error: "Error retrieving VCs" });
  }
});
app.get("/api/vcs/:identifier", async (req, res) => {
  try {
    const identifier = req.params.identifier;

    // Check if the identifier is a DID or a policyholderAddress
    const vcs = await VC.find({
      $or: [
        { "credentialSubject.id": identifier }, // Match DID
        { policyholderAddress: identifier },   // Match policyholderAddress
      ],
    });

    if (vcs.length === 0) {
      return res.status(404).json({ message: "No VCs found for this identifier" });
    }

    return res.status(200).json({ vcs });
  } catch (error) {
    console.error("Error retrieving VCs:", error);
    return res.status(500).json({ error: "Error retrieving VCs" });
  }
});
app.use('/api/procedures', procedureRoutes);
app.use('/api/procedures', vcRoutes);
// app.use("/api/vcs", vcRoutes); // Use the vcRoutes for the /api/vcs endpoint
app.use("/api/policyregistrations", policyRegistrationRoutes);
app.use("/api/claims", claimRoutes);
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
