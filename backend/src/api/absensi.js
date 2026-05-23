const express = require('express');
const {
  getAllAbsensiByAcara,
  getAbsensiById,
  createAbsensi,
  generateAbsensiLink,
  generateAbsensiQr
} = require('../database/absensi');
const {
  createAbsensiLog,
  getAbsensiLogsByAbsensi
} = require('../database/absensi_log');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Organizer/Admin
router.post('/create', authenticateToken, authorizeRoles('organizer', 'admin'), createAbsensi);
router.get('/acara/:id_acara', authenticateToken, authorizeRoles('organizer', 'admin'), getAllAbsensiByAcara);
router.post('/:id_absensi/generate-qr', authenticateToken, authorizeRoles('organizer', 'admin'), generateAbsensiQr);
router.post('/:id_absensi/generate-link', authenticateToken, authorizeRoles('organizer', 'admin'), generateAbsensiLink);
router.get('/:id_absensi/logs', authenticateToken, authorizeRoles('organizer', 'admin'), getAbsensiLogsByAbsensi);
router.get('/:id_absensi', authenticateToken, authorizeRoles('organizer', 'admin'), getAbsensiById);

// User submit
router.post('/submit', authenticateToken, authorizeRoles('user', 'organizer', 'admin'), createAbsensiLog);

module.exports = router;
