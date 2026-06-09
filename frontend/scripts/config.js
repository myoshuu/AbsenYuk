/**
 * config.js — API Configuration
 * 
 * Centralized configuration for API endpoints.
 * Change API_BASE_URL to point to your backend server.
 */

'use strict';

const API_CONFIG = {
  // Base URL untuk API backend
  API_BASE_URL: '/api',

  // Endpoint untuk login
  LOGIN_ENDPOINT: '/user/login',

  // Endpoint untuk register
  REGISTER_ENDPOINT: '/user/register',

  // Endpoint untuk profile (cek token)
  PROFILE_ENDPOINT: '/user/me/profile',

  // Endpoint untuk user manager
  USERS_ENDPOINT: '/user',
  USER_UPDATE_ENDPOINT: '/user/update',
  USER_ROLE_ENDPOINT: '/user/update-tipe-akun',
  USER_DELETE_ENDPOINT: '/user/delete',
  USER_CHANGE_USERNAME_ENDPOINT: '/user/change-username',
  USER_CHANGE_PASSWORD_ENDPOINT: '/user/change-password',
  USER_CHANGE_AVATAR_ENDPOINT: '/user/change-avatar',
  USER_PROFILE_PICTURE_ENDPOINT: '/user/profile-picture',

  // Get full login URL
  getLoginUrl() {
    return this.API_BASE_URL + this.LOGIN_ENDPOINT;
  },

  // Get full register URL
  getRegisterUrl() {
    return this.API_BASE_URL + this.REGISTER_ENDPOINT;
  },

  // Get full profile URL
  getProfileUrl() {
    return this.API_BASE_URL + this.PROFILE_ENDPOINT;
  },

  // Get full users URL
  getUsersUrl() {
    return this.API_BASE_URL + this.USERS_ENDPOINT;
  },

  // Get full update user URL
  getUpdateUserUrl(email) {
    return `${this.API_BASE_URL + this.USER_UPDATE_ENDPOINT}/${encodeURIComponent(email)}`;
  },

  // Get full update role URL
  getUpdateRoleUrl(email) {
    return `${this.API_BASE_URL + this.USER_ROLE_ENDPOINT}/${encodeURIComponent(email)}`;
  },

  // Get full delete user URL
  getDeleteUserUrl(email) {
    return `${this.API_BASE_URL + this.USER_DELETE_ENDPOINT}/${encodeURIComponent(email)}`;
  },

  // Get full change username URL
  getChangeUsernameUrl(email) {
    return `${this.API_BASE_URL + this.USER_CHANGE_USERNAME_ENDPOINT}/${encodeURIComponent(email)}`;
  },

  // Get full change password URL
  getChangePasswordUrl(email) {
    return `${this.API_BASE_URL + this.USER_CHANGE_PASSWORD_ENDPOINT}/${encodeURIComponent(email)}`;
  },

  // Get full change avatar URL
  getChangeAvatarUrl() {
    return this.API_BASE_URL + this.USER_CHANGE_AVATAR_ENDPOINT;
  },

  // Get profile picture URL by user ID
  getProfilePictureUrl(id_user) {
    return `${this.API_BASE_URL + this.USER_PROFILE_PICTURE_ENDPOINT}/${id_user}`;
  },

  /**
 * ============================================================
 * TAMBAHKAN blok ini ke dalam object API_CONFIG yang sudah ada
 * di file config.js — tepat sebelum kurung kurawal penutup }
 * ============================================================
 *
 * Endpoint untuk acara
 */

  // --- ACARA ---
  ACARA_ENDPOINT: '/acara',
  ACARA_CREATE_ENDPOINT: '/acara/create',
  ACARA_UPDATE_ENDPOINT: '/acara/update',
  ACARA_STATUS_ENDPOINT: '/acara/update-status',
  ACARA_DELETE_ENDPOINT: '/acara/delete',

  // Get all acara
  getAcaraUrl() {
    return this.API_BASE_URL + this.ACARA_ENDPOINT;
  },

  // Get acara by id
  getAcaraByIdUrl(id) {
    return `${this.API_BASE_URL}${this.ACARA_ENDPOINT}/${id}`;
  },

  // Create acara
  getCreateAcaraUrl() {
    return this.API_BASE_URL + this.ACARA_CREATE_ENDPOINT;
  },

  // Update acara by id
  getUpdateAcaraUrl(id) {
    return `${this.API_BASE_URL}${this.ACARA_UPDATE_ENDPOINT}/${id}`;
  },

  // Update status acara by id
  getUpdateAcaraStatusUrl(id) {
    return `${this.API_BASE_URL}${this.ACARA_STATUS_ENDPOINT}/${id}`;
  },

  // Delete acara by id
  getDeleteAcaraUrl(id) {
    return `${this.API_BASE_URL}${this.ACARA_DELETE_ENDPOINT}/${id}`;
  },

  // --- DASHBOARD ---
  DASHBOARD_SUMMARY_ENDPOINT: '/dashboard/summary',

  getDashboardSummaryUrl() {
    return this.API_BASE_URL + this.DASHBOARD_SUMMARY_ENDPOINT;
  },
  getOrganizerSummaryUrl() {
    return `${this.API_BASE_URL}/dashboard/organizer-summary`;
  },

  // --- ABSENSI ---
  ABSENSI_CREATE_ENDPOINT: '/absensi/create',
  ABSENSI_ACARA_ENDPOINT: '/absensi/acara',
  ABSENSI_GENERATE_QR_ENDPOINT: '/absensi/generate-qr',
  ABSENSI_LOGS_ENDPOINT: '/absensi/logs',
  ABSENSI_SUBMIT_ENDPOINT: '/absensi/submit',
  ABSENSI_TOKEN_ENDPOINT: '/absensi/token',

  getCreateAbsensiUrl() {
    return this.API_BASE_URL + this.ABSENSI_CREATE_ENDPOINT;
  },
  getAbsensiByAcaraUrl(id_acara) {
    return `${this.API_BASE_URL}/absensi/acara/${id_acara}`;
  },
  getGenerateQrUrl(id_absensi) {
    return `${this.API_BASE_URL}/absensi/${id_absensi}/generate-qr`;
  },
  getAbsensiLogsUrl(id_absensi) {
    return `${this.API_BASE_URL}/absensi/${id_absensi}/logs`;
  },
  getSubmitAbsensiUrl() {
    return this.API_BASE_URL + this.ABSENSI_SUBMIT_ENDPOINT;
  },
  getAbsensiByTokenUrl(token) {
    return `${this.API_BASE_URL}/absensi/token/${token}`;
  },
  getDeleteAbsensiLogUrl(id_absensi, id_log) {
    return `${this.API_BASE_URL}/absensi/${id_absensi}/log/${id_log}`;
  },
  getDeleteAbsensiUrl(id_absensi) {
    return `${this.API_BASE_URL}/absensi/${id_absensi}`;
  },
  getAllAbsensiLogsUrl(params = {}) {
    const q = new URLSearchParams();
    if (params.acara) q.set('acara', params.acara);
    if (params.status) q.set('status', params.status);
    if (params.page) q.set('page', params.page);
    if (params.limit) q.set('limit', params.limit);
    const query = q.toString();
    return `${this.API_BASE_URL}/absensi/logs${query ? '?' + query : ''}`;
  },
  getUpdateAbsensiLogUrl(id_log) {
    return `${this.API_BASE_URL}/absensi/log/${id_log}`;
  },
  getAddAbsensiLogUrl() {
    return `${this.API_BASE_URL}/absensi/log`;
  },
  getDeleteGlobalLogUrl(id_log) {
    return `${this.API_BASE_URL}/absensi/log/${id_log}`;
  },
  getLogsByAcaraUrl(id_acara) {
    return `${this.API_BASE_URL}/absensi/acara/${id_acara}/logs`;
  },

  // --- ACARA POST & KOMENTAR ---
  getAcaraPostListUrl(id_acara) {
    return `${this.API_BASE_URL}/acara-post/acara/${id_acara}`;
  },
  getAcaraPostCreateUrl(id_acara) {
    return `${this.API_BASE_URL}/acara-post/acara/${id_acara}`;
  },
  getAcaraPostDeleteUrl(id_post) {
    return `${this.API_BASE_URL}/acara-post/${id_post}`;
  },
  getKomentarListUrl(id_post) {
    return `${this.API_BASE_URL}/acara-post/${id_post}/komentar`;
  },
  getKomentarCreateUrl(id_post) {
    return `${this.API_BASE_URL}/acara-post/${id_post}/komentar`;
  },
  getKomentarDeleteUrl(id_komentar) {
    return `${this.API_BASE_URL}/acara-post/komentar/${id_komentar}`;
  },

  // --- ACARA IKUTI ---
  getAcaraIkutiCreateUrl() {
    return this.API_BASE_URL + '/acara-ikuti/create';
  },
  getAcaraIkutiByUserUrl(id_user) {
    return `${this.API_BASE_URL}/acara-ikuti/user/${id_user}`;
  },

  // --- ACARA BROWSE ---
  getAcaraBrowseUrl() {
    return this.API_BASE_URL + '/acara/browse';
  },

  // --- EXPORT ---
  getExportUsersUrl(params = {}, format = 'excel') {
    const suffix = format === 'pdf' ? '/pdf' : '';
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    const query = qs.toString();
    return `${this.API_BASE_URL}/export/users${suffix}${query ? '?' + query : ''}`;
  },
  getExportAcaraUrl(params = {}, format = 'excel') {
    const suffix = format === 'pdf' ? '/pdf' : '';
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    const query = qs.toString();
    return `${this.API_BASE_URL}/export/acara${suffix}${query ? '?' + query : ''}`;
  },
  getExportAbsensiUrl(id_acara, format = 'excel') {
    const suffix = format === 'pdf' ? '/pdf' : '';
    return `${this.API_BASE_URL}/export/absensi/${id_acara}${suffix}`;
  },
  getExportLogsUrl(id_acara, params = {}, format = 'excel') {
    const suffix = format === 'pdf' ? '/pdf' : '';
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    const query = qs.toString();
    return `${this.API_BASE_URL}/export/logs/${id_acara}${suffix}${query ? '?' + query : ''}`;
  }

};