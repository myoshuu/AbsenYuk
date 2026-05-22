'use strict';

const jwt = require('jsonwebtoken');

function getTokenFromHeader(req) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

function authenticateToken(req, res, next) {
  const token = getTokenFromHeader(req);
  if (!token) {
    return res.status(401).json({
      message: 'Token tidak ditemukan.',
      statusCode: 401
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({
      message: 'JWT secret belum diatur pada server.',
      statusCode: 500
    });
  }

  jwt.verify(token, secret, (err, payload) => {
    if (err) {
      return res.status(401).json({
        message: 'Token tidak valid atau sudah kadaluarsa.',
        statusCode: 401
      });
    }

    req.user = payload;
    return next();
  });
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        message: 'Akses ditolak.',
        statusCode: 403
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Role tidak diizinkan.',
        statusCode: 403
      });
    }

    return next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles
};
