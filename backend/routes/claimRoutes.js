const express = require("express");
const Claim = require("../models/Claim");
const Policy = require("../models/Policy");
const { verifyUser, verifyAdmin } = require("../middleware/auth");

const router = express.Router();

// Route to file a new claim
router.post('/file', verifyUser, async (req, res) => {
  try {
    const { policyId, claimAmount, description } = req.body;

    // Ensure userDID is coming from the authenticated user
    const userDID = req.user.did; // Assuming `req.user` contains the authenticated user's details

    if (!userDID) {
      return res.status(400).json({ message: 'User DID is required' });
    }

    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    const claim = new Claim({
      user: req.user.id,
      userDID, // Pass the userDID here
      policy: policyId,
      claimAmount,
      description,
    });

    await claim.save();
    res.status(201).json({ message: 'Claim filed successfully', claim });
  } catch (error) {
    console.error('Error filing claim:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route to get all claims (admin only)
router.get("/all", verifyAdmin, async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate("user", "name email")
      .populate("policy", "policyName");
    res.status(200).json(claims);
  } catch (error) {
    console.error("Error fetching claims:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to update claim status
router.put("/:claimId/status", verifyAdmin, async (req, res) => {
  const { status } = req.body;

  try {
    const claim = await Claim.findById(req.params.claimId);
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    claim.status = status;
    claim.updatedAt = Date.now();
    await claim.save();

    res.status(200).json({ message: "Claim status updated successfully", claim });
  } catch (error) {
    console.error("Error updating claim status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to get claims by logged-in user
router.get("/my-claims", verifyUser, async (req, res) => {
  try {
    // Add debugging to verify user information
    console.log("Fetching claims for user:", req.user.id);
    
    const claims = await Claim.find({ user: req.user.id })
      .populate("policy", "policyName policyNumber");
    
    // Add debugging to check if claims are being found
    console.log(`Found ${claims.length} claims for user ${req.user.id}`);
    
    return res.status(200).json({ claims });
  } catch (error) {
    console.error("Error fetching user's claims:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Route to get claims by DID
router.get('/by-did/:did', async (req, res) => {
  try {
    const { did } = req.params;
    console.log('Fetching claims for DID:', did);

    if (!did) {
      console.error('DID is missing in the request');
      return res.status(400).json({ message: 'DID is required' });
    }

    // Use case-insensitive search to be more robust
    const claims = await Claim.find({ userDID: { $regex: new RegExp('^' + did + '$', 'i') } })
      .populate("policy", "policyName policyNumber");
    
    console.log(`Found ${claims.length} claims for DID ${did}`);

    // Return an empty array rather than a 404 if no claims found
    return res.status(200).json({ claims });
  } catch (error) {
    console.error('Error fetching claims by DID:', error);
    return res.status(500).json({ message: 'Server error while fetching claims' });
  }
});

module.exports = router;