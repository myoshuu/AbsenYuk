/**
 * delete-account.js
 * Handles: email validation, confirm modal, loading state, toast, cancel
 */

'use strict';

/* ─── Element References ─────────────────────────────── */
const emailInput   = document.getElementById('confirmEmail');
const emailError   = document.getElementById('emailError');
const btnCancel    = document.getElementById('btnCancel');
const btnDelete    = document.getElementById('btnDelete');
const btnLoader    = document.getElementById('btnLoader');
const btnText      = btnDelete.querySelector('.btn-text');
const modalOverlay = document.getElementById('modalOverlay');
const modalCancel  = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');

/* ─── Utilities ─────────────────────────────────────── */
function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

function showError(msg) {
  emailInput.classList.add('is-error');
  emailError.textContent = msg;
  emailError.classList.add('visible');
}

function clearError() {
  emailInput.classList.remove('is-error');
  emailError.textContent = '';
  emailError.classList.remove('visible');
}

function showToast(msg, type = 'success', duration = 3200) {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

function setLoading(isLoading) {
  btnDelete.disabled = isLoading;
  btnLoader.classList.toggle('loading', isLoading);
  btnText.style.opacity = isLoading ? '0.6' : '1';
}

/* ─── Validate ──────────────────────────────────────── */
function validate() {
  const val = emailInput.value.trim();
  if (!val) {
    showError('Email tidak boleh kosong.');
    return false;
  }
  if (!isValidEmail(val)) {
    showError('Format email tidak valid.');
    return false;
  }
  clearError();
  return true;
}

/* ─── Real-time clear on input ──────────────────────── */
emailInput.addEventListener('input', () => {
  if (emailInput.classList.contains('is-error')) clearError();
});

emailInput.addEventListener('blur', () => {
  const val = emailInput.value.trim();
  if (!val) return; // don't show error on empty blur
  if (!isValidEmail(val)) showError('Format email tidak valid.');
  else clearError();
});

/* ─── Tombol Batal ──────────────────────────────────── */
btnCancel.addEventListener('click', () => {
  // Kembali ke halaman sebelumnya; fallback ke index
  if (document.referrer) {
    history.back();
  } else {
    window.location.href = '../homepage/index.html';
  }
});

/* ─── Tombol Hapus Akun → buka modal konfirmasi ─────── */
btnDelete.addEventListener('click', () => {
  if (!validate()) return;
  openModal();
});

/* ─── Enter key support ─────────────────────────────── */
emailInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') btnDelete.click();
});

/* ─── Modal: open / close ───────────────────────────── */
function openModal() {
  modalOverlay.classList.add('show');
  modalOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  // Focus trap: focus first button in modal
  setTimeout(() => modalCancel.focus(), 60);
}

function closeModal() {
  modalOverlay.classList.remove('show');
  modalOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  btnDelete.focus();
}

modalCancel.addEventListener('click', closeModal);

// Close on backdrop click
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('show')) closeModal();
});

/* ─── Modal: Konfirmasi hapus ───────────────────────── */
modalConfirm.addEventListener('click', () => {
  closeModal();
  setLoading(true);

  // Simulate delete API call — replace with real backend call
  setTimeout(() => {
    setLoading(false);
    showToast('✓ Akun berhasil dihapus.', 'success', 3000);

    // Redirect ke halaman utama setelah akun dihapus
    setTimeout(() => {
      window.location.href = '../homepage/index.html';
    }, 2800);
  }, 2000);
});