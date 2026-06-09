'use strict';

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
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        sessionStorage.clear();
        window.location.href = '/pages/login/login.html';
        const e = new Error('Sesi berakhir. Silakan login ulang.');
        e.status = 401;
        throw e;
      }
      const e = new Error(data.message || data.error || 'Terjadi kesalahan.');
      e.status = res.status;
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
