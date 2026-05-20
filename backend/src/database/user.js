const crypto = require('crypto');
const bcrypt = require('bcrypt');
const db = require('./db');

const getUserById = async (req, res) => {
  const { id_user } = req.params;

  try {
    const [result] = await db.query('SELECT * FROM `tbl_user` WHERE `id_user` = ?', [id_user]);

    if (result.length <= 0) return res.status(404).json({
      message: 'User tersebut tidak ditemukan.',
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
    const [result] = await db.query('SELECT * FROM `tbl_user`');

    if (result.length <= 0) return res.status(404).json({
      message: 'Table user kosong.',
      statusCode: 404
    });

    return res.status(200).json({
      message: 'Data telah didapatkan.',
      data: result,
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

  if (!username || !password || !email) return res.status(400).json({
    message: 'Data field tidak boleh kosong.',
    statusCode: 400
  });

  const connection = await db.getConnection();

  await connection.beginTransaction();
  try {
    // cek apakah akun sudah pernah ada melalui email
    const [cekAkun] = await connection.query('SELECT `email` FROM `tbl_user` WHERE `email` = ?', [email]);

    if (cekAkun.length > 0) {
      connection.rollback();
      return res.status(409).json({
        message: 'Akun dengan email tersebut terdaftar.',
        statusCode: 409
      });
    }

    const generatedId = crypto.randomUUID();
    const idUser = generatedId.replace(/-/g, '').substring(0, 12);

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

  if (!email || !password) return res.status(400).json({
    message: 'Data field tidak boleh kosong.',
    statusCode: 400
  });

  const connection = await db.getConnection();

  await connection.beginTransaction();

  try {
    // Cek apakah email tersebut sudah terdaftar.
    const [cekAkun] = await connection.query(
      'SELECT `email`, `password_hash` FROM `tbl_user` WHERE `email` = ?',
      [email]
    );

    if (cekAkun.length <= 0) {
      await connection.rollback();
      return res.status(404).json({
        message: `Akun dengan email ${email} belum terdaftar.`,
        statusCode: 404
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
        message: 'Email atau Password salah.',
        statusCode: 401
      });
    };

    // Jika data benar berikan akses
    return res.status(200).json({
      message: 'Berhasil login. Redirecting...',
      data: true,
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
  const { email, username, newEmail } = req.body;

  if (!email) return res.status(400).json({
    message: 'Email field tidak boleh kosong.',
    statusCode: 400
  });

  if (!username && !newEmail) return res.status(400).json({
    message: 'Minimal salah satu field (username atau newEmail) harus diisi.',
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
  const { email } = req.body;

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

module.exports = {
  getUserById,
  getAllUser,
  registerUser,
  loginUser,
  updateUser,
  updateTipeAkun,
  changeUsername,
  changePassword,
  deleteUser
};