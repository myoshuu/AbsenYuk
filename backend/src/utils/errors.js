/**
 * Error Codes for AbsenYuk API
 * Provides standardized error codes for client-side error handling
 */

const ErrorCodes = {
  // Authentication & Authorization (10xx)
  AUTH_TOKEN_MISSING: 'AUTH_TOKEN_MISSING',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_ACCESS_DENIED: 'AUTH_ACCESS_DENIED',
  AUTH_ROLE_NOT_ALLOWED: 'AUTH_ROLE_NOT_ALLOWED',

  // Validation Errors (20xx)
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_EMAIL: 'VALIDATION_INVALID_EMAIL',
  VALIDATION_INVALID_PASSWORD: 'VALIDATION_INVALID_PASSWORD',
  VALIDATION_WEAK_PASSWORD: 'VALIDATION_WEAK_PASSWORD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_FIELD_TOO_LONG: 'VALIDATION_FIELD_TOO_LONG',
  VALIDATION_FIELD_TOO_SHORT: 'VALIDATION_FIELD_TOO_SHORT',

  // Resource Errors (30xx)
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_DELETED: 'RESOURCE_DELETED',
  RESOURCE_EXPIRED: 'RESOURCE_EXPIRED',

  // Business Logic Errors (40xx)
  BUSINESS_INVALID_STATUS: 'BUSINESS_INVALID_STATUS',
  BUSINESS_MAX_PARTICIPANTS: 'BUSINESS_MAX_PARTICIPANTS',
  BUSINESS_ALREADY_JOINED: 'BUSINESS_ALREADY_JOINED',
  BUSINESS_NOT_PARTICIPANT: 'BUSINESS_NOT_PARTICIPANT',
  BUSINESS_ATTENDANCE_CLOSED: 'BUSINESS_ATTENDANCE_CLOSED',
  BUSINESS_ATTENDANCE_ALREADY_SUBMITTED: 'BUSINESS_ATTENDANCE_ALREADY_SUBMITTED',

  // Rate Limiting (50xx)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // File Upload Errors (60xx)
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_INVALID_TYPE: 'FILE_INVALID_TYPE',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',

  // System Errors (90xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  ENDPOINT_NOT_FOUND: 'ENDPOINT_NOT_FOUND',
  INVALID_REQUEST: 'INVALID_REQUEST'
};

/**
 * Create an error object with code and status
 */
function createError(message, statusCode, errorCode) {
  const error = new Error(message);
  error.status = statusCode;
  error.errorCode = errorCode;
  return error;
}

/**
 * Helper to wrap error message with error code in response
 */
function withErrorCode(message, statusCode, errorCode) {
  return {
    message,
    statusCode,
    errorCode
  };
}

/**
 * Common error creators
 */
const Errors = {
  badRequest: (message, errorCode = ErrorCodes.INVALID_REQUEST) =>
    createError(message, 400, errorCode),

  unauthorized: (message = 'Token tidak valid atau sudah kadaluarsa.', errorCode = ErrorCodes.AUTH_TOKEN_INVALID) =>
    createError(message, 401, errorCode),

  forbidden: (message = 'Akses ditolak.', errorCode = ErrorCodes.AUTH_ACCESS_DENIED) =>
    createError(message, 403, errorCode),

  notFound: (resource = 'Resource', errorCode = ErrorCodes.RESOURCE_NOT_FOUND) =>
    createError(`${resource} tidak ditemukan.`, 404, errorCode),

  conflict: (message, errorCode = ErrorCodes.RESOURCE_ALREADY_EXISTS) =>
    createError(message, 409, errorCode),

  gone: (message, errorCode = ErrorCodes.RESOURCE_EXPIRED) =>
    createError(message, 410, errorCode),

  payloadTooLarge: (message = 'File terlalu besar.', errorCode = ErrorCodes.FILE_TOO_LARGE) =>
    createError(message, 413, errorCode),

  internal: (message = 'Internal Server Error', errorCode = ErrorCodes.INTERNAL_ERROR) =>
    createError(message, 500, errorCode)
};

module.exports = {
  ErrorCodes,
  createError,
  withErrorCode,
  Errors
};
