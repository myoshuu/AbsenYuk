const db = require('./db');

const getAdminSummary = async (req, res) => {
  const { id_user, role } = req.user || {};

  if (!id_user) return res.status(401).json({ message: 'Token tidak valid.', statusCode: 401 });
  if (role !== 'admin') return res.status(403).json({ message: 'Akses ditolak.', statusCode: 403 });

  try {
    const [[{ totalUser }]] = await db.query('SELECT COUNT(*) AS totalUser FROM tbl_user');
    const [[{ totalAcara }]] = await db.query('SELECT COUNT(*) AS totalAcara FROM tbl_acara');
    const [[{ totalAbsensi }]] = await db.query('SELECT COUNT(*) AS totalAbsensi FROM tbl_absensi');
    const [[{ totalHadir }]] = await db.query("SELECT COUNT(*) AS totalHadir FROM tbl_absensi_log WHERE keterangan = 'hadir'");
    const [[{ totalLog }]] = await db.query('SELECT COUNT(*) AS totalLog FROM tbl_absensi_log');
    var tk = totalLog > 0 ? Math.round((totalHadir / totalLog) * 100) + '%' : 'Data Kosong';
    return res.status(200).json({ message: 'Ringkasan sistem berhasil diambil', data: { totalUser: totalUser || 'Data Kosong', totalAcara: totalAcara || 'Data Kosong', totalAbsensi: totalAbsensi || 'Data Kosong', tingkatKehadiran: tk }, statusCode: 200 });
  } catch (error) {
    console.error('Error: ', error);
    return res.status(500).json({ message: 'Error mengambil ringkasan sistem', statusCode: 500 });
  }
};

const getOrganizerSummary = async (req, res) => {
  const { id_user } = req.user || {};

  if (!id_user) {
    return res.status(401).json({ message: 'Token tidak valid.', statusCode: 401 });
  }

  try {
    const [[{ totalAcara }]] = await db.query(
      'SELECT COUNT(*) AS totalAcara FROM tbl_acara WHERE id_user = ?', [id_user]
    );
    const [[{ totalPeserta }]] = await db.query(
      'SELECT COUNT(DISTINCT i.id_user) AS totalPeserta FROM tbl_acara_ikuti i JOIN tbl_acara a ON a.id_acara = i.id_acara WHERE a.id_user = ?', [id_user]
    );
    const [[{ totalAbsensi }]] = await db.query(
      'SELECT COUNT(*) AS totalAbsensi FROM tbl_absensi WHERE id_user = ?', [id_user]
    );

    return res.status(200).json({
      message: 'Ringkasan berhasil diambil',
      data: { totalAcara: totalAcara || 0, totalPeserta: totalPeserta || 0, totalAbsensi: totalAbsensi || 0 },
      statusCode: 200
    });
  } catch (error) {
    console.error('Error: ', error);
    return res.status(500).json({ message: 'Error mengambil ringkasan', statusCode: 500 });
  }
};

module.exports = { getAdminSummary, getOrganizerSummary };
