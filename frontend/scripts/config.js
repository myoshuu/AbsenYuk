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
  }
};
