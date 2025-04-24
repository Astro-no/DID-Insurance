// routes/hospitalAuth.js
const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital'); // Corrected path
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ========== HOSPITAL LOGIN ==========
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hospital = await Hospital.findOne({ username });
    if (!hospital) return res.status(401).json({ message: 'Invalid username' });

    const valid = await bcrypt.compare(password, hospital.password);
    if (!valid) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign(
      { username: hospital.username, name: hospital.name, did: hospital.did, role: 'hospital' },
      'secretKey'
    );

    const userData = {
      id: hospital._id,
      username: hospital.username,
      name: hospital.name,
      did: hospital.did,
      role: 'hospital',
      status: hospital.status || "approved"
    };

    console.log("Backend (hospitalAuth) - Sending hospital login response:", { token, user: userData });

    return res.json({ token, user: userData });
  } catch (error) {
    console.error('Error during hospital login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post("/link-wallet", async (req, res) => {
  const { did, walletAddress } = req.body;

  try {
    const hospital = await Hospital.findOne({ did });
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    hospital.walletAddress = walletAddress;
    await hospital.save();

    res.status(200).json({ message: "Wallet linked successfully." });
  } catch (error) {
    console.error("Error linking wallet:", error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;