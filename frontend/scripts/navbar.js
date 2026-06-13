'use strict';

/* ─── Breadcrumb Generation ─────────────────────────────────────────── */
function generateBreadcrumbs() {
  const container = document.querySelector('.breadcrumb');
  if (!container) return;

  const path = window.location.pathname.replace(/\\/g, '/');

  // Define breadcrumb mappings based on path patterns
  const breadcrumbMap = [
    // Admin pages
    { pattern: /\/pages\/dashboard\/admin\/acara\.html?$/i, items: [
      { label: 'Dashboard', href: buildPagesUrl('dashboard/admin/index.html') },
      { label: 'Admin', href: buildPagesUrl('dashboard/admin/index.html') },
      { label: 'Kelola Acara' }
    ]},
    { pattern: /\/pages\/dashboard\/admin\/user-manager\.html?$/i, items: [
      { label: 'Dashboard', href: buildPagesUrl('dashboard/admin/index.html') },
      { label: 'Admin', href: buildPagesUrl('dashboard/admin/index.html') },
      { label: 'Kelola User' }
    ]},
    // Organizer pages
    { pattern: /\/pages\/dashboard\/organizer\/acara\.html?$/i, items: [
      { label: 'Dashboard', href: buildPagesUrl('dashboard/organizer/index.html') },
      { label: 'Organizer', href: buildPagesUrl('dashboard/organizer/index.html') },
      { label: 'Acara Saya' }
    ]},
    // Absensi pages
    { pattern: /\/pages\/dashboard\/absensi\/index\.html?$/i, items: [
      { label: 'Dashboard', href: buildPagesUrl('dashboard/user/index.html') },
      { label: 'Absensi' }
    ]},
    { pattern: /\/pages\/dashboard\/absensi\/logs\.html?$/i, items: [
      { label: 'Dashboard', href: buildPagesUrl('dashboard/user/index.html') },
      { label: 'Absensi', href: buildPagesUrl('dashboard/absensi/index.html') },
      { label: 'Log Absensi' }
    ]},
    { pattern: /\/pages\/dashboard\/absensi\/isi\.html?$/i, items: [
      { label: 'Dashboard', href: buildPagesUrl('dashboard/user/index.html') },
      { label: 'Absensi', href: buildPagesUrl('dashboard/absensi/index.html') },
      { label: 'Isi Absensi' }
    ]},
    // Profile
    { pattern: /\/pages\/dashboard\/profile\/index\.html?$/i, items: [
      { label: 'Dashboard', href: buildPagesUrl('dashboard/user/index.html') },
      { label: 'Profil' }
    ]},
    // Default dashboard
    { pattern: /\/pages\/dashboard\/(admin|organizer|user)\/index\.html?$/i, items: [
      { label: 'Dashboard' }
    ]},
    // Generic dashboard fallback
    { pattern: /\/pages\/dashboard\/.*/i, items: [
      { label: 'Dashboard', href: buildPagesUrl('dashboard/user/index.html') },
      { label: getPageTitle() }
    ]}
  ];

  // Find matching breadcrumb configuration
  let breadcrumbItems = null;
  for (const entry of breadcrumbMap) {
    if (entry.pattern.test(path)) {
      breadcrumbItems = entry.items;
      break;
    }
  }

  // Default fallback
  if (!breadcrumbItems) {
    breadcrumbItems = [
      { label: 'Dashboard', href: buildPagesUrl('dashboard/user/index.html') },
      { label: getPageTitle() }
    ];
  }

  // Render breadcrumbs
  container.innerHTML = `
    <a href="${buildPagesUrl('homepage/index.html')}" class="breadcrumb-item breadcrumb-home" aria-label="Kembali ke homepage">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
      Home
    </a>
    ${breadcrumbItems.map((item, index) => {
      const isLast = index === breadcrumbItems.length - 1;
      return `
        <span class="breadcrumb-separator" aria-hidden="true">/</span>
        ${isLast
          ? `<span class="breadcrumb-item is-active" aria-current="page">${item.label}</span>`
          : `<a href="${item.href || '#'}" class="breadcrumb-item">${item.label}</a>`
        }
      `;
    }).join('')}
  `;
}

/* ─── Get page title from current path ──────────────────────────────── */
function getPageTitle() {
  const path = window.location.pathname.replace(/\\/g, '/');
  const match = path.match(/\/([^\/]+)\.html?$/i);
  if (match) {
    const pageName = match[1].replace(/[-_]/g, ' ');
    return pageName.charAt(0).toUpperCase() + pageName.slice(1);
  }
  return 'Halaman';
}

/* ─── Sidebar Build ──────────────────────────────────────────────────── */
function buildSidebar() {
  const host = document.querySelector('.sidebar-host');
  if (!host) return;

  const aside = document.createElement('aside');
  aside.className = 'sidebar';
  aside.innerHTML = `
    <div class="profile">
      <div class="avatar" id="sidebarAvatar" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.6">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c2.2-3.2 5-4.8 8-4.8s5.8 1.6 8 4.8" />
        </svg>
      </div>
      <div class="profile-text">
        <p class="profile-name" id="profileName">Hi, User</p>
        <p class="profile-role" id="profileRole">Anggota</p>
      </div>
    </div>
    <div class="divider"></div>
    <nav class="side-nav" id="sideNav" aria-label="Menu dashboard"></nav>
    <div class="divider"></div>
    <div class="side-actions">
      <button class="side-link" type="button" data-action="home">
        <span class="side-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M3 11l9-8 9 8" />
            <path d="M5 10v10h14V10" />
            <path d="M9 20v-6h6v6" />
          </svg>
        </span>
        <span>Home</span>
      </button>
      <button class="side-link" type="button" data-action="exit">
        <span class="side-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M10 6h8v12h-8" />
            <path d="M6 12h12" />
            <path d="M6 12l3-3" />
            <path d="M6 12l3 3" />
          </svg>
        </span>
        <span>Exit</span>
      </button>
      <button class="side-link side-logout" type="button" data-action="logout">
        <span class="side-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
            <path d="M13 7V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h6a2 2 0 002-2v-2" />
          </svg>
        </span>
        <span>Log Out</span>
      </button>
    </div>
  `;

  host.replaceWith(aside);

  // Generate breadcrumbs after sidebar is built
  generateBreadcrumbs();
}

/* Automatically build sidebar on load if .sidebar-host exists */
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.sidebar-host')) {
    buildSidebar();
  }
});
