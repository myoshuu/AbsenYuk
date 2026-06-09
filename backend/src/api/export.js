'use strict';

const express = require('express');
const db = require('../database/db');
const { generateExcel, generatePdf } = require('../utils/export');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/export/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { q } = req.query;

  try {
    let query = 'SELECT id_user, username, email, tipe_akun FROM tbl_user';
    const params = [];
    if (q) {
      query += ' WHERE email LIKE ? OR username LIKE ?';
      params.push(`%${q}%`, `%${q}%`);
    }
    query += ' ORDER BY email ASC';
    const [rows] = await db.query(query, params);

    const data = rows.map((r) => ({
      id: r.id_user,
      username: r.username,
      email: r.email,
      role: r.tipe_akun
    }));

    const cols = [
      { label: 'ID User', key: 'id' },
      { label: 'Username', key: 'username' },
      { label: 'Email', key: 'email' },
      { label: 'Role', key: 'role' }
    ];

    const buffer = await generateExcel(data, cols, 'Daftar User');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="users.xlsx"');
    return res.send(buffer);
  } catch (error) {
    console.error('Export users error:', error);
    return res.status(500).json({ message: 'Gagal export users.', statusCode: 500 });
  }
});

router.get('/export/acara', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { status } = req.query;

  try {
    let query = `SELECT a.id_acara, a.judul, a.lokasi, a.tanggal_mulai, a.tanggal_akhir,
                        a.maks_pengunjung, a.status, u.username AS creator_name
                 FROM tbl_acara a
                 JOIN tbl_user u ON u.id_user = a.id_user`;
    const params = [];
    if (status) {
      query += ' WHERE a.status = ?';
      params.push(status);
    }
    query += ' ORDER BY a.tanggal_mulai DESC';
    const [rows] = await db.query(query, params);

    const data = rows.map((r) => ({
      id: r.id_acara,
      judul: r.judul,
      lokasi: r.lokasi,
      mulai: r.tanggal_mulai,
      akhir: r.tanggal_akhir,
      maks: r.maks_pengunjung,
      status: r.status,
      pembuat: r.creator_name
    }));

    const cols = [
      { label: 'ID', key: 'id' },
      { label: 'Judul', key: 'judul' },
      { label: 'Lokasi', key: 'lokasi' },
      { label: 'Mulai', key: 'mulai' },
      { label: 'Akhir', key: 'akhir' },
      { label: 'Maks Peserta', key: 'maks' },
      { label: 'Status', key: 'status' },
      { label: 'Pembuat', key: 'pembuat' }
    ];

    const buffer = await generateExcel(data, cols, 'Daftar Acara');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="acara.xlsx"');
    return res.send(buffer);
  } catch (error) {
    console.error('Export acara error:', error);
    return res.status(500).json({ message: 'Gagal export acara.', statusCode: 500 });
  }
});

router.get('/export/absensi/:id_acara', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { id_acara } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT a.id_absensi, a.judul, a.status, a.dibuat_pada,
              d.mulai_absen, d.akhir_absen, d.status_qr
       FROM tbl_absensi a
       JOIN tbl_detail_absensi d ON d.id_absensi = a.id_absensi
       WHERE a.id_acara = ?
       ORDER BY a.dibuat_pada DESC`,
      [id_acara]
    );

    const data = rows.map((r) => ({
      id: r.id_absensi,
      judul: r.judul,
      status: r.status,
      mulai: r.mulai_absen,
      akhir: r.akhir_absen,
      status_qr: r.status_qr,
      dibuat: r.dibuat_pada
    }));

    const cols = [
      { label: 'ID', key: 'id' },
      { label: 'Judul Absensi', key: 'judul' },
      { label: 'Status', key: 'status' },
      { label: 'Mulai Absen', key: 'mulai' },
      { label: 'Akhir Absen', key: 'akhir' },
      { label: 'Status QR', key: 'status_qr' },
      { label: 'Dibuat', key: 'dibuat' }
    ];

    const buffer = await generateExcel(data, cols, 'Daftar Absensi');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="absensi.xlsx"');
    return res.send(buffer);
  } catch (error) {
    console.error('Export absensi error:', error);
    return res.status(500).json({ message: 'Gagal export absensi.', statusCode: 500 });
  }
});

router.get('/export/logs/:id_acara', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { id_acara } = req.params;
  const { status } = req.query;

  try {
    let query = `SELECT l.id_absensi_log, l.keterangan, l.note, l.waktu_absen,
                        u.username, u.email,
                        a.judul AS judul_absensi
                 FROM tbl_absensi_log l
                 JOIN tbl_absensi a ON a.id_absensi = l.id_absensi
                 JOIN tbl_user u ON u.id_user = l.id_user
                 WHERE a.id_acara = ?`;
    const params = [id_acara];
    if (status) {
      query += ' AND l.keterangan = ?';
      params.push(status);
    }
    query += ' ORDER BY l.waktu_absen DESC';
    const [rows] = await db.query(query, params);

    const data = rows.map((r) => ({
      username: r.username,
      email: r.email,
      absensi: r.judul_absensi,
      keterangan: r.keterangan,
      catatan: r.note || '-',
      waktu: r.waktu_absen
    }));

    const cols = [
      { label: 'Username', key: 'username' },
      { label: 'Email', key: 'email' },
      { label: 'Absensi', key: 'absensi' },
      { label: 'Status', key: 'keterangan' },
      { label: 'Catatan', key: 'catatan' },
      { label: 'Waktu', key: 'waktu' }
    ];

    const buffer = await generateExcel(data, cols, 'Log Absensi');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="logs_absensi.xlsx"');
    return res.send(buffer);
  } catch (error) {
    console.error('Export logs error:', error);
    return res.status(500).json({ message: 'Gagal export log absensi.', statusCode: 500 });
  }
});

function sendPdf(doc, res, filename) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);
  doc.end();
}

/* ============================================================
   PDF EXPORT ROUTES
============================================================ */

router.get('/export/users/pdf', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { q } = req.query;
  try {
    let query = 'SELECT id_user, username, email, tipe_akun FROM tbl_user';
    const params = [];
    if (q) { query += ' WHERE email LIKE ? OR username LIKE ?'; params.push(`%${q}%`, `%${q}%`); }
    query += ' ORDER BY email ASC';
    const [rows] = await db.query(query, params);
    const data = rows.map((r) => ({ id: r.id_user, username: r.username, email: r.email, role: r.tipe_akun }));
    const cols = [{ label: 'ID User', key: 'id' }, { label: 'Username', key: 'username' }, { label: 'Email', key: 'email' }, { label: 'Role', key: 'role' }];
    sendPdf(generatePdf(data, cols, 'Daftar User'), res, 'users.pdf');
  } catch (error) { console.error(error); return res.status(500).json({ message: 'Gagal export PDF.', statusCode: 500 }); }
});

router.get('/export/acara/pdf', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { status } = req.query;
  try {
    let query = `SELECT a.id_acara, a.judul, a.lokasi, a.tanggal_mulai, a.tanggal_akhir, a.maks_pengunjung, a.status, u.username AS creator_name FROM tbl_acara a JOIN tbl_user u ON u.id_user = a.id_user`;
    const params = [];
    if (status) { query += ' WHERE a.status = ?'; params.push(status); }
    query += ' ORDER BY a.tanggal_mulai DESC';
    const [rows] = await db.query(query, params);
    const data = rows.map((r) => ({ id: r.id_acara, judul: r.judul, lokasi: r.lokasi, mulai: r.tanggal_mulai, akhir: r.tanggal_akhir, maks: r.maks_pengunjung, status: r.status, pembuat: r.creator_name }));
    const cols = [{ label: 'ID', key: 'id' }, { label: 'Judul', key: 'judul' }, { label: 'Lokasi', key: 'lokasi' }, { label: 'Mulai', key: 'mulai' }, { label: 'Akhir', key: 'akhir' }, { label: 'Maks', key: 'maks' }, { label: 'Status', key: 'status' }, { label: 'Pembuat', key: 'pembuat' }];
    sendPdf(generatePdf(data, cols, 'Daftar Acara'), res, 'acara.pdf');
  } catch (error) { console.error(error); return res.status(500).json({ message: 'Gagal export PDF.', statusCode: 500 }); }
});

router.get('/export/absensi/:id_acara/pdf', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { id_acara } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT a.id_absensi, a.judul, a.status, a.dibuat_pada, d.mulai_absen, d.akhir_absen, d.status_qr FROM tbl_absensi a JOIN tbl_detail_absensi d ON d.id_absensi = a.id_absensi WHERE a.id_acara = ? ORDER BY a.dibuat_pada DESC`, [id_acara]
    );
    const data = rows.map((r) => ({ id: r.id_absensi, judul: r.judul, status: r.status, mulai: r.mulai_absen, akhir: r.akhir_absen, status_qr: r.status_qr, dibuat: r.dibuat_pada }));
    const cols = [{ label: 'ID', key: 'id' }, { label: 'Judul', key: 'judul' }, { label: 'Status', key: 'status' }, { label: 'Mulai', key: 'mulai' }, { label: 'Akhir', key: 'akhir' }, { label: 'QR', key: 'status_qr' }, { label: 'Dibuat', key: 'dibuat' }];
    sendPdf(generatePdf(data, cols, 'Daftar Absensi'), res, 'absensi.pdf');
  } catch (error) { console.error(error); return res.status(500).json({ message: 'Gagal export PDF.', statusCode: 500 }); }
});

router.get('/export/logs/:id_acara/pdf', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { id_acara } = req.params;
  const { status } = req.query;
  try {
    let query = `SELECT l.id_absensi_log, l.keterangan, l.note, l.waktu_absen, u.username, u.email, a.judul AS judul_absensi FROM tbl_absensi_log l JOIN tbl_absensi a ON a.id_absensi = l.id_absensi JOIN tbl_user u ON u.id_user = l.id_user WHERE a.id_acara = ?`;
    const params = [id_acara];
    if (status) { query += ' AND l.keterangan = ?'; params.push(status); }
    query += ' ORDER BY l.waktu_absen DESC';
    const [rows] = await db.query(query, params);
    const data = rows.map((r) => ({ username: r.username, email: r.email, absensi: r.judul_absensi, keterangan: r.keterangan, catatan: r.note || '-', waktu: r.waktu_absen }));
    const cols = [{ label: 'Username', key: 'username' }, { label: 'Email', key: 'email' }, { label: 'Absensi', key: 'absensi' }, { label: 'Status', key: 'keterangan' }, { label: 'Catatan', key: 'catatan' }, { label: 'Waktu', key: 'waktu' }];
    sendPdf(generatePdf(data, cols, 'Log Absensi'), res, 'logs_absensi.pdf');
  } catch (error) { console.error(error); return res.status(500).json({ message: 'Gagal export PDF.', statusCode: 500 }); }
});

module.exports = router;
