'use strict';

const path = require('path');
const fs = require('fs');
const multer = require('multer');

const PROFILE_DIR = path.join(__dirname, 'profile');
if (!fs.existsSync(PROFILE_DIR)) fs.mkdirSync(PROFILE_DIR, { recursive: true });

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, PROFILE_DIR),
  filename: (req, file, cb) => {
    const id_user = req.user?.id_user;
    if (!id_user) return cb(new Error('User tidak teridentifikasi.'));
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, id_user + ext);
  }
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Hanya file gambar (JPEG, PNG, WebP) yang diizinkan.'));
};

const upload = multer({ storage, limits: { fileSize: MAX_SIZE }, fileFilter });

function multerErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ message: 'Ukuran file maksimal 2MB.', statusCode: 413 });
    return res.status(400).json({ message: 'Error upload: ' + err.message, statusCode: 400 });
  }
  if (err) return res.status(400).json({ message: err.message, statusCode: 400 });
  next();
}

function getAvatarFileName(id_user) {
  try {
    var files = fs.readdirSync(PROFILE_DIR);
    for (var i = 0; i < files.length; i++) {
      if (files[i].startsWith(id_user + '.')) return files[i];
    }
  } catch (_) { }
  return null;
}

function cleanupOldAvatar(id_user, skipFilename) {
  try {
    var files = fs.readdirSync(PROFILE_DIR);
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      if (f.startsWith(id_user + '.') && (!skipFilename || f !== skipFilename)) {
        fs.unlinkSync(path.join(PROFILE_DIR, f));
      }
    }
  } catch (_) { }
}

const changeAvatar = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Tidak ada file yang diupload.', statusCode: 400 });
  cleanupOldAvatar(req.user.id_user, req.file.filename);
  return res.status(200).json({ message: 'Foto profil berhasil diperbarui.', data: { filename: req.file.filename }, statusCode: 200 });
};

const serveAvatar = async (req, res) => {
  var id_user = req.params.id_user;
  if (!/^[a-fA-F0-9]+$/.test(id_user)) return res.status(400).json({ message: 'ID user tidak valid.', statusCode: 400 });
  var filename = getAvatarFileName(id_user);
  if (!filename) return res.status(404).json({ message: 'Foto profil tidak ditemukan.', statusCode: 404 });
  var filePath = path.resolve(PROFILE_DIR, filename);
  var ext = path.extname(filename).toLowerCase();
  var mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
  var contentType = mimeTypes[ext] || 'image/jpeg';
  try {
    var data = fs.readFileSync(filePath);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', data.length);
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    return res.status(200).send(data);
  } catch (err) {
    console.error('Error serving avatar: ' + err.message);
    return res.status(404).json({ message: 'Foto profil tidak ditemukan.', statusCode: 404 });
  }
};

module.exports = { upload, multerErrorHandler, changeAvatar, serveAvatar };
