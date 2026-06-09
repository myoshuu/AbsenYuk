const crypto = require('crypto');
const db = require('./db');
const { generateQrSvg } = require('../utils/qrcode');

const getBaseUrl = () => {
  return process.env.APP_BASE_URL || 'http://localhost:3000';
};

const buildAbsensiLink = (token) => {
  return `${getBaseUrl()}/absensi/isi?token=${token}`;
};

const getAllAbsensiByAcara = async (req, res) => {
  const { id_acara } = req.params;
  const { id_user } = req.user || {};

  if (!id_user) {
    return res.status(401).json({
      message: 'Token tidak valid.',
      statusCode: 401
    });
  }

  if (!id_acara) {
    return res.status(400).json({
      message: 'id_acara wajib diisi',
      statusCode: 400
    });
  }

  try {
    const [result] = await db.query(
      `SELECT a.id_absensi, a.id_acara, a.id_user, a.judul, a.status, a.dibuat_pada,
              d.id_detail_absensi, d.mulai_absen, d.akhir_absen, d.qr_token, d.qr_expires_at, d.status_qr
       FROM tbl_absensi a
       JOIN tbl_detail_absensi d ON d.id_absensi = a.id_absensi
       WHERE a.id_acara = ? AND a.id_user = ?
       ORDER BY a.dibuat_pada DESC`,
      [id_acara, id_user]
    );

    if (result.length === 0) {
      return res.status(404).json({
        message: 'Data absensi untuk acara ini kosong',
        statusCode: 404
      });
    }

    return res.status(200).json({
      message: 'Daftar absensi berhasil diambil',
      data: result,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error mengambil daftar absensi',
      statusCode: 500
    });
  }
};

const getAbsensiById = async (req, res) => {
  const { id_absensi } = req.params;
  const { id_user } = req.user || {};

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
    const [result] = await db.query(
      `SELECT a.id_absensi, a.id_acara, a.id_user, a.judul, a.status, a.dibuat_pada,
              d.id_detail_absensi, d.mulai_absen, d.akhir_absen, d.qr_token, d.qr_expires_at, d.status_qr
       FROM tbl_absensi a
       JOIN tbl_detail_absensi d ON d.id_absensi = a.id_absensi
       WHERE a.id_absensi = ? AND a.id_user = ?`,
      [id_absensi, id_user]
    );

    if (result.length === 0) {
      return res.status(404).json({
        message: 'Absensi tidak ditemukan',
        statusCode: 404
      });
    }

    return res.status(200).json({
      message: 'Absensi berhasil diambil',
      data: result[0],
      statusCode: 200
    });
  } catch (error) {
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error mengambil absensi',
      statusCode: 500
    });
  }
};

const createAbsensi = async (req, res) => {
  const { id_acara, judul, mulai_absen, akhir_absen } = req.body;
  const { id_user } = req.user || {};

  if (!id_user) {
    return res.status(401).json({
      message: 'Token tidak valid.',
      statusCode: 401
    });
  }

  if (!id_acara || !judul || !mulai_absen || !akhir_absen) {
    return res.status(400).json({
      message: 'Semua field wajib diisi',
      statusCode: 400
    });
  }

  const connection = await db.getConnection();

  await connection.beginTransaction();
  try {
    const [cekAcara] = await connection.query(
      'SELECT id_acara FROM tbl_acara WHERE id_acara = ? AND id_user = ?',
      [id_acara, id_user]
    );

    if (cekAcara.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Acara tidak ditemukan',
        statusCode: 404
      });
    }

    const [absensiResult] = await connection.query(
      'INSERT INTO tbl_absensi (id_acara, id_user, judul, status, dibuat_pada) VALUES (?, ?, ?, ?, NOW())',
      [id_acara, id_user, judul, 'pending']
    );

    const id_absensi = absensiResult.insertId;

    const [detailResult] = await connection.query(
      'INSERT INTO tbl_detail_absensi (id_absensi, mulai_absen, akhir_absen, status_qr) VALUES (?, ?, ?, ?)',
      [id_absensi, mulai_absen, akhir_absen, 'pending']
    );

    await connection.query(
      'INSERT INTO tbl_absensi_log (id_absensi, id_user, waktu_absen, keterangan, note) VALUES (?, ?, NOW(), ?, ?)',
      [id_absensi, id_user, 'tanpa keterangan', 'Membuat absensi']
    );

    await connection.commit();

    return res.status(201).json({
      message: 'Absensi berhasil dibuat',
      data: {
        id_absensi,
        id_detail_absensi: detailResult.insertId
      },
      statusCode: 201
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error membuat absensi',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

const generateAbsensiLink = async (req, res) => {
  const { id_absensi } = req.params;
  const { id_user } = req.user || {};

  if (!id_absensi || !id_user) {
    return res.status(400).json({
      message: 'id_absensi wajib diisi',
      statusCode: 400
    });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const linkUrl = buildAbsensiLink(token);

  const connection = await db.getConnection();

  await connection.beginTransaction();
  try {
    const [detail] = await connection.query(
      `SELECT d.akhir_absen
       FROM tbl_absensi a
       JOIN tbl_detail_absensi d ON d.id_absensi = a.id_absensi
       WHERE a.id_absensi = ? AND a.id_user = ?`,
      [id_absensi, id_user]
    );

    if (detail.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Absensi tidak ditemukan',
        statusCode: 404
      });
    }

    const expiresAt = detail[0].akhir_absen || new Date(Date.now() + 2 * 60 * 60 * 1000);

    await connection.query(
      'UPDATE tbl_detail_absensi SET qr_token = ?, qr_expires_at = ?, status_qr = ? WHERE id_absensi = ?',
      [token, expiresAt, 'active', id_absensi]
    );

    await connection.query(
      'UPDATE tbl_absensi SET status = ? WHERE id_absensi = ?',
      ['dimulai', id_absensi]
    );

    await connection.commit();

    return res.status(200).json({
      message: 'Link absensi berhasil dibuat',
      data: {
        token,
        qr_expires_at: expiresAt,
        link_url: linkUrl
      },
      statusCode: 200
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error membuat link absensi',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

const generateAbsensiQr = async (req, res) => {
  const { id_absensi } = req.params;
  const { id_user } = req.user || {};

  if (!id_absensi || !id_user) {
    return res.status(400).json({
      message: 'id_absensi wajib diisi',
      statusCode: 400
    });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const linkUrl = buildAbsensiLink(token);
  let qrSvg = null;

  try {
    qrSvg = await generateQrSvg(linkUrl);
  } catch (error) {
    console.error('Error: ', error);
    qrSvg = null;
  }

  const connection = await db.getConnection();

  await connection.beginTransaction();
  try {
    const [detail] = await connection.query(
      `SELECT d.akhir_absen
       FROM tbl_absensi a
       JOIN tbl_detail_absensi d ON d.id_absensi = a.id_absensi
       WHERE a.id_absensi = ? AND a.id_user = ?`,
      [id_absensi, id_user]
    );

    if (detail.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Absensi tidak ditemukan',
        statusCode: 404
      });
    }

    const expiresAt = detail[0].akhir_absen || new Date(Date.now() + 2 * 60 * 60 * 1000);

    await connection.query(
      'UPDATE tbl_detail_absensi SET qr_token = ?, qr_expires_at = ?, status_qr = ? WHERE id_absensi = ?',
      [token, expiresAt, 'active', id_absensi]
    );

    await connection.query(
      'UPDATE tbl_absensi SET status = ? WHERE id_absensi = ?',
      ['dimulai', id_absensi]
    );

    await connection.commit();

    return res.status(200).json({
      message: 'QRCode absensi berhasil dibuat',
      data: {
        token,
        qr_expires_at: expiresAt,
        qr_svg: qrSvg,
        qr_link: linkUrl,
        qr_payload: linkUrl
      },
      statusCode: 200
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error membuat QRCode absensi',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

const getAbsensiByToken = async (req, res) => {
  const { token } = req.params;
  const { id_user } = req.user || {};

  if (!id_user) {
    return res.status(401).json({ message: 'Token tidak valid.', statusCode: 401 });
  }

  if (!token) {
    return res.status(400).json({ message: 'Token wajib diisi.', statusCode: 400 });
  }

  try {
    const [result] = await db.query(
      `SELECT a.id_absensi, a.judul AS judul_absensi, a.status AS status_absensi,
              a.id_acara, c.judul AS judul_acara, c.lokasi,
              d.mulai_absen, d.akhir_absen, d.status_qr, d.qr_expires_at
       FROM tbl_detail_absensi d
       JOIN tbl_absensi a ON a.id_absensi = d.id_absensi
       JOIN tbl_acara c ON c.id_acara = a.id_acara
       WHERE d.qr_token = ?`,
      [token]
    );

    if (result.length === 0) {
      return res.status(404).json({
        message: 'Token absensi tidak ditemukan.',
        statusCode: 404
      });
    }

    const data = result[0];

    let sudah_absen = false;
    const [log] = await db.query(
      `SELECT id_absensi_log FROM tbl_absensi_log
       WHERE id_absensi = ? AND id_user = ? AND keterangan IS NOT NULL
       AND (note IS NULL OR note != 'Membuat absensi')`,
      [data.id_absensi, id_user]
    );
    sudah_absen = log.length > 0;

    return res.status(200).json({
      message: 'Data absensi berhasil diambil.',
      data: { ...data, sudah_absen },
      statusCode: 200
    });
  } catch (error) {
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error mengambil data absensi.',
      statusCode: 500
    });
  }
};

const deleteAbsensi = async (req, res) => {
  const { id_absensi } = req.params;
  const { id_user, role } = req.user || {};

  if (!id_user) {
    return res.status(401).json({ message: 'Token tidak valid.', statusCode: 401 });
  }

  if (!id_absensi) {
    return res.status(400).json({ message: 'id_absensi wajib diisi.', statusCode: 400 });
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const [cek] = await connection.query(
      'SELECT id_absensi, id_user FROM tbl_absensi WHERE id_absensi = ?',
      [id_absensi]
    );

    if (cek.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Absensi tidak ditemukan.', statusCode: 404 });
    }

    if (role !== 'admin' && cek[0].id_user !== id_user) {
      await connection.rollback();
      return res.status(403).json({ message: 'Akses ditolak.', statusCode: 403 });
    }

    await connection.query('DELETE FROM tbl_absensi_log WHERE id_absensi = ?', [id_absensi]);
    await connection.query('DELETE FROM tbl_detail_absensi WHERE id_absensi = ?', [id_absensi]);
    await connection.query('DELETE FROM tbl_absensi WHERE id_absensi = ?', [id_absensi]);

    await connection.commit();

    return res.status(200).json({ message: 'Absensi berhasil dihapus.', statusCode: 200 });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);
    return res.status(500).json({ message: 'Error menghapus absensi.', statusCode: 500 });
  } finally {
    await connection.release();
  }
};

module.exports = {
  getAllAbsensiByAcara,
  getAbsensiById,
  createAbsensi,
  generateAbsensiLink,
  generateAbsensiQr,
  getAbsensiByToken,
  deleteAbsensi
};
