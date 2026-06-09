const express = require('express');
const {
  getAllAcaraIkuti,
  getAcaraIkutiById,
  getAcaraIkutiByUserId,
  createAcaraIkuti,
  updateAcaraIkuti,
  deleteAcaraIkuti
} = require('../database/acara_ikuti');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// GET
router.get('/', authenticateToken, authorizeRoles(['organizer', 'admin']), getAllAcaraIkuti);
router.get('/user/:id_user', authenticateToken, getAcaraIkutiByUserId);
router.get('/:id_acara_ikuti', authenticateToken, authorizeRoles(['organizer', 'admin']), getAcaraIkutiById);

// POST
router.post('/create', authenticateToken, createAcaraIkuti);

// PUT
router.put('/update/:id_acara_ikuti', authenticateToken, authorizeRoles(['organizer', 'admin']), updateAcaraIkuti);

// DELETE
router.delete('/delete/:id_acara_ikuti', authenticateToken, deleteAcaraIkuti);

module.exports = router;
