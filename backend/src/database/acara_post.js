const db = require('./db');
const { ErrorCodes } = require('../utils/errors');

const getEventAccess = async (id_acara, id_user, role, connection = null) => {
  if (role === 'admin') {
    return { allowed: true, isOrganizer: true };
  }

  const runner = connection || db;

  const [owner] = await runner.query(
    'SELECT id_acara FROM tbl_acara WHERE id_acara = ? AND id_user = ? LIMIT 1',
    [id_acara, id_user]
  );

  if (owner.length > 0) {
    return { allowed: true, isOrganizer: true };
  }

  const [participant] = await runner.query(
    'SELECT id_acara_ikuti FROM tbl_acara_ikuti WHERE id_acara = ? AND id_user = ? LIMIT 1',
    [id_acara, id_user]
  );

  if (participant.length > 0) {
    return { allowed: true, isOrganizer: false };
  }

  return { allowed: false, isOrganizer: false };
};

const getPostsByAcara = async (req, res) => {
  const { id_acara } = req.params;
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

  if (!id_acara) {
    return res.status(400).json({
      message: 'id_acara wajib diisi.',
      statusCode: 400,
      errorCode: ErrorCodes.VALIDATION_REQUIRED_FIELD
    });
  }

  try {
    const access = await getEventAccess(id_acara, id_user, role);
    if (!access.allowed) {
      return res.status(403).json({
        message: 'Akses ditolak.',
        statusCode: 403,
        errorCode: ErrorCodes.AUTH_ACCESS_DENIED
      });
    }

    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM tbl_acara_post WHERE id_acara = ?',
      [id_acara]
    );

    const [result] = await db.query(
      `SELECT p.id_post, p.id_acara, p.id_user, u.username, u.email,
              p.judul, p.konten, p.dibuat_pada, p.diubah_pada
       FROM tbl_acara_post p
       JOIN tbl_user u ON u.id_user = p.id_user
       WHERE p.id_acara = ?
       ORDER BY p.dibuat_pada DESC
       LIMIT ? OFFSET ?`,
      [id_acara, limit, offset]
    );

    return res.status(200).json({
      message: 'Daftar postingan berhasil diambil.',
      data: result,
      total,
      page,
      limit,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      message: 'Error mengambil daftar postingan.',
      statusCode: 500,
      errorCode: ErrorCodes.DATABASE_ERROR
    });
  }
};

const getPostById = async (req, res) => {
  const { id_post } = req.params;
  const { id_user, role } = req.user || {};

  if (!id_user) {
    return res.status(401).json({
      message: 'Token tidak valid.',
      statusCode: 401
    });
  }

  if (!id_post) {
    return res.status(400).json({
      message: 'id_post wajib diisi',
      statusCode: 400
    });
  }

  try {
    const [rows] = await db.query(
      `SELECT p.id_post, p.id_acara, p.id_user, u.username, u.email,
              p.judul, p.konten, p.dibuat_pada, p.diubah_pada
       FROM tbl_acara_post p
       JOIN tbl_user u ON u.id_user = p.id_user
       WHERE p.id_post = ?
       LIMIT 1`,
      [id_post]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Postingan tidak ditemukan',
        statusCode: 404
      });
    }

    const post = rows[0];
    const access = await getEventAccess(post.id_acara, id_user, role);
    if (!access.allowed) {
      return res.status(403).json({
        message: 'Akses ditolak.',
        statusCode: 403
      });
    }

    return res.status(200).json({
      message: 'Postingan berhasil diambil',
      data: post,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error mengambil postingan',
      statusCode: 500
    });
  }
};

const createPost = async (req, res) => {
  const { id_acara } = req.params;
  const { judul, konten } = req.body;
  const { id_user, role } = req.user || {};

  if (!id_user) {
    return res.status(401).json({
      message: 'Token tidak valid.',
      statusCode: 401
    });
  }

  if (!id_acara || !judul || !konten) {
    return res.status(400).json({
      message: 'Judul dan konten wajib diisi',
      statusCode: 400
    });
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const [acaraRows] = await connection.query(
      'SELECT id_acara, id_user FROM tbl_acara WHERE id_acara = ? LIMIT 1',
      [id_acara]
    );

    if (acaraRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Acara tidak ditemukan',
        statusCode: 404
      });
    }

    const access = await getEventAccess(acaraRows[0].id_acara, id_user, role, connection);
    if (!access.allowed) {
      await connection.rollback();
      return res.status(403).json({
        message: 'Akses ditolak.',
        statusCode: 403
      });
    }

    const [result] = await connection.query(
      `INSERT INTO tbl_acara_post (id_acara, id_user, judul, konten, dibuat_pada)
       VALUES (?, ?, ?, ?, NOW())`,
      [id_acara, id_user, judul, konten]
    );

    await connection.commit();

    return res.status(201).json({
      message: 'Postingan berhasil dibuat',
      data: {
        id_post: result.insertId
      },
      statusCode: 201
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error membuat postingan',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

const updatePost = async (req, res) => {
  const { id_post } = req.params;
  const { judul, konten } = req.body;
  const { id_user, role } = req.user || {};

  if (!id_user) {
    return res.status(401).json({
      message: 'Token tidak valid.',
      statusCode: 401
    });
  }

  if (!id_post || !konten) {
    return res.status(400).json({
      message: 'id_post dan konten wajib diisi',
      statusCode: 400
    });
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const [rows] = await connection.query(
      `SELECT p.id_post, p.id_user, p.id_acara, a.id_user AS organizer_id
       FROM tbl_acara_post p
       JOIN tbl_acara a ON a.id_acara = p.id_acara
       WHERE p.id_post = ?
       LIMIT 1`,
      [id_post]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Postingan tidak ditemukan',
        statusCode: 404
      });
    }

    const post = rows[0];
    const canEdit = role === 'admin' || post.id_user === id_user || post.organizer_id === id_user;

    if (!canEdit) {
      await connection.rollback();
      return res.status(403).json({
        message: 'Akses ditolak.',
        statusCode: 403
      });
    }

    const [result] = await connection.query(
      'UPDATE tbl_acara_post SET judul = ?, konten = ?, diubah_pada = NOW() WHERE id_post = ?',
      [judul || null, konten, id_post]
    );

    await connection.commit();

    return res.status(200).json({
      message: 'Postingan berhasil diperbarui',
      data: {
        affectedRows: result.affectedRows
      },
      statusCode: 200
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error memperbarui postingan',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

const deletePost = async (req, res) => {
  const { id_post } = req.params;
  const { id_user, role } = req.user || {};

  if (!id_user) {
    return res.status(401).json({
      message: 'Token tidak valid.',
      statusCode: 401
    });
  }

  if (!id_post) {
    return res.status(400).json({
      message: 'id_post wajib diisi',
      statusCode: 400
    });
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const [rows] = await connection.query(
      `SELECT p.id_post, p.id_user, p.id_acara, a.id_user AS organizer_id
       FROM tbl_acara_post p
       JOIN tbl_acara a ON a.id_acara = p.id_acara
       WHERE p.id_post = ?
       LIMIT 1`,
      [id_post]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Postingan tidak ditemukan',
        statusCode: 404
      });
    }

    const post = rows[0];
    const canDelete = role === 'admin' || post.id_user === id_user || post.organizer_id === id_user;

    if (!canDelete) {
      await connection.rollback();
      return res.status(403).json({
        message: 'Akses ditolak.',
        statusCode: 403
      });
    }

    await connection.query('DELETE FROM tbl_acara_post_komentar WHERE id_post = ?', [id_post]);
    const [result] = await connection.query('DELETE FROM tbl_acara_post WHERE id_post = ? LIMIT 1', [id_post]);

    await connection.commit();

    return res.status(200).json({
      message: 'Postingan berhasil dihapus',
      data: {
        affectedRows: result.affectedRows
      },
      statusCode: 200
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error menghapus postingan',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

const getKomentarByPost = async (req, res) => {
  const { id_post } = req.params;
  const { id_user, role } = req.user || {};
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const offset = (page - 1) * limit;

  if (!id_user) {
    return res.status(401).json({
      message: 'Token tidak valid.',
      statusCode: 401,
      errorCode: ErrorCodes.AUTH_TOKEN_INVALID
    });
  }

  if (!id_post) {
    return res.status(400).json({
      message: 'id_post wajib diisi.',
      statusCode: 400,
      errorCode: ErrorCodes.VALIDATION_REQUIRED_FIELD
    });
  }

  try {
    const [postRows] = await db.query(
      'SELECT id_post, id_acara FROM tbl_acara_post WHERE id_post = ? LIMIT 1',
      [id_post]
    );

    if (postRows.length === 0) {
      return res.status(404).json({
        message: 'Postingan tidak ditemukan.',
        statusCode: 404,
        errorCode: ErrorCodes.RESOURCE_NOT_FOUND
      });
    }

    const access = await getEventAccess(postRows[0].id_acara, id_user, role);
    if (!access.allowed) {
      return res.status(403).json({
        message: 'Akses ditolak.',
        statusCode: 403,
        errorCode: ErrorCodes.AUTH_ACCESS_DENIED
      });
    }

    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM tbl_acara_post_komentar WHERE id_post = ?',
      [id_post]
    );

    const [result] = await db.query(
      `SELECT k.id_komentar, k.id_post, k.id_user, u.username, u.email,
              k.konten, k.dibuat_pada, k.diubah_pada
       FROM tbl_acara_post_komentar k
       JOIN tbl_user u ON u.id_user = k.id_user
       WHERE k.id_post = ?
       ORDER BY k.dibuat_pada ASC
       LIMIT ? OFFSET ?`,
      [id_post, limit, offset]
    );

    return res.status(200).json({
      message: 'Daftar komentar berhasil diambil.',
      data: result,
      total,
      page,
      limit,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      message: 'Error mengambil komentar.',
      statusCode: 500,
      errorCode: ErrorCodes.DATABASE_ERROR
    });
  }
};

const createKomentar = async (req, res) => {
  const { id_post } = req.params;
  const { konten } = req.body;
  const { id_user, role } = req.user || {};

  if (!id_user) {
    return res.status(401).json({
      message: 'Token tidak valid.',
      statusCode: 401
    });
  }

  if (!id_post || !konten) {
    return res.status(400).json({
      message: 'id_post dan konten wajib diisi',
      statusCode: 400
    });
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const [postRows] = await connection.query(
      'SELECT id_post, id_acara FROM tbl_acara_post WHERE id_post = ? LIMIT 1',
      [id_post]
    );

    if (postRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Postingan tidak ditemukan',
        statusCode: 404
      });
    }

    const access = await getEventAccess(postRows[0].id_acara, id_user, role, connection);
    if (!access.allowed) {
      await connection.rollback();
      return res.status(403).json({
        message: 'Akses ditolak.',
        statusCode: 403
      });
    }

    const [result] = await connection.query(
      `INSERT INTO tbl_acara_post_komentar (id_post, id_user, konten, dibuat_pada)
       VALUES (?, ?, ?, NOW())`,
      [id_post, id_user, konten]
    );

    await connection.commit();

    return res.status(201).json({
      message: 'Komentar berhasil dibuat',
      data: {
        id_komentar: result.insertId
      },
      statusCode: 201
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error membuat komentar',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

const updateKomentar = async (req, res) => {
  const { id_komentar } = req.params;
  const { konten } = req.body;
  const { id_user, role } = req.user || {};

  if (!id_user) {
    return res.status(401).json({
      message: 'Token tidak valid.',
      statusCode: 401
    });
  }

  if (!id_komentar || !konten) {
    return res.status(400).json({
      message: 'id_komentar dan konten wajib diisi',
      statusCode: 400
    });
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const [rows] = await connection.query(
      `SELECT k.id_komentar, k.id_user, p.id_acara, a.id_user AS organizer_id
       FROM tbl_acara_post_komentar k
       JOIN tbl_acara_post p ON p.id_post = k.id_post
       JOIN tbl_acara a ON a.id_acara = p.id_acara
       WHERE k.id_komentar = ?
       LIMIT 1`,
      [id_komentar]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Komentar tidak ditemukan',
        statusCode: 404
      });
    }

    const komentar = rows[0];
    const canEdit = role === 'admin' || komentar.id_user === id_user || komentar.organizer_id === id_user;

    if (!canEdit) {
      await connection.rollback();
      return res.status(403).json({
        message: 'Akses ditolak.',
        statusCode: 403
      });
    }

    const [result] = await connection.query(
      'UPDATE tbl_acara_post_komentar SET konten = ?, diubah_pada = NOW() WHERE id_komentar = ?',
      [konten, id_komentar]
    );

    await connection.commit();

    return res.status(200).json({
      message: 'Komentar berhasil diperbarui',
      data: {
        affectedRows: result.affectedRows
      },
      statusCode: 200
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error memperbarui komentar',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

const deleteKomentar = async (req, res) => {
  const { id_komentar } = req.params;
  const { id_user, role } = req.user || {};

  if (!id_user) {
    return res.status(401).json({
      message: 'Token tidak valid.',
      statusCode: 401
    });
  }

  if (!id_komentar) {
    return res.status(400).json({
      message: 'id_komentar wajib diisi',
      statusCode: 400
    });
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const [rows] = await connection.query(
      `SELECT k.id_komentar, k.id_user, p.id_acara, a.id_user AS organizer_id
       FROM tbl_acara_post_komentar k
       JOIN tbl_acara_post p ON p.id_post = k.id_post
       JOIN tbl_acara a ON a.id_acara = p.id_acara
       WHERE k.id_komentar = ?
       LIMIT 1`,
      [id_komentar]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: 'Komentar tidak ditemukan',
        statusCode: 404
      });
    }

    const komentar = rows[0];
    const canDelete = role === 'admin' || komentar.id_user === id_user || komentar.organizer_id === id_user;

    if (!canDelete) {
      await connection.rollback();
      return res.status(403).json({
        message: 'Akses ditolak.',
        statusCode: 403
      });
    }

    const [result] = await connection.query(
      'DELETE FROM tbl_acara_post_komentar WHERE id_komentar = ? LIMIT 1',
      [id_komentar]
    );

    await connection.commit();

    return res.status(200).json({
      message: 'Komentar berhasil dihapus',
      data: {
        affectedRows: result.affectedRows
      },
      statusCode: 200
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error: ', error);
    return res.status(500).json({
      message: 'Error menghapus komentar',
      statusCode: 500
    });
  } finally {
    await connection.release();
  }
};

module.exports = {
  getPostsByAcara,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getKomentarByPost,
  createKomentar,
  updateKomentar,
  deleteKomentar
};
