const express = require('express');
const {
  getAllUser,
  getUserById,
  registerUser,
  loginUser,
  deleteUser
} = require('../database/user');

const router = express.Router();

// GET
router.get('/', getAllUser)
router.get('/:id_user', getUserById);

// POST
router.post('/register', registerUser);
router.post('/login', loginUser);

// PUT

// DELETE
router.delete('/delete', deleteUser);

module.exports = router;