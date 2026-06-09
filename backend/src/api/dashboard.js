const express = require('express');
const { getAdminSummary, getOrganizerSummary } = require('../database/dashboard');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.get('/summary', authenticateToken, getAdminSummary);
router.get('/organizer-summary', authenticateToken, getOrganizerSummary);

module.exports = router;
