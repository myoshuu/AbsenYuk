/* Dashboard init entry point */
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

  const currentPath = window.location.pathname.replace(/\\/g, '/').split('?')[0];

  sideNav.innerHTML = '';
  (NAV_ITEMS[role] || []).forEach((item) => {
    const isLink = Boolean(item.path);
    const el = document.createElement(isLink ? 'a' : 'button');
    if (!isLink) el.type = 'button';
    el.className = 'side-link';
    el.dataset.nav = item.label;
    if (isLink) {
      el.href = buildPagesUrl(item.path);
      if (currentPath.endsWith(el.getAttribute('href'))) {
        el.classList.add('is-active');
      }
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

  if (profileName) profileName.textContent = `Hi, ${displayName}`;
  if (profileRole) profileRole.textContent = ROLE_LABELS[role] || 'Anggota';
  if (welcomeTitle) welcomeTitle.textContent = `Selamat Datang, ${ROLE_TITLES[role]}!`;
  if (welcomeSubtitle) welcomeSubtitle.textContent = ROLE_SUBTITLES[role] || 'Ini adalah Dashboard anda';

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

async function fetchProfile() {
  const data = await api.get(API_CONFIG.getProfileUrl());
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

/* ─── Mobile sidebar ─────────────────────────────────── */
function initMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  const profile = sidebar.querySelector('.profile');
  if (!profile) return;

  const toggle = document.createElement('button');
  toggle.className = 'sidebar-toggle';
  toggle.setAttribute('aria-label', 'Buka menu navigasi');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<span></span><span></span><span></span>';

  profile.after(toggle);

  const wrap = document.createElement('div');
  wrap.className = 'sidebar-nav-wrap';

  const itemsToWrap = [];
  let el = toggle.nextElementSibling;
  while (el) {
    itemsToWrap.push(el);
    el = el.nextElementSibling;
  }
  itemsToWrap.forEach(function (node) { wrap.appendChild(node); });
  toggle.after(wrap);

  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);

  let isOpen = false;

  function open() {
    isOpen = true;
    sidebar.classList.add('is-open');
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    isOpen = false;
    sidebar.classList.remove('is-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', function () {
    if (isOpen) close(); else open();
  });

  overlay.addEventListener('click', close);

  wrap.addEventListener('click', function (e) {
    if (e.target.closest('.side-link, [data-action]')) {
      close();
    }
  });

  function onKeyDown(e) {
    if (e.key === 'Escape' && isOpen) close();
  }
  document.addEventListener('keydown', onKeyDown);

  function handleResize() {
    if (window.innerWidth > 980 && isOpen) {
      close();
    }
  }
  window.addEventListener('resize', handleResize);
}

/* ─── Main dashboard entry ──────────────────────────── */
async function initDashboard() {
  const requiredRole = getRequiredRole();
  const token = localStorage.getItem('authToken');
  if (!token) {
    redirectToLogin();
    return;
  }

  setLoading(true);

  try {
    const profile = await fetchProfile();
    const actualRole = getRoleFromProfile(profile);
    const previewRole = getPreviewRole();

    initMobileSidebar();

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
        await initUserAcaraSaya(actualRole, token, profile.id_user);
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
      if (document.getElementById('userEventGrid')) {
        await initUserHomepageEvents(actualRole, token, profile.id_user);
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
