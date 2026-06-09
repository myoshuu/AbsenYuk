/**
 * config.js — API Configuration
 * 
 * Centralized configuration for API endpoints.
 * Change API_BASE_URL to point to your backend server.
 */

'use strict';

const API_CONFIG = {
  // Base URL untuk API backend
  API_BASE_URL: 'http://localhost:5143/api',

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
  }

};