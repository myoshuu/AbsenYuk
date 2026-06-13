'use strict';

/* ─── Error Code Constants (matching backend) ─────────────────────── */
const API_ERROR_CODES = {
  // Auth
  AUTH_TOKEN_MISSING: 'AUTH_TOKEN_MISSING',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_ACCESS_DENIED: 'AUTH_ACCESS_DENIED',
  AUTH_ROLE_NOT_ALLOWED: 'AUTH_ROLE_NOT_ALLOWED',

  // Validation
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_EMAIL: 'VALIDATION_INVALID_EMAIL',
  VALIDATION_INVALID_PASSWORD: 'VALIDATION_INVALID_PASSWORD',
  VALIDATION_WEAK_PASSWORD: 'VALIDATION_WEAK_PASSWORD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',

  // Resource
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_EXPIRED: 'RESOURCE_EXPIRED',

  // Business
  BUSINESS_ATTENDANCE_CLOSED: 'BUSINESS_ATTENDANCE_CLOSED',
  BUSINESS_ATTENDANCE_ALREADY_SUBMITTED: 'BUSINESS_ATTENDANCE_ALREADY_SUBMITTED',

  // Rate Limit
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  ENDPOINT_NOT_FOUND: 'ENDPOINT_NOT_FOUND'
};

/* ─── Human-readable error messages for error codes ─────────────────── */
const ERROR_MESSAGES = {
  [API_ERROR_CODES.AUTH_TOKEN_MISSING]: 'Sesi tidak ditemukan. Silakan login.',
  [API_ERROR_CODES.AUTH_TOKEN_INVALID]: 'Sesi tidak valid. Silakan login ulang.',
  [API_ERROR_CODES.AUTH_TOKEN_EXPIRED]: 'Sesi berakhir. Silakan login ulang.',
  [API_ERROR_CODES.AUTH_ACCESS_DENIED]: 'Anda tidak memiliki akses ke resource ini.',
  [API_ERROR_CODES.AUTH_ROLE_NOT_ALLOWED]: 'Role Anda tidak diizinkan mengakses fitur ini.',
  [API_ERROR_CODES.VALIDATION_REQUIRED_FIELD]: 'Field wajib diisi.',
  [API_ERROR_CODES.VALIDATION_INVALID_EMAIL]: 'Format email tidak valid.',
  [API_ERROR_CODES.VALIDATION_INVALID_PASSWORD]: 'Password tidak valid.',
  [API_ERROR_CODES.VALIDATION_WEAK_PASSWORD]: 'Password terlalu lemah.',
  [API_ERROR_CODES.VALIDATION_INVALID_FORMAT]: 'Format input tidak valid.',
  [API_ERROR_CODES.RESOURCE_NOT_FOUND]: 'Data tidak ditemukan.',
  [API_ERROR_CODES.RESOURCE_ALREADY_EXISTS]: 'Data sudah ada.',
  [API_ERROR_CODES.RESOURCE_EXPIRED]: 'Data sudah kadaluarsa.',
  [API_ERROR_CODES.BUSINESS_ATTENDANCE_CLOSED]: 'Absensi sudah ditutup.',
  [API_ERROR_CODES.BUSINESS_ATTENDANCE_ALREADY_SUBMITTED]: 'Anda sudah mengisi absensi ini.',
  [API_ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Terlalu banyak permintaan. Coba lagi nanti.',
  [API_ERROR_CODES.INTERNAL_ERROR]: 'Terjadi kesalahan server.',
  [API_ERROR_CODES.DATABASE_ERROR]: 'Terjadi kesalahan database.',
  [API_ERROR_CODES.ENDPOINT_NOT_FOUND]: 'Endpoint tidak ditemukan.'
};

/* ─── Get error message from error code ────────────────────────────── */
function getErrorMessage(errorCode, fallbackMessage) {
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return ERROR_MESSAGES[errorCode];
  }
  return fallbackMessage || 'Terjadi kesalahan.';
}

const api = {
  _token() {
    return localStorage.getItem('authToken') || '';
  },

  _authHeaders() {
    const t = this._token();
    return t ? { Authorization: 'Bearer ' + t } : {};
  },

  _jsonHeaders() {
    return Object.assign({ 'Content-Type': 'application/json' }, this._authHeaders());
  },

  async _handle(res) {
    const data = await res.json().catch(() => ({}));

    // Extract error code from response
    const errorCode = data.errorCode || null;
    const requestId = data.requestId || null;

    if (!res.ok) {
      // Handle 401 Unauthorized
      if (res.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        sessionStorage.clear();
        window.location.href = '/pages/login/login.html';
        const e = new Error(getErrorMessage(API_ERROR_CODES.AUTH_TOKEN_EXPIRED, 'Sesi berakhir. Silakan login ulang.'));
        e.status = 401;
        e.errorCode = errorCode || API_ERROR_CODES.AUTH_TOKEN_INVALID;
        throw e;
      }

      // Handle 429 Rate Limit
      if (res.status === 429) {
        const e = new Error(getErrorMessage(API_ERROR_CODES.RATE_LIMIT_EXCEEDED, data.message || 'Terlalu banyak permintaan.'));
        e.status = 429;
        e.errorCode = errorCode || API_ERROR_CODES.RATE_LIMIT_EXCEEDED;
        throw e;
      }

      // Handle 403 Forbidden
      if (res.status === 403) {
        const e = new Error(getErrorMessage(errorCode, data.message || 'Akses ditolak.'));
        e.status = 403;
        e.errorCode = errorCode || API_ERROR_CODES.AUTH_ACCESS_DENIED;
        throw e;
      }

      // Handle 404 Not Found
      if (res.status === 404) {
        const e = new Error(getErrorMessage(errorCode, data.message || 'Data tidak ditemukan.'));
        e.status = 404;
        e.errorCode = errorCode || API_ERROR_CODES.RESOURCE_NOT_FOUND;
        throw e;
      }

      // Handle 409 Conflict (e.g., email exists)
      if (res.status === 409) {
        const e = new Error(getErrorMessage(errorCode, data.message || 'Data sudah ada.'));
        e.status = 409;
        e.errorCode = errorCode || API_ERROR_CODES.RESOURCE_ALREADY_EXISTS;
        throw e;
      }

      // Handle 410 Gone (e.g., token expired)
      if (res.status === 410) {
        const e = new Error(getErrorMessage(API_ERROR_CODES.RESOURCE_EXPIRED, data.message || 'Data sudah kadaluarsa.'));
        e.status = 410;
        e.errorCode = errorCode || API_ERROR_CODES.RESOURCE_EXPIRED;
        throw e;
      }

      // Handle other errors
      const e = new Error(getErrorMessage(errorCode, data.message || 'Terjadi kesalahan.'));
      e.status = res.status;
      e.errorCode = errorCode;
      e.requestId = requestId;
      throw e;
    }

    return data;
  },

  async get(url) {
    return this._handle(await fetch(url, {
      method: 'GET',
      headers: this._authHeaders()
    }));
  },

  async post(url, body) {
    return this._handle(await fetch(url, {
      method: 'POST',
      headers: this._jsonHeaders(),
      body: JSON.stringify(body)
    }));
  },

  async put(url, body) {
    return this._handle(await fetch(url, {
      method: 'PUT',
      headers: this._jsonHeaders(),
      body: JSON.stringify(body)
    }));
  },

  async del(url) {
    return this._handle(await fetch(url, {
      method: 'DELETE',
      headers: this._jsonHeaders()
    }));
  },

  async upload(url, formData) {
    return this._handle(await fetch(url, {
      method: 'PUT',
      headers: this._authHeaders(),
      body: formData
    }));
  }
};
