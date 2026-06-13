const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { ErrorCodes } = require('../utils/errors');

// ─── Validation Helpers ──────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 30;

function isValidEmail(email) {
  return EMAIL_REGEX.test(email);
}

function isValidPassword(password) {
  if (password.length < PASSWORD_MIN_LENGTH) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasLetter && hasNumber;
}

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;
  return score;
}

function isValidUsername(username) {
  if (!username) return false;
  if (username.length < USERNAME_MIN_LENGTH) return false;
  if (username.length > USERNAME_MAX_LENGTH) return false;
  return /^[a-zA-Z0-9_]+$/.test(username);
}

const getUserById = async (req, res) => {
  const { id_user } = req.params;

  try {
    const [result] = await db.query('SELECT * FROM `tbl_user` WHERE `id_user` = ?', [id_user]);

    if (result.length <= 0) return res.status(404).json({
      message: 'User tersebut tidak ditemukan.',
      data: null,
      statusCode: 404
    });

    return res.status(200).json({
      message: `User dengan id ${id_user} ditemukan.`,
      data: result[0],
      statusCode: 200
    });
  } catch (error) {
    console.error('Error: ', error);

    return res.status(500).json({
      message: 'Error internal server.',
      statusCode: 500
    });
  }
};

const getAllUser = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;
    const q = req.query.q || '';

    let where = '';
    const params = [];
    if (q) {
      where = 'WHERE email LIKE ? OR username LIKE ?';
      const pattern = `%${q}%`;
      params.push(pattern, pattern);
    }

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM tbl_user ${where}`, params
    );

    const [result] = await db.query(
      `SELECT * FROM tbl_user ${where} ORDER BY id_user DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    if (result.length === 0 && page === 1) {
      return res.status(404).json({
        message: q ? 'Pencarian tidak ditemukan.' : 'Table user kosong.',
        data: [],
        total: 0,
        page,
        limit,
        statusCode: 404
      });
    }

    return res.status(200).json({
      message: 'Data telah didapatkan.',
      data: result,
      total,
      page,
      limit,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error internal server.',
      statusCode: 500
    });
  }
};

const registerUser = async (req, res) => {
  const { username, password, email } = req.body;

  // Validation checks
  if (!username || !password || !email) {
    return res.status(400).json({
      message: 'Semua field harus diisi.',
      statusCode: 400,
      errorCode: ErrorCodes.VALIDATION_REQUIRED_FIELD
    });
  }

  // Email format validation
  if (!isValidEmail(email)) {
    return res.status(400).json({
      message: 'Format email tidak valid.',
      statusCode: 400,
      errorCode: ErrorCodes.VALIDATION_INVALID_EMAIL
    });
  }

  // Username validation
  if (!isValidUsername(username)) {
    return res.status(400).json({
      message: `Username harus 3-30 karakter, hanya huruf, angka, dan underscore.`,
      statusCode: 400,
      errorCode: ErrorCodes.VALIDATION_INVALID_FORMAT
    });
  }

  // Password validation
  if (!isValidPassword(password)) {
    return res.status(400).json({
      message: 'Password minimal 8 karakter dengan huruf dan angka.',
      statusCode: 400,
      errorCode: ErrorCodes.VALIDATION_INVALID_PASSWORD
    });
  }

  const connection = await db.getConnection();

  await connection.beginTransaction();
  try {
    // cek apakah akun sudah pernah ada melalui email
    const [cekAkun] = await connection.query('SELECT `email` FROM `tbl_user` WHERE `email` = ?', [email]);

    if (cekAkun.length > 0) {
      connection.rollback();
      return res.status(409).json({
        message: 'Email sudah terdaftar.',
        statusCode: 409,
        errorCode: ErrorCodes.RESOURCE_ALREADY_EXISTS
      });
    }

    const idUser = crypto.randomBytes(12).toString('hex').substring(0, 12);

    const hashPassword = await bcrypt.hash(password, 10);

    const [result] = await connection.query(
      'INSERT INTO `tbl_user` (`id_user`, `username`, `password_hash`, `email`) VALUES (?, ?, ?, ?)',
      [idUser, username, hashPassword, email]
    );
    await connection.commit();

    return res.status(201).json({
      message: `User dengan email ${email} berhasil didaftarkan.`,
      data: result[0],
      statusCode: 201
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);

    return res.status(500).json({
      message: 'Error internal server.',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email dan password harus diisi.',
      statusCode: 400,
      errorCode: ErrorCodes.VALIDATION_REQUIRED_FIELD
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      message: 'Format email tidak valid.',
      statusCode: 400,
      errorCode: ErrorCodes.VALIDATION_INVALID_EMAIL
    });
  }

  const connection = await db.getConnection();

  await connection.beginTransaction();

  try {
    // Cek apakah email tersebut sudah terdaftar.
    const [cekAkun] = await connection.query(
      'SELECT `id_user`, `username`, `email`, `password_hash`, `tipe_akun` FROM `tbl_user` WHERE `email` = ?',
      [email]
    );

    if (cekAkun.length <= 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Akun tidak ditemukan.',
        statusCode: 404,
        errorCode: ErrorCodes.RESOURCE_NOT_FOUND
      });
    };

    // Cek data akun apakah sudah benar
    const hashedPass = cekAkun[0].password_hash;
    const checkPass = await bcrypt.compare(password, hashedPass);

    const dbEmail = cekAkun[0].email;

    // Jika data salah maka ulangi register
    if (email != dbEmail || checkPass != true) {
      await connection.rollback();
      return res.status(401).json({
        message: 'Email atau password salah.',
        statusCode: 401,
        errorCode: ErrorCodes.AUTH_TOKEN_INVALID
      });
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      await connection.rollback();
      return res.status(500).json({
        message: 'JWT secret belum diatur pada server.',
        statusCode: 500
      });
    }

    const token = jwt.sign(
      {
        id_user: cekAkun[0].id_user,
        email: cekAkun[0].email,
        role: cekAkun[0].tipe_akun
      },
      secret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Berhasil login. Redirecting...',
      data: {
        token,
        user: {
          id_user: cekAkun[0].id_user,
          username: cekAkun[0].username,
          email: cekAkun[0].email,
          tipe_akun: cekAkun[0].tipe_akun
        }
      },
      statusCode: 200
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);

    return res.status(500).json({
      message: 'Error internal server.',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

// Fungsi untuk update data user, tipe akun, username, dan password masih dalam tahap pengembangan.
const updateUser = async (req, res) => {
  const { email, username, newEmail, password } = req.body;

  if (!email) return res.status(400).json({
    message: 'Email field tidak boleh kosong.',
    statusCode: 400
  });

  if (!username && !newEmail && !password) return res.status(400).json({
    message: 'Minimal salah satu field (username, newEmail, atau password) harus diisi.',
    statusCode: 400
  });

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const [cekAkun] = await connection.query('SELECT `id_user` FROM `tbl_user` WHERE `email` = ?', [email]);

    if (cekAkun.length <= 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Akun tidak ditemukan.',
        statusCode: 404
      });
    }

    const idUser = cekAkun[0].id_user;

    if (newEmail) {
      const [cekEmail] = await connection.query('SELECT `email` FROM `tbl_user` WHERE `email` = ? AND `email` != ?', [newEmail, email]);
      if (cekEmail.length > 0) {
        await connection.rollback();
        return res.status(409).json({
          message: 'Email sudah terdaftar.',
          statusCode: 409
        });
      }
    }

    if (username) {
      await connection.query('UPDATE `tbl_user` SET `username` = ? WHERE `id_user` = ?', [username, idUser]);
    }

    if (newEmail) {
      await connection.query('UPDATE `tbl_user` SET `email` = ? WHERE `id_user` = ?', [newEmail, idUser]);
    }

    if (password) {
      const newHashPassword = await bcrypt.hash(password, 10);
      await connection.query('UPDATE `tbl_user` SET `password_hash` = ? WHERE `id_user` = ?', [newHashPassword, idUser]);
    }

    await connection.commit();

    return res.status(200).json({
      message: 'Data user berhasil diperbarui.',
      statusCode: 200
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);

    return res.status(500).json({
      message: 'Error internal server.',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

// Fungsi untuk update tipe akun masih dalam tahap pengembangan.
const updateTipeAkun = async (req, res) => {
  const { email, tipeAkun } = req.body;

  if (!email || !tipeAkun) return res.status(400).json({
    message: 'Data field tidak boleh kosong.',
    statusCode: 400
  });

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const [cekAkun] = await connection.query('SELECT `id_user` FROM `tbl_user` WHERE `email` = ?', [email]);

    if (cekAkun.length <= 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Akun tidak ditemukan.',
        statusCode: 404
      });
    }

    const idUser = cekAkun[0].id_user;

    await connection.query('UPDATE `tbl_user` SET `tipe_akun` = ? WHERE `id_user` = ?', [tipeAkun, idUser]);
    await connection.commit();

    return res.status(200).json({
      message: 'Tipe akun berhasil diperbarui.',
      statusCode: 200
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);

    return res.status(500).json({
      message: 'Error internal server.',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

// Fungsi untuk update username masih dalam tahap pengembangan.
const changeUsername = async (req, res) => {
  const { email, newUsername } = req.body;

  if (!email || !newUsername) return res.status(400).json({
    message: 'Data field tidak boleh kosong.',
    statusCode: 400
  });

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const [cekAkun] = await connection.query('SELECT `id_user` FROM `tbl_user` WHERE `email` = ?', [email]);

    if (cekAkun.length <= 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Akun tidak ditemukan.',
        statusCode: 404
      });
    }

    const idUser = cekAkun[0].id_user;

    await connection.query('UPDATE `tbl_user` SET `username` = ? WHERE `id_user` = ?', [newUsername, idUser]);
    await connection.commit();

    return res.status(200).json({
      message: 'Username berhasil diubah.',
      statusCode: 200
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);

    return res.status(500).json({
      message: 'Error internal server.',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
}

// Fungsi untuk update password masih dalam tahap pengembangan.
const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  if (!email || !oldPassword || !newPassword) return res.status(400).json({
    message: 'Data field tidak boleh kosong.',
    statusCode: 400
  });

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const [cekAkun] = await connection.query('SELECT `id_user`, `password_hash` FROM `tbl_user` WHERE `email` = ?', [email]);

    if (cekAkun.length <= 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Akun tidak ditemukan.',
        statusCode: 404
      });
    }

    const idUser = cekAkun[0].id_user;
    const hashedPass = cekAkun[0].password_hash;
    const checkPass = await bcrypt.compare(oldPassword, hashedPass);

    if (!checkPass) {
      await connection.rollback();
      return res.status(401).json({
        message: 'Password lama tidak sesuai.',
        statusCode: 401
      });
    }

    const newHashPassword = await bcrypt.hash(newPassword, 10);

    await connection.query('UPDATE `tbl_user` SET `password_hash` = ? WHERE `id_user` = ?', [newHashPassword, idUser]);
    await connection.commit();

    return res.status(200).json({
      message: 'Password berhasil diubah.',
      statusCode: 200
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);

    return res.status(500).json({
      message: 'Error internal server.',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

const deleteUser = async (req, res) => {
  const email = req.body?.email || req.params?.email;

  if (!email) return res.status(400).json({
    message: 'Data field kosong.',
    statusCode: 400
  });

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const [cekAkun] = await connection.query('SELECT `email` FROM `tbl_user` WHERE `email` = ?', [email]);

    if (cekAkun.length <= 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Akun tidak terdaftar.',
        statusCode: 404
      });
    }

    const [result] = await connection.query('DELETE FROM `tbl_user` WHERE `email` = ? LIMIT 1', [email]);
    await connection.commit();

    return res.status(200).json({
      message: `Akun dengan email ${email} berhasil dihapus.`,
      statusCode: 200
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);

    return res.status(500).json({
      message: 'Error internal server.',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

const getMyProfile = async (req, res) => {
  const { id_user } = req.user || {};
  if (!id_user) return res.status(401).json({ message: 'Token tidak valid.', statusCode: 401 });
  try {
    const [result] = await db.query('SELECT id_user, username, email, tipe_akun FROM tbl_user WHERE id_user = ?', [id_user]);
    if (result.length === 0) return res.status(404).json({ message: 'User tidak ditemukan.', statusCode: 404 });
    return res.status(200).json({ message: 'Profil berhasil diambil.', data: result[0], statusCode: 200 });
  } catch (error) {
    console.error('Error: ', error);
    return res.status(500).json({ message: 'Error mengambil profil.', statusCode: 500 });
  }
};

module.exports = {
  getUserById,
  getAllUser,
  registerUser,
  loginUser,
  updateUser,
  updateTipeAkun,
  changeUsername,
  changePassword,
  deleteUser,
  getMyProfile
};