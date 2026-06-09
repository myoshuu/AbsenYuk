/* Dashboard logic */
'use strict';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const ROLE_LABELS = {
  admin: 'Administrator',
  organizer: 'Penyelenggara',
  user: 'Anggota'
};

const ROLE_TITLES = {
  admin: 'Admin',
  organizer: 'Organizer',
  user: 'User'
};

const ROLE_SUBTITLES = {
  admin: 'Kelola seluruh sistem absensi dan pengguna',
  organizer: 'Kelola acara dan absensi organisasi anda',
  user: 'Ini adalah Dashboard anda'
};

const ROLE_PAGES = {
  admin: 'admin/index.html',
  organizer: 'organizer/index.html',
  user: 'user/index.html'
};

const PREVIEW_KEY = 'dashboardPreviewRole';
const PREVIEW_ROLES = ['organizer', 'user'];
const USER_PAGE_SIZE = 10;

const HEADER_ICONS = {
  admin: `
    <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.6">
      <path d="M7 10a4 4 0 108 0 4 4 0 00-8 0z" />
      <path d="M4 20c1.8-3 4.5-4.5 8-4.5s6.2 1.5 8 4.5" />
    </svg>
  `,
  organizer: `
    <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.6">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4M17 3v4M3 10h18" />
      <path d="M8 14h8" />
    </svg>
  `,
  user: `
    <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.6">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c2.2-3.2 5-4.8 8-4.8s5.8 1.6 8 4.8" />
    </svg>
  `
};

const NAV_ITEMS = {
  admin: [
    { label: 'User Manajer', icon: 'users', path: 'dashboard/admin/user-manager.html' },
    { label: 'Acara', icon: 'calendar', path: 'dashboard/admin/acara.html' },
    { label: 'Absensi', icon: 'check', path: 'dashboard/absensi/index.html' },
    { label: 'Log Absensi', icon: 'check', path: 'dashboard/absensi/logs.html' },
    { label: 'Profile', icon: 'profile', path: 'dashboard/profile/index.html' }
  ],
  organizer: [
    { label: 'Acara', icon: 'calendar', path: 'dashboard/organizer/acara.html' },
    { label: 'Absensi', icon: 'check', path: 'dashboard/absensi/index.html' },
    { label: 'Log Absensi', icon: 'check', path: 'dashboard/absensi/logs.html' },
    { label: 'Profile', icon: 'profile', path: 'dashboard/profile/index.html' }
  ],
  user: [
    { label: 'List Acara', icon: 'calendar', path: 'dashboard/user/acara-list.html' },
    { label: 'Acara Saya', icon: 'star', path: 'dashboard/user/acara-saya.html' },
    { label: 'Profile', icon: 'profile', path: 'dashboard/profile/index.html' }
  ]
};

const ICONS = {
  users: `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M7 10a3 3 0 106 0 3 3 0 00-6 0z" />
      <path d="M3 20c1.5-2.6 3.7-3.8 7-3.8s5.5 1.2 7 3.8" />
    </svg>
  `,
  calendar: `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4M17 3v4M3 10h18" />
    </svg>
  `,
  check: `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M6 12l3 3 7-7" />
      <rect x="3" y="4" width="18" height="16" rx="2" />
    </svg>
  `,
  profile: `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c2.2-3.2 5-4.8 8-4.8s5.8 1.6 8 4.8" />
    </svg>
  `,
  star: `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8 6.8 19l1-5.8-4.2-4.1 5.8-.8L12 3z" />
    </svg>
  `,
  settings: `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
      <path d="M19.4 15a1.7 1.7 0 000-2l1.3-1.7-2-3.5-2 .7a6.7 6.7 0 00-1.7-1l-.3-2.1h-4l-.3 2.1a6.7 6.7 0 00-1.7 1l-2-.7-2 3.5L4.6 13a1.7 1.7 0 000 2l-1.3 1.7 2 3.5 2-.7a6.7 6.7 0 001.7 1l.3 2.1h4l.3-2.1a6.7 6.7 0 001.7-1l2 .7 2-3.5L19.4 15z" />
    </svg>
  `
};

function setLoading(isLoading) {
  document.body.classList.toggle('is-loading', isLoading);
}

function showToast(message, type = 'info', duration = 2800) {
  document.querySelectorAll('.toast').forEach((t) => t.remove());
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 260);
  }, duration);
}

function normalizeRole(value) {
  if (!value) return 'user';
  const lowered = String(value).toLowerCase();
  if (['admin', 'administrator'].includes(lowered)) return 'admin';
  if (['organizer', 'penyelenggara'].includes(lowered)) return 'organizer';
  return 'user';
}

function safeParse(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function buildNav(role) {
  const sideNav = $('#sideNav');
  if (!sideNav) return;

  sideNav.innerHTML = '';
  (NAV_ITEMS[role] || []).forEach((item) => {
    const isLink = Boolean(item.path);
    const el = document.createElement(isLink ? 'a' : 'button');
    if (!isLink) el.type = 'button';
    el.className = 'side-link';
    el.dataset.nav = item.label;
    if (isLink) {
      el.href = buildPagesUrl(item.path);
    }
    el.innerHTML = `
      <span class="side-icon">${ICONS[item.icon] || ''}</span>
      <span>${item.label}</span>
    `;
    sideNav.appendChild(el);
  });
}

function getRoleFromProfile(profile) {
  return normalizeRole(profile?.role || profile?.tipe_akun);
}

function getPagesBasePath() {
  const path = window.location.pathname.replace(/\\/g, '/');
  const marker = '/pages/';
  const idx = path.indexOf(marker);
  if (idx === -1) return '';
  return path.slice(0, idx + marker.length);
}

function buildPagesUrl(relativePath) {
  const base = getPagesBasePath();
  return base ? `${base}${relativePath}` : relativePath;
}

function getDashboardUrl(role) {
  const page = ROLE_PAGES[role] || ROLE_PAGES.user;
  return buildPagesUrl(`dashboard/${page}`);
}

function getRequiredRole() {
  return document.body?.dataset?.role || 'router';
}

function getPreviewRole() {
  return sessionStorage.getItem(PREVIEW_KEY);
}

function setPreviewRole(role) {
  sessionStorage.setItem(PREVIEW_KEY, role);
}

function clearPreviewRole() {
  sessionStorage.removeItem(PREVIEW_KEY);
}

function isPreviewRole(role) {
  return PREVIEW_ROLES.includes(role);
}

function applyProfile(profile, viewRole, actualRole) {
  const role = viewRole || getRoleFromProfile(profile);
  const cachedUser = safeParse(localStorage.getItem('authUser')) || {};
  const displayName = actualRole === 'admin' && role !== 'admin'
    ? ROLE_TITLES[role]
    : cachedUser.username || cachedUser.email || profile?.email || sessionStorage.getItem('userEmail') || ROLE_TITLES[role];

  const profileName = $('#profileName');
  const profileRole = $('#profileRole');
  const welcomeTitle = $('#welcomeTitle');
  const welcomeSubtitle = $('#welcomeSubtitle');
  const headerIcon = $('#headerIcon');

  if (profileName) profileName.textContent = `Hi, ${displayName}`;
  if (profileRole) profileRole.textContent = ROLE_LABELS[role] || 'Anggota';
  if (welcomeTitle) welcomeTitle.textContent = `Selamat Datang, ${ROLE_TITLES[role]}!`;
  if (welcomeSubtitle) welcomeSubtitle.textContent = ROLE_SUBTITLES[role] || 'Ini adalah Dashboard anda';
  if (headerIcon) headerIcon.innerHTML = HEADER_ICONS[role] || '';

  buildNav(role);
  updateAvatarDisplay(profile?.id_user);
}

function clearAuth() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  sessionStorage.removeItem('userEmail');
  clearPreviewRole();
}

function redirectToLogin() {
  window.location.href = buildPagesUrl('login/login.html');
}

async function fetchProfile(token) {
  const response = await fetch(API_CONFIG.getProfileUrl(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Token tidak valid');
  }

  const data = await response.json();
  return data?.data || {};
}

function openSwitchModal(actualRole) {
  if (actualRole !== 'admin') {
    showToast('Fitur ini hanya untuk admin.', 'error');
    return;
  }

  if (document.querySelector('.switch-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'switch-overlay';
  overlay.innerHTML = `
    <div class="switch-card" role="dialog" aria-modal="true" aria-label="Pilih dashboard">
      <div class="switch-header">
        <h2 class="switch-title">Change Dashboard</h2>
        <p class="switch-subtitle">Pilih tampilan yang ingin kamu cek.</p>
      </div>
      <div class="switch-grid">
        <button class="switch-btn" type="button" data-switch-role="admin">Admin</button>
        <button class="switch-btn" type="button" data-switch-role="organizer">Organizer</button>
        <button class="switch-btn" type="button" data-switch-role="user">User</button>
      </div>
      <button class="switch-cancel" type="button" data-switch-cancel>Batalkan</button>
    </div>
  `;

  document.body.appendChild(overlay);

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', onKeyDown);
    }
  };

  document.addEventListener('keydown', onKeyDown);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      overlay.remove();
      document.removeEventListener('keydown', onKeyDown);
    }
  });

  overlay.querySelector('[data-switch-cancel]')?.addEventListener('click', () => {
    overlay.remove();
    document.removeEventListener('keydown', onKeyDown);
  });

  overlay.querySelectorAll('[data-switch-role]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.switchRole;
      if (role === 'admin') {
        clearPreviewRole();
      } else {
        setPreviewRole(role);
      }
      window.location.href = getDashboardUrl(role);
    });
  });
}

function closeModal(overlay, onKeyDown) {
  overlay.remove();
  if (onKeyDown) document.removeEventListener('keydown', onKeyDown);
}

async function downloadExport(url, token, filename) {
  try {
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      throw new Error(errData.message || 'Gagal export data.');
    }
    const blob = await resp.blob();
    const objUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objUrl);
  } catch (err) {
    showToast(err.message || 'Gagal export data.', 'error');
  }
}

function openConfirmModal(message, title = 'Konfirmasi') {
  return new Promise((resolve) => {
    if (document.querySelector('.modal-overlay')) { resolve(false); return; }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-card" role="dialog" aria-modal="true" aria-label="${title}">
        <div class="modal-header">
          <h2 class="modal-title">${title}</h2>
        </div>
        <div style="padding:8px 0 18px;font-size:0.95rem;line-height:1.5">${message}</div>
        <div class="modal-actions">
          <button class="modal-btn" type="button" data-modal-cancel>Batalkan</button>
          <button class="modal-btn primary" type="button" data-modal-confirm>Ya, Hapus</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    const onKeyDown = (e) => { if (e.key === 'Escape') { closeModal(overlay, onKeyDown); resolve(false); } };
    document.addEventListener('keydown', onKeyDown);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) { closeModal(overlay, onKeyDown); resolve(false); } });
    overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => { closeModal(overlay, onKeyDown); resolve(false); });
    overlay.querySelector('[data-modal-confirm]')?.addEventListener('click', () => { closeModal(overlay, onKeyDown); resolve(true); });
  });
}

function openEditModal(user, onSubmit) {
  if (!user?.email) return;
  if (document.querySelector('.modal-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Edit akun">
      <div class="modal-header">
        <h2 class="modal-title">Edit Akun</h2>
        <p class="modal-subtitle">Perbarui username atau email akun.</p>
      </div>
      <form class="modal-form" id="editUserForm">
        <div class="modal-field">
          <label class="modal-label" for="editEmail">Email Saat Ini</label>
          <input class="modal-input" id="editEmail" name="email" type="email" value="${user.email}" readonly />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="editUsername">Username</label>
          <input class="modal-input" id="editUsername" name="username" type="text" value="${user.username || ''}" placeholder="Username baru" />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="editNewEmail">Email Baru</label>
          <input class="modal-input" id="editNewEmail" name="newEmail" type="email" value="${user.email}" placeholder="Email baru" />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="editPassword">Password Baru</label>
          <input class="modal-input" id="editPassword" name="password" type="password" placeholder="Password baru" />
        </div>
        <div class="modal-actions">
          <button class="modal-btn" type="button" data-modal-cancel>Batalkan</button>
          <button class="modal-btn primary" type="submit">Simpan</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const onKeyDown = (event) => {
    if (event.key === 'Escape') closeModal(overlay, onKeyDown);
  };

  document.addEventListener('keydown', onKeyDown);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeModal(overlay, onKeyDown);
  });

  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => {
    closeModal(overlay, onKeyDown);
  });

  overlay.querySelector('#editUserForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      email: user.email,
      username: form.username.value.trim(),
      newEmail: form.newEmail.value.trim(),
      password: form.password.value.trim()
    };
    onSubmit(payload, () => closeModal(overlay, onKeyDown));
  });
}

function openCreateModal(onSubmit) {
  if (document.querySelector('.modal-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Buat user">
      <div class="modal-header">
        <h2 class="modal-title">Create User</h2>
        <p class="modal-subtitle">Isi data user baru untuk didaftarkan.</p>
      </div>
      <form class="modal-form" id="createUserForm">
        <div class="modal-field">
          <label class="modal-label" for="createUsername">Username</label>
          <input class="modal-input" id="createUsername" name="username" type="text" placeholder="Username" required />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="createEmail">Email</label>
          <input class="modal-input" id="createEmail" name="email" type="email" placeholder="Email" required />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="createPassword">Password</label>
          <input class="modal-input" id="createPassword" name="password" type="password" placeholder="Password" required />
        </div>
        <div class="modal-actions">
          <button class="modal-btn" type="button" data-modal-cancel>Batalkan</button>
          <button class="modal-btn primary" type="submit">Buat User</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const onKeyDown = (event) => {
    if (event.key === 'Escape') closeModal(overlay, onKeyDown);
  };

  document.addEventListener('keydown', onKeyDown);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeModal(overlay, onKeyDown);
  });

  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => {
    closeModal(overlay, onKeyDown);
  });

  overlay.querySelector('#createUserForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      username: form.username.value.trim(),
      email: form.email.value.trim(),
      password: form.password.value.trim()
    };
    onSubmit(payload, () => closeModal(overlay, onKeyDown));
  });
}

function openRoleModal(user, onSubmit) {
  if (!user?.email) return;
  if (document.querySelector('.modal-overlay')) return;

  const currentRole = normalizeRole(user.tipe_akun || user.role);
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Ganti role">
      <div class="modal-header">
        <h2 class="modal-title">Ganti Role</h2>
        <p class="modal-subtitle">Pilih role baru untuk akun.</p>
      </div>
      <form class="modal-form" id="roleForm">
        <div class="modal-field">
          <label class="modal-label" for="roleEmail">Email</label>
          <input class="modal-input" id="roleEmail" type="email" value="${user.email}" readonly />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="roleSelect">Role</label>
          <select class="modal-select" id="roleSelect" name="role">
            <option value="admin" ${currentRole === 'admin' ? 'selected' : ''}>Admin</option>
            <option value="organizer" ${currentRole === 'organizer' ? 'selected' : ''}>Organizer</option>
            <option value="user" ${currentRole === 'user' ? 'selected' : ''}>User</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="modal-btn" type="button" data-modal-cancel>Batalkan</button>
          <button class="modal-btn primary" type="submit">Simpan</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const onKeyDown = (event) => {
    if (event.key === 'Escape') closeModal(overlay, onKeyDown);
  };

  document.addEventListener('keydown', onKeyDown);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeModal(overlay, onKeyDown);
  });

  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => {
    closeModal(overlay, onKeyDown);
  });

  overlay.querySelector('#roleForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const role = form.role.value;
    onSubmit({ email: user.email, tipeAkun: role }, () => closeModal(overlay, onKeyDown));
  });
}

function openDeleteModal(email, onConfirm) {
  if (!email) return;
  if (document.querySelector('.modal-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Hapus akun">
      <div class="modal-header">
        <h2 class="modal-title">Hapus Akun</h2>
        <p class="modal-subtitle">Apakah kamu yakin ingin menghapus akun ini?</p>
      </div>
      <div class="modal-field">
        <label class="modal-label" for="deleteEmail">Email</label>
        <input class="modal-input" id="deleteEmail" type="email" value="${email}" readonly />
      </div>
      <div class="modal-actions">
        <button class="modal-btn" type="button" data-modal-cancel>Batalkan</button>
        <button class="modal-btn primary" type="button" data-modal-confirm>Hapus</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const onKeyDown = (event) => {
    if (event.key === 'Escape') closeModal(overlay, onKeyDown);
  };

  document.addEventListener('keydown', onKeyDown);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeModal(overlay, onKeyDown);
  });

  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => {
    closeModal(overlay, onKeyDown);
  });

  overlay.querySelector('[data-modal-confirm]')?.addEventListener('click', () => {
    const emailInput = overlay.querySelector('#deleteEmail');
    const emailValue = emailInput?.value.trim() || email;
    onConfirm(emailValue, () => closeModal(overlay, onKeyDown));
  });
}

async function fetchUsers(token) {
  const response = await fetch(API_CONFIG.getUsersUrl(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error(data.message || 'Gagal mengambil data user.');
  }

  return Array.isArray(data.data) ? data.data : [];
}

function formatRole(value) {
  const role = normalizeRole(value);
  if (role === 'admin') return 'Admin';
  if (role === 'organizer') return 'Organizer';
  return 'User';
}

function buildUserCard(user) {
  const card = document.createElement('div');
  card.className = 'card user-card';

  const userMain = document.createElement('div');
  userMain.className = 'user-main';

  const avatar = document.createElement('div');
  avatar.className = 'user-avatar';
  avatar.innerHTML = `
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c2.2-3.2 5-4.8 8-4.8s5.8 1.6 8 4.8" />
    </svg>
  `;

  const meta = document.createElement('div');
  meta.className = 'user-meta';

  const name = document.createElement('p');
  name.className = 'user-name';
  name.textContent = user.username || 'Tanpa Nama';

  const email = document.createElement('p');
  email.className = 'user-email';
  email.textContent = user.email || '-';

  meta.appendChild(name);
  meta.appendChild(email);

  userMain.appendChild(avatar);
  userMain.appendChild(meta);

  const roleWrap = document.createElement('div');
  roleWrap.className = 'user-role';
  const rolePill = document.createElement('span');
  rolePill.className = 'role-pill';
  rolePill.textContent = formatRole(user.tipe_akun || user.role);
  roleWrap.appendChild(rolePill);

  const actions = document.createElement('div');
  actions.className = 'user-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'icon-btn';
  editBtn.type = 'button';
  editBtn.dataset.userAction = 'edit';
  editBtn.dataset.email = user.email || '';
  editBtn.setAttribute('aria-label', 'Edit akun');
  editBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <path d="M4 20h4l10-10-4-4L4 16v4z" />
      <path d="M14 6l4 4" />
    </svg>
  `;

  const roleBtn = document.createElement('button');
  roleBtn.className = 'icon-btn';
  roleBtn.type = 'button';
  roleBtn.dataset.userAction = 'role';
  roleBtn.dataset.email = user.email || '';
  roleBtn.setAttribute('aria-label', 'Ganti role');
  roleBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <path d="M7 7h10" />
      <path d="M13 3l4 4-4 4" />
      <path d="M17 17H7" />
      <path d="M11 21l-4-4 4-4" />
    </svg>
  `;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'icon-btn danger';
  deleteBtn.type = 'button';
  deleteBtn.dataset.userAction = 'delete';
  deleteBtn.dataset.email = user.email || '';
  deleteBtn.setAttribute('aria-label', 'Hapus akun');
  deleteBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M8 10v8" />
      <path d="M12 10v8" />
      <path d="M16 10v8" />
    </svg>
  `;

  actions.appendChild(editBtn);
  actions.appendChild(roleBtn);
  actions.appendChild(deleteBtn);

  card.appendChild(userMain);
  card.appendChild(roleWrap);
  card.appendChild(actions);

  return card;
}

async function initUserManager(actualRole, token) {
  if (actualRole !== 'admin') return;

  const listEl = document.getElementById('userList');
  const emptyEl = document.getElementById('userEmpty');
  const paginationEl = document.getElementById('userPagination');
  const searchInput = document.getElementById('userSearchInput');
  const searchClear = document.getElementById('userSearchClear');

  if (!listEl || !emptyEl || !paginationEl) return;

  const state = {
    all: [],
    search: '',
    page: 1
  };

  function setEmpty(message, show) {
    emptyEl.textContent = message;
    emptyEl.classList.toggle('is-visible', show);
  }

  function applySearch() {
    const term = state.search.toLowerCase();
    return state.all.filter((user) => {
      const email = (user.email || '').toLowerCase();
      return email.includes(term);
    });
  }

  function renderPagination(totalPages) {
    paginationEl.innerHTML = '';
    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = `page-btn${state.page === 1 ? ' is-disabled' : ''}`;
    prevBtn.textContent = '<';
    prevBtn.dataset.page = String(state.page - 1);
    prevBtn.disabled = state.page === 1;
    paginationEl.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i += 1) {
      const btn = document.createElement('button');
      btn.className = `page-btn${i === state.page ? ' is-active' : ''}`;
      btn.textContent = String(i);
      btn.dataset.page = String(i);
      paginationEl.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = `page-btn${state.page === totalPages ? ' is-disabled' : ''}`;
    nextBtn.textContent = '>';
    nextBtn.dataset.page = String(state.page + 1);
    nextBtn.disabled = state.page === totalPages;
    paginationEl.appendChild(nextBtn);
  }

  function renderList() {
    const filtered = applySearch();
    const totalPages = Math.max(1, Math.ceil(filtered.length / USER_PAGE_SIZE));

    if (state.page > totalPages) {
      state.page = totalPages;
    }

    const start = (state.page - 1) * USER_PAGE_SIZE;
    const pageItems = filtered.slice(start, start + USER_PAGE_SIZE);

    listEl.innerHTML = '';
    if (filtered.length === 0) {
      setEmpty('Tidak ada data user.', true);
      paginationEl.innerHTML = '';
      return;
    }

    setEmpty('', false);
    pageItems.forEach((user) => listEl.appendChild(buildUserCard(user)));
    renderPagination(totalPages);
  }

  async function reloadUsers() {
    try {
      state.all = await fetchUsers(token);
      renderList();
    } catch (error) {
      console.error(error);
      setEmpty('Gagal memuat data user.', true);
      showToast(error.message || 'Gagal memuat data user.', 'error');
    }
  }

  async function handleDelete(email) {
    if (!email) return;

    const response = await fetch(API_CONFIG.getDeleteUserUrl(email), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Gagal menghapus akun.');
    }

    showToast('Akun berhasil dihapus.', 'success');
  }

  async function handleEdit(payload) {
    const body = {
      email: payload.email
    };

    if (payload.username) body.username = payload.username;
    if (payload.newEmail && payload.newEmail !== payload.email) body.newEmail = payload.newEmail;
    if (payload.password) body.password = payload.password;

    if (!body.username && !body.newEmail && !body.password) {
      showToast('Tidak ada perubahan yang disimpan.', 'info');
      return;
    }

    const response = await fetch(API_CONFIG.getUpdateUserUrl(payload.email), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Gagal memperbarui akun.');
    }

    showToast('Akun berhasil diperbarui.', 'success');
  }

  async function handleRoleChange(payload) {
    const response = await fetch(API_CONFIG.getUpdateRoleUrl(payload.email), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ email: payload.email, tipeAkun: payload.tipeAkun })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Gagal mengubah role akun.');
    }

    showToast('Role akun diperbarui.', 'success');
  }

  listEl.addEventListener('click', async (event) => {
    const btn = event.target.closest('button[data-user-action]');
    if (!btn) return;

    const action = btn.dataset.userAction;
    const email = btn.dataset.email;
    const user = state.all.find((item) => item.email === email);

    try {
      if (action === 'delete') {
        openDeleteModal(email, async (confirmedEmail, close) => {
          try {
            await handleDelete(confirmedEmail);
            close();
            await reloadUsers();
          } catch (modalError) {
            console.error(modalError);
            showToast(modalError.message || 'Gagal menghapus akun.', 'error');
          }
        });
        return;
      }
      if (action === 'edit') {
        openEditModal(user, async (payload, close) => {
          try {
            await handleEdit(payload);
            close();
            await reloadUsers();
          } catch (modalError) {
            console.error(modalError);
            showToast(modalError.message || 'Gagal memperbarui akun.', 'error');
          }
        });
        return;
      }
      if (action === 'role') {
        openRoleModal(user, async (payload, close) => {
          try {
            await handleRoleChange(payload);
            close();
            await reloadUsers();
          } catch (modalError) {
            console.error(modalError);
            showToast(modalError.message || 'Gagal mengubah role akun.', 'error');
          }
        });
        return;
      }
      await reloadUsers();
    } catch (error) {
      console.error(error);
      showToast(error.message || 'Aksi gagal dijalankan.', 'error');
    }
  });

  paginationEl.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-page]');
    if (!btn || btn.disabled) return;
    const nextPage = Number(btn.dataset.page);
    if (Number.isNaN(nextPage)) return;
    state.page = nextPage;
    renderList();
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      state.search = searchInput.value.trim();
      state.page = 1;
      renderList();
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      state.search = '';
      if (searchInput) searchInput.value = '';
      state.page = 1;
      renderList();
    });
  }

  const createBtn = document.getElementById('userCreateBtn');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      openCreateModal(async (payload, close) => {
        try {
          const response = await fetch(API_CONFIG.getRegisterUrl(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          const data = await response.json().catch(() => ({}));

          if (!response.ok) {
            throw new Error(data.message || 'Gagal membuat akun.');
          }

          showToast('User berhasil dibuat.', 'success');
          close();
          await reloadUsers();
        } catch (modalError) {
          console.error(modalError);
          showToast(modalError.message || 'Gagal membuat akun.', 'error');
        }
      });
    });
  }

  const userExportBtn = document.getElementById('userExportBtn');
  if (userExportBtn) {
    userExportBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = userExportBtn.parentElement.querySelector('.export-menu');
      if (menu) menu.classList.toggle('is-open');
    });
    userExportBtn.parentElement.querySelectorAll('.export-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        const format = opt.dataset.format;
        const q = document.getElementById('userSearchInput')?.value?.trim() || '';
        const filename = format === 'pdf' ? 'users.pdf' : 'users.xlsx';
        downloadExport(API_CONFIG.getExportUsersUrl({ q }, format), token, filename);
        opt.closest('.export-menu')?.classList.remove('is-open');
      });
    });
  }

  setEmpty('Memuat data user...', true);
  await reloadUsers();
}

function initActions(actualRole) {
  const actionButtons = document.querySelectorAll('[data-action]');
  actionButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'home') {
        clearPreviewRole();
        window.location.href = getDashboardUrl(actualRole);
        return;
      }
      if (action === 'logout') {
        clearAuth();
        redirectToLogin();
        return;
      }
      if (action === 'exit') {
        clearPreviewRole();
        window.location.href = buildPagesUrl('homepage/index.html');
        return;
      }
    });
  });

  const sideNav = $('#sideNav');
  if (sideNav) {
    sideNav.addEventListener('click', (event) => {
      const linkTarget = event.target.closest('a.side-link');
      if (linkTarget) return;
      const target = event.target.closest('button[data-nav]');
      if (!target) return;
      showToast('Menu belum tersedia.', 'info');
    });
  }
}

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
      var r = await fetch(API_CONFIG.getChangeAvatarUrl(), { method: 'PUT', headers: { Authorization: 'Bearer ' + token }, body: fd });
      var d = await r.json().catch(function () { return {}; });
      if (!r.ok) throw new Error(d.message || 'Gagal mengupload.');
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
      var r = await fetch(API_CONFIG.getChangeUsernameUrl(p.email), { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ email: p.email, newUsername: e.currentTarget.querySelector('#cuUsername').value.trim() }) });
      var d = await r.json().catch(function () { return {}; });
      if (!r.ok) throw new Error(d.message || 'Gagal.');
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
      var r = await fetch(API_CONFIG.getChangePasswordUrl(p.email), { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ email: p.email, oldPassword: f.querySelector('#cpOld').value, newPassword: f.querySelector('#cpNew').value }) });
      var d = await r.json().catch(function () { return {}; });
      if (!r.ok) throw new Error(d.message || 'Gagal.');
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
      var r = await fetch(API_CONFIG.getDeleteUserUrl(p.email), { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ email: p.email }) });
      var d = await r.json().catch(function () { return {}; });
      if (!r.ok) throw new Error(d.message || 'Gagal.');
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
      var r = await fetch(API_CONFIG.getProfileUrl(), { method: 'GET', headers: { Authorization: 'Bearer ' + token } });
      var d = await r.json().catch(function () { return {}; });
      if (!r.ok) throw new Error(d.message || 'Gagal.');
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

/* ADMIN SUMMARY */
async function fetchAdminSummary(token) {
  var r = await fetch(API_CONFIG.getDashboardSummaryUrl(), { method: 'GET', headers: { Authorization: 'Bearer ' + token } });
  var d = await r.json().catch(function () { return {}; });
  if (!r.ok) throw new Error(d.message || 'Gagal.');
  return d.data || {};
}

async function initAdminSummary(token) {
  var fields = ['totalUser', 'totalAcara', 'totalAbsensi', 'tingkatKehadiran'];
  var has = fields.some(function (k) { return document.querySelector('[data-summary="' + k + '"]'); });
  if (!has) return;
  fields.forEach(function (k) { var el = document.querySelector('[data-summary="' + k + '"]'); if (el) el.textContent = '-'; });
  try {
    var s = await fetchAdminSummary(token);
    fields.forEach(function (k) { var el = document.querySelector('[data-summary="' + k + '"]'); if (el) el.textContent = s[k] != null ? s[k] : 'Data Kosong'; });
  } catch (e) {
    fields.forEach(function (k) { var el = document.querySelector('[data-summary="' + k + '"]'); if (el) el.textContent = 'Data Kosong'; });
  }
}

async function initDashboard() {
  const requiredRole = getRequiredRole();
  const token = localStorage.getItem('authToken');
  if (!token) {
    redirectToLogin();
    return;
  }

  setLoading(true);

  try {
    const profile = await fetchProfile(token);
    const actualRole = getRoleFromProfile(profile);
    const previewRole = getPreviewRole();

    if (requiredRole === 'router') {
      var isProfile = document.body && document.body.dataset && document.body.dataset.page === 'profile';
      if (isProfile) {
        applyProfile(profile, actualRole, actualRole);
        initActions(actualRole);
        await initProfile(token);
        return;
      }

      var isAbsensi = document.body && document.body.dataset && document.body.dataset.page === 'absensi';
      if (isAbsensi) {
        applyProfile(profile, actualRole, actualRole);
        initActions(actualRole);
        await initAbsensi(actualRole, token);
        return;
      }

      var isAbsensiLogs = document.body && document.body.dataset && document.body.dataset.page === 'absensi-logs';
      if (isAbsensiLogs) {
        applyProfile(profile, actualRole, actualRole);
        initActions(actualRole);
        await initAbsensiLogs(actualRole, token);
        return;
      }

      var isOrgAcara = document.body && document.body.dataset && document.body.dataset.page === 'organizer-acara';
      if (isOrgAcara) {
        applyProfile(profile, actualRole, actualRole);
        initActions(actualRole);
        await initOrganizerAcara(actualRole, token);
        return;
      }

      var isAcaraDetail = document.body && document.body.dataset && document.body.dataset.page === 'acara-detail';
      if (isAcaraDetail) {
        applyProfile(profile, actualRole, actualRole);
        initActions(actualRole);
        await initAcaraDetail(actualRole, token);
        return;
      }

      var isUserAcaraList = document.body && document.body.dataset && document.body.dataset.page === 'user-acara-list';
      if (isUserAcaraList) {
        applyProfile(profile, actualRole, actualRole);
        initActions(actualRole);
        await initUserAcaraList(actualRole, token);
        return;
      }

      var isUserAcaraSaya = document.body && document.body.dataset && document.body.dataset.page === 'user-acara-saya';
      if (isUserAcaraSaya) {
        applyProfile(profile, actualRole, actualRole);
        initActions(actualRole);
        await initUserAcaraSaya(actualRole, token);
        return;
      }

      clearPreviewRole();
      window.location.href = getDashboardUrl(actualRole);
      return;
    }

    if (actualRole !== 'admin') {
      if (requiredRole !== actualRole) {
        clearPreviewRole();
        window.location.href = getDashboardUrl(actualRole);
        return;
      }

      applyProfile(profile, actualRole, actualRole);
      initActions(actualRole);
      if (document.querySelector('[data-summary="totalAcara"]')) {
        await initOrganizerSummary(token);
      }
      return;
    }

    if (requiredRole === 'admin') {
      clearPreviewRole();
      applyProfile(profile, 'admin', actualRole);
      initActions(actualRole);
      await initAdminSummary(token);
      await initUserManager(actualRole, token);
      await initAcara(actualRole, token);
      return;
    }

    if (isPreviewRole(requiredRole)) {
      if (previewRole !== requiredRole) {
        setPreviewRole(requiredRole);
      }
      applyProfile(profile, requiredRole, actualRole);
      initActions(actualRole);
      return;
    }

    window.location.href = getDashboardUrl(actualRole);
  } catch (error) {
    clearAuth();
    redirectToLogin();
    return;
  } finally {
    setLoading(false);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
});

document.addEventListener('click', (event) => {
  document.querySelectorAll('.export-menu.is-open').forEach((menu) => {
    if (!event.target.closest('.export-dropdown')) {
      menu.classList.remove('is-open');
    }
  });
});

/* ============================================================
   DASHBOARD — Admin Summary
============================================================ */

async function fetchAdminSummary(token) {
  const response = await fetch(API_CONFIG.getDashboardSummaryUrl(), {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Gagal mengambil ringkasan.');
  }

  return data?.data || {};
}

async function initAdminSummary(token) {
  const fields = ['totalUser', 'totalAcara', 'totalAbsensi', 'tingkatKehadiran'];
  const hasAnyField = fields.some((key) => document.querySelector(`[data-summary="${key}"]`));
  if (!hasAnyField) return;

  fields.forEach((key) => {
    const el = document.querySelector(`[data-summary="${key}"]`);
    if (el) el.textContent = '-';
  });

  try {
    const summary = await fetchAdminSummary(token);
    fields.forEach((key) => {
      const el = document.querySelector(`[data-summary="${key}"]`);
      if (el) {
        el.textContent = summary[key] ?? 'Data Kosong';
      }
    });
  } catch (error) {
    console.error(error);
    fields.forEach((key) => {
      const el = document.querySelector(`[data-summary="${key}"]`);
      if (el) el.textContent = 'Data Kosong';
    });
  }
}

async function initOrganizerSummary(token) {
  const fields = ['totalAcara', 'totalPeserta', 'totalAbsensi'];
  try {
    const resp = await fetch(API_CONFIG.getOrganizerSummaryUrl(), {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await resp.json().catch(() => ({}));
    if (resp.ok) {
      const summary = data.data || {};
      fields.forEach((key) => {
        const el = document.querySelector(`[data-summary="${key}"]`);
        if (el) el.textContent = summary[key] ?? '-';
      });
    }
  } catch (err) {
    console.error(err);
  }

  // Load agenda
  const agendaList = document.getElementById('orgAgendaList');
  const agendaEmpty = document.getElementById('orgAgendaEmpty');
  if (!agendaList) return;

  try {
    const resp = await fetch(API_CONFIG.getAcaraUrl(), {
      headers: { Authorization: `Bearer ${token}` }
    });
    const d = await resp.json().catch(() => ({}));
    const acaras = resp.ok ? (Array.isArray(d.data) ? d.data : []) : [];
    if (agendaEmpty) {
      agendaEmpty.classList.toggle('is-visible', acaras.length === 0);
      agendaEmpty.textContent = 'Belum ada acara.';
    }
    acaras.slice(0, 4).forEach((acara) => {
      const card = document.createElement('div');
      card.className = 'card event-card';
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        window.location.href = buildPagesUrl(`dashboard/organizer/acara-detail.html?id=${acara.id_acara}`);
      });
      card.innerHTML = `
        <div class="event-left">
          <div class="event-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M7 3v4M17 3v4M3 10h18" />
            </svg>
          </div>
          <div class="event-info">
            <p class="event-title">${acara.judul || '-'}</p>
            <p class="event-meta">${formatDateTime(acara.tanggal_mulai)}</p>
            <p class="event-location">${acara.lokasi || '-'}</p>
          </div>
        </div>
        <span class="status-pill status-${getAcaraStatus(acara)}">${ACARA_STATUS_LABEL[getAcaraStatus(acara)] || getAcaraStatus(acara)}</span>`;
      agendaList.appendChild(card);
    });
  } catch (_) {}
}

const ACARA_PAGE_SIZE = 8;

const ACARA_STATUS_LABEL = {
  'selesai': 'Selesai',
  'berlangsung': 'Berlangsung',
  'akan-datang': 'Akan Datang'
};

/* ============================================================
   ACARA — Helpers
============================================================ */

/**
 * Tentukan status acara berdasarkan tanggal mulai & akhir.
 * @param {string} tanggalMulai
 * @param {string} tanggalAkhir
 * @returns {'selesai'|'berlangsung'|'akan-datang'}
 */
function deriveAcaraStatus(tanggalMulai, tanggalAkhir) {
  const now = new Date();
  const start = parseSqlDate(tanggalMulai);
  const end = parseSqlDate(tanggalAkhir);
  if (end <= now) return 'selesai';
  if (start <= now && now < end) return 'berlangsung';
  return 'akan-datang';
}

function getAcaraStatus(acara) {
  const status = (acara?.status || '').trim();
  if (status) return status;
  return deriveAcaraStatus(acara?.tanggal_mulai, acara?.tanggal_akhir);
}

function parseSqlDate(value) {
  if (!value) return new Date('');
  if (value instanceof Date) return value;
  if (typeof value !== 'string') return new Date(value);

  const normalized = value.trim().replace('T', ' ');
  const parts = normalized.split(/[- :]/).map((item) => Number(item));
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return new Date(value);

  const [year, month, day, hour = 0, minute = 0, second = 0] = parts;
  return new Date(year, month - 1, day, hour, minute, second);
}

/**
 * Format tanggal + jam ke string bahasa Indonesia.
 * @param {string} dateStr
 * @returns {string}
 */
function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const d = parseSqlDate(dateStr);
  const tgl = d.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
  const jam = d.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit'
  });
  return `${tgl} ${jam}`;
}

/**
 * Konversi datetime string ke format datetime-local input (YYYY-MM-DDTHH:MM).
 * @param {string} dateStr
 * @returns {string}
 */
function toDatetimeLocal(dateStr) {
  if (!dateStr) return '';
  const d = parseSqlDate(dateStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}


/* ============================================================
   ACARA — Fetch
============================================================ */

/**
 * Ambil semua acara dari backend.
 * @param {string} token
 * @returns {Promise<Array>}
 */
async function fetchAcara(token) {
  const response = await fetch(API_CONFIG.getAcaraUrl(), {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error(data.message || 'Gagal mengambil data acara.');
  }

  return Array.isArray(data.data) ? data.data : [];
}

/* ============================================================
   ACARA — Build Card
============================================================ */

/**
 * Buat elemen card untuk satu acara.
 * @param {Object} acara
 * @param {number} index - nomor urut (1-based)
 * @returns {HTMLElement}
 */
function buildAcaraCard(acara, index) {
  const status = getAcaraStatus(acara);
  const statusText = ACARA_STATUS_LABEL[status] || status;

  const card = document.createElement('div');
  card.className = 'card acara-card';
  card.dataset.id = acara.id_acara || '';

  card.innerHTML = `
    <div class="acara-num">${index}</div>
 
    <div class="acara-main">
      <div class="acara-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
             stroke="currentColor" stroke-width="1.6">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M7 3v4M17 3v4M3 10h18" />
        </svg>
      </div>
      <div class="acara-meta">
        <p class="acara-title">${acara.judul || 'Tanpa Judul'}</p>
        <p class="acara-date">
          ${formatDateTime(acara.tanggal_mulai)} &ndash; ${formatDateTime(acara.tanggal_akhir)}
        </p>
        <p class="acara-location">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none"
               stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          ${acara.lokasi || '-'}
        </p>
      </div>
    </div>
 
    <div class="acara-detail">
      <div class="status-dropdown" data-status-dropdown>
        <button class="status-pill status-${status} status-trigger" type="button"
                data-status-trigger
                data-id="${acara.id_acara || ''}"
                aria-haspopup="listbox"
                aria-expanded="false">
          ${statusText}
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <div class="status-menu" role="listbox" aria-label="Ubah status">
          <button class="status-option" type="button" data-status-value="akan-datang" data-id="${acara.id_acara || ''}">Akan Datang</button>
          <button class="status-option" type="button" data-status-value="berlangsung" data-id="${acara.id_acara || ''}">Berlangsung</button>
          <button class="status-option" type="button" data-status-value="selesai" data-id="${acara.id_acara || ''}">Selesai</button>
        </div>
      </div>
      <p class="acara-peserta">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none"
             stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
        ${acara.maks_pengunjung ?? '-'} Maks. Peserta
      </p>
    </div>
 
    <div class="acara-actions user-actions">
      <button class="icon-btn" type="button"
              data-acara-action="edit"
              data-id="${acara.id_acara || ''}"
              aria-label="Edit acara">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
             stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M4 20h4l10-10-4-4L4 16v4z" />
          <path d="M14 6l4 4" />
        </svg>
      </button>
      <button class="icon-btn danger" type="button"
              data-acara-action="delete"
              data-id="${acara.id_acara || ''}"
              aria-label="Hapus acara">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
             stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M8 10v8M12 10v8M16 10v8" />
        </svg>
      </button>
    </div>
  `;

  return card;
}

/* ============================================================
   ACARA — Modals
============================================================ */

/**
 * Modal: Buat Acara Baru
 */
function openCreateAcaraModal(onSubmit) {
  if (document.querySelector('.modal-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Buat acara baru">
      <div class="modal-header">
        <h2 class="modal-title">Buat Acara Baru</h2>
        <p class="modal-subtitle">Isi detail acara yang akan dibuat.</p>
      </div>
      <form class="modal-form" id="createAcaraForm">
        <div class="modal-field">
          <label class="modal-label" for="ca_judul">Judul Acara</label>
          <input class="modal-input" id="ca_judul" name="judul"
                 type="text" placeholder="Contoh: Seminar Kepemimpinan" required />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="ca_lokasi">Lokasi</label>
          <input class="modal-input" id="ca_lokasi" name="lokasi"
                 type="text" placeholder="Contoh: Aula Gedung B" required />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="ca_mulai">Tanggal Mulai</label>
          <input class="modal-input" id="ca_mulai" name="tanggal_mulai"
                 type="datetime-local" required />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="ca_akhir">Tanggal Akhir</label>
          <input class="modal-input" id="ca_akhir" name="tanggal_akhir"
                 type="datetime-local" required />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="ca_maks">Maks. Pengunjung</label>
          <input class="modal-input" id="ca_maks" name="maks_pengunjung"
                 type="number" min="1" placeholder="Contoh: 100" required />
        </div>
        <div class="modal-actions">
          <button class="modal-btn" type="button" data-modal-cancel>Batalkan</button>
          <button class="modal-btn primary" type="submit">Buat Acara</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const onKeyDown = (e) => { if (e.key === 'Escape') closeModal(overlay, onKeyDown); };
  document.addEventListener('keydown', onKeyDown);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay, onKeyDown); });
  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => closeModal(overlay, onKeyDown));

  overlay.querySelector('#createAcaraForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget;

    // Validasi: tanggal akhir harus setelah tanggal mulai
    if (new Date(f.tanggal_akhir.value) <= new Date(f.tanggal_mulai.value)) {
      showToast('Tanggal akhir harus setelah tanggal mulai.', 'error');
      return;
    }

    const payload = {
      judul: f.judul.value.trim(),
      lokasi: f.lokasi.value.trim(),
      tanggal_mulai: f.tanggal_mulai.value.replace('T', ' ') + ':00',
      tanggal_akhir: f.tanggal_akhir.value.replace('T', ' ') + ':00',
      maks_pengunjung: Number(f.maks_pengunjung.value)
    };

    onSubmit(payload, () => closeModal(overlay, onKeyDown));
  });
}

/**
 * Modal: Edit Acara
 */
function openEditAcaraModal(acara, onSubmit) {
  if (!acara?.id_acara) return;
  if (document.querySelector('.modal-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Edit acara">
      <div class="modal-header">
        <h2 class="modal-title">Edit Acara</h2>
        <p class="modal-subtitle">Perbarui detail acara.</p>
      </div>
      <form class="modal-form" id="editAcaraForm">
        <div class="modal-field">
          <label class="modal-label" for="ea_judul">Judul Acara</label>
          <input class="modal-input" id="ea_judul" name="judul"
                 type="text" value="${acara.judul || ''}" required />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="ea_lokasi">Lokasi</label>
          <input class="modal-input" id="ea_lokasi" name="lokasi"
                 type="text" value="${acara.lokasi || ''}" required />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="ea_mulai">Tanggal Mulai</label>
          <input class="modal-input" id="ea_mulai" name="tanggal_mulai"
                 type="datetime-local"
                 value="${toDatetimeLocal(acara.tanggal_mulai)}" required />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="ea_akhir">Tanggal Akhir</label>
          <input class="modal-input" id="ea_akhir" name="tanggal_akhir"
                 type="datetime-local"
                 value="${toDatetimeLocal(acara.tanggal_akhir)}" required />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="ea_maks">Maks. Pengunjung</label>
          <input class="modal-input" id="ea_maks" name="maks_pengunjung"
                 type="number" min="1"
                 value="${acara.maks_pengunjung ?? ''}" required />
        </div>
        <div class="modal-actions">
          <button class="modal-btn" type="button" data-modal-cancel>Batalkan</button>
          <button class="modal-btn primary" type="submit">Simpan</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const onKeyDown = (e) => { if (e.key === 'Escape') closeModal(overlay, onKeyDown); };
  document.addEventListener('keydown', onKeyDown);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay, onKeyDown); });
  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => closeModal(overlay, onKeyDown));

  overlay.querySelector('#editAcaraForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget;

    if (new Date(f.tanggal_akhir.value) <= new Date(f.tanggal_mulai.value)) {
      showToast('Tanggal akhir harus setelah tanggal mulai.', 'error');
      return;
    }

    const payload = {
      judul: f.judul.value.trim(),
      lokasi: f.lokasi.value.trim(),
      tanggal_mulai: f.tanggal_mulai.value.replace('T', ' ') + ':00',
      tanggal_akhir: f.tanggal_akhir.value.replace('T', ' ') + ':00',
      maks_pengunjung: Number(f.maks_pengunjung.value)
    };

    onSubmit(acara.id_acara, payload, () => closeModal(overlay, onKeyDown));
  });
}

/**
 * Modal: Konfirmasi Hapus Acara
 */
function openDeleteAcaraModal(acara, onConfirm) {
  if (!acara?.id_acara) return;
  if (document.querySelector('.modal-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Hapus acara">
      <div class="modal-header">
        <h2 class="modal-title">Hapus Acara</h2>
        <p class="modal-subtitle">
          Tindakan ini tidak dapat dibatalkan. Acara berikut akan dihapus permanen.
        </p>
      </div>
      <div class="modal-field">
        <label class="modal-label">Judul Acara</label>
        <input class="modal-input" type="text" value="${acara.judul || ''}" readonly />
      </div>
      <div class="modal-field">
        <label class="modal-label">Lokasi</label>
        <input class="modal-input" type="text" value="${acara.lokasi || ''}" readonly />
      </div>
      <div class="modal-actions">
        <button class="modal-btn" type="button" data-modal-cancel>Batalkan</button>
        <button class="modal-btn primary" type="button" data-modal-confirm>Hapus</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const onKeyDown = (e) => { if (e.key === 'Escape') closeModal(overlay, onKeyDown); };
  document.addEventListener('keydown', onKeyDown);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay, onKeyDown); });
  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => closeModal(overlay, onKeyDown));
  overlay.querySelector('[data-modal-confirm]')?.addEventListener('click', () => {
    onConfirm(acara.id_acara, () => closeModal(overlay, onKeyDown));
  });
}

/* ============================================================
   ACARA — Init
============================================================ */

/**
 * Inisialisasi halaman manajemen acara.
 * Hanya berjalan jika elemen #acaraList ada di DOM (halaman acara.html).
 *
 * @param {string} actualRole
 * @param {string} token
 */
async function initAcara(actualRole, token) {
  // Guard: hanya berjalan di halaman acara.html
  const listEl = document.getElementById('acaraList');
  const emptyEl = document.getElementById('acaraEmpty');
  const paginationEl = document.getElementById('acaraPagination');
  const searchInput = document.getElementById('acaraSearchInput');
  const searchClear = document.getElementById('acaraSearchClear');
  const statusFilter = document.getElementById('acaraStatusFilter');

  if (!listEl || !emptyEl || !paginationEl) return;

  // State halaman
  const state = {
    all: [],   // semua data dari API
    search: '',   // kata kunci pencarian
    status: '',   // filter status
    page: 1     // halaman aktif
  };

  /* ── helpers ── */
  function setEmpty(message, show) {
    emptyEl.textContent = message;
    emptyEl.classList.toggle('is-visible', show);
  }

  function applyFilter() {
    return state.all.filter((acara) => {
      const matchSearch = !state.search ||
        (acara.judul || '').toLowerCase().includes(state.search.toLowerCase());
      const matchStatus = !state.status || getAcaraStatus(acara) === state.status;
      return matchSearch && matchStatus;
    });
  }

  function renderPagination(totalPages) {
    paginationEl.innerHTML = '';
    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = `page-btn${state.page === 1 ? ' is-disabled' : ''}`;
    prevBtn.textContent = '<';
    prevBtn.dataset.page = String(state.page - 1);
    prevBtn.disabled = state.page === 1;
    paginationEl.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = `page-btn${i === state.page ? ' is-active' : ''}`;
      btn.textContent = String(i);
      btn.dataset.page = String(i);
      paginationEl.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = `page-btn${state.page === totalPages ? ' is-disabled' : ''}`;
    nextBtn.textContent = '>';
    nextBtn.dataset.page = String(state.page + 1);
    nextBtn.disabled = state.page === totalPages;
    paginationEl.appendChild(nextBtn);
  }

  function renderList() {
    const filtered = applyFilter();
    const totalPages = Math.max(1, Math.ceil(filtered.length / ACARA_PAGE_SIZE));

    if (state.page > totalPages) state.page = totalPages;

    const start = (state.page - 1) * ACARA_PAGE_SIZE;
    const pageItems = filtered.slice(start, start + ACARA_PAGE_SIZE);

    listEl.innerHTML = '';

    if (filtered.length === 0) {
      setEmpty('Belum ada acara yang sesuai.', true);
      paginationEl.innerHTML = '';
      return;
    }

    setEmpty('', false);
    pageItems.forEach((acara, i) => {
      listEl.appendChild(buildAcaraCard(acara, start + i + 1));
    });
    renderPagination(totalPages);
  }

  async function reloadAcara() {
    try {
      state.all = await fetchAcara(token);
      renderList();
    } catch (error) {
      console.error(error);
      setEmpty('Gagal memuat data acara.', true);
      showToast(error.message || 'Gagal memuat data acara.', 'error');
    }
  }

  /* ── API handlers ── */
  async function handleCreate(payload) {
    const response = await fetch(API_CONFIG.getCreateAcaraUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Gagal membuat acara.');
    showToast('Acara berhasil dibuat.', 'success');
  }

  async function handleUpdate(id, payload) {
    const response = await fetch(API_CONFIG.getUpdateAcaraUrl(id), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Gagal memperbarui acara.');
    showToast('Acara berhasil diperbarui.', 'success');
  }

  async function handleStatusUpdate(acaraId, nextStatus) {
    const response = await fetch(API_CONFIG.getUpdateAcaraStatusUrl(acaraId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: nextStatus })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Gagal memperbarui status acara.');
    showToast('Status acara diperbarui.', 'success');
  }

  async function handleDelete(id) {
    const response = await fetch(API_CONFIG.getDeleteAcaraUrl(id), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Gagal menghapus acara.');
    showToast('Acara berhasil dihapus.', 'success');
  }

  /* ── Event: aksi pada card (edit / delete) ── */
  listEl.addEventListener('click', async (event) => {
    const statusToggle = event.target.closest('button[data-status-trigger]');
    if (statusToggle) {
      const dropdown = statusToggle.closest('[data-status-dropdown]');
      const expanded = statusToggle.getAttribute('aria-expanded') === 'true';

      document.querySelectorAll('[data-status-dropdown].is-open').forEach((node) => {
        if (node !== dropdown) {
          node.classList.remove('is-open');
          node.querySelector('[data-status-trigger]')?.setAttribute('aria-expanded', 'false');
        }
      });

      if (dropdown) {
        dropdown.classList.toggle('is-open', !expanded);
        statusToggle.setAttribute('aria-expanded', String(!expanded));
      }
      return;
    }

    const statusOption = event.target.closest('button[data-status-value]');
    if (statusOption) {
      const nextStatus = statusOption.dataset.statusValue;
      const acaraId = statusOption.dataset.id;
      const dropdown = statusOption.closest('[data-status-dropdown]');
      if (dropdown) {
        dropdown.classList.remove('is-open');
        dropdown.querySelector('[data-status-trigger]')?.setAttribute('aria-expanded', 'false');
      }

      try {
        await handleStatusUpdate(acaraId, nextStatus);
        await reloadAcara();
      } catch (err) {
        showToast(err.message || 'Gagal memperbarui status acara.', 'error');
      }
      return;
    }

    const btn = event.target.closest('button[data-acara-action]');
    if (!btn) return;

    const action = btn.dataset.acaraAction;
    const id = btn.dataset.id;
    const acara = state.all.find((a) => String(a.id_acara) === String(id));

    try {
      if (action === 'edit') {
        openEditAcaraModal(acara, async (acaraId, payload, close) => {
          try {
            await handleUpdate(acaraId, payload);
            close();
            await reloadAcara();
          } catch (err) {
            showToast(err.message || 'Gagal memperbarui acara.', 'error');
          }
        });
        return;
      }

      if (action === 'delete') {
        openDeleteAcaraModal(acara, async (acaraId, close) => {
          try {
            await handleDelete(acaraId);
            close();
            await reloadAcara();
          } catch (err) {
            showToast(err.message || 'Gagal menghapus acara.', 'error');
          }
        });
        return;
      }
    } catch (error) {
      console.error(error);
      showToast(error.message || 'Aksi gagal dijalankan.', 'error');
    }
  });

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-status-dropdown]')) return;
    document.querySelectorAll('[data-status-dropdown].is-open').forEach((node) => {
      node.classList.remove('is-open');
      node.querySelector('[data-status-trigger]')?.setAttribute('aria-expanded', 'false');
    });
  });

  /* ── Event: pagination ── */
  paginationEl.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-page]');
    if (!btn || btn.disabled) return;
    const next = Number(btn.dataset.page);
    if (Number.isNaN(next)) return;
    state.page = next;
    renderList();
  });

  /* ── Event: search ── */
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      state.search = searchInput.value.trim();
      state.page = 1;
      renderList();
    });
  }

  /* ── Event: filter status ── */
  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      state.status = statusFilter.value;
      state.page = 1;
      renderList();
    });
  }

  /* ── Event: reset ── */
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      state.search = '';
      state.status = '';
      state.page = 1;
      if (searchInput) searchInput.value = '';
      if (statusFilter) statusFilter.value = '';
      renderList();
    });
  }

  /* ── Event: tombol buat acara ── */
  const createBtn = document.getElementById('acaraCreateBtn');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      openCreateAcaraModal(async (payload, close) => {
        try {
          await handleCreate(payload);
          close();
          await reloadAcara();
        } catch (err) {
          showToast(err.message || 'Gagal membuat acara.', 'error');
        }
      });
    });
  }

  const acaraExportBtn = document.getElementById('acaraExportBtn');
  if (acaraExportBtn) {
    acaraExportBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = acaraExportBtn.parentElement.querySelector('.export-menu');
      if (menu) menu.classList.toggle('is-open');
    });
    acaraExportBtn.parentElement.querySelectorAll('.export-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        const format = opt.dataset.format;
        const status = document.getElementById('acaraStatusFilter')?.value || '';
        const filename = format === 'pdf' ? 'acara.pdf' : 'acara.xlsx';
        downloadExport(API_CONFIG.getExportAcaraUrl({ status }, format), token, filename);
        opt.closest('.export-menu')?.classList.remove('is-open');
      });
    });
  }

  /* ── Initial load ── */
  setEmpty('Memuat data acara...', true);
  await reloadAcara();
}

/* ============================================================
   ABSENSI — Init
============================================================ */

const ABSENSI_STATUS_LABEL = {
  pending: 'Menunggu',
  dimulai: 'Dimulai',
  berakhir: 'Berakhir'
};

const ABSENSI_QR_STATUS_LABEL = {
  pending: 'Belum Aktif',
  active: 'Aktif',
  expired: 'Kadaluarsa'
};

function buildAbsensiCard(absensi, index) {
  const status = absensi.status || 'pending';
  const statusText = ABSENSI_STATUS_LABEL[status] || status;
  const qrStatus = absensi.status_qr || 'pending';
  const qrText = ABSENSI_QR_STATUS_LABEL[qrStatus] || qrStatus;

  const card = document.createElement('div');
  card.className = 'card absensi-card';
  card.dataset.id = absensi.id_absensi || '';

  card.innerHTML = `
    <div class="absensi-num">${index}</div>
    <div class="absensi-main">
      <div class="absensi-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M9 12l2 2 4-4" />
          <rect x="3" y="4" width="18" height="16" rx="2" />
        </svg>
      </div>
      <div class="absensi-meta">
        <p class="absensi-title">${absensi.judul || 'Tanpa Judul'}</p>
        <p class="absensi-date">${formatDateTime(absensi.mulai_absen)} &ndash; ${formatDateTime(absensi.akhir_absen)}</p>
      </div>
    </div>
    <div class="absensi-detail">
      <div class="absensi-badges">
        <span class="absensi-status-badge absensi-status-${status}">${statusText}</span>
        <span class="absensi-qr-badge absensi-qr-${qrStatus}">QR: ${qrText}</span>
      </div>
    </div>
    <div class="absensi-actions user-actions">
      <button class="icon-btn" type="button"
              data-absensi-action="qr"
              data-id="${absensi.id_absensi || ''}"
              aria-label="Generate QR">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <path d="M10 3v18M3 10h18" stroke-dasharray="2 2" />
        </svg>
      </button>
      <button class="icon-btn" type="button"
              data-absensi-action="logs"
              data-id="${absensi.id_absensi || ''}"
              aria-label="Lihat log absensi">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h12" />
        </svg>
      </button>
      <button class="icon-btn danger" type="button"
              data-absensi-action="delete"
              data-id="${absensi.id_absensi || ''}"
              aria-label="Hapus absensi">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M10 10v6M14 10v6" />
        </svg>
      </button>
    </div>
  `;

  return card;
}

function openCreateAbsensiModal(acaraList, onSubmit) {
  if (document.querySelector('.modal-overlay')) return;

  const acaraOptions = acaraList.map((a) =>
    `<option value="${a.id_acara}">${a.judul}</option>`
  ).join('');

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Buat absensi baru">
      <div class="modal-header">
        <h2 class="modal-title">Buat Absensi Baru</h2>
        <p class="modal-subtitle">Isi detail sesi absensi untuk acara yang dipilih.</p>
      </div>
      <form class="modal-form" id="createAbsensiForm">
        <div class="modal-field">
          <label class="modal-label" for="ca_acara">Acara</label>
          <select class="modal-select" id="ca_acara" name="id_acara" required>
            <option value="">-- Pilih Acara --</option>
            ${acaraOptions}
          </select>
        </div>
        <div class="modal-field">
          <label class="modal-label" for="ca_judul">Judul Absensi</label>
          <input class="modal-input" id="ca_judul" name="judul" type="text" placeholder="Contoh: Sesi 1" required />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="ca_mulai">Mulai Absen</label>
          <input class="modal-input" id="ca_mulai" name="mulai_absen" type="datetime-local" required />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="ca_akhir">Akhir Absen</label>
          <input class="modal-input" id="ca_akhir" name="akhir_absen" type="datetime-local" required />
        </div>
        <div class="modal-actions">
          <button class="modal-btn" type="button" data-modal-cancel>Batalkan</button>
          <button class="modal-btn primary" type="submit">Buat Absensi</button>
        </div>
      </form>
    </div>`;

  document.body.appendChild(overlay);
  const onKeyDown = (e) => { if (e.key === 'Escape') closeModal(overlay, onKeyDown); };
  document.addEventListener('keydown', onKeyDown);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay, onKeyDown); });
  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => closeModal(overlay, onKeyDown));

  overlay.querySelector('#createAbsensiForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget;

    if (new Date(f.akhir_absen.value) <= new Date(f.mulai_absen.value)) {
      showToast('Akhir absen harus setelah mulai absen.', 'error');
      return;
    }

    const payload = {
      id_acara: Number(f.id_acara.value),
      judul: f.judul.value.trim(),
      mulai_absen: f.mulai_absen.value.replace('T', ' ') + ':00',
      akhir_absen: f.akhir_absen.value.replace('T', ' ') + ':00'
    };

    onSubmit(payload, () => closeModal(overlay, onKeyDown));
  });
}

function openAbsensiQrModal(qrData) {
  if (document.querySelector('.modal-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="QR Code Absensi">
      <div class="modal-header">
        <h2 class="modal-title">QR Code Absensi</h2>
        <p class="modal-subtitle">Scan QR atau bagikan link ke peserta.</p>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:18px;padding:18px 0">
        <div class="qr-wrapper" style="width:200px;height:200px;border:2px solid var(--border);border-radius:16px;display:flex;align-items:center;justify-content:center;background:#ffffff;padding:12px">
          ${qrData.qr_svg || '<p style="color:var(--muted);font-size:0.85rem">QR tidak tersedia</p>'}
        </div>
        <div style="width:100%;display:grid;gap:8px">
          <label class="modal-label" style="text-align:center;color:var(--muted)">Link Absensi</label>
          <div style="display:flex;gap:8px">
            <input class="modal-input" id="qrLinkInput" type="text" value="${qrData.qr_link || ''}" readonly
                   style="flex:1;font-size:0.82rem" />
            <button class="modal-btn primary" type="button" id="qrCopyBtn">Salin</button>
          </div>
          <p style="text-align:center;font-size:0.8rem;color:var(--muted)">
            ${qrData.qr_expires_at ? 'Berlaku hingga: ' + formatDateTime(qrData.qr_expires_at) : ''}
          </p>
        </div>
      </div>
      <div class="modal-actions">
        <button class="modal-btn" type="button" data-modal-cancel>Tutup</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  const onKeyDown = (e) => { if (e.key === 'Escape') closeModal(overlay, onKeyDown); };
  document.addEventListener('keydown', onKeyDown);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay, onKeyDown); });
  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => closeModal(overlay, onKeyDown));

  const copyBtn = overlay.querySelector('#qrCopyBtn');
  const linkInput = overlay.querySelector('#qrLinkInput');
  if (copyBtn && linkInput) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(linkInput.value);
        copyBtn.textContent = 'Tersalin!';
        setTimeout(() => { copyBtn.textContent = 'Salin'; }, 2000);
      } catch (_) {
        linkInput.select();
        linkInput.setSelectionRange(0, 99999);
        document.execCommand('copy');
        copyBtn.textContent = 'Tersalin!';
        setTimeout(() => { copyBtn.textContent = 'Salin'; }, 2000);
      }
    });
  }
}

function openAbsensiLogModal(logs, judul, id_absensi, token) {
  if (document.querySelector('.modal-overlay')) return;

  const logRows = (logs || []).map((log, i) => {
    const ket = log.keterangan || '-';
    const logId = log.id_absensi_log || '';
    return `
      <tr data-log-id="${logId}">
        <td>${i + 1}</td>
        <td>${log.username || log.id_user || '-'}</td>
        <td><span class="absensi-log-status absensi-log-${ket}">${ket.charAt(0).toUpperCase() + ket.slice(1)}</span></td>
        <td>${log.note || '-'}</td>
        <td>${formatDateTime(log.waktu_absen)}</td>
        <td>
          <button class="absensi-log-delete" type="button"
                  data-log-delete="${logId}"
                  title="Hapus log absensi"
                  aria-label="Hapus log absensi">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M10 10v6M14 10v6" />
            </svg>
          </button>
        </td>
      </tr>`;
  }).join('') || '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--muted)">Belum ada data absensi.</td></tr>';

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card modal-card-wide" role="dialog" aria-modal="true" aria-label="Log absensi">
      <div class="modal-header">
        <h2 class="modal-title">Log Absensi</h2>
        <p class="modal-subtitle">${judul || ''}</p>
      </div>
      <div style="overflow-x:auto;padding:4px 0">
        <table class="absensi-log-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Peserta</th>
              <th>Status</th>
              <th>Catatan</th>
              <th>Waktu</th>
              <th style="width:48px">Aksi</th>
            </tr>
          </thead>
          <tbody>${logRows}</tbody>
        </table>
      </div>
      <div class="modal-actions">
        <button class="modal-btn" type="button" data-modal-cancel>Tutup</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  const onKeyDown = (e) => { if (e.key === 'Escape') closeModal(overlay, onKeyDown); };
  document.addEventListener('keydown', onKeyDown);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay, onKeyDown); });
  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => closeModal(overlay, onKeyDown));

  overlay.querySelectorAll('[data-log-delete]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const logId = btn.dataset.logDelete;
      if (!logId || !id_absensi || !token) return;

      if (!await openConfirmModal('Hapus log absensi ini?')) return;

      try {
        const response = await fetch(API_CONFIG.getDeleteAbsensiLogUrl(id_absensi, logId), {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Gagal menghapus log.');
        showToast('Log absensi berhasil dihapus.', 'success');

        const row = overlay.querySelector(`tr[data-log-id="${logId}"]`);
        if (row) row.remove();
        const remaining = overlay.querySelectorAll('tbody tr').length;
        if (remaining === 0) {
          overlay.querySelector('tbody').innerHTML =
            '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--muted)">Belum ada data absensi.</td></tr>';
        }
      } catch (err) {
        showToast(err.message || 'Gagal menghapus log.', 'error');
      }
    });
  });
}

async function initAbsensi(actualRole, token) {
  const listEl = document.getElementById('absensiList');
  const emptyEl = document.getElementById('absensiEmpty');
  const acaraSelect = document.getElementById('absensiAcaraSelect');
  const createBtn = document.getElementById('absensiCreateBtn');

  if (!listEl || !emptyEl || !acaraSelect) return;

  let acaraList = [];
  let absensiList = [];
  let selectedAcaraId = '';

  function setEmpty(message, show) {
    emptyEl.textContent = message;
    emptyEl.classList.toggle('is-visible', show);
  }

  function renderList() {
    listEl.innerHTML = '';

    if (!selectedAcaraId) {
      setEmpty('Pilih acara terlebih dahulu.', true);
      return;
    }

    if (absensiList.length === 0) {
      setEmpty('Belum ada sesi absensi untuk acara ini.', true);
      return;
    }

    setEmpty('', false);
    absensiList.forEach((absensi, i) => {
      listEl.appendChild(buildAbsensiCard(absensi, i + 1));
    });
  }

  async function loadAbsensi(acaraId) {
    try {
      setEmpty('Memuat data absensi...', true);
      const response = await fetch(API_CONFIG.getAbsensiByAcaraUrl(acaraId), {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 404) {
        absensiList = [];
      } else if (!response.ok) {
        throw new Error(data.message || 'Gagal memuat absensi.');
      } else {
        absensiList = Array.isArray(data.data) ? data.data : [];
      }
      renderList();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Gagal memuat data absensi.', 'error');
      absensiList = [];
      renderList();
    }
  }

  async function loadAcara() {
    try {
      const response = await fetch(API_CONFIG.getAcaraUrl(), {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        acaraList = Array.isArray(data.data) ? data.data : [];
      }

      acaraSelect.innerHTML = '<option value="">-- Pilih Acara --</option>';
      acaraList.forEach((a) => {
        const opt = document.createElement('option');
        opt.value = a.id_acara;
        opt.textContent = a.judul;
        acaraSelect.appendChild(opt);
      });
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat daftar acara.', 'error');
    }
  }

  acaraSelect.addEventListener('change', () => {
    selectedAcaraId = acaraSelect.value;
    if (selectedAcaraId) {
      loadAbsensi(selectedAcaraId);
    } else {
      absensiList = [];
      renderList();
    }
  });

  if (createBtn) {
    createBtn.addEventListener('click', () => {
      if (acaraList.length === 0) {
        showToast('Tidak ada acara tersedia.', 'info');
        return;
      }
      openCreateAbsensiModal(acaraList, async (payload, close) => {
        try {
          const response = await fetch(API_CONFIG.getCreateAbsensiUrl(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data.message || 'Gagal membuat absensi.');
          showToast('Absensi berhasil dibuat.', 'success');
          close();
          loadAbsensi(selectedAcaraId);
        } catch (err) {
          showToast(err.message || 'Gagal membuat absensi.', 'error');
        }
      });
    });
  }

  const absensiExportBtn = document.getElementById('absensiExportBtn');
  if (absensiExportBtn) {
    const updateAbsensiExportState = () => {
      absensiExportBtn.disabled = !selectedAcaraId;
    };
    updateAbsensiExportState();
    absensiExportBtn.addEventListener('click', (e) => {
      if (!selectedAcaraId) { showToast('Pilih acara terlebih dahulu.', 'info'); return; }
      e.stopPropagation();
      const menu = absensiExportBtn.parentElement.querySelector('.export-menu');
      if (menu) menu.classList.toggle('is-open');
    });
    absensiExportBtn.parentElement.querySelectorAll('.export-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        if (!selectedAcaraId) { showToast('Pilih acara terlebih dahulu.', 'info'); return; }
        const format = opt.dataset.format;
        const filename = format === 'pdf' ? 'absensi.pdf' : 'absensi.xlsx';
        downloadExport(API_CONFIG.getExportAbsensiUrl(selectedAcaraId, format), token, filename);
        opt.closest('.export-menu')?.classList.remove('is-open');
      });
    });
    acaraSelect.addEventListener('change', updateAbsensiExportState);
  }

  /* ── Event: aksi pada card ── */
  listEl.addEventListener('click', async (event) => {
    const btn = event.target.closest('button[data-absensi-action]');
    if (!btn) return;

    const action = btn.dataset.absensiAction;
    const id = btn.dataset.id;
    const absensi = absensiList.find((a) => String(a.id_absensi) === String(id));

    try {
      if (action === 'qr') {
        if (!absensi || absensi.status_qr === 'expired') {
          showToast('QR sudah kadaluarsa. Generate ulang.', 'info');
        }
        const response = await fetch(API_CONFIG.getGenerateQrUrl(id), {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Gagal generate QR.');
        openAbsensiQrModal(data.data || {});
        loadAbsensi(selectedAcaraId);
        return;
      }

      if (action === 'logs') {
        const response = await fetch(API_CONFIG.getAbsensiLogsUrl(id), {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok && response.status !== 404) throw new Error(data.message || 'Gagal memuat log.');
        const logs = response.status === 404 ? [] : (Array.isArray(data.data) ? data.data : []);
        openAbsensiLogModal(logs, absensi?.judul || '', id, token);
        return;
      }

      if (action === 'delete') {
        if (!await openConfirmModal(`Hapus absensi "${absensi?.judul || ''}" beserta seluruh log-nya?`)) return;
        const response = await fetch(API_CONFIG.getDeleteAbsensiUrl(id), {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'Gagal menghapus absensi.');
        showToast('Absensi berhasil dihapus.', 'success');
        loadAbsensi(selectedAcaraId);
        return;
      }
    } catch (err) {
      showToast(err.message || 'Aksi gagal.', 'error');
    }
  });

  setEmpty('Memuat daftar acara...', true);
  await loadAcara();
  renderList();
}

/* ============================================================
   ABSENSI LOGS — Full-Page Log Management
============================================================ */

const LOGS_PAGE_SIZE = 15;

const LOGS_STATUS_LABEL = {
  hadir: 'Hadir',
  sakit: 'Sakit',
  izin: 'Izin',
  'tanpa keterangan': 'Tanpa Keterangan'
};

function openEditLogModal(logData, onSubmit) {
  if (document.querySelector('.modal-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Edit log absensi">
      <div class="modal-header">
        <h2 class="modal-title">Edit Log Absensi</h2>
        <p class="modal-subtitle">${logData.username || logData.id_user || ''}</p>
      </div>
      <form class="modal-form" id="editLogForm">
        <div class="modal-field">
          <label class="modal-label" for="elStatus">Status</label>
          <select class="modal-select" id="elStatus" name="keterangan" required>
            <option value="hadir" ${logData.keterangan === 'hadir' ? 'selected' : ''}>Hadir</option>
            <option value="sakit" ${logData.keterangan === 'sakit' ? 'selected' : ''}>Sakit</option>
            <option value="izin" ${logData.keterangan === 'izin' ? 'selected' : ''}>Izin</option>
            <option value="tanpa keterangan" ${logData.keterangan === 'tanpa keterangan' ? 'selected' : ''}>Tanpa Keterangan</option>
          </select>
        </div>
        <div class="modal-field">
          <label class="modal-label" for="elNote">Catatan</label>
          <textarea class="modal-input" id="elNote" name="note" placeholder="Catatan (opsional)" style="resize:vertical;min-height:60px">${logData.note || ''}</textarea>
        </div>
        <div class="modal-actions">
          <button class="modal-btn" type="button" data-modal-cancel>Batalkan</button>
          <button class="modal-btn primary" type="submit">Simpan</button>
        </div>
      </form>
    </div>`;

  document.body.appendChild(overlay);
  const onKeyDown = (e) => { if (e.key === 'Escape') closeModal(overlay, onKeyDown); };
  document.addEventListener('keydown', onKeyDown);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay, onKeyDown); });
  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => closeModal(overlay, onKeyDown));

  overlay.querySelector('#editLogForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    onSubmit({
      keterangan: f.keterangan.value,
      note: f.note.value.trim() || null
    }, () => closeModal(overlay, onKeyDown));
  });
}

function openAddLogModal(acaraList, token, onSubmit) {
  if (document.querySelector('.modal-overlay')) return;

  const acaraOpts = acaraList.map((a) =>
    `<option value="${a.id_acara}">${a.judul}</option>`
  ).join('') || '<option value="">Tidak ada acara</option>';

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Tambah log absensi">
      <div class="modal-header">
        <h2 class="modal-title">Tambah Log Absensi</h2>
        <p class="modal-subtitle">Tambahkan kehadiran secara manual.</p>
      </div>
      <form class="modal-form" id="addLogForm">
        <div class="modal-field">
          <label class="modal-label" for="alAcara">Acara</label>
          <select class="modal-select" id="alAcara" name="id_acara" required>
            <option value="">-- Pilih Acara --</option>
            ${acaraOpts}
          </select>
        </div>
        <div class="modal-field">
          <label class="modal-label" for="alAbsensi">Absensi</label>
          <select class="modal-select" id="alAbsensi" name="id_absensi" required>
            <option value="">-- Pilih Acara Terlebih Dahulu --</option>
          </select>
        </div>
        <div class="modal-field">
          <label class="modal-label" for="alUser">ID User</label>
          <input class="modal-input" id="alUser" name="id_user_target" type="text" placeholder="Masukkan ID user" required />
        </div>
        <div class="modal-field">
          <label class="modal-label" for="alStatus">Status</label>
          <select class="modal-select" id="alStatus" name="keterangan" required>
            <option value="">-- Pilih Status --</option>
            <option value="hadir">Hadir</option>
            <option value="sakit">Sakit</option>
            <option value="izin">Izin</option>
            <option value="tanpa keterangan">Tanpa Keterangan</option>
          </select>
        </div>
        <div class="modal-field">
          <label class="modal-label" for="alNote">Catatan</label>
          <textarea class="modal-input" id="alNote" name="note" placeholder="Catatan (opsional)" style="resize:vertical;min-height:60px"></textarea>
        </div>
        <div class="modal-actions">
          <button class="modal-btn" type="button" data-modal-cancel>Batalkan</button>
          <button class="modal-btn primary" type="submit">Tambah</button>
        </div>
      </form>
    </div>`;

  document.body.appendChild(overlay);
  const onKeyDown = (e) => { if (e.key === 'Escape') closeModal(overlay, onKeyDown); };
  document.addEventListener('keydown', onKeyDown);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay, onKeyDown); });
  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => closeModal(overlay, onKeyDown));

  const acaraSelect = overlay.querySelector('#alAcara');
  const absensiSelect = overlay.querySelector('#alAbsensi');

  acaraSelect.addEventListener('change', async () => {
    const idAcara = acaraSelect.value;
    if (!idAcara) {
      absensiSelect.innerHTML = '<option value="">-- Pilih Acara Terlebih Dahulu --</option>';
      return;
    }
    absensiSelect.innerHTML = '<option value="">Memuat...</option>';
    try {
      const resp = await fetch(API_CONFIG.getAbsensiByAcaraUrl(idAcara), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json().catch(() => ({}));
      const list = resp.status === 404 ? [] : (Array.isArray(data.data) ? data.data : []);
      absensiSelect.innerHTML = '<option value="">-- Pilih Absensi --</option>' +
        list.map((a) => `<option value="${a.id_absensi}">${a.judul}</option>`).join('');
    } catch (_) {
      absensiSelect.innerHTML = '<option value="">Gagal memuat</option>';
    }
  });

  overlay.querySelector('#addLogForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    onSubmit({
      id_absensi: Number(f.id_absensi.value),
      id_user_target: f.id_user_target.value.trim(),
      keterangan: f.keterangan.value,
      note: f.note.value.trim() || null
    }, () => closeModal(overlay, onKeyDown));
  });
}

async function initAbsensiLogs(actualRole, token) {
  const tableBody = document.getElementById('logsBody');
  const emptyEl = document.getElementById('logsEmpty');
  const acaraFilter = document.getElementById('logsAcaraFilter');
  const statusFilter = document.getElementById('logsStatusFilter');
  const addBtn = document.getElementById('logsAddBtn');

  if (!tableBody) return;

  let acaraList = [];
  let selectedAcaraId = '';
  let allLogs = [];
  let statusFilterValue = '';

  function setEmpty(msg, show) {
    if (emptyEl) {
      emptyEl.textContent = msg;
      emptyEl.classList.toggle('is-visible', show);
    }
  }

  async function loadLogs() {
    if (!selectedAcaraId) {
      tableBody.innerHTML = '';
      setEmpty('Pilih acara terlebih dahulu.', true);
      return;
    }

    try {
      setEmpty('Memuat data...', true);
      const resp = await fetch(API_CONFIG.getLogsByAcaraUrl(selectedAcaraId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json().catch(() => ({}));
      const logs = resp.ok ? (Array.isArray(data.data) ? data.data : []) : [];
      allLogs = logs;
      renderLogs();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Gagal memuat log.', 'error');
    }
  }

  function renderLogs() {
    tableBody.innerHTML = '';
    const filtered = statusFilterValue
      ? allLogs.filter((l) => l.keterangan === statusFilterValue)
      : allLogs;

    if (filtered.length === 0) {
      setEmpty('Tidak ada data absensi yang sesuai.', true);
      return;
    }
    setEmpty('', false);

    filtered.forEach((log) => {
      const ket = log.keterangan || '-';
      const ketLabel = LOGS_STATUS_LABEL[ket] || ket.charAt(0).toUpperCase() + ket.slice(1);
      const tr = document.createElement('tr');
      tr.dataset.logId = log.id_absensi_log;
      tr.innerHTML = `
        <td>${log.username || log.id_user || '-'}</td>
        <td>${log.judul_absensi || '-'}</td>
        <td><span class="absensi-log-status absensi-log-${ket}">${ketLabel}</span></td>
        <td>${log.note || '-'}</td>
        <td>${formatDateTime(log.waktu_absen)}</td>
        <td>
          <div style="display:flex;gap:4px">
            <button class="absensi-log-delete" type="button" data-log-edit="${log.id_absensi_log}" title="Edit">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 20h4l10-10-4-4L4 16v4z"/><path d="M14 6l4 4"/>
              </svg>
            </button>
            <button class="absensi-log-delete" type="button" data-log-delete="${log.id_absensi_log}" title="Hapus" style="color:#999">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M10 10v6M14 10v6"/>
              </svg>
            </button>
          </div>
        </td>`;
      tableBody.appendChild(tr);
    });
  }

  async function loadAcaraFilter() {
    try {
      const resp = await fetch(API_CONFIG.getAcaraUrl(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok) acaraList = Array.isArray(data.data) ? data.data : [];

      if (acaraFilter) {
        acaraFilter.innerHTML = '<option value="">-- Pilih Acara --</option>' +
          acaraList.map((a) => `<option value="${a.id_acara}">${a.judul}</option>`).join('');
      }
    } catch (_) {}
  }

  // Acara filter event
  if (acaraFilter) {
    acaraFilter.addEventListener('change', () => {
      selectedAcaraId = acaraFilter.value;
      allLogs = [];
      statusFilterValue = '';
      if (statusFilter) statusFilter.value = '';
      loadLogs();
    });
  }

  // Status filter event
  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      statusFilterValue = statusFilter.value;
      renderLogs();
    });
  }

  // Table actions: Edit / Delete
  tableBody.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('[data-log-edit]');
    const delBtn = e.target.closest('[data-log-delete]');

    if (editBtn) {
      const logId = editBtn.dataset.logEdit;
      const tr = editBtn.closest('tr');
      const cells = tr.querySelectorAll('td');
      const logData = {
        id_absensi_log: logId,
        username: cells[0]?.textContent || '',
        keterangan: tr.querySelector('.absensi-log-status')?.className.match(/absensi-log-(\S+)/)?.[1] || '',
        note: cells[3]?.textContent || ''
      };
      if (logData.note === '-') logData.note = '';

      openEditLogModal(logData, async (payload, close) => {
        try {
          const resp = await fetch(API_CONFIG.getUpdateAbsensiLogUrl(logId), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload)
          });
          const d = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(d.message || 'Gagal mengupdate log.');
          showToast('Log berhasil diperbarui.', 'success');
          close();
          loadLogs();
        } catch (err) {
          showToast(err.message || 'Gagal mengupdate log.', 'error');
        }
      });
      return;
    }

    if (delBtn) {
      if (!await openConfirmModal('Hapus log absensi ini?')) return;
      try {
        const resp = await fetch(API_CONFIG.getDeleteGlobalLogUrl(delBtn.dataset.logDelete), {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        const d = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(d.message || 'Gagal menghapus log.');
        showToast('Log berhasil dihapus.', 'success');
        loadLogs();
      } catch (err) {
        showToast(err.message || 'Gagal menghapus log.', 'error');
      }
    }
  });

  // Add button
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (acaraList.length === 0) {
        showToast('Tidak ada acara tersedia.', 'info');
        return;
      }
      openAddLogModal(acaraList, token, async (payload, close) => {
        try {
          const resp = await fetch(API_CONFIG.getAddAbsensiLogUrl(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload)
          });
          const d = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(d.message || 'Gagal menambah log.');
          showToast('Log berhasil ditambahkan.', 'success');
          close();
          loadLogs();
        } catch (err) {
          showToast(err.message || 'Gagal menambah log.', 'error');
        }
      });
    });
  }

  const logsExportBtn = document.getElementById('logsExportBtn');
  if (logsExportBtn) {
    const updateLogsExportState = () => { logsExportBtn.disabled = !selectedAcaraId; };
    updateLogsExportState();
    logsExportBtn.addEventListener('click', (e) => {
      if (!selectedAcaraId) { showToast('Pilih acara terlebih dahulu.', 'info'); return; }
      e.stopPropagation();
      const menu = logsExportBtn.parentElement.querySelector('.export-menu');
      if (menu) menu.classList.toggle('is-open');
    });
    logsExportBtn.parentElement.querySelectorAll('.export-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        if (!selectedAcaraId) { showToast('Pilih acara terlebih dahulu.', 'info'); return; }
        const format = opt.dataset.format;
        const status = statusFilter?.value || '';
        const filename = format === 'pdf' ? 'logs_absensi.pdf' : 'logs_absensi.xlsx';
        downloadExport(API_CONFIG.getExportLogsUrl(selectedAcaraId, { status }, format), token, filename);
        opt.closest('.export-menu')?.classList.remove('is-open');
      });
    });
    if (acaraFilter) acaraFilter.addEventListener('change', updateLogsExportState);
  }

  setEmpty('Memuat data...', true);
  await loadAcaraFilter();
  await loadLogs();

}

/* ============================================================
   ORGANIZER ACARA — List Page
============================================================ */

async function initOrganizerAcara(actualRole, token) {
  const listEl = document.getElementById('orgAcaraList');
  const emptyEl = document.getElementById('orgAcaraEmpty');
  const createBtn = document.getElementById('orgAcaraCreateBtn');

  if (!listEl) return;

  function setEmpty(msg, show) {
    if (emptyEl) {
      emptyEl.textContent = msg;
      emptyEl.classList.toggle('is-visible', show);
    }
  }

  async function loadAcara() {
    try {
      setEmpty('Memuat data...', true);
      const resp = await fetch(API_CONFIG.getAcaraUrl(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json().catch(() => ({}));
      const acaras = resp.ok ? (Array.isArray(data.data) ? data.data : []) : [];

      listEl.innerHTML = '';
      if (acaras.length === 0) {
        setEmpty('Belum ada acara yang dibuat.', true);
        return;
      }
      setEmpty('', false);

      acaras.forEach((acara) => {
        const card = document.createElement('div');
        card.className = 'card org-acara-card';
        card.dataset.id = acara.id_acara;
        card.innerHTML = `
          <div class="org-acara-card-top">
            <h3 class="org-acara-judul">${acara.judul || 'Tanpa Judul'}</h3>
            <span class="status-pill status-${getAcaraStatus(acara)}">${ACARA_STATUS_LABEL[getAcaraStatus(acara)] || getAcaraStatus(acara)}</span>
          </div>
          <p class="org-acara-meta">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></svg>
            ${formatDateTime(acara.tanggal_mulai)}
          </p>
          <p class="org-acara-creator">Dibuat oleh ${acara.creator_name || acara.id_user || '-'}</p>`;
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
          window.location.href = buildPagesUrl(`dashboard/organizer/acara-detail.html?id=${acara.id_acara}`);
        });
        listEl.appendChild(card);
      });
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Gagal memuat acara.', 'error');
      setEmpty('Gagal memuat data.', true);
    }
  }

  if (createBtn) {
    createBtn.addEventListener('click', () => {
      openCreateAcaraModal(async (payload, close) => {
        try {
          const resp = await fetch(API_CONFIG.getCreateAcaraUrl(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload)
          });
          const d = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(d.message || 'Gagal membuat acara.');
          showToast('Acara berhasil dibuat.', 'success');
          close();
          loadAcara();
        } catch (err) {
          showToast(err.message || 'Gagal membuat acara.', 'error');
        }
      });
    });
  }

  await loadAcara();
}

/* ============================================================
   ACARA DETAIL — Info + Forum Diskusi
============================================================ */

async function initAcaraDetail(actualRole, token) {
  const params = new URLSearchParams(window.location.search);
  const idAcara = params.get('id');

  const titleEl = document.getElementById('acaraDetailTitle');
  const subtitleEl = document.getElementById('acaraDetailSubtitle');
  const bannerEl = document.getElementById('acaraDetailBanner');
  const backBtn = document.getElementById('acaraDetailBack');
  const joinCard = document.getElementById('acaraJoinCard');
  const joinBtn = document.getElementById('acaraJoinBtn');
  const forumSection = document.getElementById('forumSection');
  const forumPostsEl = document.getElementById('forumPosts');
  const forumEmptyEl = document.getElementById('forumEmpty');
  const forumCreateBtn = document.getElementById('forumCreateBtn');

  if (!idAcara || !bannerEl) {
    if (titleEl) titleEl.textContent = 'ID Acara tidak ditemukan.';
    return;
  }

  let acaraData = null;

  // Back button
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.history.back();
    });
  }

  function setEmpty(el, msg, show) {
    if (el) { el.textContent = msg; el.classList.toggle('is-visible', show); }
  }

  async function loadAcara() {
    try {
      const resp = await fetch(API_CONFIG.getAcaraByIdUrl(idAcara), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data.message || 'Gagal memuat acara.');
      acaraData = data.data || {};
      renderBanner();
    } catch (err) {
      console.error(err);
      if (titleEl) titleEl.textContent = 'Gagal memuat acara.';
      if (subtitleEl) subtitleEl.textContent = err.message;
    }
  }

  function renderBanner() {
    if (!acaraData) return;
    const statusText = ACARA_STATUS_LABEL[getAcaraStatus(acaraData)] || getAcaraStatus(acaraData);
    document.getElementById('detailJudul').textContent = acaraData.judul || '-';
    document.getElementById('detailStatusBadge').className = `status-pill status-${getAcaraStatus(acaraData)}`;
    document.getElementById('detailStatusBadge').textContent = statusText;
    document.getElementById('detailCreator').textContent = acaraData.creator_name || acaraData.id_user || '-';
    document.getElementById('detailLokasi').textContent = acaraData.lokasi || '-';
    document.getElementById('detailMulai').textContent = formatDateTime(acaraData.tanggal_mulai);
    document.getElementById('detailAkhir').textContent = formatDateTime(acaraData.tanggal_akhir);
    document.getElementById('detailMaks').textContent = acaraData.maks_pengunjung ?? '-';
    document.getElementById('detailPeserta').textContent = acaraData.peserta_ikut ?? '-';
    bannerEl.style.display = 'block';
    if (titleEl) titleEl.textContent = `Acara: ${acaraData.judul || ''}`;

    const isOwner = acaraData.isOwner;
    const isParticipant = acaraData.isParticipant;

    // Owner: show create post button
    if (forumCreateBtn) {
      forumCreateBtn.style.display = isOwner ? '' : 'none';
    }

    // Non-owner, non-participant: show join card
    if (joinCard) {
      joinCard.style.display = isOwner ? 'none' : (isParticipant ? 'none' : 'block');
    }

    // Show forum only for owner or participant
    if (forumSection) {
      forumSection.style.display = (isOwner || isParticipant) ? 'block' : 'none';
    }

    // Join button handler
    if (joinBtn && !isOwner && !isParticipant) {
      joinBtn.addEventListener('click', async () => {
        joinBtn.disabled = true;
        joinBtn.textContent = 'Mengikuti...';
        try {
          const now = new Date();
          const pad = (n) => String(n).padStart(2, '0');
          const fmt = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
          const resp = await fetch(API_CONFIG.getAcaraIkutiCreateUrl(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              id_acara: Number(idAcara),
              tanggal_mulai: acaraData.tanggal_mulai,
              tanggal_diikuti: fmt
            })
          });
          const d = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(d.message || 'Gagal mengikuti acara.');
          showToast('Berhasil mengikuti acara!', 'success');
          // Reload page to show forum
          setTimeout(() => window.location.reload(), 1200);
        } catch (err) {
          showToast(err.message || 'Gagal mengikuti acara.', 'error');
          joinBtn.disabled = false;
          joinBtn.textContent = 'Ikuti Acara';
        }
      });
    }
  }

  async function loadPosts() {
    try {
      const resp = await fetch(API_CONFIG.getAcaraPostListUrl(idAcara), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json().catch(() => ({}));
      const posts = resp.ok ? (Array.isArray(data.data) ? data.data : []) : [];

      forumPostsEl.innerHTML = '';
      if (posts.length === 0) {
        setEmpty(forumEmptyEl, 'Belum ada diskusi. Mulailah diskusi pertama!', true);
        return;
      }
      setEmpty(forumEmptyEl, '', false);

      for (const post of posts) {
        const postEl = document.createElement('div');
        postEl.className = 'forum-post-card';
        postEl.dataset.postId = post.id_post;
        postEl.innerHTML = `
          <div class="forum-post-header">
            <div>
              <strong class="forum-post-author">${post.username || post.id_user || '-'}</strong>
              <span class="forum-post-time">${formatDateTime(post.dibuat_pada)}</span>
            </div>
            ${acaraData?.isOwner ? `<button class="forum-post-delete" data-post-delete="${post.id_post}" title="Hapus post"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M10 10v6M14 10v6"/></svg></button>` : ''}
          </div>
          ${post.judul ? `<h4 class="forum-post-judul">${post.judul}</h4>` : ''}
          <p class="forum-post-konten">${post.konten}</p>
          <div class="forum-komentar-wrap">
            <div class="forum-komentar-list" id="komentarList-${post.id_post}"></div>
            <div class="forum-komentar-form">
              <textarea class="forum-textarea forum-komentar-input" id="komentarInput-${post.id_post}" placeholder="Tulis komentar..." rows="2"></textarea>
              <button class="modal-btn primary forum-komentar-btn" data-komentar-post="${post.id_post}" type="button">Kirim</button>
            </div>
          </div>`;
        forumPostsEl.appendChild(postEl);
        loadComments(post.id_post);
      }

      // Post delete handler (owner only)
      forumPostsEl.querySelectorAll('[data-post-delete]').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          if (!await openConfirmModal('Hapus postingan ini beserta semua komentarnya?')) return;
          try {
            const resp = await fetch(API_CONFIG.getAcaraPostDeleteUrl(btn.dataset.postDelete), {
              method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
            });
            const d = await resp.json().catch(() => ({}));
            if (!resp.ok) throw new Error(d.message || 'Gagal menghapus post.');
            showToast('Postingan dihapus.', 'success');
            loadPosts();
          } catch (err) { showToast(err.message || 'Gagal menghapus post.', 'error'); }
        });
      });

      // Comment submit handlers (all participants)
      forumPostsEl.querySelectorAll('[data-komentar-post]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const idPost = btn.dataset.komentarPost;
          const input = document.getElementById(`komentarInput-${idPost}`);
          const konten = input?.value.trim();
          if (!konten) { showToast('Tulis komentar terlebih dahulu.', 'error'); return; }
          btn.disabled = true;
          try {
            const resp = await fetch(API_CONFIG.getKomentarCreateUrl(idPost), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ konten })
            });
            const d = await resp.json().catch(() => ({}));
            if (!resp.ok) throw new Error(d.message || 'Gagal mengirim komentar.');
            input.value = '';
            showToast('Komentar terkirim.', 'success');
            loadComments(idPost);
          } catch (err) { showToast(err.message || 'Gagal mengirim komentar.', 'error'); }
          finally { btn.disabled = false; }
        });
      });
    } catch (err) {
      console.error(err);
      setEmpty(forumEmptyEl, 'Gagal memuat diskusi.', true);
    }
  }

  async function loadComments(idPost) {
    const listEl = document.getElementById(`komentarList-${idPost}`);
    if (!listEl) return;
    try {
      const resp = await fetch(API_CONFIG.getKomentarListUrl(idPost), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json().catch(() => ({}));
      const komentars = resp.ok ? (Array.isArray(data.data) ? data.data : []) : [];
      listEl.innerHTML = '';
      if (komentars.length === 0) return;
      komentars.forEach((k) => {
        const div = document.createElement('div');
        div.className = 'forum-komentar-item';
        div.innerHTML = `
          <strong>${k.username || k.id_user || '-'}</strong>
          <span class="forum-post-time">${formatDateTime(k.dibuat_pada)}</span>
          ${acaraData?.isOwner ? `<button class="forum-komentar-delete" data-komentar-delete="${k.id_komentar}" title="Hapus komentar"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M10 10v6M14 10v6"/></svg></button>` : ''}
          <p>${k.konten}</p>`;
        listEl.appendChild(div);
      });

      listEl.querySelectorAll('[data-komentar-delete]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          if (!await openConfirmModal('Hapus komentar ini?')) return;
          try {
            const resp = await fetch(API_CONFIG.getKomentarDeleteUrl(btn.dataset.komentarDelete), {
              method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
            });
            const d = await resp.json().catch(() => ({}));
            if (!resp.ok) throw new Error(d.message || 'Gagal menghapus komentar.');
            showToast('Komentar dihapus.', 'success');
            loadComments(idPost);
          } catch (err) { showToast(err.message || 'Gagal menghapus komentar.', 'error'); }
        });
      });
    } catch (_) {}
  }

  // Create post modal handler (owner)
  if (forumCreateBtn) {
    forumCreateBtn.addEventListener('click', () => {
      if (document.querySelector('.modal-overlay')) return;

      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal-card" role="dialog" aria-modal="true" aria-label="Buat diskusi">
          <div class="modal-header">
            <h2 class="modal-title">Buat Diskusi Baru</h2>
            <p class="modal-subtitle">Mulai diskusi baru untuk acara ini.</p>
          </div>
          <form class="modal-form" id="createPostForm">
            <div class="modal-field">
              <label class="modal-label" for="modalPostJudul">Judul</label>
              <input class="modal-input" id="modalPostJudul" type="text" placeholder="Judul diskusi (opsional)" />
            </div>
            <div class="modal-field">
              <label class="modal-label" for="modalPostKonten">Konten</label>
              <textarea class="modal-input" id="modalPostKonten" placeholder="Tulis sesuatu..." style="resize:vertical;min-height:100px" required></textarea>
            </div>
            <div class="modal-actions">
              <button class="modal-btn" type="button" data-modal-cancel>Batalkan</button>
              <button class="modal-btn primary" type="submit">Posting</button>
            </div>
          </form>
        </div>`;

      document.body.appendChild(overlay);
      const onKeyDown = (e) => { if (e.key === 'Escape') closeModal(overlay, onKeyDown); };
      document.addEventListener('keydown', onKeyDown);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay, onKeyDown); });
      overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', () => closeModal(overlay, onKeyDown));

      overlay.querySelector('#createPostForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const f = e.currentTarget;
        const judul = f.judul?.value?.trim() || null;
        const konten = f.konten?.value?.trim();
        if (!konten) { showToast('Konten wajib diisi.', 'error'); return; }
        try {
          const resp = await fetch(API_CONFIG.getAcaraPostCreateUrl(idAcara), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ judul, konten })
          });
          const d = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(d.message || 'Gagal membuat postingan.');
          showToast('Postingan berhasil dibuat.', 'success');
          closeModal(overlay, onKeyDown);
          loadPosts();
        } catch (err) { showToast(err.message || 'Gagal membuat postingan.', 'error'); }
      });
    });
  }

  await loadAcara();
  await loadPosts();
}

/* ============================================================
   USER ACARA — List & Saya
============================================================ */

async function initUserAcaraList(actualRole, token) {
  const listEl = document.getElementById('userAcaraList');
  const emptyEl = document.getElementById('userAcaraEmpty');
  if (!listEl) return;

  function setEmpty(msg, show) {
    if (emptyEl) { emptyEl.textContent = msg; emptyEl.classList.toggle('is-visible', show); }
  }

  try {
    setEmpty('Memuat data...', true);
    const resp = await fetch(API_CONFIG.getAcaraBrowseUrl(), {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await resp.json().catch(() => ({}));
    const acaras = resp.ok ? (Array.isArray(data.data) ? data.data : []) : [];

    listEl.innerHTML = '';
    if (acaras.length === 0) { setEmpty('Belum ada acara tersedia.', true); return; }
    setEmpty('', false);

    acaras.forEach((acara) => {
      const card = document.createElement('div');
      card.className = 'card org-acara-card';
      card.innerHTML = `
        <div class="org-acara-card-top">
          <h3 class="org-acara-judul">${acara.judul || 'Tanpa Judul'}</h3>
          <span class="status-pill status-${getAcaraStatus(acara)}">${ACARA_STATUS_LABEL[getAcaraStatus(acara)] || getAcaraStatus(acara)}</span>
        </div>
        <p class="org-acara-meta"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></svg>${formatDateTime(acara.tanggal_mulai)}</p>
        <p class="org-acara-creator">Dibuat oleh ${acara.creator_name || acara.id_user || '-'}</p>
        <button class="modal-btn primary acara-ikuti-btn" type="button" data-ikuti-id="${acara.id_acara}" data-ikuti-mulai="${acara.tanggal_mulai}">Ikuti Acara</button>`;
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        if (e.target.closest('.acara-ikuti-btn')) return;
        window.location.href = buildPagesUrl(`dashboard/organizer/acara-detail.html?id=${acara.id_acara}`);
      });
      listEl.appendChild(card);
    });

    // Ikuti Acara button handlers
    listEl.querySelectorAll('.acara-ikuti-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        btn.disabled = true;
        btn.textContent = 'Mengikuti...';
        const idAcara = btn.dataset.ikutiId;
        const tglMulai = btn.dataset.ikutiMulai;
        try {
          const now = new Date();
          const pad = (n) => String(n).padStart(2, '0');
          const fmt = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
          const resp = await fetch(API_CONFIG.getAcaraIkutiCreateUrl(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ id_acara: Number(idAcara), tanggal_mulai: tglMulai, tanggal_diikuti: fmt })
          });
          const d = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(d.message || 'Gagal mengikuti acara.');
          showToast('Berhasil mengikuti acara!', 'success');
          const card = btn.closest('.org-acara-card');
          if (card) card.remove();
          const remaining = listEl.querySelectorAll('.org-acara-card').length;
          if (remaining === 0) setEmpty('Belum ada acara tersedia.', true);
        } catch (err) {
          showToast(err.message || 'Gagal mengikuti acara.', 'error');
          btn.disabled = false;
          btn.textContent = 'Ikuti Acara';
        }
      });
    });
  } catch (err) {
    console.error(err);
    setEmpty('Gagal memuat data.', true);
    showToast(err.message || 'Gagal memuat acara.', 'error');
  }
}

async function initUserAcaraSaya(actualRole, token) {
  const listEl = document.getElementById('userAcaraSayaList');
  const emptyEl = document.getElementById('userAcaraSayaEmpty');
  if (!listEl) return;

  function setEmpty(msg, show) {
    if (emptyEl) { emptyEl.textContent = msg; emptyEl.classList.toggle('is-visible', show); }
  }

  try {
    setEmpty('Memuat data...', true);
    const user = JSON.parse(localStorage.getItem('authUser') || '{}');
    const resp = await fetch(API_CONFIG.getAcaraIkutiByUserUrl(user.id_user || ''), {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await resp.json().catch(() => ({}));
    const acaras = resp.ok ? (Array.isArray(data.data) ? data.data : []) : [];

    listEl.innerHTML = '';
    if (acaras.length === 0) { setEmpty('Belum mengikuti acara apapun.', true); return; }
    setEmpty('', false);

    acaras.forEach((acara) => {
      const card = document.createElement('div');
      card.className = 'card org-acara-card';
      card.innerHTML = `
        <div class="org-acara-card-top">
          <h3 class="org-acara-judul">${acara.judul || 'Tanpa Judul'}</h3>
          <span class="status-pill status-${getAcaraStatus(acara)}">${ACARA_STATUS_LABEL[getAcaraStatus(acara)] || getAcaraStatus(acara)}</span>
        </div>
        <p class="org-acara-meta"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></svg>${formatDateTime(acara.tanggal_mulai)}</p>
        <p class="org-acara-creator">Dibuat oleh ${acara.creator_name || acara.id_user || '-'}</p>`;
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        window.location.href = buildPagesUrl(`dashboard/organizer/acara-detail.html?id=${acara.id_acara}`);
      });
      listEl.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    setEmpty('Gagal memuat data.', true);
    showToast(err.message || 'Gagal memuat acara.', 'error');
  }
}
