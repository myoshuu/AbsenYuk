const express = require('express');
const {
  getAllAcara,
  getAcaraById,
  createAcara,
  updateAcara,
  updateJudulAcara,
  updateLokasiAcara,
  updateTanggalAcara,
  updateMaksPengunjungAcara,
  deleteAcara
} = require('../database/acara');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// GET
router.get('/', authenticateToken, authorizeRoles('organizer', 'admin'), getAllAcara);
router.get('/:id', authenticateToken, authorizeRoles('organizer', 'admin'), getAcaraById);


// POST
router.post('/create', authenticateToken, authorizeRoles('organizer', 'admin'), createAcara);

// PUT
router.put('/update/:id', authenticateToken, authorizeRoles('organizer', 'admin'), updateAcara);
router.put('/update-judul/:id', authenticateToken, authorizeRoles('organizer', 'admin'), updateJudulAcara);
router.put('/update-lokasi/:id', authenticateToken, authorizeRoles('organizer', 'admin'), updateLokasiAcara);
router.put('/update-tanggal/:id', authenticateToken, authorizeRoles('organizer', 'admin'), updateTanggalAcara);
router.put('/update-maks-pengunjung/:id', authenticateToken, authorizeRoles('organizer', 'admin'), updateMaksPengunjungAcara);

// DELETE
router.delete('/delete/:id', authenticateToken, authorizeRoles('organizer', 'admin'), deleteAcara);

module.exports = router;