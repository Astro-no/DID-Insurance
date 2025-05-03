const express = require('express');
const router = express.Router();
const { recordProcedure } = require('../controllers/procedureController');
const verifyToken = require('../middleware/verifyToken'); // Middleware that sets req.user

// Protected route to record a procedure
router.post('/record', verifyToken, recordProcedure); // POST /api/procedures/record

module.exports = router;
