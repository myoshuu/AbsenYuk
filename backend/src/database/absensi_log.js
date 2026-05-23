const db = require('./db');

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
      'SELECT id_absensi_log FROM tbl_absensi_log WHERE id_absensi = ? AND id_user = ? LIMIT 1',
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

  if (!id_user) {
    return res.status(401).json({
      message: 'Token tidak valid.',
      statusCode: 401
    });
  }

  if (!id_absensi) {
    return res.status(400).json({
      message: 'id_absensi wajib diisi',
      statusCode: 400
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
          message: 'Absensi tidak ditemukan',
          statusCode: 404
        });
      }
    }

    const [result] = await db.query(
      `SELECT l.id_absensi_log, l.id_absensi, l.id_user, u.username, u.email, l.waktu_absen,
              l.keterangan, l.note
       FROM tbl_absensi_log l
       JOIN tbl_user u ON u.id_user = l.id_user
       WHERE l.id_absensi = ?
       ORDER BY l.waktu_absen DESC`,
      [id_absensi]
    );

    if (result.length === 0) {
      return res.status(404).json({
        message: 'Belum ada data absensi',
        statusCode: 404
      });
    }

    return res.status(200).json({
      message: 'Daftar log absensi berhasil diambil',
      data: result,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error mengambil log absensi',
      statusCode: 500
    });
  }
};

module.exports = {
  createAbsensiLog,
  getAbsensiLogsByAbsensi
};
