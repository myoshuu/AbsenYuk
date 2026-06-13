const express = require('express');
const rateLimit = require('express-rate-limit');
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

// ─── Rate Limiters for Auth Endpoints ───────────────────────────
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.',
    statusCode: 429,
    errorCode: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip
});

const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 registrations per hour
  message: {
    message: 'Terlalu banyak percobaan registrasi. Coba lagi dalam 1 jam.',
    statusCode: 429,
    errorCode: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip
});

// GET
router.get('/', getAllUser)
router.get('/profile-picture/:id_user', serveAvatar);
router.get('/me/profile', authenticateToken, getMyProfile);
router.get('/:id_user', getUserById);

// POST - with rate limiting
router.post('/register', registerRateLimiter, registerUser);
router.post('/login', authRateLimiter, loginUser);

// PUT
router.put('/update/:email', authenticateToken, authorizeRoles(['admin']), updateUser);
router.put('/update-tipe-akun/:email', authenticateToken, authorizeRoles(['admin']), updateTipeAkun);
router.put('/change-username/:email', authenticateToken, changeUsername);
router.put('/change-password/:email', authenticateToken, changePassword);
router.put('/change-avatar', authenticateToken, upload.single('avatar'), multerErrorHandler, changeAvatar);

// DELETE
router.delete('/delete/:email', authenticateToken, deleteUser);

module.exports = router;