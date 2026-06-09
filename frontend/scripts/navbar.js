'use strict';

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
}

/* Automatically build sidebar on load if .sidebar-host exists */
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.sidebar-host')) {
    buildSidebar();
  }
});
