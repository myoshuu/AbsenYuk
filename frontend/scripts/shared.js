'use strict';

/* ─── Toast notification ──────────────────────────────────────────────── */
function showToast(msg, type = 'success', duration = 3200) {
  document.querySelectorAll('.toast').forEach((t) => t.remove());

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 420);
  }, duration);
}

/* ─── Email validation ────────────────────────────────────────────────── */
function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

/* ─── Field error display ─────────────────────────────────────────────── */
function showError(input, errorEl, msg) {
  input.classList.add('is-error');
  input.classList.remove('is-success');
  errorEl.textContent = msg;
  errorEl.classList.add('visible');
}

function clearError(input, errorEl) {
  input.classList.remove('is-error');
  errorEl.textContent = '';
  errorEl.classList.remove('visible');
}

function markSuccess(input) {
  input.classList.add('is-success');
  input.classList.remove('is-error');
}

/* ─── Button loading state ────────────────────────────────────────────── */
function setLoading(btn, loader, isLoading) {
  btn.disabled = isLoading;
  loader.classList.toggle('loading', isLoading);
}

/* ─── Path resolution for multi-level pages ───────────────────────────── */
function buildPagesUrl(relativePath) {
  const path = window.location.pathname.replace(/\\/g, '/');
  const marker = '/pages/';
  const idx = path.indexOf(marker);
  if (idx === -1) {
    return '/pages/' + relativePath;
  }
  return path.slice(0, idx + marker.length) + relativePath;
}

/* ─── Date formatting ─────────────────────────────────────────────────── */
function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  const tgl = d.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
  const jam = d.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit'
  });
  return `${tgl} ${jam}`;
}

function formatTanggalLengkap(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch (_) {
    return '-';
  }
}
