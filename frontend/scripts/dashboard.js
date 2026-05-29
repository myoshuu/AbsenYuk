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
    { label: 'User Manajer', icon: 'users', path: 'dashboard/admin/user-manager/index.html' },
    { label: 'Acara', icon: 'calendar' },
    { label: 'Absensi', icon: 'check' }
  ],
  organizer: [
    { label: 'User Manajer', icon: 'users' },
    { label: 'Acara', icon: 'calendar' },
    { label: 'Absensi', icon: 'check' }
  ],
  user: [
    { label: 'Profile', icon: 'profile' },
    { label: 'Acara Saya', icon: 'star' },
    { label: 'Setting', icon: 'settings' }
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
    onConfirm(() => closeModal(overlay, onKeyDown));
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
        Authorization: `Bearer ${token}`
      }
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
        openDeleteModal(email, async (close) => {
          try {
            await handleDelete(email);
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
      if (action === 'switch') {
        openSwitchModal(actualRole);
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
      return;
    }

    if (requiredRole === 'admin') {
      clearPreviewRole();
      applyProfile(profile, 'admin', actualRole);
      initActions(actualRole);
      await initUserManager(actualRole, token);
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
