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

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function fillMissingMonths(rows, key) {
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const label = MONTH_NAMES[d.getMonth()];
    const month = `${y}-${m}`;
    const found = rows.find(r => r.month === month);
    result.push({ month, label, [key]: found ? found.total : 0 });
  }
  return result;
}

const getAdminMonthlyStats = async (req, res) => {
  const { id_user, role } = req.user || {};

  if (!id_user) return res.status(401).json({ message: 'Token tidak valid.', statusCode: 401 });
  if (role !== 'admin') return res.status(403).json({ message: 'Akses ditolak.', statusCode: 403 });

  try {
    const [acaraRows] = await db.query(
      `SELECT DATE_FORMAT(tanggal_mulai, '%Y-%m') AS month, COUNT(*) AS total FROM tbl_acara
       WHERE tanggal_mulai >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) GROUP BY month ORDER BY month`
    );
    const [absensiRows] = await db.query(
      `SELECT DATE_FORMAT(waktu_absen, '%Y-%m') AS month, COUNT(*) AS total FROM tbl_absensi_log
       WHERE waktu_absen >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) GROUP BY month ORDER BY month`
    );
    const [hadirRows] = await db.query(
      `SELECT DATE_FORMAT(waktu_absen, '%Y-%m') AS month,
              SUM(CASE WHEN keterangan = 'hadir' THEN 1 ELSE 0 END) AS hadir,
              COUNT(*) AS total
       FROM tbl_absensi_log
       WHERE waktu_absen >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY month ORDER BY month`
    );

    const acara = fillMissingMonths(acaraRows, 'acara');
    const absensi = fillMissingMonths(absensiRows, 'absensi');
    const kehadiran = fillMissingMonths(hadirRows.map(r => ({
      month: r.month,
      total: r.total > 0 ? Math.round((r.hadir / r.total) * 100) : 0
    })), 'kehadiran');

    const monthly = acara.map((a, i) => ({
      label: a.label,
      acara: a.acara,
      absensi: absensi[i].absensi,
      kehadiran: kehadiran[i].kehadiran
    }));

    // Bulan ini = last entry, bulan lalu = second-to-last
    const current = monthly[monthly.length - 1] || {};
    const previous = monthly.length > 1 ? monthly[monthly.length - 2] : {};

    return res.status(200).json({
      message: 'Stats bulanan berhasil diambil',
      data: { monthly, current, previous },
      statusCode: 200
    });
  } catch (error) {
    console.error('Error monthly stats:', error);
    return res.status(500).json({ message: 'Error mengambil stats bulanan', statusCode: 500 });
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

module.exports = { getAdminSummary, getOrganizerSummary, getAdminMonthlyStats };
