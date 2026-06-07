const express = require('express');
const { getAdminSummary } = require('../database/dashboard');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.get('/summary', authenticateToken, getAdminSummary);

module.exports = router;
