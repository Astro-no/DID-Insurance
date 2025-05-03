const express = require("express");
const Claim = require("../models/Claim");
const Policy = require("../models/Policy");
const { verifyUser, verifyAdmin } = require("../middleware/auth");

const router = express.Router();

// Route to file a new claim
router.post("/file", verifyUser, async (req, res) => {
  const { policyId, claimAmount, description } = req.body;

  try {
    // Ensure the policy exists
    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    // Create a new claim
    const claim = new Claim({
      user: req.user.id, // User ID from the authenticated user
      policy: policyId,
      claimAmount,
      description,
    });

    await claim.save();
    res.status(201).json({ message: "Claim filed successfully", claim });
  } catch (error) {
    console.error("Error filing claim:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/all", verifyAdmin, async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate("user", "name email") // Populate user details
      .populate("policy", "policyName"); // Populate policy details
    res.status(200).json(claims);
  } catch (error) {
    console.error("Error fetching claims:", error);
    res.status(500).json({ message: "Server error" });
  }
});

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

module.exports = router;