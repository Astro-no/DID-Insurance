const express = require('express');
const PDFDocument = require('pdfkit');
const verifyAdmin = require("../middleware/verifyAdmin"); // Middleware to verify admin access
const User = require('../models/User'); // Example: Replace with your actual User model
const Policy = require('../models/Policy'); // Example: Replace with your actual Policy model
const Claim = require('../models/Claim'); // Example: Replace with your actual Claim model

const router = express.Router();

// Helper function to fetch user statistics
const fetchUserStats = async (date, period) => {
  const totalUsers = await User.countDocuments();
  const newUsers = await User.countDocuments({ createdAt: { $gte: new Date(date) } });
  const activeUsers = await User.countDocuments({ status: 'active' });

  return { totalUsers, newUsers, activeUsers };
};

// Helper function to fetch policy statistics
const fetchPolicyStats = async (date, period) => {
  // Validate the date parameter
  const validDate = date && !isNaN(new Date(date).getTime()) ? new Date(date) : new Date();

  // Calculate the start date for the period (e.g., weekly or monthly)
  let startDate;
  if (period === 'weekly') {
    startDate = new Date(validDate);
    startDate.setDate(validDate.getDate() - 7); // Go back 7 days
  } else if (period === 'monthly') {
    startDate = new Date(validDate);
    startDate.setMonth(validDate.getMonth() - 1); // Go back 1 month
  } else {
    startDate = validDate; // Default to the provided date
  }

  // Fetch statistics
  const totalPolicies = await Policy.countDocuments();
  const newPolicies = await Policy.countDocuments({ createdAt: { $gte: startDate } });
  const avgPolicyPrice = await Policy.aggregate([
    { $group: { _id: null, avgPrice: { $avg: "$price" } } },
  ]);

  return {
    totalPolicies,
    newPolicies,
    avgPolicyPrice: avgPolicyPrice[0]?.avgPrice || 0,
  };
};

// Helper function to fetch claim statistics
const fetchClaimStats = async (date, period) => {
  const totalClaims = await Claim.countDocuments();
  const approvedClaims = await Claim.countDocuments({ status: 'approved' });
  const rejectedClaims = await Claim.countDocuments({ status: 'rejected' });
  const pendingClaims = await Claim.countDocuments({ status: 'pending' });

  return { totalClaims, approvedClaims, rejectedClaims, pendingClaims };
};

// Helper function to fetch revenue statistics
const fetchRevenueStats = async (date, period) => {
  const totalRevenue = await Policy.aggregate([
    { $group: { _id: null, totalRevenue: { $sum: "$price" } } },
  ]);

  return {
    totalRevenue: totalRevenue[0]?.totalRevenue || 0,
    projectedRevenue: (totalRevenue[0]?.totalRevenue || 0) * 1.2, // Example projection
  };
};

// Download weekly report as PDF
router.get('/weekly/pdf', verifyAdmin, async (req, res) => {
  const { date } = req.query;

  try {
    // Fetch real data from your database
    const userStats = await fetchUserStats(date, 'weekly');
    const policyStats = await fetchPolicyStats(date, 'weekly');
    const claimStats = await fetchClaimStats(date, 'weekly');
    const revenueStats = await fetchRevenueStats(date, 'weekly');

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="weekly-report-${date || 'latest'}.pdf"`);

    // Add content to the PDF
    doc.fontSize(20).text('Weekly Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Date: ${date || 'Latest'}`);
    doc.moveDown();

    // Add user statistics
    doc.text('User Statistics:', { underline: true });
    doc.text(`Total Users: ${userStats.totalUsers}`);
    doc.text(`New Users: ${userStats.newUsers}`);
    doc.text(`Active Users: ${userStats.activeUsers}`);
    doc.moveDown();

    // Add policy statistics
    doc.text('Policy Statistics:', { underline: true });
    doc.text(`Total Policies: ${policyStats.totalPolicies}`);
    doc.text(`New Policies: ${policyStats.newPolicies}`);
    doc.text(`Average Policy Price: $${policyStats.avgPolicyPrice.toFixed(2)}`);
    doc.moveDown();

    // Add claim statistics
    doc.text('Claim Statistics:', { underline: true });
    doc.text(`Total Claims: ${claimStats.totalClaims}`);
    doc.text(`Approved Claims: ${claimStats.approvedClaims}`);
    doc.text(`Rejected Claims: ${claimStats.rejectedClaims}`);
    doc.text(`Pending Claims: ${claimStats.pendingClaims}`);
    doc.moveDown();

    // Add revenue statistics
    doc.text('Revenue Statistics:', { underline: true });
    doc.text(`Total Revenue: $${revenueStats.totalRevenue.toFixed(2)}`);
    doc.text(`Projected Revenue: $${revenueStats.projectedRevenue.toFixed(2)}`);

    // Pipe the document to the response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Error generating weekly report PDF:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download monthly report as PDF
router.get('/monthly/pdf', verifyAdmin, async (req, res) => {
  const { date } = req.query;

  try {
    // Fetch real data from your database
    const userStats = await fetchUserStats(date, 'monthly');
    const policyStats = await fetchPolicyStats(date, 'monthly');
    const claimStats = await fetchClaimStats(date, 'monthly');
    const revenueStats = await fetchRevenueStats(date, 'monthly');

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="monthly-report-${date || 'latest'}.pdf"`);

    // Add content to the PDF
    doc.fontSize(20).text('Monthly Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Date: ${date || 'Latest'}`);
    doc.moveDown();

    // Add user statistics
    doc.text('User Statistics:', { underline: true });
    doc.text(`Total Users: ${userStats.totalUsers}`);
    doc.text(`New Users: ${userStats.newUsers}`);
    doc.text(`Active Users: ${userStats.activeUsers}`);
    doc.moveDown();

    // Add policy statistics
    doc.text('Policy Statistics:', { underline: true });
    doc.text(`Total Policies: ${policyStats.totalPolicies}`);
    doc.text(`New Policies: ${policyStats.newPolicies}`);
    doc.text(`Average Policy Price: $${policyStats.avgPolicyPrice.toFixed(2)}`);
    doc.moveDown();

    // Add claim statistics
    doc.text('Claim Statistics:', { underline: true });
    doc.text(`Total Claims: ${claimStats.totalClaims}`);
    doc.text(`Approved Claims: ${claimStats.approvedClaims}`);
    doc.text(`Rejected Claims: ${claimStats.rejectedClaims}`);
    doc.text(`Pending Claims: ${claimStats.pendingClaims}`);
    doc.moveDown();

    // Add revenue statistics
    doc.text('Revenue Statistics:', { underline: true });
    doc.text(`Total Revenue: $${revenueStats.totalRevenue.toFixed(2)}`);
    doc.text(`Projected Revenue: $${revenueStats.projectedRevenue.toFixed(2)}`);

    // Pipe the document to the response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Error generating monthly report PDF:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;