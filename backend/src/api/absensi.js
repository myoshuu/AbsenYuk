const express = require('express');
const {
  getAllAbsensiByAcara,
  getAbsensiById,
  createAbsensi,
  generateAbsensiLink,
  generateAbsensiQr,
  getAbsensiByToken,
  deleteAbsensi
} = require('../database/absensi');
const {
  createAbsensiLog,
  getAbsensiLogsByAbsensi,
  deleteAbsensiLog,
  getLogsByAcara,
  updateAbsensiLog,
  addAbsensiLog
} = require('../database/absensi_log');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Organizer/Admin
router.post('/create', authenticateToken, authorizeRoles('organizer', 'admin'), createAbsensi);
router.get('/acara/:id_acara', authenticateToken, authorizeRoles('organizer', 'admin'), getAllAbsensiByAcara);
router.get('/token/:token', authenticateToken, getAbsensiByToken);
router.delete('/:id_absensi/log/:id_log', authenticateToken, authorizeRoles('organizer', 'admin'), deleteAbsensiLog);
router.post('/:id_absensi/generate-qr', authenticateToken, authorizeRoles('organizer', 'admin'), generateAbsensiQr);
router.post('/:id_absensi/generate-link', authenticateToken, authorizeRoles('organizer', 'admin'), generateAbsensiLink);
router.get('/:id_absensi/logs', authenticateToken, authorizeRoles('organizer', 'admin'), getAbsensiLogsByAbsensi);
router.get('/:id_absensi', authenticateToken, authorizeRoles('organizer', 'admin'), getAbsensiById);
router.delete('/:id_absensi', authenticateToken, authorizeRoles('organizer', 'admin'), deleteAbsensi);

// Global absensi log management (admin/organizer)
router.get('/acara/:id_acara/logs', authenticateToken, authorizeRoles('organizer', 'admin'), getLogsByAcara);
router.put('/log/:id_log', authenticateToken, authorizeRoles('organizer', 'admin'), updateAbsensiLog);
router.post('/log', authenticateToken, authorizeRoles('organizer', 'admin'), addAbsensiLog);
router.delete('/log/:id_log', authenticateToken, authorizeRoles('organizer', 'admin'), deleteAbsensiLog);

// User submit
router.post('/submit', authenticateToken, authorizeRoles('user', 'organizer', 'admin'), createAbsensiLog);

module.exports = router;
