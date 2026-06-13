'use strict';

const jwt = require('jsonwebtoken');
const { ErrorCodes } = require('../utils/errors');

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
      statusCode: 401,
      errorCode: ErrorCodes.AUTH_TOKEN_MISSING
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({
      message: 'JWT secret belum dikonfigurasi.',
      statusCode: 500,
      errorCode: ErrorCodes.INTERNAL_ERROR
    });
  }

  jwt.verify(token, secret, (err, payload) => {
    if (err) {
      const errorCode = err.name === 'TokenExpiredError'
        ? ErrorCodes.AUTH_TOKEN_EXPIRED
        : ErrorCodes.AUTH_TOKEN_INVALID;
      return res.status(401).json({
        message: 'Token tidak valid atau sudah kadaluarsa.',
        statusCode: 401,
        errorCode
      });
    }

    req.user = payload;
    return next();
  });
}

function authorizeRoles(...roles) {
  // Normalize to array: handle both 'admin' and ['admin'] formats
  const normalizedRoles = roles.flat();

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        message: 'Akses ditolak. Token tidak valid.',
        statusCode: 403,
        errorCode: ErrorCodes.AUTH_ACCESS_DENIED
      });
    }

    if (!normalizedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' tidak diizinkan mengakses resource ini.`,
        statusCode: 403,
        errorCode: ErrorCodes.AUTH_ROLE_NOT_ALLOWED
      });
    }

    return next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles
};
