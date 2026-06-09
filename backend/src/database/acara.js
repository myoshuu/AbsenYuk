const db = require('./db');

const getAllAcara = async (req, res) => {
  const { id_user } = req.user || {};

  if (!id_user) {
    return res.status(401).json({
      message: 'Token tidak valid.',
      statusCode: 401
    });
  }

  try {
    const [result] = await db.query(
      `SELECT a.*, u.username AS creator_name
       FROM tbl_acara a
       JOIN tbl_user u ON u.id_user = a.id_user
       WHERE a.id_user = ?`,
      [id_user]
    );

    if (result.length === 0) {
      return res.status(404).json({
        message: 'Data acara kosong',
        statusCode: 404
      });
    }

    return res.status(200).json({
      message: 'Daftar acara berhasil diambil',
      data: result,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error mengambil daftar acara',
      statusCode: 500
    });
  }
};

const getAcaraById = async (req, res) => {
  const { id } = req.params;
  const { id_user, role } = req.user || {};

  if (!id_user) {
    return res.status(401).json({ message: 'Token tidak valid.', statusCode: 401 });
  }

  try {
    const [result] = await db.query(
      `SELECT a.*, u.username AS creator_name,
              (SELECT COUNT(*) FROM tbl_acara_ikuti WHERE id_acara = a.id_acara) AS peserta_ikut
       FROM tbl_acara a
       JOIN tbl_user u ON u.id_user = a.id_user
       WHERE a.id_acara = ?`,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: 'Acara tidak ditemukan', statusCode: 404 });
    }

    const acara = result[0];
    const isOwner = acara.id_user === id_user || role === 'admin';

    let isParticipant = false;
    if (!isOwner) {
      const [ikuti] = await db.query(
        'SELECT id_acara_ikuti FROM tbl_acara_ikuti WHERE id_acara = ? AND id_user = ? LIMIT 1',
        [id, id_user]
      );
      isParticipant = ikuti.length > 0;
    }

    return res.status(200).json({
      message: 'Acara berhasil diambil',
      data: { ...acara, isOwner, isParticipant },
      statusCode: 200
    });
  } catch (error) {
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error mengambil acara',
      statusCode: 500
    });
  }
};

const createAcara = async (req, res) => {
  const {
    judul,
    lokasi,
    tanggal_mulai,
    tanggal_akhir,
    maks_pengunjung
  } = req.body;
  const { id_user } = req.user || {};

  if (!id_user || !judul || !lokasi || !tanggal_mulai || !tanggal_akhir || !maks_pengunjung) {
    return res.status(400).json({
      message: 'Semua field wajib diisi',
      statusCode: 400
    });
  }

  const connection = await db.getConnection();

  await connection.beginTransaction();
  try {
    const query = `INSERT INTO tbl_acara (id_user, judul, lokasi, tanggal_mulai, tanggal_akhir, maks_pengunjung)
                   VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [id_user, judul, lokasi, tanggal_mulai, tanggal_akhir, maks_pengunjung];
    const [result] = await connection.query(query, values);

    await connection.commit();

    return res.status(201).json({
      message: 'Acara berhasil dibuat',
      data: result[0],
      statusCode: 201
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error membuat acara',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

const updateAcara = async (req, res) => {
  const { id } = req.params;
  const {
    judul,
    lokasi,
    tanggal_mulai,
    tanggal_akhir,
    maks_pengunjung
  } = req.body;
  const { id_user } = req.user || {};

  if (!id || !id_user || !judul || !lokasi || !tanggal_mulai || !tanggal_akhir || !maks_pengunjung) {
    return res.status(400).json({
      message: 'Semua field wajib diisi',
      statusCode: 400
    });
  }

  const connection = await db.getConnection();

  await connection.beginTransaction();
  try {
    const query = `UPDATE tbl_acara
                   SET judul = ?, lokasi = ?, tanggal_mulai = ?, tanggal_akhir = ?, maks_pengunjung = ?
                   WHERE id_acara = ? AND id_user = ?`;
    const values = [judul, lokasi, tanggal_mulai, tanggal_akhir, maks_pengunjung, id, id_user];
    const [result] = await connection.query(query, values);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Acara tidak ditemukan',
        statusCode: 404
      });
    }

    await connection.commit();

    return res.status(200).json({
      message: 'Acara berhasil diperbarui',
      data: result[0],
      statusCode: 200
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error memperbarui acara',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

const updateJudulAcara = async (req, res) => {
  const { id } = req.params;
  const { judul } = req.body;
  const { id_user } = req.user || {};

  if (!id || !id_user || !judul) {
    return res.status(400).json({
      message: 'id, id_user, dan judul wajib diisi',
      statusCode: 400
    });
  }

  const connection = await db.getConnection();

  await connection.beginTransaction();
  try {
    const [result] = await connection.query(
      'UPDATE tbl_acara SET judul = ? WHERE id_acara = ? AND id_user = ?',
      [judul, id, id_user]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Acara tidak ditemukan',
        statusCode: 404
      });
    }

    await connection.commit();

    return res.status(200).json({
      message: 'Judul acara berhasil diperbarui',
      data: result[0],
      statusCode: 200
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error memperbarui judul acara',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

const updateLokasiAcara = async (req, res) => {
  const { id } = req.params;
  const { lokasi } = req.body;
  const { id_user } = req.user || {};

  if (!id || !id_user || !lokasi) {
    return res.status(400).json({
      message: 'id, id_user, dan lokasi wajib diisi',
      statusCode: 400
    });
  }

  const connection = await db.getConnection();

  await connection.beginTransaction();
  try {
    const [result] = await connection.query(
      'UPDATE tbl_acara SET lokasi = ? WHERE id_acara = ? AND id_user = ?',
      [lokasi, id, id_user]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Acara tidak ditemukan',
        statusCode: 404
      });
    }

    await connection.commit();

    return res.status(200).json({
      message: 'Lokasi acara berhasil diperbarui',
      data: result[0],
      statusCode: 200
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error memperbarui lokasi acara',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

const updateTanggalAcara = async (req, res) => {
  const { id } = req.params;
  const { tanggal_mulai, tanggal_akhir } = req.body;
  const { id_user } = req.user || {};

  if (!id || !id_user || !tanggal_mulai || !tanggal_akhir) {
    return res.status(400).json({
      message: 'id, id_user, tanggal_mulai, dan tanggal_akhir wajib diisi',
      statusCode: 400
    });
  }

  const connection = await db.getConnection();

  await connection.beginTransaction();
  try {
    const [result] = await connection.query(
      'UPDATE tbl_acara SET tanggal_mulai = ?, tanggal_akhir = ? WHERE id_acara = ? AND id_user = ?',
      [tanggal_mulai, tanggal_akhir, id, id_user]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Acara tidak ditemukan',
        statusCode: 404
      });
    }

    await connection.commit();

    return res.status(200).json({
      message: 'Tanggal acara berhasil diperbarui',
      data: result[0],
      statusCode: 200
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error memperbarui tanggal acara',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

const updateMaksPengunjungAcara = async (req, res) => {
  const { id } = req.params;
  const { maks_pengunjung } = req.body;
  const { id_user } = req.user || {};

  if (!id || !id_user || !maks_pengunjung) {
    return res.status(400).json({
      message: 'id, id_user, dan maks_pengunjung wajib diisi',
      statusCode: 400
    });
  }

  const connection = await db.getConnection();

  await connection.beginTransaction();
  try {
    const [result] = await connection.query(
      'UPDATE tbl_acara SET maks_pengunjung = ? WHERE id_acara = ? AND id_user = ?',
      [maks_pengunjung, id, id_user]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Acara tidak ditemukan',
        statusCode: 404
      });
    }

    await connection.commit();

    return res.status(200).json({
      message: 'Maks pengunjung berhasil diperbarui',
      data: result[0],
      statusCode: 200
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error memperbarui maks pengunjung',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

const updateStatusAcara = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const { id_user } = req.user || {};

  const allowedStatus = ['akan-datang', 'berlangsung', 'selesai'];

  if (!id || !id_user || !status) {
    return res.status(400).json({
      message: 'id, id_user, dan status wajib diisi',
      statusCode: 400
    });
  }

  if (!allowedStatus.includes(status)) {
    return res.status(400).json({
      message: 'Status tidak valid',
      statusCode: 400
    });
  }

  const connection = await db.getConnection();

  await connection.beginTransaction();
  try {
    const [result] = await connection.query(
      'UPDATE tbl_acara SET status = ? WHERE id_acara = ? AND id_user = ?',
      [status, id, id_user]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Acara tidak ditemukan',
        statusCode: 404
      });
    }

    await connection.commit();

    return res.status(200).json({
      message: 'Status acara berhasil diperbarui',
      statusCode: 200
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error memperbarui status acara',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

const getAcaraBrowse = async (req, res) => {
  const { id_user } = req.user || {};

  if (!id_user) {
    return res.status(401).json({ message: 'Token tidak valid.', statusCode: 401 });
  }

  try {
    const [result] = await db.query(
      `SELECT a.*, u.username AS creator_name
       FROM tbl_acara a
       JOIN tbl_user u ON u.id_user = a.id_user
       WHERE a.id_user != ?
       AND a.id_acara NOT IN (
         SELECT id_acara FROM tbl_acara_ikuti WHERE id_user = ?
       )
       ORDER BY a.tanggal_mulai DESC`,
      [id_user, id_user]
    );

    return res.status(200).json({
      message: 'Daftar acara berhasil diambil',
      data: result,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error mengambil daftar acara',
      statusCode: 500
    });
  }
};

const deleteAcara = async (req, res) => {
  const { id } = req.params;
  const { id_user } = req.user || {};

  if (!id || !id_user) {
    return res.status(400).json({
      message: 'id dan id_user wajib diisi',
      statusCode: 400
    });
  }

  const connection = await db.getConnection();

  await connection.beginTransaction();
  try {
    const [result] = await connection.query(
      'DELETE FROM tbl_acara WHERE id_acara = ? AND id_user = ? LIMIT 1',
      [id, id_user]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Acara tidak ditemukan',
        statusCode: 404
      });
    }

    await connection.commit();

    return res.status(200).json({
      message: 'Acara berhasil dihapus',
      data: result[0],
      statusCode: 200
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error menghapus acara',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

module.exports = {
  getAllAcara,
  getAcaraById,
  getAcaraBrowse,
  createAcara,
  updateAcara,
  updateJudulAcara,
  updateLokasiAcara,
  updateTanggalAcara,
  updateMaksPengunjungAcara,
  updateStatusAcara,
  deleteAcara
};