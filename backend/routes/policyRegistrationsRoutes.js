const express = require("express");
const PolicyRegistration = require("../models/PolicyRegistration");
const Policy = require("../models/Policy");
const { verifyUser } = require("../middleware/auth");

const router = express.Router();

// Route to get policy details by policy registration ID
router.get("/:policyRegistrationId", verifyUser, async (req, res) => {
  try {
    const policyRegistration = await PolicyRegistration.findById(req.params.policyRegistrationId).populate("policy");
    if (!policyRegistration) {
      return res.status(404).json({ message: "Policy registration not found" });
    }

    const policy = await Policy.findById(policyRegistration.policy);
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    res.status(200).json({ policy });
  } catch (error) {
    console.error("Error fetching policy details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;