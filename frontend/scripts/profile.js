'use strict';

/* AVATAR */
function updateAvatarDisplay(id_user) {
  if (!id_user) return;
  var url = API_CONFIG.getProfilePictureUrl(id_user) + '?t=' + Date.now();
  var html = '<img src="' + url + '" alt="" />';
  var el = document.getElementById('sidebarAvatar');
  if (el) el.innerHTML = html;
  el = document.getElementById('profileAvatarLarge');
  if (el) el.innerHTML = html;
}

function setupAvatarUpload(token, onSuccess) {
  var fi = document.getElementById('avatarFileInput');
  var btn = document.getElementById('changeAvatarBtn');
  if (!fi || !btn) return;
  btn.addEventListener('click', function () { fi.click(); });
  fi.addEventListener('change', async function () {
    var f = fi.files[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { showToast('Ukuran file maksimal 2MB.', 'error'); fi.value = ''; return; }
    var fd = new FormData();
    fd.append('avatar', f);
    try {
      await api.upload(API_CONFIG.getChangeAvatarUrl(), fd);
      showToast('Foto profil berhasil diperbarui.', 'success');
      if (onSuccess) onSuccess();
    } catch (e) { showToast(e.message, 'error'); }
    fi.value = '';
  });
}

/* PROFILE MODALS */
function openChangeUsernameModal(p, token, done) {
  if (!p || !p.email || document.querySelector('.modal-overlay')) return;
  var o = document.createElement('div'); o.className = 'modal-overlay';
  o.innerHTML = '<div class="modal-card"><div class="modal-header"><h2 class="modal-title">Change Username</h2><p class="modal-subtitle">Masukkan email dan username baru.</p></div><form class="modal-form" id="cuForm"><div class="modal-field"><label class="modal-label">Email</label><input class="modal-input" type="email" value="' + p.email + '" readonly /></div><div class="modal-field"><label class="modal-label">Username Baru</label><input class="modal-input" id="cuUsername" type="text" placeholder="Username baru" required /></div><div class="modal-actions"><button class="modal-btn" type="button" data-cancel>Batalkan</button><button class="modal-btn primary" type="submit">Simpan</button></div></form></div>';
  document.body.appendChild(o);
  var kd = function (e) { if (e.key === 'Escape') closeModal(o, kd); };
  document.addEventListener('keydown', kd);
  o.addEventListener('click', function (e) { if (e.target === o) closeModal(o, kd); });
  o.querySelector('[data-cancel]').addEventListener('click', function () { closeModal(o, kd); });
  o.querySelector('#cuForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    try {
      await api.put(API_CONFIG.getChangeUsernameUrl(p.email), { email: p.email, newUsername: e.currentTarget.querySelector('#cuUsername').value.trim() });
      showToast('Username berhasil diubah.', 'success');
      closeModal(o, kd);
      if (done) done();
    } catch (er) { showToast(er.message, 'error'); }
  });
}

function openChangePasswordModal(p, token, done) {
  if (!p || !p.email || document.querySelector('.modal-overlay')) return;
  var o = document.createElement('div'); o.className = 'modal-overlay';
  o.innerHTML = '<div class="modal-card"><div class="modal-header"><h2 class="modal-title">Change Password</h2><p class="modal-subtitle">Masukkan password sekarang dan password baru.</p></div><form class="modal-form" id="cpForm"><div class="modal-field"><label class="modal-label">Email</label><input class="modal-input" type="email" value="' + p.email + '" readonly /></div><div class="modal-field"><label class="modal-label">Password Sekarang</label><input class="modal-input" id="cpOld" type="password" placeholder="Password sekarang" required /></div><div class="modal-field"><label class="modal-label">Password Baru</label><input class="modal-input" id="cpNew" type="password" placeholder="Password baru" required /></div><div class="modal-actions"><button class="modal-btn" type="button" data-cancel>Batalkan</button><button class="modal-btn primary" type="submit">Simpan</button></div></form></div>';
  document.body.appendChild(o);
  var kd = function (e) { if (e.key === 'Escape') closeModal(o, kd); };
  document.addEventListener('keydown', kd);
  o.addEventListener('click', function (e) { if (e.target === o) closeModal(o, kd); });
  o.querySelector('[data-cancel]').addEventListener('click', function () { closeModal(o, kd); });
  o.querySelector('#cpForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    var f = e.currentTarget;
    try {
      await api.put(API_CONFIG.getChangePasswordUrl(p.email), { email: p.email, oldPassword: f.querySelector('#cpOld').value, newPassword: f.querySelector('#cpNew').value });
      showToast('Password berhasil diubah.', 'success');
      closeModal(o, kd);
    } catch (er) { showToast(er.message, 'error'); }
  });
}

function openDeleteAccountModal(p, token) {
  if (!p || !p.email || document.querySelector('.modal-overlay')) return;
  var o = document.createElement('div'); o.className = 'modal-overlay';
  o.innerHTML = '<div class="modal-card"><div class="modal-header"><h2 class="modal-title">Delete Account</h2><p class="modal-subtitle">Tindakan ini tidak dapat dibatalkan.</p></div><div class="modal-field"><label class="modal-label">Email</label><input class="modal-input" type="email" value="' + p.email + '" readonly /></div><div class="modal-actions"><button class="modal-btn" type="button" data-cancel>Batalkan</button><button class="modal-btn primary" type="button" data-confirm>Hapus</button></div></div>';
  document.body.appendChild(o);
  var kd = function (e) { if (e.key === 'Escape') closeModal(o, kd); };
  document.addEventListener('keydown', kd);
  o.addEventListener('click', function (e) { if (e.target === o) closeModal(o, kd); });
  o.querySelector('[data-cancel]').addEventListener('click', function () { closeModal(o, kd); });
  o.querySelector('[data-confirm]').addEventListener('click', async function () {
    try {
      await api.del(API_CONFIG.getDeleteUserUrl(p.email));
      showToast('Akun berhasil dihapus.', 'success');
      closeModal(o, kd);
      clearAuth();
      setTimeout(function () { redirectToLogin(); }, 1200);
    } catch (er) { showToast(er.message, 'error'); }
  });
}

/* PROFILE INIT */
async function initProfile(token) {
  var dn = document.getElementById('profileDisplayName');
  var di = document.getElementById('profileDisplayId');
  var iu = document.getElementById('infoUsername');
  var ie = document.getElementById('infoEmail');
  var ir = document.getElementById('infoRole');
  if (!dn && !iu) return;

  async function loadProfile() {
    try {
      var d = await api.get(API_CONFIG.getProfileUrl());
      var p = d.data || {};
      var cu = safeParse(localStorage.getItem('authUser')) || {};
      if (dn) dn.textContent = p.username || cu.username || '-';
      if (di) di.textContent = 'id: ' + (p.id_user || '-');
      if (iu) iu.textContent = p.username || '-';
      if (ie) ie.textContent = p.email || '-';
      if (ir) ir.textContent = ROLE_LABELS[normalizeRole(p.tipe_akun)] || '-';
      localStorage.setItem('authUser', JSON.stringify({ username: p.username || cu.username, email: p.email || cu.email }));
      return p;
    } catch (e) { console.error(e); if (dn) dn.textContent = 'Error'; }
    return {};
  }

  var profile = await loadProfile();
  updateAvatarDisplay(profile.id_user);
  setupAvatarUpload(token, function () { updateAvatarDisplay(profile.id_user); });
  document.getElementById('changeUsernameBtn').addEventListener('click', function () { openChangeUsernameModal(profile, token, loadProfile); });
  document.getElementById('changePasswordBtn').addEventListener('click', function () { openChangePasswordModal(profile, token, loadProfile); });
  document.getElementById('deleteAccountBtn').addEventListener('click', function () { openDeleteAccountModal(profile, token); });
}
