const express = require('express');
const router = express.Router();
const Policy = require('../models/Policy'); // Adjust the path to where your Policy model is defined
const verifyToken = require("../middleware/verifyToken");
const PolicyRegistration = require('../models/PolicyRegistration'); // Add this line


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

// POST route to create multiple policies at once
router.post('/create', async (req, res) => {
  try {
    const policies = req.body; // Array of policy objects

    // Ensure that the array is not empty
    if (!Array.isArray(policies) || policies.length === 0) {
      return res.status(400).json({ message: 'No policies provided' });
    }

    // Insert multiple policies at once
    const createdPolicies = await Policy.insertMany(policies);

    res.status(201).json({
      message: 'Policies created successfully',
      createdPolicies
    });
  } catch (error) {
    console.error("Error creating policies:", error);
    res.status(500).json({
      message: 'Error creating policies',
      error: error.message
    });
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

// Get user's registered policies
router.get('/my-policies', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query; // Add 'status' filter
  
    let filter = { user: userId };

    // Apply the status filter (active or expired)
    if (status === 'active') {
        filter.expiryDate = { $gte: new Date() }; // Only active policies (expiry date not passed)
    } else if (status === 'expired') {
        filter.expiryDate = { $lt: new Date() }; // Only expired policies (expiry date passed)
    }

    try {
        const registrations = await PolicyRegistration.find(filter)
            .populate('policy')
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ registrationDate: -1 });
        
        const totalRegistrations = await PolicyRegistration.countDocuments(filter);
        

        // Check for auto-renewal suggestions
        const autoRenewSuggestions = registrations.filter((registration) => {
            // Suggest auto-renewal if the policy expires in the next 30 days
            const currentDate = new Date();
            const expiryDate = new Date(registration.expiryDate);
            return (expiryDate - currentDate) <= (30 * 24 * 60 * 60 * 1000); // 30 days in milliseconds
        });

        res.status(200).json({
            registrations,
            totalPages: Math.ceil(totalRegistrations / limit),
            currentPage: Number(page),
            totalRegistrations,
            autoRenewSuggestions
        });
    } catch (error) {
        console.error('Error fetching user policies:', error);
        res.status(500).json({ message: 'Error fetching user policies', error: error.message });
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

// Register for a policy
// Register for a policy
router.post('/register', verifyToken, async (req, res) => {
  const { policyId } = req.body;
  const userId = req.user.id;

  try {
    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    const existingRegistration = await PolicyRegistration.findOne({
      user: userId,
      policy: policyId,
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this policy',
      });
    }

    const policyRegistration = new PolicyRegistration({
      user: userId,
      policy: policyId,
      status: 'active',
      registrationDate: Date.now(),
      expiryDate: new Date(Date.now() + policy.policyDuration * 30 * 24 * 60 * 60 * 1000),
    });

    await policyRegistration.save();

    // 🔥 Update user role to "policyholder"
    const User = require("../models/User");
    await User.findByIdAndUpdate(userId, { role: "policyholder" });

    res.status(201).json({
      success: true,
      message: 'Policy registered successfully',
      registration: policyRegistration,
    });
  } catch (error) {
    console.error('Error registering for policy:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering for policy',
      error: error.message,
    });
  }
});


module.exports = router;
