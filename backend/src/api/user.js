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
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET
router.get('/', getAllUser)
router.get('/:id_user', getUserById);
router.get('/me/profile', authenticateToken, (req, res) => {
  return res.status(200).json({
    message: 'Data token valid.',
    data: req.user,
    statusCode: 200
  });
});

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