/**
 * script.js — Shared logic for Login & Register pages
 *
 * Auto-detects which page is active by reading the page title,
 * then initialises the correct form handler.
 */

'use strict';

// ─── Utility: DOM shortcut ────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

// ─── Utility: Validate email format ──────────────────────────────────────────
function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

// ─── Utility: Show field error ────────────────────────────────────────────────
function showError(input, errorEl, msg) {
  input.classList.add('is-error');
  input.classList.remove('is-success');
  errorEl.textContent = msg;
  errorEl.classList.add('visible');
}

// ─── Utility: Clear field error ───────────────────────────────────────────────
function clearError(input, errorEl) {
  input.classList.remove('is-error');
  errorEl.textContent = '';
  errorEl.classList.remove('visible');
}

// ─── Utility: Mark field as valid ─────────────────────────────────────────────
function markSuccess(input) {
  input.classList.add('is-success');
  input.classList.remove('is-error');
}

// ─── Utility: Toast notification ─────────────────────────────────────────────
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

// ─── Utility: Set button loading state ───────────────────────────────────────
function setLoading(btn, loader, isLoading) {
  btn.disabled = isLoading;
  loader.classList.toggle('loading', isLoading);
}

// ─── Shared: Toggle password visibility ──────────────────────────────────────
function initPasswordToggle() {
  const toggleBtn = $('togglePassword');
  const pwInput   = $('password');
  const icon      = $('eyeIcon');
  if (!toggleBtn || !pwInput || !icon) return;

  const EYE_OPEN = `
    <path stroke-linecap="round" stroke-linejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    <path stroke-linecap="round" stroke-linejoin="round"
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943
         9.542 7-1.274 4.057-5.064 7-9.542 7-4.477
         0-8.268-2.943-9.542-7z"/>`;

  const EYE_CLOSED = `
    <path stroke-linecap="round" stroke-linejoin="round"
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7
         a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878
         9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3
         3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543
         7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>`;

  toggleBtn.addEventListener('click', () => {
    const isHidden = pwInput.type === 'password';
    pwInput.type   = isHidden ? 'text' : 'password';
    icon.innerHTML = isHidden ? EYE_CLOSED : EYE_OPEN;
    toggleBtn.setAttribute('aria-label', isHidden ? 'Sembunyikan password' : 'Tampilkan password');
  });
}

// ─── Shared: Attach real-time blur validation for email ───────────────────────
function initEmailField(cb) {
  const input = $('email');
  const error = $('emailError');
  if (!input || !error) return;

  input.addEventListener('blur', () => cb(input, error));
  input.addEventListener('input', () => {
    if (input.classList.contains('is-error')) clearError(input, error);
  });
}

// ─── Shared: Attach real-time blur validation for password ────────────────────
function initPasswordField(cb) {
  const input = $('password');
  const error = $('passwordError');
  if (!input || !error) return;

  input.addEventListener('blur', () => cb(input, error));
  input.addEventListener('input', () => {
    if (input.classList.contains('is-error')) clearError(input, error);
  });
}

// ─── Shared: Enter key submits ────────────────────────────────────────────────
function initEnterKey(fields, btn) {
  fields.forEach((id) => {
    const el = $(id);
    if (el) el.addEventListener('keydown', (e) => { if (e.key === 'Enter') btn.click(); });
  });
}

// =============================================================================
// LOGIN PAGE
// =============================================================================
function initLogin() {
  const submitBtn = $('submitBtn');
  const btnLoader = $('btnLoader');
  if (!submitBtn) return;

  // ── Validators ──────────────────────────────────────────────────────────────
  function validateEmail(input, error) {
    const val = input.value.trim();
    if (!val)               { showError(input, error, 'Email tidak boleh kosong.'); return false; }
    if (!isValidEmail(val)) { showError(input, error, 'Format email tidak valid.'); return false; }
    clearError(input, error); markSuccess(input); return true;
  }

  function validatePassword(input, error) {
    const val = input.value;
    if (!val)        { showError(input, error, 'Password tidak boleh kosong.'); return false; }
    if (val.length < 6) { showError(input, error, 'Password minimal 6 karakter.'); return false; }
    clearError(input, error); markSuccess(input); return true;
  }

  // ── Init fields ─────────────────────────────────────────────────────────────
  initEmailField(validateEmail);
  initPasswordField(validatePassword);
  initPasswordToggle();
  initEnterKey(['email', 'password'], submitBtn);

  // ── Submit ──────────────────────────────────────────────────────────────────
  submitBtn.addEventListener('click', () => {
    const emailInput    = $('email');
    const passwordInput = $('password');
    const emailError    = $('emailError');
    const passwordError = $('passwordError');

    const ok1 = validateEmail(emailInput, emailError);
    const ok2 = validatePassword(passwordInput, passwordError);

    if (!ok1 || !ok2) return;

    setLoading(submitBtn, btnLoader, true);

    // Simulate async login — replace with real API call
    setTimeout(() => {
      setLoading(submitBtn, btnLoader, false);
      showToast('✓  Login berhasil! Selamat datang kembali.', 'success');
    }, 1800);
  });
}

// =============================================================================
// REGISTER PAGE
// =============================================================================
function initRegister() {
  const submitBtn = $('submitBtn');
  const btnLoader = $('btnLoader');
  if (!submitBtn) return;

  // ── Password strength meter ─────────────────────────────────────────────────
  const strengthWrap  = $('strengthWrap');
  const strengthBar   = $('strengthBar');
  const strengthLabel = $('strengthLabel');

  const STRENGTH_CONFIG = [
    { max: 0,  label: '',          color: 'transparent', width: '0%'   },
    { max: 2,  label: 'Lemah',     color: '#d04f4f',     width: '25%'  },
    { max: 4,  label: 'Cukup',     color: '#e89b3a',     width: '55%'  },
    { max: 6,  label: 'Kuat',      color: '#3a9e6e',     width: '80%'  },
    { max: Infinity, label: 'Sangat Kuat', color: '#2a7a55', width: '100%' },
  ];

  function scorePassword(val) {
    let score = 0;
    if (val.length >= 6)  score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  }

  function updateStrength(val) {
    if (!strengthWrap) return;
    if (!val) {
      strengthWrap.classList.remove('show');
      strengthLabel.classList.remove('show');
      return;
    }
    const score = scorePassword(val);
    const cfg   = STRENGTH_CONFIG.find((c) => score <= c.max) || STRENGTH_CONFIG[STRENGTH_CONFIG.length - 1];

    strengthWrap.classList.add('show');
    strengthBar.style.width           = cfg.width;
    strengthBar.style.backgroundColor = cfg.color;
    strengthLabel.textContent         = cfg.label;
    strengthLabel.style.color         = cfg.color;
    strengthLabel.classList.toggle('show', !!cfg.label);
  }

  const pwInput = $('password');
  if (pwInput) pwInput.addEventListener('input', () => updateStrength(pwInput.value));

  // ── Validators ──────────────────────────────────────────────────────────────
  function validateEmail(input, error) {
    const val = input.value.trim();
    if (!val)               { showError(input, error, 'Email tidak boleh kosong.'); return false; }
    if (!isValidEmail(val)) { showError(input, error, 'Format email tidak valid.'); return false; }
    clearError(input, error); markSuccess(input); return true;
  }

  function validateUsername(input, error) {
    const val = input.value.trim();
    if (!val)          { showError(input, error, 'Username tidak boleh kosong.'); return false; }
    if (val.length < 3){ showError(input, error, 'Username minimal 3 karakter.'); return false; }
    if (/\s/.test(val)){ showError(input, error, 'Username tidak boleh mengandung spasi.'); return false; }
    clearError(input, error); markSuccess(input); return true;
  }

  function validatePassword(input, error) {
    const val = input.value;
    if (!val)           { showError(input, error, 'Password tidak boleh kosong.'); return false; }
    if (val.length < 6) { showError(input, error, 'Password minimal 6 karakter.'); return false; }
    clearError(input, error); markSuccess(input); return true;
  }

  // ── Init fields ─────────────────────────────────────────────────────────────
  initEmailField(validateEmail);

  const usernameInput = $('username');
  const usernameError = $('usernameError');
  if (usernameInput && usernameError) {
    usernameInput.addEventListener('blur',  () => validateUsername(usernameInput, usernameError));
    usernameInput.addEventListener('input', () => {
      if (usernameInput.classList.contains('is-error')) clearError(usernameInput, usernameError);
    });
  }

  initPasswordField(validatePassword);
  initPasswordToggle();
  initEnterKey(['email', 'username', 'password'], submitBtn);

  // ── Submit ──────────────────────────────────────────────────────────────────
  submitBtn.addEventListener('click', () => {
    const emailInput    = $('email');
    const usernameInput = $('username');
    const passwordInput = $('password');
    const emailError    = $('emailError');
    const usernameError = $('usernameError');
    const passwordError = $('passwordError');

    const ok1 = validateEmail(emailInput, emailError);
    const ok2 = validateUsername(usernameInput, usernameError);
    const ok3 = validatePassword(passwordInput, passwordError);

    if (!ok1 || !ok2 || !ok3) return;

    setLoading(submitBtn, btnLoader, true);

    // Simulate async register — replace with real API call
    setTimeout(() => {
      setLoading(submitBtn, btnLoader, false);
      showToast('✓  Registrasi berhasil! Silakan login.', 'success');

      // Redirect to login after toast
      setTimeout(() => { window.location.href = 'login.html'; }, 2800);
    }, 1800);
  });
}

// =============================================================================
// Bootstrap: detect page and initialise
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  const page = document.title.trim().toLowerCase();

  if (page === 'login')    initLogin();
  if (page === 'register') initRegister();
});