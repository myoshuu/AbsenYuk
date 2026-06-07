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
  deleteUser,
  getMyProfile
} = require('../database/user');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { upload, multerErrorHandler, changeAvatar, serveAvatar } = require('../database/avatar');

const router = express.Router();

// GET
router.get('/', getAllUser)
router.get('/profile-picture/:id_user', serveAvatar);
router.get('/me/profile', authenticateToken, getMyProfile);
router.get('/:id_user', getUserById);

// POST
router.post('/register', registerUser);
router.post('/login', loginUser);

// PUT 
router.put('/update/:email', authenticateToken, authorizeRoles('admin'), updateUser);
router.put('/update-tipe-akun/:email', authenticateToken, authorizeRoles('admin'), updateTipeAkun);
router.put('/change-username/:email', authenticateToken, changeUsername);
router.put('/change-password/:email', authenticateToken, changePassword);
router.put('/change-avatar', authenticateToken, upload.single('avatar'), multerErrorHandler, changeAvatar);

// DELETE
router.delete('/delete/:email', authenticateToken, deleteUser);

module.exports = router;