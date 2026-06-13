const db = require('./db');
const { ErrorCodes } = require('../utils/errors');

const getAllAcaraIkuti = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM tbl_acara_ikuti');

    const [result] = await db.query(
      `SELECT i.*, a.judul, a.lokasi, u.username AS creator_name
       FROM tbl_acara_ikuti i
       JOIN tbl_acara a ON a.id_acara = i.id_acara
       JOIN tbl_user u ON u.id_user = a.id_user
       ORDER BY i.tanggal_diikuti DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    if (result.length === 0 && page === 1) {
      return res.status(200).json({
        message: 'Data acara diikuti kosong.',
        data: [],
        total: 0,
        page,
        limit,
        statusCode: 200
      });
    }

    return res.status(200).json({
      message: 'Daftar acara diikuti berhasil diambil.',
      data: result,
      total,
      page,
      limit,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      message: 'Error mengambil daftar acara diikuti.',
      statusCode: 500,
      errorCode: ErrorCodes.DATABASE_ERROR
    });
  }
};

const getAcaraIkutiById = async (req, res) => {
  const { id_acara_ikuti } = req.params;

  try {
    const [result] = await db.query(
      'SELECT * FROM tbl_acara_ikuti WHERE id_acara_ikuti = ?',
      [id_acara_ikuti]
    );

    if (result.length === 0) {
      return res.status(404).json({
        message: 'Data acara diikuti tidak ditemukan',
        statusCode: 404
      });
    }

    return res.status(200).json({
      message: 'Data acara diikuti berhasil diambil',
      data: result[0],
      statusCode: 200
    });
  } catch (error) {
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error mengambil acara diikuti',
      statusCode: 500
    });
  }
};

const getAcaraIkutiByUserId = async (req, res) => {
  const { id_user } = req.params;
  const { id_user: requesterId } = req.user || {};

  if (!requesterId) {
    return res.status(401).json({
      message: 'Token tidak valid.',
      statusCode: 401
    });
  }

  if (!id_user) {
    return res.status(400).json({
      message: 'id_user wajib diisi',
      statusCode: 400
    });
  }

  if (id_user !== requesterId) {
    return res.status(403).json({
      message: 'Akses ditolak.',
      statusCode: 403
    });
  }

  try {
    const [result] = await db.query(
      `SELECT a.*, u.username AS creator_name, i.tanggal_diikuti, i.id_acara_ikuti,
              EXISTS(SELECT 1 FROM tbl_absensi WHERE id_acara = a.id_acara) AS has_absensi,
              (SELECT al.keterangan FROM tbl_absensi_log al
               JOIN tbl_absensi ab2 ON ab2.id_absensi = al.id_absensi
               WHERE ab2.id_acara = a.id_acara AND al.id_user = i.id_user
               ORDER BY al.waktu_absen DESC LIMIT 1
              ) AS absensi_keterangan,
              (SELECT al.waktu_absen FROM tbl_absensi_log al
               JOIN tbl_absensi ab2 ON ab2.id_absensi = al.id_absensi
               WHERE ab2.id_acara = a.id_acara AND al.id_user = i.id_user
               ORDER BY al.waktu_absen DESC LIMIT 1
              ) AS absensi_waktu
       FROM tbl_acara_ikuti i
       JOIN tbl_acara a ON a.id_acara = i.id_acara
       JOIN tbl_user u ON u.id_user = a.id_user
       WHERE i.id_user = ?
       ORDER BY i.tanggal_diikuti DESC`,
      [requesterId]
    );

    if (result.length === 0) {
      return res.status(200).json({
        message: 'Data acara diikuti untuk user ini kosong.',
        data: [],
        statusCode: 200
      });
    }

    return res.status(200).json({
      message: 'Daftar acara diikuti berdasarkan user berhasil diambil.',
      data: result,
      total: result.length,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      message: 'Error mengambil acara diikuti berdasarkan user.',
      statusCode: 500,
      errorCode: ErrorCodes.DATABASE_ERROR
    });
  }
};

const createAcaraIkuti = async (req, res) => {
  const { id_acara, tanggal_mulai, tanggal_diikuti } = req.body;
  const { id_user } = req.user || {};

  if (!id_acara || !id_user || !tanggal_mulai || !tanggal_diikuti) {
    return res.status(400).json({
      message: 'Semua field wajib diisi',
      statusCode: 400
    });
  }

  const connection = await db.getConnection();

  await connection.beginTransaction();
  try {
    const query = `INSERT INTO tbl_acara_ikuti (id_acara, id_user, tanggal_mulai, tanggal_diikuti)
                   VALUES (?, ?, ?, ?)`;
    const values = [id_acara, id_user, tanggal_mulai, tanggal_diikuti];
    const [result] = await connection.query(query, values);

    await connection.commit();

    return res.status(201).json({
      message: 'Acara berhasil diikuti',
      data: result[0],
      statusCode: 201
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error membuat acara diikuti',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

const updateAcaraIkuti = async (req, res) => {
  const { id_acara_ikuti } = req.params;
  const { tanggal_mulai, tanggal_diikuti } = req.body;
  const { id_user } = req.user || {};

  if (!id_acara_ikuti || !id_user || !tanggal_mulai || !tanggal_diikuti) {
    return res.status(400).json({
      message: 'Semua field wajib diisi',
      statusCode: 400
    });
  }

  const connection = await db.getConnection();

  await connection.beginTransaction();
  try {
    const query = `UPDATE tbl_acara_ikuti
                   SET tanggal_mulai = ?, tanggal_diikuti = ?
                   WHERE id_acara_ikuti = ? AND id_user = ?`;
    const values = [tanggal_mulai, tanggal_diikuti, id_acara_ikuti, id_user];
    const [result] = await connection.query(query, values);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Data acara diikuti tidak ditemukan',
        statusCode: 404
      });
    }

    await connection.commit();

    return res.status(200).json({
      message: 'Data acara diikuti berhasil diperbarui',
      data: result[0],
      statusCode: 200
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error memperbarui acara diikuti',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

const deleteAcaraIkuti = async (req, res) => {
  const { id_acara_ikuti } = req.params;
  const { id_user } = req.user || {};

  if (!id_acara_ikuti || !id_user) {
    return res.status(400).json({
      message: 'id_acara_ikuti dan id_user wajib diisi',
      statusCode: 400
    });
  }

  const connection = await db.getConnection();

  await connection.beginTransaction();
  try {
    const [result] = await connection.query(
      'DELETE FROM tbl_acara_ikuti WHERE id_acara_ikuti = ? AND id_user = ? LIMIT 1',
      [id_acara_ikuti, id_user]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Data acara diikuti tidak ditemukan',
        statusCode: 404
      });
    }

    await connection.commit();

    return res.status(200).json({
      message: 'Data acara diikuti berhasil dihapus',
      statusCode: 200
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error menghapus acara diikuti',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

module.exports = {
  getAllAcaraIkuti,
  getAcaraIkutiById,
  getAcaraIkutiByUserId,
  createAcaraIkuti,
  updateAcaraIkuti,
  deleteAcaraIkuti
};
