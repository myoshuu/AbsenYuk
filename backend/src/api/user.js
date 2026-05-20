const express = require('express');
const {
  getAllUser,
  getUserById,
  registerUser,
  loginUser,
  updateUser,
  updateTipeAkun,
  changeUsername,
  changePassword,
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
router.put('/update/:email', updateUser);
router.put('/update-tipe-akun/:email', updateTipeAkun);
router.put('/change-username/:email', changeUsername);
router.put('/change-password/:email', changePassword);

// DELETE
router.delete('/delete/:email', deleteUser);

module.exports = router;