const express = require("express");
const VC = require("../models/VC");
const router = express.Router();

// Route to save a VC
router.post("/", async (req, res) => {
  try {
    const { vc } = req.body;

    if (!vc || !vc.credentialSubject || !vc.credentialSubject.id) {
      return res.status(400).json({ message: "Invalid VC data" });
    }

    const newVC = new VC(vc);
    await newVC.save();

    res.status(201).json({ message: "VC saved successfully", vc: newVC });
  } catch (error) {
    console.error("Error saving VC:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
