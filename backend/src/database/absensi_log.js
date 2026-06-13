const db = require('./db');
const { ErrorCodes } = require('../utils/errors');

const createAbsensiLog = async (req, res) => {
  const { token, keterangan, note } = req.body;
  const { id_user } = req.user || {};

  if (!id_user) {
    return res.status(401).json({
      message: 'Token tidak valid.',
      statusCode: 401
    });
  }

  if (!token || !keterangan) {
    return res.status(400).json({
      message: 'token dan keterangan wajib diisi',
      statusCode: 400
    });
  }

  const connection = await db.getConnection();

  await connection.beginTransaction();
  try {
    const [detail] = await connection.query(
      `SELECT d.id_absensi, d.mulai_absen, d.akhir_absen, d.qr_expires_at, d.status_qr, a.status
       FROM tbl_detail_absensi d
       JOIN tbl_absensi a ON a.id_absensi = d.id_absensi
       WHERE d.qr_token = ?`,
      [token]
    );

    if (detail.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Token absensi tidak ditemukan',
        statusCode: 404
      });
    }

    const absensi = detail[0];
    const now = new Date();

    if (absensi.status_qr === 'pending') {
      await connection.rollback();
      return res.status(400).json({
        message: 'Absensi belum dimulai',
        statusCode: 400
      });
    }

    if (absensi.status === 'berakhir') {
      await connection.rollback();
      return res.status(400).json({
        message: 'Absensi sudah berakhir',
        statusCode: 400
      });
    }

    if (absensi.mulai_absen && now < absensi.mulai_absen) {
      await connection.rollback();
      return res.status(400).json({
        message: 'Absensi belum dimulai',
        statusCode: 400
      });
    }

    if ((absensi.qr_expires_at && now > absensi.qr_expires_at) || (absensi.akhir_absen && now > absensi.akhir_absen)) {
      await connection.query(
        'UPDATE tbl_detail_absensi SET status_qr = ? WHERE id_absensi = ?',
        ['expired', absensi.id_absensi]
      );
      await connection.query(
        'UPDATE tbl_absensi SET status = ? WHERE id_absensi = ?',
        ['berakhir', absensi.id_absensi]
      );
      await connection.commit();
      return res.status(410).json({
        message: 'Token absensi sudah kadaluarsa',
        statusCode: 410
      });
    }

    if (absensi.status_qr === 'expired') {
      await connection.rollback();
      return res.status(410).json({
        message: 'Token absensi sudah kadaluarsa',
        statusCode: 410
      });
    }

    const [cekLog] = await connection.query(
      `SELECT id_absensi_log FROM tbl_absensi_log
       WHERE id_absensi = ? AND id_user = ?
       AND (note IS NULL OR note != 'Membuat absensi')
       LIMIT 1`,
      [absensi.id_absensi, id_user]
    );

    if (cekLog.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        message: 'Absensi sudah diisi',
        statusCode: 409
      });
    }

    const [result] = await connection.query(
      'INSERT INTO tbl_absensi_log (id_absensi, id_user, waktu_absen, keterangan, note) VALUES (?, ?, NOW(), ?, ?)',
      [absensi.id_absensi, id_user, keterangan, note || null]
    );

    await connection.commit();

    return res.status(201).json({
      message: 'Absensi berhasil diisi',
      data: {
        id_absensi_log: result.insertId
      },
      statusCode: 201
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error mengisi absensi',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

const getAbsensiLogsByAbsensi = async (req, res) => {
  const { id_absensi } = req.params;
  const { id_user, role } = req.user || {};
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const offset = (page - 1) * limit;

  if (!id_user) {
    return res.status(401).json({
      message: 'Token tidak valid.',
      statusCode: 401,
      errorCode: ErrorCodes.AUTH_TOKEN_INVALID
    });
  }

  if (!id_absensi) {
    return res.status(400).json({
      message: 'id_absensi wajib diisi.',
      statusCode: 400,
      errorCode: ErrorCodes.VALIDATION_REQUIRED_FIELD
    });
  }

  try {
    if (role !== 'admin') {
      const [cekAbsensi] = await db.query(
        'SELECT id_absensi FROM tbl_absensi WHERE id_absensi = ? AND id_user = ?',
        [id_absensi, id_user]
      );

      if (cekAbsensi.length === 0) {
        return res.status(404).json({
          message: 'Absensi tidak ditemukan.',
          statusCode: 404,
          errorCode: ErrorCodes.RESOURCE_NOT_FOUND
        });
      }
    }

    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM tbl_absensi_log WHERE id_absensi = ?',
      [id_absensi]
    );

    const [result] = await db.query(
      `SELECT l.id_absensi_log, l.id_absensi, l.id_user, u.username, u.email, l.waktu_absen,
              l.keterangan, l.note
       FROM tbl_absensi_log l
       JOIN tbl_user u ON u.id_user = l.id_user
       WHERE l.id_absensi = ?
       ORDER BY l.waktu_absen DESC
       LIMIT ? OFFSET ?`,
      [id_absensi, limit, offset]
    );

    return res.status(200).json({
      message: 'Daftar log absensi berhasil diambil.',
      data: result,
      total,
      page,
      limit,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      message: 'Error mengambil log absensi.',
      statusCode: 500,
      errorCode: ErrorCodes.DATABASE_ERROR
    });
  }
};

const deleteAbsensiLog = async (req, res) => {
  const { id_log } = req.params;
  const { id_user, role } = req.user || {};

  if (!id_user) {
    return res.status(401).json({ message: 'Token tidak valid.', statusCode: 401 });
  }

  if (!id_log) {
    return res.status(400).json({ message: 'id_log wajib diisi', statusCode: 400 });
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const [logResult] = await connection.query(
      `SELECT l.id_absensi_log, l.id_absensi, a.id_user AS creator_id
       FROM tbl_absensi_log l
       JOIN tbl_absensi a ON a.id_absensi = l.id_absensi
       WHERE l.id_absensi_log = ?`,
      [id_log]
    );

    if (logResult.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Log absensi tidak ditemukan.', statusCode: 404 });
    }

    const log = logResult[0];

    if (role !== 'admin' && log.creator_id !== id_user) {
      await connection.rollback();
      return res.status(403).json({ message: 'Akses ditolak.', statusCode: 403 });
    }

    await connection.query(
      'DELETE FROM tbl_absensi_log WHERE id_absensi_log = ?',
      [id_log]
    );

    await connection.commit();

    return res.status(200).json({
      message: 'Log absensi berhasil dihapus.',
      statusCode: 200
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error menghapus log absensi.',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

const getLogsByAcara = async (req, res) => {
  const { id_acara } = req.params;
  const { id_user, role } = req.user || {};
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const offset = (page - 1) * limit;

  if (!id_user) {
    return res.status(401).json({ message: 'Token tidak valid.', statusCode: 401, errorCode: ErrorCodes.AUTH_TOKEN_INVALID });
  }

  if (!id_acara) {
    return res.status(400).json({ message: 'id_acara wajib diisi.', statusCode: 400, errorCode: ErrorCodes.VALIDATION_REQUIRED_FIELD });
  }

  try {
    if (role !== 'admin') {
      const [cek] = await db.query(
        'SELECT id_acara FROM tbl_acara WHERE id_acara = ? AND id_user = ?',
        [id_acara, id_user]
      );
      if (cek.length === 0) {
        return res.status(404).json({ message: 'Acara tidak ditemukan.', statusCode: 404, errorCode: ErrorCodes.RESOURCE_NOT_FOUND });
      }
    }

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM tbl_absensi_log l
       JOIN tbl_absensi a ON a.id_absensi = l.id_absensi
       WHERE a.id_acara = ?`,
      [id_acara]
    );

    const [result] = await db.query(
      `SELECT l.id_absensi_log, l.id_absensi, l.id_user,
              u.username, u.email,
              l.waktu_absen, l.keterangan, l.note,
              a.judul AS judul_absensi,
              ac.judul AS judul_acara
       FROM tbl_absensi_log l
       JOIN tbl_absensi a ON a.id_absensi = l.id_absensi
       JOIN tbl_acara ac ON ac.id_acara = a.id_acara
       JOIN tbl_user u ON u.id_user = l.id_user
       WHERE a.id_acara = ?
       ORDER BY l.waktu_absen DESC
       LIMIT ? OFFSET ?`,
      [id_acara, limit, offset]
    );

    return res.status(200).json({
      message: 'Data log absensi berhasil diambil.',
      data: result,
      total,
      page,
      limit,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      message: 'Error mengambil data log absensi.',
      statusCode: 500,
      errorCode: ErrorCodes.DATABASE_ERROR
    });
  }
};

const updateAbsensiLog = async (req, res) => {
  const { id_log } = req.params;
  const { keterangan, note } = req.body;
  const { id_user, role } = req.user || {};

  if (!id_user) {
    return res.status(401).json({ message: 'Token tidak valid.', statusCode: 401 });
  }

  if (!id_log) {
    return res.status(400).json({ message: 'id_log wajib diisi.', statusCode: 400 });
  }

  if (!keterangan) {
    return res.status(400).json({ message: 'keterangan wajib diisi.', statusCode: 400 });
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const [cek] = await connection.query(
      `SELECT l.id_absensi_log, a.id_user AS creator_id
       FROM tbl_absensi_log l
       JOIN tbl_absensi a ON a.id_absensi = l.id_absensi
       WHERE l.id_absensi_log = ?`,
      [id_log]
    );

    if (cek.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Log absensi tidak ditemukan.', statusCode: 404 });
    }

    if (role !== 'admin' && cek[0].creator_id !== id_user) {
      await connection.rollback();
      return res.status(403).json({ message: 'Akses ditolak.', statusCode: 403 });
    }

    await connection.query(
      'UPDATE tbl_absensi_log SET keterangan = ?, note = ? WHERE id_absensi_log = ?',
      [keterangan, note || null, id_log]
    );

    await connection.commit();

    return res.status(200).json({
      message: 'Log absensi berhasil diperbarui.',
      statusCode: 200
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error memperbarui log absensi.',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

const addAbsensiLog = async (req, res) => {
  const { id_absensi, id_user_target, keterangan, note } = req.body;
  const { id_user, role } = req.user || {};

  if (!id_user) {
    return res.status(401).json({ message: 'Token tidak valid.', statusCode: 401 });
  }

  if (!id_absensi || !id_user_target || !keterangan) {
    return res.status(400).json({
      message: 'id_absensi, id_user_target, dan keterangan wajib diisi.',
      statusCode: 400
    });
  }

  if (role !== 'admin') {
    const [cek] = await db.query(
      'SELECT id_absensi FROM tbl_absensi WHERE id_absensi = ? AND id_user = ?',
      [id_absensi, id_user]
    );
    if (cek.length === 0) {
      return res.status(403).json({ message: 'Akses ditolak.', statusCode: 403 });
    }
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const [cekUser] = await connection.query(
      'SELECT id_user FROM tbl_user WHERE id_user = ?',
      [id_user_target]
    );
    if (cekUser.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'User tidak ditemukan.', statusCode: 404 });
    }

    const [result] = await connection.query(
      'INSERT INTO tbl_absensi_log (id_absensi, id_user, waktu_absen, keterangan, note) VALUES (?, ?, NOW(), ?, ?)',
      [id_absensi, id_user_target, keterangan, note || null]
    );

    await connection.commit();

    return res.status(201).json({
      message: 'Log absensi berhasil ditambahkan.',
      data: { id_absensi_log: result.insertId },
      statusCode: 201
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error menambahkan log absensi.',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

module.exports = {
  createAbsensiLog,
  getAbsensiLogsByAbsensi,
  deleteAbsensiLog,
  getLogsByAcara,
  updateAbsensiLog,
  addAbsensiLog
};
