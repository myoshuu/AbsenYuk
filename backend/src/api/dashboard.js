const express = require('express');
const { getAdminSummary, getOrganizerSummary, getAdminMonthlyStats } = require('../database/dashboard');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.get('/summary', authenticateToken, getAdminSummary);
router.get('/organizer-summary', authenticateToken, getOrganizerSummary);
router.get('/monthly-stats', authenticateToken, getAdminMonthlyStats);

module.exports = router;
