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

  // Get full login URL
  getLoginUrl() {
    return this.API_BASE_URL + this.LOGIN_ENDPOINT;
  },

  // Get full register URL
  getRegisterUrl() {
    return this.API_BASE_URL + this.REGISTER_ENDPOINT;
  }
};
