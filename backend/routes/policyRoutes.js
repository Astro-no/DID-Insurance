const express = require('express');
const router = express.Router();
const Policy = require('../models/Policy'); // Adjust the path to where your Policy model is defined
const verifyToken = require("../middleware/verifyToken");

// Create a new policy
router.post('/create', async (req, res) => {
  const { 
    policyName, 
    policyDescription, 
    policyPrice, 
    policyDuration, 
    insuranceCompany, 
    coveredHospital,
    coverageDetails // Make sure this field is also in your model if you're using it
  } = req.body;

  try {
    // Create new policy
    const newPolicy = new Policy({
      policyName,
      policyDescription,
      policyPrice,
      policyDuration,
      insuranceCompany,
      coveredHospital,
      coverageDetails
    });

    // Save to DB
    await newPolicy.save();
    res.status(201).json({ message: 'Policy created successfully', policy: newPolicy });
  } catch (error) {
    console.error('Error creating policy:', error); // Improved error logging for debugging
    res.status(500).json({ message: 'Error creating policy', error: error.message });
  }
});

// Get all policies
router.get('/', async (req, res) => {
  try {
    const policies = await Policy.find().sort({ createdAt: -1 });
    res.status(200).json(policies);
  } catch (error) {
    console.error('Error fetching policies:', error); // Improved error logging for debugging
    res.status(500).json({ message: 'Error fetching policies', error: error.message });
  }
});

// Get policy by ID
router.get('/:id', async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    res.status(200).json(policy);
  } catch (error) {
    console.error('Error fetching policy by ID:', error); // Improved error logging for debugging
    res.status(500).json({ message: 'Error fetching policy', error: error.message });
  }
});

module.exports = router;
