const express = require('express');
const {
  getPostsByAcara,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getKomentarByPost,
  createKomentar,
  updateKomentar,
  deleteKomentar
} = require('../database/acara_post');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/acara/:id_acara', authenticateToken, getPostsByAcara);
router.get('/:id_post', authenticateToken, getPostById);
router.post('/acara/:id_acara', authenticateToken, createPost);
router.put('/:id_post', authenticateToken, updatePost);
router.delete('/:id_post', authenticateToken, deletePost);

router.get('/:id_post/komentar', authenticateToken, getKomentarByPost);
router.post('/:id_post/komentar', authenticateToken, createKomentar);
router.put('/komentar/:id_komentar', authenticateToken, updateKomentar);
router.delete('/komentar/:id_komentar', authenticateToken, deleteKomentar);

module.exports = router;
