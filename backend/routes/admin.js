const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { ethers } = require("ethers");
const User = require("../models/User");
const Hospital = require("../models/Hospital");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyToken = require("../middleware/verifyToken");
const DIDRegisterABI = require("../abis/DIDregister.json");
//console.log(DIDRegisterABI);
const Claim = require('../models/Claim');
const Policy = require('../models/Policy'); // Ensure this file exists
dotenv.config({ path: './backend/.env' });

const router = express.Router();

// Blockchain setup
//const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
//const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
//const contract = new ethers.Contract(
  //process.env.DID_CONTRACT_ADDRESS,
  //DIDRegisterABI,
  //wallet
//);

// 🏥 Predefined hospitals
const coveredHospitals = [
  "Agha Khan",
  "Nairobi Hospital",
  "Kenyatta Hospital",
  "MP Shah Hospital",
];

// Helper to generate a hospital DID
function generateDID(name) {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  return `did:hospital:${slug}-${Date.now()}`;
}

// 🔐 Authenticate admin from token
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

// ✅ Admin info
router.get("/me", authenticateAdmin, async (req, res) => {
  try {
    res.json({ id: req.admin._id, role: req.admin.role, email: req.admin.email });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get all users
router.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// ✅ Get user by DID
router.get("/users/did/:did", authenticateAdmin, async (req, res) => {
  try {
    const user = await User.findOne({ did: req.params.did });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Register hospitals and issue DIDs
router.post("/register-hospitals", verifyToken, verifyAdmin, async (req, res) => {
  const results = [];

  for (const name of coveredHospitals) {
    const existing = await Hospital.findOne({ name });
    if (existing) {
      results.push({ name, status: "already exists" });
      continue;
    }

    const newDID = generateDID(name);

    try {
      const tx = await contract.registerHospitalDID(wallet.address, newDID);
      await tx.wait();

      const saved = new Hospital({ name, did: newDID });
      await saved.save();

      results.push({ name, did: newDID, status: "registered" });
    } catch (err) {
      console.error(`❌ Error registering ${name}:`, err);
      results.push({ name, error: err.message });
    }
  }

  res.status(200).json({ results });
});

// Generate weekly report
const PDFDocument = require('pdfkit');


router.get('/weekly/pdf', verifyAdmin, async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Fetch user statistics
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({ createdAt: { $gte: oneWeekAgo } });
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: oneWeekAgo } });

    // Fetch policy statistics
    const totalPolicies = await Policy.countDocuments();
    const newPolicies = await Policy.countDocuments({ createdAt: { $gte: oneWeekAgo } });
    const avgPolicyPrice = await Policy.aggregate([
      { $group: { _id: null, avgPrice: { $avg: '$policyPrice' } } },
    ]);

    // Fetch revenue statistics
    const totalRevenue = await Policy.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$policyPrice' } } },
    ]);
    const periodRevenue = await Policy.aggregate([
      { $match: { createdAt: { $gte: oneWeekAgo } } },
      { $group: { _id: null, periodRevenue: { $sum: '$policyPrice' } } },
    ]);

    // Generate PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="weekly-report-${new Date().toISOString().split('T')[0]}.pdf"`);

    doc.fontSize(20).text('Weekly Report', { align: 'center' });
    doc.fontSize(14).text(`Date: ${new Date().toISOString().split('T')[0]}`);
    doc.moveDown();

    // Add User Statistics
    doc.fontSize(16).text('User Statistics');
    doc.fontSize(12).text(`Total Users: ${totalUsers}`);
    doc.text(`New Users: ${newUsers}`);
    doc.text(`Active Users: ${activeUsers}`);
    doc.moveDown();

    // Add Policy Statistics
    doc.fontSize(16).text('Policy Statistics');
    doc.fontSize(12).text(`Total Policies: ${totalPolicies}`);
    doc.text(`New Policies: ${newPolicies}`);
    doc.text(`Average Policy Price: $${avgPolicyPrice[0]?.avgPrice.toFixed(2) || '0.00'}`);
    doc.moveDown();

    // Add Revenue Statistics
    doc.fontSize(16).text('Revenue Statistics');
    doc.fontSize(12).text(`Total Revenue: $${totalRevenue[0]?.totalRevenue.toFixed(2) || '0.00'}`);
    doc.text(`Period Revenue: $${periodRevenue[0]?.periodRevenue.toFixed(2) || '0.00'}`);
    doc.text(`Projected Monthly Revenue: $${(totalRevenue[0]?.totalRevenue * 4).toFixed(2) || '0.00'}`);
    doc.moveDown();

    doc.end();
    doc.pipe(res);
  } catch (error) {
    console.error('Error generating weekly report PDF:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/monthly/pdf', verifyAdmin, async (req, res) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Fetch user statistics
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({ createdAt: { $gte: oneMonthAgo } });
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: oneMonthAgo } });

    // Fetch policy statistics
    const totalPolicies = await Policy.countDocuments();
    const newPolicies = await Policy.countDocuments({ createdAt: { $gte: oneMonthAgo } });
    const avgPolicyPrice = await Policy.aggregate([
      { $group: { _id: null, avgPrice: { $avg: '$policyPrice' } } },
    ]);

    // Fetch revenue statistics
    const totalRevenue = await Policy.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$policyPrice' } } },
    ]);
    const periodRevenue = await Policy.aggregate([
      { $match: { createdAt: { $gte: oneMonthAgo } } },
      { $group: { _id: null, periodRevenue: { $sum: '$policyPrice' } } },
    ]);

    // Generate PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="monthly-report-${new Date().toISOString().split('T')[0]}.pdf"`);

    doc.fontSize(20).text('Monthly Report', { align: 'center' });
    doc.fontSize(14).text(`Date: ${new Date().toISOString().split('T')[0]}`);
    doc.moveDown();

    // Add User Statistics
    doc.fontSize(16).text('User Statistics');
    doc.fontSize(12).text(`Total Users: ${totalUsers}`);
    doc.text(`New Users: ${newUsers}`);
    doc.text(`Active Users: ${activeUsers}`);
    doc.moveDown();

    // Add Policy Statistics
    doc.fontSize(16).text('Policy Statistics');
    doc.fontSize(12).text(`Total Policies: ${totalPolicies}`);
    doc.text(`New Policies: ${newPolicies}`);
    doc.text(`Average Policy Price: $${avgPolicyPrice[0]?.avgPrice.toFixed(2) || '0.00'}`);
    doc.moveDown();

    // Add Revenue Statistics
    doc.fontSize(16).text('Revenue Statistics');
    doc.fontSize(12).text(`Total Revenue: $${totalRevenue[0]?.totalRevenue.toFixed(2) || '0.00'}`);
    doc.text(`Period Revenue: $${periodRevenue[0]?.periodRevenue.toFixed(2) || '0.00'}`);
    doc.text(`Projected Monthly Revenue: $${(totalRevenue[0]?.totalRevenue * 4).toFixed(2) || '0.00'}`);
    doc.moveDown();

    doc.end();
    doc.pipe(res);
  } catch (error) {
    console.error('Error generating monthly report PDF:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
